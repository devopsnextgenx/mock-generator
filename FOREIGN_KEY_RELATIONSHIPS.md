# Foreign Key Relationships & Dependent Records

This guide explains how to use the MockDataGenerator to create related data with foreign key constraints and dependent record generation.

## Overview

The MockDataGenerator now supports:
- **Foreign Key References**: Link child records to parent records using actual generated values
- **Dependent Records**: Automatically generate child records based on parent records with configurable min/max counts per parent
- **Relationship Validation**: Ensure referential integrity between related schemas
- **Sequential Generation**: Generate parent schemas first, then dependent schemas

## Schema Configuration

### Parent Schema (e.g., users-schema.json)

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
    "user_name": {
      "type": "string",
      "template": "{{first_name}}.{{last_name}}",
      "transform": "lowercase"
    },
    "first_name": {
      "type": "string",
      "faker": "person.firstName"
    },
    "last_name": {
      "type": "string",
      "faker": "person.lastName"
    }
  },
  "required": ["id", "user_name", "first_name", "last_name"]
}
```

### Child Schema with Foreign Key (e.g., user-contacts-schema.json)

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
      "sequential": {
        "start": 1,
        "step": 1,
        "counterName": "user_contact_id"
      }
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
      "enum": ["email", "phone", "address", "emergency"]
    },
    "contact_value": {
      "type": "string",
      "template": "{{contact_type_value}}"
    }
  },
  "required": ["id", "user_id", "contact_type", "contact_value"]
}
```

## Key Features

### 1. Schema Name (`schemaName`)
- Required for schemas that participate in relationships
- Used to identify and store generated data for reference
- Should be unique across all schemas

### 2. Dependent Records (`dependentRecords`)
- `parentSchema`: Name of the parent schema to reference
- `minPerParent`: Minimum number of child records per parent (default: 0)
- `maxPerParent`: Maximum number of child records per parent (default: 3)

### 3. Foreign Key References (`foreignKey`)
- `schema`: Name of the referenced schema
- `field`: Field name in the referenced schema to get values from
- Automatically populated with valid parent record values

### 4. Conditional Templates
Special template handling for dynamic value generation:
- `{{contact_type_value}}`: Generates appropriate values based on contact_type
  - `email` → Email address
  - `phone` → Phone number
  - `address` → Full address
  - `emergency` → Phone number

## Usage Examples

### Basic Related Schema Generation

```typescript
import { MockDataGenerator } from './MockDataGenerator';
import usersSchema from './schemas/users-schema.json';
import userContactsSchema from './schemas/user-contacts-schema.json';

const generator = new MockDataGenerator({
  seed: 12345 // For reproducible results
});

// Generate related data
const schemas = {
  users: usersSchema,
  user_contacts: userContactsSchema
};

const counts = {
  users: 10,        // Generate 10 users
  user_contacts: 0  // Auto-generated based on min/max per parent
};

const results = generator.generateRelatedSchemas(schemas, counts);

console.log('Users:', results.users);
console.log('User Contacts:', results.user_contacts);
```

### Advanced Configuration

```typescript
// Configure with custom min/max per parent
const userContactsSchema = {
  // ... other properties
  "dependentRecords": {
    "parentSchema": "users",
    "minPerParent": 2, // Each user must have at least 2 contacts
    "maxPerParent": 6  // Each user can have at most 6 contacts
  }
};
```

### Multiple Foreign Keys

```typescript
// Example: Order items referencing both orders and products
const orderItemsSchema = {
  "type": "object",
  "schemaName": "order_items",
  "dependentRecords": {
    "parentSchema": "orders",
    "minPerParent": 1,
    "maxPerParent": 5
  },
  "properties": {
    "id": {
      "type": "integer",
      "sequential": { "start": 1, "step": 1 }
    },
    "order_id": {
      "type": "integer",
      "foreignKey": {
        "schema": "orders",
        "field": "id"
      }
    },
    "product_id": {
      "type": "integer",
      "foreignKey": {
        "schema": "products",
        "field": "id"
      }
    },
    "quantity": {
      "type": "integer",
      "minimum": 1,
      "maximum": 10
    }
  }
};
```

## Relationship Distribution

The generator ensures realistic data distribution:
- Each parent record gets a random number of child records within the specified range
- Foreign key references are always valid (referential integrity maintained)
- Sequential IDs are properly managed across related schemas

## Generated Data Verification

```typescript
// Verify relationships
const userIds = results.users.map(user => user.id);
const contactUserIds = results.user_contacts.map(contact => contact.user_id);
const validReferences = contactUserIds.every(userId => userIds.includes(userId));

console.log('All foreign key references valid:', validReferences);

// Count distribution
const contactsPerUser = {};
results.user_contacts.forEach(contact => {
  contactsPerUser[contact.user_id] = (contactsPerUser[contact.user_id] || 0) + 1;
});

console.log('Contacts per user:', contactsPerUser);
```

## Best Practices

1. **Generate Parent Schemas First**: Always ensure parent data exists before generating dependent data
2. **Use Sequential IDs**: Use sequential ID generation for consistent primary keys
3. **Set Realistic Ranges**: Configure appropriate min/max values for dependent records
4. **Validate Relationships**: Use the verification methods to ensure data integrity
5. **Export for Review**: Export generated data to JSON/SQL for manual inspection

## Error Handling

The generator will throw errors if:
- Referenced parent schema data doesn't exist
- Foreign key field doesn't exist in parent records
- Circular dependencies are detected

Always generate schemas in dependency order (parents before children).
