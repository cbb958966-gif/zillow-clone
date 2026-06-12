'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleSignOut = () => {
    logout()
    router.push('/')
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Zillow
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/buy" className="text-gray-700 hover:text-blue-600 transition-colors">
              Buy
            </Link>
            <Link href="/rent" className="text-gray-700 hover:text-blue-600 transition-colors">
              Rent
            </Link>
            <Link href="/sell" className="text-gray-700 hover:text-blue-600 transition-colors">
              Sell
            </Link>
            <Link href="/mortgage" className="text-gray-700 hover:text-blue-600 transition-colors">
              Mortgage
            </Link>
          </nav>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-700">
                    {user.firstName} {user.lastName}
                  </span>
                  <div className="relative group">
                    <button className="text-gray-500 hover:text-gray-700">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="py-1">
                        <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Dashboard
                        </Link>
                        <Link href="/dashboard/saved" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Saved Properties
                        </Link>
                        {user.role === 'ADMIN' && (
                          <Link href="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            Admin Panel
                          </Link>
                        )}
                        <button
                          onClick={handleSignOut}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link 
                  href="/auth/signin"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  href="/auth/signup"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Join
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link href="/buy" className="block px-3 py-2 text-gray-700 hover:text-blue-600">Buy</Link>
              <Link href="/rent" className="block px-3 py-2 text-gray-700 hover:text-blue-600">Rent</Link>
              <Link href="/sell" className="block px-3 py-2 text-gray-700 hover:text-blue-600">Sell</Link>
              <Link href="/mortgage" className="block px-3 py-2 text-gray-700 hover:text-blue-600">Mortgage</Link>
              {user ? (
                <>
                  <div className="px-3 py-2 text-gray-700">
                    {user.firstName} {user.lastName}
                  </div>
                  <Link href="/dashboard" className="block px-3 py-2 text-gray-700 hover:text-blue-600">Dashboard</Link>
                  <Link href="/dashboard/saved" className="block px-3 py-2 text-gray-700 hover:text-blue-600">Saved Properties</Link>
                  {user.role === 'ADMIN' && (
                    <Link href="/admin" className="block px-3 py-2 text-gray-700 hover:text-blue-600">Admin Panel</Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:text-blue-600"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/signin" className="block px-3 py-2 text-gray-700 hover:text-blue-600">Sign In</Link>
                  <Link href="/auth/signup" className="block px-3 py-2 bg-blue-600 text-white rounded mt-2 text-center">Join</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
