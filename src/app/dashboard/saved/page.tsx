'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'
import { motion } from 'framer-motion'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import { Heart, Home, Bed, Bath, Square, MapPin, ChevronRight, User, Search } from 'lucide-react'

interface Property {
  id: string;
  title: string;
  price: number;
  address: string;
  city: string;
  state: string;
  beds?: number;
  baths?: number;
  sqft?: number;
  images: Array<{
    id: string;
    url: string;
    isPrimary: boolean;
  }>;
}

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

function SavedContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [savedProperties, setSavedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('saved');
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      router.push('/auth/signin');
      return;
    }
    fetchSavedProperties();
  }, []);

  const fetchSavedProperties = async () => {
    try {
      const storedToken = localStorage.getItem('token');
      const response = await fetch('/api/user/saved-properties', {
        headers: {
          'Authorization': `Bearer ${storedToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSavedProperties(data.data || []);
      } else {
        setError('Failed to fetch saved properties');
      }
    } catch (err) {
      setError('An error occurred while fetching saved properties');
    } finally {
      setLoading(false);
    }
  };

  const removeSavedProperty = async (propertyId: string) => {
    setRemovingId(propertyId);
    try {
      const storedToken = localStorage.getItem('token');
      const response = await fetch(`/api/user/saved-properties?propertyId=${propertyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${storedToken}`
        }
      });

      if (response.ok) {
        setSavedProperties(savedProperties.filter(p => p.id !== propertyId));
      }
    } catch (err) {
      console.error('Error removing property:', err);
    } finally {
      setRemovingId(null);
    }
  };



  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const navItems = [
    { id: 'saved', label: 'Saved Homes', icon: Heart, href: '/dashboard/saved' },
    { id: 'profile', label: 'Profile', icon: User, href: '/dashboard/profile' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 shrink-0">
            <div className="surface-card p-6 sticky top-28">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-semibold text-lg">
                    {user?.firstName ? user.firstName[0].toUpperCase() : 'U'}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-foreground">{user?.firstName || 'User'}</div>
                  <div className="text-sm text-muted-foreground">{user?.email || ''}</div>
                </div>
              </div>

              <nav className="space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === item.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1">
            <div className="surface-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-foreground mb-1">Saved Homes</h1>
                  <p className="pill mt-2 text-muted-foreground">{savedProperties.length} properties saved</p>
                </div>
                <Link href="/search" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors">
                  <Search className="w-4 h-4" />
                  Browse More
                </Link>
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl mb-6">
                  {error}
                </div>
              )}

              {savedProperties.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16"
                >
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">No saved properties</h3>
                  <p className="text-muted-foreground mb-6">Start browsing and save properties you're interested in!</p>
                  <Link href="/search" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors">
                    Browse Properties <ChevronRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              ) : (
                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {savedProperties.map((property) => {
                    const primaryImage = property.images?.find(img => img.isPrimary) || property.images?.[0];

                    return (
                      <motion.div key={property.id} variants={item} className="surface-card surface-card-hover overflow-hidden group">
                        <Link href={`/property/${property.id}`}>
                          <div className="relative aspect-[4/3] overflow-hidden">
                            {primaryImage ? (
                              <Image
                                src={primaryImage.url}
                                alt={property.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full bg-muted flex items-center justify-center">
                                <Home className="w-12 h-12 text-muted-foreground" />
                              </div>
                            )}
                            <span className="absolute top-3 left-3 px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full">For Sale</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                removeSavedProperty(property.id);
                              }}
                              disabled={removingId === property.id}
                              className="absolute top-3 right-3 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                              title="Remove from saved"
                            >
                              {removingId === property.id ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Heart className="w-4 h-4 fill-white text-white" />
                              )}
                            </button>
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                              <span className="text-2xl font-bold text-white">
                                {formatPrice(property.price)}
                              </span>
                            </div>
                          </div>
                        </Link>

                        <div className="p-5">
                          <Link href={`/property/${property.id}`}>
                            <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                              {property.title}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-1 text-muted-foreground text-sm mb-4">
                            <MapPin className="w-4 h-4 shrink-0" />
                            <span className="line-clamp-1">{property.address}, {property.city}, {property.state}</span>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {property.beds && property.beds > 0 && (
                              <span className="flex items-center gap-1.5"><Bed className="w-4 h-4" />{property.beds} bed</span>
                            )}
                            {property.baths && property.baths > 0 && (
                              <span className="flex items-center gap-1.5"><Bath className="w-4 h-4" />{Math.floor(property.baths)} bath</span>
                            )}
                            {property.sqft && property.sqft > 0 && (
                              <span className="flex items-center gap-1.5"><Square className="w-4 h-4" />{property.sqft.toLocaleString()} sqft</span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </div>
          </main>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}

export default function SavedPropertiesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
      <SavedContent />
    </Suspense>
  );
}
