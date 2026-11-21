'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Users, Shield, Award, Globe } from 'lucide-react'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

const values = [
  { icon: Shield, title: 'Trust & Transparency', description: 'We believe in honest dealings and clear communication every step of the way.' },
  { icon: Users, title: 'Customer First', description: 'Your goals drive everything we do. We put your needs at the center of every decision.' },
  { icon: Award, title: 'Excellence', description: 'We strive for the highest standards in service, technology, and customer satisfaction.' },
  { icon: Globe, title: 'Innovation', description: 'Leveraging cutting-edge technology to make real estate simpler, faster, and more accessible.' },
]

const team = [
  { name: 'Sarah Mitchell', role: 'CEO & Founder', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80' },
  { name: 'James Chen', role: 'CTO', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80' },
  { name: 'Emily Rodriguez', role: 'Head of Operations', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80' },
  { name: 'David Park', role: 'VP of Sales', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="pt-16">
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl sm:text-5xl font-bold mb-6">About HomeVista</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We're transforming the real estate experience by combining cutting-edge technology with personalized service. 
                Founded in 2020, HomeVista has helped thousands of people find their perfect home.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">To make finding and selling homes a seamless, transparent, and empowering experience for everyone.</p>
            </motion.div>
            <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((v, idx) => (
                <motion.div key={idx} variants={item} className="surface-card surface-card-hover p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4"><v.icon className="w-6 h-6 text-primary" /></div>
                  <h3 className="font-semibold mb-2">{v.title}</h3>
                  <p className="text-sm text-muted-foreground">{v.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="py-16 bg-secondary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Our Team</h2>
              <p className="text-muted-foreground">Meet the people behind HomeVista</p>
            </motion.div>
            <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((t, idx) => (
                <motion.div key={idx} variants={item} className="surface-card surface-card-hover p-6 text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-dark mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{t.name[0]}</span>
                  </div>
                  <h3 className="font-semibold">{t.name}</h3>
                  <p className="text-sm text-muted-foreground">{t.role}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-muted-foreground mb-8">Join thousands of satisfied homeowners and buyers.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/search" className="btn-smooth px-6 py-3">Start Searching</Link>
                <Link href="/contact" className="btn-quiet px-6 py-3">Contact Us</Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      <SiteFooter />
    </div>
  )
}
