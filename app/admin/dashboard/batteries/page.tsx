'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, Battery } from '@/lib/supabase'
import { uploadImage, deleteImage, updateImage } from '@/lib/storage'
import AdminNav from '@/components/AdminNav'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Plus, Edit, Trash2, X, Upload } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function BatteriesManagement() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [batteries, setBatteries] = useState<Battery[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBattery, setEditingBattery] = useState<Battery | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    brand: 'CATL',
    price: '',
    description: '',
    image_url: '',
    in_stock: true,
    warranty_years: '3',
    range_with_ac: '',
    range_without_ac: '',
    is_featured: false,
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login')
    } else if (user) {
      fetchBatteries()
    }
  }, [user, loading, router])

  const fetchBatteries = async () => {
    const { data, error } = await supabase
      .from('batteries')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setBatteries(data)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Error',
          description: 'Image size must be less than 5MB',
          variant: 'destructive',
        })
        return
      }

      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setFormData({ ...formData, image_url: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    let imageUrl = formData.image_url

    if (imageFile) {
      if (editingBattery && editingBattery.image_url) {
        imageUrl = await updateImage(editingBattery.image_url, imageFile, 'batteries') || ''
      } else {
        imageUrl = await uploadImage(imageFile, 'batteries') || ''
      }

      if (!imageUrl) {
        toast({
          title: 'Error',
          description: 'Failed to upload image',
          variant: 'destructive',
        })
        setUploading(false)
        return
      }
    }

    const batteryData = {
      name: formData.name,
      capacity: formData.capacity,
      brand: formData.brand,
      price: parseFloat(formData.price),
      description: formData.description,
      image_url: imageUrl,
      in_stock: formData.in_stock,
      warranty_years: parseInt(formData.warranty_years),
      range_with_ac: formData.range_with_ac || null,
      range_without_ac: formData.range_without_ac || null,
      is_featured: formData.is_featured,
    }

    if (editingBattery) {
      const { error } = await supabase
        .from('batteries')
        .update(batteryData)
        .eq('id', editingBattery.id)

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to update battery',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: 'Battery updated successfully',
        })
        resetForm()
        fetchBatteries()
      }
    } else {
      const { error } = await supabase.from('batteries').insert([batteryData])

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to add battery',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: 'Battery added successfully',
        })
        resetForm()
        fetchBatteries()
      }
    }

    setUploading(false)
  }

  const handleEdit = (battery: Battery) => {
    setEditingBattery(battery)
    setFormData({
      name: battery.name,
      capacity: battery.capacity,
      brand: battery.brand,
      price: battery.price.toString(),
      description: battery.description || '',
      image_url: battery.image_url || '',
      in_stock: battery.in_stock,
      warranty_years: battery.warranty_years.toString(),
      range_with_ac: battery.range_with_ac || '',
      range_without_ac: battery.range_without_ac || '',
      is_featured: battery.is_featured,
    })
    setImagePreview(battery.image_url || null)
    setImageFile(null)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this battery?')) {
      const battery = batteries.find(b => b.id === id)

      if (battery?.image_url) {
        await deleteImage(battery.image_url)
      }

      const { error } = await supabase.from('batteries').delete().eq('id', id)

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete battery',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: 'Battery deleted successfully',
        })
        fetchBatteries()
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      capacity: '',
      brand: 'CATL',
      price: '',
      description: '',
      image_url: '',
      in_stock: true,
      warranty_years: '3',
      range_with_ac: '',
      range_without_ac: '',
      is_featured: false,
    })
    setEditingBattery(null)
    setImageFile(null)
    setImagePreview(null)
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
              <h1 className="text-3xl font-bold text-gray-900">Batteries</h1>
              <p className="text-gray-600">Manage battery inventory</p>
            </div>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Battery
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {batteries.map((battery) => (
              <motion.div
                key={battery.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-lg">{battery.name}</h3>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(battery)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(battery.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{battery.capacity} - {battery.brand}</p>
                    <p className="text-xl font-bold text-green-600 mb-2">
                      LKR {battery.price.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {battery.warranty_years} Year Warranty
                    </p>
                    {battery.range_with_ac && (
                      <p className="text-xs text-gray-500">
                        Range (With A/C): {battery.range_with_ac}
                      </p>
                    )}
                    {battery.range_without_ac && (
                      <p className="text-xs text-gray-500">
                        Range (Without A/C): {battery.range_without_ac}
                      </p>
                    )}
                    <div className={`text-xs mt-2 ${battery.in_stock ? 'text-green-600' : 'text-red-600'}`}>
                      {battery.in_stock ? 'In Stock' : 'Out of Stock'}
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
                  {editingBattery ? 'Edit Battery' : 'Add New Battery'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Battery Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="capacity">Capacity *</Label>
                    <Input
                      id="capacity"
                      placeholder="e.g., 62kWh"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="brand">Brand *</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
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
                    <Label htmlFor="warranty">Warranty (Years) *</Label>
                    <Input
                      id="warranty"
                      type="number"
                      value={formData.warranty_years}
                      onChange={(e) => setFormData({ ...formData, warranty_years: e.target.value })}
                      required
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="range_with_ac">Range (With A/C)</Label>
                    <Input
                      id="range_with_ac"
                      placeholder="e.g., 350 km"
                      value={formData.range_with_ac}
                      onChange={(e) => setFormData({ ...formData, range_with_ac: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="range_without_ac">Range (Without A/C)</Label>
                    <Input
                      id="range_without_ac"
                      placeholder="e.g., 400 km"
                      value={formData.range_without_ac}
                      onChange={(e) => setFormData({ ...formData, range_without_ac: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="image">Battery Image</Label>
                  <div className="space-y-4">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={removeImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-sm text-gray-600 mb-2">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 5MB</p>
                        <Input
                          id="image"
                          type="file"
                          accept="image/*"
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
                    id="in_stock"
                    checked={formData.in_stock}
                    onChange={(e) => setFormData({ ...formData, in_stock: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="in_stock">In Stock</Label>
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
                  <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700" disabled={uploading}>
                    {uploading ? 'Uploading...' : editingBattery ? 'Update' : 'Add'} {uploading ? '' : 'Battery'}
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
