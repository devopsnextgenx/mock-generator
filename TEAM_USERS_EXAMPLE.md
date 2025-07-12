# Example: Team-Users Schema with Multiple Parent Dependencies

This example demonstrates how to configure a schema that depends on multiple parent schemas with unique constraints.

## Updated Schema Configuration

```json
{
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
    "id": {
      "type": "integer",
      "faker": "number.int"
    },
    "user_id": {
      "type": "integer",
      "foreignKey": {
        "schema": "users",
        "field": "id"
      }
    },
    "team_id": {
      "type": "integer",
      "foreignKey": {
        "schema": "teams",
        "field": "id"
      }
    },
    "created_at": {
      "type": "string",
      "format": "date-time",
      "faker": "date.recent"
    },
    "updated_at": {
      "type": "string",
      "format": "date-time",
      "faker": "date.recent"
    },
    "deleted_at": {
      "type": "string",
      "format": "date-time",
      "faker": "date.recent"
    },
    "is_deleted": {
      "type": "integer",
      "enum": [0, 1],
      "default": 0
    }
  },
  "required": ["id", "user_id", "team_id", "created_at", "is_deleted"]
}
```

## What This Configuration Does

1. **Multiple Parent Dependencies**: 
   - Depends on both `teams` and `users` schemas
   - Teams can have 3-8 members each
   - Each user gets exactly one team assignment (`oneToOne: true`)

2. **Unique Constraints**:
   - Prevents duplicate `(team_id, user_id)` combinations
   - Generates a SQL unique constraint in the output

3. **Foreign Key Relationships**:
   - `user_id` references `users.id`
   - `team_id` references `teams.id`
   - Both are automatically populated during generation

## Generated SQL Output

The generator now produces SQL with unique constraints:

```sql
CREATE TABLE IF NOT EXISTS `team_users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT,
  `team_id` INT,
  `created_at` VARCHAR(255),
  `updated_at` DATETIME,
  `deleted_at` VARCHAR(255),
  `is_deleted` INT,
  UNIQUE KEY `unique_team_user` (`team_id`, `user_id`)
);
```

## Key Benefits

- **Data Integrity**: Ensures no duplicate team-user assignments
- **Realistic Relationships**: Each user belongs to exactly one team
- **Flexible Team Sizes**: Teams can have varying numbers of members
- **Database Ready**: Generated SQL includes proper constraints
