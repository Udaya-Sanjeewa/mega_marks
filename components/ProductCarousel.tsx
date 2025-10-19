'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getFeaturedProducts, type FeaturedProduct } from '@/lib/featured-products'

export default function ProductCarousel() {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(0)
  const [products, setProducts] = useState<FeaturedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const hasFetched = useRef(false)

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true

    const loadProducts = async () => {
      const data = await getFeaturedProducts()
      setProducts(data)
      setLoading(false)
    }

    loadProducts()
  }, [])

  useEffect(() => {
    if (products.length === 0) return

    const timer = setInterval(() => {
      setDirection(1)
      setCurrent((prev) => (prev + 1) % products.length)
    }, 4000)

    return () => clearInterval(timer)
  }, [products.length])

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8
    })
  }

  const paginate = (newDirection: number) => {
    setDirection(newDirection)
    setCurrent((prev) => {
      if (newDirection === 1) {
        return (prev + 1) % products.length
      } else {
        return prev === 0 ? products.length - 1 : prev - 1
      }
    })
  }

  if (loading) {
    return (
      <div className="relative w-full h-[500px] bg-gray-900 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
        <div className="text-white text-lg">Loading products...</div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="relative w-full h-[500px] bg-gray-900 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
        <div className="text-white text-lg">No products available</div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-[500px] bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
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
            opacity: { duration: 0.3 },
            scale: { duration: 0.3 }
          }}
          className="absolute w-full h-full"
        >
          <div className="relative w-full h-full">
            <Image
              src={products[current].image_url || 'https://images.pexels.com/photos/110844/pexels-photo-110844.jpeg?auto=compress&cs=tinysrgb&w=1200'}
              alt={products[current].name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute bottom-12 left-12 text-white"
            >
              <div className="inline-block px-3 py-1 bg-green-600 rounded-full text-sm font-semibold mb-2">
                {products[current].category}
              </div>
              <h3 className="text-3xl md:text-4xl font-bold mb-2">
                {products[current].name}
              </h3>
              <p className="text-lg md:text-xl text-gray-200">
                {products[current].description || 'Premium quality product'}
              </p>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => paginate(-1)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 text-white rounded-full"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => paginate(1)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 text-white rounded-full"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {products.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > current ? 1 : -1)
              setCurrent(index)
            }}
            className={`h-2 rounded-full transition-all ${
              index === current ? 'w-8 bg-white' : 'w-2 bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
