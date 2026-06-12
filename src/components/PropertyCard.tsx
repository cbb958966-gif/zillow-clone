'use client';

import Link from 'next/link'
import Image from 'next/image'
import { Heart, Bed, Bath, Square, MapPin, Camera, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'

interface Property {
  id: string
  title: string
  price: number
  address: string
  city: string
  state: string
  zipCode: string
  beds?: number
  baths?: number
  sqft?: number
  propertyType: string
  status: string
  description?: string
  images: Array<{
    id: string
    url: string
    isPrimary: boolean
    width?: number
    height?: number
  }>
}

interface PropertyCardProps {
  property: Property
  variant?: 'default' | 'compact' | 'horizontal'
  showSaveButton?: boolean
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80'

export default function PropertyCard({ property, variant = 'default', showSaveButton = true }: PropertyCardProps) {
  const { user, token } = useAuth()
  const [isSaved, setIsSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [imageError, setImageError] = useState(false)
  
  const primaryImage = property.images.find(img => img.isPrimary) || property.images[0]
  const imageUrl = primaryImage?.url || FALLBACK_IMAGE
  const hasValidImage = primaryImage && !imageError
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price)
  }

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!token || !user) {
      alert('Please sign in to save properties')
      return
    }

    setSaving(true)
    try {
      if (isSaved) {
        const response = await fetch(`/api/user/saved-properties?propertyId=${property.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (response.ok) {
          setIsSaved(false)
        }
      } else {
        const response = await fetch('/api/user/saved-properties', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ propertyId: property.id })
        })
        if (response.ok) {
          setIsSaved(true)
        }
      }
    } catch (error) {
      console.error('Error saving property:', error)
    } finally {
      setSaving(false)
    }
  }

  if (variant === 'horizontal') {
    return (
      <Link href={`/property/${property.id}`} className="block group">
        <div className="property-card flex flex-col md:flex-row overflow-hidden">
          <div className="relative md:w-80 h-56 md:h-auto flex-shrink-0">
            <Image
              src={imageUrl}
              alt={property.title}
              fill
              className="object-cover"
              unoptimized
              onError={(e) => {
                const img = e.target as HTMLImageElement
                if (img.src !== FALLBACK_IMAGE) {
                  img.src = FALLBACK_IMAGE
                } else {
                  setImageError(true)
                }
              }}
            />
            {imageError && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <Heart className="w-12 h-12 text-gray-300" />
              </div>
            )}
            {property.status === 'ACTIVE' ? (
              <span className="property-card-badge sale">For Sale</span>
            ) : property.status === 'PENDING' ? (
              <span className="property-card-badge" style={{ background: '#f59e0b' }}>Pending</span>
            ) : (
              <span className="property-card-badge" style={{ background: '#6b7280' }}>Sold</span>
            )}
          </div>
          
          <div className="p-5 flex flex-col justify-between flex-1">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-[#1a1a2e] group-hover:text-[#0066cc] transition-colors line-clamp-1">
                  {property.title}
                </h3>
                {showSaveButton && (
                  <button 
                    type="button"
                    className={`property-card-favorite flex-shrink-0 ${isSaved ? 'active' : ''}`}
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin" />
                    ) : isSaved ? (
                      <Heart className="w-5 h-5 fill-current text-white" />
                    ) : (
                      <Heart className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                )}
              </div>
              
              <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="line-clamp-1">{property.address}, {property.city}, {property.state} {property.zipCode}</span>
              </div>
              
              <div className="flex items-center gap-4 text-gray-600 text-sm">
                {property.beds && property.beds > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Bed className="w-4 h-4" />
                    <span>{property.beds} bed</span>
                  </div>
                )}
                {property.baths && property.baths > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Bath className="w-4 h-4" />
                    <span>{Math.floor(property.baths)} bath</span>
                  </div>
                )}
                {property.sqft && property.sqft > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Square className="w-4 h-4" />
                    <span>{property.sqft.toLocaleString()} sqft</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <div className="property-card-price">
                <span className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                  {formatPrice(property.price)}
                </span>
              </div>
              <span className="text-cyan-600 font-semibold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                View Details
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  if (variant === 'compact') {
    return (
      <Link href={`/property/${property.id}`} className="block group">
        <div className="property-card">
          <div className="property-card-image">
            <Image
              src={imageUrl}
              alt={property.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              unoptimized
              onError={(e) => {
                const img = e.target as HTMLImageElement
                if (img.src !== FALLBACK_IMAGE) {
                  img.src = FALLBACK_IMAGE
                } else {
                  setImageError(true)
                }
              }}
            />
            {imageError && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <Heart className="w-10 h-10 text-gray-300" />
              </div>
            )}
            
            {showSaveButton && (
              <button 
                type="button"
                className={`property-card-favorite ${isSaved ? 'active' : ''}`}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin" />
                ) : isSaved ? (
                  <Heart className="w-4 h-4 fill-current text-white" />
                ) : (
                  <Heart className="w-4 h-4 text-gray-600" />
                )}
              </button>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
              <div className="text-white font-bold text-lg">
                {formatPrice(property.price)}
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <h3 className="font-semibold text-[#1a1a2e] text-sm line-clamp-1 mb-1 group-hover:text-[#0066cc] transition-colors">
              {property.title}
            </h3>
            <div className="flex items-center gap-1 text-gray-500 text-xs">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="line-clamp-1">{property.city}, {property.state}</span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/property/${property.id}`} className="block group">
      <div className="property-card">
        <div className="property-card-image">
          <Image
            src={imageUrl}
            alt={property.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            unoptimized
            onError={(e) => {
              const img = e.target as HTMLImageElement
              if (img.src !== FALLBACK_IMAGE) {
                img.src = FALLBACK_IMAGE
              } else {
                setImageError(true)
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          {imageError && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <Heart className="w-12 h-12 text-gray-300" />
            </div>
          )}
          
          {property.images.length > 1 && (
            <div className="absolute top-3 right-14 bg-black/60 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
              <Camera className="w-3 h-3" />
              {property.images.length}
            </div>
          )}
          
          {property.status === 'ACTIVE' ? (
            <span className="property-card-badge sale">For Sale</span>
          ) : property.status === 'PENDING' ? (
            <span className="property-card-badge" style={{ background: '#f59e0b' }}>Pending</span>
          ) : (
            <span className="property-card-badge" style={{ background: '#6b7280' }}>Sold</span>
          )}
          
          {showSaveButton && (
            <button 
              type="button"
              className={`property-card-favorite ${isSaved ? 'active' : ''}`}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin" />
              ) : isSaved ? (
                <Heart className="w-5 h-5 fill-current text-white" />
              ) : (
                <Heart className="w-5 h-5 text-gray-600" />
              )}
            </button>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="property-card-price">
              <span className="text-2xl font-bold text-white">
                {formatPrice(property.price)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="p-5">
          <h3 className="text-lg font-semibold text-[#1a1a2e] mb-2 line-clamp-1 group-hover:text-[#0066cc] transition-colors">
            {property.title}
          </h3>
          <div className="flex items-center gap-1 text-gray-500 text-sm mb-4">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="line-clamp-1">{property.address}, {property.city}, {property.state}</span>
          </div>
          
          <div className="property-card-details">
            {property.beds && property.beds > 0 && (
              <span>
                <Bed className="w-4 h-4" />
                {property.beds} bed
              </span>
            )}
            {property.baths && property.baths > 0 && (
              <span>
                <Bath className="w-4 h-4" />
                {Math.floor(property.baths)} bath
              </span>
            )}
            {property.sqft && property.sqft > 0 && (
              <span>
                <Square className="w-4 h-4" />
                {property.sqft.toLocaleString()} sqft
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
