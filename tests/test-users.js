const { MockDataGenerator } = require('../dist/MockDataGenerator');
const fs = require('fs');

const schema = JSON.parse(fs.readFileSync('./schemas/users-schema.json', 'utf8'));
const generator = new MockDataGenerator();
const users = generator.generateFromSchema(schema, 3);

console.log('Users with sequential IDs:');
console.log(JSON.stringify(users.map(u => ({ 
  id: u.id, 
  user_name: u.user_name, 
  first_name: u.first_name, 
  last_name: u.last_name 
})), null, 2));
