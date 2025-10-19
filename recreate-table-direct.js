const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const envPath = path.join(__dirname, '.env')
const envContent = fs.readFileSync(envPath, 'utf8')
const envVars = {}
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    envVars[match[1].trim()] = match[2].trim()
  }
})

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Connecting to Supabase...')
console.log('URL:', supabaseUrl)

const supabase = createClient(supabaseUrl, supabaseKey)

async function recreateTable() {
  console.log('\n=== Recreating Batteries Table ===\n')

  console.log('Step 1: Checking current tables...')
  const { data: existingData, error: checkError } = await supabase
    .from('batteries')
    .select('*')
    .limit(1)

  if (checkError) {
    console.log('Table does not exist or error:', checkError.message)
  } else {
    console.log('Table exists with columns:', existingData.length > 0 ? Object.keys(existingData[0]) : 'Table is empty')
  }

  console.log('\n⚠️  MANUAL ACTION REQUIRED ⚠️\n')
  console.log('I cannot directly execute DDL statements with the anon key.')
  console.log('Please follow these steps:\n')
  console.log('1. Open: https://supabase.com/dashboard/project/ewiikmidzpttnsloplex/editor')
  console.log('2. Click on "SQL Editor" in the left sidebar')
  console.log('3. Click "New Query"')
  console.log('4. Copy and paste the following SQL:\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`
DROP TABLE IF EXISTS batteries CASCADE;

CREATE TABLE batteries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  capacity text NOT NULL,
  brand text NOT NULL DEFAULT 'CATL',
  price numeric NOT NULL,
  description text,
  image_url text,
  in_stock boolean DEFAULT true,
  warranty_years integer DEFAULT 2,
  range_with_ac text,
  range_without_ac text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE batteries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to batteries"
  ON batteries FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert batteries"
  ON batteries FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update batteries"
  ON batteries FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete batteries"
  ON batteries FOR DELETE
  TO authenticated
  USING (true);
`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\n5. Click "RUN" or press Ctrl+Enter')
  console.log('6. You should see "Success. No rows returned"')
  console.log('7. Then you can add batteries from the admin panel!\n')
}

recreateTable().catch(console.error)
