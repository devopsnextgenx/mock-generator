# Mock Data Generator Examples

This directory contains JavaScript examples demonstrating how to use the MockDataGenerator with different schemas and record counts.

## Prerequisites

Make sure the project is built before running the examples:

```bash
npm run build
```

## Examples

### 1. `demo.js` - Comprehensive Demo
A complete example showcasing multiple schema types and advanced features.

**Features:**
- Multiple schema definitions (User, Product, Company, Order, Blog Post)
- Different record counts for each schema
- Nested object properties
- Batch generation functions
- File output
- Performance timing

**Run:**
```bash
cd examples
node demo.js
```

### 2. `simple-demo.js` - Basic Usage
A straightforward example perfect for getting started.

**Features:**
- Simple schema definitions
- Basic data generation
- Different quantities for the same schema

**Run:**
```bash
cd examples
node simple-demo.js
```

### 3. `schema-file-demo.js` - Using JSON Schema Files
Demonstrates loading existing JSON schema files and generating data.

**Features:**
- Loads schemas from JSON files
- Uses the existing schema files in the examples directory
- Configurable record counts per schema
- Exported utility functions for reuse

**Run:**
```bash
cd examples
node schema-file-demo.js
```

## Schema Structure

All examples use JSON Schema format with Faker.js extensions:

```javascript
const schema = {
  type: "object",
  properties: {
    id: {
      type: "integer",
      faker: "number.int"
    },
    name: {
      type: "string", 
      faker: "name.fullName"
    },
    email: {
      type: "string",
      faker: "internet.email"
    }
  }
};
```

## Generating Data with Different Counts

```javascript
const generator = new MockDataGenerator();

// Generate 10 records (default)
const data1 = generator.generateFromSchema(schema);

// Generate specific number of records
const data2 = generator.generateFromSchema(schema, 25);

// Configure default count in constructor
const customGenerator = new MockDataGenerator({ count: 15 });
const data3 = customGenerator.generateFromSchema(schema); // generates 15 records
```

## Configuration Options

```javascript
const generator = new MockDataGenerator({
  locale: 'en',        // Faker locale
  seed: 12345,         // Seed for reproducible results
  count: 10            // Default record count
});
```

## Common Schema Patterns

### Basic Types
```javascript
{
  stringField: { type: "string", faker: "lorem.word" },
  numberField: { type: "number", faker: "number.int" },
  booleanField: { type: "boolean", faker: "datatype.boolean" },
  dateField: { type: "string", format: "date", faker: "date.recent" }
}
```

### Nested Objects
```javascript
{
  address: {
    type: "object",
    properties: {
      street: { type: "string", faker: "address.streetAddress" },
      city: { type: "string", faker: "address.city" }
    }
  }
}
```

### Arrays
```javascript
{
  tags: {
    type: "array",
    items: { type: "string", faker: "lorem.word" }
  }
}
```

## Output Files

The examples generate JSON files with the mock data:
- `generated-users.json`
- `generated-products.json` 
- `generated-companies.json`
- etc.

## Available Faker Methods

Common faker methods you can use in schemas:
- `name.firstName`, `name.lastName`, `name.fullName`
- `internet.email`, `internet.userName`, `internet.url`
- `address.city`, `address.state`, `address.country`
- `commerce.productName`, `commerce.price`, `commerce.department`
- `company.companyName`, `company.buzzNoun`
- `number.int`, `datatype.boolean`, `datatype.uuid`
- `date.recent`, `date.past`, `date.future`
- `lorem.word`, `lorem.sentence`, `lorem.paragraph`

For more Faker methods, see: https://fakerjs.dev/api/

## Error Handling

The examples include error handling for common issues:
- Missing schema files
- Invalid schema format
- Generation failures

Check the console output for detailed error messages.
