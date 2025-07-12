# Mock Data Generator

A comprehensive TypeScript library for generating realistic mock data in bulk using JSON schemas with advanced features including foreign key relationships, sequential IDs, SQL generation, and more.

## Table of Contents

- [Installation & Quick Start](#installation--quick-start)
- [CLI Usage](#cli-usage)
- [Programmatic Usage](#programmatic-usage)
- [Schema Configuration](#schema-configuration)
- [Advanced Features](#advanced-features)
- [Examples](#examples)
- [SQL Generation](#sql-generation)
- [Testing & Development](#testing--development)

## Installation & Quick Start

### Prerequisites

```bash
npm install
npm run build
```

### Basic Usage

```bash
# Generate 100 records from a schema file
npx tsx src/cli.ts generate -s schemas/users-schema.json -c 100 -o users.json

# Generate SQL INSERT statements
npx tsx src/cli.ts generate -s schemas/users-schema.json -c 1000 -f sql -t users -o users.sql

# Validate a schema file
npx tsx src/cli.ts validate -s schemas/users-schema.json
```

## CLI Usage

The Mock Data Generator provides a powerful command-line interface for generating data from JSON schemas.

### Commands

#### Generate Command

```bash
npx tsx src/cli.ts generate [options]
```

**Options:**
- `-s, --schema <file>` - JSON schema file path (required)
- `-c, --count <number>` - Number of records to generate (default: 10)
- `-o, --output <file>` - Output file path (optional, prints to stdout if not specified)
- `-f, --format <format>` - Output format: json, csv, tsv, sql (default: json)
- `-t, --table <table>` - Table name for SQL output (default: generated_data)
- `-b, --batch <size>` - Batch size for SQL inserts (default: 1000)
- `--seed <number>` - Seed for reproducible results
- `--locale <locale>` - Locale for faker data (default: en)

**Examples:**
```bash
# Basic JSON generation
npx tsx src/cli.ts generate -s users-schema.json -c 50 -o users.json

# SQL generation with custom table name and batch size
npx tsx src/cli.ts generate -s users-schema.json -c 10000 -f sql -t app_users -b 500 -o users.sql

# Reproducible results with seed
npx tsx src/cli.ts generate -s users-schema.json -c 100 --seed 12345 -o users.json
```

#### Validate Command

```bash
npx tsx src/cli.ts validate -s <schema-file>
```

Validates the structure and syntax of a JSON schema file.

## Programmatic Usage

### Basic Example

```javascript
import { MockDataGenerator } from './src/MockDataGenerator';

const generator = new MockDataGenerator({
  locale: 'en',
  seed: 12345,      // Optional: for reproducible results
  count: 100        // Default count
});

const schema = {
  type: "object",
  properties: {
    id: { type: "integer", faker: "number.int" },
    name: { type: "string", faker: "person.fullName" },
    email: { type: "string", faker: "internet.email" }
  }
};

// Generate data
const data = generator.generateFromSchema(schema, 50);

// Export to different formats
const jsonOutput = generator.exportToFormat(data, 'json');
const sqlOutput = generator.exportToFormat(data, 'sql', 'users', 1000);
```

### Related Schemas with Foreign Keys

```javascript
// Generate related data with foreign key relationships
const results = generator.generateRelatedSchemas([
  { schema: usersSchema, count: 100 },
  { schema: userContactsSchema, count: 0 }  // count determined by dependentRecords config
]);
```

## Schema Configuration

### Basic Schema Structure

```json
{
  "type": "object",
  "schemaName": "users",
  "properties": {
    "id": {
      "type": "integer",
      "sequential": {
        "start": 1000,
        "step": 1,
        "counterName": "user_id"
      }
    },
    "name": {
      "type": "string",
      "faker": "person.fullName"
    },
    "email": {
      "type": "string",
      "format": "email"
    },
    "active": {
      "type": "boolean",
      "faker": "datatype.boolean"
    }
  },
  "required": ["id", "name", "email"]
}
```

### Common Data Types and Patterns

#### Basic Types
```json
{
  "stringField": { "type": "string", "faker": "lorem.word" },
  "numberField": { "type": "number", "faker": "number.int" },
  "booleanField": { "type": "boolean", "faker": "datatype.boolean" },
  "dateField": { "type": "string", "format": "date", "faker": "date.recent" }
}
```

#### Nested Objects
```json
{
  "address": {
    "type": "object",
    "properties": {
      "street": { "type": "string", "faker": "location.streetAddress" },
      "city": { "type": "string", "faker": "location.city" },
      "zipCode": { "type": "string", "faker": "location.zipCode" }
    }
  }
}
```

#### Arrays
```json
{
  "tags": {
    "type": "array",
    "items": { "type": "string", "faker": "lorem.word" },
    "minItems": 1,
    "maxItems": 5
  }
}
```

#### Templates and Transformations
```json
{
  "username": {
    "type": "string",
    "template": "{{first_name}}.{{last_name}}",
    "transform": "lowercase"
  },
  "full_name": {
    "type": "string",
    "template": "{{first_name}} {{last_name}}"
  }
}
```

### Available Faker Methods

Common faker methods for realistic data generation:

**Personal Information:**
- `person.firstName`, `person.lastName`, `person.fullName`
- `person.gender`, `person.jobTitle`, `person.prefix`, `person.suffix`

**Internet & Communication:**
- `internet.email`, `internet.userName`, `internet.url`, `internet.password`
- `phone.number`

**Location:**
- `location.city`, `location.state`, `location.country`, `location.zipCode`
- `location.streetAddress`, `location.latitude`, `location.longitude`

**Commerce:**
- `commerce.productName`, `commerce.price`, `commerce.department`
- `finance.creditCardNumber`, `finance.amount`

**Company:**
- `company.name`, `company.buzzNoun`, `company.catchPhrase`

**Date & Time:**
- `date.recent`, `date.past`, `date.future`, `date.birthdate`

**Utilities:**
- `number.int`, `number.float`, `datatype.boolean`, `datatype.uuid`
- `lorem.word`, `lorem.sentence`, `lorem.paragraph`

For complete list: https://fakerjs.dev/api/

## Advanced Features

### 1. Sequential ID Generation

Generate sequential numbers for realistic ID fields:

```json
{
  "id": {
    "type": "integer",
    "sequential": {
      "start": 1000,
      "step": 1,
      "counterName": "user_id"
    }
  }
}
```

**Configuration Options:**
- `start`: Starting number (default: 1)
- `step`: Increment step (default: 1)
- `counterName`: Unique counter name for multiple sequences

### 2. Foreign Key Relationships

Link child records to parent records with referential integrity:

#### Parent Schema (users-schema.json)
```json
{
  "type": "object",
  "schemaName": "users",
  "properties": {
    "id": {
      "type": "integer",
      "sequential": { "start": 1000, "step": 1 }
    },
    "name": { "type": "string", "faker": "person.fullName" }
  }
}
```

#### Child Schema (user-contacts-schema.json)
```json
{
  "type": "object",
  "schemaName": "user_contacts",
  "dependentRecords": {
    "parentSchema": "users",
    "minPerParent": 1,
    "maxPerParent": 4
  },
  "properties": {
    "id": {
      "type": "integer",
      "sequential": { "start": 1, "step": 1 }
    },
    "user_id": {
      "type": "integer",
      "foreignKey": {
        "schema": "users",
        "field": "id"
      }
    },
    "contact_type": {
      "type": "string",
      "enum": ["email", "phone", "address"]
    }
  }
}
```

### 3. Multiple Parent Dependencies

Handle complex relationships with multiple parent schemas:

```json
{
  "dependentRecords": {
    "parentSchemas": [
      {
        "schema": "teams",
        "minPerParent": 3,
        "maxPerParent": 8
      },
      {
        "schema": "users",
        "oneToOne": true
      }
    ]
  },
  "uniqueConstraints": [
    {
      "columns": ["team_id", "user_id"],
      "name": "unique_team_user"
    }
  ]
}
```

### 4. Percentage-Based Enum Distribution

Control the distribution of enum values:

```json
{
  "status": {
    "type": "string",
    "enum": ["active", "inactive", "pending"],
    "percentage": {
      "active": 70,
      "inactive": 20,
      "pending": 10
    }
  },
  "is_premium": {
    "type": "boolean",
    "percentage": {
      "true": 15,
      "false": 85
    }
  }
}
```

### 5. Unique Constraints

Prevent duplicate combinations across multiple columns:

```json
{
  "uniqueConstraints": [
    {
      "columns": ["team_id", "user_id"],
      "name": "unique_team_user_combination"
    }
  ]
}
```

## SQL Generation

The generator can create MySQL-compatible SQL statements with CREATE TABLE and INSERT statements.

### Basic SQL Generation

```bash
npx tsx src/cli.ts generate -s schemas/users-schema.json -c 1000 -f sql -t users -o users.sql
```

### Generated SQL Structure

```sql
-- MySQL bulk insert statements for table: users
-- Generated on: 2025-07-12T03:04:07.120Z
-- Total records: 1000

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100),
  `email` VARCHAR(255) UNIQUE,
  `created_at` DATETIME,
  `active` TINYINT(1)
);

-- Batch 1 of 1
INSERT INTO `users` (`id`, `name`, `email`, `created_at`, `active`) VALUES
(1000, 'John Doe', 'john.doe@example.com', '2025-07-11 15:30:45', 1),
(1001, 'Jane Smith', 'jane.smith@example.com', '2025-07-11 14:22:33', 0),
-- ... more records
;
```

### Data Type Mapping

| JSON Schema Type | MySQL Type | Notes |
|------------------|------------|-------|
| integer | INT | AUTO_INCREMENT PRIMARY KEY if column is "id" |
| number | DECIMAL(10,2) | For floating-point numbers |
| string | VARCHAR(100/255) or TEXT | Based on content length |
| boolean | TINYINT(1) | MySQL standard for boolean |
| string (format: email) | VARCHAR(255) UNIQUE | |
| string (format: date-time) | DATETIME | |
| string (format: date) | DATE | |

### Batch Configuration

For large datasets, use batching for better performance:

```bash
# Generate 50,000 records in batches of 2,000
npx tsx src/cli.ts generate -s schema.json -c 50000 -f sql -t users -b 2000 -o users.sql
```

**Batch Size Guidelines:**
- **< 100 records**: 25-50 batch size
- **100-1000 records**: 100-500 batch size  
- **1000-10000 records**: 500-1000 batch size
- **10000+ records**: 1000-5000 batch size

## Examples

### Running Examples

The project includes several example scripts demonstrating different features:

```bash
# Complex relationships demo
node tests/complex-relationships-demo.js

# Multi-schema SQL generation
node tests/multi-schema-sql-demo.js

# Sequential ID examples
npx tsx tests/sequential-id-example.ts

# Percentage distribution testing
node tests/debug-percentage.js
```

### Example Configurations

#### User Management System
```javascript
// Generate users, teams, and user-team relationships
const configs = [
  { schema: usersSchema, count: 1000 },
  { schema: teamsSchema, count: 50 },
  { schema: teamUsersSchema, count: 0 }  // Auto-generated based on relationships
];

const results = generator.generateRelatedSchemas(configs);
```

#### E-commerce System
```javascript
// Generate products, categories, orders
const ecommerceConfigs = [
  { schema: categoriesSchema, count: 20 },
  { schema: productsSchema, count: 500 },
  { schema: ordersSchema, count: 1000 },
  { schema: orderItemsSchema, count: 0 }  // Dependent on orders
];
```

## Testing & Development

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test script
node tests/test-users-schema.js
npx tsx tests/sequential-id-example.ts
```

### Available Test Scripts

**Output-generating tests** (create files in subdirectories):
- `complex-relationships-demo.js` → `tests/complex-relationships-demo/`
- `multi-schema-sql-demo.js` → `tests/multi-schema-sql-demo/`
- `related-schemas-demo.js` → `tests/related-schemas-demo/`
- `sql-demo.js` → `tests/sql-demo/`

**Console-only tests**:
- `debug-percentage.js` - Tests percentage distributions
- `sequential-id-example.js/ts` - Sequential ID examples
- `test-users-schema.js` - User schema with percentages
- `test-users.js` - Basic user generation

### Building the Project

```bash
npm run build      # Compile TypeScript
npm run clean      # Clean dist directory
npm run lint       # Run ESLint
npm run format     # Format code with Prettier
```

### Error Handling

The generator includes comprehensive error handling for:
- Missing or invalid schema files
- Invalid schema format
- Foreign key reference errors
- Unique constraint violations
- Generation failures

Check console output for detailed error messages and debugging information.

## Configuration Examples

### Development vs Production

```javascript
// Development configuration
const devConfig = {
  locale: 'en',
  seed: 12345,      // Reproducible results
  count: 50         // Small datasets
};

// Production configuration  
const prodConfig = {
  locale: 'en',
  count: 10000      // Large datasets
  // No seed for random data
};
```

### Multi-Environment Schema Loading

```javascript
const schemaPath = process.env.NODE_ENV === 'production' 
  ? 'schemas/prod-users-schema.json'
  : 'schemas/dev-users-schema.json';

const generator = new MockDataGenerator(config);
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
```

## Output Files

Generated files are organized by type and purpose:

**JSON Output:**
- `generated-{schema-name}.json` - JSON data files
- `generated-{schema-name}-{variant}.json` - Variant-specific files

**SQL Output:**
- `generated-{schema-name}.sql` - SQL files with CREATE TABLE and INSERT statements
- Batch information included in SQL comments

**Test Output:**
- `tests/{script-name}/` - Subdirectories for test outputs
- Console logs for non-file-generating tests

For the most up-to-date examples and advanced usage patterns, refer to the test scripts in the `tests/` directory.
