# Multiple Parent Dependencies and Unique Constraints

This document describes the enhanced features for handling multiple parent dependencies and unique constraints in the Mock Data Generator.

## Features

### 1. Multiple Parent Dependencies

The `dependentRecords` configuration now supports multiple parent schemas through the `parentSchemas` array:

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
  }
}
```

#### Configuration Options

- **schema**: Name of the parent schema
- **minPerParent**: Minimum records to generate per parent (default: 0)
- **maxPerParent**: Maximum records to generate per parent (default: 3)
- **oneToOne**: If true, each parent record gets exactly one child record (default: false)

#### Legacy Support

The old single parent format is still supported:

```json
{
  "dependentRecords": {
    "parentSchema": "teams",
    "minPerParent": 5,
    "maxPerParent": 15
  }
}
```

### 2. One-to-One Relationships

When `oneToOne: true` is specified for a parent schema, the generator ensures that each record in that parent schema gets exactly one child record. This is useful for relationships like "each user belongs to exactly one team".

### 3. Unique Constraints

You can define unique constraints on multiple columns to prevent duplicate combinations:

```json
{
  "uniqueConstraints": [
    {
      "columns": ["team_id", "user_id"],
      "name": "unique_team_user"
    }
  ]
}
```

#### Configuration Options

- **columns**: Array of column names that must be unique together
- **name**: Optional constraint name for documentation

### 4. Generation Logic

When multiple parent schemas are defined:

1. **One-to-One Priority**: If any parent schema has `oneToOne: true`, that schema drives the generation - each record in that schema gets exactly one child record.

2. **Regular Relationships**: For non-one-to-one schemas, the generator creates the specified number of records per parent.

3. **Foreign Key Assignment**: Child records automatically get foreign keys set for all parent schemas - the primary parent (driving the generation) gets its foreign key set directly, while other parents are randomly selected.

4. **Unique Constraint Validation**: The generator attempts up to 100 times to create a record that satisfies all unique constraints before giving up.

## Example Usage

```javascript
const { MockDataGenerator } = require('mock-data-generator');

// Schema with multiple parents and unique constraints
const teamUsersSchema = {
  "type": "object",
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
  ],
  "properties": {
    "id": { "type": "integer", "faker": "number.int" },
    "user_id": {
      "type": "integer",
      "foreignKey": { "schema": "users", "field": "id" }
    },
    "team_id": {
      "type": "integer", 
      "foreignKey": { "schema": "teams", "field": "id" }
    }
  }
};

const generator = new MockDataGenerator();

// Generate related data
const data = generator.generateRelatedSchemas({
  users: usersSchema,
  teams: teamsSchema,
  team_users: teamUsersSchema
});
```

## Benefits

1. **Realistic Data**: Creates more realistic relationships between entities
2. **Data Integrity**: Ensures unique constraints are respected
3. **Flexible Relationships**: Supports both one-to-many and one-to-one relationships
4. **Backward Compatible**: Existing schemas continue to work unchanged

## Error Handling

- **Missing Parent Data**: Throws an error if referenced parent schema data hasn't been generated
- **Circular Dependencies**: Detects and reports circular dependencies in schema relationships
- **Constraint Violations**: Warns when unable to generate unique records after maximum attempts
- **Invalid Configuration**: Validates schema configuration and provides helpful error messages
