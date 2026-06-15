'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Heart, Menu, X, FileText } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'

export default function TermsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const handleSignOut = () => { logout(); router.push('/') }

  return (
    <div className="min-h-screen bg-background">
      <motion.header initial={{ y: -100 }} animate={{ y: 0 }} className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform"><Home className="w-5 h-5 text-white" /></div>
              <span className="text-xl font-bold tracking-tight">HomeVista</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {[{href:'/search',label:'Browse'},{href:'/buy',label:'Buy'},{href:'/rent',label:'Rent'},{href:'/sell',label:'Sell'},{href:'/mortgage',label:'Mortgage'}].map((link) => (
                <Link key={link.href} href={link.href} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${pathname === link.href ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}>{link.label}</Link>
              ))}
            </nav>
            <div className="hidden md:flex items-center gap-3">
              <ThemeToggle />
              {user ? (
                <div className="flex items-center gap-3">
                  <Link href="/dashboard/saved" className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"><Heart className="w-5 h-5" /></Link>
                  <Link href="/dashboard" className="flex items-center gap-2 hover:bg-secondary rounded-lg p-2 transition-colors">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center"><span className="text-white text-sm font-medium">{user.firstName?.[0] || 'U'}</span></div>
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
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden border-t border-border bg-background overflow-hidden">
              <div className="px-4 py-4 space-y-3">
                {[{href:'/search',label:'Browse'},{href:'/buy',label:'Buy'},{href:'/rent',label:'Rent'},{href:'/sell',label:'Sell'},{href:'/mortgage',label:'Mortgage'}].map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary">{link.label}</Link>
                ))}
                <hr className="border-border" />
                {user ? (
                  <button onClick={() => { handleSignOut(); setMobileMenuOpen(false) }} className="w-full text-left px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Sign Out</button>
                ) : (
                  <>
                    <Link href="/auth/signin" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Sign In</Link>
                    <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg text-center">Get Started</Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <div className="pt-16">
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl sm:text-5xl font-bold mb-6">Terms of Service</h1>
              <p className="text-lg text-muted-foreground">Last updated: January 1, 2026</p>
            </motion.div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-8">
              <div><h2 className="text-2xl font-bold mb-4">Acceptance of Terms</h2><p className="text-muted-foreground leading-relaxed">By accessing or using HomeVista, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services. We reserve the right to update these terms at any time.</p></div>
              <div><h2 className="text-2xl font-bold mb-4">Account Registration</h2><p className="text-muted-foreground leading-relaxed">You must create an account to access certain features. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You must provide accurate and complete information.</p></div>
              <div><h2 className="text-2xl font-bold mb-4">Property Listings</h2><p className="text-muted-foreground leading-relaxed">HomeVista provides a platform for listing and searching properties. We do not guarantee the accuracy of listings and are not party to any transactions. Users should verify all information independently.</p></div>
              <div><h2 className="text-2xl font-bold mb-4">User Conduct</h2><p className="text-muted-foreground leading-relaxed">You agree not to misuse our services, interfere with the platform, or engage in fraudulent activities. You may not scrape or reproduce our content without permission.</p></div>
              <div><h2 className="text-2xl font-bold mb-4">Limitation of Liability</h2><p className="text-muted-foreground leading-relaxed">HomeVista shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services. Our total liability is limited to the amount paid by you, if any.</p></div>
              <div><h2 className="text-2xl font-bold mb-4">Contact</h2><p className="text-muted-foreground leading-relaxed">For questions about these terms, contact us at support@homevista.com.</p></div>
            </div>
          </div>
        </section>
      </div>

      <footer className="bg-secondary text-secondary-foreground py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center"><Home className="w-5 h-5 text-white" /></div>
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
  )
}
