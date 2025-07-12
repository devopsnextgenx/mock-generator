import { faker } from '@faker-js/faker';
import { JSONSchema, MockGeneratorOptions, SchemaProperty } from './types';

export class MockDataGenerator {
  private readonly options: MockGeneratorOptions;
  private readonly sequentialCounters: Record<string, number> = {};
  private readonly generatedData: Record<string, any[]> = {};
  private readonly uniqueConstraintTrackers: Record<string, Set<string>> = {};

  constructor(options: MockGeneratorOptions = {}) {
    this.options = {
      count: 10,
      locale: 'en',
      seed: undefined,
      customProviders: {},
      sequentialCounters: {},
      generatedData: {},
      ...options,
    };

    // Initialize sequential counters
    this.sequentialCounters = { ...this.options.sequentialCounters };
    
    // Initialize generated data storage
    Object.assign(this.generatedData, this.options.generatedData);

    if (this.options.seed) {
      faker.seed(this.options.seed);
    }

    // Note: Locale setting in Faker v8+ is handled differently
    // The locale is set per method call or can be configured globally
  }

  /**
   * Generate mock data based on JSON Schema
   */
  generateFromSchema(schema: JSONSchema, count?: number): any[] {
    const recordCount = count || this.options.count || 10;
    const results: any[] = [];

    // Store schema name if provided
    const schemaName = schema.schemaName;

    // Check if this is a dependent schema
    if (schema.dependentRecords?.parentSchema || schema.dependentRecords?.parentSchemas) {
      return this.generateDependentRecords(schema, recordCount);
    }

    for (let i = 0; i < recordCount; i++) {
      results.push(this.generateSingleRecord(schema));
    }

    // Store generated data for foreign key references
    if (schemaName) {
      this.generatedData[schemaName] = results;
    }

    return results;
  }

  /**
   * Generate dependent records based on parent records
   */
  private generateDependentRecords(schema: JSONSchema, totalCount: number): any[] {
    const schemaName = schema.schemaName || 'unknown';

    // Initialize unique constraint tracker for this schema
    this.initializeUniqueConstraintTrackers(schema, schemaName);

    // Handle legacy single parent schema format
    if (schema.dependentRecords?.parentSchema && !schema.dependentRecords?.parentSchemas) {
      return this.generateLegacyDependentRecords(schema);
    }
    
    // Handle multiple parent schemas
    if (schema.dependentRecords?.parentSchemas) {
      return this.generateMultiParentDependentRecords(schema);
    }

    return [];
  }

  /**
   * Initialize unique constraint trackers for a schema
   */
  private initializeUniqueConstraintTrackers(schema: JSONSchema, schemaName: string): void {
    if (schema.uniqueConstraints) {
      for (const constraint of schema.uniqueConstraints) {
        const constraintKey = `${schemaName}_${constraint.columns.join('_')}`;
        this.uniqueConstraintTrackers[constraintKey] = new Set<string>();
      }
    }
  }

  /**
   * Generate dependent records using legacy single parent format
   */
  private generateLegacyDependentRecords(schema: JSONSchema): any[] {
    const results: any[] = [];
    const parentSchemaName = schema.dependentRecords!.parentSchema!;
    const parentRecords = this.generatedData[parentSchemaName];

    if (!parentRecords || parentRecords.length === 0) {
      throw new Error(`Parent schema '${parentSchemaName}' data not found. Generate parent records first.`);
    }

    const minPerParent = schema.dependentRecords!.minPerParent || 0;
    const maxPerParent = schema.dependentRecords!.maxPerParent || 3;

    for (const parentRecord of parentRecords) {
      const dependentCount = faker.number.int({ min: minPerParent, max: maxPerParent });
      
      for (let i = 0; i < dependentCount; i++) {
        const dependentRecord = this.generateSingleRecord(schema);
        this.setForeignKeyReferences(dependentRecord, schema, parentRecord, parentSchemaName);
        
        if (this.isUniqueConstraintValid(dependentRecord, schema)) {
          this.addToUniqueConstraintTracker(dependentRecord, schema);
          results.push(dependentRecord);
        }
      }
    }

    // Store generated data
    if (schema.schemaName) {
      this.generatedData[schema.schemaName] = results;
    }

    return results;
  }

  /**
   * Generate dependent records for multiple parent schemas
   */
  private generateMultiParentDependentRecords(schema: JSONSchema): any[] {
    const results: any[] = [];
    const parentSchemas = schema.dependentRecords!.parentSchemas!;

    // Get all parent records for each parent schema
    const allParentRecords: { [schemaName: string]: any[] } = {};
    for (const parentConfig of parentSchemas) {
      const parentRecords = this.generatedData[parentConfig.schema];
      if (!parentRecords || parentRecords.length === 0) {
        throw new Error(`Parent schema '${parentConfig.schema}' data not found. Generate parent records first.`);
      }
      allParentRecords[parentConfig.schema] = parentRecords;
    }

    // Find the one-to-one schema (this will drive the generation)
    const oneToOneSchema = parentSchemas.find(config => config.oneToOne);
    
    if (oneToOneSchema) {
      // For one-to-one relationships, each record in the one-to-one parent gets exactly one child record
      const oneToOneRecords = allParentRecords[oneToOneSchema.schema];
      
      for (const parentRecord of oneToOneRecords) {
        const dependentRecord = this.generateUniqueRecord(schema, parentRecord, oneToOneSchema.schema, allParentRecords, parentSchemas);
        if (dependentRecord) {
          results.push(dependentRecord);
        }
      }
    } else {
      // If no one-to-one relationship, process each parent schema configuration
      for (const parentConfig of parentSchemas) {
        const configResults = this.generateForSingleParent(schema, parentConfig, allParentRecords, parentSchemas);
        results.push(...configResults);
      }
    }

    return results;
  }

  /**
   * Check if a record satisfies unique constraints
   */
  private isUniqueConstraintValid(record: any, schema: JSONSchema): boolean {
    if (!schema.uniqueConstraints) {
      return true;
    }

    const schemaName = schema.schemaName || 'unknown';

    for (const constraint of schema.uniqueConstraints) {
      const constraintKey = `${schemaName}_${constraint.columns.join('_')}`;
      const values = constraint.columns.map(col => record[col]).join('|');
      
      if (this.uniqueConstraintTrackers[constraintKey]?.has(values)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Add a record to the unique constraint tracker
   */
  private addToUniqueConstraintTracker(record: any, schema: JSONSchema): void {
    if (!schema.uniqueConstraints) {
      return;
    }

    const schemaName = schema.schemaName || 'unknown';

    for (const constraint of schema.uniqueConstraints) {
      const constraintKey = `${schemaName}_${constraint.columns.join('_')}`;
      const values = constraint.columns.map(col => record[col]).join('|');
      
      if (!this.uniqueConstraintTrackers[constraintKey]) {
        this.uniqueConstraintTrackers[constraintKey] = new Set<string>();
      }
      
      this.uniqueConstraintTrackers[constraintKey].add(values);
    }
  }

  /**
   * Generate dependent records for a single parent configuration
   */
  private generateForSingleParent(
    schema: JSONSchema,
    parentConfig: { schema: string; minPerParent?: number; maxPerParent?: number; oneToOne?: boolean },
    allParentRecords: { [schemaName: string]: any[] },
    parentSchemas: Array<{ schema: string; minPerParent?: number; maxPerParent?: number; oneToOne?: boolean }>
  ): any[] {
    const results: any[] = [];
    const parentRecords = allParentRecords[parentConfig.schema];
    
    for (const parentRecord of parentRecords) {
      const recordsToGenerate = this.calculateRecordsToGenerate(parentConfig);
      
      for (let i = 0; i < recordsToGenerate; i++) {
        const dependentRecord = this.generateUniqueRecord(schema, parentRecord, parentConfig.schema, allParentRecords, parentSchemas);
        if (dependentRecord) {
          results.push(dependentRecord);
        }
      }
    }

    return results;
  }

  /**
   * Calculate how many records to generate for a parent
   */
  private calculateRecordsToGenerate(parentConfig: { oneToOne?: boolean; minPerParent?: number; maxPerParent?: number }): number {
    if (parentConfig.oneToOne) {
      return 1;
    }
    
    const minPerParent = parentConfig.minPerParent || 0;
    const maxPerParent = parentConfig.maxPerParent || 3;
    return faker.number.int({ min: minPerParent, max: maxPerParent });
  }

  /**
   * Generate a unique record with retry logic
   */
  private generateUniqueRecord(
    schema: JSONSchema,
    primaryParentRecord: any,
    primaryParentSchema: string,
    allParentRecords: { [schemaName: string]: any[] },
    parentSchemas: Array<{ schema: string; minPerParent?: number; maxPerParent?: number; oneToOne?: boolean }>
  ): Record<string, any> | undefined {
    let attempts = 0;
    const maxAttempts = 100;
    
    while (attempts < maxAttempts) {
      const dependentRecord = this.generateSingleRecord(schema);
      
      // Set foreign key for primary parent
      this.setForeignKeyReferences(dependentRecord, schema, primaryParentRecord, primaryParentSchema);
      
      // Set foreign keys for other parent schemas
      this.setOtherParentReferences(dependentRecord, schema, primaryParentSchema, allParentRecords, parentSchemas);
      
      if (this.isUniqueConstraintValid(dependentRecord, schema)) {
        this.addToUniqueConstraintTracker(dependentRecord, schema);
        return dependentRecord;
      }
      
      attempts++;
    }
    
    console.warn(`Failed to generate unique record after ${maxAttempts} attempts`);
    return undefined;
  }

  /**
   * Set foreign key references for other parent schemas
   */
  private setOtherParentReferences(
    dependentRecord: any,
    schema: JSONSchema,
    primaryParentSchema: string,
    allParentRecords: { [schemaName: string]: any[] },
    parentSchemas: Array<{ schema: string; minPerParent?: number; maxPerParent?: number; oneToOne?: boolean }>
  ): void {
    for (const otherConfig of parentSchemas) {
      if (otherConfig.schema !== primaryParentSchema) {
        const otherParentRecords = allParentRecords[otherConfig.schema];
        const randomParent = faker.helpers.arrayElement(otherParentRecords);
        this.setForeignKeyReferences(dependentRecord, schema, randomParent, otherConfig.schema);
      }
    }
  }

  /**
   * Set foreign key references in the dependent record
   */
  private setForeignKeyReferences(
    dependentRecord: any, 
    schema: JSONSchema, 
    parentRecord: any, 
    parentSchemaName: string
  ): void {
    for (const [propertyName, propertySchema] of Object.entries(schema.properties)) {
      if (propertySchema.foreignKey && propertySchema.foreignKey.schema === parentSchemaName) {
        const referencedField = propertySchema.foreignKey.field;
        if (parentRecord[referencedField] !== undefined) {
          dependentRecord[propertyName] = parentRecord[referencedField];
        }
      }
    }
  }

  /**
   * Generate a single record from schema
   */
  private generateSingleRecord(schema: JSONSchema): any {
    const record: any = {};

    // First pass: Generate all values except templates
    for (const [propertyName, propertySchema] of Object.entries(schema.properties)) {
      if (!propertySchema.template) {
        record[propertyName] = this.generateValueFromProperty(propertySchema);
      }
    }

    // Second pass: Process templates (which may reference other properties)
    for (const [propertyName, propertySchema] of Object.entries(schema.properties)) {
      if (propertySchema.template) {
        record[propertyName] = this.processTemplate(propertySchema.template, record, propertySchema);
      }
    }

    return record;
  }

  /**
   * Generate value based on property schema
   */
  private generateValueFromProperty(property: SchemaProperty): any {
    // Handle foreign key references
    if (property.foreignKey) {
      return this.generateForeignKeyValue(property);
    }

    // Handle sequential numbers
    if (property.sequential) {
      return this.generateSequentialNumber(property);
    }

    // Handle custom faker methods
    if (property.faker) {
      return this.generateFromFaker(property.faker);
    }

    // Handle const values
    if (property.const !== undefined) {
      return property.const;
    }

    // Handle default values (but not if we have percentage-based enum selection)
    if (property.default !== undefined && !property.percentage) {
      return property.default;
    }

    // Handle enum values
    if (property.enum) {
      // Check if percentage-based selection is specified
      if (property.percentage) {
        return this.generateByPercentage(property.enum, property.percentage, property.default);
      }
      return faker.helpers.arrayElement(property.enum);
    }

    // Generate based on type
    switch (property.type) {
      case 'string':
        return this.generateString(property);
      case 'number':
      case 'integer':
        return this.generateNumber(property);
      case 'boolean':
        return faker.datatype.boolean();
      case 'array':
        return this.generateArray(property);
      case 'object':
        return this.generateObject(property);
      case 'null':
        return null;
      default:
        return null;
    }
  }

  /**
   * Generate string value
   */
  private generateString(property: SchemaProperty): string {
    const format = property.format;
    const minLength = property.minLength || 1;
    const maxLength = property.maxLength || 50;

    switch (format) {
      case 'email':
        return faker.internet.email();
      case 'uri':
      case 'url':
        return faker.internet.url();
      case 'uuid':
        return faker.string.uuid();
      case 'date':
        return faker.date.past().toISOString().split('T')[0];
      case 'date-time':
        return faker.date.past().toISOString();
      case 'time':
        return faker.date.recent().toTimeString().split(' ')[0];
      case 'hostname':
        return faker.internet.domainName();
      case 'ipv4':
        return faker.internet.ip();
      case 'ipv6':
        return faker.internet.ipv6();
      default:
        if (property.pattern) {
          // For pattern, we'll generate a random string that might match
          return faker.lorem.words(faker.number.int({ min: 1, max: 3 }));
        }
        return faker.lorem.words(faker.number.int({ min: minLength, max: maxLength }));
    }
  }

  /**
   * Generate number value
   */
  private generateNumber(property: SchemaProperty): number {
    const min = property.minimum || 0;
    const max = property.maximum || 1000;

    if (property.type === 'integer') {
      return faker.number.int({ min, max });
    }

    return faker.number.float({ min, max, fractionDigits: 2 });
  }

  /**
   * Generate array value
   */
  private generateArray(property: SchemaProperty): any[] {
    if (!property.items) {
      return [];
    }

    const length = faker.number.int({ min: 1, max: 5 });
    const array: any[] = [];

    for (let i = 0; i < length; i++) {
      array.push(this.generateValueFromProperty(property.items));
    }

    return array;
  }

  /**
   * Generate object value
   */
  private generateObject(property: SchemaProperty): any {
    if (!property.properties) {
      return {};
    }

    const obj: any = {};

    for (const [propName, propSchema] of Object.entries(property.properties)) {
      obj[propName] = this.generateValueFromProperty(propSchema);
    }

    return obj;
  }

  /**
   * Generate value using faker method path
   */
  private generateFromFaker(fakerPath: string): any {
    try {
      const parts = fakerPath.split('.');
      let fakerMethod: any = faker;

      for (const part of parts) {
        fakerMethod = fakerMethod[part];
      }

      if (typeof fakerMethod === 'function') {
        return fakerMethod();
      }

      return fakerMethod;
    } catch (error: unknown) {
      // eslint-disable-next-line no-console
      console.warn(`Invalid faker path: ${fakerPath}`, error);
      return faker.lorem.word();
    }
  }

  /**
   * Generate mock data from a simple configuration object
   */
  generateFromConfig(config: Record<string, string>, count?: number): any[] {
    const recordCount = count || this.options.count || 10;
    const results: any[] = [];

    for (let i = 0; i < recordCount; i++) {
      const record: any = {};

      for (const [field, fakerMethod] of Object.entries(config)) {
        record[field] = this.generateFromFaker(fakerMethod);
      }

      results.push(record);
    }

    return results;
  }

  /**
   * Export generated data to different formats
   */
  exportToFormat(data: any[], format: 'json' | 'csv' | 'tsv' | 'sql' = 'json', tableName: string = 'generated_data', batchSize: number = 1000, schema?: JSONSchema): string {
    switch (format) {
      case 'csv':
        return this.toCsv(data);
      case 'tsv':
        return this.toTsv(data);
      case 'sql':
        return this.toSql(data, tableName, batchSize, schema);
      case 'json':
      default:
        return JSON.stringify(data, null, 2);
    }
  }

  /**
   * Convert data to CSV format
   */
  private toCsv(data: any[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }

  /**
   * Convert data to TSV format
   */
  private toTsv(data: any[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const tsvRows = [headers.join('\t')];

    for (const row of data) {
      const values = headers.map(header => row[header]);
      tsvRows.push(values.join('\t'));
    }

    return tsvRows.join('\n');
  }

  /**
   * Convert data to SQL INSERT statements for MySQL with batch support
   */
  private toSql(data: any[], tableName: string, batchSize: number = 1000, schema?: JSONSchema): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const sqlStatements: string[] = [];

    // Add table creation comment
    sqlStatements.push(`-- MySQL bulk insert statements for table: ${tableName}`);
    sqlStatements.push(`-- Generated on: ${new Date().toISOString()}`);
    sqlStatements.push(`-- Total records: ${data.length}`);
    sqlStatements.push('');

    // Generate CREATE TABLE statement based on data types
    const createTableStatement = this.generateCreateTableStatement(tableName, data[0], schema);
    sqlStatements.push(createTableStatement);
    sqlStatements.push('');

    // Split data into batches
    const batches = this.chunkArray(data, batchSize);
    const columnList = headers.map(h => `\`${h}\``).join(', ');

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      
      if (batches.length > 1) {
        sqlStatements.push(`-- Batch ${batchIndex + 1} of ${batches.length}`);
      }
      
      sqlStatements.push(`INSERT INTO \`${tableName}\` (${columnList}) VALUES`);

      // Generate values for each row in the batch
      const valueRows: string[] = [];
      for (const row of batch) {
        const values = headers.map(header => {
          const value = row[header];
          return this.formatSqlValue(value);
        });
        valueRows.push(`(${values.join(', ')})`);
      }

      // Join all value rows with commas and add semicolon at the end
      sqlStatements.push(valueRows.join(',\n'));
      sqlStatements.push(';');
      
      if (batchIndex < batches.length - 1) {
        sqlStatements.push(''); // Empty line between batches
      }
    }

    return sqlStatements.join('\n');
  }

  /**
   * Split array into chunks of specified size
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Generate CREATE TABLE statement based on sample data
   */
  private generateCreateTableStatement(tableName: string, sampleRow: any, schema?: JSONSchema): string {
    const columns: string[] = [];

    for (const [columnName, value] of Object.entries(sampleRow)) {
      const sqlType = this.inferSqlType(value, columnName);
      columns.push(`  \`${columnName}\` ${sqlType}`);
    }

    // Add unique constraints if schema is provided
    const constraints: string[] = [];
    if (schema?.uniqueConstraints) {
      for (const constraint of schema.uniqueConstraints) {
        const constraintName = constraint.name || `unique_${constraint.columns.join('_')}`;
        const columnList = constraint.columns.map(col => `\`${col}\``).join(', ');
        constraints.push(`  UNIQUE KEY \`${constraintName}\` (${columnList})`);
      }
    }

    const allDefinitions = [...columns, ...constraints];
    return `CREATE TABLE IF NOT EXISTS \`${tableName}\` (\n${allDefinitions.join(',\n')}\n);`;
  }

  /**
   * Infer SQL data type from JavaScript value
   */
  private inferSqlType(value: any, columnName: string): string {
    if (value === null || value === undefined) {
      return 'VARCHAR(255) NULL';
    }

    // Check for specific column patterns
    const columnType = this.getColumnTypeByName(columnName, value);
    if (columnType) {
      return columnType;
    }

    // Infer by value type
    return this.getColumnTypeByValue(value);
  }

  /**
   * Get SQL column type based on column name patterns
   */
  private getColumnTypeByName(columnName: string, value: any): string | null {
    const lowerName = columnName.toLowerCase();

    if (lowerName.includes('id')) {
      return lowerName === 'id' ? 'INT AUTO_INCREMENT PRIMARY KEY' : 'INT';
    }

    if (lowerName.includes('email')) {
      return 'VARCHAR(255) UNIQUE';
    }

    if (lowerName.includes('password')) {
      return 'VARCHAR(255) NOT NULL';
    }

    if (lowerName.includes('date') || lowerName.includes('time')) {
      return this.getDateTimeType(value);
    }

    return null;
  }

  /**
   * Get appropriate datetime SQL type
   */
  private getDateTimeType(value: any): string {
    if (value instanceof Date) {
      return 'DATETIME';
    }
    if (typeof value === 'string' && this.isISODateString(value)) {
      if (value.includes('T') && (value.includes('Z') || value.includes('+'))) {
        return 'DATETIME';
      }
      return 'DATE';
    }
    return 'DATETIME';
  }

  /**
   * Get SQL column type based on JavaScript value type
   */
  private getColumnTypeByValue(value: any): string {
    switch (typeof value) {
      case 'number':
        return Number.isInteger(value) ? 'INT' : 'DECIMAL(10,2)';
      case 'boolean':
        return 'TINYINT(1)';
      case 'string':
        return this.getStringColumnType(value);
      default:
        return 'VARCHAR(255)';
    }
  }

  /**
   * Get appropriate SQL type for string values
   */
  private getStringColumnType(value: string): string {
    if (value.length <= 50) {
      return 'VARCHAR(100)';
    } else if (value.length <= 255) {
      return 'VARCHAR(255)';
    } else {
      return 'TEXT';
    }
  }

  /**
   * Format value for SQL insertion
   */
  private formatSqlValue(value: any): string {
    if (value === null || value === undefined) {
      return 'NULL';
    }

    // Handle Date objects
    if (value instanceof Date) {
      return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`;
    }

    if (typeof value === 'string') {
      // Check if it's a date-time string (ISO 8601 format)
      if (this.isISODateString(value)) {
        const date = new Date(value);
        if (value.includes('T') && value.includes('Z')) {
          // DateTime format
          return `'${date.toISOString().slice(0, 19).replace('T', ' ')}'`;
        } else {
          // Date format
          return `'${date.toISOString().slice(0, 10)}'`;
        }
      }
      // Regular string - escape single quotes and wrap in quotes
      return `'${value.replace(/'/g, "''")}'`;
    }

    if (typeof value === 'boolean') {
      return value ? '1' : '0';
    }

    if (typeof value === 'number') {
      return value.toString();
    }

    // For other types, convert to string and treat as string
    return `'${String(value).replace(/'/g, "''")}'`;
  }

  /**
   * Check if a string is an ISO date string
   */
  private isISODateString(value: string): boolean {
    // Check for ISO 8601 date format patterns
    const isoDatePattern = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
    return isoDatePattern.test(value) && !isNaN(Date.parse(value));
  }

  /**
   * Generate sequential number
   */
  private generateSequentialNumber(property: SchemaProperty): number {
    if (!property.sequential) {
      throw new Error('Sequential property configuration is required');
    }

    const counterName = property.sequential.counterName || 'default';
    const start = property.sequential.start || 1;
    const step = property.sequential.step || 1;

    // Initialize counter if it doesn't exist
    if (!(counterName in this.sequentialCounters)) {
      this.sequentialCounters[counterName] = start;
    }

    const currentValue = this.sequentialCounters[counterName];
    this.sequentialCounters[counterName] += step;

    return currentValue;
  }

  /**
   * Generate value based on percentage distribution
   */
  private generateByPercentage(enumValues: any[], percentages: Record<string, number>, defaultValue?: any): any {
    const randomNum = faker.number.int({ min: 1, max: 100 });
    let cumulativePercentage = 0;

    // Sort by percentage descending to ensure proper distribution
    const sortedEntries = Object.entries(percentages).sort(([,a], [,b]) => b - a);

    for (const [value, percentage] of sortedEntries) {
      cumulativePercentage += percentage;
      if (randomNum <= cumulativePercentage) {
        // Convert string values to appropriate types based on enum
        const parsedValue = this.parseValueToEnumType(value, enumValues);
        return parsedValue;
      }
    }

    // If no percentage match (shouldn't happen with proper config), return default or first enum value
    return defaultValue !== undefined ? defaultValue : enumValues[0];
  }

  /**
   * Parse string value to match enum type
   */
  private parseValueToEnumType(value: string, enumValues: any[]): any {
    // Try to find exact match first
    if (enumValues.includes(value)) {
      return value;
    }

    // Try to parse as number if enum contains numbers
    const numValue = Number(value);
    if (!isNaN(numValue) && enumValues.includes(numValue)) {
      return numValue;
    }

    // Try to parse as boolean if enum contains booleans
    if (value.toLowerCase() === 'true' && enumValues.includes(true)) {
      return true;
    }
    if (value.toLowerCase() === 'false' && enumValues.includes(false)) {
      return false;
    }

    // Return original value if no conversion needed
    return value;
  }

  /**
   * Process template string by replacing variables with record values
   */
  private processTemplate(template: string, record: any, property: SchemaProperty): string {
    let result = template;
    
    // Handle special template cases for conditional generation
    if (template === '{{contact_type_value}}') {
      return this.generateContactValue(record.contact_type);
    }
    
    // Replace template variables like {{property_name}} with actual values
    const templatePattern = /\{\{([^}]+)\}\}/g;
    result = result.replace(templatePattern, (match, propertyName) => {
      const trimmedPropertyName = propertyName.trim();
      if (record[trimmedPropertyName] !== undefined) {
        return String(record[trimmedPropertyName]);
      }
      return match; // Keep original if property not found
    });

    // Apply transform if specified
    if (property.transform) {
      switch (property.transform) {
        case 'lowercase':
          result = result.toLowerCase();
          break;
        case 'uppercase':
          result = result.toUpperCase();
          break;
        case 'capitalize':
          result = result.charAt(0).toUpperCase() + result.slice(1).toLowerCase();
          break;
      }
    }

    return result;
  }

  /**
   * Generate appropriate contact value based on contact type
   */
  private generateContactValue(contactType: string): string {
    switch (contactType) {
      case 'email':
        return faker.internet.email();
      case 'phone':
        return faker.phone.number();
      case 'address':
        return `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.state()} ${faker.location.zipCode()}`;
      case 'emergency':
        return faker.phone.number();
      default:
        return faker.internet.email();
    }
  }

  /**
   * Generate foreign key value by referencing existing data
   */
  private generateForeignKeyValue(property: SchemaProperty): any {
    if (!property.foreignKey) {
      return null;
    }

    const referencedSchema = property.foreignKey.schema;
    const referencedField = property.foreignKey.field;
    const referencedData = this.generatedData[referencedSchema];

    if (!referencedData || referencedData.length === 0) {
      // If no referenced data exists, return a default value based on type
      if (property.type === 'integer' || property.type === 'number') {
        return faker.number.int({ min: 1, max: 1000 });
      }
      return null;
    }

    // Get a random record from the referenced data
    const randomRecord = faker.helpers.arrayElement(referencedData);
    return randomRecord[referencedField];
  }

  /**
   * Generate data for multiple related schemas in the correct dependency order
   */
  generateRelatedSchemas(schemas: { [schemaName: string]: JSONSchema }, counts?: { [schemaName: string]: number }): { [schemaName: string]: any[] } {
    const results: { [schemaName: string]: any[] } = {};
    
    // First, identify parent schemas and dependent schemas
    const parentSchemas: string[] = [];
    const dependentSchemas: { name: string; parentSchemas: string[] }[] = [];
    
    for (const [schemaName, schema] of Object.entries(schemas)) {
      schema.schemaName = schemaName; // Ensure schema name is set
      
      const parentSchemaNames = this.getParentSchemaNames(schema);
      if (parentSchemaNames.length > 0) {
        dependentSchemas.push({
          name: schemaName,
          parentSchemas: parentSchemaNames
        });
      } else {
        parentSchemas.push(schemaName);
      }
    }
    
    // Generate parent schemas first
    for (const schemaName of parentSchemas) {
      const schema = schemas[schemaName];
      const count = counts?.[schemaName] || this.options.count || 10;
      results[schemaName] = this.generateFromSchema(schema, count);
    }
    
    // Generate dependent schemas in order (simple dependency resolution)
    const remainingDependentSchemas = [...dependentSchemas];
    while (remainingDependentSchemas.length > 0) {
      const initialLength = remainingDependentSchemas.length;
      
      for (let i = remainingDependentSchemas.length - 1; i >= 0; i--) {
        const dependentSchema = remainingDependentSchemas[i];
        
        // Check if all parent schemas have been generated
        if (dependentSchema.parentSchemas.every(parentName => results[parentName])) {
          const schema = schemas[dependentSchema.name];
          const count = counts?.[dependentSchema.name] || this.options.count || 10;
          results[dependentSchema.name] = this.generateFromSchema(schema, count);
          remainingDependentSchemas.splice(i, 1);
        }
      }
      
      // Prevent infinite loop if there are circular dependencies
      if (remainingDependentSchemas.length === initialLength) {
        throw new Error(`Circular dependency detected in schemas: ${remainingDependentSchemas.map(s => s.name).join(', ')}`);
      }
    }
    
    return results;
  }

  /**
   * Extract parent schema names from a schema configuration
   */
  private getParentSchemaNames(schema: JSONSchema): string[] {
    const parentNames: string[] = [];
    
    // Legacy single parent format
    if (schema.dependentRecords?.parentSchema) {
      parentNames.push(schema.dependentRecords.parentSchema);
    }
    
    // New multiple parent format
    if (schema.dependentRecords?.parentSchemas) {
      parentNames.push(...schema.dependentRecords.parentSchemas.map(config => config.schema));
    }
    
    return parentNames;
  }

  /**
   * Get stored generated data for a specific schema
   */
  getGeneratedData(schemaName: string): any[] {
    return this.generatedData[schemaName] || [];
  }

  /**
   * Clear unique constraint trackers
   */
  clearUniqueConstraintTrackers(): void {
    Object.keys(this.uniqueConstraintTrackers).forEach(key => delete this.uniqueConstraintTrackers[key]);
  }

  /**
   * Clear all stored generated data
   */
  clearGeneratedData(): void {
    Object.keys(this.generatedData).forEach(key => delete this.generatedData[key]);
  }
}
