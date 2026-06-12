'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import ThemeToggle from '@/components/ThemeToggle'
import { motion } from 'framer-motion'
import { Search as SearchIcon, SlidersHorizontal, Bed, Bath, Square, Heart, Home, ChevronLeft, ChevronRight, Grid, List, Map, MapPin, Menu as MenuIcon, X, DollarSign, ArrowRight } from 'lucide-react'
import dynamic from 'next/dynamic'

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false, loading: () => <div className="h-full bg-gray-100 animate-pulse rounded-lg" /> })

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
      const minPriceFromUrl = searchParams.get('minPrice') || ''
      const maxPriceFromUrl = searchParams.get('maxPrice') || ''
      const minBedsFromUrl = searchParams.get('minBeds') || ''
      const maxBedsFromUrl = searchParams.get('maxBeds') || ''
      const minBathsFromUrl = searchParams.get('minBaths') || ''
      const maxBathsFromUrl = searchParams.get('maxBaths') || ''
      
      const params = new URLSearchParams()
      if (searchFromUrl) params.set('search', searchFromUrl)
      if (typeFromUrl) params.set('propertyType', typeFromUrl.toUpperCase())
      if (minPriceFromUrl) params.set('minPrice', minPriceFromUrl)
      if (maxPriceFromUrl) params.set('maxPrice', maxPriceFromUrl)
      if (minBedsFromUrl) params.set('minBeds', minBedsFromUrl)
      if (maxBedsFromUrl) params.set('maxBeds', maxBedsFromUrl)
      if (minBathsFromUrl) params.set('minBaths', minBathsFromUrl)
      if (maxBathsFromUrl) params.set('maxBaths', maxBathsFromUrl)
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

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (filters.search) params.set('q', filters.search)
    if (filters.propertyType) params.set('type', filters.propertyType)
    if (filters.minPrice) params.set('minPrice', filters.minPrice)
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice)
    if (filters.minBeds) params.set('minBeds', filters.minBeds)
    if (filters.maxBeds) params.set('maxBeds', filters.maxBeds)
    if (filters.minBaths) params.set('minBaths', filters.minBaths)
    if (filters.maxBaths) params.set('maxBaths', filters.maxBaths)
    router.push(`/search?${params.toString()}`)
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      propertyType: '',
      minPrice: '',
      maxPrice: '',
      minBeds: '',
      maxBeds: '',
      minBaths: '',
      maxBaths: '',
    })
    router.push('/search')
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
    router.push(`/search?${params.toString()}`)
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
    
    if (!token || !user) {
      alert('Please sign in to save properties')
      return
    }

    setSavingId(propertyId)
    try {
      if (savedProperties.has(propertyId)) {
        const response = await fetch(`/api/user/saved-properties?propertyId=${propertyId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (response.ok) {
          setSavedProperties(prev => {
            const newSet = new Set(prev)
            newSet.delete(propertyId)
            return newSet
          })
        }
      } else {
        const response = await fetch('/api/user/saved-properties', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
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
                <Link key={link.href} href={link.href} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors">
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <ThemeToggle />
              {user ? (
                <div className="flex items-center gap-3">
                  <Link href="/dashboard/saved" className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
                    <Heart className="w-5 h-5" />
                  </Link>
                  <Link href="/dashboard" className="flex items-center gap-2 hover:bg-secondary rounded-lg p-2 transition-colors">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">{user.firstName?.[0] || 'U'}</span>
                    </div>
                    <span className="font-medium text-sm">{user.firstName}</span>
                  </Link>
                  <button onClick={handleSignOut} className="text-sm text-muted-foreground hover:text-foreground">Sign Out</button>
                </div>
              ) : (
                <>
                  <Link href="/auth/signin" className="px-4 py-2 text-sm font-medium hover:bg-secondary rounded-lg transition-colors">Sign In</Link>
                  <Link href="/auth/signup" className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">Get Started</Link>
                </>
              )}
            </div>

            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="px-4 py-4 space-y-2">
              {['Browse', 'Buy', 'Rent', 'Sell', 'Mortgage'].map((link) => (
                <Link key={link} href={`/${link.toLowerCase() === 'browse' ? 'search' : link.toLowerCase()}`} className="block px-4 py-2 text-sm font-medium hover:bg-secondary rounded-lg">
                  {link}
                </Link>
              ))}
              <hr className="my-2 border-border" />
              {user ? (
                <>
                  <Link href="/dashboard" className="block px-4 py-2 text-sm font-medium hover:bg-secondary rounded-lg">Dashboard</Link>
                  <Link href="/dashboard/saved" className="block px-4 py-2 text-sm font-medium hover:bg-secondary rounded-lg">Saved</Link>
                  <button onClick={handleSignOut} className="block w-full text-left px-4 py-2 text-sm font-medium hover:bg-secondary rounded-lg">Sign Out</button>
                </>
              ) : (
                <>
                  <Link href="/auth/signin" className="block px-4 py-2 text-sm font-medium hover:bg-secondary rounded-lg">Sign In</Link>
                  <Link href="/auth/signup" className="block px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg text-center">Get Started</Link>
                </>
              )}
            </div>
          </div>
        )}
      </motion.header>

      {/* Hero Banner with Filters */}
      <section className="relative min-h-[650px] flex items-center overflow-hidden">
        {/* Background Images */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80"
            alt="Luxury home"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-blue-900/70 to-slate-900/60" />
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        </div>
        
        <div className="container-main relative z-10 py-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-3 bg-cyan-500/20 border border-cyan-500/30 px-5 py-2.5 rounded-full mb-6">
            <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-white font-semibold">{pagination.total.toLocaleString()} Active Listings</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
            Find Your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Perfect Home
            </span>
          </h1>
          
          <p className="text-xl text-white/80 mb-8 max-w-xl">
            Discover your dream property from thousands of listings across the country.
          </p>
          
          {/* Search & Filters Bar */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 max-w-4xl shadow-2xl">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative flex items-center">
                <div className="absolute left-4">
                  <SearchIcon className="w-5 h-5 text-white/50" />
                </div>
                <input 
                  type="text" 
                  placeholder="Enter city, neighborhood, ZIP, or address" 
                  className="w-full pl-10 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50"
                  value={filters.search} 
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })} 
                />
              </div>
              <div className="flex flex-wrap md:flex-nowrap gap-2">
                <select 
                  className="py-3 px-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/50 [&>option]:text-black"
                  value={filters.propertyType} 
                  onChange={(e) => setFilters({...filters, propertyType: e.target.value})}
                >
                  <option value="">All Types</option>
                  <option value="SINGLE_FAMILY">House</option>
                  <option value="CONDO">Condo</option>
                  <option value="TOWNHOUSE">Townhome</option>
                  <option value="APARTMENT">Apartment</option>
                </select>
                
                <select 
                  className="py-3 px-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/50 [&>option]:text-black"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                >
                  <option value="">Any Price</option>
                  <option value="100000">$100K+</option>
                  <option value="200000">$200K+</option>
                  <option value="300000">$300K+</option>
                  <option value="400000">$400K+</option>
                  <option value="500000">$500K+</option>
                </select>
                
                <select 
                  className="py-2 px-3 border border-border rounded-lg text-sm text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary bg-transparent"
                  value={filters.minBeds} 
                  onChange={(e) => setFilters({...filters, minBeds: e.target.value})}
                >
                  <option value="">Any Beds</option>
                  <option value="1">1+ Beds</option>
                  <option value="2">2+ Beds</option>
                  <option value="3">3+ Beds</option>
                </select>
                
                <select 
                  className="py-2 px-3 border border-border rounded-lg text-sm text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary bg-transparent"
                  value={filters.minBaths}
                  onChange={(e) => setFilters({...filters, minBaths: e.target.value})}
                >
                  <option value="">Any Baths</option>
                  <option value="1">1+ Baths</option>
                  <option value="2">2+ Baths</option>
                  <option value="3">3+ Baths</option>
                </select>
              </div>
              <button type="submit"                   className="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-r-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg">
                  <SearchIcon className="w-5 h-5" />
                <span className="hidden md:inline">Search</span>
              </button>
            </form>
          </div>
          
          {/* Quick Links */}
          <div className="search-tags animate-fade-in-up delay-400">
            <Link href="/search?type=SINGLE_FAMILY">Houses</Link>
            <Link href="/search?type=APARTMENT">Apartments</Link>
            <Link href="/search?type=CONDO">Condos</Link>
            <Link href="/search?type=TOWNHOUSE">Townhomes</Link>
            <Link href="/search">View All</Link>
          </div>

          {/* Stats */}
          <div className="hidden lg:flex items-center gap-8 mt-10 animate-fade-in-up delay-400">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-[#00d4ff]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{pagination.total.toLocaleString()}+</div>
                <div className="text-xs text-white/60">Listings</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-[#00d4ff]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">50+</div>
                <div className="text-xs text-white/60">Cities</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <Bed className="w-5 h-5 text-[#00d4ff]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">10K+</div>
                <div className="text-xs text-white/60">Happy Clients</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results Bar */}
      <div className="bg-white border-b border-gray-100 sticky top-20 z-40">
        <div className="container-main py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {(filters.search || filters.propertyType || activeFiltersCount > 0) && (
                <>
                  <span className="text-muted-foreground text-sm">{pagination.total.toLocaleString()} results</span>
                  <button 
                    onClick={clearFilters} 
                    className="text-primary hover:text-primary/80 font-medium text-sm flex items-center gap-1"
                  >
                    <X className="w-4 h-4" /> Clear
                  </button>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-secondary rounded-lg p-1">
                <button 
                  onClick={() => setViewMode('grid')} 
                  className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode('list')} 
                  className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-main py-8">
        {loading ? (
          <div className="property-grid">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="property-card overflow-hidden border border-border rounded-2xl">
                <div className="aspect-[4/3] bg-muted animate-pulse"></div>
                <div className="p-5">
                  <div className="h-6 bg-muted rounded animate-pulse mb-3"></div>
                  <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : properties.length > 0 ? (
          <>
            <div className={viewMode === 'grid' ? 'property-grid' : 'space-y-4'}>
              {properties.map((property) => (
                <Link key={property.id} href={`/property/${property.id}`} className="block group">
                  <div className={`property-card ${viewMode === 'list' ? 'flex flex-col md:flex-row' : ''}`}>
                    <div className={`relative ${viewMode === 'list' ? 'md:w-80 h-56' : 'property-card-image'}`}>
                      {property.images?.[0] ? (
                        <Image src={property.images[0].url} alt={property.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <Home className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      <span className="property-card-badge sale">{property.status === 'ACTIVE' ? 'For Sale' : property.status}</span>
                      <button 
                        type="button"
                        className={`property-card-favorite ${savedProperties.has(property.id) ? 'active' : ''}`}
                        onClick={(e) => handleSave(e, property.id)}
                        disabled={savingId === property.id}
                      >
                        {savingId === property.id ? (
                          <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin" />
                        ) : savedProperties.has(property.id) ? (
                          <Heart className="w-5 h-5 fill-current text-white" />
                        ) : (
                          <Heart className="w-5 h-5 text-gray-600" />
                        )}
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                        <div className="property-card-price">
                          <span className="text-2xl font-bold text-white">{formatPrice(property.price)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-5 flex-1">
                      <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">{property.title}</h3>
                      <div className="flex items-center gap-1 text-muted-foreground text-sm mb-4">
                        <MapPin className="w-4 h-4" />
                        <span>{property.address}, {property.city}, {property.state}</span>
                      </div>
                      <div className="property-card-details">
                        {property.beds > 0 && <span><Bed className="w-4 h-4" />{property.beds} bed</span>}
                        {property.baths > 0 && <span><Bath className="w-4 h-4" />{Math.floor(property.baths)} bath</span>}
                        {property.sqft > 0 && <span><Square className="w-4 h-4" />{property.sqft.toLocaleString()} sqft</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {pagination.pages > 1 && (
              <div className="flex items-center justify-center mt-8 gap-1 flex-wrap">
                <button
                  onClick={() => goToPage(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                  className="px-3 py-2 rounded-lg border border-border text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                  const page = i + 1
                  return (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`min-w-[36px] px-3 py-2 rounded-lg text-sm font-medium ${
                        pagination.page === page
                          ? 'bg-primary text-primary-foreground'
                          : 'border border-border hover:bg-secondary'
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}
                <button
                  onClick={() => goToPage(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                  className="px-3 py-2 rounded-lg border border-border text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <SearchIcon className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No properties found</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your search or filters</p>
            <button 
              onClick={clearFilters}
              className="btn-primary"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
      <SearchContent />
    </Suspense>
  )
}
