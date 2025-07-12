const { MockDataGenerator } = require('../dist/MockDataGenerator');

// Test without seed first
console.log('=== Testing without seed ===');
const generator1 = new MockDataGenerator();

const schema = {
  type: 'object',
  properties: {
    active: {
      type: 'integer',
      enum: [0, 1],
      default: 1,
      percentage: {
        '1': 80,
        '0': 20
      }
    }
  }
};

const result1 = generator1.generateFromSchema(schema, 10);
console.log('Generated data:');
result1.forEach((item, index) => {
  console.log(`Record ${index + 1}: active = ${item.active}`);
});

const activeCount1 = result1.filter(r => r.active === 1).length;
console.log(`\nActive count: ${activeCount1} out of 10 (${activeCount1 * 10}%)`);

// Test with seed
console.log('\n=== Testing with seed ===');
const generator2 = new MockDataGenerator({ seed: 12345 });

const result2 = generator2.generateFromSchema(schema, 10);
console.log('Generated data:');
result2.forEach((item, index) => {
  console.log(`Record ${index + 1}: active = ${item.active}`);
});

const activeCount2 = result2.filter(r => r.active === 1).length;
console.log(`\nActive count: ${activeCount2} out of 10 (${activeCount2 * 10}%)`);
