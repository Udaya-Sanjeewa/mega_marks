'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { supabase, Part, PartReview } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Wrench, Search, Package, Star, CheckCircle2, Share2 } from 'lucide-react'
import { toast } from 'sonner'

export default function PartsPage() {
  const router = useRouter()
  const [parts, setParts] = useState<Part[]>([])
  const [filteredParts, setFilteredParts] = useState<Part[]>([])
  const [reviews, setReviews] = useState<PartReview[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const handleShare = async (e: React.MouseEvent, part: Part) => {
    e.stopPropagation()

    const fullUrl = `${window.location.origin}/parts/detail?id=${part.id}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: part.name,
          text: `Check out ${part.name} - LKR ${part.price.toLocaleString()}`,
          url: fullUrl,
        })
        toast.success('Shared successfully!')
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          copyToClipboard(fullUrl)
        }
      }
    } else {
      copyToClipboard(fullUrl)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Link copied to clipboard!')
    }).catch(() => {
      toast.error('Failed to copy link')
    })
  }

  useEffect(() => {
    async function fetchData() {
      const { data: partsData, error: partsError } = await supabase
        .from('parts')
        .select('*')
        .order('name', { ascending: true })

      const { data: reviewsData, error: reviewsError } = await supabase
        .from('part_reviews')
        .select('*')
        .order('created_at', { ascending: false })

      if (partsError) {
        console.error('Error fetching parts:', partsError)
      } else {
        setParts(partsData || [])
        setFilteredParts(partsData || [])
      }

      if (reviewsError) {
        console.error('Error fetching reviews:', reviewsError)
      } else {
        setReviews(reviewsData || [])
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  useEffect(() => {
    let filtered = parts

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(part => part.category === selectedCategory)
    }

    if (searchTerm) {
      filtered = filtered.filter(part =>
        part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredParts(filtered)
  }, [searchTerm, selectedCategory, parts])

  const categories = ['all', ...Array.from(new Set(parts.map(part => part.category)))]

  function renderStars(rating: number) {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    )
  }

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)
    : '0'

  return (
    <div>
      <section className="relative bg-gradient-to-br from-gray-900 to-gray-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Wrench className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Genuine Parts</h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              OEM quality spare parts for all Nissan Leaf models
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search parts by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                >
                  {category === 'all' ? 'All Categories' : category}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
              <p className="mt-4 text-gray-600">Loading parts...</p>
            </div>
          ) : filteredParts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg">No parts found matching your criteria.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('all')
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6 text-gray-600">
                Showing {filteredParts.length} of {parts.length} parts
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredParts.map((part, index) => (
                  <motion.div
                    key={part.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="cursor-pointer"
                    onClick={() => router.push(`/parts/detail?id=${part.id}`)}
                  >
                    <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full">
                      <div className="relative h-48 w-full bg-gray-100">
                        <Image
                          src={part.image_url || 'https://images.pexels.com/photos/3807277/pexels-photo-3807277.jpeg'}
                          alt={part.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                          <Button
                            size="icon"
                            variant="secondary"
                            className="h-8 w-8 bg-white/90 hover:bg-white"
                            onClick={(e) => handleShare(e, part)}
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                          <Badge variant="secondary">{part.category}</Badge>
                        </div>
                        <div className="absolute top-3 right-3">
                          {part.in_stock ? (
                            <Badge className="bg-green-600">In Stock</Badge>
                          ) : (
                            <Badge variant="destructive">Out of Stock</Badge>
                          )}
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                          {part.name}
                        </h3>

                        {part.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {part.description}
                          </p>
                        )}

                        {part.compatible_models && part.compatible_models.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs text-gray-500 mb-1">Compatible with:</p>
                            <p className="text-xs text-gray-700">
                              {part.compatible_models.join(', ')}
                            </p>
                          </div>
                        )}

                        {part.in_stock && (
                          <div className="mb-3">
                            <p className="text-xs text-gray-500">
                              Available: <span className="font-semibold text-green-600">{part.stock_quantity} units</span>
                            </p>
                          </div>
                        )}

                        <div className="border-t pt-3">
                          <p className="text-2xl font-bold text-gray-900">
                            LKR {part.price.toLocaleString()}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Customer Reviews
            </h2>
            <div className="flex items-center justify-center gap-3 mb-2">
              {renderStars(parseFloat(averageRating))}
              <span className="text-2xl font-bold text-gray-900">{averageRating}</span>
              <span className="text-gray-600">({reviews.length} reviews)</span>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{review.customer_name}</h3>
                        {renderStars(review.rating)}
                      </div>
                      {review.verified_purchase && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-700 mb-3">{review.review_text}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(review.review_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Can't Find What You Need?
            </h2>
            <p className="text-xl mb-8 text-gray-600">
              Contact us and we'll help you find the right part for your Nissan Leaf
            </p>
            <a
              href="/contact"
              className="inline-block bg-gray-900 text-white font-semibold px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Get in Touch
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
