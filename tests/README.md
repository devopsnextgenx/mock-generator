# Tests Directory

This directory contains test scripts and examples for the Mock Data Generator.

## Test Scripts

### Scripts that Generate Output Files

The following test scripts generate data files in their own named subdirectories to avoid confusion:

- **`complex-relationships-demo.js`** → `tests/complex-relationships-demo/`
  - Demonstrates complex multi-table relationships (users, user-contacts, teams, schools)
  - Generates JSON and SQL files with "-complex" suffix

- **`multi-schema-sql-demo.js`** → `tests/multi-schema-sql-demo/`
  - Shows SQL generation for multiple schemas with different configurations
  - Generates SQL files with "multi-" prefix

- **`related-schemas-demo.js`** → `tests/related-schemas-demo/`
  - Demonstrates foreign key relationships between users and user-contacts
  - Generates JSON and SQL files with "-related" suffix

- **`sql-demo.js`** → `tests/sql-demo/`
  - CLI-based SQL generation examples
  - Generates demo SQL files for users and teams

### Console-Only Test Scripts

These scripts only output to console and don't create files:

- `debug-percentage.js` - Tests percentage-based value generation
- `sequential-id-example.js` - Demonstrates sequential ID generation (ES modules)
- `sequential-id-example.ts` - TypeScript version of sequential ID example
- `test-sequential.ts` - Simple sequential ID test
- `test-users-schema.js` - Tests users schema with percentage distributions
- `test-users.js` - Basic users generation test

## Running Tests

To run any test script from the project root directory:

```bash
# For JavaScript files
node tests/script-name.js

# For TypeScript files (requires tsx)
npx tsx tests/script-name.ts
```

**Note:** All test scripts are compatible with bash shell and will create Unix-style paths in output messages.

## Output Organization

Each test script that generates files creates its own subdirectory under `tests/` with the same name as the script (minus the file extension). This prevents output files from different tests getting mixed up and makes it easy to identify which test generated which files.

Generated directories are automatically ignored by Git (see `.gitignore`).
