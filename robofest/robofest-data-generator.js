/**
 * Schema File Demo with SQL Generation Support
 * 
 * This script demonstrates how to generate both JSON and SQL data from schema files.
 * 
 * Configuration options for each schema:
 * - file: Path to the JSON schema file (relative to schemas/ directory)
 * - name: Display name for the dataset
 * - count: Number of records to generate
 * - sql: SQL generation options (optional)
 *   - enabled: boolean - Whether to generate SQL files
 *   - tableName: string - Name of the MySQL table
 *   - batchSize: number - Records per INSERT statement (default: 1000)
 * 
 * Generated files:
 * - JSON: generated-{name}-data.json
 * - SQL: generated-{name}-data.sql (if sql.enabled = true)
 * 
 * SQL features:
 * - Automatic CREATE TABLE statement with proper MySQL column types
 * - Bulk INSERT statements split into configurable batches
 * - Proper date/time formatting and SQL escaping
 * - Performance optimized for large datasets
 */

const { MockDataGenerator } = require('../dist/index.js');
const fs = require('fs');
const path = require('path');

// Function to load JSON schema from file
function loadSchema(filename) {
  const filePath = path.join(__dirname, filename);
  const content = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(content);
}

// Configuration with schema files, record counts, and SQL generation options
// const schemaConfigs = [
//   { 
//     file: 'users-schema.json', 
//     name: 'Users', 
//     count: 15000,
//     sql: {
//       enabled: true,
//       tableName: 'users',
//       batchSize: 500
//     }
//   },
// ];

// Uncomment for multiple schemas
const schemaConfigs = [
  { 
    file: 'users-schema.json', 
    name: 'Users', 
    count: 15000,
    sql: { enabled: true, tableName: 'users', batchSize: 1000 }
  },
  { 
    file: 'teams-schema.json', 
    name: 'Teams', 
    count: 100,
    sql: { enabled: true, tableName: 'teams', batchSize: 50 }
  },
  { 
    file: 'schools-schema.json', 
    name: 'Schools', 
    count: 250,
    sql: { enabled: true, tableName: 'schools', batchSize: 100 }
  },
  { 
    file: 'sponsers-schema.json', 
    name: 'Sponsors', 
    count: 750,
    sql: { enabled: true, tableName: 'sponsors', batchSize: 250 }
  },
  { 
    file: 'user-contacts-schema.json', 
    name: 'User Contacts', 
    count: 40000,
    sql: { enabled: true, tableName: 'user_contacts', batchSize: 2000 }
  }
];

// Initialize the mock data generator
const generator = new MockDataGenerator({
  locale: 'en',
  seed: 54321, // Seed for reproducible results
  count: 10    // Default count if not specified
});

// Create output directories if they don't exist
const outputDirs = {
  json: path.join(__dirname, 'json-output'),
  sql: path.join(__dirname, 'sql-output')
};

// Ensure output directories exist
Object.values(outputDirs).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
});

console.log('🎯 Mock Data Generator - Using JSON Schema Files with SQL Generation');
console.log('=' .repeat(65));
console.log('📁 Loading schemas from files and generating data...');
console.log(`📂 JSON files will be saved to: ${outputDirs.json}`);
console.log(`📂 SQL files will be saved to: ${outputDirs.sql}\n`);

// Process each schema configuration
schemaConfigs.forEach(({ file, name, count, sql }) => {
  try {
    file = `schemas/${file}`; // Ensure correct path to schema files
    console.log(`📋 Processing: ${name} (${file})`);
    console.log(`🎲 Generating ${count} records...`);
    
    // Load schema from file
    const schema = loadSchema(file);
    
    // Generate mock data
    const startTime = Date.now();
    const mockData = generator.generateFromSchema(schema, count);
    const endTime = Date.now();
    
    console.log(`✅ Generated ${mockData.length} ${name} records in ${endTime - startTime}ms`);
    
    // Show sample record
    if (mockData.length > 0) {
      console.log('📝 Sample record:');
      console.log(JSON.stringify(mockData[0], null, 2));
    }
    
    // Save generated data to JSON file
    const outputFile = path.join(outputDirs.json, `generated-${name.toLowerCase().replace(/\s+/g, '-')}-data.json`);
    fs.writeFileSync(outputFile, JSON.stringify(mockData, null, 2));
    console.log(`💾 Saved JSON to: ${outputFile}`);
    
    // Generate SQL file if enabled
    if (sql && sql.enabled) {
      console.log(`🗄️  Generating SQL bulk insert statements...`);
      const sqlStartTime = Date.now();
      
      const sqlContent = generator.exportToFormat(
        mockData, 
        'sql', 
        sql.tableName || name.toLowerCase().replace(/\s+/g, '_'), 
        sql.batchSize || 1000
      );
      
      const sqlEndTime = Date.now();
      const sqlFile = path.join(outputDirs.sql, `generated-${name.toLowerCase().replace(/\s+/g, '-')}-data.sql`);
      fs.writeFileSync(sqlFile, sqlContent);
      
      const numBatches = Math.ceil(mockData.length / (sql.batchSize || 1000));
      console.log(`📊 SQL Details:`);
      console.log(`   - Table: ${sql.tableName || name.toLowerCase().replace(/\s+/g, '_')}`);
      console.log(`   - Batch size: ${sql.batchSize || 1000} records per INSERT`);
      console.log(`   - Total batches: ${numBatches}`);
      console.log(`   - Generated in: ${sqlEndTime - sqlStartTime}ms`);
      console.log(`💾 Saved SQL to: ${sqlFile}`);
    }
    
    console.log('-'.repeat(60) + '\n');
    
  } catch (error) {
    console.error(`❌ Error processing ${name} (${file}):`, error.message);
    console.log('-'.repeat(60) + '\n');
  }
});

console.log('\n🎉 Data generation completed! Both JSON and SQL files generated.');

// Export function for use in other modules
module.exports = {
  generateFromSchemaFile: function(schemaFile, recordCount = 10, sqlOptions = null) {
    const schema = loadSchema(schemaFile);
    const data = generator.generateFromSchema(schema, recordCount);
    
    // Generate SQL if options provided
    if (sqlOptions && sqlOptions.enabled) {
      const sqlContent = generator.exportToFormat(
        data, 
        'sql', 
        sqlOptions.tableName || 'generated_data',
        sqlOptions.batchSize || 1000
      );
      
      if (sqlOptions.outputFile) {
        // Use sql-output directory if outputFile doesn't include a path
        const outputPath = path.isAbsolute(sqlOptions.outputFile) 
          ? sqlOptions.outputFile 
          : path.join(outputDirs.sql, sqlOptions.outputFile);
        fs.writeFileSync(outputPath, sqlContent);
      }
      
      return {
        data: data,
        sql: sqlContent,
        batches: Math.ceil(data.length / (sqlOptions.batchSize || 1000))
      };
    }
    
    return data;
  },
  
  generateMultipleFromFiles: function(configs) {
    const results = {};
    configs.forEach(({ file, key, count, sql }) => {
      try {
        const schema = loadSchema(file);
        const data = generator.generateFromSchema(schema, count);
        
        const result = { data };
        
        // Generate SQL if enabled
        if (sql && sql.enabled) {
          const sqlContent = generator.exportToFormat(
            data,
            'sql',
            sql.tableName || key,
            sql.batchSize || 1000
          );
          result.sql = sqlContent;
          result.batches = Math.ceil(data.length / (sql.batchSize || 1000));
          
          if (sql.outputFile) {
            // Use sql-output directory if outputFile doesn't include a path
            const outputPath = path.isAbsolute(sql.outputFile) 
              ? sql.outputFile 
              : path.join(outputDirs.sql, sql.outputFile);
            fs.writeFileSync(outputPath, sqlContent);
          }
        }
        
        results[key] = result;
      } catch (error) {
        console.error(`Error generating ${key}:`, error.message);
        results[key] = { data: [], error: error.message };
      }
    });
    return results;
  }
};
