# SQL Generation Feature

This document describes the SQL generation functionality added to the Mock Data Generator tool.

## Overview

The mock-data-generator now supports generating MySQL bulk insert statements directly from JSON schema files. This feature allows you to:

- Generate CREATE TABLE statements with appropriate column types
- Create bulk INSERT statements for efficient data loading
- Split large datasets into batches for better performance
- Handle various data types including dates, strings, numbers, and booleans

## Usage

### Basic SQL Generation

```bash
npx tsx src/cli.ts generate -s schema.json -c 100 -f sql -t table_name -o output.sql
```

### Parameters

- `-s, --schema <file>`: JSON schema file path (required)
- `-c, --count <number>`: Number of records to generate (default: 10)
- `-f, --format <format>`: Output format - use `sql` for SQL generation
- `-t, --table <table>`: Table name for SQL output (default: generated_data)
- `-b, --batch <size>`: Batch size for SQL inserts (default: 1000)
- `-o, --output <file>`: Output file path

## Examples

### Example 1: Simple User Table

**Schema (users-schema.json):**
```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "integer",
      "sequential": { "start": 1000, "step": 1 }
    },
    "user_name": {
      "type": "string",
      "template": "{{first_name}}.{{last_name}}",
      "transform": "lowercase"
    },
    "first_name": { "type": "string", "faker": "person.firstName" },
    "last_name": { "type": "string", "faker": "person.lastName" },
    "email": { "type": "string", "format": "email" },
    "created_at": { "type": "string", "format": "date-time", "faker": "date.recent" },
    "active": { "type": "boolean" }
  }
}
```

**Command:**
```bash
npx tsx src/cli.ts generate -s users-schema.json -c 5 -f sql -t users -o users.sql
```

**Generated Output:**
```sql
-- MySQL bulk insert statements for table: users
-- Generated on: 2025-07-12T02:57:19.371Z
-- Total records: 5

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_name` VARCHAR(100),
  `first_name` VARCHAR(100),
  `last_name` VARCHAR(100),
  `email` VARCHAR(255) UNIQUE,
  `created_at` DATETIME,
  `active` TINYINT(1)
);

INSERT INTO `users` (`id`, `user_name`, `first_name`, `last_name`, `email`, `created_at`, `active`) VALUES
(1000, 'john.doe', 'John', 'Doe', 'john.doe@example.com', '2025-07-11 15:30:45', 1),
(1001, 'jane.smith', 'Jane', 'Smith', 'jane.smith@example.com', '2025-07-11 14:22:33', 0),
(1002, 'bob.johnson', 'Bob', 'Johnson', 'bob.johnson@example.com', '2025-07-11 16:45:12', 1),
(1003, 'alice.brown', 'Alice', 'Brown', 'alice.brown@example.com', '2025-07-11 13:15:28', 1),
(1004, 'charlie.wilson', 'Charlie', 'Wilson', 'charlie.wilson@example.com', '2025-07-11 17:05:41', 0)
;
```

### Example 2: Batched Inserts

For large datasets, you can split the inserts into smaller batches:

```bash
npx tsx src/cli.ts generate -s users-schema.json -c 25 -f sql -t users -b 10 -o users-batched.sql
```

This will generate 3 separate INSERT statements:
- Batch 1: Records 1-10
- Batch 2: Records 11-20  
- Batch 3: Records 21-25

## Data Type Mapping

The tool automatically maps JSON schema types to appropriate MySQL column types:

| JSON Schema Type | MySQL Type | Notes |
|------------------|------------|-------|
| integer | INT | Auto-detected as PRIMARY KEY if column name is "id" |
| number | DECIMAL(10,2) | For floating-point numbers |
| string | VARCHAR(100/255) or TEXT | Based on estimated content length |
| boolean | TINYINT(1) | MySQL standard for boolean values |
| string (format: email) | VARCHAR(255) UNIQUE | |
| string (format: date-time) | DATETIME | Properly formatted for MySQL |
| string (format: date) | DATE | |
| string (password field) | VARCHAR(255) NOT NULL | Based on column name pattern |

## Column Name Detection

The tool uses intelligent column name detection for better SQL generation:

- **ID fields**: Columns named "id" become `INT AUTO_INCREMENT PRIMARY KEY`
- **Email fields**: Columns containing "email" become `VARCHAR(255) UNIQUE`
- **Password fields**: Columns containing "password" become `VARCHAR(255) NOT NULL`
- **Date/Time fields**: Columns containing "date" or "time" use appropriate temporal types

## Date and Time Handling

The tool properly handles various date formats:

- **JavaScript Date objects**: Converted to MySQL DATETIME format (`YYYY-MM-DD HH:MM:SS`)
- **ISO 8601 strings**: Parsed and formatted appropriately
- **Date-only formats**: Converted to MySQL DATE format (`YYYY-MM-DD`)

## Performance Considerations

### Batch Size

For large datasets, use the `-b` parameter to control batch size:

- **Small batches (100-500)**: Better for memory-constrained environments
- **Medium batches (1000-5000)**: Good balance of performance and memory usage
- **Large batches (10000+)**: Maximum performance but higher memory usage

### File Size Management

For very large datasets, consider:
- Using smaller batch sizes to create multiple smaller INSERT statements
- Splitting output into multiple files manually if needed
- Using MySQL's `LOAD DATA INFILE` for extremely large datasets (consider CSV format instead)

## Best Practices

1. **Schema Design**: Use appropriate faker methods and formats in your JSON schema
2. **Testing**: Generate small samples first to verify table structure
3. **Indexing**: The generated CREATE TABLE includes basic constraints; add indexes separately
4. **Transactions**: Wrap large inserts in transactions for better performance
5. **Error Handling**: Test generated SQL in a development environment first

## Troubleshooting

### Common Issues

1. **Special Characters**: Single quotes in data are automatically escaped
2. **Large Numbers**: Use appropriate min/max values in schema to avoid overflow
3. **Date Formats**: Ensure date fields use proper faker methods or formats
4. **NULL Values**: Handle optional fields appropriately in your schema

### Validation

Always validate generated SQL before running in production:

```bash
# Test the generated SQL
mysql -u username -p database_name < generated_file.sql
```

## Integration Examples

### With Docker

```bash
# Generate SQL file
npx tsx src/cli.ts generate -s schema.json -c 10000 -f sql -t users -b 1000 -o init.sql

# Use in Docker initialization
COPY init.sql /docker-entrypoint-initdb.d/
```

### With CI/CD

```yaml
# GitHub Actions example
- name: Generate test data
  run: |
    npx tsx src/cli.ts generate -s test-schema.json -c 1000 -f sql -t test_users -o test-data.sql
    mysql -h localhost -u root -p${{ secrets.DB_PASSWORD }} testdb < test-data.sql
```

This SQL generation feature makes it easy to create realistic test data for MySQL databases directly from your JSON schemas.
