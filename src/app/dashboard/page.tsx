'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Home, Heart, User, Settings, LogOut, Search, Bell, Menu, X, Bed, Bath, Square, MapPin, Trash2, Calendar, Mail, Phone, Camera, Shield } from 'lucide-react'

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

export default function Dashboard() {
  const router = useRouter()
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

  const stats = [
    { label: 'Saved Properties', value: savedProperties.length, icon: Heart, color: 'bg-pink-500' },
    { label: 'Account Type', value: user?.role || 'User', icon: Shield, color: 'bg-purple-500' },
    { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).getFullYear() : 'N/A', icon: Calendar, color: 'bg-blue-500' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066cc]"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="container-main">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">HomeVista</span>
              </Link>
            </div>
            
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
                  className="px-4 py-2 rounded-xl font-medium text-gray-700 dark:text-gray-200 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <button className="p-2.5 hover:bg-gray-100 rounded-xl relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-semibold text-sm">{(user.firstName || user.email || 'U')[0].toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 py-4 px-4">
          <div className="flex flex-col space-y-3">
            <Link href="/" className="text-gray-700 font-medium py-2">Browse</Link>
            <Link href="/buy" className="text-gray-700 font-medium py-2">Buy</Link>
            <Link href="/rent" className="text-gray-700 font-medium py-2">Rent</Link>
            {user.role === 'ADMIN' && <Link href="/admin" className="text-gray-700 font-medium py-2">Admin</Link>}
            <button onClick={handleLogout} className="text-left text-red-600 font-medium py-2">Logout</button>
          </div>
        </div>
      )}

      <div className="container-main py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1a1a2e]">
            Welcome back, {user.firstName || 'there'}!
          </h1>
          <p className="text-gray-500 mt-1">Manage your saved properties and account settings</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="card-modern p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="card-modern overflow-hidden mb-8">
          <div className="border-b border-gray-200 bg-gray-50">
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
                      ? 'border-[#0066cc] text-[#0066cc] bg-white'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-4 h-4" /> {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'saved' && (
              <div>
                {propertiesLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : savedProperties.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedProperties.map((property) => (
                      <div key={property.id} className="property-card group">
                        <div className="property-card-image">
                          {property.images?.[0] ? (
                            <Image src={property.images[0].url} alt={property.title} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <Home className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <span className="property-card-badge sale">{property.status === 'ACTIVE' ? 'For Sale' : property.status}</span>
                          <button 
                            onClick={() => removeSavedProperty(property.id)}
                            className="property-card-favorite bg-white/90 hover:bg-red-50"
                          >
                            <Trash2 className="w-5 h-5 text-gray-600 hover:text-red-500" />
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                            <div className="property-card-price">
                              <span className="text-2xl font-bold text-white">{formatPrice(property.price)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="p-5">
                          <h3 className="font-semibold text-[#1a1a2e] mb-2 line-clamp-1">{property.title}</h3>
                          <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
                            <MapPin className="w-4 h-4" />
                            <span className="line-clamp-1">{property.address}, {property.city}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            {(property.beds || 0) > 0 && <span><Bed className="w-4 h-4 inline mr-1" />{property.beds}</span>}
                            {(property.baths || 0) > 0 && <span><Bath className="w-4 h-4 inline mr-1" />{Math.floor(property.baths || 0)}</span>}
                            {property.sqft && property.sqft > 0 && <span><Square className="w-4 h-4 inline mr-1" />{property.sqft.toLocaleString()}</span>}
                          </div>
                        </div>
                        <Link 
                          href={`/property/${property.id}`}
                          className="block w-full text-center py-3 bg-gray-50 text-[#0066cc] font-medium hover:bg-gray-100 transition-colors"
                        >
                          View Details
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No saved properties</h3>
                    <p className="text-gray-500 mb-6">Start browsing to save properties you like</p>
                    <Link href="/search" className="btn-primary">Browse Properties</Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="max-w-2xl">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#0066cc] to-[#0052a3] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-3xl">{(user.firstName || user.email || 'U')[0].toUpperCase()}</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{user.firstName} {user.lastName}</h2>
                    <p className="text-gray-500 capitalize">{user.role} Account</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="card-modern p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <User className="w-5 h-5" /> Personal Information
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-500">Email</div>
                          <div className="font-medium">{user.email || 'Not provided'}</div>
                        </div>
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-gray-400" />
                          <div>
                            <div className="text-sm text-gray-500">Phone</div>
                            <div className="font-medium">{user.phone}</div>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-500">Member Since</div>
                          <div className="font-medium">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Link href="/auth/signin" className="btn-secondary flex-1 text-center">
                      Edit Profile
                    </Link>
                    <button onClick={handleLogout} className="flex-1 px-6 py-3 border-2 border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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
            <div className="text-white/50 text-sm">© 2026 HomeVista</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
