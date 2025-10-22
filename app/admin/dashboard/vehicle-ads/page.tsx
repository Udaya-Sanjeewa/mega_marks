'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
        toast.error('Failed to load vehicle ads')
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

  const handleApprove = async (ad: VehicleAd) => {
    setProcessingId(ad.id)
    try {
      const { error: insertError } = await supabase.from('vehicles').insert([
        {
          make: ad.make,
          model: ad.model,
          year: ad.year,
          price: ad.price,
          mileage: ad.mileage,
          battery_capacity: ad.battery_capacity,
          condition: ad.condition,
          color: ad.color,
          description: ad.description,
          features: ad.features,
          images: ad.images,
          is_featured: false,
        },
      ])

      if (insertError) {
        console.error('Error inserting vehicle:', insertError)
        toast.error('Failed to create vehicle listing')
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
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Vehicle Ad Approvals</h1>
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
              <h2 className="text-xl font-semibold mb-4 capitalize">{status} Ads</h2>
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
                        {ad.year} {ad.make} {ad.model}
                      </CardTitle>
                      <CardDescription>
                        {ad.customer_profile?.full_name || 'Unknown Customer'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center text-gray-600">
                          <DollarSign className="h-4 w-4 mr-1" />
                          ${ad.price.toLocaleString()}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Gauge className="h-4 w-4 mr-1" />
                          {ad.mileage.toLocaleString()} mi
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Battery className="h-4 w-4 mr-1" />
                          {ad.battery_capacity}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(ad.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      {ad.customer_profile && (
                        <div className="text-xs text-gray-500 border-t pt-2">
                          <div>{ad.customer_profile.email}</div>
                          <div>{ad.customer_profile.phone}</div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setSelectedAd(ad)
                            setViewDialogOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {ad.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              onClick={() => handleApprove(ad)}
                              disabled={processingId === ad.id}
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
                            >
                              {processingId === ad.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <XCircle className="h-4 w-4" />
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {selectedAd?.year} {selectedAd?.make} {selectedAd?.model}
            </DialogTitle>
            <DialogDescription>Complete vehicle listing details</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            {selectedAd && (
              <div className="space-y-4">
                {selectedAd.images && selectedAd.images.length > 0 && (
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
                    <h3 className="font-semibold text-sm text-gray-600">Price</h3>
                    <p className="text-lg font-bold">${selectedAd.price.toLocaleString()}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-gray-600">Mileage</h3>
                    <p className="text-lg">{selectedAd.mileage.toLocaleString()} miles</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-gray-600">Condition</h3>
                    <p className="text-lg">{selectedAd.condition}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-gray-600">Battery Capacity</h3>
                    <p className="text-lg">{selectedAd.battery_capacity}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-gray-600">Color</h3>
                    <p className="text-lg">{selectedAd.color}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-gray-600">Year</h3>
                    <p className="text-lg">{selectedAd.year}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-sm text-gray-600 mb-2">Description</h3>
                  <p className="text-gray-700">{selectedAd.description}</p>
                </div>

                {selectedAd.features && selectedAd.features.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-sm text-gray-600 mb-2">Features</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedAd.features.map((feature, idx) => (
                        <Badge key={idx} variant="secondary">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedAd.customer_profile && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-sm text-gray-600 mb-2">Customer Information</h3>
                    <div className="space-y-1">
                      <p>
                        <span className="font-medium">Name:</span> {selectedAd.customer_profile.full_name}
                      </p>
                      <p>
                        <span className="font-medium">Email:</span> {selectedAd.customer_profile.email}
                      </p>
                      <p>
                        <span className="font-medium">Phone:</span> {selectedAd.customer_profile.phone}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
