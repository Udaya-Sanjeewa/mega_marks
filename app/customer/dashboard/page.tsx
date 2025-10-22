'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { User, Car, LogOut, Edit, Save, Plus } from 'lucide-react'
import Link from 'next/link'

interface CustomerProfile {
  full_name: string
  email: string
  phone: string
  address: string
}

interface VehicleAd {
  id: string
  make: string
  model: string
  year: number
  price: number
  status: string
  created_at: string
}

export default function CustomerDashboard() {
  const { user, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [myAds, setMyAds] = useState<VehicleAd[]>([])

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/customer/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchProfile()
      fetchMyAds()
    }
  }, [user])

  const fetchProfile = async () => {
    if (!user) {
      console.log('fetchProfile: No user found')
      return
    }

    console.log('fetchProfile: Fetching profile for user:', user.id)
    console.log('fetchProfile: User email:', user.email)

    const { data, error } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    console.log('fetchProfile: Response data:', data)
    console.log('fetchProfile: Response error:', error)

    if (error) {
      console.error('Error fetching profile:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      toast({
        title: 'Error',
        description: `Failed to load profile: ${error.message}`,
        variant: 'destructive',
      })
    } else if (data) {
      console.log('fetchProfile: Profile loaded successfully:', data)
      setProfile(data)
    } else {
      console.warn('No profile found for user:', user.id)

      const { data: allProfiles, error: listError } = await supabase
        .from('customer_profiles')
        .select('user_id')
        .limit(5)

      console.log('Available profiles (first 5 user_ids):', allProfiles)
      console.log('List error:', listError)

      toast({
        title: 'Profile Not Found',
        description: 'Your profile was not created properly. User ID: ' + user.id.substring(0, 8) + '...',
        variant: 'destructive',
      })
    }
  }

  const fetchMyAds = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('customer_vehicle_ads')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching ads:', error)
    } else {
      setMyAds(data || [])
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !profile) return

    setLoading(true)

    const { error } = await supabase
      .from('customer_profiles')
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
        address: profile.address,
      })
      .eq('user_id', user.id)

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      })
      setEditMode(false)
    }

    setLoading(false)
  }

  const handleLogout = async () => {
    await signOut()
    router.replace('/')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-600 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white p-3 rounded-full">
              <User className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Customer Dashboard</h1>
              <p className="text-green-100">{profile?.full_name || 'Welcome'}</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="text-white border-white hover:bg-green-700"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="profile">My Profile</TabsTrigger>
            <TabsTrigger value="ads">My Ads</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Profile Information</CardTitle>
                  {!editMode && (
                    <Button
                      onClick={() => setEditMode(true)}
                      variant="outline"
                      size="sm"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={profile?.full_name || ''}
                        onChange={(e) =>
                          setProfile({ ...profile!, full_name: e.target.value })
                        }
                        disabled={!editMode || loading}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        value={profile?.email || ''}
                        disabled
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Email cannot be changed
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profile?.phone || ''}
                        onChange={(e) =>
                          setProfile({ ...profile!, phone: e.target.value })
                        }
                        disabled={!editMode || loading}
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={profile?.address || ''}
                        onChange={(e) =>
                          setProfile({ ...profile!, address: e.target.value })
                        }
                        disabled={!editMode || loading}
                      />
                    </div>
                    {editMode && (
                      <div className="flex space-x-4">
                        <Button
                          type="submit"
                          className="bg-green-600 hover:bg-green-700"
                          disabled={loading}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setEditMode(false)
                            fetchProfile()
                          }}
                          disabled={loading}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="ads">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>My Vehicle Ads</CardTitle>
                  <Link href="/sell-vehicle">
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Post New Ad
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {myAds.length === 0 ? (
                    <div className="text-center py-12">
                      <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">No ads posted yet</p>
                      <Link href="/sell-vehicle">
                        <Button className="bg-green-600 hover:bg-green-700">
                          Post Your First Ad
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myAds.map((ad) => (
                        <div
                          key={ad.id}
                          className="border rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow"
                        >
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">
                              {ad.make} {ad.model}
                            </h3>
                            <p className="text-gray-600">
                              Year: {ad.year} | Price: Rs. {ad.price.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Posted: {new Date(ad.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                ad.status
                              )}`}
                            >
                              {ad.status.charAt(0).toUpperCase() + ad.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
