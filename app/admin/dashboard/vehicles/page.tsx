'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { uploadImage, deleteImage } from '@/lib/storage'
import AdminNav from '@/components/AdminNav'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { Plus, Edit, Trash2, X, Upload, Star } from 'lucide-react'
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

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  battery_capacity: string
  condition: string
  mileage: number
  price: number
  color?: string
  description?: string
  features?: string[]
  images?: string[]
  image_url?: string
  is_featured: boolean
  available: boolean
}

export default function VehiclesManagement() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
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
    features: '',
    images: [] as string[],
    image_url: '',
    is_featured: false,
    available: true,
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
    } else if (error) {
      console.error('Error fetching vehicles:', error)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Error',
          description: `${file.name} is too large. Max size is 5MB`,
          variant: 'destructive',
        })
        return false
      }
      return true
    })

    setImageFiles([...imageFiles, ...validFiles])

    validFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index))
    setImagePreviews(imagePreviews.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    try {
      let uploadedImageUrls: string[] = []

      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const imageUrl = await uploadImage(file, 'vehicles')
          if (imageUrl) {
            uploadedImageUrls.push(imageUrl)
          }
        }
      }

      const allImages = [...formData.images, ...uploadedImageUrls]
      const featuresArray = formData.features
        ? formData.features.split(',').map((f) => f.trim()).filter(Boolean)
        : []

      const vehicleData = {
        make: formData.make,
        model: formData.model,
        year: formData.year,
        battery_capacity: formData.battery_capacity,
        condition: formData.condition,
        mileage: formData.mileage,
        price: formData.price,
        color: formData.color || null,
        description: formData.description || null,
        features: featuresArray,
        images: allImages.length > 0 ? allImages : null,
        image_url: allImages[0] || formData.image_url || null,
        is_featured: formData.is_featured,
        available: formData.available,
      }

      if (editingVehicle) {
        const { error } = await supabase
          .from('vehicles')
          .update(vehicleData)
          .eq('id', editingVehicle.id)

        if (error) throw error

        toast({
          title: 'Success',
          description: 'Vehicle updated successfully',
        })
      } else {
        const { error } = await supabase.from('vehicles').insert([vehicleData])

        if (error) throw error

        toast({
          title: 'Success',
          description: 'Vehicle added successfully',
        })
      }

      setIsDialogOpen(false)
      resetForm()
      fetchVehicles()
    } catch (error: any) {
      console.error('Error saving vehicle:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to save vehicle',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
    setFormData({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      battery_capacity: vehicle.battery_capacity,
      condition: vehicle.condition,
      mileage: vehicle.mileage,
      price: vehicle.price,
      color: vehicle.color || '',
      description: vehicle.description || '',
      features: vehicle.features?.join(', ') || '',
      images: vehicle.images || [],
      image_url: vehicle.image_url || '',
      is_featured: vehicle.is_featured || false,
      available: vehicle.available !== false,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return

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

  const resetForm = () => {
    setFormData({
      make: '',
      model: '',
      year: new Date().getFullYear(),
      battery_capacity: '',
      condition: 'Good',
      mileage: 0,
      price: 0,
      color: '',
      description: '',
      features: '',
      images: [],
      image_url: '',
      is_featured: false,
      available: true,
    })
    setEditingVehicle(null)
    setImageFiles([])
    setImagePreviews([])
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AdminNav />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-slate-800">Manage Vehicles</h1>
            <Button
              onClick={() => {
                resetForm()
                setIsDialogOpen(true)
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Vehicle
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((vehicle) => (
              <Card key={vehicle.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  {(vehicle.images?.[0] || vehicle.image_url) && (
                    <img
                      src={vehicle.images?.[0] || vehicle.image_url}
                      alt={`${vehicle.make} ${vehicle.model}`}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-lg">
                        {vehicle.make} {vehicle.model} ({vehicle.year})
                      </h3>
                      {vehicle.is_featured && (
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                    <p className="text-sm text-slate-600">
                      {vehicle.condition} • {vehicle.mileage.toLocaleString()} miles
                    </p>
                    <p className="text-sm text-slate-600">
                      Battery: {vehicle.battery_capacity}
                    </p>
                    <p className="text-lg font-bold text-green-600">
                      ${vehicle.price.toLocaleString()}
                    </p>
                    <div className="flex gap-2 mt-4">
                      <Button
                        onClick={() => handleEdit(vehicle)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(vehicle.id)}
                        variant="outline"
                        size="sm"
                        className="flex-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="make">Make *</Label>
                <Input
                  id="make"
                  value={formData.make}
                  onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="model">Model *</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  required
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
                  onChange={(e) =>
                    setFormData({ ...formData, year: parseInt(e.target.value) })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="mileage">Mileage *</Label>
                <Input
                  id="mileage"
                  type="number"
                  value={formData.mileage}
                  onChange={(e) =>
                    setFormData({ ...formData, mileage: parseInt(e.target.value) })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="battery_capacity">Battery Capacity *</Label>
                <Input
                  id="battery_capacity"
                  value={formData.battery_capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, battery_capacity: e.target.value })
                  }
                  placeholder="e.g., 75 kWh"
                  required
                />
              </div>
              <div>
                <Label htmlFor="condition">Condition *</Label>
                <Select
                  value={formData.condition}
                  onValueChange={(value) =>
                    setFormData({ ...formData, condition: value })
                  }
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
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: parseFloat(e.target.value) })
                  }
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
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
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
              <Label>Images</Label>
              <div className="flex gap-2 flex-wrap mb-2">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_featured: checked as boolean })
                  }
                />
                <Label htmlFor="is_featured">Featured</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="available"
                  checked={formData.available}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, available: checked as boolean })
                  }
                />
                <Label htmlFor="available">Available</Label>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={uploading}>
                {uploading ? 'Saving...' : editingVehicle ? 'Update' : 'Add'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
