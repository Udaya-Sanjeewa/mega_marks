'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Car, Upload, X, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function SellVehiclePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    battery_capacity: '',
    condition: 'Good',
    mileage: 0,
    price: 0,
    color: '',
    description: '',
    features: ''
  })

  useEffect(() => {
    const checkAuth = async () => {
      if (!authLoading) {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          toast.error('Please login to post a vehicle ad')
          setTimeout(() => {
            router.push('/customer/login')
          }, 1500)
        } else {
          setCheckingAuth(false)
        }
      }
    }
    checkAuth()
  }, [authLoading, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    if (images.length + files.length > 5) {
      toast.error('You can upload maximum 5 images')
      return
    }

    setImages(prev => [...prev, ...files])

    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const uploadImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = []

    for (const image of images) {
      const fileExt = image.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
      const filePath = `vehicle-listings/${fileName}`

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, image)

      if (error) {
        console.error('Error uploading image:', error)
        throw error
      }

      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      uploadedUrls.push(publicUrlData.publicUrl)
    }

    return uploadedUrls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast.error('Please login to post a vehicle ad')
      router.push('/customer/login')
      return
    }

    setLoading(true)

    try {
      let imageUrls: string[] = []

      if (images.length > 0) {
        imageUrls = await uploadImages()
      }

      const featuresArray = formData.features
        .split('\n')
        .filter(f => f.trim() !== '')
        .map(f => f.trim())

      const { error } = await supabase
        .from('customer_vehicle_ads')
        .insert({
          user_id: user.id,
          make: formData.make,
          model: formData.model,
          year: parseInt(formData.year.toString()),
          battery_capacity: formData.battery_capacity,
          condition: formData.condition,
          mileage: parseInt(formData.mileage.toString()),
          price: parseFloat(formData.price.toString()),
          color: formData.color || null,
          description: formData.description || null,
          features: featuresArray.length > 0 ? featuresArray : null,
          images: imageUrls.length > 0 ? imageUrls : null,
          status: 'pending'
        })

      if (error) {
        console.error('Error submitting listing:', error)
        toast.error('Failed to submit listing. Please try again.')
        throw error
      }

      setSubmitted(true)
      toast.success('Your vehicle ad has been submitted for approval!')
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <Card className="text-center">
            <CardContent className="pt-8 pb-6">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Ad Submitted!</h2>
              <p className="text-gray-600 mb-6">
                Your vehicle ad has been submitted for review. Our team will review it and notify you once it's approved.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => router.push('/customer/dashboard')}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Go to Dashboard
                </Button>
                <Button
                  onClick={() => router.push('/vehicles')}
                  variant="outline"
                  className="w-full"
                >
                  Browse Vehicles
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-blue-900 to-gray-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Car className="h-16 w-16 mx-auto mb-4 text-blue-400" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Sell Your Vehicle with Mega Marks</h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              List your Nissan Leaf with us and reach thousands of potential buyers
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Vehicle Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="make">Make *</Label>
                        <Input
                          id="make"
                          name="make"
                          value={formData.make}
                          onChange={handleInputChange}
                          required
                          placeholder="Nissan"
                        />
                      </div>
                      <div>
                        <Label htmlFor="model">Model *</Label>
                        <Input
                          id="model"
                          name="model"
                          value={formData.model}
                          onChange={handleInputChange}
                          required
                          placeholder="Leaf S"
                        />
                      </div>
                      <div>
                        <Label htmlFor="year">Year *</Label>
                        <Input
                          id="year"
                          name="year"
                          type="number"
                          min="2010"
                          max={new Date().getFullYear()}
                          value={formData.year}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="battery_capacity">Battery Capacity *</Label>
                        <Input
                          id="battery_capacity"
                          name="battery_capacity"
                          value={formData.battery_capacity}
                          onChange={handleInputChange}
                          required
                          placeholder="24 kWh"
                        />
                      </div>
                      <div>
                        <Label htmlFor="condition">Condition *</Label>
                        <select
                          id="condition"
                          name="condition"
                          value={formData.condition}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Excellent">Excellent</option>
                          <option value="Good">Good</option>
                          <option value="Fair">Fair</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="mileage">Mileage (km) *</Label>
                        <Input
                          id="mileage"
                          name="mileage"
                          type="number"
                          min="0"
                          value={formData.mileage}
                          onChange={handleInputChange}
                          required
                          placeholder="50000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="price">Asking Price (LKR) *</Label>
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          min="0"
                          value={formData.price}
                          onChange={handleInputChange}
                          required
                          placeholder="2500000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="color">Color</Label>
                        <Input
                          id="color"
                          name="color"
                          value={formData.color}
                          onChange={handleInputChange}
                          placeholder="White"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="Describe your vehicle's condition, maintenance history, and any other relevant details..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="features">Features (one per line)</Label>
                      <Textarea
                        id="features"
                        name="features"
                        value={formData.features}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="Autopilot&#10;Leather seats&#10;Navigation system&#10;Backup camera"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-6 space-y-4">
                    <div>
                      <Label>Vehicle Images (Max 5)</Label>
                      <div className="mt-2">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600">Click to upload images</p>
                            <p className="text-xs text-gray-500">PNG, JPG up to 10MB each</p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageSelect}
                            className="hidden"
                            disabled={images.length >= 5}
                          />
                        </label>
                      </div>

                      {imagePreviews.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-4 w-4" />
                              </button>
                              <Badge className="absolute bottom-2 left-2 bg-black/60">
                                {index + 1}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/vehicles')}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Listing'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
