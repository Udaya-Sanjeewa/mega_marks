'use client'

import { useEffect, useState } from 'react'
import { supabase, BatteryReview, VehicleReview, PartReview, HomeReview } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Star, Plus, Edit, Trash2, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

type ReviewType = 'battery' | 'vehicle' | 'part' | 'home'

export default function ReviewsManagement() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [batteryReviews, setBatteryReviews] = useState<BatteryReview[]>([])
  const [vehicleReviews, setVehicleReviews] = useState<VehicleReview[]>([])
  const [partReviews, setPartReviews] = useState<PartReview[]>([])
  const [homeReviews, setHomeReviews] = useState<HomeReview[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingReview, setEditingReview] = useState<any>(null)
  const [currentTab, setCurrentTab] = useState<ReviewType>('home')

  const [formData, setFormData] = useState({
    customer_name: '',
    rating: 5,
    review_text: '',
    review_date: new Date().toISOString().split('T')[0],
    verified_purchase: false
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchReviews()
    }
  }, [user])

  async function fetchReviews() {
    setLoading(true)

    const { data: homeData } = await supabase
      .from('home_reviews')
      .select('*')
      .order('created_at', { ascending: false })

    const { data: batteryData } = await supabase
      .from('battery_reviews')
      .select('*')
      .order('created_at', { ascending: false })

    const { data: vehicleData } = await supabase
      .from('vehicle_reviews')
      .select('*')
      .order('created_at', { ascending: false })

    const { data: partData } = await supabase
      .from('part_reviews')
      .select('*')
      .order('created_at', { ascending: false })

    setHomeReviews(homeData || [])
    setBatteryReviews(batteryData || [])
    setVehicleReviews(vehicleData || [])
    setPartReviews(partData || [])
    setLoading(false)
  }

  function resetForm() {
    setFormData({
      customer_name: '',
      rating: 5,
      review_text: '',
      review_date: new Date().toISOString().split('T')[0],
      verified_purchase: false
    })
    setEditingReview(null)
  }

  function handleEdit(review: any, type: ReviewType) {
    setEditingReview({ ...review, type })
    setFormData({
      customer_name: review.customer_name,
      rating: review.rating,
      review_text: review.review_text,
      review_date: review.review_date,
      verified_purchase: review.verified_purchase
    })
    setCurrentTab(type)
    setIsDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const tableName = currentTab === 'home' ? 'home_reviews'
      : currentTab === 'battery' ? 'battery_reviews'
      : currentTab === 'vehicle' ? 'vehicle_reviews'
      : 'part_reviews'

    if (editingReview) {
      const { error } = await supabase
        .from(tableName)
        .update(formData)
        .eq('id', editingReview.id)

      if (!error) {
        alert('Review updated successfully!')
      }
    } else {
      const { error } = await supabase
        .from(tableName)
        .insert([formData])

      if (!error) {
        alert('Review added successfully!')
      }
    }

    setIsDialogOpen(false)
    resetForm()
    fetchReviews()
  }

  async function handleDelete(id: string, type: ReviewType) {
    if (!confirm('Are you sure you want to delete this review?')) return

    const tableName = type === 'home' ? 'home_reviews'
      : type === 'battery' ? 'battery_reviews'
      : type === 'vehicle' ? 'vehicle_reviews'
      : 'part_reviews'

    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id)

    if (!error) {
      alert('Review deleted successfully!')
      fetchReviews()
    }
  }

  function renderStars(rating: number) {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    )
  }

  function renderReviewCard(review: any, type: ReviewType) {
    return (
      <Card key={review.id} className="mb-4">
        <CardContent className="pt-6">
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg">{review.customer_name}</h3>
                {review.verified_purchase && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              {renderStars(review.rating)}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(review, type)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(review.id, type)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-gray-700 mb-2">{review.review_text}</p>
          <p className="text-sm text-gray-500">
            {new Date(review.review_date).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Customer Reviews</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Review
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingReview ? 'Edit Review' : 'Add New Review'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="customer_name">Customer Name</Label>
                <Input
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="rating">Rating (1-5)</Label>
                <Input
                  id="rating"
                  type="number"
                  min="1"
                  max="5"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="review_text">Review</Label>
                <Textarea
                  id="review_text"
                  value={formData.review_text}
                  onChange={(e) => setFormData({ ...formData, review_text: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="review_date">Review Date</Label>
                <Input
                  id="review_date"
                  type="date"
                  value={formData.review_date}
                  onChange={(e) => setFormData({ ...formData, review_date: e.target.value })}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="verified_purchase"
                  type="checkbox"
                  checked={formData.verified_purchase}
                  onChange={(e) => setFormData({ ...formData, verified_purchase: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="verified_purchase">Verified Purchase</Label>
              </div>

              <Button type="submit" className="w-full">
                {editingReview ? 'Update Review' : 'Add Review'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as ReviewType)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="home">
            Home Reviews ({homeReviews.length})
          </TabsTrigger>
          <TabsTrigger value="battery">
            Battery Reviews ({batteryReviews.length})
          </TabsTrigger>
          <TabsTrigger value="vehicle">
            Vehicle Reviews ({vehicleReviews.length})
          </TabsTrigger>
          <TabsTrigger value="part">
            Part Reviews ({partReviews.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="home" className="mt-6">
          {homeReviews.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No home reviews yet</p>
          ) : (
            homeReviews.map((review) => renderReviewCard(review, 'home'))
          )}
        </TabsContent>

        <TabsContent value="battery" className="mt-6">
          {batteryReviews.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No battery reviews yet</p>
          ) : (
            batteryReviews.map((review) => renderReviewCard(review, 'battery'))
          )}
        </TabsContent>

        <TabsContent value="vehicle" className="mt-6">
          {vehicleReviews.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No vehicle reviews yet</p>
          ) : (
            vehicleReviews.map((review) => renderReviewCard(review, 'vehicle'))
          )}
        </TabsContent>

        <TabsContent value="part" className="mt-6">
          {partReviews.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No part reviews yet</p>
          ) : (
            partReviews.map((review) => renderReviewCard(review, 'part'))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
