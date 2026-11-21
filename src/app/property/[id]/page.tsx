'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import ImageLightbox from '@/components/ImageLightbox'
import Property3DViewer from '@/components/Property3DViewer'
import ContactAgentForm from '@/components/ContactAgentForm'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import { 
  Bed, Bath, Square, Calendar, Home, MapPin, Phone, Mail,
  ChevronRight, Car, Trees, Waves, Flame, Building2, Ruler, Layers,
  Clock, DollarSign, School, Store, Hospital, Train, Images, Star, TrendingUp, Box
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
    broker?: string | null
    reviews?: { rating: number }[]
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
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [showContactForm, setShowContactForm] = useState(false)
  const [show3DTour, setShow3DTour] = useState(false)
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
        if (data.agent) {
          const user = data.agent.user
          data.agent.name = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || data.agent.email || 'HomeVista Agent'
        }
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

  const pricePerSqft = property.sqft ? Math.round(property.price / property.sqft) : null
  const pricePerSqftFormatted = pricePerSqft ? `$${pricePerSqft}/sqft` : null
  const estimatedValue = Math.round(property.price / 1000) * 1000
  const valueLow = Math.round((property.price * 0.96) / 1000) * 1000
  const valueHigh = Math.round((property.price * 1.04) / 1000) * 1000
  const agentReviews = property.agent?.reviews || []
  const agentRating = agentReviews.length ? (agentReviews.reduce((sum, review) => sum + review.rating, 0) / agentReviews.length).toFixed(1) : null
  const monthlyRate = 0.065 / 12
  const monthlyPrincipalInterest = (property.price * 0.8 * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -360))
  const monthlyTax = (property.price * 0.01) / 12
  const monthlyInsurance = (property.price * 0.0035) / 12
  const estimatedPayment = Math.round(monthlyPrincipalInterest + monthlyTax + monthlyInsurance)
  const highlights = [
    property.beds ? `${property.beds} bedrooms` : null,
    property.baths ? `${property.baths} bathrooms` : null,
    property.sqft ? `${property.sqft.toLocaleString()} sq ft` : null,
    property.yearBuilt ? `Built in ${property.yearBuilt}` : null,
    `${property.propertyType.replace(/_/g, ' ')} home`,
  ].filter(Boolean) as string[]

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-control border-b border-border pt-20"
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
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setLightboxIndex(0)} className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-secondary">
                <Images className="w-4 h-4" />View all {property.images?.length || 0} photos
              </button>
              {Boolean(property.images?.length) && (
                <button onClick={() => setShow3DTour(true)} className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20">
                  <Box className="w-4 h-4" />3D Tour
                </button>
              )}
            </div>
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
              className="surface-card surface-card-hover relative overflow-hidden p-6 sm:p-8"
            >
              <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[rgba(var(--primary-rgb),0.09)] blur-3xl" />

              <div className="relative">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className={`pill gap-2 px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.12em] ${property.status === 'ACTIVE' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : property.status === 'PENDING' ? 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400' : 'bg-secondary text-muted-foreground'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${property.status === 'ACTIVE' ? 'bg-emerald-500' : property.status === 'PENDING' ? 'bg-amber-500' : 'bg-muted-foreground'}`} />
                    {property.status === 'ACTIVE' ? 'For Sale' : property.status}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-border" />
                  <span className="pill border-transparent bg-secondary px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.12em]">{property.propertyType.replace(/_/g, ' ')}</span>
                </div>

                <h1 className="display-title mt-5 text-3xl sm:text-4xl lg:text-[2.75rem]">{property.address}</h1>

                <div className="mt-3 flex items-center gap-2.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <p className="text-sm font-medium text-muted-foreground sm:text-base">{property.city}, {property.state} {property.zipCode}</p>
                </div>
              </div>

              <div className="relative mt-7 grid grid-cols-2 gap-1.5 rounded-[22px] border border-border/60 bg-secondary/60 p-1.5 sm:grid-cols-4">
                <div className="flex items-center gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-card">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-card text-primary shadow-sm ring-1 ring-border/60">
                    <Bed className="h-[18px] w-[18px]" />
                  </span>
                  <span className="min-w-0">
                    <span className="display-title block text-lg leading-none">{property.beds || '--'}</span>
                    <span className="mt-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Beds</span>
                  </span>
                </div>
                <div className="flex items-center gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-card">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-card text-primary shadow-sm ring-1 ring-border/60">
                    <Bath className="h-[18px] w-[18px]" />
                  </span>
                  <span className="min-w-0">
                    <span className="display-title block text-lg leading-none">{property.baths ? (Number.isInteger(property.baths) ? property.baths : property.baths.toFixed(1)) : '--'}</span>
                    <span className="mt-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Baths</span>
                  </span>
                </div>
                <div className="flex items-center gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-card">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-card text-primary shadow-sm ring-1 ring-border/60">
                    <Square className="h-[18px] w-[18px]" />
                  </span>
                  <span className="min-w-0">
                    <span className="display-title block text-lg leading-none">{property.sqft?.toLocaleString() || '--'}</span>
                    <span className="mt-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Sq Ft</span>
                  </span>
                </div>
                <div className="flex items-center gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-card">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-card text-primary shadow-sm ring-1 ring-border/60">
                    <Calendar className="h-[18px] w-[18px]" />
                  </span>
                  <span className="min-w-0">
                    <span className="display-title block text-lg leading-none">{property.yearBuilt || '--'}</span>
                    <span className="mt-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Year Built</span>
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Price & Zestimate - Modern Style */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="surface-card surface-card-hover p-6"
            >
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-sm font-semibold text-muted-foreground mb-1">Listing Price</div>
                  <div className="display-title bg-gradient-to-r from-[#0066cc] to-[#0071e3] bg-clip-text text-3xl text-transparent sm:text-4xl md:text-5xl dark:from-[#64b5ff] dark:to-[#7ee0ff]">
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

              <div className="mt-6 grid gap-3 rounded-2xl border border-border/60 bg-secondary/60 p-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-card text-primary shadow-sm ring-1 ring-border/60">
                    <TrendingUp className="h-[18px] w-[18px]" />
                  </span>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">HomeVista estimate</div>
                    <div className="display-title text-xl">${estimatedValue.toLocaleString()}</div>
                  </div>
                </div>
                <div className="sm:text-right">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Estimated range</div>
                  <div className="mt-1 text-sm font-semibold text-foreground">${valueLow.toLocaleString()} – ${valueHigh.toLocaleString()}</div>
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
              className="surface-card overflow-hidden"
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
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-3">What&apos;s special</h3>
                      <div className="flex flex-wrap gap-2">
                        {highlights.map((highlight) => (
                          <span key={highlight} className="pill px-3 py-1.5 text-xs font-medium text-muted-foreground">{highlight}</span>
                        ))}
                      </div>
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
                className="surface-card surface-card-hover p-6"
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
              className="surface-card p-6 sticky top-24"
            >
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-primary mb-1">${property.price.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">
                  ${estimatedPayment.toLocaleString()}/mo est. payment
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
                    <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center">
                      <Home className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <Link href={`/agent/${property.agent.id}`} className="font-semibold hover:text-primary">{property.agent.name}</Link>
                      <div className="text-sm text-muted-foreground">{property.agent.broker || 'HomeVista Realty'}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {agentRating && (
                          <span className="inline-flex items-center gap-1 font-medium text-foreground">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            {agentRating} ({agentReviews.length})
                          </span>
                        )}
                        <span>{property.agent.experience || 5} years exp.</span>
                      </div>
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
              className="surface-card surface-card-hover p-6"
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">Estimate Your Payment</h3>
              <div className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Principal &amp; interest</span>
                    <span className="font-medium">${Math.round(monthlyPrincipalInterest).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Property taxes</span>
                    <span className="font-medium">${Math.round(monthlyTax).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Home insurance</span>
                    <span className="font-medium">${Math.round(monthlyInsurance).toLocaleString()}</span>
                  </div>
                  <p className="pt-1 text-xs text-muted-foreground">20% down · 6.5% rate · 30-year fixed</p>
                </div>
                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Est. Monthly Payment</span>
                    <span className="font-bold text-primary">${estimatedPayment.toLocaleString()}/mo</span>
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

      {show3DTour && property.images && property.images.length > 0 && (
        <Property3DViewer
          images={property.images.map((image) => ({
            id: image.id,
            url: image.url,
            alt: image.alt,
            description: image.description,
          }))}
          title={`${property.address}, ${property.city}, ${property.state}`}
          onClose={() => setShow3DTour(false)}
        />
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && property.images && (
        <ImageLightbox
          images={property.images.map(img => ({ id: img.id, url: img.url, alt: img.alt, description: img.description }))}
          initialIndex={lightboxIndex}
          isOpen={true}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      <SiteFooter />
    </div>
  )
}
