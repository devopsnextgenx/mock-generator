const { MockDataGenerator } = require('../dist/MockDataGenerator');
const fs = require('fs');

// Load the schemas
const usersSchema = JSON.parse(fs.readFileSync('./schemas/users-schema.json', 'utf8'));
const teamsSchema = JSON.parse(fs.readFileSync('./schemas/teams-schema.json', 'utf8'));
const teamUsersSchema = JSON.parse(fs.readFileSync('./schemas/team-users-schema.json', 'utf8'));

// Set schema names
usersSchema.schemaName = 'users';
teamsSchema.schemaName = 'teams';
teamUsersSchema.schemaName = 'team_users';

console.log('🚀 Testing Multiple Parent Dependencies and Unique Constraints...\n');

const generator = new MockDataGenerator({ seed: 12345 });

try {
  // Generate related data
  const relatedData = generator.generateRelatedSchemas({
    users: usersSchema,
    teams: teamsSchema,
    team_users: teamUsersSchema
  }, {
    users: 10,    // Generate 10 users
    teams: 3,     // Generate 3 teams
    team_users: 50 // This will be ignored as it's calculated based on parent relationships
  });

  console.log(`📊 Generated Data Summary:`);
  console.log(`- Users: ${relatedData.users.length} records`);
  console.log(`- Teams: ${relatedData.teams.length} records`);
  console.log(`- Team Users: ${relatedData.team_users.length} records\n`);

  // Verify unique constraints
  console.log('🔍 Verifying Unique Constraints...');
  const teamUserCombinations = new Set();
  let duplicateCount = 0;

  for (const record of relatedData.team_users) {
    const combination = `${record.team_id}_${record.user_id}`;
    if (teamUserCombinations.has(combination)) {
      duplicateCount++;
      console.log(`❌ Duplicate found: team_id=${record.team_id}, user_id=${record.user_id}`);
    } else {
      teamUserCombinations.add(combination);
    }
  }

  if (duplicateCount === 0) {
    console.log('✅ All team_id + user_id combinations are unique!');
  } else {
    console.log(`❌ Found ${duplicateCount} duplicate combinations`);
  }

  // Verify one-to-one relationship with users
  console.log('\n👥 Verifying User Relationships...');
  const userCounts = {};
  for (const record of relatedData.team_users) {
    userCounts[record.user_id] = (userCounts[record.user_id] || 0) + 1;
  }

  let usersWithMultipleRecords = 0;
  for (const [userId, count] of Object.entries(userCounts)) {
    if (count > 1) {
      usersWithMultipleRecords++;
      console.log(`❌ User ${userId} has ${count} records (should be 1)`);
    }
  }

  if (usersWithMultipleRecords === 0) {
    console.log('✅ Each user has exactly one team assignment!');
  } else {
    console.log(`❌ ${usersWithMultipleRecords} users have multiple records`);
  }

  // Verify team relationships
  console.log('\n🏆 Verifying Team Relationships...');
  const teamCounts = {};
  for (const record of relatedData.team_users) {
    teamCounts[record.team_id] = (teamCounts[record.team_id] || 0) + 1;
  }

  console.log('Team member counts:');
  for (const [teamId, count] of Object.entries(teamCounts)) {
    console.log(`  - Team ${teamId}: ${count} members`);
  }

  // Save sample output
  console.log('\n💾 Saving sample data...');
  
  // Save JSON output
  fs.writeFileSync('./json-output/generated-users-multi-parent.json', JSON.stringify(relatedData.users, null, 2));
  fs.writeFileSync('./json-output/generated-teams-multi-parent.json', JSON.stringify(relatedData.teams, null, 2));
  fs.writeFileSync('./json-output/generated-team-users-multi-parent.json', JSON.stringify(relatedData.team_users, null, 2));

  // Save SQL output
  const sqlUsers = generator.exportToFormat(relatedData.users, 'sql', 'users', 1000, usersSchema);
  const sqlTeams = generator.exportToFormat(relatedData.teams, 'sql', 'teams', 1000, teamsSchema);
  const sqlTeamUsers = generator.exportToFormat(relatedData.team_users, 'sql', 'team_users', 1000, teamUsersSchema);

  fs.writeFileSync('./sql-output/generated-users-multi-parent.sql', sqlUsers);
  fs.writeFileSync('./sql-output/generated-teams-multi-parent.sql', sqlTeams);
  fs.writeFileSync('./sql-output/generated-team-users-multi-parent.sql', sqlTeamUsers);

  console.log('✅ Sample data saved to json-output/ and sql-output/ directories');

  // Show a few sample records
  console.log('\n📝 Sample Team-User Records:');
  relatedData.team_users.slice(0, 5).forEach((record, index) => {
    console.log(`${index + 1}. User ${record.user_id} → Team ${record.team_id} (ID: ${record.id})`);
  });

} catch (error) {
  console.error('❌ Error during generation:', error.message);
  console.error(error.stack);
}
