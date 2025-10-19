'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase, Battery } from '@/lib/supabase'
import { ChevronLeft, ChevronRight, Battery as BatteryIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

export default function FeaturedBatteries() {
  const [batteries, setBatteries] = useState<Battery[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFeaturedBatteries() {
      const { data, error } = await supabase
        .from('batteries')
        .select('*')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) {
        console.error('Error fetching featured batteries:', error)
      } else {
        setBatteries(data || [])
      }
      setLoading(false)
    }

    fetchFeaturedBatteries()
  }, [])

  useEffect(() => {
    if (batteries.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % batteries.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [batteries.length])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % batteries.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + batteries.length) % batteries.length)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (batteries.length === 0) {
    return null
  }

  const battery = batteries[currentIndex]

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
        <Card className="overflow-hidden flex-1 flex flex-col min-h-[380px]">
          <div className="relative h-48 w-full bg-gray-100 flex-shrink-0">
            <Image
              src={battery.image_url || 'https://images.pexels.com/photos/110844/pexels-photo-110844.jpeg'}
              alt={battery.name}
              fill
              className="object-cover"
            />
            {battery.in_stock && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-green-600">In Stock</Badge>
              </div>
            )}
          </div>
          <CardContent className="p-4 flex-1 flex flex-col">
            <h3 className="font-bold text-lg mb-2 line-clamp-1">{battery.name}</h3>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{battery.capacity}</Badge>
              <Badge variant="outline">{battery.brand}</Badge>
            </div>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-1">{battery.description}</p>
            <p className="text-2xl font-bold text-green-600">
              LKR {battery.price.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {batteries.length > 1 && (
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
            {batteries.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentIndex ? 'w-6 bg-green-600' : 'w-1.5 bg-gray-300'
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
