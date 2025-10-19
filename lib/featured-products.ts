import { supabase } from './supabase'

export interface FeaturedProduct {
  id: string
  name: string
  image_url: string
  description: string
  category: string
}

let cachedProducts: FeaturedProduct[] | null = null
let cacheTimestamp: number | null = null
const CACHE_DURATION = 1000 * 60 * 60 // 1 hour

export async function getFeaturedProducts(): Promise<FeaturedProduct[]> {
  const now = Date.now()

  if (cachedProducts && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedProducts
  }

  try {
    const [batteriesRes, vehiclesRes, partsRes] = await Promise.all([
      supabase.from('batteries').select('id, name, image_url, description').limit(10),
      supabase.from('vehicles').select('id, model, image_url, battery_capacity, condition').limit(10),
      supabase.from('parts').select('id, name, image_url, description, category').limit(10)
    ])

    const allProducts: FeaturedProduct[] = []

    if (batteriesRes.data) {
      batteriesRes.data.forEach(battery => {
        allProducts.push({
          id: battery.id,
          name: battery.name,
          image_url: battery.image_url || 'https://images.pexels.com/photos/110844/pexels-photo-110844.jpeg?auto=compress&cs=tinysrgb&w=1200',
          description: battery.description || 'Premium CATL battery pack',
          category: 'Batteries'
        })
      })
    }

    if (vehiclesRes.data) {
      vehiclesRes.data.forEach(vehicle => {
        allProducts.push({
          id: vehicle.id,
          name: `${vehicle.model} ${vehicle.condition}`,
          image_url: vehicle.image_url || 'https://images.pexels.com/photos/110844/pexels-photo-110844.jpeg?auto=compress&cs=tinysrgb&w=1200',
          description: `${vehicle.battery_capacity} • ${vehicle.condition}`,
          category: 'Vehicles'
        })
      })
    }

    if (partsRes.data) {
      partsRes.data.forEach(part => {
        allProducts.push({
          id: part.id,
          name: part.name,
          image_url: part.image_url || 'https://images.pexels.com/photos/3807277/pexels-photo-3807277.jpeg?auto=compress&cs=tinysrgb&w=1200',
          description: part.description || 'Genuine OEM part',
          category: part.category
        })
      })
    }

    if (allProducts.length > 0) {
      const shuffled = allProducts.sort(() => 0.5 - Math.random())
      const selected = shuffled.slice(0, 6)

      cachedProducts = selected
      cacheTimestamp = now

      return selected
    }

    return []
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}
