# Schema Configuration Guide for SQL Generation

This guide explains how to configure the `schema-file-demo.js` script to generate SQL bulk insert statements with customizable batch settings.

## Configuration Structure

Each schema in the `schemaConfigs` array supports the following options:

```javascript
{
  file: 'schema-filename.json',           // Required: Schema file name
  name: 'Display Name',                   // Required: Human-readable name
  count: 1000,                           // Required: Number of records to generate
  sql: {                                 // Optional: SQL generation settings
    enabled: true,                       // Enable/disable SQL generation
    tableName: 'table_name',             // MySQL table name
    batchSize: 500                       // Records per INSERT statement
  }
}
```

## Configuration Examples

### Example 1: Small Dataset with Small Batches
```javascript
{
  file: 'users-schema.json',
  name: 'Users',
  count: 100,
  sql: {
    enabled: true,
    tableName: 'users',
    batchSize: 25    // 4 batches of 25 records each
  }
}
```

### Example 2: Large Dataset with Medium Batches
```javascript
{
  file: 'user-contacts-schema.json',
  name: 'User Contacts',
  count: 50000,
  sql: {
    enabled: true,
    tableName: 'user_contacts',
    batchSize: 2000    // 25 batches of 2000 records each
  }
}
```

### Example 3: JSON Only (No SQL)
```javascript
{
  file: 'teams-schema.json',
  name: 'Teams',
  count: 200
  // No sql object = JSON generation only
}
```

## Complete Multi-Schema Configuration

```javascript
const schemaConfigs = [
  {
    file: 'users-schema.json',
    name: 'Users',
    count: 15000,
    sql: {
      enabled: true,
      tableName: 'users',
      batchSize: 1000    // 15 batches
    }
  },
  {
    file: 'teams-schema.json',
    name: 'Teams',
    count: 100,
    sql: {
      enabled: true,
      tableName: 'teams',
      batchSize: 50      // 2 batches
    }
  },
  {
    file: 'schools-schema.json',
    name: 'Schools',
    count: 250,
    sql: {
      enabled: true,
      tableName: 'schools',
      batchSize: 100     // 3 batches (100, 100, 50)
    }
  },
  {
    file: 'sponsers-schema.json',
    name: 'Sponsors',
    count: 750,
    sql: {
      enabled: true,
      tableName: 'sponsors',
      batchSize: 250     // 3 batches
    }
  },
  {
    file: 'user-contacts-schema.json',
    name: 'User Contacts',
    count: 40000,
    sql: {
      enabled: true,
      tableName: 'user_contacts',
      batchSize: 2000    // 20 batches
    }
  }
];
```

## Batch Size Guidelines

| Dataset Size | Recommended Batch Size | Use Case |
|-------------|----------------------|----------|
| < 100 records | 25-50 | Testing, small datasets |
| 100-1000 records | 100-500 | Medium datasets |
| 1000-10000 records | 500-1000 | Large datasets |
| 10000+ records | 1000-5000 | Very large datasets |

## Performance Considerations

### Memory Usage
- **Smaller batches**: Lower memory usage, more INSERT statements
- **Larger batches**: Higher memory usage, fewer INSERT statements

### Database Performance
- **MySQL recommended**: 1000-5000 records per INSERT for optimal performance
- **Network considerations**: Smaller batches for slow connections
- **Transaction overhead**: Larger batches reduce transaction overhead

### File Size Management
- Large datasets with small batches create more readable SQL files
- Large datasets with large batches create fewer but longer INSERT statements

## Generated Output

For each configured schema, the script generates:

1. **JSON file**: `generated-{name}-data.json`
2. **SQL file**: `generated-{name}-data.sql` (if `sql.enabled = true`)

### SQL File Structure
```sql
-- MySQL bulk insert statements for table: users
-- Generated on: 2025-07-12T03:04:07.120Z
-- Total records: 15000

CREATE TABLE IF NOT EXISTS `users` (
  -- Automatically generated column definitions
);

-- Batch 1 of 15
INSERT INTO `users` (...) VALUES (...);

-- Batch 2 of 15
INSERT INTO `users` (...) VALUES (...);

-- ... additional batches
```

## Usage

1. **Enable SQL generation**: Set `sql.enabled = true`
2. **Set table name**: Configure `sql.tableName`
3. **Choose batch size**: Set `sql.batchSize` based on your needs
4. **Run the script**: `node schema-file-demo.js`

The script will automatically:
- Generate the specified number of records
- Create appropriate MySQL column types
- Split data into the specified batch size
- Save both JSON and SQL files

## Advanced Tips

### Dynamic Configuration
```javascript
// Configure based on environment
const isProduction = process.env.NODE_ENV === 'production';
const batchSize = isProduction ? 5000 : 100;

const config = {
  file: 'users-schema.json',
  name: 'Users',
  count: isProduction ? 100000 : 50,
  sql: {
    enabled: true,
    tableName: 'users',
    batchSize: batchSize
  }
};
```

### Database-Specific Optimization
```javascript
// For different database engines
const configs = {
  mysql: { batchSize: 1000 },
  postgresql: { batchSize: 5000 },
  sqlite: { batchSize: 500 }
};
```
