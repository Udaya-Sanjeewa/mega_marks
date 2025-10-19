'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import AdminNav from '@/components/AdminNav'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { FileText, CheckCircle, XCircle, Eye, Trash2, Calendar, DollarSign, Gauge, Battery, Mail, Phone, User } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

interface VehicleListing {
  id: string
  owner_name: string
  owner_email: string
  owner_phone: string
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
  status: 'pending' | 'approved' | 'rejected'
  admin_notes?: string
  created_at: string
  updated_at: string
}

export default function VehicleListingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [listings, setListings] = useState<VehicleListing[]>([])
  const [filteredListings, setFilteredListings] = useState<VehicleListing[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [selectedListing, setSelectedListing] = useState<VehicleListing | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [adminNotes, setAdminNotes] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchListings()
    }
  }, [user])

  useEffect(() => {
    if (filter === 'all') {
      setFilteredListings(listings)
    } else {
      setFilteredListings(listings.filter(l => l.status === filter))
    }
  }, [filter, listings])

  const fetchListings = async () => {
    const { data, error } = await supabase
      .from('vehicle_listings')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching listings:', error)
      toast.error('Failed to load listings')
      return
    }

    setListings(data || [])
  }

  const handleView = (listing: VehicleListing) => {
    setSelectedListing(listing)
    setAdminNotes(listing.admin_notes || '')
    setShowDialog(true)
  }

  const handleUpdateStatus = async (status: 'approved' | 'rejected') => {
    if (!selectedListing) return

    setUpdating(true)
    try {
      const { error } = await supabase
        .from('vehicle_listings')
        .update({
          status,
          admin_notes: adminNotes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedListing.id)

      if (error) throw error

      toast.success(`Listing ${status}!`)
      setShowDialog(false)
      setSelectedListing(null)
      setAdminNotes('')
      fetchListings()
    } catch (error) {
      console.error('Error updating listing:', error)
      toast.error('Failed to update listing')
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return

    const { error } = await supabase
      .from('vehicle_listings')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting listing:', error)
      toast.error('Failed to delete listing')
      return
    }

    toast.success('Listing deleted')
    fetchListings()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>
      case 'approved':
        return <Badge className="bg-green-600">Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-600">Rejected</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const stats = {
    total: listings.length,
    pending: listings.filter(l => l.status === 'pending').length,
    approved: listings.filter(l => l.status === 'approved').length,
    rejected: listings.filter(l => l.status === 'rejected').length
  }

  return (
    <div className="flex">
      <AdminNav />
      <div className="ml-64 flex-1 p-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Vehicle Listing Requests</h1>
              <p className="text-gray-600">Review and manage vehicle submissions from customers</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Submissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Approved</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Rejected</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    onClick={() => setFilter('all')}
                    size="sm"
                  >
                    All ({stats.total})
                  </Button>
                  <Button
                    variant={filter === 'pending' ? 'default' : 'outline'}
                    onClick={() => setFilter('pending')}
                    size="sm"
                  >
                    Pending ({stats.pending})
                  </Button>
                  <Button
                    variant={filter === 'approved' ? 'default' : 'outline'}
                    onClick={() => setFilter('approved')}
                    size="sm"
                  >
                    Approved ({stats.approved})
                  </Button>
                  <Button
                    variant={filter === 'rejected' ? 'default' : 'outline'}
                    onClick={() => setFilter('rejected')}
                    size="sm"
                  >
                    Rejected ({stats.rejected})
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {filteredListings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No listings found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredListings.map((listing) => (
                  <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex gap-6">
                        {listing.images && listing.images.length > 0 ? (
                          <div className="w-48 h-32 relative rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={listing.images[0]}
                              alt={listing.model}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-48 h-32 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="h-12 w-12 text-gray-400" />
                          </div>
                        )}

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 mb-1">{listing.model}</h3>
                              <div className="flex items-center gap-2">
                                {getStatusBadge(listing.status)}
                                <span className="text-sm text-gray-500">
                                  Submitted {new Date(listing.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-blue-600">
                                LKR {listing.price.toLocaleString()}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span>{listing.year}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Battery className="h-4 w-4 text-gray-400" />
                              <span>{listing.battery_capacity}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Gauge className="h-4 w-4 text-gray-400" />
                              <span>{listing.mileage.toLocaleString()} km</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600">Condition:</span>
                              <span className="font-medium">{listing.condition}</span>
                            </div>
                          </div>

                          <div className="border-t pt-3 mb-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <span>{listing.owner_name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span>{listing.owner_email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <span>{listing.owner_phone}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleView(listing)}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                            <Button
                              onClick={() => handleDelete(listing.id)}
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Vehicle Listing Details</DialogTitle>
          </DialogHeader>

          {selectedListing && (
            <div className="space-y-6">
              {selectedListing.images && selectedListing.images.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Images</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedListing.images.map((image, index) => (
                      <div key={index} className="relative h-40 rounded-lg overflow-hidden">
                        <Image
                          src={image}
                          alt={`${selectedListing.model} - Image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-600 text-sm mb-1">Model</h4>
                  <p className="text-lg">{selectedListing.model}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-600 text-sm mb-1">Year</h4>
                  <p className="text-lg">{selectedListing.year}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-600 text-sm mb-1">Price</h4>
                  <p className="text-lg font-bold text-blue-600">LKR {selectedListing.price.toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-600 text-sm mb-1">Mileage</h4>
                  <p className="text-lg">{selectedListing.mileage.toLocaleString()} km</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-600 text-sm mb-1">Battery Capacity</h4>
                  <p className="text-lg">{selectedListing.battery_capacity}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-600 text-sm mb-1">Condition</h4>
                  <p className="text-lg">{selectedListing.condition}</p>
                </div>
                {selectedListing.color && (
                  <div>
                    <h4 className="font-semibold text-gray-600 text-sm mb-1">Color</h4>
                    <p className="text-lg">{selectedListing.color}</p>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Owner Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <p className="font-medium">{selectedListing.owner_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <p className="font-medium">{selectedListing.owner_email}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <p className="font-medium">{selectedListing.owner_phone}</p>
                  </div>
                </div>
              </div>

              {selectedListing.description && (
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedListing.description}</p>
                </div>
              )}

              {selectedListing.features && selectedListing.features.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedListing.features.map((feature, index) => (
                      <Badge key={index} variant="outline">{feature}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-2">Admin Notes</h4>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this listing..."
                  rows={3}
                />
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-600">Current Status:</span>
                  {getStatusBadge(selectedListing.status)}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={updating}
            >
              Close
            </Button>
            {selectedListing?.status !== 'rejected' && (
              <Button
                onClick={() => handleUpdateStatus('rejected')}
                disabled={updating}
                variant="outline"
                className="text-red-600 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            )}
            {selectedListing?.status !== 'approved' && (
              <Button
                onClick={() => handleUpdateStatus('approved')}
                disabled={updating}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
