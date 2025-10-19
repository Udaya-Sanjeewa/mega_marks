'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Battery, Users, Award, TrendingUp } from 'lucide-react'

export default function AboutPage() {
  const stats = [
    { icon: Battery, label: 'Batteries Replaced', value: '500+' },
    { icon: Users, label: 'Happy Customers', value: '1000+' },
    { icon: Award, label: 'Years Experience', value: '10+' },
    { icon: TrendingUp, label: 'Vehicles Sold', value: '200+' }
  ]

  return (
    <div>
      <section className="relative bg-gradient-to-br from-green-900 to-gray-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About Mega Marks</h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              Leading the electric vehicle revolution in Sri Lanka
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Your Trusted EV Partner
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                Mega Marks has been at the forefront of Sri Lanka's electric vehicle industry for over a decade.
                We specialize in Nissan Leaf battery replacement services, certified vehicle sales, and genuine spare parts.
              </p>
              <p className="text-lg text-gray-600 mb-4">
                Our team of certified technicians brings years of expertise in EV maintenance and battery technology.
                We partner with CATL, one of the world's leading battery manufacturers, to provide high-quality
                53kWh and 62kWh battery packs with extended warranties.
              </p>
              <p className="text-lg text-gray-600">
                At Mega Marks, we're committed to making electric vehicle ownership accessible, affordable, and worry-free
                for all Sri Lankans. From battery replacements to vehicle sales and parts, we're your complete EV solution.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative h-96 rounded-lg overflow-hidden shadow-xl"
            >
              <Image
                src="https://images.pexels.com/photos/110844/pexels-photo-110844.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Mega Marks Workshop"
                fill
                className="object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Impact
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Numbers that reflect our commitment to excellence
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                      <p className="text-gray-600">{stat.label}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
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
              Our Services
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Battery Replacement',
                description: 'Expert installation of CATL 53kWh and 62kWh battery packs with up to 3 years warranty',
                features: ['Professional installation', 'Quality assurance', 'Extended warranty', 'Post-installation support']
              },
              {
                title: 'Vehicle Sales',
                description: 'Certified pre-owned Nissan Leaf vehicles thoroughly inspected and ready for the road',
                features: ['Full inspection', 'Transparent pricing', 'Documentation support', 'After-sales service']
              },
              {
                title: 'Genuine Parts',
                description: 'OEM quality spare parts for all Nissan Leaf models with assured compatibility',
                features: ['Authentic parts', 'Wide selection', 'Competitive pricing', 'Expert guidance']
              }
            ].map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    <ul className="space-y-2">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="text-gray-600 flex items-center">
                          <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
