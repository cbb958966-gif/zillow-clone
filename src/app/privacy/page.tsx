'use client'

import { motion } from 'framer-motion'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="pt-16">
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl sm:text-5xl font-bold mb-6">Privacy Policy</h1>
              <p className="text-lg text-muted-foreground">Last updated: January 1, 2026</p>
            </motion.div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-gray dark:prose-invert">
            <div className="surface-card space-y-8 p-6 sm:p-8">
              <div><h2 className="text-2xl font-bold mb-4">Information We Collect</h2><p className="text-muted-foreground leading-relaxed">We collect information you provide directly to us, including your name, email address, phone number, and any other details you choose to share when creating an account or contacting us. We also automatically collect certain information about your device and usage of our platform.</p></div>
              <div><h2 className="text-2xl font-bold mb-4">How We Use Your Information</h2><p className="text-muted-foreground leading-relaxed">We use the information we collect to provide, maintain, and improve our services; to process transactions and send related information; to respond to your comments, questions, and requests; and to send you technical notices, updates, security alerts, and support messages.</p></div>
              <div><h2 className="text-2xl font-bold mb-4">Information Sharing</h2><p className="text-muted-foreground leading-relaxed">We do not share your personal information with third parties except as described in this policy. We may share information with service providers who perform services on our behalf, when required by law, or in connection with a business transfer.</p></div>
              <div><h2 className="text-2xl font-bold mb-4">Data Security</h2><p className="text-muted-foreground leading-relaxed">We implement appropriate technical and organizational measures to protect the security of your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure.</p></div>
              <div><h2 className="text-2xl font-bold mb-4">Your Rights</h2><p className="text-muted-foreground leading-relaxed">You have the right to access, update, or delete your personal information. You can do this by contacting us or through your account settings. You may also opt out of marketing communications at any time.</p></div>
              <div><h2 className="text-2xl font-bold mb-4">Contact Us</h2><p className="text-muted-foreground leading-relaxed">If you have any questions about this Privacy Policy, please contact us at support@primahomes.co or through our Contact page.</p></div>
            </div>
          </div>
        </section>
      </div>

      <SiteFooter />
    </div>
  )
}
