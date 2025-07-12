import { MockDataGenerator } from '../MockDataGenerator';
import { userSchema, productSchema, orderSchema } from '../schemas/examples';

/**
 * Example usage of the Mock Data Generator
 */
export function runExamples(): void {
  const generator = new MockDataGenerator({
    count: 5,
    seed: 12345, // For reproducible results
  });

  console.log('=== User Data ===');
  const users = generator.generateFromSchema(userSchema, 3);
  console.log(JSON.stringify(users, null, 2));

  console.log('\n=== Product Data ===');
  const products = generator.generateFromSchema(productSchema, 2);
  console.log(JSON.stringify(products, null, 2));

  console.log('\n=== Order Data ===');
  const orders = generator.generateFromSchema(orderSchema, 2);
  console.log(JSON.stringify(orders, null, 2));

  console.log('\n=== Simple Config Example ===');
  const simpleData = generator.generateFromConfig(
    {
      name: 'name.fullName',
      email: 'internet.email',
      company: 'company.companyName',
      jobTitle: 'name.jobTitle',
      salary: 'number.int',
    },
    3
  );
  console.log(JSON.stringify(simpleData, null, 2));

  console.log('\n=== CSV Export ===');
  const csvData = generator.exportToFormat(users, 'csv');
  console.log(csvData);
}

// Run examples if this file is executed directly
if (require.main === module) {
  runExamples();
}
