'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import { Home, Heart, User, Bed, Bath, Square, MapPin, Trash2, Calendar, Mail, Phone, LogOut, Shield, Search } from 'lucide-react'

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
  const [activeTab, setActiveTab] = useState('saved')
  const [user, setUser] = useState<UserData['user'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [savedProperties, setSavedProperties] = useState<Property[]>([])
  const [propertiesLoading, setPropertiesLoading] = useState(false)

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

  const stats = [
    { label: 'Saved Properties', value: savedProperties.length, icon: Heart, color: 'bg-pink-500' },
    { label: 'Account Type', value: user?.role || 'User', icon: Shield, color: 'bg-purple-500', href: user?.role === 'ADMIN' || user?.role === 'admin' ? '/admin' : undefined },
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
      <SiteHeader />

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
          {stats.map((stat, idx) => {
            const card = (
              <div className="surface-card surface-card-hover p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            )
            return (
              <motion.div key={idx} variants={item}>
                {stat.href ? <Link href={stat.href} className="block cursor-pointer">{card}</Link> : card}
              </motion.div>
            )
          })}
        </motion.div>

        {/* Tabs */}
        <div className="surface-card overflow-hidden mb-8">
          <div className="glass-control border-b border-border overflow-x-auto">
            <div className="flex min-w-max md:min-w-0">
              {[
                { id: 'saved', label: 'Saved Properties', icon: Heart },
                { id: 'profile', label: 'Profile', icon: User },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary text-primary bg-background'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <tab.icon className="w-3.5 md:w-4 h-3.5 md:h-4" /> {tab.label}
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
                        <motion.div key={property.id} variants={item} className="surface-card surface-card-hover overflow-hidden group">
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
                    <div className="surface-card surface-card-hover p-6">
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

      <SiteFooter />
    </div>
  )
}
