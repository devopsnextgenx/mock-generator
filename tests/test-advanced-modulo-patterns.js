const { MockDataGenerator } = require('../dist/MockDataGenerator');

// Advanced modulo patterns demonstration
const advancedPatternsSchema = {
  type: 'object',
  schemaName: 'advanced_modulo_patterns',
  properties: {
    id: {
      type: 'integer',
      sequential: {
        start: 1,
        step: 1,
        counterName: 'pattern_id'
      }
    },
    // Financial: Donation amounts in $25 increments
    donation_amount: {
      type: 'integer',
      minimum: 25,
      maximum: 5000,
      modulo: {
        divisor: 25
      }
    },
    // Retail: Prices ending in .99 (represented as cents)
    price_cents: {
      type: 'integer',
      minimum: 99,
      maximum: 99999,
      modulo: {
        divisor: 100,
        remainder: 99
      }
    },
    // Inventory: Stock in dozens (multiples of 12)
    stock_quantity: {
      type: 'integer',
      minimum: 12,
      maximum: 1200,
      modulo: {
        divisor: 12
      }
    },
    // Time: Meeting durations in 15-minute intervals
    duration_minutes: {
      type: 'integer',
      minimum: 15,
      maximum: 240,
      modulo: {
        divisor: 15
      }
    },
    // Gaming: Score increments of 50 points
    game_score: {
      type: 'integer',
      minimum: 50,
      maximum: 10000,
      faker: 'number.int',
      modulo: {
        divisor: 50
      }
    },
    // Packaging: Items per package (multiples of 6)
    items_per_package: {
      type: 'integer',
      minimum: 6,
      maximum: 144,
      modulo: {
        divisor: 6
      }
    }
  },
  required: ['id', 'donation_amount', 'price_cents', 'stock_quantity', 'duration_minutes', 'game_score', 'items_per_package']
};

console.log('=== Advanced Modulo Patterns Demo ===\n');

try {
  const generator = new MockDataGenerator({ count: 8 });
  const data = generator.generateFromSchema(advancedPatternsSchema);

  console.log('Generated data with various modulo patterns:');
  data.forEach((record, index) => {
    console.log(`\nRecord ${index + 1}:`);
    console.log(`  ID: ${record.id}`);
    console.log(`  Donation Amount: $${record.donation_amount} (÷25 = ${record.donation_amount / 25})`);
    console.log(`  Price: $${(record.price_cents / 100).toFixed(2)} (ends in .99: ${record.price_cents % 100 === 99 ? '✅' : '❌'})`);
    console.log(`  Stock: ${record.stock_quantity} units (${record.stock_quantity / 12} dozen)`);
    console.log(`  Duration: ${record.duration_minutes} min (${record.duration_minutes / 15} x 15-min blocks)`);
    console.log(`  Score: ${record.game_score} pts (÷50 = ${record.game_score / 50})`);
    console.log(`  Package Size: ${record.items_per_package} items (÷6 = ${record.items_per_package / 6})`);
  });

  // Comprehensive validation
  console.log('\n=== Validation Results ===');
  let totalChecks = 0;
  let passedChecks = 0;

  data.forEach((record, index) => {
    const checks = [
      { name: 'Donation (÷25)', value: record.donation_amount, divisor: 25, remainder: 0 },
      { name: 'Price (ends in .99)', value: record.price_cents, divisor: 100, remainder: 99 },
      { name: 'Stock (÷12)', value: record.stock_quantity, divisor: 12, remainder: 0 },
      { name: 'Duration (÷15)', value: record.duration_minutes, divisor: 15, remainder: 0 },
      { name: 'Score (÷50)', value: record.game_score, divisor: 50, remainder: 0 },
      { name: 'Package (÷6)', value: record.items_per_package, divisor: 6, remainder: 0 }
    ];

    checks.forEach(check => {
      totalChecks++;
      const actual = check.value % check.divisor;
      if (actual === check.remainder) {
        passedChecks++;
      } else {
        console.log(`❌ Record ${index + 1} - ${check.name}: ${check.value} % ${check.divisor} = ${actual}, expected ${check.remainder}`);
      }
    });
  });

  console.log(`\n📊 Validation Summary: ${passedChecks}/${totalChecks} checks passed (${((passedChecks/totalChecks)*100).toFixed(1)}%)`);
  
  if (passedChecks === totalChecks) {
    console.log('🎉 All modulo patterns validated successfully!');
  }

  // Show pattern examples
  console.log('\n=== Pattern Examples ===');
  const examples = data.slice(0, 3);
  console.log(`Donation amounts (÷25): ${examples.map(r => `$${r.donation_amount}`).join(', ')}`);
  console.log(`Prices ending in .99: ${examples.map(r => `$${(r.price_cents/100).toFixed(2)}`).join(', ')}`);
  console.log(`Stock in dozens: ${examples.map(r => `${r.stock_quantity} (${r.stock_quantity/12} doz)`).join(', ')}`);
  console.log(`Meeting durations: ${examples.map(r => `${r.duration_minutes}min`).join(', ')}`);

} catch (error) {
  console.error('Error generating data:', error);
}
