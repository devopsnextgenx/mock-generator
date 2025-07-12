const { MockDataGenerator } = require('../dist/MockDataGenerator');
const fs = require('fs');

const generator = new MockDataGenerator();

// Read the users schema
const schema = JSON.parse(fs.readFileSync('./schemas/users-schema.json', 'utf8'));

console.log('Testing with users schema:');
const result = generator.generateFromSchema(schema, 20);

console.log('\nGenerated users:');
result.forEach((user, index) => {
  console.log(`User ${index + 1}: active=${user.active}, is_deleted=${user.is_deleted}, name=${user.first_name} ${user.last_name}`);
});

const activeCount = result.filter(r => r.active === 1).length;
const deletedCount = result.filter(r => r.is_deleted === 1).length;

console.log(`\nSummary:`);
console.log(`Active users: ${activeCount}/20 (${(activeCount/20*100).toFixed(1)}%) - Expected: ~80%`);
console.log(`Deleted users: ${deletedCount}/20 (${(deletedCount/20*100).toFixed(1)}%) - Expected: ~10%`);
