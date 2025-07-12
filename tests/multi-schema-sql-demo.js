/**
 * Multi-Schema SQL Demo
 * 
 * This demonstrates generating SQL files for multiple schemas with different configurations
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

// Multi-schema configuration with varying batch sizes
const multiSchemaConfigs = [
  { 
    file: '../schemas/users-schema.json', 
    name: 'Users', 
    count: 2500,
    sql: { 
      enabled: true, 
      tableName: 'users', 
      batchSize: 500  // Medium batches for user data
    }
  },
  { 
    file: '../schemas/teams-schema.json', 
    name: 'Teams', 
    count: 50,
    sql: { 
      enabled: true, 
      tableName: 'teams', 
      batchSize: 25   // Small batches for team data
    }
  },
];

const generator = new MockDataGenerator({
  locale: 'en',
  seed: 98765,
  count: 10
});

console.log('🎯 Multi-Schema SQL Generation Demo');
console.log('=' .repeat(40));

multiSchemaConfigs.forEach(({ file, name, count, sql }) => {
  try {
    console.log(`\n📋 Processing: ${name}`);
    console.log(`🎲 Records: ${count}, Batch size: ${sql.batchSize}`);
    
    const schema = loadSchema(file);
    const startTime = Date.now();
    const mockData = generator.generateFromSchema(schema, count);
    const dataGenTime = Date.now() - startTime;
    
    console.log(`✅ Generated ${mockData.length} records in ${dataGenTime}ms`);
    
    // Generate SQL
    const sqlStartTime = Date.now();
    const sqlContent = generator.exportToFormat(
      mockData, 
      'sql', 
      sql.tableName, 
      sql.batchSize
    );
    const sqlGenTime = Date.now() - sqlStartTime;
    
    const numBatches = Math.ceil(mockData.length / sql.batchSize);
    
    // Create output directory for this test
    const outputDir = path.join(__dirname, 'multi-schema-sql-demo');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const sqlFile = path.join(outputDir, `multi-${sql.tableName}.sql`);
    fs.writeFileSync(sqlFile, sqlContent);
    
    console.log(`🗄️  SQL generated in ${sqlGenTime}ms`);
    console.log(`📊 Batches: ${numBatches} (${sql.batchSize} records each)`);
    console.log(`💾 Saved: tests/multi-schema-sql-demo/multi-${sql.tableName}.sql`);
    
  } catch (error) {
    console.error(`❌ Error with ${name}:`, error.message);
  }
});

console.log('\n🎉 Multi-schema SQL generation completed!');
console.log('📁 Generated files in tests/multi-schema-sql-demo/:');
multiSchemaConfigs.forEach(({ sql }) => {
  if (sql && sql.enabled) {
    console.log(`   - multi-${sql.tableName}.sql`);
  }
});
