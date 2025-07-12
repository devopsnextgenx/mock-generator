# Modulo Feature Documentation

The Mock Data Generator now supports generating integer values that follow specific modulo patterns. This is useful for creating realistic data where amounts or quantities need to be multiples of specific numbers.

## Feature Overview

The `modulo` property allows you to generate integers that satisfy the pattern: `(generated_value % divisor) = remainder`

## Schema Property Configuration

Add the `modulo` property to any integer field in your JSON schema:

```json
{
  "type": "integer",
  "minimum": 100,
  "maximum": 10000,
  "modulo": {
    "divisor": 100,      // Required: The number that the value should be divisible by
    "remainder": 0       // Optional: The remainder (default: 0)
  }
}
```

## Use Cases

### 1. Multiples Only (remainder = 0)

Generate amounts that are multiples of 100 (e.g., $100, $200, $300):

```json
{
  "amount": {
    "type": "integer",
    "minimum": 100,
    "maximum": 10000,
    "modulo": {
      "divisor": 100
    }
  }
}
```

### 2. Specific Remainder Pattern

Generate numbers that have a specific remainder when divided by a number:

```json
{
  "price": {
    "type": "integer",
    "minimum": 1,
    "maximum": 1000,
    "modulo": {
      "divisor": 10,
      "remainder": 9    // Generates prices ending in 9 (19, 29, 39, etc.)
    }
  }
}
```

### 3. Working with Faker

The modulo feature also works with faker methods:

```json
{
  "quantity": {
    "type": "integer",
    "minimum": 5,
    "maximum": 500,
    "faker": "number.int",
    "modulo": {
      "divisor": 5      // Quantities in multiples of 5
    }
  }
}
```

## Real-World Examples

### Financial Amounts
```json
{
  "donation_amount": {
    "type": "integer",
    "minimum": 100,
    "maximum": 100000,
    "modulo": {
      "divisor": 100    // Donations in $100 increments
    }
  }
}
```

### Inventory Quantities
```json
{
  "stock_quantity": {
    "type": "integer",
    "minimum": 12,
    "maximum": 1200,
    "modulo": {
      "divisor": 12     // Stock in dozens
    }
  }
}
```

### Pricing Strategies
```json
{
  "retail_price": {
    "type": "integer",
    "minimum": 10,
    "maximum": 1000,
    "modulo": {
      "divisor": 10,
      "remainder": 9    // Prices ending in 9 (psychological pricing)
    }
  }
}
```

### Time Intervals
```json
{
  "duration_minutes": {
    "type": "integer",
    "minimum": 15,
    "maximum": 480,
    "modulo": {
      "divisor": 15     // Durations in 15-minute intervals
    }
  }
}
```

## Error Handling

- If `divisor` is ≤ 0, an error will be thrown
- If `remainder` is ≥ `divisor` or < 0, an error will be thrown
- If no valid values exist in the specified range that satisfy the modulo pattern, a warning is logged and regular generation is used as fallback

## Algorithm

The generator:
1. Calculates the valid range of multipliers (k) where `k * divisor + remainder` falls within [min, max]
2. Randomly selects a multiplier from this range
3. Computes the final value as `k * divisor + remainder`
4. Ensures the result is within the specified bounds

## Example Output

Using the modulo feature for sponsor donations:

```javascript
// Schema configuration
{
  "amount": {
    "type": "integer",
    "minimum": 100,
    "maximum": 100000,
    "modulo": {
      "divisor": 100
    }
  }
}

// Generated data
[
  { "amount": 5100 },   // 5100 % 100 = 0
  { "amount": 12700 },  // 12700 % 100 = 0
  { "amount": 89900 },  // 89900 % 100 = 0
  { "amount": 3400 }    // 3400 % 100 = 0
]
```

This feature ensures your mock data follows realistic patterns while maintaining randomness within those constraints.
