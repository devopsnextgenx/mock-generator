# Percentage-Based Enum Generation

This example demonstrates how to use percentage-based distribution for enum values in your schemas.

## Usage

When you have an enum field and want to control the distribution of values, you can use the `percentage` property:

```json
{
  "type": "object",
  "properties": {
    "active": {
      "type": "integer",
      "enum": [0, 1],
      "default": 1,
      "percentage": {
        "1": 80,
        "0": 20
      }
    },
    "is_deleted": {
      "type": "integer", 
      "enum": [0, 1],
      "default": 0,
      "percentage": {
        "0": 90,
        "1": 10
      }
    }
  }
}
```

## Key Features

- **Percentage Distribution**: Specify exactly what percentage of records should have each enum value
- **Flexible Configuration**: Works with any enum values (numbers, strings, booleans)
- **Default Override**: When percentage is specified, the `default` value is only used as a fallback
- **Type Safety**: Values are automatically converted to match the enum type

## Example Output

With the above schema, generating 100 records would typically produce:
- ~80 records with `active: 1` and ~20 records with `active: 0`
- ~90 records with `is_deleted: 0` and ~10 records with `is_deleted: 1`

## Important Notes

1. Percentages should add up to 100% for predictable results
2. The generator uses cumulative distribution, so slight variance is normal with small sample sizes
3. String keys in the percentage object will be converted to match the enum type
4. If no percentage configuration is provided, enum values are selected randomly with equal probability
