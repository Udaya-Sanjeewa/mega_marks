'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase, Part } from '@/lib/supabase'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

export default function FeaturedParts() {
  const [parts, setParts] = useState<Part[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFeaturedParts() {
      const { data, error } = await supabase
        .from('parts')
        .select('*')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) {
        console.error('Error fetching featured parts:', error)
      } else {
        setParts(data || [])
      }
      setLoading(false)
    }

    fetchFeaturedParts()
  }, [])

  useEffect(() => {
    if (parts.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % parts.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [parts.length])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % parts.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + parts.length) % parts.length)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
      </div>
    )
  }

  if (parts.length === 0) {
    return null
  }

  const part = parts[currentIndex]

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
              src={part.image_url || 'https://images.pexels.com/photos/3807277/pexels-photo-3807277.jpeg'}
              alt={part.name}
              fill
              className="object-cover"
            />
            {part.in_stock && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-green-600">In Stock</Badge>
              </div>
            )}
          </div>
          <CardContent className="p-4 flex-1 flex flex-col">
            <h3 className="font-bold text-lg mb-2 line-clamp-1 text-white">{part.name}</h3>
            <Badge variant="outline" className="mb-2 border-green-500/50 text-green-300">{part.category}</Badge>
            <p className="text-sm text-gray-300 mb-3 line-clamp-2 flex-1">{part.description}</p>
            <p className="text-2xl font-bold text-green-400">
              LKR {part.price.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {parts.length > 1 && (
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
            {parts.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentIndex ? 'w-6 bg-gray-700' : 'w-1.5 bg-gray-300'
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
