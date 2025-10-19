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
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkColumns() {
  console.log('Checking current database schema...\n')

  const { data, error } = await supabase
    .from('batteries')
    .select('*')
    .limit(1)

  if (error) {
    console.error('Error checking schema:', error.message)
    return false
  }

  if (data && data.length > 0) {
    console.log('Current columns:', Object.keys(data[0]))
    const hasRangeWithAc = data[0].hasOwnProperty('range_with_ac')
    const hasRangeWithoutAc = data[0].hasOwnProperty('range_without_ac')
    console.log('Has range_with_ac:', hasRangeWithAc)
    console.log('Has range_without_ac:', hasRangeWithoutAc)
    return hasRangeWithAc && hasRangeWithoutAc
  }

  console.log('No data in batteries table yet, cannot check columns')
  return false
}

async function applyMigration() {
  console.log('=== Battery Table Migration ===\n')

  const columnsExist = await checkColumns()

  if (columnsExist) {
    console.log('\n✓ Columns already exist! No migration needed.')
    return
  }

  console.log('\n⚠ Columns missing. Please apply the migration manually:\n')
  console.log('1. Go to: https://supabase.com/dashboard')
  console.log('2. Select your project: ewiikmidzpttnsloplex')
  console.log('3. Click "SQL Editor" in the left sidebar')
  console.log('4. Click "New Query"')
  console.log('5. Copy and paste this SQL:\n')
  console.log('---START SQL---')
  console.log(`
ALTER TABLE batteries
ADD COLUMN IF NOT EXISTS range_with_ac text,
ADD COLUMN IF NOT EXISTS range_without_ac text;
`)
  console.log('---END SQL---\n')
  console.log('6. Click "Run" or press Ctrl+Enter')
  console.log('7. Run this script again to verify\n')
}

applyMigration().catch(console.error)
