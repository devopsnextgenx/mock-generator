import { MockDataGenerator } from '../src/MockDataGenerator';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Example demonstrating sequential ID generation
 */
export function demonstrateSequentialIds(): void {
  // Load the updated users schema
  const schemaPath = path.join(__dirname, 'schemas/users-schema.json');
  const usersSchema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

  console.log('=== Sequential ID Example ===');

  // Example 1: Basic sequential IDs starting from 1000
  const generator1 = new MockDataGenerator({
    count: 5,
    seed: 12345,
  });

  const users1 = generator1.generateFromSchema(usersSchema, 5);
  console.log('Users with sequential IDs starting from 1000:');
  console.log(JSON.stringify(users1.map(u => ({ id: u.id, user_name: u.user_name })), null, 2));

  // Example 2: Sequential IDs with custom start and step
  const customSchema = {
    type: 'object' as const,
    properties: {
      id: {
        type: 'integer',
        sequential: {
          start: 5000,
          step: 10,
          counterName: 'custom_id'
        }
      },
      name: {
        type: 'string',
        faker: 'person.fullName'
      }
    },
    required: ['id', 'name']
  };

  const generator2 = new MockDataGenerator();
  const customData = generator2.generateFromSchema(customSchema, 5);
  console.log('\nCustom data with IDs starting from 5000, step 10:');
  console.log(JSON.stringify(customData, null, 2));

  // Example 3: Multiple sequential counters
  const multiCounterSchema = {
    type: 'object' as const,
    properties: {
      user_id: {
        type: 'integer',
        sequential: {
          start: 1,
          step: 1,
          counterName: 'users'
        }
      },
      order_id: {
        type: 'integer',
        sequential: {
          start: 100,
          step: 5,
          counterName: 'orders'
        }
      },
      name: {
        type: 'string',
        faker: 'person.fullName'
      }
    },
    required: ['user_id', 'order_id', 'name']
  };

  const generator3 = new MockDataGenerator();
  const multiData = generator3.generateFromSchema(multiCounterSchema, 3);
  console.log('\nMultiple sequential counters:');
  console.log(JSON.stringify(multiData, null, 2));
}

// Run the example if this file is executed directly
if (require.main === module) {
  demonstrateSequentialIds();
}
