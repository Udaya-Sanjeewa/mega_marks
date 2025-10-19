'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import AdminNav from '@/components/AdminNav'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Battery, Car, Wrench, TrendingUp, FileText } from 'lucide-react'

export default function AdminDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    batteries: 0,
    vehicles: 0,
    parts: 0,
    vehicleListings: 0,
    pendingListings: 0,
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchStats()
    }
  }, [user])

  const fetchStats = async () => {
    const [batteries, vehicles, parts, vehicleListings, pendingListings] = await Promise.all([
      supabase.from('batteries').select('*', { count: 'exact', head: true }),
      supabase.from('vehicles').select('*', { count: 'exact', head: true }),
      supabase.from('parts').select('*', { count: 'exact', head: true }),
      supabase.from('vehicle_listings').select('*', { count: 'exact', head: true }),
      supabase.from('vehicle_listings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    ])

    setStats({
      batteries: batteries.count || 0,
      vehicles: vehicles.count || 0,
      parts: parts.count || 0,
      vehicleListings: vehicleListings.count || 0,
      pendingListings: pendingListings.count || 0,
    })
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  const cards = [
    {
      title: 'Total Batteries',
      value: stats.batteries,
      icon: Battery,
      color: 'bg-green-600',
      href: '/admin/dashboard/batteries',
    },
    {
      title: 'Total Vehicles',
      value: stats.vehicles,
      icon: Car,
      color: 'bg-blue-600',
      href: '/admin/dashboard/vehicles',
    },
    {
      title: 'Total Parts',
      value: stats.parts,
      icon: Wrench,
      color: 'bg-gray-700',
      href: '/admin/dashboard/parts',
    },
    {
      title: 'Pending Listings',
      value: stats.pendingListings,
      icon: FileText,
      color: 'bg-orange-600',
      href: '/admin/dashboard/vehicle-listings',
    },
  ]

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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600 mb-8">Welcome back, manage your inventory</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {cards.map((card, index) => {
                const Icon = card.icon
                return (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    onClick={() => card.href && router.push(card.href)}
                  >
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                          {card.title}
                        </CardTitle>
                        <div className={`${card.color} p-2 rounded-lg`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-gray-900">{card.value}</div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
              {[
                { title: 'Manage Batteries', icon: Battery, href: '/admin/dashboard/batteries', color: 'bg-green-600' },
                { title: 'Manage Vehicles', icon: Car, href: '/admin/dashboard/vehicles', color: 'bg-blue-600' },
                { title: 'Manage Parts', icon: Wrench, href: '/admin/dashboard/parts', color: 'bg-gray-700' },
                { title: 'Listing Requests', icon: FileText, href: '/admin/dashboard/vehicle-listings', color: 'bg-orange-600' },
              ].map((item, index) => {
                const Icon = item.icon
                return (
                  <motion.a
                    key={item.title}
                    href={item.href}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 + 0.4 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Card className="hover:shadow-xl transition-all cursor-pointer h-full">
                      <CardContent className="p-6">
                        <div className={`${item.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                        <p className="text-gray-600 mt-2">Add, edit, or remove items</p>
                      </CardContent>
                    </Card>
                  </motion.a>
                )
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
