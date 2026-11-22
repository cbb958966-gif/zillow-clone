'use client'

import { motion } from 'framer-motion'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

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
            <div className="surface-card space-y-8 p-6 sm:p-8">
              <div><h2 className="text-2xl font-bold mb-4">Acceptance of Terms</h2><p className="text-muted-foreground leading-relaxed">By accessing or using PRIMAHOMES, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services. We reserve the right to update these terms at any time.</p></div>
              <div><h2 className="text-2xl font-bold mb-4">Account Registration</h2><p className="text-muted-foreground leading-relaxed">You must create an account to access certain features. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You must provide accurate and complete information.</p></div>
              <div><h2 className="text-2xl font-bold mb-4">Property Listings</h2><p className="text-muted-foreground leading-relaxed">PRIMAHOMES provides a platform for listing and searching properties. We do not guarantee the accuracy of listings and are not party to any transactions. Users should verify all information independently.</p></div>
              <div><h2 className="text-2xl font-bold mb-4">User Conduct</h2><p className="text-muted-foreground leading-relaxed">You agree not to misuse our services, interfere with the platform, or engage in fraudulent activities. You may not scrape or reproduce our content without permission.</p></div>
              <div><h2 className="text-2xl font-bold mb-4">Limitation of Liability</h2><p className="text-muted-foreground leading-relaxed">PRIMAHOMES shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services. Our total liability is limited to the amount paid by you, if any.</p></div>
              <div><h2 className="text-2xl font-bold mb-4">Contact</h2><p className="text-muted-foreground leading-relaxed">For questions about these terms, contact us at support@primahomes.co.</p></div>
            </div>
          </div>
        </section>
      </div>

      <SiteFooter />
    </div>
  )
}
