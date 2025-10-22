'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X, Zap, Shield, Sparkles, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { scrollY } = useScroll()
  const backgroundOpacity = useTransform(scrollY, [0, 100], [0.9, 1])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Batteries', href: '/batteries' },
    { name: 'Vehicles', href: '/vehicles' },
    { name: 'Parts', href: '/parts' },
    { name: 'Contact', href: '/contact' },
  ]

  return (
    <motion.nav
      style={{ backdropFilter: 'blur(10px)' }}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-gradient-to-r from-gray-900 via-green-900 to-emerald-900 shadow-lg shadow-green-500/20'
          : 'bg-gradient-to-r from-gray-900/95 via-green-900/95 to-emerald-900/95 shadow-sm'
      }`}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10"
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2 group">
            <motion.div
              className="bg-gradient-to-br from-green-500 via-emerald-600 to-green-700 p-2 rounded-lg shadow-lg shadow-green-500/50 relative overflow-hidden"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-teal-400 to-green-400 opacity-0 group-hover:opacity-30"
                animate={{
                  scale: [1, 1.5, 1],
                  rotate: [0, 90, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <Zap className="h-6 w-6 text-white relative z-10" />
            </motion.div>
            <motion.span
              className="text-2xl font-bold bg-gradient-to-r from-white via-green-300 to-emerald-300 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{ backgroundSize: '200% auto' }}
            >
              Mega Marks
            </motion.span>
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Sparkles className="h-4 w-4 text-green-400" />
            </motion.div>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link, index) => (
              <Link key={link.name} href={link.href}>
                <motion.div
                  className="px-4 py-2 rounded-lg text-green-100 font-medium transition-colors relative overflow-hidden group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 opacity-0 group-hover:opacity-30 rounded-lg"
                    whileHover={{ scale: 1.1 }}
                  />
                  <span className="relative z-10 group-hover:text-green-300 transition-colors">
                    {link.name}
                  </span>
                </motion.div>
              </Link>
            ))}
            <Link href="/customer/login">
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: navLinks.length * 0.1 }}
              >
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0 shadow-md shadow-blue-500/50 relative overflow-hidden group mr-2"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 opacity-0 group-hover:opacity-30"
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                  <User className="h-4 w-4 mr-2 relative z-10" />
                  <span className="relative z-10">Login</span>
                </Button>
              </motion.div>
            </Link>
            <Link href="/admin/login">
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: navLinks.length * 0.1 + 0.05 }}
              >
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 shadow-md shadow-green-500/50 relative overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-teal-400 to-green-400 opacity-0 group-hover:opacity-30"
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                  <Shield className="h-4 w-4 mr-2 relative z-10" />
                  <span className="relative z-10">Admin</span>
                </Button>
              </motion.div>
            </Link>
          </div>

          <div className="md:hidden">
            <motion.div whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="relative"
              >
                <motion.div
                  animate={{ rotate: isOpen ? 90 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </motion.div>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden bg-gradient-to-br from-gray-800 via-green-900 to-emerald-900 border-t border-green-700/50 overflow-hidden"
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link, index) => (
              <Link key={link.name} href={link.href}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="block px-3 py-2 text-green-100 hover:text-emerald-300 hover:bg-gradient-to-r hover:from-green-800 hover:to-emerald-800 rounded-md font-medium relative overflow-hidden group"
                  onClick={() => setIsOpen(false)}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 opacity-0 group-hover:opacity-20"
                  />
                  <span className="relative z-10">{link.name}</span>
                </motion.div>
              </Link>
            ))}
            <Link href="/customer/login">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navLinks.length * 0.05 }}
                className="block px-3 py-2 rounded-md font-medium relative overflow-hidden"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center text-white bg-gradient-to-r from-blue-600 to-cyan-600 p-2 rounded-md shadow-lg shadow-blue-500/30">
                  <User className="h-4 w-4 mr-2" />
                  Customer Login
                </div>
              </motion.div>
            </Link>
            <Link href="/admin/login">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navLinks.length * 0.05 + 0.05 }}
                className="block px-3 py-2 rounded-md font-medium relative overflow-hidden"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center text-white bg-gradient-to-r from-green-600 to-emerald-600 p-2 rounded-md shadow-lg shadow-green-500/30">
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Login
                </div>
              </motion.div>
            </Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  )
}
