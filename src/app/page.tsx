'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, Heart, Home, MapPin, Bed, Bath, Square, 
  ArrowRight, Star, Menu, X, Building2, Key, TrendingUp,
  Shield, Users, ChevronRight, Play
} from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'

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

const heroImages = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1920&q=80'
]

const categories = [
  { title: 'House', count: '2.5M+', image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80', href: '/search?type=SINGLE_FAMILY', icon: Home, desc: 'Single-family homes with private outdoor space', gradient: 'from-blue-900/90 via-blue-800/40' },
  { title: 'Apartment', count: '800K+', image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80', href: '/search?type=APARTMENT', icon: Building2, desc: 'Urban living in multi-unit buildings', gradient: 'from-emerald-900/90 via-emerald-800/40' },
  { title: 'Condo', count: '450K+', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80', href: '/search?type=CONDO', icon: Key, desc: 'Owned units with shared amenities', gradient: 'from-purple-900/90 via-purple-800/40' },
  { title: 'Townhouse', count: '1.2M+', image: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&q=80', href: '/search?type=TOWNHOUSE', icon: Building2, desc: 'Multi-level attached homes', gradient: 'from-amber-900/90 via-amber-800/40' },
]

const features = [
  { icon: Search, title: 'Smart Search', description: 'AI-powered search that learns your preferences', color: 'bg-blue-500' },
  { icon: Shield, title: 'Verified Listings', description: 'Every property verified for accuracy', color: 'bg-green-500' },
  { icon: TrendingUp, title: 'Market Insights', description: 'Real-time data and price trends', color: 'bg-purple-500' },
  { icon: Users, title: 'Expert Agents', description: 'Top-rated local agents at your service', color: 'bg-orange-500' },
]

const stats = [
  { value: '2.5M+', label: 'Active Listings' },
  { value: '50K+', label: 'Expert Agents' },
  { value: '10M+', label: 'Happy Clients' },
  { value: '100+', label: 'Cities Covered' },
]

const testimonials = [
  { name: 'Sarah Johnson', role: 'First-time Buyer', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80', text: 'Found my dream home within weeks! The search filters made it so easy.', rating: 5 },
  { name: 'Michael Chen', role: 'Property Investor', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80', text: 'The market insights have been invaluable for my investment portfolio.', rating: 5 },
  { name: 'Emily Davis', role: 'Relocating Professional', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80', text: 'Moving cross-country was smooth thanks to virtual tours.', rating: 5 },
]

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

export default function HomePage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentHero, setCurrentHero] = useState(0)
  const [savedProperties, setSavedProperties] = useState<Set<string>>(new Set())
  const [savingId, setSavingId] = useState<string | null>(null)
  const { user, token, logout } = useAuth()
  const router = useRouter()

  useEffect(() => { fetchProperties() }, [])
  useEffect(() => {
    const interval = setInterval(() => setCurrentHero((prev) => (prev + 1) % heroImages.length), 6000)
    return () => clearInterval(interval)
  }, [])

  const handleSignOut = () => { logout(); router.push('/') }

  const fetchProperties = async () => {
    try {
      const res = await fetch('/api/properties?limit=8')
      const data = await res.json()
      if (data.properties) setProperties(data.properties)
    } catch (error) { console.error('Error fetching properties:', error) }
    finally { setLoading(false) }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
  }

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
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-16">
        <div className="absolute inset-0">
          {heroImages.map((img, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0 }}
              animate={{ opacity: idx === currentHero ? 1 : 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
            >
              <Image src={img} alt="Luxury home" fill className="object-cover" priority={idx === 0} />
            </motion.div>
          ))}
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-black/20 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full mb-6"
            >
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white/90 text-sm font-medium">{properties.length > 0 ? `${properties.length * 1000}+` : '50,000+'} Active Listings</span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Find Your
              <span className="block text-primary-foreground bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Dream Home
              </span>
            </h1>
            
            <p className="text-lg text-white/80 mb-8 max-w-xl">
              Discover thousands of properties across the country. Your perfect home is just a search away.
            </p>

            <motion.form 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.4 }}
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row gap-3 max-w-2xl mb-6"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Enter city, neighborhood, ZIP..."
                  className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button type="submit" className="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                <Search className="w-5 h-5" />
                Search
              </button>
            </motion.form>

            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-3"
            >
              {['Houses', 'Apartments', 'Condos', 'Townhomes'].map((tag) => (
                <Link key={tag} href={`/search?type=${tag.toUpperCase().slice(0, -1)}`} className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-sm hover:bg-white/20 transition-colors">
                  {tag}
                </Link>
              ))}
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 40 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.8 }}
            className="flex flex-wrap gap-6 mt-12"
          >
            {stats.map((stat, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-5 py-3">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-white/70">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {heroImages.map((_, idx) => (
            <button key={idx} onClick={() => setCurrentHero(idx)} className={`h-1.5 rounded-full transition-all ${idx === currentHero ? 'w-8 bg-white' : 'w-2 bg-white/40'}`} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            className="flex items-end justify-between mb-10"
          >
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Browse by Type</h2>
              <p className="text-muted-foreground mt-1">Explore different property types</p>
            </div>
            <Link href="/search" className="flex items-center gap-1 text-sm font-medium text-primary hover:gap-2 transition-all flex-shrink-0">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <motion.div 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {categories.map((cat, idx) => {
              const Icon = cat.icon
              return (
                <motion.div key={idx} variants={item}>
                  <Link href={cat.href} className="group relative aspect-square rounded-2xl overflow-hidden block">
                    <Image src={cat.image} alt={cat.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className={`absolute inset-0 bg-gradient-to-t ${cat.gradient} to-transparent`} />
                    <div className="absolute top-3 left-3 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-semibold text-white">{cat.title}</h3>
                      <p className="text-white/70 text-sm mt-0.5">{cat.desc}</p>
                      <p className="text-white/50 text-xs mt-1.5">{cat.count} listings</p>
                    </div>
                    <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl group-hover:ring-white/30 transition-colors" />
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            className="flex items-center justify-between mb-10"
          >
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Latest Properties</h2>
              <p className="text-muted-foreground mt-1">Hand-picked properties just for you</p>
            </div>
            <Link href="/search" className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:gap-2 transition-all">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden bg-card">
                  <div className="aspect-[4/3] bg-muted animate-pulse" />
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-muted rounded animate-pulse w-3/4" />
                    <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : properties.length > 0 ? (
            <motion.div 
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {properties.map((property, idx) => (
                <motion.div key={property.id} variants={item}>
                  <Link href={`/property/${property.id}`} className="group block rounded-2xl overflow-hidden border border-border hover:shadow-lg transition-all">
                    <div className="relative aspect-[4/3]">
                      {property.images?.[0] ? (
                        <Image src={property.images[0].url} alt={property.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Home className="w-10 h-10 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      {property.status === 'ACTIVE' && (
                        <span className="absolute top-3 left-3 px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full">For Sale</span>
                      )}
                      <button 
                        onClick={(e) => handleSave(e, property.id)}
                        className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                      >
                        <Heart className={`w-4 h-4 ${savedProperties.has(property.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                      </button>
                      <div className="absolute bottom-3 left-3 right-3">
                        <p className="text-xl font-bold text-white">{formatPrice(property.price)}</p>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold truncate group-hover:text-primary transition-colors">{property.title}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="truncate">{property.city}, {property.state}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        {property.beds > 0 && <span className="flex items-center gap-1"><Bed className="w-4 h-4" />{property.beds}</span>}
                        {property.baths > 0 && <span className="flex items-center gap-1"><Bath className="w-4 h-4" />{Math.floor(property.baths)}</span>}
                        {property.sqft > 0 && <span className="flex items-center gap-1"><Square className="w-4 h-4" />{property.sqft.toLocaleString()}</span>}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No Properties Yet</h3>
              <p className="text-muted-foreground">Be the first to list a property!</p>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold tracking-tight">Why Choose HomeVista</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">We make finding your dream home easier with cutting-edge technology.</p>
          </motion.div>

          <motion.div 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature, idx) => (
              <motion.div key={idx} variants={item} className="p-6 rounded-2xl border border-border bg-card hover:shadow-lg transition-shadow">
                <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold tracking-tight">What Our Clients Say</h2>
            <p className="text-muted-foreground mt-2">Join thousands of happy homeowners</p>
          </motion.div>

          <motion.div 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {testimonials.map((testimonial, idx) => (
              <motion.div key={idx} variants={item} className="p-6 rounded-2xl bg-card border border-border">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-orange-400 text-orange-400" />)}
                </div>
                <p className="text-muted-foreground mb-6">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <Image src={testimonial.image} alt={testimonial.name} width={40} height={40} className="rounded-full" />
                  <div>
                    <p className="font-medium">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <Image src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80" alt="Luxury home" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/70" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Find Your Perfect Home?</h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">Start your search today and get access to exclusive listings.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/search" className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors inline-flex items-center justify-center gap-2">
                Start Searching <Search className="w-5 h-5" />
              </Link>
              <Link href="/auth/signup" className="px-6 py-3 bg-white text-foreground font-semibold rounded-xl hover:bg-white/90 transition-colors inline-flex items-center justify-center gap-2">
                Create Free Account
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

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
            <p className="text-sm text-muted-foreground">© 2026 HomeVista. All rights reserved.</p>
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
