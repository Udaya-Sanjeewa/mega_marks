'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { uploadImage } from '@/lib/storage'
import AdminNav from '@/components/AdminNav'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  CheckCircle,
  XCircle,
  Clock,
  Car,
  Calendar,
  DollarSign,
  Gauge,
  Battery,
  Loader2,
  Eye,
  Edit,
  Upload,
  X,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'

interface VehicleAd {
  id: string
  user_id: string
  make: string
  model: string
  year: number
  price: number
  mileage: number
  battery_capacity: string
  condition: string
  color: string
  description: string
  features: string[]
  images: string[]
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  customer_profile?: {
    full_name: string
    email: string
    phone: string
  }
}

export default function VehicleAdsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [ads, setAds] = useState<VehicleAd[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [selectedAd, setSelectedAd] = useState<VehicleAd | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingAd, setEditingAd] = useState<VehicleAd | null>(null)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    price: 0,
    mileage: 0,
    battery_capacity: '',
    condition: 'Good',
    color: '',
    description: '',
    features: '',
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/admin/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchAds()
    }
  }, [user])

  const fetchAds = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('customer_vehicle_ads')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching ads:', error)
        toast.error(`Failed to load vehicle ads: ${error.message}`)
      } else {
        const adsWithProfiles = await Promise.all(
          (data || []).map(async (ad) => {
            const { data: profile } = await supabase
              .from('customer_profiles')
              .select('full_name, email, phone')
              .eq('user_id', ad.user_id)
              .maybeSingle()

            return {
              ...ad,
              customer_profile: profile || undefined,
            }
          })
        )
        setAds(adsWithProfiles)
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('An error occurred while loading ads')
    } finally {
      setLoading(false)
    }
  }

  const handleEditAd = (ad: VehicleAd) => {
    setEditingAd(ad)
    setFormData({
      make: ad.make,
      model: ad.model,
      year: ad.year,
      price: ad.price,
      mileage: ad.mileage,
      battery_capacity: ad.battery_capacity,
      condition: ad.condition,
      color: ad.color,
      description: ad.description,
      features: ad.features?.join(', ') || '',
    })
    setExistingImages(ad.images || [])
    setImageFiles([])
    setImagePreviews([])
    setEditDialogOpen(true)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const totalImages = existingImages.length + imageFiles.length + files.length

    if (totalImages > 5) {
      toast.error('Maximum 5 images allowed')
      return
    }

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Each image must be less than 5MB')
        return
      }
    }

    setImageFiles([...imageFiles, ...files])

    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeNewImage = (index: number) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index))
    setImagePreviews(imagePreviews.filter((_, i) => i !== index))
  }

  const removeExistingImage = (index: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== index))
  }

  const handleSaveEdit = async () => {
    if (!editingAd) return

    setUploading(true)
    try {
      let uploadedImageUrls: string[] = []

      for (const file of imageFiles) {
        const url = await uploadImage(file, 'vehicles')
        if (url) {
          uploadedImageUrls.push(url)
        }
      }

      const allImages = [...existingImages, ...uploadedImageUrls]
      const featuresArray = formData.features
        ? formData.features.split(',').map((f) => f.trim()).filter(Boolean)
        : []

      const { error } = await supabase
        .from('customer_vehicle_ads')
        .update({
          make: formData.make,
          model: formData.model,
          year: formData.year,
          price: formData.price,
          mileage: formData.mileage,
          battery_capacity: formData.battery_capacity,
          condition: formData.condition,
          color: formData.color,
          description: formData.description,
          features: featuresArray,
          images: allImages,
        })
        .eq('id', editingAd.id)

      if (error) throw error
      toast.success('Vehicle ad updated successfully')

      setEditDialogOpen(false)
      resetEditForm()
      fetchAds()
    } catch (error: any) {
      console.error('Error saving:', error)
      toast.error(error.message || 'Failed to save changes')
    } finally {
      setUploading(false)
    }
  }

  const resetEditForm = () => {
    setEditingAd(null)
    setImageFiles([])
    setImagePreviews([])
    setExistingImages([])
    setFormData({
      make: '',
      model: '',
      year: new Date().getFullYear(),
      price: 0,
      mileage: 0,
      battery_capacity: '',
      condition: 'Good',
      color: '',
      description: '',
      features: '',
    })
  }

  const handleApprove = async (ad: VehicleAd) => {
    setProcessingId(ad.id)
    try {
      const fullModelName = `${ad.make} ${ad.model}`.trim()

      const { error: insertError } = await supabase.from('vehicles').insert([
        {
          model: fullModelName,
          year: ad.year,
          price: ad.price,
          mileage: ad.mileage,
          battery_capacity: ad.battery_capacity,
          condition: ad.condition,
          color: ad.color,
          image_url: ad.images?.[0] || null,
          images: ad.images,
          features: ad.features,
          available: true,
          is_featured: false,
        },
      ])

      if (insertError) {
        console.error('Error inserting vehicle:', insertError)
        toast.error(`Failed to create vehicle listing: ${insertError.message}`)
        setProcessingId(null)
        return
      }

      const { error: updateError } = await supabase
        .from('customer_vehicle_ads')
        .update({ status: 'approved' })
        .eq('id', ad.id)

      if (updateError) {
        console.error('Error updating ad status:', updateError)
        toast.error('Failed to update ad status')
      } else {
        toast.success('Vehicle ad approved and published!')
        fetchAds()
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('An error occurred')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (adId: string) => {
    setProcessingId(adId)
    try {
      const { error } = await supabase
        .from('customer_vehicle_ads')
        .update({ status: 'rejected' })
        .eq('id', adId)

      if (error) {
        console.error('Error rejecting ad:', error)
        toast.error('Failed to reject ad')
      } else {
        toast.success('Vehicle ad rejected')
        fetchAds()
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('An error occurred')
    } finally {
      setProcessingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        )
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-300">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return null
    }
  }

  const filteredAds = {
    pending: ads.filter((ad) => ad.status === 'pending'),
    approved: ads.filter((ad) => ad.status === 'approved'),
    rejected: ads.filter((ad) => ad.status === 'rejected'),
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    )
  }

  return (
    <div className="flex">
      <AdminNav />
      <div className="ml-64 flex-1 p-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Vehicle Ads</h1>
            <p className="text-gray-600">Review and approve customer vehicle listings</p>
          </div>

          <div className="grid gap-6 mb-6 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">{filteredAds.pending.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Approved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{filteredAds.approved.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Rejected</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{filteredAds.rejected.length}</div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {['pending', 'approved', 'rejected'].map((status) => {
              const statusAds = filteredAds[status as keyof typeof filteredAds]
              if (statusAds.length === 0) return null

              return (
                <div key={status}>
                  <h2 className="text-xl font-semibold mb-4 capitalize">{status} Customer Ads</h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {statusAds.map((ad) => (
                      <Card key={ad.id} className="overflow-hidden">
                        <div className="relative h-48 bg-gray-200">
                          {ad.images && ad.images.length > 0 ? (
                            <img
                              src={ad.images[0]}
                              alt={`${ad.make} ${ad.model}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Car className="h-16 w-16 text-gray-400" />
                            </div>
                          )}
                          <div className="absolute top-2 right-2">{getStatusBadge(ad.status)}</div>
                        </div>
                        <CardHeader>
                          <CardTitle className="text-lg">
                            {ad.make} {ad.model}
                          </CardTitle>
                          <CardDescription>
                            {ad.customer_profile?.full_name || 'Unknown Customer'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            {ad.year}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <DollarSign className="h-4 w-4 mr-2" />
                            LKR {ad.price.toLocaleString()}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Gauge className="h-4 w-4 mr-2" />
                            {ad.mileage.toLocaleString()} km
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Battery className="h-4 w-4 mr-2" />
                            {ad.battery_capacity}
                          </div>

                          <div className="flex gap-2 pt-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedAd(ad)
                                setViewDialogOpen(true)
                              }}
                              className="flex-1"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditAd(ad)}
                              className="flex-1"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </div>

                          {ad.status === 'pending' && (
                            <div className="flex gap-2 pt-2">
                              <Button
                                size="sm"
                                onClick={() => handleApprove(ad)}
                                disabled={processingId === ad.id}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                              >
                                {processingId === ad.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReject(ad.id)}
                                disabled={processingId === ad.id}
                                className="flex-1"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {selectedAd?.make} {selectedAd?.model}
            </DialogTitle>
            <DialogDescription>
              Submitted by {selectedAd?.customer_profile?.full_name || 'Unknown'}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            <div className="space-y-4">
              {selectedAd?.images && selectedAd.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {selectedAd.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Vehicle ${idx + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Year</Label>
                  <p className="text-sm">{selectedAd?.year}</p>
                </div>
                <div>
                  <Label>Condition</Label>
                  <p className="text-sm">{selectedAd?.condition}</p>
                </div>
                <div>
                  <Label>Price</Label>
                  <p className="text-sm">LKR {selectedAd?.price.toLocaleString()}</p>
                </div>
                <div>
                  <Label>Mileage</Label>
                  <p className="text-sm">{selectedAd?.mileage.toLocaleString()} km</p>
                </div>
                <div>
                  <Label>Battery Capacity</Label>
                  <p className="text-sm">{selectedAd?.battery_capacity}</p>
                </div>
                <div>
                  <Label>Color</Label>
                  <p className="text-sm">{selectedAd?.color}</p>
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <p className="text-sm">{selectedAd?.description}</p>
              </div>
              <div>
                <Label>Features</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedAd?.features?.map((feature, idx) => (
                    <Badge key={idx} variant="secondary">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label>Customer Contact</Label>
                <p className="text-sm">{selectedAd?.customer_profile?.email}</p>
                <p className="text-sm">{selectedAd?.customer_profile?.phone}</p>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Customer Vehicle Ad</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="make">Make *</Label>
                <Input
                  id="make"
                  value={formData.make}
                  onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="model">Model *</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="year">Year *</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="mileage">Mileage (km) *</Label>
                <Input
                  id="mileage"
                  type="number"
                  value={formData.mileage}
                  onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="battery_capacity">Battery Capacity *</Label>
                <Input
                  id="battery_capacity"
                  value={formData.battery_capacity}
                  onChange={(e) => setFormData({ ...formData, battery_capacity: e.target.value })}
                  placeholder="e.g., 62kWh"
                />
              </div>
              <div>
                <Label htmlFor="condition">Condition *</Label>
                <Select
                  value={formData.condition}
                  onValueChange={(value) => setFormData({ ...formData, condition: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Excellent">Excellent</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Fair">Fair</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price (LKR) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="features">Features (comma-separated)</Label>
              <Input
                id="features"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                placeholder="e.g., Autopilot, Premium Sound, Glass Roof"
              />
            </div>

            <div>
              <Label>Images (Max 5)</Label>
              <div className="space-y-4">
                {(existingImages.length > 0 || imagePreviews.length > 0) && (
                  <div className="grid grid-cols-3 gap-3">
                    {existingImages.map((url, index) => (
                      <div key={`existing-${index}`} className="relative">
                        <img
                          src={url}
                          alt={`Vehicle ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1"
                          onClick={() => removeExistingImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {imagePreviews.map((preview, index) => (
                      <div key={`preview-${index}`} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1"
                          onClick={() => removeNewImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                {existingImages.length + imagePreviews.length < 5 && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      {existingImages.length + imagePreviews.length}/5 images
                    </p>
                    <Input type="file" accept="image/*" multiple onChange={handleImageChange} />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSaveEdit}
                disabled={uploading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditDialogOpen(false)
                  resetEditForm()
                }}
                disabled={uploading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
