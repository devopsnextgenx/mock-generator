const { MockDataGenerator } = require('../dist/MockDataGenerator');
const fs = require('fs');

// Load the updated sponsor-donations schema
const sponsorDonationsSchema = JSON.parse(
  fs.readFileSync('./robofest/schemas/sponsor-donations-schema.json', 'utf8')
);

// Load the sponsors schema as well since sponsor-donations depends on it
const sponsorsSchema = JSON.parse(
  fs.readFileSync('./robofest/schemas/sponsors-schema.json', 'utf8')
);

console.log('=== Testing Sponsor Donations with Modulo Feature ===\n');

try {
  const generator = new MockDataGenerator({ count: 5 });
  
  // First generate sponsors data
  console.log('Generating sponsors data...');
  const sponsorsData = generator.generateFromSchema(sponsorsSchema, 3);
  console.log(`Generated ${sponsorsData.length} sponsors`);
  
  // Then generate sponsor donations data
  console.log('\nGenerating sponsor donations data...');
  const donationsData = generator.generateFromSchema(sponsorDonationsSchema);
  
  console.log(`\nGenerated ${donationsData.length} sponsor donations:`);
  donationsData.forEach((donation, index) => {
    console.log(`\nDonation ${index + 1}:`);
    console.log(`  ID: ${donation.id}`);
    console.log(`  Sponsor ID: ${donation.sponser_id}`);
    console.log(`  Amount: $${donation.amount} (${donation.amount} % 100 = ${donation.amount % 100})`);
    console.log(`  Donation Date: ${donation.donation_date}`);
    console.log(`  Created At: ${donation.created_at}`);
  });

  // Verify all amounts are multiples of 100
  console.log('\n=== Verification ===');
  let allValid = true;

  donationsData.forEach((donation, index) => {
    if (donation.amount % 100 !== 0) {
      console.log(`❌ Donation ${index + 1} FAILED: Amount ${donation.amount} is not a multiple of 100`);
      allValid = false;
    }
  });

  if (allValid) {
    console.log('✅ All donation amounts are multiples of 100!');
  } else {
    console.log('❌ Some donation amounts failed validation');
  }

  // Show range compliance
  const amounts = donationsData.map(d => d.amount);
  const minAmount = Math.min(...amounts);
  const maxAmount = Math.max(...amounts);
  console.log(`\nAmount range: $${minAmount} - $${maxAmount}`);
  console.log(`All amounts within specified range [100, 100000]: ${minAmount >= 100 && maxAmount <= 100000 ? '✅' : '❌'}`);

} catch (error) {
  console.error('Error generating data:', error);
}
