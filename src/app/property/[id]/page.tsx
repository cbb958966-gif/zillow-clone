'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import ImageGallery from '@/components/ImageGallery'
import ImageLightbox from '@/components/ImageLightbox'
import ContactAgentForm from '@/components/ContactAgentForm'
import { 
  Bed, Bath, Square, Calendar, Home, MapPin, Share2, Heart, Printer, Phone, Mail,
  ChevronLeft, ChevronRight, Car, Trees, Waves, Flame, Building2, Ruler, Layers,
  Clock, DollarSign, TrendingUp, ArrowUp, School, Store, Hospital, Train
} from 'lucide-react'

const MapView = dynamic(() => import('@/components/MapView'), { 
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
})

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
  lotSize?: number
  yearBuilt?: number
  propertyType: string
  status: string
  description: string
  lat?: number
  lng?: number
  images: Array<{
    id: string
    url: string
    publicId: string
    alt?: string
    description?: string
    isPrimary: boolean
  }>
  agent?: {
    id: string
    name: string
    email: string
    phone?: string
    bio?: string
    experience?: number
    photo?: string
  }
}

const facts = [
  { icon: Bed, label: 'Bedrooms', value: 'beds' },
  { icon: Bath, label: 'Bathrooms', value: 'baths' },
  { icon: Square, label: 'Square Feet', value: 'sqft', format: true },
  { icon: Calendar, label: 'Year Built', value: 'yearBuilt' },
  { icon: Layers, label: 'Lot Size', value: 'lotSize', format: true },
  { icon: Ruler, label: 'Price/Sqft', value: 'priceSqft', calculated: true },
  { icon: Home, label: 'Property Type', value: 'propertyType' },
  { icon: Clock, label: 'Status', value: 'status' },
]

const priceHistory = [
  { date: '2024-01', event: 'Sold', price: 285000 },
  { date: '2023-06', event: 'Listed', price: 299000 },
  { date: '2023-03', event: 'Sold', price: 265000 },
  { date: '2020-08', event: 'Sold', price: 220000 },
]

const taxHistory = [
  { year: 2024, tax: 3200, land: 85000, assessed: 295000 },
  { year: 2023, tax: 3050, land: 80000, assessed: 280000 },
  { year: 2022, tax: 2900, land: 75000, assessed: 265000 },
  { year: 2021, tax: 2750, land: 70000, assessed: 250000 },
]

const nearbyPlaces = [
  { name: 'Elementary School', distance: '0.3 mi', rating: 8, icon: School },
  { name: 'Middle School', distance: '0.8 mi', rating: 7, icon: School },
  { name: 'High School', distance: '1.2 mi', rating: 9, icon: School },
  { name: 'Grocery Store', distance: '0.5 mi', rating: null, icon: Store },
  { name: 'Hospital', distance: '2.1 mi', rating: null, icon: Hospital },
  { name: 'Train Station', distance: '3.5 mi', rating: null, icon: Train },
]

export default function PropertyDetail() {
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [showContactForm, setShowContactForm] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (params.id) {
      fetchProperty()
    }
  }, [params.id])

  const fetchProperty = async () => {
    try {
      const response = await fetch(`/api/properties/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setProperty(data)
      } else {
        router.push('/')
      }
    } catch (error) {
      console.error('Error fetching property:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property?.title,
          text: property?.description,
          url: window.location.href,
        })
      } catch (error) {
        console.error('Share failed:', error)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066cc]"></div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h2>
          <Link href="/" className="text-[#0066cc] hover:text-[#0052a3]">Back to Properties</Link>
        </div>
      </div>
    )
  }

  const primaryImage = property.images?.find(img => img.isPrimary) || property.images?.[0]
  const pricePerSqft = property.sqft ? Math.round(property.price / property.sqft) : null
  const pricePerSqftFormatted = pricePerSqft ? `$${pricePerSqft}/sqft` : null

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Top Navigation Bar */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="container-main">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform">
                <Home className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">HomeVista</span>
            </Link>
            
            <nav className="hidden lg:flex items-center gap-2">
              {[
                { href: '/buy', label: 'Buy' },
                { href: '/rent', label: 'Rent' },
                { href: '/sell', label: 'Sell' },
                { href: '/search', label: 'Browse' },
                { href: '/mortgage', label: 'Mortgage' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    pathname?.startsWith(link.href)
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                      : 'text-gray-700 dark:text-gray-200 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <button onClick={handleShare} className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors" title="Share">
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors" title="Save">
                <Heart className="w-5 h-5 text-gray-600" />
              </button>
              <button onClick={() => setShowContactForm(true)} className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/30">
                <Phone className="w-4 h-4" />Contact Agent
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="container-main py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-[#0066cc]">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/search" className="hover:text-[#0066cc]">{property.state}</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href={`/search?city=${property.city}`} className="hover:text-[#0066cc]">{property.city}</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">{property.address}</span>
          </div>
        </div>
      </div>

      {/* Image Gallery - Zillow Style */}
      <div className="bg-gray-100">
        <div className="container-main py-4">
          <div className="grid grid-cols-4 gap-1 h-[500px] rounded-xl overflow-hidden">
            {/* Main Large Image */}
            <div className="col-span-2 row-span-2 relative cursor-pointer group" onClick={() => setLightboxIndex(0)}>
              {property.images?.[0] ? (
                <img 
                  src={property.images[0].url} 
                  alt="Main view" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <Home className="w-16 h-16 text-gray-400" />
                </div>
              )}
              <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">Main</div>
            </div>
            {/* Secondary Images */}
            {property.images?.slice(1, 5).map((img, idx) => (
              <div key={img.id} className="relative cursor-pointer group" onClick={() => setLightboxIndex(idx + 1)}>
                <img 
                  src={img.url} 
                  alt={`View ${idx + 2}`} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {idx === 3 && property.images && property.images.length > 5 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">+{property.images.length - 5} more</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
              <Images className="w-4 h-4" />View all {property.images?.length || 0} photos
            </button>
          </div>
        </div>
      </div>

      <div className="container-main py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 pb-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm ${property.status === 'ACTIVE' ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' : property.status === 'PENDING' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                      {property.status === 'ACTIVE' ? 'For Sale' : property.status}
                    </span>
                    <span className="text-sm font-medium text-gray-400">|</span>
                    <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{property.propertyType.replace(/_/g, ' ')}</span>
                  </div>
                  <h1 className="text-4xl font-extrabold text-gray-900 mb-2 leading-tight">{property.address}</h1>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#0066cc]" />
                    <p className="text-lg font-medium text-gray-600">{property.city}, {property.state} {property.zipCode}</p>
                  </div>
                </div>
              </div>
              
              {/* Key Facts Bar - Modern Style */}
              <div className="flex flex-wrap items-center gap-4 mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Bed className="w-5 h-5 text-[#0066cc]" />
                  </div>
                  <div>
                    <span className="block font-bold text-gray-900 text-lg">{property.beds || '--'}</span>
                    <span className="text-xs text-gray-500">Beds</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Bath className="w-5 h-5 text-[#0066cc]" />
                  </div>
                  <div>
                    <span className="block font-bold text-gray-900 text-lg">{property.baths ? (Number.isInteger(property.baths) ? property.baths : property.baths.toFixed(1)) : '--'}</span>
                    <span className="text-xs text-gray-500">Baths</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Square className="w-5 h-5 text-[#0066cc]" />
                  </div>
                  <div>
                    <span className="block font-bold text-gray-900 text-lg">{property.sqft?.toLocaleString() || '--'}</span>
                    <span className="text-xs text-gray-500">Sq Ft</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-[#0066cc]" />
                  </div>
                  <div>
                    <span className="block font-bold text-gray-900 text-lg">{property.yearBuilt || '--'}</span>
                    <span className="text-xs text-gray-500">Year Built</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Price & Zestimate - Modern Style */}
            <div className="card-modern p-6 bg-gradient-to-r from-white to-gray-50">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-sm font-semibold text-gray-500 mb-1">Listing Price</div>
                  <div className="text-5xl font-extrabold bg-gradient-to-r from-[#0066cc] to-[#0052a3] bg-clip-text text-transparent">
                    ${property.price.toLocaleString()}
                  </div>
                  {pricePerSqftFormatted && (
                    <div className="text-sm font-medium text-gray-500 mt-2 inline-flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      {pricePerSqftFormatted}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-500">Price/Sq Ft</div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${pricePerSqft || '--'}
                  </div>
                </div>
              </div>
              
              {/* Price History Mini */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Price History</span>
                  <button className="text-sm text-[#0066cc] hover:underline">View all</button>
                </div>
                <div className="space-y-2">
                  {priceHistory.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{item.date}</span>
                      <span className="font-medium">{item.event}</span>
                      <span className="font-semibold">${item.price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Overview & Facts Tabs */}
            <div className="card-modern overflow-hidden">
              <div className="border-b border-gray-200">
                <div className="flex">
                  {['overview', 'facts', 'tax', 'nearby'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 px-4 py-4 text-sm font-medium capitalize border-b-2 transition-colors ${
                        activeTab === tab
                          ? 'border-[#0066cc] text-[#0066cc]'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab === 'facts' ? 'Facts & Features' : tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">About this home</h3>
                      <p className="text-gray-700 leading-relaxed">{property.description}</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Building2 className="w-6 h-6 mx-auto mb-2 text-[#0066cc]" />
                        <div className="font-semibold">{property.propertyType.replace(/_/g, ' ')}</div>
                        <div className="text-sm text-gray-500">Type</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Calendar className="w-6 h-6 mx-auto mb-2 text-[#0066cc]" />
                        <div className="font-semibold">{property.yearBuilt || 'N/A'}</div>
                        <div className="text-sm text-gray-500">Year Built</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Square className="w-6 h-6 mx-auto mb-2 text-[#0066cc]" />
                        <div className="font-semibold">{property.lotSize?.toFixed(2) || 'N/A'}</div>
                        <div className="text-sm text-gray-500">Acres</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <DollarSign className="w-6 h-6 mx-auto mb-2 text-[#0066cc]" />
                        <div className="font-semibold">${property.price.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">Price</div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'facts' && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Home className="w-5 h-5 text-[#0066cc]" />
                      <div>
                        <div className="text-sm text-gray-500">Property Type</div>
                        <div className="font-medium">{property.propertyType.replace(/_/g, ' ')}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="w-5 h-5 text-[#0066cc]" />
                      <div>
                        <div className="text-sm text-gray-500">Year Built</div>
                        <div className="font-medium">{property.yearBuilt || 'N/A'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Layers className="w-5 h-5 text-[#0066cc]" />
                      <div>
                        <div className="text-sm text-gray-500">Lot Size</div>
                        <div className="font-medium">{property.lotSize?.toFixed(2)} acres</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Ruler className="w-5 h-5 text-[#0066cc]" />
                      <div>
                        <div className="text-sm text-gray-500">Living Area</div>
                        <div className="font-medium">{property.sqft?.toLocaleString()} sqft</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Car className="w-5 h-5 text-[#0066cc]" />
                      <div>
                        <div className="text-sm text-gray-500">Parking</div>
                        <div className="font-medium">2 Car Garage</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Flame className="w-5 h-5 text-[#0066cc]" />
                      <div>
                        <div className="text-sm text-gray-500">Heating</div>
                        <div className="font-medium">Central</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Waves className="w-5 h-5 text-[#0066cc]" />
                      <div>
                        <div className="text-sm text-gray-500">Cooling</div>
                        <div className="font-medium">Central AC</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Trees className="w-5 h-5 text-[#0066cc]" />
                      <div>
                        <div className="text-sm text-gray-500">Lot</div>
                        <div className="font-medium">0.25 acres</div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'tax' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Tax History</h3>
                      <span className="text-sm text-gray-500">Annual data</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 text-sm font-medium text-gray-500">Year</th>
                            <th className="text-right py-3 text-sm font-medium text-gray-500">Tax</th>
                            <th className="text-right py-3 text-sm font-medium text-gray-500">Land</th>
                            <th className="text-right py-3 text-sm font-medium text-gray-500">Assessed</th>
                          </tr>
                        </thead>
                        <tbody>
                          {taxHistory.map((item, idx) => (
                            <tr key={idx} className="border-b border-gray-100">
                              <td className="py-3 text-sm">{item.year}</td>
                              <td className="py-3 text-sm text-right font-medium">${item.tax.toLocaleString()}</td>
                              <td className="py-3 text-sm text-right">${(item.land / 1000).toFixed(0)}K</td>
                              <td className="py-3 text-sm text-right font-medium">${(item.assessed / 1000).toFixed(0)}K</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'nearby' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">What's nearby</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {nearbyPlaces.map((place, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <place.icon className="w-5 h-5 text-gray-400" />
                          <div className="flex-1">
                            <div className="text-sm font-medium">{place.name}</div>
                            <div className="text-xs text-gray-500">{place.distance}</div>
                          </div>
                          {place.rating && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                              {place.rating}/10
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Location Map */}
            {property.lat && property.lng && (
              <div className="card-modern p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
                <div className="h-80 rounded-xl overflow-hidden">
                  <MapView properties={[property]} height="320px" zoom={15} center={[property.lat, property.lng]} />
                </div>
                <div className="mt-4 flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{property.address}, {property.city}, {property.state} {property.zipCode}</span>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="card-modern p-6 sticky top-24">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-[#0066cc] mb-1">${property.price.toLocaleString()}</div>
                <div className="text-sm text-gray-500">
                  ${Math.round(property.price / 30).toLocaleString()}/mo est. payment
                </div>
              </div>

              <div className="space-y-3">
                <button onClick={() => setShowContactForm(true)} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#0066cc] text-white rounded-lg hover:bg-[#0052a3] transition-colors font-medium">
                  <Phone className="w-4 h-4" />Contact Agent
                </button>
                <button onClick={() => setShowContactForm(true)} className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-lg hover:border-[#0066cc] hover:text-[#0066cc] transition-colors font-medium">
                  Schedule Tour
                </button>
                <button onClick={() => setShowContactForm(true)} className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-lg hover:border-[#0066cc] hover:text-[#0066cc] transition-colors font-medium">
                  <Mail className="w-4 h-4" />Send Message
                </button>
              </div>

              {showContactForm && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button onClick={() => setShowContactForm(false)} className="mb-4 text-sm text-gray-500 hover:text-gray-700">
                    ← Back
                  </button>
                  <ContactAgentForm propertyId={property.id} propertyTitle={property.title} />
                </div>
              )}

              {property.agent && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-4">
                    {property.agent.photo ? (
                      <Image src={property.agent.photo} alt={property.agent.name} width={56} height={56} className="w-14 h-14 rounded-full object-cover" unoptimized />
                    ) : (
                      <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center">
                        <Home className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <div className="font-semibold">{property.agent.name}</div>
                      <div className="text-sm text-gray-500">{property.agent.experience || 5} years exp.</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mortgage Calculator Mini */}
            <div className="card-modern p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Estimate Your Payment</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Down Payment</label>
                  <input type="text" value={`$${Math.round(property.price * 0.2).toLocaleString()} (20%)`} readOnly className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Interest Rate</label>
                  <input type="text" value="6.5%" readOnly className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Loan Term</label>
                  <input type="text" value="30 years" readOnly className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm" />
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Est. Monthly Payment</span>
                    <span className="font-bold text-[#0066cc]">${Math.round(property.price / 30).toLocaleString()}/mo</span>
                  </div>
                </div>
                <Link href="/mortgage" className="block text-center text-sm text-[#0066cc] hover:underline">
                  Calculate full payment →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && property.images && (
        <ImageLightbox
          images={property.images.map(img => ({ id: img.id, url: img.url, alt: img.alt, description: img.description }))}
          initialIndex={lightboxIndex}
          isOpen={true}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      {/* Footer */}
      <footer className="footer-main mt-12">
        <div className="container-main">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <Home className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-semibold">HomeVista</span>
            </div>
            <div className="text-white/50 text-sm">© 2026 HomeVista. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function Images({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}
