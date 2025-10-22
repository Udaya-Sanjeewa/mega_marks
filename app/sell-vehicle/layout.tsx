'use client'

import { AuthProvider } from '@/contexts/AuthContext'

export default function SellVehicleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthProvider>{children}</AuthProvider>
}
