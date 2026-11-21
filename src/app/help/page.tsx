'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, FileText, ChevronDown, MessageCircle, Mail } from 'lucide-react'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'

const faqs = [
  { q: 'How do I search for properties?', a: 'Use the search bar on the homepage or navigate to the Browse page. You can filter by location, price, property type, bedrooms, and more.' },
  { q: 'How do I save a property?', a: 'Click the heart icon on any property card or detail page. You must be signed in. View saved properties in your Dashboard.' },
  { q: 'How do I contact an agent?', a: 'On each property detail page, click "Contact Agent" to send a message directly to the listing agent.' },
  { q: 'How do I calculate my mortgage?', a: 'Use our Mortgage Calculator page to estimate monthly payments based on price, down payment, interest rate, and loan term.' },
  { q: 'How do I list my property?', a: 'Visit the Sell page to explore your options including selling with an agent, getting a cash offer, or listing as FSBO.' },
  { q: 'How do I reset my password?', a: 'On the sign-in page, click "Forgot Password" and follow the instructions sent to your email.' },
]

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="pt-16">
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl sm:text-5xl font-bold mb-6">Help Center</h1>
              <p className="text-lg text-muted-foreground mb-8">Find answers to common questions and learn how to get the most out of HomeVista.</p>
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input type="text" placeholder="Search for help..." className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="surface-card overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)} className="w-full flex items-center justify-between p-5 text-left">
                    <span className="font-medium pr-4">{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 shrink-0 text-muted-foreground transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {openFaq === idx && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <p className="px-5 pb-5 text-sm text-muted-foreground">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-secondary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="surface-card surface-card-hover p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4"><MessageCircle className="w-6 h-6 text-primary" /></div>
                <h3 className="font-semibold mb-2">Live Chat</h3>
                <p className="text-sm text-muted-foreground mb-4">Chat with our support team in real-time.</p>
                <button className="btn-smooth px-4 py-2 text-sm">Start Chat</button>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="surface-card surface-card-hover p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4"><Mail className="w-6 h-6 text-primary" /></div>
                <h3 className="font-semibold mb-2">Email Support</h3>
                <p className="text-sm text-muted-foreground mb-4">Get a response within 24 hours.</p>
                <Link href="/contact" className="btn-smooth px-4 py-2 text-sm">Contact Us</Link>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="surface-card surface-card-hover p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4"><FileText className="w-6 h-6 text-primary" /></div>
                <h3 className="font-semibold mb-2">Guides</h3>
                <p className="text-sm text-muted-foreground mb-4">Browse our detailed guides and tutorials.</p>
                <button className="btn-smooth px-4 py-2 text-sm">View Guides</button>
              </motion.div>
            </div>
          </div>
        </section>
      </div>

      <SiteFooter />
    </div>
  )
}
