#!/usr/bin/env node

import { program } from 'commander';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { MockDataGenerator } from './MockDataGenerator';
import { JSONSchema } from './types';

program
  .name('mock-generator')
  .description('Generate mock data from JSON schemas')
  .version('1.0.0');

program
  .command('generate')
  .description('Generate mock data from a JSON schema file')
  .option('-s, --schema <file>', 'JSON schema file path')
  .option('-c, --count <number>', 'Number of records to generate', '10')
  .option('-o, --output <file>', 'Output file path')
  .option('-f, --format <format>', 'Output format (json|csv|tsv|sql)', 'json')
  .option('-t, --table <table>', 'Table name for SQL output (default: generated_data)', 'generated_data')
  .option('-b, --batch <size>', 'Batch size for SQL inserts (default: 1000)', '1000')
  .option('--seed <number>', 'Seed for reproducible results')
  .option('--locale <locale>', 'Locale for faker data', 'en')
  .action(async (options) => {
    try {
      if (!options.schema) {
        console.error('Error: Schema file is required. Use -s or --schema option.');
        process.exit(1);
      }

      // Read schema file
      const schemaPath = resolve(options.schema);
      const schemaContent = readFileSync(schemaPath, 'utf-8');
      const schema: JSONSchema = JSON.parse(schemaContent);

      // Create generator with options
      const generatorOptions: any = {
        count: parseInt(options.count),
        locale: options.locale,
      };

      if (options.seed) {
        generatorOptions.seed = parseInt(options.seed);
      }

      const generator = new MockDataGenerator(generatorOptions);

      // Generate data
      console.log(`Generating ${options.count} records...`);
      const data = generator.generateFromSchema(schema, parseInt(options.count));

      // Export in specified format
      const output = generator.exportToFormat(data, options.format, options.table, parseInt(options.batch));

      // Write to file or stdout
      if (options.output) {
        writeFileSync(options.output, output);
        console.log(`Data written to ${options.output}`);
      } else {
        console.log(output);
      }

    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('validate')
  .description('Validate a JSON schema file')
  .option('-s, --schema <file>', 'JSON schema file path')
  .action((options) => {
    try {
      if (!options.schema) {
        console.error('Error: Schema file is required. Use -s or --schema option.');
        process.exit(1);
      }

      const schemaPath = resolve(options.schema);
      const schemaContent = readFileSync(schemaPath, 'utf-8');
      const schema = JSON.parse(schemaContent);

      // Basic validation
      if (!schema.type || schema.type !== 'object') {
        throw new Error('Schema must have type "object"');
      }

      if (!schema.properties || typeof schema.properties !== 'object') {
        throw new Error('Schema must have properties object');
      }

      console.log('✅ Schema is valid');
    } catch (error) {
      console.error('❌ Schema validation failed:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('example')
  .description('Generate example schema files')
  .option('-t, --type <type>', 'Example type (user|product|order)', 'user')
  .option('-o, --output <file>', 'Output file path')
  .action((options) => {
    const schemas = {
      user: {
        type: 'object',
        properties: {
          id: { type: 'integer', minimum: 1, maximum: 10000 },
          firstName: { type: 'string', faker: 'name.firstName' },
          lastName: { type: 'string', faker: 'name.lastName' },
          email: { type: 'string', format: 'email' },
          age: { type: 'integer', minimum: 18, maximum: 80 },
          isActive: { type: 'boolean' },
          role: { type: 'string', enum: ['admin', 'user', 'moderator'] }
        },
        required: ['id', 'firstName', 'lastName', 'email']
      },
      product: {
        type: 'object',
        properties: {
          id: { type: 'string', faker: 'datatype.uuid' },
          name: { type: 'string', faker: 'commerce.productName' },
          price: { type: 'number', minimum: 1, maximum: 1000 },
          category: { type: 'string', enum: ['electronics', 'clothing', 'books'] },
          inStock: { type: 'boolean' }
        },
        required: ['id', 'name', 'price']
      },
      order: {
        type: 'object',
        properties: {
          orderId: { type: 'string', faker: 'datatype.uuid' },
          customerId: { type: 'integer', minimum: 1, maximum: 10000 },
          orderDate: { type: 'string', format: 'date-time' },
          status: { type: 'string', enum: ['pending', 'processing', 'shipped', 'delivered'] },
          totalAmount: { type: 'number', minimum: 1, maximum: 5000 }
        },
        required: ['orderId', 'customerId', 'orderDate', 'status', 'totalAmount']
      }
    };

    const schema = schemas[options.type as keyof typeof schemas];
    if (!schema) {
      console.error('Invalid example type. Available types: user, product, order');
      process.exit(1);
    }

    const output = JSON.stringify(schema, null, 2);

    if (options.output) {
      writeFileSync(options.output, output);
      console.log(`Example ${options.type} schema written to ${options.output}`);
    } else {
      console.log(output);
    }
  });

program.parse();
