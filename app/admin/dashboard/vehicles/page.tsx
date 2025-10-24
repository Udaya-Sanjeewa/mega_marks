'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, Vehicle } from '@/lib/supabase'
import { uploadImage, deleteImage, updateImage } from '@/lib/storage'
import AdminNav from '@/components/AdminNav'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Plus, Edit, Trash2, Upload, X, CheckCircle, XCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
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

export default function VehiclesManagement() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    model: '',
    year: '',
    battery_capacity: '',
    condition: 'Used',
    mileage: '',
    price: '',
    color: '',
    description: '',
    features: '',
    available: true,
    is_featured: false,
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login')
    } else if (user) {
      fetchVehicles()
    }
  }, [user, loading, router])

  const fetchVehicles = async () => {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setVehicles(data)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const totalImages = existingImages.length + imageFiles.length + files.length

    if (totalImages > 5) {
      toast({
        title: 'Error',
        description: 'Maximum 5 images allowed per vehicle',
        variant: 'destructive',
      })
      return
    }

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Error',
          description: 'Each image must be less than 5MB',
          variant: 'destructive',
        })
        return
      }
    }

    const newFiles = [...imageFiles, ...files]
    setImageFiles(newFiles)

    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeNewImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    const uploadedImageUrls: string[] = []

    for (const file of imageFiles) {
      const url = await uploadImage(file, 'vehicles')
      if (url) {
        uploadedImageUrls.push(url)
      } else {
        toast({
          title: 'Error',
          description: 'Failed to upload one or more images',
          variant: 'destructive',
        })
        setUploading(false)
        return
      }
    }

    const allImages = [...existingImages, ...uploadedImageUrls]
    const mainImage = allImages[0] || null

    const vehicleData = {
      model: formData.model,
      year: parseInt(formData.year),
      battery_capacity: formData.battery_capacity,
      condition: formData.condition,
      mileage: parseInt(formData.mileage),
      price: parseFloat(formData.price),
      color: formData.color,
      description: formData.description,
      image_url: mainImage,
      images: allImages,
      features: formData.features ? formData.features.split(',').map(f => f.trim()) : [],
      available: formData.available,
      is_featured: formData.is_featured,
    }

    if (editingVehicle) {
      const { error } = await supabase
        .from('vehicles')
        .update(vehicleData)
        .eq('id', editingVehicle.id)

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to update vehicle',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: 'Vehicle updated successfully',
        })
        resetForm()
        fetchVehicles()
      }
    } else {
      const { error } = await supabase.from('vehicles').insert([vehicleData])

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to add vehicle',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: 'Vehicle added successfully',
        })
        resetForm()
        fetchVehicles()
      }
    }

    setUploading(false)
  }

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
    setFormData({
      model: vehicle.model,
      year: vehicle.year.toString(),
      battery_capacity: vehicle.battery_capacity,
      condition: vehicle.condition,
      mileage: vehicle.mileage.toString(),
      price: vehicle.price.toString(),
      color: vehicle.color || '',
      description: vehicle.description || '',
      features: vehicle.features ? vehicle.features.join(', ') : '',
      available: vehicle.available,
      is_featured: vehicle.is_featured,
    })
    setExistingImages(vehicle.images || (vehicle.image_url ? [vehicle.image_url] : []))
    setImageFiles([])
    setImagePreviews([])
    setIsDialogOpen(true)
  }

  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('vehicles')
      .update({ available: !currentStatus })
      .eq('id', id)

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update vehicle status',
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Success',
        description: `Vehicle marked as ${!currentStatus ? 'available' : 'sold'}`,
      })
      fetchVehicles()
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this vehicle?')) {
      const vehicle = vehicles.find(v => v.id === id)

      if (vehicle?.image_url) {
        await deleteImage(vehicle.image_url)
      }

      const { error } = await supabase.from('vehicles').delete().eq('id', id)

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete vehicle',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: 'Vehicle deleted successfully',
        })
        fetchVehicles()
      }
    }
  }

  const resetForm = () => {
    setFormData({
      model: '',
      year: '',
      battery_capacity: '',
      condition: 'Used',
      mileage: '',
      price: '',
      color: '',
      description: '',
      features: '',
      available: true,
      is_featured: false,
    })
    setEditingVehicle(null)
    setImageFiles([])
    setImagePreviews([])
    setExistingImages([])
    setIsDialogOpen(false)
  }

  if (loading || !user) {
    return null
  }

  return (
    <div className="flex">
      <AdminNav />
      <div className="ml-64 flex-1 p-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Vehicles</h1>
              <p className="text-gray-600">Manage vehicle inventory</p>
            </div>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Vehicle
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg">{vehicle.model}</h3>
                        <p className="text-sm text-gray-600">{vehicle.year} - {vehicle.condition}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(vehicle)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(vehicle.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {vehicle.battery_capacity} • {vehicle.mileage.toLocaleString()} km
                    </p>
                    <p className="text-xl font-bold text-blue-600 mb-2">
                      LKR {vehicle.price.toLocaleString()}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className={`text-xs font-semibold ${vehicle.available ? 'text-green-600' : 'text-red-600'}`}>
                        {vehicle.available ? 'Available' : 'Sold'}
                      </div>
                      <Button
                        size="sm"
                        variant={vehicle.available ? 'outline' : 'default'}
                        className={vehicle.available ? 'border-red-500 text-red-600 hover:bg-red-50' : 'bg-green-600 hover:bg-green-700'}
                        onClick={() => toggleAvailability(vehicle.id, vehicle.available)}
                      >
                        {vehicle.available ? (
                          <>
                            <XCircle className="h-4 w-4 mr-1" />
                            Mark as Sold
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark as Available
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="model">Model Name *</Label>
                  <Input
                    id="model"
                    placeholder="e.g., Nissan Leaf SV"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="year">Year *</Label>
                    <Input
                      id="year"
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="battery_capacity">Battery Capacity *</Label>
                    <Input
                      id="battery_capacity"
                      placeholder="e.g., 62kWh"
                      value={formData.battery_capacity}
                      onChange={(e) => setFormData({ ...formData, battery_capacity: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                        <SelectItem value="New">New</SelectItem>
                        <SelectItem value="Certified Pre-Owned">Certified Pre-Owned</SelectItem>
                        <SelectItem value="Used">Used</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="mileage">Mileage (km) *</Label>
                    <Input
                      id="mileage"
                      type="number"
                      value={formData.mileage}
                      onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price (LKR) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
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
                    placeholder="Enter a detailed description of the vehicle..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="features">Features (comma-separated)</Label>
                  <Input
                    id="features"
                    placeholder="e.g., ProPILOT Assist, Apple CarPlay, Fast Charging"
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="image">Vehicle Images (Max 5)</Label>
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
                            {index === 0 && (
                              <div className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                                Main
                              </div>
                            )}
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
                            {existingImages.length === 0 && index === 0 && (
                              <div className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                                Main
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {(existingImages.length + imagePreviews.length) < 5 && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-sm text-gray-600 mb-2">
                          Add {existingImages.length + imagePreviews.length > 0 ? 'more' : ''} images
                        </p>
                        <p className="text-xs text-gray-500 mb-2">
                          {existingImages.length + imagePreviews.length}/5 images uploaded
                        </p>
                        <p className="text-xs text-gray-500 mb-4">PNG, JPG, WEBP up to 5MB each</p>
                        <Input
                          id="image"
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageChange}
                          className="mt-4"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="available"
                    checked={formData.available}
                    onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="available">Available for Sale</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="is_featured">Featured on Home Page</Label>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={uploading}>
                    {uploading ? 'Uploading...' : editingVehicle ? 'Update' : 'Add'} {uploading ? '' : 'Vehicle'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm} disabled={uploading}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
