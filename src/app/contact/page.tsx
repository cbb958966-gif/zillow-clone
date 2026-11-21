'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Clock, Send, MessageSquare } from 'lucide-react'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="pt-16">
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl sm:text-5xl font-bold mb-6">Contact Us</h1>
              <p className="text-lg text-muted-foreground">We'd love to hear from you. Get in touch with our team.</p>
            </motion.div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0"><Mail className="w-5 h-5 text-primary" /></div>
                    <div><h3 className="font-medium mb-1">Email</h3><p className="text-sm text-muted-foreground">support@homevista.com</p></div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0"><Phone className="w-5 h-5 text-primary" /></div>
                    <div><h3 className="font-medium mb-1">Phone</h3><p className="text-sm text-muted-foreground">+1 (555) 123-4567</p></div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0"><MapPin className="w-5 h-5 text-primary" /></div>
                    <div><h3 className="font-medium mb-1">Office</h3><p className="text-sm text-muted-foreground">123 Main Street, Suite 100, San Francisco, CA 94102</p></div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0"><Clock className="w-5 h-5 text-primary" /></div>
                    <div><h3 className="font-medium mb-1">Hours</h3><p className="text-sm text-muted-foreground">Mon-Fri: 9AM - 6PM, Sat: 10AM - 4PM</p></div>
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                {submitted ? (
                  <div className="surface-card p-8 text-center">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4"><Send className="w-8 h-8 text-green-500" /></div>
                    <h3 className="text-xl font-semibold mb-2">Message Sent!</h3>
                    <p className="text-muted-foreground">We'll get back to you within 24 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="surface-card space-y-4 p-6 sm:p-8">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div><label className="block text-sm font-medium mb-1">Name</label><input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" /></div>
                      <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" /></div>
                    </div>
                    <div><label className="block text-sm font-medium mb-1">Subject</label><input type="text" required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" /></div>
                    <div><label className="block text-sm font-medium mb-1">Message</label><textarea rows={5} required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none" /></div>
                    <button type="submit" className="btn-smooth w-full px-6 py-3"><MessageSquare className="w-4 h-4" /> Send Message</button>
                  </form>
                )}
              </motion.div>
            </div>
          </div>
        </section>
      </div>

      <SiteFooter />
    </div>
  )
}
