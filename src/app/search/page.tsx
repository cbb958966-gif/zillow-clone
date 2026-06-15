'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import ThemeToggle from '@/components/ThemeToggle'
import { Search as SearchIcon, Bed, Bath, Square, Heart, Home, ChevronLeft, ChevronRight, Grid, List, Map, MapPin, Menu, X } from 'lucide-react'
import dynamic from 'next/dynamic'

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false, loading: () => <div className="h-full bg-muted animate-pulse rounded-lg" /> })

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
  images: { url: string; isPrimary: boolean }[]
}

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { user, token, logout } = useAuth()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showMap, setShowMap] = useState(false)
  const [savedProperties, setSavedProperties] = useState<Set<string>>(new Set())
  const [savingId, setSavingId] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    search: searchParams.get('q') || searchParams.get('search') || '',
    propertyType: searchParams.get('type') || '',
    minPrice: '',
    maxPrice: '',
    minBeds: '',
    maxBeds: '',
    minBaths: '',
    maxBaths: '',
  })
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)
  const [pagination, setPagination] = useState({
    page: parseInt(searchParams.get('page') || '1'),
    limit: 12,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false
  })

  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const pageFromUrl = parseInt(searchParams.get('page') || '1')
    setPagination(prev => ({ ...prev, page: pageFromUrl }))
    const searchFromUrl = searchParams.get('q') || ''
    const typeFromUrl = searchParams.get('type') || ''
    setFilters(prev => ({ ...prev, search: searchFromUrl, propertyType: typeFromUrl }))
    fetchProperties(pageFromUrl)
    setIsInitialLoad(false)
  }, [searchParams])

  useEffect(() => {
    const count = Object.values(filters).filter(v => v && v !== '').length
    setActiveFiltersCount(count)
  }, [filters])

  useEffect(() => {
    if (isInitialLoad) return
    const timer = setTimeout(() => {
      if (filters.search.length >= 3 || filters.search === '') {
        const params = new URLSearchParams()
        if (filters.search) params.set('q', filters.search)
        if (filters.propertyType) params.set('type', filters.propertyType)
        router.push(`/search?${params.toString()}`)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [filters.search, filters.propertyType, isInitialLoad])

  const fetchProperties = async (page: number = 1) => {
    setLoading(true)
    try {
      const searchFromUrl = searchParams.get('q') || ''
      const typeFromUrl = searchParams.get('type') || ''
      const params = new URLSearchParams()
      if (searchFromUrl) params.set('search', searchFromUrl)
      if (typeFromUrl) params.set('propertyType', typeFromUrl.toUpperCase())
      params.set('page', page.toString())
      params.set('limit', '12')
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
    params.set('page', '1')
    router.push(`/search?${params.toString()}`)
  }

  const clearFilters = () => {
    setFilters({ search: '', propertyType: '', minPrice: '', maxPrice: '', minBeds: '', maxBeds: '', minBaths: '', maxBaths: '' })
    router.push('/search')
  }

  const goToPage = (page: number) => {
    const currentParams = new URLSearchParams(searchParams.toString())
    currentParams.set('page', page.toString())
    router.push(`/search?${currentParams.toString()}`)
  }

  const handleSignOut = () => { logout(); router.push('/') }

  const handleSave = async (e: React.MouseEvent, propertyId: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!token || !user) { alert('Please sign in to save properties'); return }
    setSavingId(propertyId)
    try {
      if (savedProperties.has(propertyId)) {
        const response = await fetch(`/api/user/saved-properties?propertyId=${propertyId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } })
        if (response.ok) { setSavedProperties(prev => { const newSet = new Set(prev); newSet.delete(propertyId); return newSet }) }
      } else {
        const response = await fetch('/api/user/saved-properties', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ propertyId }) })
        if (response.ok) { setSavedProperties(prev => new Set(prev).add(propertyId)) }
      }
    } catch (error) { console.error('Error saving property:', error) }
    finally { setSavingId(null) }
  }

  const formatPrice = (price: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">HomeVista</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {[
                { href: '/search', label: 'Browse' },
                { href: '/buy', label: 'Buy' },
                { href: '/rent', label: 'Rent' },
                { href: '/sell', label: 'Sell' },
                { href: '/mortgage', label: 'Mortgage' },
              ].map((link) => (
                <Link key={link.href} href={link.href} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  pathname === link.href ? 'bg-primary text-primary-foreground' : 'text-foreground/70 hover:text-foreground hover:bg-secondary/50'
                }`}>
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <ThemeToggle />
              {user ? (
                <div className="flex items-center gap-3">
                  <Link href="/dashboard/saved" className="p-2 text-foreground/70 hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
                    <Heart className="w-5 h-5" />
                  </Link>
                  <Link href="/dashboard" className="flex items-center gap-2 hover:bg-secondary rounded-lg p-2 transition-colors">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">{user.firstName?.[0] || 'U'}</span>
                    </div>
                    <span className="font-medium text-sm">{user.firstName}</span>
                  </Link>
                  <button onClick={handleSignOut} className="text-sm text-foreground/70 hover:text-foreground">Sign Out</button>
                </div>
              ) : (
                <>
                  <Link href="/auth/signin" className="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-secondary rounded-lg transition-colors">Sign In</Link>
                  <Link href="/auth/signup" className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">Get Started</Link>
                </>
              )}
            </div>

            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border bg-background"
            >
              <div className="px-4 py-4 space-y-2">
                {['Browse', 'Buy', 'Rent', 'Sell', 'Mortgage'].map((link) => (
                  <Link key={link} href={`/${link.toLowerCase() === 'browse' ? 'search' : link.toLowerCase()}`} className="block px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-lg">
                    {link}
                  </Link>
                ))}
                <hr className="my-2 border-border" />
                {user ? (
                  <>
                    <Link href="/dashboard" className="block px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-lg">Dashboard</Link>
                    <Link href="/dashboard/saved" className="block px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-lg">Saved</Link>
                    <button onClick={handleSignOut} className="block w-full text-left px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-lg">Sign Out</button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/signin" className="block px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-lg">Sign In</Link>
                    <Link href="/auth/signup" className="block px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg text-center">Get Started</Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden pt-16">
        <div className="absolute inset-0">
          <Image src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80" alt="Luxury home" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-black/20 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white/90 text-sm font-medium">{pagination.total.toLocaleString()} Active Listings</span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight text-center">
              Find Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Perfect Home</span>
            </h1>

            <p className="text-lg text-white/80 mb-8 text-center">Discover your dream property from thousands of listings across the country.</p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <div className="bg-background/60 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl">
                <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-3">
                  <div className="flex-1 relative">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input type="text" placeholder="Enter city, neighborhood, ZIP, or address"
                      className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <select className="px-4 py-4 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={filters.propertyType} onChange={(e) => setFilters({...filters, propertyType: e.target.value})}>
                      <option value="">All Types</option>
                      <option value="SINGLE_FAMILY">House</option>
                      <option value="CONDO">Condo</option>
                      <option value="TOWNHOUSE">Townhome</option>
                      <option value="APARTMENT">Apartment</option>
                    </select>
                    <select className="px-4 py-4 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={filters.minPrice} onChange={(e) => setFilters({...filters, minPrice: e.target.value})}>
                      <option value="">Any Price</option>
                      <option value="100000">$100K+</option>
                      <option value="200000">$200K+</option>
                      <option value="300000">$300K+</option>
                      <option value="400000">$400K+</option>
                      <option value="500000">$500K+</option>
                    </select>
                    <select className="px-4 py-4 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={filters.minBeds} onChange={(e) => setFilters({...filters, minBeds: e.target.value})}>
                      <option value="">Any Beds</option>
                      <option value="1">1+ Beds</option>
                      <option value="2">2+ Beds</option>
                      <option value="3">3+ Beds</option>
                    </select>
                    <select className="px-4 py-4 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={filters.minBaths} onChange={(e) => setFilters({...filters, minBaths: e.target.value})}>
                      <option value="">Any Baths</option>
                      <option value="1">1+ Baths</option>
                      <option value="2">2+ Baths</option>
                      <option value="3">3+ Baths</option>
                    </select>
                  </div>
                  <button type="submit" className="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                    <SearchIcon className="w-5 h-5" />
                    <span className="hidden md:inline">Search</span>
                  </button>
                </form>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="flex flex-wrap gap-3 mt-8 justify-center">
              <Link href="/search?type=SINGLE_FAMILY" className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-sm hover:bg-white/20 transition-colors">Houses</Link>
              <Link href="/search?type=APARTMENT" className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-sm hover:bg-white/20 transition-colors">Apartments</Link>
              <Link href="/search?type=CONDO" className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-sm hover:bg-white/20 transition-colors">Condos</Link>
              <Link href="/search?type=TOWNHOUSE" className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-sm hover:bg-white/20 transition-colors">Townhomes</Link>
              <Link href="/search" className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-sm hover:bg-white/20 transition-colors">View All</Link>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="hidden lg:flex items-center gap-8 mt-10 justify-center">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-5 py-3">
                <div className="text-2xl font-bold text-white">{pagination.total.toLocaleString()}+</div>
                <div className="text-sm text-white/70">Listings</div>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-5 py-3">
                <div className="text-2xl font-bold text-white">50+</div>
                <div className="text-sm text-white/70">Cities</div>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-5 py-3">
                <div className="text-2xl font-bold text-white">10K+</div>
                <div className="text-sm text-white/70">Happy Clients</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Results Bar */}
      <div className="sticky top-16 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {(filters.search || filters.propertyType || activeFiltersCount > 0) && (
                <>
                  <span className="text-sm text-muted-foreground">{pagination.total.toLocaleString()} results</span>
                  <button onClick={clearFilters} className="text-primary hover:text-primary/80 font-medium text-sm flex items-center gap-1">
                    <X className="w-4 h-4" /> Clear
                  </button>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-secondary rounded-lg p-1">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                  <Grid className="w-4 h-4" />
                </button>
                <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden bg-card border border-border">
                <div className="aspect-[4/3] bg-muted animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-muted rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : properties.length > 0 ? (
          <>
            <motion.div variants={container} initial="hidden" animate="show"
              className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
              {properties.map((property) => (
                <motion.div key={property.id} variants={item}>
                  <Link href={`/property/${property.id}`} className="group block">
                    <div className={`bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all ${viewMode === 'list' ? 'flex flex-col md:flex-row' : ''}`}>
                      <div className={`relative overflow-hidden ${viewMode === 'list' ? 'md:w-80 h-56' : 'aspect-[4/3]'}`}>
                        {property.images?.[0] ? (
                          <Image src={property.images[0].url} alt={property.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <Home className="w-12 h-12 text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                        <span className="absolute top-3 left-3 px-3 py-1 bg-emerald-500 text-white text-xs font-medium rounded-full">{property.status === 'ACTIVE' ? 'For Sale' : property.status}</span>
                        <button type="button" onClick={(e) => handleSave(e, property.id)} disabled={savingId === property.id}
                          className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                          {savingId === property.id ? (
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin" />
                          ) : savedProperties.has(property.id) ? (
                            <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                          ) : (
                            <Heart className="w-4 h-4 text-gray-600" />
                          )}
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <span className="text-xl font-bold text-white">{formatPrice(property.price)}</span>
                        </div>
                      </div>
                      <div className="p-5 flex-1">
                        <h3 className="font-semibold truncate group-hover:text-primary transition-colors">{property.title}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1 mb-3">
                          <MapPin className="w-3.5 h-3.5" />
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
              <div className="flex items-center justify-center mt-8 gap-1 flex-wrap">
                <button onClick={() => goToPage(pagination.page - 1)} disabled={!pagination.hasPrev}
                  className="px-3 py-2 rounded-lg border border-border text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                  const page = i + 1
                  return (
                    <button key={page} onClick={() => goToPage(page)}
                      className={`min-w-[36px] px-3 py-2 rounded-lg text-sm font-medium ${pagination.page === page ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-secondary'}`}>
                      {page}
                    </button>
                  )
                })}
                <button onClick={() => goToPage(pagination.page + 1)} disabled={!pagination.hasNext}
                  className="px-3 py-2 rounded-lg border border-border text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <SearchIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No properties found</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your search or filters</p>
            <button onClick={clearFilters} className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors">Clear Filters</button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground py-16">
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
                <li><Link href="/agent" className="hover:text-foreground">Find Agents</Link></li>
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
      </footer>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>}>
      <SearchContent />
    </Suspense>
  )
}
