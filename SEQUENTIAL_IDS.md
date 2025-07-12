# Sequential ID Generation

This document explains how to use sequential number generation for ID fields in your JSON schemas.

## Overview

The mock data generator now supports generating sequential numbers starting from a specified value, which is perfect for creating realistic ID fields that increment predictably.

## Schema Configuration

To use sequential number generation, add a `sequential` property to your schema field:

```json
{
  "type": "integer",
  "sequential": {
    "start": 1000,
    "step": 1,
    "counterName": "user_id"
  }
}
```

### Sequential Configuration Options

- **`start`** (optional, default: 1): The starting number for the sequence
- **`step`** (optional, default: 1): The increment step between each generated number
- **`counterName`** (optional, default: "default"): A unique name for this counter to allow multiple independent sequences

## Examples

### Basic Sequential IDs

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "integer",
      "sequential": {
        "start": 1,
        "step": 1
      }
    },
    "name": {
      "type": "string",
      "faker": "person.fullName"
    }
  }
}
```

This will generate:
```json
[
  { "id": 1, "name": "John Doe" },
  { "id": 2, "name": "Jane Smith" },
  { "id": 3, "name": "Bob Johnson" }
]
```

### Custom Starting Value and Step

```json
{
  "type": "object",
  "properties": {
    "product_id": {
      "type": "integer",
      "sequential": {
        "start": 5000,
        "step": 10,
        "counterName": "products"
      }
    },
    "name": {
      "type": "string",
      "faker": "commerce.productName"
    }
  }
}
```

This will generate:
```json
[
  { "product_id": 5000, "name": "Awesome Widget" },
  { "product_id": 5010, "name": "Super Gadget" },
  { "product_id": 5020, "name": "Cool Device" }
]
```

### Multiple Sequential Counters

```json
{
  "type": "object",
  "properties": {
    "user_id": {
      "type": "integer",
      "sequential": {
        "start": 1,
        "step": 1,
        "counterName": "users"
      }
    },
    "order_id": {
      "type": "integer",
      "sequential": {
        "start": 100,
        "step": 5,
        "counterName": "orders"
      }
    },
    "name": {
      "type": "string",
      "faker": "person.fullName"
    }
  }
}
```

This will generate:
```json
[
  { "user_id": 1, "order_id": 100, "name": "John Doe" },
  { "user_id": 2, "order_id": 105, "name": "Jane Smith" },
  { "user_id": 3, "order_id": 110, "name": "Bob Johnson" }
]
```

## Usage with MockDataGenerator

```typescript
import { MockDataGenerator } from './MockDataGenerator';

const generator = new MockDataGenerator();

// Your schema with sequential IDs
const schema = {
  type: 'object',
  properties: {
    id: {
      type: 'integer',
      sequential: {
        start: 1000,
        step: 1,
        counterName: 'user_id'
      }
    },
    name: {
      type: 'string',
      faker: 'person.fullName'
    }
  }
};

// Generate 5 records
const data = generator.generateFromSchema(schema, 5);
console.log(data);
```

## Initializing Counters

You can also initialize sequential counters when creating the generator:

```typescript
const generator = new MockDataGenerator({
  sequentialCounters: {
    'user_id': 5000,  // Start user IDs from 5000
    'order_id': 1000  // Start order IDs from 1000
  }
});
```

## Notes

- Sequential counters maintain their state across multiple calls to `generateFromSchema`
- Each counter name maintains its own independent sequence
- If no `counterName` is specified, a default counter is used
- Sequential generation takes precedence over `faker` properties when both are present
- The generated numbers are always integers, regardless of the `step` value

## Migrating Existing Schemas

To convert an existing random ID field to sequential:

**Before:**
```json
"id": {
  "type": "integer",
  "minimum": 1,
  "faker": "number.int"
}
```

**After:**
```json
"id": {
  "type": "integer",
  "sequential": {
    "start": 1000,
    "step": 1,
    "counterName": "user_id"
  }
}
```

This provides predictable, incrementing IDs that are much more realistic for testing and development purposes.
