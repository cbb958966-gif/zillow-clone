'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import ThemeToggle from '@/components/ThemeToggle'
import { Menu, X, Home, Heart, User, Bed, Bath, Square, MapPin, Trash2, Calendar, Mail, Phone, LogOut, Shield, Search, Bell } from 'lucide-react'

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
  images: { id: string; url: string; isPrimary: boolean }[]
}

interface UserData {
  user: {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
    phone: string | null
    role: string
    image: string | null
    createdAt: string
  }
}

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

export default function Dashboard() {
  const router = useRouter()
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState('saved')
  const [user, setUser] = useState<UserData['user'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [savedProperties, setSavedProperties] = useState<Property[]>([])
  const [propertiesLoading, setPropertiesLoading] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/signin')
      return
    }
    fetchUser()
  }, [router])

  useEffect(() => {
    if (activeTab === 'saved' && user) {
      fetchSavedProperties()
    }
  }, [activeTab, user])

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
      } else {
        localStorage.removeItem('token')
        router.push('/auth/signin')
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      router.push('/auth/signin')
    } finally {
      setLoading(false)
    }
  }

  const fetchSavedProperties = async () => {
    setPropertiesLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/user/saved-properties', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setSavedProperties(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching saved properties:', error)
    } finally {
      setPropertiesLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/')
  }

  const removeSavedProperty = async (propertyId: string) => {
    if (!confirm('Remove this property from saved?')) return
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/user/saved-properties?propertyId=${propertyId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        setSavedProperties(savedProperties.filter(p => p.id !== propertyId))
      }
    } catch (error) {
      console.error('Error removing property:', error)
    }
  }

  const formatPrice = (price: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)

  const navLinks = [
    { href: '/search', label: 'Browse' },
    { href: '/buy', label: 'Buy' },
    { href: '/rent', label: 'Rent' },
    { href: '/sell', label: 'Sell' },
    { href: '/mortgage', label: 'Mortgage' },
  ]

  const stats = [
    { label: 'Saved Properties', value: savedProperties.length, icon: Heart, color: 'bg-pink-500' },
    { label: 'Account Type', value: user?.role || 'User', icon: Shield, color: 'bg-purple-500' },
    { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).getFullYear() : 'N/A', icon: Calendar, color: 'bg-blue-500' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:scale-105 transition-transform">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">HomeVista</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    pathname === link.href
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <ThemeToggle />
              <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-2 pl-2 border-l border-border">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-semibold text-sm">{(user.firstName || user.email || 'U')[0].toUpperCase()}</span>
                </div>
                <span className="text-sm font-medium">{user.firstName || 'User'}</span>
              </div>
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
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="block px-4 py-2 text-sm font-medium hover:bg-secondary rounded-lg">
                    {link.label}
                  </Link>
                ))}
                <hr className="my-2 border-border" />
                <Link href="/dashboard" className="block px-4 py-2 text-sm font-medium hover:bg-secondary rounded-lg">Dashboard</Link>
                <Link href="/dashboard/saved" className="block px-4 py-2 text-sm font-medium hover:bg-secondary rounded-lg">Saved Properties</Link>
                {user.role === 'ADMIN' && <Link href="/admin" className="block px-4 py-2 text-sm font-medium hover:bg-secondary rounded-lg">Admin</Link>}
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm font-medium text-red-500 hover:bg-secondary rounded-lg">
                  Sign Out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 pt-8"
        >
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user.firstName || 'there'}!
          </h1>
          <p className="text-muted-foreground mt-1">Manage your saved properties and account settings</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {stats.map((stat, idx) => (
            <motion.div key={idx} variants={item} className="rounded-2xl bg-card border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs */}
        <div className="rounded-2xl bg-card border border-border overflow-hidden mb-8">
          <div className="border-b border-border bg-secondary/50">
            <div className="flex">
              {[
                { id: 'saved', label: 'Saved Properties', icon: Heart },
                { id: 'profile', label: 'Profile', icon: User },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-primary text-primary bg-background'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <tab.icon className="w-4 h-4" /> {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'saved' && (
                <motion.div
                  key="saved"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {propertiesLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse rounded-2xl bg-card border border-border overflow-hidden">
                          <div className="aspect-[4/3] bg-secondary"></div>
                          <div className="p-5 space-y-3">
                            <div className="h-5 bg-secondary rounded w-3/4"></div>
                            <div className="h-4 bg-secondary rounded w-1/2"></div>
                            <div className="h-4 bg-secondary rounded w-2/3"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : savedProperties.length > 0 ? (
                    <motion.div
                      variants={container}
                      initial="hidden"
                      animate="show"
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                      {savedProperties.map((property) => (
                        <motion.div key={property.id} variants={item} className="rounded-2xl bg-card border border-border overflow-hidden group">
                          <div className="relative aspect-[4/3] overflow-hidden">
                            {property.images?.[0] ? (
                              <Image src={property.images[0].url} alt={property.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                              <div className="w-full h-full bg-secondary flex items-center justify-center">
                                <Home className="w-12 h-12 text-muted-foreground/50" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <span className="absolute top-3 left-3 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                              {property.status === 'ACTIVE' ? 'For Sale' : property.status}
                            </span>
                            <button
                              onClick={() => removeSavedProperty(property.id)}
                              className="absolute top-3 right-3 w-9 h-9 bg-background/90 hover:bg-red-50 rounded-full flex items-center justify-center transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-500 transition-colors" />
                            </button>
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                              <div className="text-2xl font-bold text-white">{formatPrice(property.price)}</div>
                            </div>
                          </div>
                          <div className="p-5">
                            <h3 className="font-semibold text-foreground mb-2 line-clamp-1">{property.title}</h3>
                            <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
                              <MapPin className="w-4 h-4 flex-shrink-0" />
                              <span className="line-clamp-1">{property.address}, {property.city}</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              {(property.beds || 0) > 0 && <span className="flex items-center gap-1"><Bed className="w-4 h-4" />{property.beds}</span>}
                              {(property.baths || 0) > 0 && <span className="flex items-center gap-1"><Bath className="w-4 h-4" />{Math.floor(property.baths || 0)}</span>}
                              {property.sqft && property.sqft > 0 && <span className="flex items-center gap-1"><Square className="w-4 h-4" />{property.sqft.toLocaleString()}</span>}
                            </div>
                          </div>
                          <Link
                            href={`/property/${property.id}`}
                            className="block w-full text-center py-3 bg-secondary/50 text-primary font-medium hover:bg-secondary transition-colors border-t border-border"
                          >
                            View Details
                          </Link>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-16"
                    >
                      <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart className="w-10 h-10 text-muted-foreground/50" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">No saved properties yet</h3>
                      <p className="text-muted-foreground mb-6 max-w-sm mx-auto">Start browsing to save properties you like and they&apos;ll appear here</p>
                      <Link
                        href="/search"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors"
                      >
                        <Search className="w-4 h-4" /> Browse Properties
                      </Link>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="max-w-2xl"
                >
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-primary-foreground font-bold text-3xl">{(user.firstName || user.email || 'U')[0].toUpperCase()}</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">{user.firstName} {user.lastName}</h2>
                      <p className="text-muted-foreground capitalize">{user.role} Account</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="rounded-2xl bg-card border border-border p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <User className="w-5 h-5" /> Personal Information
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <div className="text-sm text-muted-foreground">Email</div>
                            <div className="font-medium text-foreground">{user.email || 'Not provided'}</div>
                          </div>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <div className="text-sm text-muted-foreground">Phone</div>
                              <div className="font-medium text-foreground">{user.phone}</div>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <div className="text-sm text-muted-foreground">Member Since</div>
                            <div className="font-medium text-foreground">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Link
                        href="/auth/signin"
                        className="px-6 py-3 border-2 border-primary text-primary font-semibold rounded-xl hover:bg-primary hover:text-primary-foreground transition-colors text-center flex-1 inline-flex items-center justify-center gap-2"
                      >
                        Edit Profile
                      </Link>
                      <button onClick={handleLogout} className="px-6 py-3 border-2 border-red-200 dark:border-red-900 text-red-500 rounded-xl font-medium hover:bg-red-50 dark:hover:bg-red-950 transition-colors flex-1 inline-flex items-center justify-center gap-2">
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/30">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">HomeVista</span>
              </Link>
              <p className="text-sm text-muted-foreground">Your trusted partner in finding the perfect home.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/search" className="hover:text-foreground transition-colors">Browse</Link></li>
                <li><Link href="/buy" className="hover:text-foreground transition-colors">Buy</Link></li>
                <li><Link href="/rent" className="hover:text-foreground transition-colors">Rent</Link></li>
                <li><Link href="/sell" className="hover:text-foreground transition-colors">Sell</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/mortgage" className="hover:text-foreground transition-colors">Mortgage Calculator</Link></li>
                <li><Link href="/agent" className="hover:text-foreground transition-colors">Find Agents</Link></li>
                <li><Link href="/help" className="hover:text-foreground transition-colors">Help Center</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">&copy; 2026 HomeVista. All rights reserved.</p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
