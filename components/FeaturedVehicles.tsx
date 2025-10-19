'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase, Vehicle } from '@/lib/supabase'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

export default function FeaturedVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFeaturedVehicles() {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) {
        console.error('Error fetching featured vehicles:', error)
      } else {
        setVehicles(data || [])
      }
      setLoading(false)
    }

    fetchFeaturedVehicles()
  }, [])

  useEffect(() => {
    if (vehicles.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % vehicles.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [vehicles.length])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % vehicles.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + vehicles.length) % vehicles.length)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (vehicles.length === 0) {
    return null
  }

  const vehicle = vehicles[currentIndex]

  return (
    <div className="relative h-full flex flex-col">
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.5 }}
        className="h-full flex flex-col"
      >
        <Card className="overflow-hidden flex-1 flex flex-col min-h-[380px] bg-gray-800/50 backdrop-blur-sm border-2 border-green-500/20">
          <div className="relative h-48 w-full bg-gray-100 flex-shrink-0">
            <Image
              src={vehicle.image_url || 'https://images.pexels.com/photos/110844/pexels-photo-110844.jpeg'}
              alt={vehicle.model}
              fill
              className="object-cover"
            />
            {vehicle.available && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-green-600">Available</Badge>
              </div>
            )}
          </div>
          <CardContent className="p-4 flex-1 flex flex-col">
            <h3 className="font-bold text-lg mb-2 line-clamp-1 text-white">{vehicle.model}</h3>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="border-green-500/50 text-green-300">{vehicle.year}</Badge>
              <Badge variant="outline" className="border-green-500/50 text-green-300">{vehicle.battery_capacity}</Badge>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-300 mb-1">{vehicle.condition}</p>
              <p className="text-sm text-gray-300 mb-3">{vehicle.mileage.toLocaleString()} km</p>
            </div>
            <p className="text-2xl font-bold text-green-400">
              LKR {vehicle.price.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {vehicles.length > 1 && (
        <div className="flex items-center justify-between mt-4">
          <Button
            variant="outline"
            size="icon"
            onClick={prevSlide}
            className="rounded-full h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex gap-1.5">
            {vehicles.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentIndex ? 'w-6 bg-blue-600' : 'w-1.5 bg-gray-300'
                }`}
              />
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={nextSlide}
            className="rounded-full h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
