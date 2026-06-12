'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { 
  Home, Users, Building, Calculator, 
  ChevronRight, Check, Calendar, 
  ChartLine, FileText, Search, Heart, Menu as MenuIcon
} from 'lucide-react'

export default function SellPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [activeOption, setActiveOption] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = () => {
    logout()
    router.push('/')
  }

  const sellingOptions = [
    {
      id: 'agent',
      icon: Users,
      title: 'Sell with a Partner Agent',
      description: 'Connect with a top-performing agent who offers premium services.',
      color: 'blue',
      features: [
        'Professional marketing',
        'Virtual tours & 3D floor plans',
        'Negotiation expertise',
        'Maximize your sale price'
      ],
      cta: 'Get Started'
    },
    {
      id: 'cash',
      icon: Home,
      title: 'Get a Cash Offer',
      description: 'Sell directly and get cash in as little as 10 days.',
      color: 'blue',
      features: [
        'No showings required',
        'Sell as-is, no repairs',
        'Choose your closing date',
        'Quick cash payment'
      ],
      cta: 'Check Eligibility'
    },
    {
      id: 'find',
      icon: Search,
      title: 'Find Your Own Agent',
      description: 'Browse verified agents with proven track records in your area.',
      color: 'blue',
      features: [
        'Verified reviews',
        'Local expertise',
        'Specialties & credentials',
        'Interview before hiring'
      ],
      cta: 'Find Agents'
    },
    {
      id: 'fsbo',
      icon: Building,
      title: 'Sell It Yourself',
      description: 'List your home as For Sale By Owner and keep 100% of the profit.',
      color: 'blue',
      features: [
        'Full control over process',
        'No agent commissions',
        'Direct buyer negotiations',
        'FSBO listing tools'
      ],
      cta: 'List Your Home'
    }
  ]

  const resources = [
    {
      title: '14 tips for selling your home fast',
      category: 'Tips & Tricks',
      readTime: '8 min read',
      imageColor: 'bg-[#0066cc]'
    },
    {
      title: 'How to choose the right agent',
      category: 'Agent Guide',
      readTime: '6 min read',
      imageColor: 'bg-[#0052a3]'
    },
    {
      title: 'Steps to selling a house',
      category: 'Step by Step',
      readTime: '15 min read',
      imageColor: 'bg-[#0066cc]'
    },
    {
      title: 'When is the best time to sell?',
      category: 'Market Timing',
      readTime: '7 min read',
      imageColor: 'bg-[#0052a3]'
    }
  ]

  const faqs = [
    {
      question: 'Where should I begin when selling my house?',
      answer: 'Start by gathering information about your home and considering your options. Choose a selling path that works best for you, then take the first step: contact an agent, request a cash offer, or begin home prep.'
    },
    {
      question: 'How do partner agents help sell homes faster?',
      answer: 'Our partner agents offer premium listing experiences including increased exposure, marketing to interested buyers, virtual tours, and interactive floor plans. These listings are more likely to sell faster and for more money.'
    },
    {
      question: 'What are the benefits of listing on public portals?',
      answer: 'When you list publicly on the MLS, your home gets maximum visibility across all major real estate sites. Studies show homes listed publicly sell for 17.5% more than off-MLS listings.'
    },
    {
      question: 'How long does it take to sell a house?',
      answer: 'On average, homes spend about one month on the market before going under contract, and another month to close. The total process is typically 55-70 days from list to close.'
    },
    {
      question: 'What seller mistakes should I avoid?',
      answer: 'Common mistakes include overpricing, poor timing, incomplete repairs, unprofessional photography, and forgetting to factor in closing costs. Always consult with a professional to understand your net proceeds.'
    }
  ]

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
                    pathname === link.href || (link.href === '/sell' && pathname === '/sell')
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                      : 'text-gray-700 dark:text-gray-200 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-4">
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
                    {user.role === 'ADMIN' && (
                      <Link href="/admin" className="text-gray-700 hover:text-[#0066cc] font-medium transition-colors">Admin</Link>
                    )}
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
              <Link href="/buy" className="text-gray-700 hover:text-[#0066cc] font-medium py-2">Buy</Link>
              <Link href="/rent" className="text-gray-700 hover:text-[#0066cc] font-medium py-2">Rent</Link>
              <Link href="/sell" className="text-[#0066cc] font-medium py-2">Sell</Link>
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

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-20 overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-40 -left-40 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute -bottom-40 left-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-2000" />
        </div>
        <div className="container-main relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 px-4 py-2 rounded-full mb-6">
              <span className="text-sm font-medium">💰 Free to list • No hidden fees</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Sell Your Home
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                With Confidence
              </span>
            </h1>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Get the best value for your home with our modern selling platform. 
              Connect with thousands of ready buyers.
            </p>
            <Link 
              href="/sell/list-your-home"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold px-8 py-4 rounded-2xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/30 transform hover:scale-105"
            >
              {user ? 'List Your Home' : 'Get Started'}
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Selling Options */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container-main">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a2e] text-center mb-4">
            Explore Your Selling Options
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Choose the best way to sell your home that fits your timeline and goals
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sellingOptions.map((option) => (
              <div 
                key={option.id}
                className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:transform hover:-translate-y-1"
                onClick={() => setActiveOption(activeOption === option.id ? null : option.id)}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
                  <option.icon className="w-7 h-7 text-cyan-600" />
                </div>
                <h3 className="text-lg font-bold text-[#1a1a2e] mb-2">{option.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{option.description}</p>
                
                {activeOption === option.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <ul className="space-y-2">
                      {option.features.map((feature, i) => (
                        <li key={i} className="flex items-center text-sm text-gray-600">
                          <Check className="w-4 h-4 text-cyan-600 mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/sell/list-your-home"
                      className="mt-4 block w-full text-center py-3 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 transition-all"
                    >
                      {option.cta}
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Home Value Estimator CTA */}
      <section className="py-16">
        <div className="container-main">
          <div className="bg-gradient-to-r from-[#0066cc] to-[#0052a3] rounded-2xl p-8 md:p-12 text-white">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-4">What's your home worth?</h2>
                <p className="text-white/80 mb-6">
                  Get a free home value estimate instantly. Know your home's worth before you list.
                </p>
                <Link 
                  href="/mortgage"
                  className="inline-flex items-center bg-white text-[#0066cc] px-6 py-3 rounded-xl font-medium hover:bg-blue-50"
                >
                  <Calculator className="w-5 h-5 mr-2" />
                  Get Free Estimate
                </Link>
              </div>
              <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center">
                <Home className="w-16 h-16 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-main">
          <h2 className="text-3xl font-bold text-[#1a1a2e] text-center mb-4">
            Resources for sellers
          </h2>
          <p className="text-gray-600 text-center mb-12">
            Expert guides and tips for every step of your selling journey
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {resources.map((resource, i) => (
              <div key={i} className="card-modern overflow-hidden">
                <div className={`h-32 ${resource.imageColor} flex items-center justify-center`}>
                  <FileText className="w-12 h-12 text-white" />
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-500 mb-1">{resource.category} • {resource.readTime}</p>
                  <h3 className="font-semibold text-[#1a1a2e]">{resource.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why List With Us */}
      <section className="py-16">
        <div className="container-main">
          <h2 className="text-3xl font-bold text-[#1a1a2e] text-center mb-12">
            Why sell with HomeVista?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#0066cc]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-[#0066cc]" />
              </div>
              <h3 className="font-semibold text-[#1a1a2e] mb-2">Largest Audience</h3>
              <p className="text-gray-600">Reach millions of buyers on the most visited real estate website.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#0066cc]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChartLine className="w-8 h-8 text-[#0066cc]" />
              </div>
              <h3 className="font-semibold text-[#1a1a2e] mb-2">Sell for More</h3>
              <p className="text-gray-600">Homes listed on MLS sell for 17.5% more on average.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#0066cc]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-[#0066cc]" />
              </div>
              <h3 className="font-semibold text-[#1a1a2e] mb-2">Faster Closings</h3>
              <p className="text-gray-600">Streamlined process helps you close faster and easier.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-main">
          <h2 className="text-3xl font-bold text-[#1a1a2e] text-center mb-12">
            Frequently asked questions
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="card-modern overflow-hidden">
                <details className="group">
                  <summary className="flex items-center justify-between p-5 cursor-pointer">
                    <span className="font-medium text-[#1a1a2e]">{faq.question}</span>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="px-5 pb-5 text-gray-600">
                    {faq.answer}
                  </div>
                </details>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="hero-bg-modern py-16">
        <div className="container-main">
          <div className="max-w-2xl mx-auto text-center relative z-10">
            <h2 className="text-3xl font-bold text-white mb-4">
              Find your perfect selling path
            </h2>
            <p className="text-white/80 mb-8">
              Answer a few simple questions to determine whether selling with a partner agent is best for you. No commitment required.
            </p>
            <Link 
              href="/sell/list-your-home"
              className="btn-primary inline-block px-8 py-4"
            >
              Explore Selling Options
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-main">
        <div className="container-main">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-4">About</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white">About HomeVista</Link></li>
                <li><Link href="#" className="hover:text-white">Careers</Link></li>
                <li><Link href="#" className="hover:text-white">Press</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Explore</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/buy" className="hover:text-white">Buy</Link></li>
                <li><Link href="/rent" className="hover:text-white">Rent</Link></li>
                <li><Link href="/sell" className="hover:text-white">Sell</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/mortgage" className="hover:text-white">Mortgage</Link></li>
                <li><Link href="#" className="hover:text-white">Find Agents</Link></li>
                <li><Link href="#" className="hover:text-white">Help</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">Facebook</a>
                <a href="#" className="text-gray-400 hover:text-white">Twitter</a>
                <a href="#" className="text-gray-400 hover:text-white">Instagram</a>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 text-center text-white/50 text-sm">
            <p>&copy; 2026 HomeVista. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
