'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { supabase, Part } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Wrench, Package, CheckCircle2, ArrowLeft, Car } from 'lucide-react'

export default function PartDetailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const partId = searchParams?.get('id')

  const [part, setPart] = useState<Part | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPart() {
      if (!partId) return

      const { data, error } = await supabase
        .from('parts')
        .select('*')
        .eq('id', partId)
        .maybeSingle()

      if (error) {
        console.error('Error fetching part:', error)
      } else if (data) {
        setPart(data)
      }

      setLoading(false)
    }

    fetchPart()
  }, [partId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
      </div>
    )
  }

  if (!part) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Part not found</h1>
        <Button onClick={() => router.push('/parts')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Parts
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="outline" onClick={() => router.push('/parts')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Parts
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
                    src={part.image_url || 'https://images.pexels.com/photos/3807386/pexels-photo-3807386.jpeg'}
                    alt={part.name}
                    fill
                    className={`object-cover ${!part.in_stock ? 'grayscale' : ''}`}
                  />
                  {!part.in_stock && (
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
                    {part.in_stock ? (
                      <Badge className="bg-green-600">In Stock</Badge>
                    ) : (
                      <Badge className="bg-red-600">Out of Stock</Badge>
                    )}
                    <Badge variant="secondary">{part.category}</Badge>
                  </div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">{part.name}</h1>
                  <p className="text-3xl font-bold text-gray-700">
                    LKR {part.price.toLocaleString()}
                  </p>
                </div>

                {part.description && (
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-3">Description</h2>
                      <p className="text-gray-700">{part.description}</p>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Product Details</h2>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2 border-b">
                        <div className="flex items-center text-gray-600">
                          <Wrench className="h-5 w-5 mr-3 text-gray-600" />
                          <span>Category</span>
                        </div>
                        <span className="font-semibold text-gray-900">{part.category}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b">
                        <div className="flex items-center text-gray-600">
                          <Package className="h-5 w-5 mr-3 text-gray-600" />
                          <span>Stock Quantity</span>
                        </div>
                        <span className="font-semibold text-gray-900">{part.stock_quantity} units</span>
                      </div>
                      {part.compatible_models && part.compatible_models.length > 0 && (
                        <div className="flex items-start justify-between py-2">
                          <div className="flex items-center text-gray-600">
                            <Car className="h-5 w-5 mr-3 text-gray-600 mt-1" />
                            <span>Compatible Models</span>
                          </div>
                          <div className="text-right">
                            {part.compatible_models.map((model, index) => (
                              <div key={index} className="font-semibold text-gray-900">
                                {model}
                              </div>
                            ))}
                          </div>
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
                        'Genuine OEM quality',
                        'Perfect fit guaranteed',
                        'Durable and long-lasting',
                        'Easy installation',
                        'Backed by warranty',
                        'Expert support available'
                      ].map((feature, index) => (
                        <div key={index} className="flex items-center text-gray-700">
                          <CheckCircle2 className="h-5 w-5 mr-2 text-gray-600 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-50 border-gray-200">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Interested in this part?</h2>
                    <p className="text-gray-600 mb-4">
                      Contact us for more information, compatibility check, or to place an order.
                    </p>
                    <Button
                      className="w-full bg-gray-700 hover:bg-gray-800"
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
