'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { supabase, Battery } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Battery as BatteryIcon, Gauge, Shield, Calendar, CheckCircle2, ArrowLeft, Zap } from 'lucide-react'

export default function BatteryDetailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const batteryId = searchParams?.get('id')

  const [battery, setBattery] = useState<Battery | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBattery() {
      if (!batteryId) return

      const { data, error } = await supabase
        .from('batteries')
        .select('*')
        .eq('id', batteryId)
        .maybeSingle()

      if (error) {
        console.error('Error fetching battery:', error)
      } else if (data) {
        setBattery(data)
      }

      setLoading(false)
    }

    fetchBattery()
  }, [batteryId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!battery) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Battery not found</h1>
        <Button onClick={() => router.push('/batteries')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Batteries
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="outline" onClick={() => router.push('/batteries')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Batteries
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
                    src={battery.image_url || 'https://images.pexels.com/photos/110844/pexels-photo-110844.jpeg'}
                    alt={battery.name}
                    fill
                    className={`object-cover ${!battery.in_stock ? 'grayscale' : ''}`}
                  />
                  {!battery.in_stock && (
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                      <Badge className="bg-red-600 text-white text-2xl px-8 py-3">OUT OF STOCK</Badge>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    {battery.in_stock ? (
                      <Badge className="bg-green-600">In Stock</Badge>
                    ) : (
                      <Badge className="bg-red-600">Out of Stock</Badge>
                    )}
                    <Badge variant="secondary">{battery.brand}</Badge>
                  </div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">{battery.name}</h1>
                  <p className="text-3xl font-bold text-green-600">
                    LKR {battery.price.toLocaleString()}
                  </p>
                </div>

                {battery.description && (
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-3">Description</h2>
                      <p className="text-gray-700">{battery.description}</p>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Specifications</h2>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2 border-b">
                        <div className="flex items-center text-gray-600">
                          <BatteryIcon className="h-5 w-5 mr-3 text-green-600" />
                          <span>Capacity</span>
                        </div>
                        <span className="font-semibold text-gray-900">{battery.capacity}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b">
                        <div className="flex items-center text-gray-600">
                          <Shield className="h-5 w-5 mr-3 text-green-600" />
                          <span>Warranty</span>
                        </div>
                        <span className="font-semibold text-gray-900">{battery.warranty_years} Years</span>
                      </div>
                      {battery.range_with_ac && (
                        <div className="flex items-center justify-between py-2 border-b">
                          <div className="flex items-center text-gray-600">
                            <Gauge className="h-5 w-5 mr-3 text-green-600" />
                            <span>Range (with AC)</span>
                          </div>
                          <span className="font-semibold text-gray-900">{battery.range_with_ac}</span>
                        </div>
                      )}
                      {battery.range_without_ac && (
                        <div className="flex items-center justify-between py-2">
                          <div className="flex items-center text-gray-600">
                            <Gauge className="h-5 w-5 mr-3 text-green-600" />
                            <span>Range (without AC)</span>
                          </div>
                          <span className="font-semibold text-gray-900">{battery.range_without_ac}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Key Features</h2>
                    <div className="space-y-3">
                      {[
                        'High-performance lithium-ion cells',
                        'Advanced battery management system',
                        'Temperature control technology',
                        'Long cycle life',
                        'Fast charging capability',
                        'Professional installation included'
                      ].map((feature, index) => (
                        <div key={index} className="flex items-center text-gray-700">
                          <CheckCircle2 className="h-5 w-5 mr-2 text-green-600 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Interested in this battery?</h2>
                    <p className="text-gray-600 mb-4">
                      Contact us for more information, installation scheduling, or to place an order.
                    </p>
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
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
