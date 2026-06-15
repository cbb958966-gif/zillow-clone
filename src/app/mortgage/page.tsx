'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calculator, DollarSign, Percent, Home, ArrowRight, Menu, X, Heart,
  TrendingUp, Shield, Clock, CheckCircle, ChevronDown
} from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

export default function MortgagePage() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, token, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showAdditional, setShowAdditional] = useState(false)

  const [calculator, setCalculator] = useState({
    homePrice: 300000,
    downPayment: 60000,
    downPaymentPercent: 20,
    interestRate: 6.5,
    loanTerm: 30,
    propertyTax: 3000,
    homeInsurance: 1200,
    hoaFees: 0,
  })
  const [monthlyPayment, setMonthlyPayment] = useState({
    principal: 0,
    interest: 0,
    taxes: 0,
    insurance: 0,
    hoa: 0,
    total: 0,
  })

  useEffect(() => {
    calculateMortgage()
  }, [calculator])

  const calculateMortgage = () => {
    const principal = calculator.homePrice - calculator.downPayment
    const monthlyRate = calculator.interestRate / 100 / 12
    const numberOfPayments = calculator.loanTerm * 12

    let principalAndInterest = 0
    if (monthlyRate === 0) {
      principalAndInterest = principal / numberOfPayments
    } else {
      principalAndInterest = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
                      (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
    }

    const monthlyTaxes = calculator.propertyTax / 12
    const monthlyInsurance = calculator.homeInsurance / 12
    const monthlyHOA = calculator.hoaFees

    setMonthlyPayment({
      principal: principal / numberOfPayments,
      interest: principalAndInterest - (principal / numberOfPayments),
      taxes: monthlyTaxes,
      insurance: monthlyInsurance,
      hoa: monthlyHOA,
      total: principalAndInterest + monthlyTaxes + monthlyInsurance + monthlyHOA,
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleSignOut = () => {
    logout()
    router.push('/')
  }

  const handleDownPaymentChange = (value: number, isPercent: boolean) => {
    if (isPercent) {
      const downPaymentAmount = (value / 100) * calculator.homePrice
      setCalculator({
        ...calculator,
        downPaymentPercent: value,
        downPayment: downPaymentAmount,
      })
    } else {
      const percent = (value / calculator.homePrice) * 100
      setCalculator({
        ...calculator,
        downPayment: value,
        downPaymentPercent: percent,
      })
    }
  }

  const infoCards = [
    {
      icon: Calculator,
      title: 'Principal & Interest',
      description: 'The main components of your monthly mortgage payment. Principal pays down the loan balance, while interest is the cost of borrowing.',
    },
    {
      icon: Percent,
      title: 'Interest Rate',
      description: 'Your rate depends on credit score, down payment, and loan type. Lower rates mean lower monthly payments over the life of the loan.',
    },
    {
      icon: Home,
      title: 'Down Payment',
      description: 'Typically 3-20% of home price. A larger down payment means lower monthly payments and potentially better interest rates.',
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">HomeVista</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {[
                { href: '/search', label: 'Browse' },
                { href: '/buy', label: 'Buy' },
                { href: '/rent', label: 'Rent' },
                { href: '/sell', label: 'Sell' },
                { href: '/mortgage', label: 'Mortgage' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    pathname === link.href
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground/70 hover:text-foreground hover:bg-secondary/50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <ThemeToggle />
              {user ? (
                <div className="flex items-center gap-3">
                  <Link href="/dashboard/saved" className="p-2 text-foreground/70 hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
                    <Heart className="w-5 h-5" />
                  </Link>
                  <Link href="/dashboard" className="flex items-center gap-2 hover:bg-secondary rounded-lg p-2 transition-colors">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">{user.firstName?.[0] || 'U'}</span>
                    </div>
                    <span className="font-medium text-sm">{user.firstName}</span>
                  </Link>
                  <button onClick={handleSignOut} className="text-sm text-foreground/70 hover:text-foreground">Sign Out</button>
                </div>
              ) : (
                <>
                  <Link href="/auth/signin" className="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-secondary rounded-lg transition-colors">Sign In</Link>
                  <Link href="/auth/signup" className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">Get Started</Link>
                </>
              )}
            </div>

            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border bg-background"
            >
              <div className="px-4 py-4 space-y-2">
                {['Browse', 'Buy', 'Rent', 'Sell', 'Mortgage'].map((link) => (
                  <Link key={link} href={`/${link.toLowerCase() === 'browse' ? 'search' : link.toLowerCase()}`} className="block px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-lg">
                    {link}
                  </Link>
                ))}
                <hr className="my-2 border-border" />
                {user ? (
                  <>
                    <Link href="/dashboard" className="block px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-lg">Dashboard</Link>
                    <Link href="/dashboard/saved" className="block px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-lg">Saved</Link>
                    <button onClick={handleSignOut} className="block w-full text-left px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-lg">Sign Out</button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/signin" className="block px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-lg">Sign In</Link>
                    <Link href="/auth/signup" className="block px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg text-center">Get Started</Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden pt-16">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=1920&q=80"
            alt="Modern home exterior"
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
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full mb-6"
            >
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white/90 text-sm font-medium">Free to use &bull; No signup required</span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Mortgage
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Calculator
              </span>
            </h1>

            <p className="text-lg text-white/80 mb-8 max-w-xl">
              Plan your home purchase with our easy-to-use mortgage calculator. Get accurate monthly payment estimates instantly.
            </p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              {[
                { label: 'Free to use', icon: CheckCircle },
                { label: 'Instant results', icon: CheckCircle },
                { label: 'No signup required', icon: CheckCircle },
              ].map((feature, idx) => {
                const Icon = feature.icon
                return (
                  <div key={idx} className="flex items-center gap-2 text-white/70">
                    <Icon className="w-5 h-5 text-cyan-400" />
                    <span className="text-sm">{feature.label}</span>
                  </div>
                )
              })}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Calculator */}
      <section className="relative -mt-12 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card border border-border rounded-3xl shadow-lg overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Inputs */}
              <div className="p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-border">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                    <Calculator className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <h2 className="text-xl font-bold">Calculate Your Payment</h2>
                </div>

                <div className="space-y-6">
                  {/* Home Price */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Home Price</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="number"
                        value={calculator.homePrice}
                        onChange={(e) => setCalculator({ ...calculator, homePrice: parseFloat(e.target.value) || 0 })}
                        className="w-full pl-12 pr-4 py-3.5 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg font-medium"
                      />
                    </div>
                    <input
                      type="range"
                      min="50000"
                      max="2000000"
                      step="10000"
                      value={calculator.homePrice}
                      onChange={(e) => setCalculator({ ...calculator, homePrice: parseFloat(e.target.value) })}
                      className="w-full mt-3 accent-primary"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>$50K</span>
                      <span>$2M</span>
                    </div>
                  </div>

                  {/* Down Payment */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Down Payment</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type="number"
                          value={calculator.downPayment}
                          onChange={(e) => handleDownPaymentChange(parseFloat(e.target.value) || 0, false)}
                          className="w-full pl-12 pr-4 py-3.5 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg font-medium"
                        />
                      </div>
                      <div className="relative">
                        <Percent className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type="number"
                          value={calculator.downPaymentPercent}
                          onChange={(e) => handleDownPaymentChange(parseFloat(e.target.value) || 0, true)}
                          className="w-full pl-12 pr-4 py-3.5 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg font-medium"
                        />
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="1"
                      value={calculator.downPaymentPercent}
                      onChange={(e) => handleDownPaymentChange(parseFloat(e.target.value), true)}
                      className="w-full mt-3 accent-primary"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0%</span>
                      <span>50%</span>
                    </div>
                  </div>

                  {/* Interest Rate */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Interest Rate</label>
                    <div className="relative">
                      <Percent className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="number"
                        step="0.125"
                        value={calculator.interestRate}
                        onChange={(e) => setCalculator({ ...calculator, interestRate: parseFloat(e.target.value) || 0 })}
                        className="w-full pl-12 pr-4 py-3.5 bg-secondary border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg font-medium"
                      />
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="15"
                      step="0.125"
                      value={calculator.interestRate}
                      onChange={(e) => setCalculator({ ...calculator, interestRate: parseFloat(e.target.value) })}
                      className="w-full mt-3 accent-primary"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>1%</span>
                      <span>15%</span>
                    </div>
                  </div>

                  {/* Loan Term */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Loan Term</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[15, 20, 30].map((term) => (
                        <button
                          key={term}
                          onClick={() => setCalculator({ ...calculator, loanTerm: term })}
                          className={`py-3 px-4 rounded-xl font-medium transition-all text-sm ${
                            calculator.loanTerm === term
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary text-muted-foreground hover:bg-secondary/80 border border-border'
                          }`}
                        >
                          {term} years
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Additional Costs */}
                  <div className="border border-border rounded-xl overflow-hidden">
                    <button
                      onClick={() => setShowAdditional(!showAdditional)}
                      className="w-full flex items-center justify-between p-4 text-sm font-semibold"
                    >
                      Additional Costs
                      <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${showAdditional ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {showAdditional && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
                            <div>
                              <label className="block text-xs text-muted-foreground mb-1">Annual Property Tax</label>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                  type="number"
                                  value={calculator.propertyTax}
                                  onChange={(e) => setCalculator({ ...calculator, propertyTax: parseFloat(e.target.value) || 0 })}
                                  className="w-full pl-10 pr-4 py-2.5 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs text-muted-foreground mb-1">Annual Home Insurance</label>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                  type="number"
                                  value={calculator.homeInsurance}
                                  onChange={(e) => setCalculator({ ...calculator, homeInsurance: parseFloat(e.target.value) || 0 })}
                                  className="w-full pl-10 pr-4 py-2.5 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs text-muted-foreground mb-1">Monthly HOA Fees</label>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                  type="number"
                                  value={calculator.hoaFees}
                                  onChange={(e) => setCalculator({ ...calculator, hoaFees: parseFloat(e.target.value) || 0 })}
                                  className="w-full pl-10 pr-4 py-2.5 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="p-6 md:p-8 bg-secondary/50">
                <h2 className="text-xl font-bold mb-6">Estimated Monthly Payment</h2>

                <div className="text-center mb-8">
                  <div className="text-5xl md:text-6xl font-bold text-primary">
                    {formatCurrency(monthlyPayment.total)}
                  </div>
                  <p className="text-muted-foreground mt-2">per month</p>
                </div>

                <div className="space-y-3 mb-8">
                  {[
                    { label: 'Principal & Interest', value: monthlyPayment.principal + monthlyPayment.interest, color: 'bg-primary' },
                    { label: 'Property Tax', value: monthlyPayment.taxes, color: 'bg-emerald-500' },
                    { label: 'Home Insurance', value: monthlyPayment.insurance, color: 'bg-blue-400' },
                    ...(monthlyPayment.hoa > 0 ? [{ label: 'HOA Fees', value: monthlyPayment.hoa, color: 'bg-purple-500' }] : []),
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-card rounded-xl border border-border">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span className="text-sm text-muted-foreground">{item.label}</span>
                      </div>
                      <span className="font-semibold">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>

                {/* Visual bar */}
                <div className="bg-card rounded-xl p-4 border border-border mb-8">
                  <div className="h-4 rounded-full overflow-hidden flex">
                    <div className="bg-primary" style={{ width: `${((monthlyPayment.principal + monthlyPayment.interest) / monthlyPayment.total) * 100}%` }} />
                    <div className="bg-emerald-500" style={{ width: `${(monthlyPayment.taxes / monthlyPayment.total) * 100}%` }} />
                    <div className="bg-blue-400" style={{ width: `${(monthlyPayment.insurance / monthlyPayment.total) * 100}%` }} />
                    {monthlyPayment.hoa > 0 && (
                      <div className="bg-purple-500" style={{ width: `${(monthlyPayment.hoa / monthlyPayment.total) * 100}%` }} />
                    )}
                  </div>
                </div>

                {/* Loan Summary */}
                <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl">
                  <h3 className="font-semibold mb-3">Loan Summary</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Loan Amount</p>
                      <p className="font-semibold">{formatCurrency(calculator.homePrice - calculator.downPayment)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Interest</p>
                      <p className="font-semibold">{formatCurrency(monthlyPayment.interest * calculator.loanTerm * 12)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Cost</p>
                      <p className="font-semibold">{formatCurrency(monthlyPayment.total * calculator.loanTerm * 12)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Payoff Date</p>
                      <p className="font-semibold">
                        {new Date(Date.now() + calculator.loanTerm * 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Info Cards */}
      <section className="py-20 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold tracking-tight">Understanding Your Mortgage</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Learn the key components that make up your monthly payment
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {infoCards.map((card, idx) => {
              const Icon = card.icon
              return (
                <motion.div key={idx} variants={item}>
                  <div className="p-6 bg-card border border-border rounded-2xl hover:shadow-lg transition-all group">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
                    <p className="text-sm text-muted-foreground">{card.description}</p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=1920&q=80"
            alt="Modern home"
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
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Get Pre-Approved?</h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">
              Get pre-approved to know exactly how much you can afford and stand out to sellers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors"
              >
                Get Started <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/buy"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors"
              >
                Browse Homes
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">HomeVista</span>
              </Link>
              <p className="text-sm text-muted-foreground">Your trusted partner in finding the perfect home.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/search" className="hover:text-foreground">Browse</Link></li>
                <li><Link href="/buy" className="hover:text-foreground">Buy</Link></li>
                <li><Link href="/rent" className="hover:text-foreground">Rent</Link></li>
                <li><Link href="/sell" className="hover:text-foreground">Sell</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/mortgage" className="hover:text-foreground">Mortgage Calculator</Link></li>
                <li><Link href="/agent" className="hover:text-foreground">Find Agents</Link></li>
                <li><Link href="/help" className="hover:text-foreground">Help Center</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-foreground">Privacy</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">&copy; 2026 HomeVista. All rights reserved.</p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/terms" className="hover:text-foreground">Terms</Link>
              <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
