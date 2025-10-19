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

const supabase = createClient(supabaseUrl, supabaseKey)

const sampleBatteries = [
  {
    name: 'CATL LFP Battery Pack 53kWh',
    capacity: '53kWh',
    brand: 'CATL',
    price: 450000,
    description: 'High-performance lithium iron phosphate battery pack with excellent thermal stability and long cycle life. Ideal for urban EVs.',
    image_url: 'https://images.pexels.com/photos/12986350/pexels-photo-12986350.jpeg',
    in_stock: true,
    warranty_years: 8,
    range_with_ac: '280 km',
    range_without_ac: '320 km'
  },
  {
    name: 'BYD Blade Battery 62kWh',
    capacity: '62kWh',
    brand: 'BYD',
    price: 525000,
    description: 'Revolutionary blade battery technology with superior safety features and space efficiency. Perfect for mid-range electric vehicles.',
    image_url: 'https://images.pexels.com/photos/17485792/pexels-photo-17485792.jpeg',
    in_stock: true,
    warranty_years: 8,
    range_with_ac: '340 km',
    range_without_ac: '385 km'
  },
  {
    name: 'CATL Ternary Battery 75kWh',
    capacity: '75kWh',
    brand: 'CATL',
    price: 680000,
    description: 'High energy density ternary lithium battery with excellent performance in all weather conditions. Suitable for long-range EVs.',
    image_url: 'https://images.pexels.com/photos/12986352/pexels-photo-12986352.jpeg',
    in_stock: true,
    warranty_years: 8,
    range_with_ac: '420 km',
    range_without_ac: '470 km'
  },
  {
    name: 'BYD LFP Battery 50kWh',
    capacity: '50kWh',
    brand: 'BYD',
    price: 420000,
    description: 'Compact and efficient battery pack designed for city commuting. Features fast charging capability and robust construction.',
    image_url: 'https://images.pexels.com/photos/17485795/pexels-photo-17485795.jpeg',
    in_stock: true,
    warranty_years: 6,
    range_with_ac: '265 km',
    range_without_ac: '305 km'
  },
  {
    name: 'CATL NCM Battery 100kWh',
    capacity: '100kWh',
    brand: 'CATL',
    price: 950000,
    description: 'Premium high-capacity battery for luxury electric vehicles. Offers exceptional range and fast charging capabilities.',
    image_url: 'https://images.pexels.com/photos/12986348/pexels-photo-12986348.jpeg',
    in_stock: true,
    warranty_years: 10,
    range_with_ac: '550 km',
    range_without_ac: '620 km'
  },
  {
    name: 'Lishen LFP Battery 45kWh',
    capacity: '45kWh',
    brand: 'Lishen',
    price: 380000,
    description: 'Budget-friendly battery solution with reliable performance. Perfect for entry-level electric vehicles.',
    image_url: 'https://images.pexels.com/photos/17485793/pexels-photo-17485793.jpeg',
    in_stock: false,
    warranty_years: 5,
    range_with_ac: '240 km',
    range_without_ac: '275 km'
  }
]

async function addSampleBatteries() {
  console.log('\n=== Adding Sample Batteries ===\n')

  console.log('Step 1: Checking if batteries table exists...')
  const { data: checkData, error: checkError } = await supabase
    .from('batteries')
    .select('count')
    .limit(1)

  if (checkError) {
    console.error('❌ Error: Table does not exist or cannot be accessed')
    console.error('Error details:', checkError.message)
    console.log('\n⚠️  Please run the table creation SQL first in Supabase dashboard!')
    return
  }

  console.log('✓ Table exists!\n')

  console.log('Step 2: Checking current battery count...')
  const { count, error: countError } = await supabase
    .from('batteries')
    .select('*', { count: 'exact', head: true })

  if (countError) {
    console.error('Error getting count:', countError.message)
  } else {
    console.log(`Current battery count: ${count}\n`)
  }

  console.log('Step 3: Inserting sample batteries...')
  const { data, error } = await supabase
    .from('batteries')
    .insert(sampleBatteries)
    .select()

  if (error) {
    console.error('❌ Failed to insert batteries')
    console.error('Error details:', error.message)
    console.log('\nPlease make sure:')
    console.log('1. The batteries table has been created with the correct schema')
    console.log('2. Row Level Security policies allow authenticated inserts')
    console.log('3. You are logged in as an admin user')
  } else {
    console.log(`✓ Successfully added ${data.length} sample batteries!\n`)
    console.log('Sample batteries added:')
    data.forEach((battery, index) => {
      console.log(`  ${index + 1}. ${battery.name} - ${battery.capacity} - ₹${battery.price.toLocaleString()}`)
    })
    console.log('\nYou can now view these batteries in your admin dashboard!')
  }
}

addSampleBatteries().catch(console.error)
