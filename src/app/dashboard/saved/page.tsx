'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from '@/components/ThemeToggle';
import { Heart, Home, Bed, Bath, Square, MapPin, Menu, X, Trash2, ChevronRight, User, Settings, LogOut, Search } from 'lucide-react';

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

function SavedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066cc]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-700">
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
                  className="px-4 py-2 rounded-xl font-medium text-gray-700 dark:text-gray-200 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-3">
              <ThemeToggle />
              <button onClick={handleSignOut} className="px-4 py-2 rounded-xl font-medium text-gray-700 hover:text-cyan-600 hover:bg-gray-100 transition-all duration-300">
                Sign Out
              </button>
            </div>

            <button className="lg:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 py-6 px-4 shadow-xl">
            <div className="flex flex-col space-y-4">
              <Link href="/search" className="text-gray-700 hover:text-[#0066cc] font-medium py-2">Browse</Link>
              <Link href="/dashboard/profile" className="text-gray-700 hover:text-[#0066cc] font-medium py-2">Profile</Link>
              <button onClick={handleSignOut} className="text-left text-gray-700 hover:text-[#0066cc] font-medium py-2">Sign Out</button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="container-main pt-28 pb-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 shrink-0">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-28">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-br from-[#0066cc] to-[#0052a3] rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {user?.firstName ? user.firstName[0].toUpperCase() : 'U'}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-[#1a1a2e]">{user?.firstName || 'User'}</div>
                  <div className="text-sm text-gray-500">{user?.email || ''}</div>
                </div>
              </div>

              <nav className="space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === item.id
                        ? 'bg-[#0066cc] text-white'
                        : 'text-gray-600 hover:bg-gray-50'
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
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-[#1a1a2e] mb-1">Saved Homes</h1>
                  <p className="text-gray-500">{savedProperties.length} properties saved</p>
                </div>
                <Link href="/search" className="btn-primary flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Browse More
                </Link>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6">
                  {error}
                </div>
              )}

              {savedProperties.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No saved properties</h3>
                  <p className="text-gray-500 mb-6">Start browsing and save properties you're interested in!</p>
                  <Link href="/search" className="btn-primary inline-flex items-center gap-2">
                    Browse Properties <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {savedProperties.map((property) => {
                    const primaryImage = property.images?.find(img => img.isPrimary) || property.images?.[0];
                    
                    return (
                      <div key={property.id} className="property-card group">
                        <Link href={`/property/${property.id}`}>
                          <div className="property-card-image">
                            {primaryImage ? (
                              <Image
                                src={primaryImage.url}
                                alt={property.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                <Home className="w-12 h-12 text-gray-400" />
                              </div>
                            )}
                            <span className="property-card-badge sale">For Sale</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                removeSavedProperty(property.id);
                              }}
                              disabled={removingId === property.id}
                              className="property-card-favorite active"
                              title="Remove from saved"
                            >
                              {removingId === property.id ? (
                                <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin" />
                              ) : (
                                <Heart className="w-5 h-5 fill-current text-white" />
                              )}
                            </button>
                          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                            <div className="property-card-price">
                              <span className="text-2xl font-bold text-white">
                                {formatPrice(property.price)}
                              </span>
                            </div>
                          </div>
                          </div>
                        </Link>

                        <div className="p-5">
                          <Link href={`/property/${property.id}`}>
                            <h3 className="text-lg font-semibold text-[#1a1a2e] mb-2 line-clamp-1 group-hover:text-[#0066cc] transition-colors">
                              {property.title}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-1 text-gray-500 text-sm mb-4">
                            <MapPin className="w-4 h-4 shrink-0" />
                            <span className="line-clamp-1">{property.address}, {property.city}, {property.state}</span>
                          </div>
                          
                          <div className="property-card-details">
                            {property.beds && property.beds > 0 && (
                              <span><Bed className="w-4 h-4" />{property.beds} bed</span>
                            )}
                            {property.baths && property.baths > 0 && (
                              <span><Bath className="w-4 h-4" />{Math.floor(property.baths)} bath</span>
                            )}
                            {property.sqft && property.sqft > 0 && (
                              <span><Square className="w-4 h-4" />{property.sqft.toLocaleString()} sqft</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default function SavedPropertiesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066cc]"></div></div>}>
      <SavedContent />
    </Suspense>
  );
}
