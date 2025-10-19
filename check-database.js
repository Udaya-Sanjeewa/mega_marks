const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ewiikmidzpttnsloplex.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3aWlrbWlkenB0dG5zbG9wbGV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMDE2NzAsImV4cCI6MjA3NTU3NzY3MH0.BGXPoPiBr78bl3sczQfz_BoeAj9IVe5U1SbSZSR2eX8'
);

async function checkTables() {
  console.log('=== Checking Tables in External Supabase Database ===\n');

  const tables = [
    'batteries',
    'vehicles',
    'parts',
    'admin_users',
    'vehicle_listings',
    'product_reviews',
    'home_reviews'
  ];

  for (const table of tables) {
    const { data, error, count } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (!error) {
      console.log(`✓ ${table.padEnd(20)} - ${count || 0} rows`);
    } else {
      console.log(`✗ ${table.padEnd(20)} - Error: ${error.message}`);
    }
  }

  console.log('\n=== Sample Data from Each Table ===\n');

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(2);

    if (!error && data && data.length > 0) {
      console.log(`\n--- ${table.toUpperCase()} (${data.length} sample rows) ---`);
      console.log(JSON.stringify(data, null, 2));
    }
  }
}

checkTables().catch(console.error);
