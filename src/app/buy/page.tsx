'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import ThemeToggle from '@/components/ThemeToggle'
import { 
  Search, MapPin, Bed, Bath, Square, Heart, 
  Home, ChevronLeft, ChevronRight, X, Grid, List, Map,
  Menu as MenuIcon
} from 'lucide-react'
import dynamic from 'next/dynamic'

const MapView = dynamic(() => import('@/components/MapView'), { 
  ssr: false,
  loading: () => <div className="h-full bg-gray-100 animate-pulse rounded-lg" />
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
  { value: 'SINGLE_FAMILY', label: 'House' },
  { value: 'CONDO', label: 'Condo' },
  { value: 'TOWNHOUSE', label: 'Townhome' },
  { value: 'APARTMENT', label: 'Apartment' },
  { value: 'MULTI_FAMILY', label: 'Multi-Family' },
]

const priceRanges = [
  { value: '', label: 'Any Price' },
  { value: '0-250000', label: 'Under $250K' },
  { value: '250000-500000', label: '$250K - $500K' },
  { value: '500000-750000', label: '$500K - $750K' },
  { value: '750000-1000000', label: '$750K - $1M' },
  { value: '1000000-', label: '$1M+' },
]

const bedOptions = [
  { value: '', label: 'Any Beds' },
  { value: '1', label: '1+ Beds' },
  { value: '2', label: '2+ Beds' },
  { value: '3', label: '3+ Beds' },
  { value: '4', label: '4+ Beds' },
  { value: '5', label: '5+ Beds' },
]

const bathOptions = [
  { value: '', label: 'Any Baths' },
  { value: '1', label: '1+ Baths' },
  { value: '2', label: '2+ Baths' },
  { value: '3', label: '3+ Baths' },
  { value: '4', label: '4+ Baths' },
]

function BuyContent() {
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
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minBeds: searchParams.get('minBeds') || '',
    maxBeds: searchParams.get('maxBeds') || '',
    minBaths: searchParams.get('minBaths') || '',
    maxBaths: searchParams.get('maxBaths') || '',
    minSqft: searchParams.get('minSqft') || '',
    maxSqft: searchParams.get('maxSqft') || '',
  })
  const [sortBy, setSortBy] = useState('newest')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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
      if (filters.minSqft) params.set('minSqft', filters.minSqft)
      if (filters.maxSqft) params.set('maxSqft', filters.maxSqft)
      if (sortBy === 'newest') params.set('sortBy', 'createdAt')
      if (sortBy === 'price_low') params.set('sortBy', 'price')
      if (sortBy === 'price_high') { params.set('sortBy', 'price'); params.set('sortOrder', 'desc') }
      params.set('page', page.toString())
      params.set('limit', '20')

      const res = await fetch(`/api/properties?${params.toString()}`)
      const data = await res.json()
      
      if (data.properties) {
        setProperties(data.properties)
        if (data.pagination) {
          setPagination(data.pagination)
        }
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
    router.push(`/buy?${params.toString()}`)
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
    router.push(`/buy?${params.toString()}`)
  }

  const applyFilters = () => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })
    params.set('page', '1')
    router.push(`/buy?${params.toString()}`)
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
      minSqft: '',
      maxSqft: '',
    })
    router.push('/buy')
  }

  const goToPage = (page: number) => {
    const currentParams = new URLSearchParams(searchParams.toString())
    currentParams.set('page', page.toString())
    router.push(`/buy?${currentParams.toString()}`)
  }

  const handleSignOut = () => {
    logout()
    router.push('/')
  }

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price)
  }

  const activeFilterCount = Object.values(filters).filter(v => v).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-700 sticky top-0 z-50">
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
                    pathname === link.href || (link.href === '/buy' && pathname === '/buy')
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                      : 'text-gray-700 dark:text-gray-200 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-3">
              <ThemeToggle />
              {user ? (
                <div className="flex items-center gap-4">
                  <Link href="/dashboard/saved" className="p-2 text-gray-600 hover:text-[#0066cc] transition-colors">
                    <Heart className="w-5 h-5" />
                  </Link>
                  <div className="flex items-center gap-3">
                    <Link href="/dashboard" className="flex items-center gap-2 text-gray-700 hover:text-[#0066cc]">
                      <div className="w-9 h-9 bg-gradient-to-br from-[#0066cc] to-[#0052a3] rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">{user.firstName ? user.firstName[0].toUpperCase() : 'U'}</span>
                      </div>
                      <span className="font-medium">{user.firstName}</span>
                    </Link>
                    <button onClick={handleSignOut} className="text-gray-500 hover:text-[#0066cc] text-sm font-medium">Sign Out</button>
                  </div>
                </div>
              ) : (
                <>
                  <Link href="/auth/signin" className="text-gray-700 hover:text-[#0066cc] font-medium transition-colors">Sign In</Link>
                  <Link href="/auth/signup" className="btn-primary">Get Started</Link>
                </>
              )}
            </div>

            <button className="lg:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <MenuIcon className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 py-4 px-4">
            <div className="flex flex-col space-y-3">
              <Link href="/buy" className="text-[#0066cc] font-medium py-2">Buy</Link>
              <Link href="/rent" className="text-gray-700 hover:text-[#0066cc] font-medium py-2">Rent</Link>
              <Link href="/sell" className="text-gray-700 hover:text-[#0066cc] font-medium py-2">Sell</Link>
              <Link href="/search" className="text-gray-700 hover:text-[#0066cc] font-medium py-2">Browse</Link>
              <hr className="border-gray-100" />
              {user ? (
                <>
                  <Link href="/dashboard" className="text-gray-700 font-medium py-2">Dashboard</Link>
                  <button onClick={handleSignOut} className="text-left text-gray-700 font-medium py-2">Sign Out</button>
                </>
              ) : (
                <>
                  <Link href="/auth/signin" className="text-gray-700 font-medium py-2">Sign In</Link>
                  <Link href="/auth/signup" className="btn-primary text-center">Get Started</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12 overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute top-40 -left-40 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
        </div>
        <div className="container-main relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 px-4 py-2 rounded-full mb-4">
              <span className="text-sm font-medium">🏠 {pagination.total.toLocaleString()} Homes for Sale</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Find Your Dream
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Home Today
              </span>
            </h1>
            <p className="text-lg text-white/70">Browse thousands of homes across the country</p>
          </div>
          
          {/* Search & Filters Bar */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative flex items-center">
                <div className="absolute left-4">
                  <Search className="w-5 h-5 text-white/50" />
                </div>
                <input
                  type="text"
                  placeholder="Enter city, neighborhood, ZIP, or address"
                  className="w-full pl-10 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <select 
                  className="py-3 px-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/50 [&>option]:text-black"
                  value={filters.propertyType}
                  onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                >
                  {propertyTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                <select 
                  className="py-3 px-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/50 [&>option]:text-black"
                  value={`${filters.minPrice}-${filters.maxPrice}`}
                  onChange={(e) => {
                    const [min, max] = e.target.value.split('-')
                    setFilters({ ...filters, minPrice: min || '', maxPrice: max || '' })
                  }}
                >
                  {priceRanges.map(range => (
                    <option key={range.value} value={range.value}>{range.label}</option>
                  ))}
                </select>
                <select 
                  className="py-3 px-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/50 [&>option]:text-black"
                  value={filters.minBeds}
                  onChange={(e) => handleFilterChange('minBeds', e.target.value)}
                >
                  {bedOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <select 
                  className="py-3 px-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/50 [&>option]:text-black"
                  value={filters.minBaths}
                  onChange={(e) => handleFilterChange('minBaths', e.target.value)}
                >
                  {bathOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 transform hover:scale-[1.02]">
                <Search className="w-5 h-5" />
                <span>Search</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Results Bar */}
      <div className="bg-white border-b border-gray-100 sticky top-20 z-40">
        <div className="container-main py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-gray-600 text-sm">{pagination.total.toLocaleString()} results</span>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-[#0066cc] hover:text-[#0052a3] font-medium text-sm flex items-center gap-1"
                >
                  <X className="w-4 h-4" /> Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); fetchProperties(pagination.page) }}
                className="py-2 px-3 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
              >
                <option value="newest">Newest</option>
                <option value="price_low">Price ↑</option>
                <option value="price_high">Price ↓</option>
              </select>

              <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-[#0066cc] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-[#0066cc] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => setShowMap(!showMap)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                  showMap 
                    ? 'bg-[#0066cc] text-white border-[#0066cc]' 
                    : 'border-gray-200 hover:border-gray-300'
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
      <div className="container-main py-8">
        {showMap && properties.length > 0 && (
          <div className="mb-8">
            <div className="h-[400px] rounded-2xl overflow-hidden border border-gray-200 shadow-lg">
              <MapView 
                properties={properties} 
                height="400px"
                onPropertyClick={(property) => router.push(`/property/${property.id}`)}
              />
            </div>
          </div>
        )}

        {loading ? (
          <div className="property-grid">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card-modern overflow-hidden">
                <div className="skeleton h-56"></div>
                <div className="p-5">
                  <div className="skeleton h-6 w-3/4 mb-3 rounded"></div>
                  <div className="skeleton h-4 w-1/2 mb-4 rounded"></div>
                  <div className="skeleton h-4 w-full rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : properties.length > 0 ? (
          <>
            <div className={viewMode === 'grid' ? 'property-grid' : 'space-y-4'}>
              {properties.map((property) => (
                <Link 
                  key={property.id} 
                  href={`/property/${property.id}`}
                  className="block group"
                >
                  <div className={`property-card ${viewMode === 'list' ? 'flex flex-col md:flex-row' : ''}`}>
                    <div className={`relative ${viewMode === 'list' ? 'md:w-80 h-56' : 'property-card-image'}`}>
                      {property.images && property.images.length > 0 ? (
                        <Image
                          src={property.images[0].url}
                          alt={property.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <Home className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      
                      {property.status === 'ACTIVE' ? (
                        <span className="property-card-badge sale">For Sale</span>
                      ) : property.status === 'PENDING' ? (
                        <span className="property-card-badge" style={{ background: '#f59e0b' }}>Pending</span>
                      ) : (
                        <span className="property-card-badge" style={{ background: '#6b7280' }}>Sold</span>
                      )}
                      
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
                          <span className="text-2xl font-bold text-white">
                            {formatPrice(property.price)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-5 flex-1">
                      <h3 className="text-lg font-semibold text-[#1a1a2e] mb-2 line-clamp-1 group-hover:text-[#0066cc] transition-colors">
                        {property.title}
                      </h3>
                      <div className="flex items-center gap-1 text-gray-500 text-sm mb-4">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="line-clamp-1">{property.address}, {property.city}, {property.state}</span>
                      </div>
                      
                      <div className="property-card-details">
                        {property.beds > 0 && (
                          <span><Bed className="w-4 h-4" />{property.beds} bed</span>
                        )}
                        {property.baths > 0 && (
                          <span><Bath className="w-4 h-4" />{Math.floor(property.baths)} bath</span>
                        )}
                        {property.sqft > 0 && (
                          <span><Square className="w-4 h-4" />{property.sqft.toLocaleString()} sqft</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center mt-12 gap-2">
                <button
                  onClick={() => goToPage(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                  className="p-3 border border-gray-200 rounded-xl disabled:opacity-50 hover:bg-gray-50 transition-colors"
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
                        className={`w-10 h-10 rounded-xl ${
                          pagination.page === page
                            ? 'bg-[#0066cc] text-white'
                            : 'border border-gray-200 hover:bg-gray-50'
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
                  className="p-3 border border-gray-200 rounded-xl disabled:opacity-50 hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Home className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Homes Found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
            <button onClick={clearFilters} className="btn-primary">
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="footer-main mt-12">
        <div className="container-main">
          <div className="text-center text-white/50 text-sm py-8">
            <p>&copy; 2026 HomeVista. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function BuyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0066cc]"></div></div>}>
      <BuyContent />
    </Suspense>
  )
}
