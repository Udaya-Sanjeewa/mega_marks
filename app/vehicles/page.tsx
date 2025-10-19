'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { supabase, Vehicle, VehicleReview } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Car, Gauge, Battery, Calendar, CheckCircle2, Star, Search } from 'lucide-react'

export default function VehiclesPage() {
  const router = useRouter()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([])
  const [reviews, setReviews] = useState<VehicleReview[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    async function fetchData() {
      let query = supabase.from('vehicles').select('*')

      if (filter !== 'all') {
        query = query.eq('condition', filter)
      }

      const { data: vehiclesData, error: vehiclesError } = await query

      const { data: reviewsData, error: reviewsError } = await supabase
        .from('vehicle_reviews')
        .select('*')
        .order('created_at', { ascending: false })

      if (vehiclesError) {
        console.error('Error fetching vehicles:', vehiclesError)
      } else {
        const sortedVehicles = (vehiclesData || []).sort((a, b) => {
          if (a.available === b.available) {
            return b.year - a.year
          }
          return a.available ? -1 : 1
        })
        setVehicles(sortedVehicles)
        setFilteredVehicles(sortedVehicles)
      }

      if (reviewsError) {
        console.error('Error fetching reviews:', reviewsError)
      } else {
        setReviews(reviewsData || [])
      }

      setLoading(false)
    }

    fetchData()
  }, [filter])

  useEffect(() => {
    let filtered = vehicles

    if (searchTerm) {
      filtered = vehicles.filter(vehicle =>
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.year.toString().includes(searchTerm) ||
        vehicle.battery_capacity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.color?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    const sortedFiltered = filtered.sort((a, b) => {
      if (a.available === b.available) {
        return b.year - a.year
      }
      return a.available ? -1 : 1
    })

    setFilteredVehicles(sortedFiltered)
  }, [searchTerm, vehicles])

  const conditions = ['all', 'Certified Pre-Owned', 'Used']

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
      <section className="relative bg-gradient-to-br from-blue-900 to-gray-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Car className="h-16 w-16 mx-auto mb-4 text-blue-400" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Nissan Leaf Vehicles</h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              Quality certified and pre-owned Nissan Leaf electric vehicles ready for the road
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 w-full relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search vehicles by model, year, battery capacity..."
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
            <div className="flex flex-wrap gap-3 justify-center">
              {conditions.map((condition) => (
                <Button
                  key={condition}
                  onClick={() => setFilter(condition)}
                  variant={filter === condition ? 'default' : 'outline'}
                  className={filter === condition ? 'bg-blue-600 hover:bg-blue-700' : ''}
                >
                  {condition === 'all' ? 'All Vehicles' : condition}
                </Button>
              ))}
            </div>
            {searchTerm && (
              <p className="text-sm text-gray-600 text-center">
                Showing {filteredVehicles.length} of {vehicles.length} vehicles
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading vehicles...</p>
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="text-center py-12">
              <Car className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg mb-4">No vehicles found matching your criteria.</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('')
                  setFilter('all')
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredVehicles.map((vehicle, index) => (
                <motion.div
                  key={vehicle.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="cursor-pointer"
                  onClick={() => router.push(`/vehicles/detail?id=${vehicle.id}`)}
                >
                  <Card className={`overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full ${!vehicle.available ? 'opacity-75' : ''}`}>
                    <div className="relative h-56 w-full bg-gray-100">
                      <Image
                        src={vehicle.image_url || 'https://images.pexels.com/photos/110844/pexels-photo-110844.jpeg'}
                        alt={vehicle.model}
                        fill
                        className={`object-cover ${!vehicle.available ? 'grayscale' : ''}`}
                      />
                      {!vehicle.available && (
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                          <Badge className="bg-red-600 text-white text-lg px-6 py-2">SOLD</Badge>
                        </div>
                      )}
                      <div className="absolute top-4 right-4 space-y-2">
                        {vehicle.available && (
                          <Badge className="bg-green-600 block">Available</Badge>
                        )}
                        <Badge variant="secondary" className="block">
                          {vehicle.condition}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {vehicle.model}
                      </h3>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-2 text-blue-600 flex-shrink-0" />
                          <span className="text-sm">Year: {vehicle.year}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Battery className="h-4 w-4 mr-2 text-blue-600 flex-shrink-0" />
                          <span className="text-sm">Battery: {vehicle.battery_capacity}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Gauge className="h-4 w-4 mr-2 text-blue-600 flex-shrink-0" />
                          <span className="text-sm">Mileage: {vehicle.mileage.toLocaleString()} km</span>
                        </div>
                        {vehicle.color && (
                          <div className="flex items-center text-gray-600">
                            <div className="h-4 w-4 mr-2 rounded-full border-2 border-gray-300 flex-shrink-0"></div>
                            <span className="text-sm">Color: {vehicle.color}</span>
                          </div>
                        )}
                      </div>

                      {vehicle.features && vehicle.features.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-semibold text-gray-900 mb-2">Key Features:</p>
                          <div className="space-y-1">
                            {vehicle.features.slice(0, 3).map((feature, idx) => (
                              <div key={idx} className="flex items-center text-sm text-gray-600">
                                <CheckCircle2 className="h-3 w-3 mr-2 text-green-600 flex-shrink-0" />
                                {feature}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="border-t pt-4">
                        <p className="text-3xl font-bold text-blue-600">
                          LKR {vehicle.price.toLocaleString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-white">
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

      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Interested in a Vehicle?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Schedule a test drive or get more information from our sales team
            </p>
            <a
              href="/contact"
              className="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Contact Us
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
