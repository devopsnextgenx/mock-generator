#!/usr/bin/env node

/**
 * SQL Generation Demo for Mock Data Generator
 * 
 * This script demonstrates how to generate MySQL bulk insert statements
 * from JSON schema files using the mock-data-generator tool.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🎯 Mock Data Generator - SQL Generation Demo\n');

// Create output directory for this test
const outputDir = path.join(__dirname, 'sql-demo');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const examples = [
  {
    title: 'Generate 10 users with SQL format',
    command: `npx tsx ../src/cli.ts generate -s ../schemas/users-schema.json -c 10 -f sql -t users -o "${path.join(outputDir, 'demo-users.sql').replace(/\\/g, '/')}"`,
    description: 'Creates a SQL file with CREATE TABLE and INSERT statements for 10 users'
  },
  {
    title: 'Generate 50 users in batches of 20',
    command: `npx tsx ../src/cli.ts generate -s ../schemas/users-schema.json -c 50 -f sql -t users -b 20 -o "${path.join(outputDir, 'demo-users-batched.sql').replace(/\\/g, '/')}"`,
    description: 'Creates a SQL file with 50 users split into batches of 20 records each'
  },
  {
    title: 'Generate teams data as SQL',
    command: `npx tsx ../src/cli.ts generate -s ../schemas/teams-schema.json -c 15 -f sql -t teams -o "${path.join(outputDir, 'demo-teams.sql').replace(/\\/g, '/')}"`,
    description: 'Creates a SQL file with team data'
  }
];

examples.forEach((example, index) => {
  console.log(`📝 Example ${index + 1}: ${example.title}`);
  console.log(`   ${example.description}`);
  console.log(`   Command: ${example.command}\n`);
  
  try {
    console.log('   Executing...');
    execSync(example.command, { cwd: __dirname, stdio: 'inherit' });
    console.log('   ✅ Success!\n');
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }
});

console.log('🎉 Demo completed! Check the generated .sql files in tests/sql-demo/ directory.');
console.log('\n📖 Usage:');
console.log('   -s, --schema <file>     JSON schema file path');
console.log('   -c, --count <number>    Number of records to generate');
console.log('   -f, --format <format>   Output format (json|csv|tsv|sql)');
console.log('   -t, --table <table>     Table name for SQL output');
console.log('   -b, --batch <size>      Batch size for SQL inserts (default: 1000)');
console.log('   -o, --output <file>     Output file path');
