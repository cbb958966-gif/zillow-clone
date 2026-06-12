'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { 
  Calculator, DollarSign, Percent, Home, ArrowRight, Menu as MenuIcon, 
  X, Heart, TrendingUp, Shield, Clock, CheckCircle, ChevronDown
} from 'lucide-react'

export default function MortgagePage() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, token, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const [calculator, setCalculator] = useState({
    homePrice: 300000,
    downPayment: 60000,
    downPaymentPercent: 20,
    interestRate: 6.5,
    loanTerm: 30,
    propertyTax: 3000,
    homeInsurance: 1200,
    hoaFees: 0
  })
  const [monthlyPayment, setMonthlyPayment] = useState({
    principal: 0,
    interest: 0,
    taxes: 0,
    insurance: 0,
    hoa: 0,
    total: 0
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
      total: principalAndInterest + monthlyTaxes + monthlyInsurance + monthlyHOA
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
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
        downPayment: downPaymentAmount
      })
    } else {
      const percent = (value / calculator.homePrice) * 100
      setCalculator({ 
        ...calculator, 
        downPayment: value,
        downPaymentPercent: percent
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-700">
        <div className="container-main">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform">
                <Home className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">HomeVista</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-2">
              {[
                { href: '/buy', label: 'Buy' },
                { href: '/rent', label: 'Rent' },
                { href: '/sell', label: 'Sell' },
                { href: '/search', label: 'Browse' },
                { href: '/mortgage', label: 'Mortgage' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    pathname === link.href || (link.href === '/mortgage' && pathname === '/mortgage')
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                      : 'text-gray-700 dark:text-gray-200 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <Link href="/dashboard/saved" className="p-2 text-gray-600 hover:text-[#0066cc] transition-colors">
                    <Heart className="w-5 h-5" />
                  </Link>
                  <div className="flex items-center gap-3">
                    <Link href="/dashboard" className="flex items-center gap-2 text-gray-700 hover:text-[#0066cc]">
                      <div className="w-9 h-9 bg-gradient-to-br from-[#0066cc] to-[#0052a3] rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {user.firstName ? user.firstName[0].toUpperCase() : 'U'}
                        </span>
                      </div>
                      <span className="font-medium">{user.firstName}</span>
                    </Link>
                    <button 
                      onClick={handleSignOut}
                      className="text-gray-500 hover:text-[#0066cc] text-sm font-medium"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <Link href="/auth/signin" className="text-gray-700 hover:text-[#0066cc] font-medium transition-colors">Sign In</Link>
                  <Link href="/auth/signup" className="btn-primary">Get Started</Link>
                </>
              )}
            </div>

            <button 
              className="lg:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-gray-700" /> : <MenuIcon className="w-6 h-6 text-gray-700" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 py-6 px-4 shadow-xl">
            <div className="flex flex-col space-y-4">
              <Link href="/buy" className="text-gray-700 hover:text-[#0066cc] font-medium py-2">Buy</Link>
              <Link href="/rent" className="text-gray-700 hover:text-[#0066cc] font-medium py-2">Rent</Link>
              <Link href="/sell" className="text-gray-700 hover:text-[#0066cc] font-medium py-2">Sell</Link>
              <Link href="/search" className="text-gray-700 hover:text-[#0066cc] font-medium py-2">Browse</Link>
              <Link href="/mortgage" className="text-[#0066cc] font-medium py-2">Mortgage</Link>
              <hr className="border-gray-100" />
              {user ? (
                <>
                  <Link href="/dashboard" className="text-gray-700 hover:text-[#0066cc] font-medium py-2">Dashboard</Link>
                  <Link href="/dashboard/saved" className="text-gray-700 hover:text-[#0066cc] font-medium py-2">Saved Homes</Link>
                  <button onClick={handleSignOut} className="text-left text-gray-700 hover:text-[#0066cc] font-medium py-2">Sign Out</button>
                </>
              ) : (
                <>
                  <Link href="/auth/signin" className="text-gray-700 hover:text-[#0066cc] font-medium py-2">Sign In</Link>
                  <Link href="/auth/signup" className="btn-primary text-center">Get Started</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900"></div>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-40 -left-40 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute -bottom-40 left-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-2000" />
        </div>
        
        <div className="relative container-main py-16 md:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 px-4 py-2 rounded-full mb-6">
              <span className="text-sm font-medium">🏠 Free to use • No signup required</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              Mortgage
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Calculator
              </span>
            </h1>
            <p className="text-xl text-white/80 mb-8 max-w-2xl">
              Plan your home purchase with our easy-to-use mortgage calculator. 
              Get accurate monthly payment estimates instantly.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-white/70">
                <CheckCircle className="w-5 h-5 text-cyan-400" />
                <span>Free to use</span>
              </div>
              <div className="flex items-center gap-2 text-white/70">
                <CheckCircle className="w-5 h-5 text-cyan-400" />
                <span>Instant results</span>
              </div>
              <div className="flex items-center gap-2 text-white/70">
                <CheckCircle className="w-5 h-5 text-cyan-400" />
                <span>No signup required</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="relative -mt-8 pb-16">
        <div className="container-main">
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Input Section */}
              <div className="p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-gray-100">
                <h2 className="text-2xl font-bold text-[#1a1a2e] mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Calculator className="w-5 h-5 text-white" />
                  </div>
                  Calculate Your Payment
                </h2>
                
                <div className="space-y-6">
                  {/* Home Price */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Home Price</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={calculator.homePrice}
                        onChange={(e) => setCalculator({ ...calculator, homePrice: parseFloat(e.target.value) || 0 })}
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0066cc] focus:border-transparent transition-all text-lg font-medium text-gray-800"
                      />
                    </div>
                    <input
                      type="range"
                      min="50000"
                      max="2000000"
                      step="10000"
                      value={calculator.homePrice}
                      onChange={(e) => setCalculator({ ...calculator, homePrice: parseFloat(e.target.value) })}
                      className="w-full mt-3 accent-[#0066cc]"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>$50K</span>
                      <span>$2M</span>
                    </div>
                  </div>

                  {/* Down Payment */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Down Payment</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="number"
                          value={calculator.downPayment}
                          onChange={(e) => handleDownPaymentChange(parseFloat(e.target.value) || 0, false)}
                          className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0066cc] focus:border-transparent transition-all text-lg font-medium text-gray-800"
                        />
                      </div>
                      <div className="relative">
                        <Percent className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="number"
                          value={calculator.downPaymentPercent}
                          onChange={(e) => handleDownPaymentChange(parseFloat(e.target.value) || 0, true)}
                          className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0066cc] focus:border-transparent transition-all text-lg font-medium text-gray-800"
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
                      className="w-full mt-3 accent-[#0066cc]"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0%</span>
                      <span>50%</span>
                    </div>
                  </div>

                  {/* Interest Rate */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Interest Rate</label>
                    <div className="relative">
                      <Percent className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        step="0.125"
                        value={calculator.interestRate}
                        onChange={(e) => setCalculator({ ...calculator, interestRate: parseFloat(e.target.value) || 0 })}
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0066cc] focus:border-transparent transition-all text-lg font-medium text-gray-800"
                      />
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="15"
                      step="0.125"
                      value={calculator.interestRate}
                      onChange={(e) => setCalculator({ ...calculator, interestRate: parseFloat(e.target.value) })}
                      className="w-full mt-3 accent-[#0066cc]"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1%</span>
                      <span>15%</span>
                    </div>
                  </div>

                  {/* Loan Term */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Loan Term</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[15, 20, 30].map((term) => (
                        <button
                          key={term}
                          onClick={() => setCalculator({ ...calculator, loanTerm: term })}
                          className={`py-3 px-4 rounded-xl font-medium transition-all ${
                            calculator.loanTerm === term
                              ? 'bg-[#0066cc] text-white shadow-lg shadow-[#0066cc]/25'
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                          }`}
                        >
                          {term} years
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Additional Costs */}
                  <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer list-none">
                      <span className="text-sm font-semibold text-gray-700">Additional Costs</span>
                      <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Annual Property Tax</label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="number"
                            value={calculator.propertyTax}
                            onChange={(e) => setCalculator({ ...calculator, propertyTax: parseFloat(e.target.value) || 0 })}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0066cc] focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Annual Home Insurance</label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="number"
                            value={calculator.homeInsurance}
                            onChange={(e) => setCalculator({ ...calculator, homeInsurance: parseFloat(e.target.value) || 0 })}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0066cc] focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Monthly HOA Fees</label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="number"
                            value={calculator.hoaFees}
                            onChange={(e) => setCalculator({ ...calculator, hoaFees: parseFloat(e.target.value) || 0 })}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0066cc] focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </details>
                </div>
              </div>

              {/* Results Section */}
              <div className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-white">
                <h2 className="text-2xl font-bold text-[#1a1a2e] mb-6">Estimated Monthly Payment</h2>
                
                {/* Total Payment */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-baseline gap-1">
                    <span className="text-5xl md:text-6xl font-bold text-[#0066cc]">
                      {formatCurrency(monthlyPayment.total)}
                    </span>
                  </div>
                  <p className="text-gray-500 mt-2">per month</p>
                </div>

                {/* Payment Breakdown */}
                <div className="space-y-3 mb-8">
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-[#0066cc]"></div>
                      <span className="text-gray-600">Principal & Interest</span>
                    </div>
                    <span className="font-semibold text-gray-800">
                      {formatCurrency(monthlyPayment.principal + monthlyPayment.interest)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-gray-600">Property Tax</span>
                    </div>
                    <span className="font-semibold text-gray-800">
                      {formatCurrency(monthlyPayment.taxes)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                      <span className="text-gray-600">Home Insurance</span>
                    </div>
                    <span className="font-semibold text-gray-800">
                      {formatCurrency(monthlyPayment.insurance)}
                    </span>
                  </div>
                  {monthlyPayment.hoa > 0 && (
                    <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        <span className="text-gray-600">HOA Fees</span>
                      </div>
                      <span className="font-semibold text-gray-800">
                        {formatCurrency(monthlyPayment.hoa)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Visual Breakdown */}
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                  <div className="h-4 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-[#0066cc]" 
                      style={{ width: `${((monthlyPayment.principal + monthlyPayment.interest) / monthlyPayment.total) * 100}%` }}
                    ></div>
                    <div 
                      className="bg-green-500" 
                      style={{ width: `${(monthlyPayment.taxes / monthlyPayment.total) * 100}%` }}
                    ></div>
                    <div 
                      className="bg-blue-400" 
                      style={{ width: `${(monthlyPayment.insurance / monthlyPayment.total) * 100}%` }}
                    ></div>
                    {monthlyPayment.hoa > 0 && (
                      <div 
                        className="bg-purple-500" 
                        style={{ width: `${(monthlyPayment.hoa / monthlyPayment.total) * 100}%` }}
                      ></div>
                    )}
                  </div>
                </div>

                {/* Loan Summary */}
                <div className="mt-8 p-4 bg-[#0066cc]/5 rounded-xl border border-[#0066cc]/10">
                  <h3 className="font-semibold text-[#1a1a2e] mb-3">Loan Summary</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Loan Amount</p>
                      <p className="font-semibold text-gray-800">{formatCurrency(calculator.homePrice - calculator.downPayment)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total Interest</p>
                      <p className="font-semibold text-gray-800">{formatCurrency((monthlyPayment.interest * calculator.loanTerm * 12))}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total Cost</p>
                      <p className="font-semibold text-gray-800">{formatCurrency((monthlyPayment.total * calculator.loanTerm * 12))}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Payoff Date</p>
                      <p className="font-semibold text-gray-800">
                        {new Date(Date.now() + calculator.loanTerm * 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Info Cards */}
      <section className="py-16 bg-white">
        <div className="container-main">
          <h2 className="text-3xl font-bold text-[#1a1a2e] text-center mb-12">Understanding Your Mortgage</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group p-6 bg-gray-50 rounded-2xl hover:bg-[#0066cc] hover:text-white transition-all duration-300">
              <div className="w-14 h-14 bg-[#0066cc]/10 group-hover:bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <Calculator className="w-7 h-7 text-[#0066cc] group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Principal & Interest</h3>
              <p className="text-gray-600 group-hover:text-white/80">
                The main components of your monthly mortgage payment. Principal pays down the loan balance, while interest is the cost of borrowing.
              </p>
            </div>
            <div className="group p-6 bg-gray-50 rounded-2xl hover:bg-[#0066cc] hover:text-white transition-all duration-300">
              <div className="w-14 h-14 bg-[#0066cc]/10 group-hover:bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <Percent className="w-7 h-7 text-[#0066cc] group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Interest Rate</h3>
              <p className="text-gray-600 group-hover:text-white/80">
                Your rate depends on credit score, down payment, and loan type. Lower rates mean lower monthly payments over the life of the loan.
              </p>
            </div>
            <div className="group p-6 bg-gray-50 rounded-2xl hover:bg-[#0066cc] hover:text-white transition-all duration-300">
              <div className="w-14 h-14 bg-[#0066cc]/10 group-hover:bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <Home className="w-7 h-7 text-[#0066cc] group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Down Payment</h3>
              <p className="text-gray-600 group-hover:text-white/80">
                Typically 3-20% of home price. A larger down payment means lower monthly payments and potentially better interest rates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#0066cc] to-[#0052a3]">
        <div className="container-main text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Get Pre-Approved?</h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Get pre-approved to know exactly how much you can afford and stand out to sellers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup" className="inline-flex items-center justify-center gap-2 bg-white text-[#0066cc] px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all">
              Get Started <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/buy" className="inline-flex items-center justify-center gap-2 bg-[#0066cc]/20 text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#0066cc]/30 transition-all border border-white/20">
              Browse Homes
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a1a2e] py-12">
        <div className="container-main">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#0066cc] to-[#0052a3] rounded-xl flex items-center justify-center">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">HomeVista</span>
              </Link>
              <p className="text-gray-400 text-sm">
                Find your perfect home with HomeVista. The best place to discover your dream property.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <div className="flex flex-col gap-2">
                <Link href="/buy" className="text-gray-400 hover:text-white transition-colors">Buy</Link>
                <Link href="/rent" className="text-gray-400 hover:text-white transition-colors">Rent</Link>
                <Link href="/sell" className="text-gray-400 hover:text-white transition-colors">Sell</Link>
                <Link href="/mortgage" className="text-gray-400 hover:text-white transition-colors">Mortgage</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <div className="flex flex-col gap-2">
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">Buyer's Guide</Link>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">Seller's Guide</Link>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">Mortgage Rates</Link>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Contact</h4>
              <div className="flex flex-col gap-2 text-gray-400">
                <p>support@homevista.com</p>
                <p>1-800-HOMEVISTA</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">&copy; 2026 HomeVista. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
