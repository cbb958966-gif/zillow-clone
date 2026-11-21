'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Heart, Home, LogOut, Menu, Sparkles, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import ThemeToggle from '@/components/ThemeToggle'

const navLinks = [
  { href: '/search', label: 'Browse' },
  { href: '/buy', label: 'Buy' },
  { href: '/rent', label: 'Rent' },
  { href: '/sell', label: 'Sell' },
  { href: '/mortgage', label: 'Mortgage' },
] as const

function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="tilt-scene relative grid h-9 w-9 place-items-center rounded-[13px] bg-gradient-to-br from-[#0a84ff] to-[#005bb5] shadow-[0_8px_20px_-8px_rgba(0,113,227,0.9)]">
        <span className="pointer-events-none absolute inset-[1px] rounded-[12px] bg-gradient-to-b from-white/35 to-transparent" />
        <Home className="relative h-[18px] w-[18px] text-white" strokeWidth={2.4} />
      </span>
      <span className="display-title text-[19px]">HomeVista</span>
    </span>
  )
}

export default function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (href: string) =>
    pathname === href || (href === '/search' && (pathname === '/buy' || pathname === '/rent'))

  const handleSignOut = () => {
    logout()
    setMobileMenuOpen(false)
    router.push('/')
  }

  return (
    <header className="glass-control fixed inset-x-0 top-0 z-50 border-x-0 border-t-0">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group shrink-0" onClick={() => setMobileMenuOpen(false)}>
          <span className="block transition-transform duration-500 group-hover:-translate-y-0.5">
            <Logo />
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 rounded-full border border-border/60 bg-card/50 p-1 lg:flex" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${
                isActive(link.href) ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {isActive(link.href) && (
                <motion.span
                  layoutId="site-header-active"
                  className="absolute inset-0 rounded-full bg-card shadow-sm"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative">{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-1.5 lg:flex">
          <ThemeToggle />
          {user ? (
            <>
              <Link
                href="/dashboard/saved"
                className="relative grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label="Saved properties"
              >
                <Heart className="h-[18px] w-[18px]" />
              </Link>
              <Link
                href="/dashboard"
                className="ml-1 flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-3.5 shadow-sm transition-transform hover:-translate-y-0.5"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-[#0a84ff] to-[#005bb5] text-xs font-semibold text-white">
                  {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                </span>
                <span className="max-w-24 truncate text-[13px] font-medium">{user.firstName || 'Account'}</span>
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="ml-1 grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/signin" className="rounded-full px-4 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground">
                Sign In
              </Link>
              <Link href="/auth/signup" className="btn-smooth !px-5 !py-2 text-[13px]">
                Get Started <Sparkles className="h-3.5 w-3.5" />
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card/70 text-foreground"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-[18px] w-[18px]" /> : <Menu className="h-[18px] w-[18px]" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-border/70 bg-card/95 backdrop-blur-2xl lg:hidden"
          >
            <nav className="mx-auto max-w-7xl space-y-1 px-4 py-4 sm:px-6" aria-label="Mobile navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block rounded-xl px-4 py-2.5 text-sm font-medium ${isActive(link.href) ? 'bg-secondary text-foreground' : 'text-muted-foreground'}`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="my-3 h-px bg-border" />
              {user ? (
                <>
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground">Dashboard</Link>
                  <Link href="/dashboard/saved" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground">Saved homes</Link>
                  <button type="button" onClick={handleSignOut} className="block w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium text-muted-foreground">Sign out</button>
                </>
              ) : (
                <>
                  <Link href="/auth/signin" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground">Sign in</Link>
                  <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)} className="btn-smooth mt-2 w-full">Get started</Link>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
