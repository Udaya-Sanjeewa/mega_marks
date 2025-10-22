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
import { Plus, Edit, Trash2, X, Star } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Part {
  id: string
  name: string
  category: string
  price: number
  description?: string
  image_url?: string
  in_stock: boolean
  compatible_models?: string[]
  is_featured: boolean
}

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
    price: 0,
    description: '',
    image_url: '',
    in_stock: true,
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
    } else if (error) {
      console.error('Error fetching parts:', error)
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

    try {
      let imageUrl = formData.image_url

      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile, 'parts')
        if (uploadedUrl) {
          imageUrl = uploadedUrl
        }
      }

      const compatibleModelsArray = formData.compatible_models
        ? formData.compatible_models.split(',').map((m) => m.trim()).filter(Boolean)
        : []

      const partData = {
        name: formData.name,
        category: formData.category,
        price: formData.price,
        description: formData.description || null,
        image_url: imageUrl || null,
        in_stock: formData.in_stock,
        compatible_models: compatibleModelsArray.length > 0 ? compatibleModelsArray : null,
        is_featured: formData.is_featured,
      }

      if (editingPart) {
        const { error } = await supabase
          .from('parts')
          .update(partData)
          .eq('id', editingPart.id)

        if (error) throw error

        toast({
          title: 'Success',
          description: 'Part updated successfully',
        })
      } else {
        const { error } = await supabase.from('parts').insert([partData])

        if (error) throw error

        toast({
          title: 'Success',
          description: 'Part added successfully',
        })
      }

      setIsDialogOpen(false)
      resetForm()
      fetchParts()
    } catch (error: any) {
      console.error('Error saving part:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to save part',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  const handleEdit = (part: Part) => {
    setEditingPart(part)
    setFormData({
      name: part.name,
      category: part.category,
      price: part.price,
      description: part.description || '',
      image_url: part.image_url || '',
      in_stock: part.in_stock !== false,
      compatible_models: part.compatible_models?.join(', ') || '',
      is_featured: part.is_featured || false,
    })
    if (part.image_url) {
      setImagePreview(part.image_url)
    }
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this part?')) return

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

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      price: 0,
      description: '',
      image_url: '',
      in_stock: true,
      compatible_models: '',
      is_featured: false,
    })
    setEditingPart(null)
    setImageFile(null)
    setImagePreview(null)
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
            <h1 className="text-3xl font-bold text-slate-800">Manage Parts</h1>
            <Button
              onClick={() => {
                resetForm()
                setIsDialogOpen(true)
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Part
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {parts.map((part) => (
              <Card key={part.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  {part.image_url && (
                    <img
                      src={part.image_url}
                      alt={part.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-lg">{part.name}</h3>
                      {part.is_featured && (
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                    <p className="text-sm text-slate-600">{part.category}</p>
                    <p className="text-lg font-bold text-green-600">
                      ${part.price.toLocaleString()}
                    </p>
                    <p className="text-sm">
                      {part.in_stock ? (
                        <span className="text-green-600">In Stock</span>
                      ) : (
                        <span className="text-red-600">Out of Stock</span>
                      )}
                    </p>
                    <div className="flex gap-2 mt-4">
                      <Button
                        onClick={() => handleEdit(part)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(part.id)}
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
              {editingPart ? 'Edit Part' : 'Add New Part'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
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
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: parseFloat(e.target.value) })
                  }
                  required
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
              <Label htmlFor="compatible_models">Compatible Models (comma-separated)</Label>
              <Input
                id="compatible_models"
                value={formData.compatible_models}
                onChange={(e) =>
                  setFormData({ ...formData, compatible_models: e.target.value })
                }
                placeholder="e.g., Model 3, Model Y, Model S"
              />
            </div>

            <div>
              <Label>Image</Label>
              {imagePreview && (
                <div className="relative w-32 h-32 mb-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              <Input type="file" accept="image/*" onChange={handleImageChange} />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="in_stock"
                  checked={formData.in_stock}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, in_stock: checked as boolean })
                  }
                />
                <Label htmlFor="in_stock">In Stock</Label>
              </div>
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
                {uploading ? 'Saving...' : editingPart ? 'Update' : 'Add'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
