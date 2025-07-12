const { MockDataGenerator } = require('../dist/MockDataGenerator');
const fs = require('fs');
const path = require('path');

/**
 * Advanced demo showing complex multi-table relationships
 * Users -> User Contacts (1:many)
 * Users -> Teams (many:many through team_users)
 * Teams -> Schools (many:1)
 */
async function runComplexRelationshipsDemo() {
  console.log('=== Complex Multi-Table Relationships Demo ===\n');

  try {
    // Define schemas inline for this demo
    const usersSchema = {
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
        },
        "email": {
          "type": "string",
          "faker": "internet.email"
        },
        "active": {
          "type": "integer",
          "enum": [0, 1],
          "percentage": {
            "1": 85,
            "0": 15
          }
        }
      },
      "required": ["id", "user_name", "first_name", "last_name", "email", "active"]
    };

    const schoolsSchema = {
      "type": "object",
      "schemaName": "schools",
      "properties": {
        "id": {
          "type": "integer",
          "sequential": {
            "start": 1,
            "step": 1,
            "counterName": "school_id"
          }
        },
        "name": {
          "type": "string",
          "faker": "company.name"
        },
        "address": {
          "type": "string",
          "faker": "location.streetAddress"
        },
        "city": {
          "type": "string",
          "faker": "location.city"
        },
        "state": {
          "type": "string",
          "faker": "location.state"
        },
        "zip_code": {
          "type": "string",
          "faker": "location.zipCode"
        }
      },
      "required": ["id", "name", "address", "city", "state", "zip_code"]
    };

    const teamsSchema = {
      "type": "object",
      "schemaName": "teams",
      "dependentRecords": {
        "parentSchema": "schools",
        "minPerParent": 2,
        "maxPerParent": 5
      },
      "properties": {
        "id": {
          "type": "integer",
          "sequential": {
            "start": 100,
            "step": 1,
            "counterName": "team_id"
          }
        },
        "name": {
          "type": "string",
          "enum": ["Basketball", "Football", "Soccer", "Baseball", "Tennis", "Swimming", "Track", "Volleyball"]
        },
        "school_id": {
          "type": "integer",
          "foreignKey": {
            "schema": "schools",
            "field": "id"
          }
        },
        "season": {
          "type": "string",
          "enum": ["Spring", "Summer", "Fall", "Winter"]
        },
        "is_active": {
          "type": "integer",
          "enum": [0, 1],
          "percentage": {
            "1": 90,
            "0": 10
          }
        }
      },
      "required": ["id", "name", "school_id", "season", "is_active"]
    };

    const userContactsSchema = {
      "type": "object",
      "schemaName": "user_contacts",
      "dependentRecords": {
        "parentSchema": "users",
        "minPerParent": 1,
        "maxPerParent": 3
      },
      "properties": {
        "id": {
          "type": "integer",
          "sequential": {
            "start": 1,
            "step": 1,
            "counterName": "contact_id"
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
          "enum": ["email", "phone", "address", "emergency"],
          "percentage": {
            "email": 40,
            "phone": 35,
            "address": 15,
            "emergency": 10
          }
        },
        "contact_value": {
          "type": "string",
          "template": "{{contact_type_value}}"
        },
        "is_primary": {
          "type": "integer",
          "enum": [0, 1],
          "percentage": {
            "0": 70,
            "1": 30
          }
        }
      },
      "required": ["id", "user_id", "contact_type", "contact_value", "is_primary"]
    };

    const teamUsersSchema = {
      "type": "object",
      "schemaName": "team_users",
      "dependentRecords": {
        "parentSchema": "teams",
        "minPerParent": 8,
        "maxPerParent": 15
      },
      "properties": {
        "id": {
          "type": "integer",
          "sequential": {
            "start": 1,
            "step": 1,
            "counterName": "team_user_id"
          }
        },
        "team_id": {
          "type": "integer",
          "foreignKey": {
            "schema": "teams",
            "field": "id"
          }
        },
        "user_id": {
          "type": "integer",
          "foreignKey": {
            "schema": "users",
            "field": "id"
          }
        },
        "position": {
          "type": "string",
          "enum": ["Player", "Captain", "Coach", "Assistant Coach", "Manager"]
        },
        "jersey_number": {
          "type": "integer",
          "minimum": 1,
          "maximum": 99
        },
        "joined_date": {
          "type": "string",
          "format": "date",
          "faker": "date.recent"
        }
      },
      "required": ["id", "team_id", "user_id", "position", "jersey_number", "joined_date"]
    };

    // Create generator
    const generator = new MockDataGenerator({
      seed: 54321, // Different seed for this demo
    });

    console.log('1. Generating complex related schemas...\n');

    // Generate all related data
    const schemas = {
      schools: schoolsSchema,
      users: usersSchema,
      teams: teamsSchema,
      user_contacts: userContactsSchema,
      team_users: teamUsersSchema
    };

    const counts = {
      schools: 3,
      users: 20,
      teams: 0,         // Auto-generated from schools
      user_contacts: 0, // Auto-generated from users
      team_users: 0     // Auto-generated from teams
    };

    const results = generator.generateRelatedSchemas(schemas, counts);

    // Display summary statistics
    console.log('Generated Data Summary:');
    console.log(`- Schools: ${results.schools.length}`);
    console.log(`- Users: ${results.users.length}`);
    console.log(`- Teams: ${results.teams.length}`);
    console.log(`- User Contacts: ${results.user_contacts.length}`);
    console.log(`- Team-User Relationships: ${results.team_users.length}`);
    console.log('\n' + '='.repeat(50) + '\n');

    // Analyze school-team distribution
    console.log('2. School-Team Distribution:');
    const teamsBySchool = {};
    results.teams.forEach(team => {
      teamsBySchool[team.school_id] = (teamsBySchool[team.school_id] || 0) + 1;
    });

    results.schools.forEach(school => {
      const teamCount = teamsBySchool[school.id] || 0;
      console.log(`${school.name}: ${teamCount} team(s)`);
    });

    // Analyze user-contact distribution
    console.log('\n3. User-Contact Type Distribution:');
    const contactTypes = {};
    results.user_contacts.forEach(contact => {
      contactTypes[contact.contact_type] = (contactTypes[contact.contact_type] || 0) + 1;
    });

    Object.entries(contactTypes).forEach(([type, count]) => {
      const percentage = ((count / results.user_contacts.length) * 100).toFixed(1);
      console.log(`${type}: ${count} (${percentage}%)`);
    });

    // Analyze team membership
    console.log('\n4. Team Membership Analysis:');
    const membershipByTeam = {};
    results.team_users.forEach(membership => {
      membershipByTeam[membership.team_id] = (membershipByTeam[membership.team_id] || 0) + 1;
    });

    results.teams.forEach(team => {
      const memberCount = membershipByTeam[team.id] || 0;
      const school = results.schools.find(s => s.id === team.school_id);
      console.log(`${school.name} - ${team.name}: ${memberCount} members`);
    });

    // Verify relationship integrity
    console.log('\n5. Relationship Integrity Check:');
    
    // Check team-school relationships
    const schoolIds = results.schools.map(s => s.id);
    const teamSchoolIds = results.teams.map(t => t.school_id);
    const validTeamSchoolRefs = teamSchoolIds.every(id => schoolIds.includes(id));
    console.log(`✅ Team-School references valid: ${validTeamSchoolRefs}`);

    // Check user-contact relationships
    const userIds = results.users.map(u => u.id);
    const contactUserIds = results.user_contacts.map(c => c.user_id);
    const validContactUserRefs = contactUserIds.every(id => userIds.includes(id));
    console.log(`✅ User-Contact references valid: ${validContactUserRefs}`);

    // Check team-user relationships
    const teamIds = results.teams.map(t => t.id);
    const teamUserTeamIds = results.team_users.map(tu => tu.team_id);
    const teamUserUserIds = results.team_users.map(tu => tu.user_id);
    const validTeamUserTeamRefs = teamUserTeamIds.every(id => teamIds.includes(id));
    const validTeamUserUserRefs = teamUserUserIds.every(id => userIds.includes(id));
    console.log(`✅ Team-User team references valid: ${validTeamUserTeamRefs}`);
    console.log(`✅ Team-User user references valid: ${validTeamUserUserRefs}`);

    // Export all data
    console.log('\n6. Exporting data to files...');
    
    // Create output directory for this test
    const outputDir = path.join(__dirname, 'complex-relationships-demo');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    Object.entries(results).forEach(([schemaName, data]) => {
      // JSON export
      fs.writeFileSync(
        path.join(outputDir, `generated-${schemaName}-complex.json`), 
        JSON.stringify(data, null, 2)
      );
      
      // SQL export
      const sql = generator.exportToFormat(data, 'sql', schemaName);
      fs.writeFileSync(
        path.join(outputDir, `generated-${schemaName}-complex.sql`), 
        sql
      );
    });

    console.log('✅ Complex relationship demo completed!');
    console.log('📁 Files exported to: tests/complex-relationships-demo/');
    console.log('   - Generated JSON and SQL files with "-complex" suffix');

  } catch (error) {
    console.error('❌ Error running complex relationships demo:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
  }
}

// Run the demo
runComplexRelationshipsDemo();
