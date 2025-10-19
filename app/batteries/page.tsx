'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { supabase, Battery, BatteryReview } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Battery as BatteryIcon, Shield, Zap, CheckCircle2, Gauge, Star, Search } from 'lucide-react'

export default function BatteriesPage() {
  const [batteries, setBatteries] = useState<Battery[]>([])
  const [filteredBatteries, setFilteredBatteries] = useState<Battery[]>([])
  const [reviews, setReviews] = useState<BatteryReview[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    async function fetchData() {
      const { data: batteriesData, error: batteriesError } = await supabase
        .from('batteries')
        .select('*')
        .order('capacity', { ascending: false })

      const { data: reviewsData, error: reviewsError } = await supabase
        .from('battery_reviews')
        .select('*')
        .order('created_at', { ascending: false })

      if (batteriesError) {
        console.error('Error fetching batteries:', batteriesError)
      } else {
        setBatteries(batteriesData || [])
        setFilteredBatteries(batteriesData || [])
      }

      if (reviewsError) {
        console.error('Error fetching reviews:', reviewsError)
      } else {
        setReviews(reviewsData || [])
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = batteries.filter(battery =>
        battery.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        battery.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        battery.capacity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        battery.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredBatteries(filtered)
    } else {
      setFilteredBatteries(batteries)
    }
  }, [searchTerm, batteries])

  const features = [
    'High-quality CATL lithium-ion cells',
    'Professional installation included',
    'Extended warranty coverage',
    'Battery management system',
    'Compatible with all Nissan Leaf models',
    'Certified by international standards'
  ]

  function renderStars(rating: number) {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    )
  }

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)
    : '0'

  return (
    <div>
      <section className="relative bg-gradient-to-br from-green-900 to-gray-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <BatteryIcon className="h-16 w-16 mx-auto mb-4 text-green-400" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Electric Vehicle Batteries</h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              Premium battery replacement solutions for your Nissan Leaf with industry-leading warranty
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search batteries by name, brand, capacity..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchTerm && (
              <Button
                variant="outline"
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </Button>
            )}
          </div>
          {searchTerm && (
            <p className="text-sm text-gray-600 mt-2">
              Showing {filteredBatteries.length} of {batteries.length} batteries
            </p>
          )}
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              <p className="mt-4 text-gray-600">Loading batteries...</p>
            </div>
          ) : filteredBatteries.length === 0 ? (
            <div className="text-center py-12">
              <BatteryIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg mb-4">No batteries found matching your search.</p>
              <Button
                variant="outline"
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredBatteries.map((battery, index) => (
                <motion.div
                  key={battery.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-2xl transition-shadow duration-300 h-full">
                    <div className="relative h-64 w-full bg-gray-100">
                      <Image
                        src={battery.image_url || 'https://images.pexels.com/photos/110844/pexels-photo-110844.jpeg'}
                        alt={battery.name}
                        fill
                        className="object-cover"
                      />
                      {battery.in_stock && (
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-green-600 text-white">In Stock</Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            {battery.name}
                          </h2>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-lg">
                              {battery.capacity}
                            </Badge>
                            <Badge variant="outline">{battery.brand}</Badge>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4">{battery.description}</p>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center text-gray-700">
                          <Shield className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                          <span>{battery.warranty_years} Year Warranty</span>
                        </div>
                        {battery.range_with_ac && (
                          <div className="flex items-center text-gray-700">
                            <Gauge className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                            <span>Range with A/C: {battery.range_with_ac}</span>
                          </div>
                        )}
                        {battery.range_without_ac && (
                          <div className="flex items-center text-gray-700">
                            <Gauge className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                            <span>Range without A/C: {battery.range_without_ac}</span>
                          </div>
                        )}
                        <div className="flex items-center text-gray-700">
                          <Zap className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                          <span>Fast Charging Compatible</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                          <span>Professional Installation Included</span>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <p className="text-3xl font-bold text-green-600">
                          LKR {battery.price.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">Installation included</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Industry-leading technology for maximum performance and reliability
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-start space-x-3 bg-white p-4 rounded-lg shadow"
              >
                <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{feature}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Customer Reviews
            </h2>
            <div className="flex items-center justify-center gap-3 mb-2">
              {renderStars(parseFloat(averageRating))}
              <span className="text-2xl font-bold text-gray-900">{averageRating}</span>
              <span className="text-gray-600">({reviews.length} reviews)</span>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{review.customer_name}</h3>
                        {renderStars(review.rating)}
                      </div>
                      {review.verified_purchase && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-700 mb-3">{review.review_text}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(review.review_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-green-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Need Help Choosing?
            </h2>
            <p className="text-xl mb-8 text-green-100">
              Our experts are here to help you select the perfect battery for your Nissan Leaf
            </p>
            <a
              href="/contact"
              className="inline-block bg-white text-green-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Contact Us Today
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
