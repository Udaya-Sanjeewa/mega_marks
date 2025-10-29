'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Head from 'next/head'
import { supabase, Vehicle } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Car, Gauge, Battery, Calendar, CheckCircle2, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'

interface SEOSettings {
  meta_title: string
  meta_description: string
  meta_keywords: string
  og_title: string
  og_description: string
}

export default function VehicleDetailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const vehicleId = searchParams?.get('id')

  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [seoSettings, setSeoSettings] = useState<SEOSettings | null>(null)

  useEffect(() => {
    async function fetchData() {
      if (!vehicleId) return

      const [vehicleResponse, seoResponse] = await Promise.all([
        supabase.from('vehicles').select('*').eq('id', vehicleId).maybeSingle(),
        supabase.from('seo_settings').select('*').eq('page_type', 'vehicles').maybeSingle()
      ])

      if (vehicleResponse.error) {
        console.error('Error fetching vehicle:', vehicleResponse.error)
      } else if (vehicleResponse.data) {
        setVehicle(vehicleResponse.data)
      }

      if (seoResponse.data) {
        setSeoSettings(seoResponse.data)
      }

      setLoading(false)
    }

    fetchData()
  }, [vehicleId])

  useEffect(() => {
    if (vehicle && seoSettings) {
      const pageTitle = `${vehicle.model} ${vehicle.year} | ${seoSettings.meta_title}`
      const pageDescription = vehicle.description
        ? `${vehicle.description.substring(0, 150)}...`
        : seoSettings.meta_description

      document.title = pageTitle

      const metaDescription = document.querySelector('meta[name="description"]')
      if (metaDescription) {
        metaDescription.setAttribute('content', pageDescription)
      } else {
        const meta = document.createElement('meta')
        meta.name = 'description'
        meta.content = pageDescription
        document.head.appendChild(meta)
      }

      const metaKeywords = document.querySelector('meta[name="keywords"]')
      if (metaKeywords) {
        metaKeywords.setAttribute('content', seoSettings.meta_keywords)
      } else {
        const meta = document.createElement('meta')
        meta.name = 'keywords'
        meta.content = seoSettings.meta_keywords
        document.head.appendChild(meta)
      }

      const ogTitle = document.querySelector('meta[property="og:title"]')
      if (ogTitle) {
        ogTitle.setAttribute('content', pageTitle)
      } else {
        const meta = document.createElement('meta')
        meta.setAttribute('property', 'og:title')
        meta.content = pageTitle
        document.head.appendChild(meta)
      }

      const ogDescription = document.querySelector('meta[property="og:description"]')
      if (ogDescription) {
        ogDescription.setAttribute('content', pageDescription)
      } else {
        const meta = document.createElement('meta')
        meta.setAttribute('property', 'og:description')
        meta.content = pageDescription
        document.head.appendChild(meta)
      }

      if (vehicle.image_url || vehicle.images?.[0]) {
        const imageUrl = vehicle.image_url || vehicle.images?.[0] || ''
        if (imageUrl) {
          const ogImage = document.querySelector('meta[property="og:image"]')
          if (ogImage) {
            ogImage.setAttribute('content', imageUrl)
          } else {
            const meta = document.createElement('meta')
            meta.setAttribute('property', 'og:image')
            meta.content = imageUrl
            document.head.appendChild(meta)
          }
        }
      }
    }
  }, [vehicle, seoSettings])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Vehicle not found</h1>
        <Button onClick={() => router.push('/vehicles')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Vehicles
        </Button>
      </div>
    )
  }

  const images = vehicle.images && vehicle.images.length > 0
    ? vehicle.images
    : vehicle.image_url
    ? [vehicle.image_url]
    : ['https://images.pexels.com/photos/110844/pexels-photo-110844.jpeg']

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="outline" onClick={() => router.push('/vehicles')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Vehicles
          </Button>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="overflow-hidden">
                <div className="relative h-96 w-full bg-gray-100">
                  <Image
                    src={images[currentImageIndex]}
                    alt={vehicle.model}
                    fill
                    className={`object-cover ${!vehicle.available ? 'grayscale' : ''}`}
                  />
                  {!vehicle.available && (
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                      <Badge className="bg-red-600 text-white text-2xl px-8 py-3">SOLD</Badge>
                    </div>
                  )}
                  {images.length > 1 && (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
                        onClick={nextImage}
                      >
                        <ChevronRight className="h-6 w-6" />
                      </Button>
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                        {currentImageIndex + 1} / {images.length}
                      </div>
                    </>
                  )}
                </div>
              </Card>

              {images.length > 1 && (
                <div className="grid grid-cols-5 gap-2 mt-4">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        currentImageIndex === index ? 'border-blue-600' : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${vehicle.model} ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    {vehicle.available ? (
                      <Badge className="bg-green-600">Available</Badge>
                    ) : (
                      <Badge className="bg-red-600">Sold</Badge>
                    )}
                    <Badge variant="secondary">{vehicle.condition}</Badge>
                  </div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">{vehicle.model}</h1>
                  <p className="text-3xl font-bold text-blue-600">
                    LKR {vehicle.price.toLocaleString()}
                  </p>
                </div>

                {vehicle.description && (
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{vehicle.description}</p>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Specifications</h2>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2 border-b">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-5 w-5 mr-3 text-blue-600" />
                          <span>Year</span>
                        </div>
                        <span className="font-semibold text-gray-900">{vehicle.year}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b">
                        <div className="flex items-center text-gray-600">
                          <Battery className="h-5 w-5 mr-3 text-blue-600" />
                          <span>Battery Capacity</span>
                        </div>
                        <span className="font-semibold text-gray-900">{vehicle.battery_capacity}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b">
                        <div className="flex items-center text-gray-600">
                          <Gauge className="h-5 w-5 mr-3 text-blue-600" />
                          <span>Mileage</span>
                        </div>
                        <span className="font-semibold text-gray-900">{vehicle.mileage.toLocaleString()} km</span>
                      </div>
                      {vehicle.color && (
                        <div className="flex items-center justify-between py-2 border-b">
                          <div className="flex items-center text-gray-600">
                            <Car className="h-5 w-5 mr-3 text-blue-600" />
                            <span>Color</span>
                          </div>
                          <span className="font-semibold text-gray-900">{vehicle.color}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center text-gray-600">
                          <CheckCircle2 className="h-5 w-5 mr-3 text-blue-600" />
                          <span>Condition</span>
                        </div>
                        <span className="font-semibold text-gray-900">{vehicle.condition}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {vehicle.features && vehicle.features.length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-4">Key Features</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {vehicle.features.map((feature, index) => (
                          <div key={index} className="flex items-center text-gray-700">
                            <CheckCircle2 className="h-5 w-5 mr-2 text-green-600 flex-shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Interested in this vehicle?</h2>
                    <p className="text-gray-600 mb-4">
                      Contact us for more information or to schedule a test drive.
                    </p>
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => router.push('/contact')}
                    >
                      Contact Us
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
