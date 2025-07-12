import { MockDataGenerator } from '../src/MockDataGenerator';

// Test sequential ID functionality
const schema = {
  type: 'object' as const,
  properties: {
    id: {
      type: 'integer',
      sequential: {
        start: 1000,
        step: 1,
        counterName: 'user_id'
      }
    },
    name: {
      type: 'string',
      faker: 'person.fullName'
    }
  },
  required: ['id', 'name']
};

const generator = new MockDataGenerator();
const data = generator.generateFromSchema(schema, 5);

console.log('Sequential ID Test Results:');
console.log(JSON.stringify(data, null, 2));
