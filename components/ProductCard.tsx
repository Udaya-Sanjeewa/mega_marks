'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

type ProductCardProps = {
  title: string
  price: number
  imageUrl: string
  badge?: string
  details?: string[]
  inStock?: boolean
  index?: number
}

export default function ProductCard({
  title,
  price,
  imageUrl,
  badge,
  details = [],
  inStock = true,
  index = 0
}: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full">
        <div className="relative h-48 w-full bg-gray-100">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <p className="text-gray-400 text-sm">No Image</p>
            </div>
          )}
          {badge && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-green-600">{badge}</Badge>
            </div>
          )}
          {!inStock && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <Badge variant="destructive" className="text-lg">Out of Stock</Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg text-gray-900 mb-2">{title}</h3>
          {details.length > 0 && (
            <ul className="space-y-1 mb-3">
              {details.slice(0, 3).map((detail, idx) => (
                <li key={idx} className="text-sm text-gray-600 flex items-center">
                  <span className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2"></span>
                  {detail}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <div className="w-full">
            <p className="text-2xl font-bold text-green-600">
              LKR {price.toLocaleString()}
            </p>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
