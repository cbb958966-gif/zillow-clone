'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { 
  Home, MapPin, Check, ChevronRight, 
  Building, Calendar, Camera, Search, 
  ArrowLeft, Loader2, Sparkles, Shield, Clock, TrendingUp
} from 'lucide-react'

export default function ListYourHomePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [address, setAddress] = useState('')
  const [propertyData, setPropertyData] = useState<any>(null)
  const [verifiedAddress, setVerifiedAddress] = useState<any>(null)

  const handleAddressSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!address.trim()) return

    setLoading(true)
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&types=address&limit=1`
      )
      const data = await response.json()
      
      if (data.features && data.features.length > 0) {
        const result = data.features[0]
        setVerifiedAddress({
          fullAddress: result.place_name,
          street: result.text,
          city: result.context?.find((c: any) => c.id.includes('place'))?.text || '',
          state: result.context?.find((c: any) => c.id.includes('region'))?.text || '',
          zipCode: result.context?.find((c: any) => c.id.includes('postcode'))?.text || '',
          lat: result.center[1],
          lng: result.center[0]
        })
        setStep(2)
      }
    } catch (error) {
      console.error('Address lookup error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmAddress = async () => {
    setLoading(true)
    try {
      if (!user) {
        router.push('/auth/signup?redirect=/sell/list-your-home')
        return
      }
      router.push('/admin?addProperty=true')
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const features = [
    { icon: TrendingUp, title: 'Maximize Value', desc: 'Get the best price for your home' },
    { icon: Clock, title: 'Quick Process', desc: 'List in as little as 15 minutes' },
    { icon: Shield, title: 'Secure & Safe', desc: 'Verified buyers and agents' },
  ]

  const steps = [
    { num: 1, title: 'Enter Address', desc: 'Tell us where your home is' },
    { num: 2, title: 'Add Details', desc: 'Share your home\'s features' },
    { num: 3, title: 'List It', desc: 'Publish and start receiving offers' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 -left-40 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute -bottom-40 left-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/10">
        <div className="container-main">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform">
                <Home className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">HomeVista</span>
            </Link>
            <Link href="/sell" className="flex items-center text-white/70 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sell
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative z-10 container-main py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Free to list • No hidden fees</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Sell Your Home
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              In Minutes
            </span>
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            List your property in minutes and connect with thousands of ready buyers
          </p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-white/10" />
            <div 
              className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500"
              style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
            />
            
            {steps.map((s, i) => (
              <div key={s.num} className="relative flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  step > s.num 
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg shadow-cyan-500/30' 
                    : step === s.num
                    ? 'bg-white text-blue-600 shadow-lg scale-110'
                    : 'bg-white/10 text-white/50 border border-white/20'
                }`}>
                  {step > s.num ? <Check className="w-5 h-5" /> : s.num}
                </div>
                <div className="mt-3 text-center">
                  <p className={`font-semibold ${step >= s.num ? 'text-white' : 'text-white/50'}`}>{s.title}</p>
                  <p className="text-xs text-white/50 hidden sm:block">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Card */}
        <div className="max-w-2xl mx-auto">
          {step === 1 ? (
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 md:p-10 shadow-2xl">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">What's your home address?</h2>
                <p className="text-white/60">Enter your property address to get started</p>
              </div>

              <form onSubmit={handleAddressSearch} className="space-y-6">
                <div className="relative group">
                  <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-white/40 group-focus-within:text-cyan-400 transition-colors" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter street address, city, state, ZIP"
                    className="w-full pl-14 pr-5 py-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/40 text-lg focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={!address.trim() || loading}
                  className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-5 px-8 rounded-2xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      Get Started
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              {/* Trust Indicators */}
              <div className="mt-8 pt-8 border-t border-white/10">
                <div className="grid grid-cols-3 gap-4">
                  {features.map((feature, i) => (
                    <div key={i} className="text-center">
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                        <feature.icon className="w-5 h-5 text-cyan-400" />
                      </div>
                      <p className="text-xs text-white/70 font-medium">{feature.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : step === 2 && verifiedAddress ? (
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 md:p-10 shadow-2xl">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Is this your address?</h2>
                <p className="text-white/60">Please confirm to continue</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Home className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-lg">{verifiedAddress.street}</p>
                    <p className="text-white/70">{verifiedAddress.city}, {verifiedAddress.state} {verifiedAddress.zipCode}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleConfirmAddress}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-5 px-8 rounded-2xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/30 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Yes, Continue
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <button
                  onClick={() => { setStep(1); setVerifiedAddress(null) }}
                  className="w-full py-3 text-white/60 hover:text-white transition-colors"
                >
                  ← Search again
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* Stats */}
        <div className="mt-16 text-center">
          <p className="text-white/50 text-sm mb-4">Trusted by homeowners nationwide</p>
          <div className="flex items-center justify-center gap-8">
            <div>
              <div className="text-3xl font-bold text-white">50K+</div>
              <div className="text-white/50 text-sm">Homes Sold</div>
            </div>
            <div className="w-px h-12 bg-white/20" />
            <div>
              <div className="text-3xl font-bold text-white">$2.5B</div>
              <div className="text-white/50 text-sm">Total Value</div>
            </div>
            <div className="w-px h-12 bg-white/20" />
            <div>
              <div className="text-3xl font-bold text-white">98%</div>
              <div className="text-white/50 text-sm">Satisfaction</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 mt-16 border-t border-white/10">
        <div className="container-main py-8">
          <div className="text-center text-white/40 text-sm">
            <p>© 2026 HomeVista. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
