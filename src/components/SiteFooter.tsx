'use client'

import Link from 'next/link'
import { ArrowUpRight, Home } from 'lucide-react'

const columns = [
  {
    title: 'Explore',
    links: [
      { href: '/search', label: 'Browse homes' },
      { href: '/buy', label: 'Buy' },
      { href: '/rent', label: 'Rent' },
      { href: '/sell', label: 'Sell' },
    ],
  },
  {
    title: 'Tools',
    links: [
      { href: '/mortgage', label: 'Mortgage calculator' },
      { href: '/dashboard/saved', label: 'Saved homes' },
      { href: '/help', label: 'Help center' },
      { href: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About us' },
      { href: '/privacy', label: 'Privacy' },
      { href: '/terms', label: 'Terms' },
    ],
  },
] as const

export default function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-border bg-card/60">
      <div className="pointer-events-none absolute -bottom-32 left-1/2 h-64 w-[42rem] -translate-x-1/2 rounded-full bg-[rgba(var(--primary-rgb),0.09)] blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Link href="/" className="group inline-flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-[13px] bg-gradient-to-br from-[#0a84ff] to-[#005bb5] shadow-[0_8px_20px_-8px_rgba(0,113,227,0.9)]">
                <Home className="h-[18px] w-[18px] text-white" strokeWidth={2.4} />
              </span>
              <span className="display-title text-[19px]">PRIMAHOMES</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              A calmer way to find your next home. Thoughtful search, verified listings, and the details that matter.
            </p>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="mb-4 text-[13px] font-semibold tracking-tight">{column.title}</h3>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="group inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {link.label}
                      <ArrowUpRight className="h-3 w-3 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 PRIMAHOMES. Crafted for the way you live.</p>
          <div className="flex items-center gap-5">
            <Link href="/terms" className="transition-colors hover:text-foreground">Terms</Link>
            <Link href="/privacy" className="transition-colors hover:text-foreground">Privacy</Link>
            <Link href="/help" className="transition-colors hover:text-foreground">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
