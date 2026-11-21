'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, Users, Building2, Search, ArrowRight, ChevronDown,
  Clock, TrendingUp, Shield, DollarSign
} from 'lucide-react'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

const sellingOptions = [
  {
    icon: Users,
    title: 'Sell with a Partner Agent',
    description: 'Connect with a top-performing agent who offers premium services.',
    features: ['Professional marketing & staging', 'Virtual tours & 3D floor plans', 'Negotiation expertise', 'Maximize your sale price'],
    cta: 'Get Started',
    href: '/sell/list-your-home',
    gradient: 'from-blue-900/90 via-blue-800/40',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    icon: DollarSign,
    title: 'Get a Cash Offer',
    description: 'Sell directly and get cash in as little as 10 days.',
    features: ['No showings required', 'Sell as-is, no repairs', 'Choose your closing date', 'Quick cash payment'],
    cta: 'Check Eligibility',
    href: '/sell/list-your-home',
    gradient: 'from-emerald-900/90 via-emerald-800/40',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    icon: Search,
    title: 'Find Your Own Agent',
    description: 'Browse verified agents with proven track records in your area.',
    features: ['Verified reviews & ratings', 'Local market expertise', 'Specialties & credentials', 'Interview before hiring'],
    cta: 'Find Agents',
    href: '/agent',
    gradient: 'from-purple-900/90 via-purple-800/40',
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
  {
    icon: Building2,
    title: 'Sell It Yourself',
    description: 'List your home as For Sale By Owner and keep 100% of the profit.',
    features: ['Full control over the process', 'No agent commissions', 'Direct buyer negotiations', 'FSBO listing tools & support'],
    cta: 'List Your Home',
    href: '/sell/list-your-home',
    gradient: 'from-amber-900/90 via-amber-800/40',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
]

const resources = [
  {
    title: '14 tips for selling your home fast',
    category: 'Tips & Tricks',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80',
    gradient: 'from-blue-600/40',
  },
  {
    title: 'How to choose the right agent',
    category: 'Agent Guide',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=80',
    gradient: 'from-emerald-600/40',
  },
  {
    title: 'Steps to selling a house',
    category: 'Step by Step',
    readTime: '15 min read',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80',
    gradient: 'from-purple-600/40',
  },
  {
    title: 'When is the best time to sell?',
    category: 'Market Timing',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=600&q=80',
    gradient: 'from-amber-600/40',
  },
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
  },
]

const stats = [
  { value: '50M+', label: 'Monthly Visitors', icon: Users },
  { value: '17.5%', label: 'Higher Sale Price', icon: TrendingUp },
  { value: '30 Days', label: 'Average Days on Market', icon: Clock },
  { value: '98%', label: 'Seller Satisfaction', icon: Shield },
]

export default function SellPage() {
  const { user } = useAuth()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative min-h-[50vh] md:min-h-[70vh] flex items-center overflow-hidden pt-16">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80"
            alt="Modern living room"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-black/20 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="pill inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border-white/20 px-3 sm:px-4 py-1.5 sm:py-2 mb-4 sm:mb-6"
            >
              <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white/90 text-xs sm:text-sm font-medium">Free to list &bull; No hidden fees</span>
            </motion.div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              Sell Your Home
              <span className="block gradient-text">
                With Confidence
              </span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-white/80 mb-6 sm:mb-8 max-w-xl">
              Get the best value for your home with our modern selling platform.
              Connect with thousands of ready buyers.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-3"
            >
              <Link
                href="/sell/list-your-home"
                className="btn-smooth inline-flex items-center gap-2 px-8 py-4"
              >
                {user ? 'List Your Home' : 'Get Started'}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/mortgage"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors"
              >
                Check Your Home&apos;s Value
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Selling Options */}
      <section className="py-20 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold tracking-tight">Explore Your Selling Options</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Choose the best way to sell your home that fits your timeline and goals
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {sellingOptions.map((option, idx) => (
              <motion.div key={idx} variants={item}>
                <div className="group h-full surface-card surface-card-hover p-6 flex flex-col">
                  <div className={`w-12 h-12 ${option.iconBg} rounded-xl flex items-center justify-center mb-4`}>
                    <option.icon className={`w-6 h-6 ${option.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{option.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{option.description}</p>
                  <ul className="space-y-2 mb-6 flex-1">
                    {option.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${option.iconColor}`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={option.href}
                    className="btn-smooth inline-flex items-center justify-center gap-1 w-full py-3 text-sm"
                  >
                    {option.cta}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="py-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, idx) => {
              const Icon = stat.icon
              return (
                <div key={idx} className="text-center p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </motion.section>

      {/* Resources */}
      <section className="py-20 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold tracking-tight">Resources for Sellers</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Expert guides and tips for every step of your selling journey
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {resources.map((resource, idx) => (
              <motion.div key={idx} variants={item}>
                <div className="group surface-card surface-card-hover overflow-hidden cursor-pointer">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={resource.image}
                      alt={resource.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${resource.gradient} to-transparent`} />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <span>{resource.category}</span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {resource.readTime}
                      </span>
                    </div>
                    <h3 className="font-semibold">{resource.title}</h3>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Value Estimator */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="py-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0">
              <Image
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&q=80"
                alt="Home valuation"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/60" />
            </div>
            <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold text-primary-foreground mb-4">What&apos;s your home worth?</h2>
                <p className="text-primary-foreground/80 mb-6 max-w-md">
                  Get a free home value estimate instantly. Know your home&apos;s worth before you list.
                </p>
                <Link
                  href="/mortgage"
                  className="inline-flex items-center gap-2 bg-white text-foreground px-6 py-3 rounded-xl font-medium hover:bg-white/90 transition-colors"
                >
                  Get Free Estimate
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Home className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* FAQ */}
      <section className="py-20 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold tracking-tight">Frequently asked questions</h2>
            <p className="text-muted-foreground mt-2">Everything you need to know about selling your home</p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="max-w-3xl mx-auto space-y-3"
          >
            {faqs.map((faq, idx) => (
              <motion.div key={idx} variants={item}>
                  <div className="surface-card overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <span className="font-medium pr-4">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-300 ${
                        openFaq === idx ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {openFaq === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 text-sm text-muted-foreground border-t border-border pt-4">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80"
            alt="Luxury home"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/70" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Find your perfect selling path
            </h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">
              Answer a few simple questions to determine the best way to sell your home. No commitment required.
            </p>
            <Link
              href="/sell/list-your-home"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors"
            >
              Explore Selling Options
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
