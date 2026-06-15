'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import ThemeToggle from '@/components/ThemeToggle'
import { Heart, Home, Bed, Bath, Square, MapPin, Menu, X, Trash2, ChevronRight, User, Settings, LogOut, Search } from 'lucide-react'

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
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { user, token, logout } = useAuth();
  const [savedProperties, setSavedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('saved');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const handleSignOut = () => {
    logout();
    router.push('/');
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
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    pathname === link.href || (link.href === '/sell' && pathname.startsWith('/sell'))
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 shrink-0">
            <div className="bg-card rounded-2xl p-6 border border-border sticky top-28">
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
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-foreground mb-1">Saved Homes</h1>
                  <p className="text-muted-foreground">{savedProperties.length} properties saved</p>
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
                      <motion.div key={property.id} variants={item} className="rounded-2xl bg-card border border-border overflow-hidden group">
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
  );
}

export default function SavedPropertiesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
      <SavedContent />
    </Suspense>
  );
}
