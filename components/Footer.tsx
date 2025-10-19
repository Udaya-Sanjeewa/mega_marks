'use client'

import Link from 'next/link'
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, Zap, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 text-green-100 relative overflow-hidden">
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, rgba(34, 197, 94, 0.2) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 50%, rgba(16, 185, 129, 0.2) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 50%, rgba(34, 197, 94, 0.2) 0%, transparent 50%)',
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center space-x-2 mb-4 group">
              <motion.div
                className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-lg shadow-lg shadow-green-500/50"
                whileHover={{ scale: 1.1, rotate: 10 }}
              >
                <Zap className="h-6 w-6 text-white" />
              </motion.div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-emerald-300 bg-clip-text text-transparent">
                Mega Marks
              </span>
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
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
            </div>
            <p className="text-sm">
              Sri Lanka's trusted expert in Nissan Leaf battery replacement, EV sales, and genuine spare parts.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link></li>
              <li><Link href="/about" className="hover:text-emerald-400 transition-colors">About Us</Link></li>
              <li><Link href="/batteries" className="hover:text-emerald-400 transition-colors">Batteries</Link></li>
              <li><Link href="/vehicles" className="hover:text-emerald-400 transition-colors">Vehicles</Link></li>
              <li><Link href="/parts" className="hover:text-emerald-400 transition-colors">Parts</Link></li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-white font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2">
                <MapPin className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm">123 EV Boulevard, Colombo 05, Sri Lanka</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span className="text-sm">+94 77 123 4567</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span className="text-sm">info@megamask.lk</span>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h3 className="text-white font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <motion.a
                href="#"
                className="bg-gradient-to-br from-green-700 to-green-600 p-2 rounded-full hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg shadow-green-500/30"
                whileHover={{ scale: 1.2, rotate: 10 }}
                whileTap={{ scale: 0.9 }}
              >
                <Facebook className="h-5 w-5" />
              </motion.a>
              <motion.a
                href="#"
                className="bg-gradient-to-br from-green-700 to-green-600 p-2 rounded-full hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg shadow-green-500/30"
                whileHover={{ scale: 1.2, rotate: 10 }}
                whileTap={{ scale: 0.9 }}
              >
                <Instagram className="h-5 w-5" />
              </motion.a>
              <motion.a
                href="#"
                className="bg-gradient-to-br from-green-700 to-green-600 p-2 rounded-full hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg shadow-green-500/30"
                whileHover={{ scale: 1.2, rotate: 10 }}
                whileTap={{ scale: 0.9 }}
              >
                <Twitter className="h-5 w-5" />
              </motion.a>
            </div>
            <div className="mt-6">
              <p className="text-sm font-semibold text-white mb-2">Business Hours</p>
              <p className="text-sm">Mon - Sat: 9:00 AM - 6:00 PM</p>
              <p className="text-sm">Sunday: Closed</p>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="border-t border-green-800 mt-8 pt-8 text-center text-sm"
        >
          <p>&copy; {new Date().getFullYear()} Mega Marks. All rights reserved.</p>
        </motion.div>
      </div>
    </footer>
  )
}
