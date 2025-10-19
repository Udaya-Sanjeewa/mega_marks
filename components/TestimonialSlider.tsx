'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, Quote, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase, HomeReview } from '@/lib/supabase'

export default function TestimonialSlider() {
  const [testimonials, setTestimonials] = useState<HomeReview[]>([])
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchReviews() {
      const { data, error } = await supabase
        .from('home_reviews')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching reviews:', error)
      } else {
        setTestimonials(data || [])
      }
      setLoading(false)
    }

    fetchReviews()
  }, [])

  useEffect(() => {
    if (testimonials.length === 0) return

    const timer = setInterval(() => {
      setDirection(1)
      setCurrent((prev) => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [testimonials.length])

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  }

  const paginate = (newDirection: number) => {
    setDirection(newDirection)
    setCurrent((prev) => {
      if (newDirection === 1) {
        return (prev + 1) % testimonials.length
      } else {
        return prev === 0 ? testimonials.length - 1 : prev - 1
      }
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (testimonials.length === 0) {
    return null
  }

  return (
    <div className="relative">
      <Card className="overflow-hidden bg-white shadow-xl">
        <CardContent className="p-8 md:p-12">
          <Quote className="h-12 w-12 text-green-600 mb-6 opacity-30" />
          <div className="relative h-56 md:h-48">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
                className="absolute w-full"
              >
                <p className="text-lg md:text-xl text-gray-700 mb-6 italic">
                  "{testimonials[current].review_text}"
                </p>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-gray-900">{testimonials[current].customer_name}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(testimonials[current].review_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <div className="flex gap-1 mt-2">
                      {[...Array(testimonials[current].rating)].map((_, i) => (
                        <span key={i} className="text-yellow-400 text-xl">★</span>
                      ))}
                    </div>
                  </div>
                  {testimonials[current].verified_purchase && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={() => paginate(-1)}
              className="rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setDirection(index > current ? 1 : -1)
                    setCurrent(index)
                  }}
                  className={`h-2 rounded-full transition-all ${
                    index === current ? 'w-8 bg-green-600' : 'w-2 bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => paginate(1)}
              className="rounded-full"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
