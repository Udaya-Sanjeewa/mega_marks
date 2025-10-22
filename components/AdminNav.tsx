'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Battery, Car, Wrench, LogOut, LayoutDashboard, Zap, MessageSquare, Clock } from 'lucide-react'

export default function AdminNav() {
  const pathname = usePathname()
  const { signOut } = useAuth()

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/dashboard/batteries', label: 'Batteries', icon: Battery },
    { href: '/admin/dashboard/vehicles', label: 'Vehicles', icon: Car },
    { href: '/admin/dashboard/parts', label: 'Parts', icon: Wrench },
    { href: '/admin/dashboard/vehicle-ads', label: 'Vehicle Ads', icon: Clock },
    { href: '/admin/dashboard/reviews', label: 'Reviews', icon: MessageSquare },
  ]

  return (
    <div className="bg-gray-900 text-white min-h-screen w-64 fixed left-0 top-0">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-8">
          <div className="bg-green-600 p-2 rounded-lg">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Mega Marks</h1>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-green-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <Button
            onClick={() => signOut()}
            variant="outline"
            className="w-full text-gray-300 border-gray-700 hover:bg-gray-800"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}
