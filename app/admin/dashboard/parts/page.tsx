'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, Part } from '@/lib/supabase'
import { uploadImage, deleteImage, updateImage } from '@/lib/storage'
import AdminNav from '@/components/AdminNav'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Plus, Edit, Trash2, Upload, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function PartsManagement() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [parts, setParts] = useState<Part[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPart, setEditingPart] = useState<Part | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    image_url: '',
    in_stock: true,
    stock_quantity: '',
    compatible_models: '',
    is_featured: false,
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login')
    } else if (user) {
      fetchParts()
    }
  }, [user, loading, router])

  const fetchParts = async () => {
    const { data, error } = await supabase
      .from('parts')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setParts(data)
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
      if (editingPart && editingPart.image_url) {
        imageUrl = await updateImage(editingPart.image_url, imageFile, 'parts') || ''
      } else {
        imageUrl = await uploadImage(imageFile, 'parts') || ''
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

    const partData = {
      name: formData.name,
      category: formData.category,
      price: parseFloat(formData.price),
      description: formData.description,
      image_url: imageUrl,
      in_stock: formData.in_stock,
      stock_quantity: parseInt(formData.stock_quantity),
      compatible_models: formData.compatible_models ? formData.compatible_models.split(',').map(m => m.trim()) : [],
      is_featured: formData.is_featured,
    }

    if (editingPart) {
      const { error } = await supabase
        .from('parts')
        .update(partData)
        .eq('id', editingPart.id)

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to update part',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: 'Part updated successfully',
        })
        resetForm()
        fetchParts()
      }
    } else {
      const { error } = await supabase.from('parts').insert([partData])

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to add part',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: 'Part added successfully',
        })
        resetForm()
        fetchParts()
      }
    }

    setUploading(false)
  }

  const handleEdit = (part: Part) => {
    setEditingPart(part)
    setFormData({
      name: part.name,
      category: part.category,
      price: part.price.toString(),
      description: part.description || '',
      image_url: part.image_url || '',
      in_stock: part.in_stock,
      stock_quantity: part.stock_quantity.toString(),
      compatible_models: part.compatible_models ? part.compatible_models.join(', ') : '',
      is_featured: part.is_featured,
    })
    setImagePreview(part.image_url || null)
    setImageFile(null)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this part?')) {
      const part = parts.find(p => p.id === id)

      if (part?.image_url) {
        await deleteImage(part.image_url)
      }

      const { error } = await supabase.from('parts').delete().eq('id', id)

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete part',
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: 'Part deleted successfully',
        })
        fetchParts()
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      price: '',
      description: '',
      image_url: '',
      in_stock: true,
      stock_quantity: '',
      compatible_models: '',
      is_featured: false,
    })
    setEditingPart(null)
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
              <h1 className="text-3xl font-bold text-gray-900">Parts</h1>
              <p className="text-gray-600">Manage spare parts inventory</p>
            </div>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-gray-800 hover:bg-gray-900"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Part
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {parts.map((part) => (
              <motion.div
                key={part.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 pr-2">
                        <h3 className="font-bold text-sm line-clamp-2">{part.name}</h3>
                        <p className="text-xs text-gray-600">{part.category}</p>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(part)}
                          className="h-7 w-7 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(part.id)}
                          className="h-7 w-7 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-gray-900 mb-1">
                      LKR {part.price.toLocaleString()}
                    </p>
                    <div className="flex justify-between items-center text-xs">
                      <span className={part.in_stock ? 'text-green-600' : 'text-red-600'}>
                        {part.in_stock ? `${part.stock_quantity} in stock` : 'Out of Stock'}
                      </span>
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
                  {editingPart ? 'Edit Part' : 'Add New Part'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Part Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Front Brake Pads"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Input
                      id="category"
                      placeholder="e.g., Brakes, Lighting"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                    />
                  </div>
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
                </div>
                <div>
                  <Label htmlFor="stock_quantity">Stock Quantity *</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    required
                  />
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
                  <Label htmlFor="compatible_models">Compatible Models (comma-separated)</Label>
                  <Input
                    id="compatible_models"
                    placeholder="e.g., 2018-2023 Models, All Models"
                    value={formData.compatible_models}
                    onChange={(e) => setFormData({ ...formData, compatible_models: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="image">Part Image</Label>
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
                  <Button type="submit" className="flex-1 bg-gray-800 hover:bg-gray-900" disabled={uploading}>
                    {uploading ? 'Uploading...' : editingPart ? 'Update' : 'Add'} {uploading ? '' : 'Part'}
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
