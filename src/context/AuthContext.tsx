'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useSession, signIn } from 'next-auth/react'
import jwt from 'jsonwebtoken'

interface User {
  id: string
  email: string
  name?: string | null
  firstName?: string | null
  lastName?: string | null
  role: string
  image?: string | null
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (user: User, token: string) => void
  logout: () => void
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'loading') {
      setLoading(true)
      return
    }

    if (session?.user) {
      setUser({
        id: session.user.id as string,
        email: session.user.email || '',
        name: session.user.name,
        firstName: session.user.name?.split(' ')[0] || null,
        lastName: session.user.name?.split(' ').slice(1).join(' ') || null,
        role: 'USER',
        image: session.user.image,
      })
      setToken('google-oauth')
      setLoading(false)
    } else {
      checkAuth()
    }
  }, [session, status])

  const checkAuth = async () => {
    try {
      const storedToken = localStorage.getItem('token')
      if (!storedToken) {
        setLoading(false)
        return
      }

      const response = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${storedToken}` }
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setToken(storedToken)
      } else {
        localStorage.removeItem('token')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (userData: User, authToken: string) => {
    setUser(userData)
    setToken(authToken)
    localStorage.setItem('token', authToken)
  }

  const loginWithGoogle = async () => {
    await signIn('google', { callbackUrl: '/' })
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
