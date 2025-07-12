const { MockDataGenerator } = require('../dist/MockDataGenerator');

// Test schema for modulo feature
const moduloTestSchema = {
  type: 'object',
  schemaName: 'modulo_test',
  properties: {
    id: {
      type: 'integer',
      sequential: {
        start: 1,
        step: 1,
        counterName: 'modulo_test_id'
      }
    },
    // Amount that must be multiple of 100 (e.g., 100, 200, 300, etc.)
    amount_multiple_100: {
      type: 'integer',
      minimum: 100,
      maximum: 10000,
      modulo: {
        divisor: 100
      }
    },
    // Amount that must be multiple of 5 (e.g., 5, 10, 15, 20, etc.)
    amount_multiple_5: {
      type: 'integer',
      minimum: 10,
      maximum: 500,
      modulo: {
        divisor: 5
      }
    },
    // Amount with remainder pattern (e.g., numbers that when divided by 10 give remainder 3: 13, 23, 33, etc.)
    amount_with_remainder: {
      type: 'integer',
      minimum: 1,
      maximum: 200,
      modulo: {
        divisor: 10,
        remainder: 3
      }
    },
    // Using faker with modulo
    faker_amount_multiple_20: {
      type: 'integer',
      minimum: 20,
      maximum: 1000,
      faker: 'number.int',
      modulo: {
        divisor: 20
      }
    },
    // Regular amount for comparison
    regular_amount: {
      type: 'integer',
      minimum: 1,
      maximum: 1000,
      faker: 'number.int'
    }
  },
  required: ['id', 'amount_multiple_100', 'amount_multiple_5', 'amount_with_remainder', 'faker_amount_multiple_20', 'regular_amount']
};

console.log('=== Testing Modulo Feature ===\n');

try {
  const generator = new MockDataGenerator({ count: 10 });
  const data = generator.generateFromSchema(moduloTestSchema);

  console.log('Generated test data:');
  data.forEach((record, index) => {
    console.log(`\nRecord ${index + 1}:`);
    console.log(`  ID: ${record.id}`);
    console.log(`  Amount (multiple of 100): ${record.amount_multiple_100} (${record.amount_multiple_100} % 100 = ${record.amount_multiple_100 % 100})`);
    console.log(`  Amount (multiple of 5): ${record.amount_multiple_5} (${record.amount_multiple_5} % 5 = ${record.amount_multiple_5 % 5})`);
    console.log(`  Amount (remainder 3 when divided by 10): ${record.amount_with_remainder} (${record.amount_with_remainder} % 10 = ${record.amount_with_remainder % 10})`);
    console.log(`  Faker amount (multiple of 20): ${record.faker_amount_multiple_20} (${record.faker_amount_multiple_20} % 20 = ${record.faker_amount_multiple_20 % 20})`);
    console.log(`  Regular amount: ${record.regular_amount}`);
  });

  // Verify patterns
  console.log('\n=== Verification ===');
  let allValid = true;

  data.forEach((record, index) => {
    const errors = [];
    
    if (record.amount_multiple_100 % 100 !== 0) {
      errors.push(`amount_multiple_100 (${record.amount_multiple_100}) is not a multiple of 100`);
    }
    
    if (record.amount_multiple_5 % 5 !== 0) {
      errors.push(`amount_multiple_5 (${record.amount_multiple_5}) is not a multiple of 5`);
    }
    
    if (record.amount_with_remainder % 10 !== 3) {
      errors.push(`amount_with_remainder (${record.amount_with_remainder}) % 10 is not 3`);
    }
    
    if (record.faker_amount_multiple_20 % 20 !== 0) {
      errors.push(`faker_amount_multiple_20 (${record.faker_amount_multiple_20}) is not a multiple of 20`);
    }

    if (errors.length > 0) {
      console.log(`Record ${index + 1} FAILED: ${errors.join(', ')}`);
      allValid = false;
    }
  });

  if (allValid) {
    console.log('✅ All records passed modulo validation!');
  } else {
    console.log('❌ Some records failed validation');
  }

} catch (error) {
  console.error('Error generating data:', error);
}
