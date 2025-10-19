import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Battery = {
  id: string
  name: string
  capacity: string
  brand: string
  price: number
  description: string | null
  image_url: string | null
  in_stock: boolean
  warranty_years: number
  range_with_ac: string | null
  range_without_ac: string | null
  is_featured: boolean
  created_at: string
}

export type Vehicle = {
  id: string
  model: string
  year: number
  battery_capacity: string
  condition: string
  mileage: number
  price: number
  color: string | null
  image_url: string | null
  images: string[] | null
  features: string[] | null
  available: boolean
  is_featured: boolean
  created_at: string
}

export type Part = {
  id: string
  name: string
  category: string
  price: number
  description: string | null
  image_url: string | null
  in_stock: boolean
  stock_quantity: number
  compatible_models: string[] | null
  is_featured: boolean
  created_at: string
}

export type BatteryReview = {
  id: string
  customer_name: string
  rating: number
  review_text: string
  review_date: string
  verified_purchase: boolean
  created_at: string
}

export type VehicleReview = {
  id: string
  customer_name: string
  rating: number
  review_text: string
  review_date: string
  verified_purchase: boolean
  created_at: string
}

export type PartReview = {
  id: string
  customer_name: string
  rating: number
  review_text: string
  review_date: string
  verified_purchase: boolean
  created_at: string
}

export type HomeReview = {
  id: string
  customer_name: string
  rating: number
  review_text: string
  review_date: string
  verified_purchase: boolean
  created_at: string
}
