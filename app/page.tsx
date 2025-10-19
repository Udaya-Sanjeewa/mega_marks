'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Battery, Car, Wrench, Award, Shield, Zap, Sparkles, Users, TrendingUp } from 'lucide-react'
import CountUpAnimation from '@/components/CountUpAnimation'
import TestimonialSlider from '@/components/TestimonialSlider'
import FeaturedBatteries from '@/components/FeaturedBatteries'
import FeaturedVehicles from '@/components/FeaturedVehicles'
import FeaturedParts from '@/components/FeaturedParts'

export default function Home() {
  const categories = [
    {
      title: 'EV Batteries',
      description: 'High-performance CATL batteries with extended warranty',
      icon: Battery,
      href: '/batteries',
      color: 'bg-green-600'
    },
    {
      title: 'Nissan Leaf Vehicles',
      description: 'Certified pre-owned and used vehicles',
      icon: Car,
      href: '/vehicles',
      color: 'bg-blue-600'
    },
    {
      title: 'Genuine Parts',
      description: 'OEM quality spare parts for all models',
      icon: Wrench,
      href: '/parts',
      color: 'bg-gray-700'
    }
  ]

  const features = [
    {
      icon: Award,
      title: 'Certified Quality',
      description: 'All batteries and parts meet international standards'
    },
    {
      icon: Shield,
      title: 'Extended Warranty',
      description: 'Up to 3 years warranty on battery replacements'
    },
    {
      icon: Zap,
      title: 'Expert Installation',
      description: 'Professional installation by certified technicians'
    }
  ]


  return (
    <div>
      <section className="relative bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-90">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/newvideo.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/30 via-green-900/20 to-emerald-900/30" />

        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 0% 0%, rgba(34, 197, 94, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 100% 100%, rgba(16, 185, 129, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 0% 100%, rgba(52, 211, 153, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 100% 0%, rgba(34, 197, 94, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 0% 0%, rgba(34, 197, 94, 0.3) 0%, transparent 50%)',
            ],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />


        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-transparent via-green-500/20 to-transparent"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full blur-3xl opacity-20"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-teal-500 to-green-600 rounded-full blur-3xl opacity-20"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="mb-6"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                <motion.span
                  className="inline-block"
                  animate={{
                    textShadow: [
                      "0 0 20px rgba(34, 197, 94, 0.5)",
                      "0 0 40px rgba(34, 197, 94, 0.8)",
                      "0 0 20px rgba(34, 197, 94, 0.5)",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  Power Your Journey with{' '}
                </motion.span>
                <motion.span
                  className="text-green-400 inline-block"
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  Mega Marks
                </motion.span>
              </h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-xl md:text-2xl mb-8 text-gray-200 max-w-3xl mx-auto"
            >
              Sri Lanka's leading expert in Nissan Leaf battery replacement, certified EV sales, and genuine spare parts
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/batteries">
                <motion.div
                  whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(34, 197, 94, 0.5)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 text-lg px-8 shadow-lg shadow-green-500/50">
                    View Batteries
                  </Button>
                </motion.div>
              </Link>
              <Link href="/vehicles">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button size="lg" variant="outline" className="text-lg px-8 border-2 border-white text-white bg-transparent hover:bg-white hover:text-gray-900">
                    Browse Vehicles
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-gray-900 via-green-950 to-emerald-950 relative overflow-hidden">
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full blur-3xl opacity-10"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <motion.h2
              className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-green-300 to-emerald-300 bg-clip-text text-transparent mb-4"
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
              Featured Products
            </motion.h2>
            <p className="text-lg text-green-200 max-w-2xl mx-auto">
              Discover our premium range of EV solutions
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center justify-center">
                  <Battery className="h-5 w-5 mr-2" />
                  Batteries
                </h3>
                <div className="flex-1 min-h-[480px]">
                  <FeaturedBatteries />
                </div>
              </div>
              <div className="flex flex-col">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center justify-center">
                  <Car className="h-5 w-5 mr-2" />
                  Vehicles
                </h3>
                <div className="flex-1 min-h-[480px]">
                  <FeaturedVehicles />
                </div>
              </div>
              <div className="flex flex-col">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center justify-center">
                  <Wrench className="h-5 w-5 mr-2" />
                  Parts
                </h3>
                <div className="flex-1 min-h-[480px]">
                  <FeaturedParts />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Our Services
            </h2>
            <p className="text-lg text-blue-200 max-w-2xl mx-auto">
              Everything you need for your Nissan Leaf electric vehicle
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((category, index) => {
              const Icon = category.icon
              return (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0, y: 50, rotateX: -15 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.15,
                    type: "spring",
                    stiffness: 100
                  }}
                  viewport={{ once: true }}
                >
                  <Link href={category.href}>
                    <motion.div
                      whileHover={{
                        scale: 1.05,
                        y: -10,
                        transition: { duration: 0.3 }
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card className="h-full bg-gray-800/50 backdrop-blur-sm hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300 cursor-pointer overflow-hidden group border-2 border-green-500/20 hover:border-green-400">
                        <CardContent className="p-6 relative">
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-emerald-500/20 to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            animate={{
                              backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: 'linear',
                            }}
                          />
                          <motion.div
                            className={`${category.color} w-16 h-16 rounded-lg flex items-center justify-center mb-4 relative z-10 shadow-lg shadow-green-500/50`}
                            whileHover={{
                              rotate: [0, -10, 10, -10, 0],
                              scale: [1, 1.1, 1],
                              boxShadow: '0 10px 30px rgba(34, 197, 94, 0.5)',
                              transition: { duration: 0.5 }
                            }}
                          >
                            <motion.div
                              animate={{
                                scale: [1, 1.1, 1],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'easeInOut',
                              }}
                            >
                              <Icon className="h-8 w-8 text-white" />
                            </motion.div>
                          </motion.div>
                          <h3 className="text-2xl font-bold text-white mb-2 relative z-10">
                            {category.title}
                          </h3>
                          <p className="text-green-200 relative z-10">
                            {category.description}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-green-950 via-gray-900 to-emerald-950 relative overflow-hidden">
        <motion.div
          className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-br from-teal-500 to-green-500 rounded-full blur-3xl opacity-10"
          animate={{
            x: [0, -50, 0],
            y: [0, -30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <motion.h2
              className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-green-300 to-emerald-300 bg-clip-text text-transparent mb-4"
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
              Why Choose Mega Mask?
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, scale: 0.5, y: 50 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.2,
                    type: "spring",
                    stiffness: 100
                  }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-green-500/50 cursor-pointer relative overflow-hidden"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-teal-400 to-green-400 opacity-0 hover:opacity-50"
                      animate={{
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    />
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.3
                      }}
                      className="relative z-10"
                    >
                      <Icon className="h-10 w-10 text-white" />
                    </motion.div>
                  </motion.div>
                  <motion.h3
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: index * 0.2 + 0.3 }}
                    viewport={{ once: true }}
                    className="text-xl font-bold text-white mb-2"
                  >
                    {feature.title}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: index * 0.2 + 0.4 }}
                    viewport={{ once: true }}
                    className="text-green-200"
                  >
                    {feature.description}
                  </motion.p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Impact in Numbers
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Trusted by thousands of EV owners across Sri Lanka
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Battery, label: 'Batteries Replaced', value: 500, suffix: '+' },
              { icon: Car, label: 'Vehicles Sold', value: 200, suffix: '+' },
              { icon: Users, label: 'Happy Customers', value: 1000, suffix: '+' },
              { icon: TrendingUp, label: 'Years Experience', value: 10, suffix: '+' }
            ].map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100
                  }}
                  viewport={{ once: true }}
                >
                  <Card className="text-center hover:shadow-lg transition-all duration-300 border border-gray-200 bg-white">
                    <CardContent className="p-8">
                      <motion.div
                        animate={{
                          scale: [1, 1.05, 1]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: index * 0.5
                        }}
                        className="flex justify-center mb-4"
                      >
                        <Icon className="h-16 w-16 text-green-600" strokeWidth={1.5} />
                      </motion.div>
                      <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                        <CountUpAnimation end={stat.value} suffix={stat.suffix} duration={2.5} />
                      </div>
                      <p className="text-gray-700 font-medium text-sm">{stat.label}</p>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  poster="https://images.pexels.com/photos/110844/pexels-photo-110844.jpeg?auto=compress&cs=tinysrgb&w=800"
                >
                  <source src="https://cdn.coverr.co/videos/coverr-electric-car-charging-station-9146/1080p.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent">
                  <div className="absolute bottom-6 left-6 text-white">
                    <p className="text-2xl font-bold">Professional Service</p>
                    <p className="text-lg">Expert EV Maintenance & Support</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Experience Excellence
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                At Mega Mask, we combine cutting-edge technology with expert craftsmanship to deliver
                unparalleled service for your Nissan Leaf. Our state-of-the-art facility and certified
                technicians ensure your EV receives the best care possible.
              </p>
              <ul className="space-y-3">
                {[
                  'ISO-certified installation processes',
                  'Advanced diagnostic equipment',
                  'Genuine CATL battery packs',
                  'Comprehensive post-service support'
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    viewport={{ once: true }}
                    className="flex items-center text-gray-700 text-base"
                  >
                    <Zap className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" strokeWidth={2} />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
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
              What Our Customers Say
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Real experiences from satisfied EV owners
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <TestimonialSlider />
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white relative overflow-hidden">
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 50%, rgba(59, 130, 246, 0.2) 0%, transparent 50%)",
              "radial-gradient(circle at 50% 20%, rgba(234, 179, 8, 0.2) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%)",
            ],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-10 right-10 w-64 h-64 bg-gradient-to-br from-teal-400 to-green-500 rounded-full blur-3xl opacity-20"
          animate={{
            x: [0, -50, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-10 left-10 w-72 h-72 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full blur-3xl opacity-20"
          animate={{
            x: [0, 50, 0],
            y: [0, -50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-4"
              animate={{
                textShadow: [
                  "0 0 20px rgba(255, 255, 255, 0.3)",
                  "0 0 30px rgba(255, 255, 255, 0.5)",
                  "0 0 20px rgba(255, 255, 255, 0.3)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              Ready to Upgrade Your Nissan Leaf?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
              className="text-xl mb-8 text-green-100"
            >
              Contact us today for expert consultation and competitive pricing
            </motion.p>
            <Link href="/contact">
              <motion.div
                whileHover={{
                  scale: 1.1,
                  boxShadow: "0 0 40px rgba(255, 255, 255, 0.4)"
                }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  y: [0, -5, 0],
                }}
                transition={{
                  y: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
              >
                <Button size="lg" variant="outline" className="bg-white text-green-600 hover:bg-gray-100 text-lg px-8">
                  Get in Touch
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
