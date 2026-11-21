'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { motion } from 'framer-motion'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import {
  Search, Bed, Bath, Square, Heart,
  Home, ChevronLeft, ChevronRight, Grid, List, Map, MapPin,
  X
} from 'lucide-react'
import dynamic from 'next/dynamic'

const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => <div className="h-full bg-muted animate-pulse rounded-lg" />
})

interface Property {
  id: string
  title: string
  address: string
  city: string
  state: string
  zipCode: string
  price: number
  beds: number
  baths: number
  sqft: number
  propertyType: string
  status: string
  lat?: number | null
  lng?: number | null
  images: { id: string; url: string; isPrimary: boolean }[]
}

const propertyTypes = [
  { value: '', label: 'All Types' },
  { value: 'APARTMENT', label: 'Apartment' },
  { value: 'CONDO', label: 'Condo' },
  { value: 'TOWNHOUSE', label: 'Townhome' },
  { value: 'SINGLE_FAMILY', label: 'House' },
]

const priceRanges = [
  { value: '', label: 'Any Price' },
  { value: '0-1000', label: 'Under $1,000' },
  { value: '1000-2000', label: '$1K - $2K' },
  { value: '2000-3000', label: '$2K - $3K' },
  { value: '3000-5000', label: '$3K - $5K' },
  { value: '5000-', label: '$5K+' },
]

const bedOptions = [
  { value: '', label: 'Any Beds' },
  { value: '1', label: '1+ Beds' },
  { value: '2', label: '2+ Beds' },
  { value: '3', label: '3+ Beds' },
  { value: '4', label: '4+ Beds' },
]

const bathOptions = [
  { value: '', label: 'Any Baths' },
  { value: '1', label: '1+ Baths' },
  { value: '2', label: '2+ Baths' },
  { value: '3', label: '3+ Baths' },
]

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

function RentContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, token } = useAuth()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showMap, setShowMap] = useState(false)
  const [savedProperties, setSavedProperties] = useState<Set<string>>(new Set())
  const [savingId, setSavingId] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    search: searchParams.get('q') || '',
    propertyType: searchParams.get('type') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minBeds: searchParams.get('minBeds') || '',
    maxBeds: searchParams.get('maxBeds') || '',
    minBaths: searchParams.get('minBaths') || '',
    maxBaths: searchParams.get('maxBaths') || '',
  })
  const [sortBy, setSortBy] = useState('newest')
  const [pagination, setPagination] = useState({
    page: parseInt(searchParams.get('page') || '1'),
    limit: 20,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false
  })

  useEffect(() => {
    const pageFromUrl = parseInt(searchParams.get('page') || '1')
    setPagination(prev => ({ ...prev, page: pageFromUrl }))
    fetchProperties(pageFromUrl)
  }, [searchParams])

  const fetchProperties = async (page: number = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.search) params.set('search', filters.search)
      if (filters.propertyType) params.set('propertyType', filters.propertyType.toUpperCase())
      if (filters.minPrice) params.set('minPrice', filters.minPrice)
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice)
      if (filters.minBeds) params.set('minBeds', filters.minBeds)
      if (filters.maxBeds) params.set('maxBeds', filters.maxBeds)
      if (filters.minBaths) params.set('minBaths', filters.minBaths)
      if (filters.maxBaths) params.set('maxBaths', filters.maxBaths)
      if (sortBy === 'newest') params.set('sortBy', 'createdAt')
      if (sortBy === 'price_low') params.set('sortBy', 'price')
      if (sortBy === 'price_high') { params.set('sortBy', 'price'); params.set('sortOrder', 'desc') }
      params.set('page', page.toString())
      params.set('limit', '20')

      const res = await fetch(`/api/properties?${params.toString()}`)
      const data = await res.json()

      if (data.properties) {
        setProperties(data.properties)
        if (data.pagination) setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (filters.search) params.set('q', filters.search)
    if (filters.propertyType) params.set('type', filters.propertyType)
    if (filters.minPrice) params.set('minPrice', filters.minPrice)
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice)
    if (filters.minBeds) params.set('minBeds', filters.minBeds)
    if (filters.maxBeds) params.set('maxBeds', filters.maxBeds)
    if (filters.minBaths) params.set('minBaths', filters.minBaths)
    if (filters.maxBaths) params.set('maxBaths', filters.maxBaths)
    params.set('page', '1')
    router.push(`/rent?${params.toString()}`)
  }

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v)
      else params.delete(k)
    })
    params.set('page', '1')
    router.push(`/rent?${params.toString()}`)
  }

  const clearFilters = () => {
    setFilters({ search: '', propertyType: '', minPrice: '', maxPrice: '', minBeds: '', maxBeds: '', minBaths: '', maxBaths: '' })
    router.push('/rent')
  }

  const goToPage = (page: number) => {
    const currentParams = new URLSearchParams(searchParams.toString())
    currentParams.set('page', page.toString())
    router.push(`/rent?${currentParams.toString()}`)
  }

  const handleSave = async (e: React.MouseEvent, propertyId: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!token || !user) { alert('Please sign in to save properties'); return }
    setSavingId(propertyId)
    try {
      if (savedProperties.has(propertyId)) {
        const response = await fetch(`/api/user/saved-properties?propertyId=${propertyId}`, {
          method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
        })
        if (response.ok) {
          setSavedProperties(prev => { const newSet = new Set(prev); newSet.delete(propertyId); return newSet })
        }
      } else {
        const response = await fetch('/api/user/saved-properties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ propertyId })
        })
        if (response.ok) {
          setSavedProperties(prev => new Set(prev).add(propertyId))
        }
      }
    } catch (error) {
      console.error('Error saving property:', error)
    } finally {
      setSavingId(null)
    }
  }

  const formatPrice = (price: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)
  const activeFilterCount = Object.values(filters).filter(v => v).length

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative min-h-[40vh] md:min-h-[50vh] flex items-center overflow-hidden pt-16">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1920&q=80"
            alt="Modern apartment interior"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-black/20 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-4 sm:mb-6"
            >
              <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white/90 text-xs sm:text-sm font-medium">{pagination.total.toLocaleString()} Rentals Available</span>
            </motion.div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight text-center">
              Find Your Perfect
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Rental Home
              </span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-white/80 mb-6 sm:mb-8 text-center">Browse thousands of rental properties across the country</p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="surface-card surface-card-hover bg-background/60 backdrop-blur-xl border border-white/20 rounded-2xl p-3 sm:p-4 shadow-2xl">
                <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-2 sm:gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Enter city, neighborhood, ZIP, or address"
                      className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-background border border-border rounded-xl text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    <select
                      className="flex-1 sm:flex-none px-3 sm:px-4 py-3 sm:py-4 bg-background border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 min-w-0"
                      value={filters.propertyType}
                      onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                    >
                      {propertyTypes.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                    <select
                      className="flex-1 sm:flex-none px-3 sm:px-4 py-3 sm:py-4 bg-background border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 min-w-0"
                      value={`${filters.minPrice}-${filters.maxPrice}`}
                      onChange={(e) => {
                        const [min, max] = e.target.value.split('-')
                        setFilters({ ...filters, minPrice: min || '', maxPrice: max || '' })
                      }}
                    >
                      {priceRanges.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                    <select
                      className="flex-1 sm:flex-none px-3 sm:px-4 py-3 sm:py-4 bg-background border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 min-w-0"
                      value={filters.minBeds}
                      onChange={(e) => handleFilterChange('minBeds', e.target.value)}
                    >
                      {bedOptions.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    <select
                      className="flex-1 sm:flex-none px-3 sm:px-4 py-3 sm:py-4 bg-background border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 min-w-0"
                      value={filters.minBaths}
                      onChange={(e) => handleFilterChange('minBaths', e.target.value)}
                    >
                      {bathOptions.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="px-6 sm:px-8 py-3 sm:py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base">
                    <Search className="w-4 sm:w-5 h-4 sm:h-5" />
                    <span>Search</span>
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Results Bar */}
      <div className="glass-control sticky top-16 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{pagination.total.toLocaleString()} results</span>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="text-primary hover:text-primary/80 font-medium text-sm flex items-center gap-1">
                  <X className="w-4 h-4" /> Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); fetchProperties(pagination.page) }}
                className="py-2 px-3 border border-border rounded-lg text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="newest">Newest</option>
                <option value="price_low">Price ↑</option>
                <option value="price_high">Price ↓</option>
              </select>

              <div className="flex border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-secondary'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-secondary'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => setShowMap(!showMap)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                  showMap
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:bg-secondary'
                }`}
              >
                <Map className="w-4 h-4" />
                Map
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showMap && properties.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-8">
            <div className="h-[400px] rounded-2xl overflow-hidden border border-border shadow-lg">
              <MapView properties={properties} height="400px" onPropertyClick={(property) => router.push(`/property/${property.id}`)} />
            </div>
          </motion.div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden bg-card border border-border">
                <div className="aspect-[4/3] bg-muted animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-muted rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                  <div className="h-4 bg-muted rounded animate-pulse w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : properties.length > 0 ? (
          <>
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className={viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
              }
            >
              {properties.map((property) => (
                <motion.div key={property.id} variants={item}>
                  <Link href={`/property/${property.id}`} className="group block">
                    <div className={`bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all ${
                      viewMode === 'list' ? 'flex flex-col md:flex-row' : ''
                    }`}>
                      <div className={`relative overflow-hidden ${
                        viewMode === 'list' ? 'md:w-80 h-56' : 'aspect-[4/3]'
                      }`}>
                        {property.images && property.images.length > 0 ? (
                          <Image src={property.images[0].url} alt={property.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <Home className="w-12 h-12 text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                        {property.status === 'ACTIVE' ? (
                          <span className="pill absolute top-3 left-3 px-3 py-1 bg-emerald-500 text-white text-xs font-medium rounded-full">For Rent</span>
                        ) : property.status === 'PENDING' ? (
                          <span className="pill absolute top-3 left-3 px-3 py-1 bg-amber-500 text-white text-xs font-medium rounded-full">Pending</span>
                        ) : (
                          <span className="pill absolute top-3 left-3 px-3 py-1 bg-muted-foreground text-white text-xs font-medium rounded-full">Rented</span>
                        )}

                        <button
                          type="button"
                          onClick={(e) => handleSave(e, property.id)}
                          disabled={savingId === property.id}
                          className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                        >
                          {savingId === property.id ? (
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin" />
                          ) : savedProperties.has(property.id) ? (
                            <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                          ) : (
                            <Heart className="w-4 h-4 text-gray-600" />
                          )}
                        </button>

                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <span className="text-xl font-bold text-white">{formatPrice(property.price)}<span className="text-sm font-normal">/mo</span></span>
                        </div>
                      </div>

                      <div className="p-5 flex-1">
                        <h3 className="font-semibold truncate group-hover:text-primary transition-colors">{property.title}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1 mb-3">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{property.address}, {property.city}, {property.state}</span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {property.beds > 0 && <span className="flex items-center gap-1"><Bed className="w-4 h-4" />{property.beds} bed</span>}
                          {property.baths > 0 && <span className="flex items-center gap-1"><Bath className="w-4 h-4" />{Math.floor(property.baths)} bath</span>}
                          {property.sqft > 0 && <span className="flex items-center gap-1"><Square className="w-4 h-4" />{property.sqft.toLocaleString()} sqft</span>}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {pagination.pages > 1 && (
              <div className="flex items-center justify-center mt-12 gap-2">
                <button
                  onClick={() => goToPage(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                  className="p-3 border border-border rounded-xl disabled:opacity-50 hover:bg-secondary transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex gap-1">
                  {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                    const page = i + 1
                    return (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${
                          pagination.page === page
                            ? 'bg-primary text-primary-foreground'
                            : 'border border-border hover:bg-secondary'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                </div>
                <button
                  onClick={() => goToPage(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                  className="p-3 border border-border rounded-xl disabled:opacity-50 hover:bg-secondary transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Home className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Rentals Found</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your search or filters</p>
            <button onClick={clearFilters} className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors">
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      <SiteFooter />
    </div>
  )
}

export default function RentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
      <RentContent />
    </Suspense>
  )
}
