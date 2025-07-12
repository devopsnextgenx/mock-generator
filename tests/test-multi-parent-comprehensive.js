const { MockDataGenerator } = require('../dist/MockDataGenerator');

// Test schemas
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
    "name": {
      "type": "string",
      "faker": "person.fullName"
    },
    "email": {
      "type": "string",
      "faker": "internet.email"
    }
  },
  "required": ["id", "name", "email"]
};

const teamsSchema = {
  "type": "object",
  "schemaName": "teams",
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
      "faker": "company.name"
    }
  },
  "required": ["id", "name"]
};

const teamUsersSchema = {
  "type": "object",
  "schemaName": "team_users",
  "dependentRecords": {
    "parentSchemas": [
      {
        "schema": "teams",
        "minPerParent": 2,
        "maxPerParent": 5
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
      "name": "unique_team_user_combination"
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
    "role": {
      "type": "string",
      "enum": ["member", "leader", "captain"],
      "default": "member"
    },
    "joined_at": {
      "type": "string",
      "format": "date-time",
      "faker": "date.recent"
    }
  },
  "required": ["id", "user_id", "team_id", "role", "joined_at"]
};

console.log('🧪 Running Comprehensive Multi-Parent Dependencies Test\n');

function runTest() {
  const generator = new MockDataGenerator({ seed: 42 });

  try {
    // Test 1: Generate with multiple parent dependencies
    console.log('📋 Test 1: Multiple Parent Dependencies');
    const relatedData = generator.generateRelatedSchemas({
      users: usersSchema,
      teams: teamsSchema,
      team_users: teamUsersSchema
    }, {
      users: 15,
      teams: 4
    });

    console.log(`✅ Generated ${relatedData.users.length} users, ${relatedData.teams.length} teams, ${relatedData.team_users.length} team_users\n`);

    // Test 2: Verify one-to-one relationship
    console.log('👤 Test 2: One-to-One User Relationship');
    const userCounts = {};
    relatedData.team_users.forEach(record => {
      userCounts[record.user_id] = (userCounts[record.user_id] || 0) + 1;
    });

    const multipleUserRecords = Object.entries(userCounts).filter(([_, count]) => count > 1);
    if (multipleUserRecords.length === 0) {
      console.log('✅ Each user has exactly one team assignment');
    } else {
      console.log(`❌ ${multipleUserRecords.length} users have multiple assignments`);
      return false;
    }

    // Verify all users are assigned
    const assignedUsers = new Set(relatedData.team_users.map(r => r.user_id));
    const totalUsers = new Set(relatedData.users.map(u => u.id));
    if (assignedUsers.size === totalUsers.size) {
      console.log('✅ All users are assigned to teams');
    } else {
      console.log(`❌ Only ${assignedUsers.size}/${totalUsers.size} users are assigned`);
      return false;
    }

    // Test 3: Verify unique constraints
    console.log('\n🔒 Test 3: Unique Constraints');
    const combinations = new Set();
    let duplicates = 0;

    relatedData.team_users.forEach(record => {
      const combo = `${record.team_id}_${record.user_id}`;
      if (combinations.has(combo)) {
        duplicates++;
      } else {
        combinations.add(combo);
      }
    });

    if (duplicates === 0) {
      console.log('✅ All team_id + user_id combinations are unique');
    } else {
      console.log(`❌ Found ${duplicates} duplicate combinations`);
      return false;
    }

    // Test 4: Verify foreign key relationships
    console.log('\n🔗 Test 4: Foreign Key Relationships');
    const userIds = new Set(relatedData.users.map(u => u.id));
    const teamIds = new Set(relatedData.teams.map(t => t.id));

    let invalidUserFKs = 0;
    let invalidTeamFKs = 0;

    relatedData.team_users.forEach(record => {
      if (!userIds.has(record.user_id)) invalidUserFKs++;
      if (!teamIds.has(record.team_id)) invalidTeamFKs++;
    });

    if (invalidUserFKs === 0 && invalidTeamFKs === 0) {
      console.log('✅ All foreign key relationships are valid');
    } else {
      console.log(`❌ Found ${invalidUserFKs} invalid user FKs and ${invalidTeamFKs} invalid team FKs`);
      return false;
    }

    // Test 5: Verify team distribution
    console.log('\n🏆 Test 5: Team Distribution');
    const teamCounts = {};
    relatedData.team_users.forEach(record => {
      teamCounts[record.team_id] = (teamCounts[record.team_id] || 0) + 1;
    });

    console.log('Team member distribution:');
    Object.entries(teamCounts).forEach(([teamId, count]) => {
      console.log(`  - Team ${teamId}: ${count} members`);
    });

    // Verify team counts are within expected range (2-5 per team based on schema)
    const invalidTeamCounts = Object.values(teamCounts).filter(count => count < 2 || count > 5);
    if (invalidTeamCounts.length === 0) {
      console.log('✅ All teams have members within expected range (2-5)');
    } else {
      console.log(`❌ ${invalidTeamCounts.length} teams have members outside expected range`);
      return false;
    }

    // Test 6: SQL Export with Unique Constraints
    console.log('\n📄 Test 6: SQL Export with Unique Constraints');
    const teamUsersSql = generator.exportToFormat(relatedData.team_users, 'sql', 'team_users', 1000, teamUsersSchema);
    
    if (teamUsersSql.includes('UNIQUE KEY `unique_team_user_combination`')) {
      console.log('✅ SQL export includes unique constraint');
    } else {
      console.log('❌ SQL export missing unique constraint');
      return false;
    }

    // Test 7: Clear and regenerate
    console.log('\n🔄 Test 7: Clear and Regenerate');
    generator.clearGeneratedData();
    generator.clearUniqueConstraintTrackers();

    const newData = generator.generateRelatedSchemas({
      users: usersSchema,
      teams: teamsSchema,
      team_users: teamUsersSchema
    }, {
      users: 8,
      teams: 2
    });

    if (newData.team_users.length === 8) { // 8 users, each gets one assignment
      console.log('✅ Successfully cleared and regenerated data');
    } else {
      console.log(`❌ Expected 8 team_users, got ${newData.team_users.length}`);
      return false;
    }

    console.log('\n🎉 All tests passed! Multi-parent dependencies with unique constraints working correctly.');
    return true;

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    console.error(error.stack);
    return false;
  }
}

// Run the test
const success = runTest();
process.exit(success ? 0 : 1);
