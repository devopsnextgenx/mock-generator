const { MockDataGenerator } = require('../dist/MockDataGenerator');
const fs = require('fs');
const path = require('path');

/**
 * Demo script to test foreign key relationships between schemas
 */
async function runRelatedSchemasDemo() {
  console.log('=== Related Schemas Demo ===\n');

  try {
    // Load schemas
    const usersSchemaPath = path.join(__dirname, '..', 'schemas', 'users-schema.json');
    const userContactsSchemaPath = path.join(__dirname, '..', 'schemas', 'user-contacts-schema.json');
    
    const usersSchema = JSON.parse(fs.readFileSync(usersSchemaPath, 'utf8'));
    const userContactsSchema = JSON.parse(fs.readFileSync(userContactsSchemaPath, 'utf8'));

    // Create generator
    const generator = new MockDataGenerator({
      seed: 12345, // For reproducible results
    });

    console.log('1. Generating related schemas with foreign key relationships...\n');

    // Generate related data
    const schemas = {
      users: usersSchema,
      user_contacts: userContactsSchema
    };

    const counts = {
      users: 5,        // Generate 5 users
      user_contacts: 0 // Will be automatically generated based on min/max per parent
    };

    const results = generator.generateRelatedSchemas(schemas, counts);

    // Display results
    console.log('Generated Users:');
    console.log(JSON.stringify(results.users, null, 2));
    console.log('\n' + '='.repeat(50) + '\n');

    console.log('Generated User Contacts:');
    console.log(JSON.stringify(results.user_contacts, null, 2));
    console.log('\n' + '='.repeat(50) + '\n');

    // Verify relationships
    console.log('2. Verifying foreign key relationships...\n');
    
    const userIds = results.users.map(user => user.id);
    const contactUserIds = results.user_contacts.map(contact => contact.user_id);
    const validReferences = contactUserIds.every(userId => userIds.includes(userId));
    
    console.log(`User IDs: [${userIds.join(', ')}]`);
    console.log(`Contact User IDs: [${contactUserIds.join(', ')}]`);
    console.log(`All foreign key references valid: ${validReferences ? '✅' : '❌'}`);

    // Count contacts per user
    console.log('\n3. Contacts per user distribution:');
    const contactsPerUser = {};
    results.user_contacts.forEach(contact => {
      contactsPerUser[contact.user_id] = (contactsPerUser[contact.user_id] || 0) + 1;
    });

    userIds.forEach(userId => {
      const contactCount = contactsPerUser[userId] || 0;
      console.log(`User ${userId}: ${contactCount} contact(s)`);
    });

    // Export to files for inspection
    console.log('\n4. Exporting generated data...');
    
    // Create output directory for this test
    const outputDir = path.join(__dirname, 'related-schemas-demo');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(outputDir, 'generated-users-related.json'), 
      JSON.stringify(results.users, null, 2)
    );
    
    fs.writeFileSync(
      path.join(outputDir, 'generated-user-contacts-related.json'), 
      JSON.stringify(results.user_contacts, null, 2)
    );

    // Generate SQL exports
    const usersSql = generator.exportToFormat(results.users, 'sql', 'users');
    const contactsSql = generator.exportToFormat(results.user_contacts, 'sql', 'user_contacts');
    
    fs.writeFileSync(
      path.join(outputDir, 'generated-users-related.sql'), 
      usersSql
    );
    
    fs.writeFileSync(
      path.join(outputDir, 'generated-user-contacts-related.sql'), 
      contactsSql
    );

    console.log('✅ Files exported to: tests/related-schemas-demo/');
    console.log('  - generated-users-related.json');
    console.log('  - generated-user-contacts-related.json');
    console.log('  - generated-users-related.sql');
    console.log('  - generated-user-contacts-related.sql');

  } catch (error) {
    console.error('❌ Error running demo:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
  }
}

// Run the demo
runRelatedSchemasDemo();
