'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { useAuth } from '@/context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import ImageGallery from '@/components/ImageGallery'
import ImageLightbox from '@/components/ImageLightbox'
import ContactAgentForm from '@/components/ContactAgentForm'
import ThemeToggle from '@/components/ThemeToggle'
import { 
  Bed, Bath, Square, Calendar, Home, MapPin, Share2, Heart, Printer, Phone, Mail,
  ChevronLeft, ChevronRight, Car, Trees, Waves, Flame, Building2, Ruler, Layers,
  Clock, DollarSign, TrendingUp, ArrowUp, School, Store, Hospital, Train, Images
} from 'lucide-react'

const MapView = dynamic(() => import('@/components/MapView'), { 
  ssr: false,
  loading: () => <div className="h-64 bg-secondary animate-pulse rounded-lg" />
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
  const { user, logout } = useAuth()
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

  const handleSignOut = () => {
    logout()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading property details...</p>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Property Not Found</h2>
          <Link href="/" className="text-primary hover:text-primary/80">Back to Properties</Link>
        </div>
      </div>
    )
  }

  const primaryImage = property.images?.find(img => img.isPrimary) || property.images?.[0]
  const pricePerSqft = property.sqft ? Math.round(property.price / property.sqft) : null
  const pricePerSqftFormatted = pricePerSqft ? `$${pricePerSqft}/sqft` : null

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform">
                <Home className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-foreground">HomeVista</span>
            </Link>
            <nav className="hidden lg:flex items-center gap-2">
              {[{href:'/buy',label:'Buy'},{href:'/rent',label:'Rent'},{href:'/sell',label:'Sell'},{href:'/search',label:'Browse'},{href:'/mortgage',label:'Mortgage'}].map((link) => (
                <Link key={link.href} href={link.href} className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                  pathname?.startsWith(link.href)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}>{link.label}</Link>
              ))}
            </nav>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button onClick={handleShare} className="p-2.5 hover:bg-secondary rounded-xl transition-colors" title="Share">
                <Share2 className="w-5 h-5 text-muted-foreground" />
              </button>
              <button className="p-2.5 hover:bg-secondary rounded-xl transition-colors" title="Save">
                <Heart className="w-5 h-5 text-muted-foreground" />
              </button>
              <button onClick={() => setShowContactForm(true)} className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/30">
                <Phone className="w-4 h-4" />Contact Agent
              </button>
              {user ? (
                <button onClick={handleSignOut} className="px-4 py-2 rounded-xl font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">Sign Out</button>
              ) : (
                <Link href="/auth/signin" className="px-4 py-2 rounded-xl font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">Sign In</Link>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-secondary border-b border-border pt-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/search" className="hover:text-primary">{property.state}</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href={`/search?city=${property.city}`} className="hover:text-primary">{property.city}</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium">{property.address}</span>
          </div>
        </div>
      </motion.div>

      {/* Image Gallery - Zillow Style */}
      <div className="bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-1 h-[250px] md:h-[500px] rounded-xl overflow-hidden"
          >
            {/* Main Large Image */}
            <div className="col-span-2 row-span-2 relative cursor-pointer group max-md:col-span-2 max-md:row-span-2" onClick={() => setLightboxIndex(0)}>
              {property.images?.[0] ? (
                <img 
                  src={property.images[0].url} 
                  alt="Main view" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Home className="w-16 h-16 text-muted-foreground" />
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
          </motion.div>
          <div className="flex items-center justify-between mt-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium hover:bg-secondary">
              <Images className="w-4 h-4" />View all {property.images?.length || 0} photos
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card border-b border-border pb-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm ${property.status === 'ACTIVE' ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' : property.status === 'PENDING' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white' : 'bg-secondary text-muted-foreground'}`}>
                      {property.status === 'ACTIVE' ? 'For Sale' : property.status}
                    </span>
                    <span className="text-sm font-medium text-muted-foreground">|</span>
                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{property.propertyType.replace(/_/g, ' ')}</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground mb-2 leading-tight">{property.address}</h1>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 sm:w-5 h-4 sm:h-5 text-primary flex-shrink-0" />
                    <p className="text-sm sm:text-base md:text-lg font-medium text-muted-foreground">{property.city}, {property.state} {property.zipCode}</p>
                  </div>
                </div>
              </div>
              
              {/* Key Facts Bar - Modern Style */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4 mt-6 pt-6 border-t border-border">
                <div className="flex items-center gap-2 bg-secondary px-3 sm:px-4 py-2 rounded-xl">
                  <div className="w-8 sm:w-10 h-8 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Bed className="w-4 sm:w-5 h-4 sm:h-5 text-primary" />
                  </div>
                  <div>
                    <span className="block font-bold text-foreground text-base sm:text-lg">{property.beds || '--'}</span>
                    <span className="text-xs text-muted-foreground">Beds</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-secondary px-3 sm:px-4 py-2 rounded-xl">
                  <div className="w-8 sm:w-10 h-8 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Bath className="w-4 sm:w-5 h-4 sm:h-5 text-primary" />
                  </div>
                  <div>
                    <span className="block font-bold text-foreground text-base sm:text-lg">{property.baths ? (Number.isInteger(property.baths) ? property.baths : property.baths.toFixed(1)) : '--'}</span>
                    <span className="text-xs text-muted-foreground">Baths</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-secondary px-3 sm:px-4 py-2 rounded-xl">
                  <div className="w-8 sm:w-10 h-8 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Square className="w-4 sm:w-5 h-4 sm:h-5 text-primary" />
                  </div>
                  <div>
                    <span className="block font-bold text-foreground text-base sm:text-lg">{property.sqft?.toLocaleString() || '--'}</span>
                    <span className="text-xs text-muted-foreground">Sq Ft</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-secondary px-3 sm:px-4 py-2 rounded-xl">
                  <div className="w-8 sm:w-10 h-8 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 sm:w-5 h-4 sm:h-5 text-primary" />
                  </div>
                  <div>
                    <span className="block font-bold text-foreground text-base sm:text-lg">{property.yearBuilt || '--'}</span>
                    <span className="text-xs text-muted-foreground">Year Built</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Price & Zestimate - Modern Style */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl bg-card border border-border p-6"
            >
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-sm font-semibold text-muted-foreground mb-1">Listing Price</div>
                  <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                    ${property.price.toLocaleString()}
                  </div>
                  {pricePerSqftFormatted && (
                    <div className="text-sm font-medium text-muted-foreground mt-2 inline-flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      {pricePerSqftFormatted}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-muted-foreground">Price/Sq Ft</div>
                  <div className="text-2xl font-bold text-foreground">
                    ${pricePerSqft || '--'}
                  </div>
                </div>
              </div>
              
              {/* Price History Mini */}
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground">Price History</span>
                  <button className="text-sm text-primary hover:underline">View all</button>
                </div>
                <div className="space-y-2">
                  {priceHistory.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{item.date}</span>
                      <span className="font-medium">{item.event}</span>
                      <span className="font-semibold">${item.price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Overview & Facts Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-2xl bg-card border border-border overflow-hidden"
            >
              <div className="border-b border-border overflow-x-auto">
                <div className="flex min-w-max md:min-w-0">
                  {['overview', 'facts', 'tax', 'nearby'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 px-3 md:px-4 py-3 md:py-4 text-xs md:text-sm font-medium capitalize border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === tab
                          ? 'border-primary text-primary'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
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
                      <h3 className="text-lg font-semibold text-foreground mb-3">About this home</h3>
                      <p className="text-muted-foreground leading-relaxed">{property.description}</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
                      <div className="text-center p-3 sm:p-4 bg-secondary rounded-lg">
                        <Building2 className="w-5 sm:w-6 h-5 sm:h-6 mx-auto mb-1.5 sm:mb-2 text-primary" />
                        <div className="font-semibold text-sm sm:text-base">{property.propertyType.replace(/_/g, ' ')}</div>
                        <div className="text-xs sm:text-sm text-muted-foreground">Type</div>
                      </div>
                      <div className="text-center p-3 sm:p-4 bg-secondary rounded-lg">
                        <Calendar className="w-5 sm:w-6 h-5 sm:h-6 mx-auto mb-1.5 sm:mb-2 text-primary" />
                        <div className="font-semibold text-sm sm:text-base">{property.yearBuilt || 'N/A'}</div>
                        <div className="text-xs sm:text-sm text-muted-foreground">Year Built</div>
                      </div>
                      <div className="text-center p-3 sm:p-4 bg-secondary rounded-lg">
                        <Square className="w-5 sm:w-6 h-5 sm:h-6 mx-auto mb-1.5 sm:mb-2 text-primary" />
                        <div className="font-semibold text-sm sm:text-base">{property.lotSize?.toFixed(2) || 'N/A'}</div>
                        <div className="text-xs sm:text-sm text-muted-foreground">Acres</div>
                      </div>
                      <div className="text-center p-3 sm:p-4 bg-secondary rounded-lg">
                        <DollarSign className="w-5 sm:w-6 h-5 sm:h-6 mx-auto mb-1.5 sm:mb-2 text-primary" />
                        <div className="font-semibold text-sm sm:text-base">${property.price.toLocaleString()}</div>
                        <div className="text-xs sm:text-sm text-muted-foreground">Price</div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'facts' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                      <Home className="w-5 h-5 text-primary flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm text-muted-foreground">Property Type</div>
                        <div className="font-medium text-sm sm:text-base truncate">{property.propertyType.replace(/_/g, ' ')}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                      <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm text-muted-foreground">Year Built</div>
                        <div className="font-medium text-sm sm:text-base">{property.yearBuilt || 'N/A'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                      <Layers className="w-5 h-5 text-primary flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm text-muted-foreground">Lot Size</div>
                        <div className="font-medium text-sm sm:text-base">{property.lotSize?.toFixed(2)} acres</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                      <Ruler className="w-5 h-5 text-primary flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm text-muted-foreground">Living Area</div>
                        <div className="font-medium text-sm sm:text-base">{property.sqft?.toLocaleString()} sqft</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                      <Car className="w-5 h-5 text-primary flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm text-muted-foreground">Parking</div>
                        <div className="font-medium text-sm sm:text-base">2 Car Garage</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                      <Flame className="w-5 h-5 text-primary flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm text-muted-foreground">Heating</div>
                        <div className="font-medium text-sm sm:text-base">Central</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                      <Waves className="w-5 h-5 text-primary flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm text-muted-foreground">Cooling</div>
                        <div className="font-medium text-sm sm:text-base">Central AC</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                      <Trees className="w-5 h-5 text-primary flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm text-muted-foreground">Lot</div>
                        <div className="font-medium text-sm sm:text-base">0.25 acres</div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'tax' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-foreground">Tax History</h3>
                      <span className="text-sm text-muted-foreground">Annual data</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 text-sm font-medium text-muted-foreground">Year</th>
                            <th className="text-right py-3 text-sm font-medium text-muted-foreground">Tax</th>
                            <th className="text-right py-3 text-sm font-medium text-muted-foreground">Land</th>
                            <th className="text-right py-3 text-sm font-medium text-muted-foreground">Assessed</th>
                          </tr>
                        </thead>
                        <tbody>
                          {taxHistory.map((item, idx) => (
                            <tr key={idx} className="border-b border-border">
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
                    <h3 className="text-lg font-semibold text-foreground">What's nearby</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      {nearbyPlaces.map((place, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                          <place.icon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{place.name}</div>
                            <div className="text-xs text-muted-foreground">{place.distance}</div>
                          </div>
                          {place.rating && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded flex-shrink-0">
                              {place.rating}/10
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Location Map */}
            {property.lat && property.lng && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="rounded-2xl bg-card border border-border p-6"
              >
                <h3 className="text-lg font-semibold text-foreground mb-4">Location</h3>
                <div className="h-80 rounded-xl overflow-hidden">
                  <MapView properties={[property]} height="320px" zoom={15} center={[property.lat, property.lng]} />
                </div>
                <div className="mt-4 flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{property.address}, {property.city}, {property.state} {property.zipCode}</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl bg-card border border-border p-6 sticky top-24"
            >
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-primary mb-1">${property.price.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">
                  ${Math.round(property.price / 30).toLocaleString()}/mo est. payment
                </div>
              </div>

              <div className="space-y-3">
                <button onClick={() => setShowContactForm(true)} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-medium">
                  <Phone className="w-4 h-4" />Contact Agent
                </button>
                <button onClick={() => setShowContactForm(true)} className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-border text-foreground rounded-xl hover:border-primary hover:text-primary transition-colors font-medium">
                  Schedule Tour
                </button>
                <button onClick={() => setShowContactForm(true)} className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-border text-foreground rounded-xl hover:border-primary hover:text-primary transition-colors font-medium">
                  <Mail className="w-4 h-4" />Send Message
                </button>
              </div>

              {showContactForm && (
                <div className="mt-6 pt-6 border-t border-border">
                  <button onClick={() => setShowContactForm(false)} className="mb-4 text-sm text-foreground/70 hover:text-foreground">
                    ← Back
                  </button>
                  <ContactAgentForm propertyId={property.id} propertyTitle={property.title} />
                </div>
              )}

              {property.agent && (
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-center gap-4">
                    {property.agent.photo ? (
                      <Image src={property.agent.photo} alt={property.agent.name} width={56} height={56} className="w-14 h-14 rounded-full object-cover" unoptimized />
                    ) : (
                      <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center">
                        <Home className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <div className="font-semibold">{property.agent.name}</div>
                      <div className="text-sm text-muted-foreground">{property.agent.experience || 5} years exp.</div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Mortgage Calculator Mini */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-2xl bg-card border border-border p-6"
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">Estimate Your Payment</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Down Payment</label>
                  <input type="text" value={`$${Math.round(property.price * 0.2).toLocaleString()} (20%)`} readOnly className="w-full px-3 py-2 border border-border rounded-lg bg-secondary text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Interest Rate</label>
                  <input type="text" value="6.5%" readOnly className="w-full px-3 py-2 border border-border rounded-lg bg-secondary text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Loan Term</label>
                  <input type="text" value="30 years" readOnly className="w-full px-3 py-2 border border-border rounded-lg bg-secondary text-sm" />
                </div>
                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Est. Monthly Payment</span>
                    <span className="font-bold text-primary">${Math.round(property.price / 30).toLocaleString()}/mo</span>
                  </div>
                </div>
                <Link href="/mortgage" className="block text-center text-sm text-primary hover:underline">
                  Calculate full payment →
                </Link>
              </div>
            </motion.div>
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
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="bg-secondary text-secondary-foreground py-16 mt-12"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">HomeVista</span>
              </Link>
              <p className="text-sm text-muted-foreground">Your trusted partner in finding the perfect home.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/search" className="hover:text-foreground">Browse</Link></li>
                <li><Link href="/buy" className="hover:text-foreground">Buy</Link></li>
                <li><Link href="/rent" className="hover:text-foreground">Rent</Link></li>
                <li><Link href="/sell" className="hover:text-foreground">Sell</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/mortgage" className="hover:text-foreground">Mortgage Calculator</Link></li>
                <li><Link href="/help" className="hover:text-foreground">Help Center</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-foreground">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">&copy; 2026 HomeVista. All rights reserved.</p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/terms" className="hover:text-foreground">Terms</Link>
              <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}
