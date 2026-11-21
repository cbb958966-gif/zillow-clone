'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Bath,
  Box,
  Bed,
  Building2,
  Heart,
  Home,
  Key,
  Loader2,
  MapPin,
  Search,
  Shield,
  Square,
  Star,
  TrendingUp,
  Users,
  X,
} from 'lucide-react'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'

interface Property {
  id: string
  title: string
  city: string
  state: string
  price: number
  beds: number
  baths: number
  sqft: number
  status: string
  propertyType?: string
  createdAt?: string
  images: { url: string; isPrimary: boolean }[]
}

const heroImages = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1920&q=80',
]

const newListingCutoff = Date.now() - 14 * 24 * 60 * 60 * 1000

const categories = [
  { title: 'Houses', count: '2.5M+', image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900&q=80', href: '/search?type=SINGLE_FAMILY', icon: Home, description: 'Space to grow, room to breathe', span: 'lg:col-span-2' },
  { title: 'Apartments', count: '800K+', image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80', href: '/search?type=APARTMENT', icon: Building2, description: 'City living, simplified', span: '' },
  { title: 'Condos', count: '450K+', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80', href: '/search?type=CONDO', icon: Key, description: 'Low maintenance, high reward', span: '' },
  { title: 'Townhomes', count: '1.2M+', image: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&q=80', href: '/search?type=TOWNHOUSE', icon: Building2, description: 'Attached living, own entrance', span: '' },
]

const features = [
  { icon: Search, title: 'Search that understands', description: 'Natural language filters that learn what matters to you.', tint: 'from-[#0071e3]/18 to-[#38bdf8]/4', iconClass: 'text-[#0071e3]' },
  { icon: Shield, title: 'Verified by default', description: 'Every listing is checked for accuracy before it reaches you.', tint: 'from-emerald-500/18 to-emerald-500/4', iconClass: 'text-emerald-600' },
  { icon: TrendingUp, title: 'Clarity on price', description: 'Live market context so you can move with confidence.', tint: 'from-violet-500/18 to-violet-500/4', iconClass: 'text-violet-600' },
  { icon: Users, title: 'People, not portals', description: 'Local agents who know the streets, schools, and stories.', tint: 'from-amber-500/18 to-amber-500/4', iconClass: 'text-amber-600' },
]

const stats = [
  { value: '2.5M+', label: 'Active listings', icon: Home },
  { value: '50K+', label: 'Local agents', icon: Users },
  { value: '10M+', label: 'Families helped', icon: Heart },
  { value: '100+', label: 'Cities covered', icon: MapPin },
]

const testimonials = [
  { name: 'Sarah Johnson', role: 'First-time buyer', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80', text: 'Found my dream home within weeks. The search felt effortless from the very first click.' },
  { name: 'Michael Chen', role: 'Property investor', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80', text: 'The market insights have been invaluable for building my portfolio with confidence.' },
  { name: 'Emily Davis', role: 'Relocating professional', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80', text: 'Moving across the country was surprisingly calm thanks to virtual tours and local guides.' },
]

const reveal = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
}

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

export default function HomePage() {
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentHero, setCurrentHero] = useState(0)
  const [savedProperties, setSavedProperties] = useState<Set<string>>(new Set())
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    const interval = setInterval(() => setCurrentHero((previous) => (previous + 1) % heroImages.length), 7000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const response = await fetch('/api/properties?limit=8')
        const data = await response.json()
        if (active && data.properties) setProperties(data.properties)
      } catch (error) {
        console.error('Error fetching properties:', error)
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [])

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault()
    const query = searchQuery.trim()
    router.push(query ? `/search?q=${encodeURIComponent(query)}` : '/search')
  }

  const handleSave = async (event: React.MouseEvent, propertyId: string) => {
    event.preventDefault()
    event.stopPropagation()
    const token = localStorage.getItem('token')
    if (!token) {
      window.location.href = '/auth/signin'
      return
    }
    setSavingId(propertyId)
    try {
      const isSaved = savedProperties.has(propertyId)
      const response = await fetch(
        isSaved ? `/api/user/saved-properties?propertyId=${propertyId}` : '/api/user/saved-properties',
        {
          method: isSaved ? 'DELETE' : 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: isSaved ? undefined : JSON.stringify({ propertyId }),
        },
      )
      if (response.ok) {
        setSavedProperties((previous) => {
          const next = new Set(previous)
          if (isSaved) next.delete(propertyId)
          else next.add(propertyId)
          return next
        })
      }
    } catch (error) {
      console.error('Error saving property:', error)
    } finally {
      setSavingId(null)
    }
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)

  return (
    <div className="min-h-screen overflow-hidden bg-background">
      <SiteHeader />

      <main>
        <section className="relative flex min-h-[86vh] items-center overflow-hidden pt-16">
          <div className="absolute inset-0">
            {heroImages.map((image, index) => (
              <motion.div
                key={image}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: index === currentHero ? 1 : 0, scale: index === currentHero ? 1 : 1.04 }}
                transition={{ duration: 1.4, ease: 'easeOut' }}
                className="absolute inset-0"
              >
                <Image src={image} alt="Featured home" fill className="object-cover" priority={index === 0} />
              </motion.div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-r from-[#05070c]/90 via-[#05070c]/68 to-[#05070c]/38" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-[#05070c]/40" />
          </div>

          <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-24 pt-14 sm:px-6 lg:px-8">
            <motion.div initial="hidden" animate="show" variants={stagger} className="max-w-3xl">
              <motion.div variants={reveal} className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-4 py-2 text-white backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <span className="text-xs font-medium tracking-wide">New homes added every day</span>
              </motion.div>

              <motion.h1 variants={reveal} className="display-title mt-7 text-[clamp(2.8rem,7vw,5.6rem)] text-white">
                Where you live
                <span className="block gradient-text">starts here.</span>
              </motion.h1>

              <motion.p variants={reveal} className="mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
                A considered collection of homes, thoughtful tools, and the local expertise to help you find the one.
              </motion.p>

              <motion.form
                variants={reveal}
                onSubmit={handleSearch}
                className="mt-9 flex w-full max-w-2xl flex-col gap-2 rounded-[28px] border border-white/20 bg-black/25 p-2 backdrop-blur-md sm:flex-row sm:items-center sm:rounded-full"
              >
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-white/60" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="City, neighborhood, or ZIP"
                    className="h-14 w-full rounded-[22px] bg-white/10 pl-12 pr-12 text-sm text-white outline-none backdrop-blur-xl placeholder:text-white/50 focus:bg-white/15 focus:ring-2 focus:ring-white/30 sm:rounded-full"
                    aria-label="Search location"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear search"
                      className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="btn-smooth group flex h-14 w-full items-center justify-center gap-2 rounded-[22px] px-7 text-sm sm:w-auto sm:shrink-0 sm:rounded-full"
                >
                  Search homes
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </button>
              </motion.form>

              <motion.div variants={reveal} className="mt-5 flex flex-wrap items-center gap-2">
                <span className="mr-1 text-xs font-medium text-white/55">Popular</span>
                {['Houses', 'Apartments', 'Condos', 'Townhomes'].map((tag) => (
                  <Link
                    key={tag}
                    href={`/search?type=${tag.toUpperCase().slice(0, -1)}`}
                    className="rounded-full border border-white/20 bg-black/25 px-4 py-2 text-xs font-medium text-white/90 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-black/40 hover:text-white"
                  >
                    {tag}
                  </Link>
                ))}
              </motion.div>
            </motion.div>
          </div>

          <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-2">
            {heroImages.map((image, index) => (
              <button
                key={image}
                type="button"
                onClick={() => setCurrentHero(index)}
                aria-label={`Show featured home ${index + 1}`}
                className={`h-1.5 rounded-full transition-all duration-500 ${index === currentHero ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'}`}
              />
            ))}
          </div>
        </section>

        <section className="relative z-20 mx-auto -mt-14 max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="glass-control grid grid-cols-2 gap-y-7 overflow-hidden rounded-[28px] px-6 py-7 md:grid-cols-4 md:divide-x md:divide-border/70"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-center gap-4 px-2 md:justify-center">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <stat.icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block display-title text-2xl">{stat.value}</span>
                  <span className="block text-xs text-muted-foreground">{stat.label}</span>
                </span>
              </div>
            ))}
          </motion.div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={reveal} className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="eyebrow">Explore</span>
                <h2 className="display-title mt-3 text-3xl sm:text-4xl">Browse by home type</h2>
                <p className="mt-2 text-sm text-muted-foreground">Every kind of space, thoughtfully organized.</p>
              </div>
              <Link href="/search" className="btn-quiet text-sm">
                View all homes <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>

            <motion.div variants={stagger} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {categories.map((category) => {
                const Icon = category.icon
                return (
                  <motion.div key={category.title} variants={reveal} className={`tilt-scene ${category.span}`}>
                    <Link
                      href={category.href}
                      className="tilt-card surface-card surface-card-hover group relative block h-full min-h-[230px] overflow-hidden rounded-[24px]"
                    >
                      <Image
                        src={category.image}
                        alt={category.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#060810]/90 via-[#060810]/25 to-transparent" />
                      <div className="absolute left-4 top-4 grid h-10 w-10 place-items-center rounded-2xl border border-white/25 bg-white/15 text-white backdrop-blur-md">
                        <Icon className="h-[18px] w-[18px]" />
                      </div>
                      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                        <h3 className="display-title text-xl">{category.title}</h3>
                        <p className="mt-1 text-xs text-white/70">{category.description}</p>
                        <p className="mt-3 text-xs font-medium text-white/90">{category.count} listings</p>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </motion.div>
          </motion.div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={reveal} className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="eyebrow">Just listed</span>
                <h2 className="display-title mt-3 text-3xl sm:text-4xl">Fresh on the market</h2>
                <p className="mt-2 text-sm text-muted-foreground">Homes worth a closer look, updated daily.</p>
              </div>
              <Link href="/buy" className="btn-quiet text-sm">
                See all listings <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>

            {loading ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="surface-card overflow-hidden">
                    <div className="aspect-[4/3] animate-pulse bg-muted" />
                    <div className="space-y-3 p-5">
                      <div className="h-5 w-3/4 animate-pulse rounded-lg bg-muted" />
                      <div className="h-4 w-1/2 animate-pulse rounded-lg bg-muted" />
                    </div>
                  </div>
                ))}
              </div>
            ) : properties.length > 0 ? (
              <motion.div variants={stagger} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {properties.map((property) => (
                  <motion.div key={property.id} variants={reveal} className="tilt-scene">
                    <Link href={`/property/${property.id}`} className="tilt-card surface-card surface-card-hover group block overflow-hidden rounded-[24px]">
                      <div className="relative aspect-[4/3] overflow-hidden">
                        {property.images?.[0] ? (
                          <Image
                            src={property.images[0].url}
                            alt={property.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="grid h-full w-full place-items-center bg-muted">
                            <Home className="h-10 w-10 text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />
                        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                          {property.status === 'ACTIVE' && <span className="pill border-white/30 bg-black/35 text-white backdrop-blur-md">For sale</span>}
                          {property.propertyType && <span className="pill border-white/30 bg-black/35 text-white backdrop-blur-md">{property.propertyType.replace(/_/g, ' ')}</span>}
                          {property.images && property.images.length > 1 && (
                            <span className="pill inline-flex items-center gap-1 border-transparent bg-primary text-primary-foreground">
                              <Box className="h-3 w-3" />3D
                            </span>
                          )}
                        </div>
                        {property.createdAt && new Date(property.createdAt).getTime() >= newListingCutoff && (
                          <span className="pill absolute bottom-4 right-3 border-transparent bg-primary text-primary-foreground">New</span>
                        )}
                        <button
                          type="button"
                          onClick={(event) => void handleSave(event, property.id)}
                          disabled={savingId === property.id}
                          aria-label={savedProperties.has(property.id) ? 'Remove from saved homes' : 'Save home'}
                          className="glass-control absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full text-foreground transition-transform duration-300 hover:scale-110"
                        >
                          {savingId === property.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Heart className={`h-4 w-4 ${savedProperties.has(property.id) ? 'fill-red-500 text-red-500' : ''}`} />
                          )}
                        </button>
                        <p className="absolute bottom-4 left-4 display-title text-xl text-white">{formatPrice(property.price)}</p>
                      </div>
                      <div className="p-5">
                        <h3 className="truncate text-[15px] font-semibold tracking-tight">{property.title}</h3>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          <span className="truncate">{property.city}, {property.state}</span>
                        </p>
                        <div className="mt-4 flex items-center gap-4 border-t border-border/70 pt-3 text-xs text-muted-foreground">
                          {property.beds > 0 && <span className="flex items-center gap-1.5"><Bed className="h-4 w-4" />{property.beds}</span>}
                          {property.baths > 0 && <span className="flex items-center gap-1.5"><Bath className="h-4 w-4" />{Math.floor(property.baths)}</span>}
                          {property.sqft > 0 && <span className="flex items-center gap-1.5"><Square className="h-4 w-4" />{property.sqft.toLocaleString()}</span>}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="surface-card px-6 py-16 text-center">
                <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-primary/10 text-primary">
                  <Home className="h-8 w-8" />
                </span>
                <h3 className="display-title mt-5 text-xl">No properties yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">Be the first to list a property on HomeVista.</p>
              </div>
            )}
          </motion.div>
        </section>

        <section className="border-y border-border/70 bg-card/45 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
              <motion.div variants={reveal} className="mx-auto mb-14 max-w-2xl text-center">
                <span className="eyebrow">Why HomeVista</span>
                <h2 className="display-title mt-3 text-3xl sm:text-4xl">Everything you need, nothing you don&apos;t</h2>
                <p className="mt-3 text-sm text-muted-foreground">A focused experience built around the decisions that actually matter.</p>
              </motion.div>

              <motion.div variants={stagger} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {features.map((feature) => (
                  <motion.div key={feature.title} variants={reveal} className="tilt-scene">
                    <div className="tilt-card surface-card surface-card-hover h-full p-6">
                      <span className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${feature.tint}`}>
                        <feature.icon className={`h-5 w-5 ${feature.iconClass}`} />
                      </span>
                      <h3 className="mt-6 text-[15px] font-semibold tracking-tight">{feature.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={reveal} className="mx-auto mb-14 max-w-2xl text-center">
              <span className="eyebrow">Stories</span>
              <h2 className="display-title mt-3 text-3xl sm:text-4xl">Good news, from real people</h2>
              <p className="mt-3 text-sm text-muted-foreground">Thousands of journeys, one common thread: less guesswork.</p>
            </motion.div>

            <motion.div variants={stagger} className="grid gap-5 md:grid-cols-3">
              {testimonials.map((testimonial) => (
                <motion.figure key={testimonial.name} variants={reveal} className="surface-card surface-card-hover flex h-full flex-col p-7">
                  <div className="flex gap-1 text-amber-400">
                    {[...Array(5)].map((_, index) => <Star key={index} className="h-4 w-4 fill-current" />)}
                  </div>
                  <blockquote className="mt-5 flex-1 text-sm leading-relaxed text-foreground/80">
                    &ldquo;{testimonial.text}&rdquo;
                  </blockquote>
                  <figcaption className="mt-7 flex items-center gap-3 border-t border-border/70 pt-5">
                    <Image src={testimonial.image} alt={testimonial.name} width={40} height={40} className="rounded-full object-cover" />
                    <span>
                      <span className="block text-sm font-semibold">{testimonial.name}</span>
                      <span className="block text-xs text-muted-foreground">{testimonial.role}</span>
                    </span>
                  </figcaption>
                </motion.figure>
              ))}
            </motion.div>
          </motion.div>
        </section>

        <section className="px-4 pb-24 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto max-w-7xl overflow-hidden rounded-[36px]"
          >
            <Image
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80"
              alt="Modern home exterior"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#05070c]/85 via-[#05070c]/65 to-[#05070c]/30" />
            <div className="relative grid gap-8 px-8 py-16 sm:px-14 lg:grid-cols-[1.4fr_1fr] lg:items-center lg:py-20">
              <div>
                <span className="eyebrow text-white/70">Your next chapter</span>
                <h2 className="display-title mt-4 max-w-xl text-3xl text-white sm:text-5xl">Let&apos;s find a place that feels like yours.</h2>
                <p className="mt-4 max-w-md text-sm text-white/70 sm:text-base">
                  Start with a search. We&apos;ll take care of the rest, one thoughtful step at a time.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                <Link href="/search" className="btn-smooth h-12 rounded-2xl px-6 text-sm">Start searching</Link>
                <Link href="/auth/signup" className="grid h-12 place-items-center rounded-2xl border border-white/20 bg-black/25 px-6 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-black/40">Create free account</Link>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
