'use client'

import { useState, useEffect } from 'react'
import PropertyForm from '@/components/PropertyForm'
import PropertyList from '@/components/PropertyList'
import { Home, Building, Users, BarChart3, Plus, Search, Trash2, Mail, Phone } from 'lucide-react'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'

interface User {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  role: string
  image: string | null
  createdAt: string
  _count: {
    savedProperties: number
    reviews: number
  }
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'properties' | 'users' | 'analytics'>('properties')
  
  // Users state
  const [users, setUsers] = useState<User[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [userPagination, setUserPagination] = useState({ page: 1, total: 0, pages: 0 })
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers()
    }
  }, [activeTab, userPagination.page, searchQuery, roleFilter])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        window.location.href = '/auth/signin'
        return
      }

      const response = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.user.role !== 'ADMIN' && data.user.role !== 'admin') {
          window.location.href = '/'
          return
        }
      } else {
        window.location.href = '/auth/signin'
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      window.location.href = '/auth/signin'
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    setUsersLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', userPagination.page.toString())
      params.set('limit', '10')
      if (searchQuery) params.set('search', searchQuery)
      if (roleFilter) params.set('role', roleFilter)

      const res = await fetch(`/api/admin/users?${params.toString()}`)
      const data = await res.json()
      
      if (data.users) {
        setUsers(data.users)
        setUserPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setUsersLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole })
      })
      
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
      }
    } catch (error) {
      console.error('Error updating user role:', error)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    
    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, { method: 'DELETE' })
      if (res.ok) {
        setUsers(users.filter(u => u.id !== userId))
      }
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  const stats = [
    { label: 'Total Properties', value: '2,847', icon: Building, change: '+12%', color: 'bg-blue-500' },
    { label: 'Active Listings', value: '1,523', icon: Home, change: '+8%', color: 'bg-green-500' },
    { label: 'Total Users', value: userPagination.total.toLocaleString(), icon: Users, change: '+24%', color: 'bg-purple-500' },
    { label: 'Monthly Views', value: '89.2K', icon: BarChart3, change: '+18%', color: 'bg-orange-500' },
  ]

  const roles = ['USER', 'AGENT', 'ADMIN']

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SiteHeader />
        <div className="flex min-h-[60vh] items-center justify-center pt-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066cc]"></div>
        </div>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SiteHeader />

      <div className="container-main pb-8 pt-24">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1a1a2e]">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage your real estate platform</p>
          </div>
          <button className="btn-smooth flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Property
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="card-modern surface-card surface-card-hover p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-green-600">{stat.change}</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="card-modern surface-card overflow-hidden mb-8">
          <div className="border-b border-gray-200 bg-gray-50">
            <div className="flex">
              {[
                { id: 'properties', label: 'Properties', icon: Building },
                { id: 'users', label: 'Users', icon: Users },
                { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-[#0066cc] text-[#0066cc] bg-white'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-4 h-4" /> {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'properties' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5" /> Add New Property
                  </h2>
                  <PropertyForm />
                </div>
                
                <div className="border-t border-gray-200 pt-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Building className="w-5 h-5" /> Manage Properties
                  </h2>
                  <PropertyList />
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
                  <div className="glass-control flex items-center gap-3 rounded-2xl p-2">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Search users..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-lg text-sm w-64" 
                      />
                    </div>
                    <select 
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="input-modern w-auto text-sm py-2"
                    >
                      <option value="">All Roles</option>
                      <option value="USER">User</option>
                      <option value="AGENT">Agent</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                </div>

                {usersLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg animate-pulse">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : users.length > 0 ? (
                  <div className="space-y-3">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#0066cc] to-[#0052a3] rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold">
                              {(user.firstName || user.email || 'U')[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {user.firstName && user.lastName 
                                ? `${user.firstName} ${user.lastName}` 
                                : user.email || 'No name'}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-2">
                              <Mail className="w-3 h-3" /> {user.email}
                              {user.phone && (
                                <>
                                  <span>•</span>
                                  <Phone className="w-3 h-3" /> {user.phone}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-sm font-medium text-gray-900">{user._count.savedProperties}</div>
                            <div className="text-xs text-gray-500">Saved</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-medium text-gray-900">{user._count.reviews}</div>
                            <div className="text-xs text-gray-500">Reviews</div>
                          </div>
                          
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium border-0 ${
                              user.role === 'ADMIN' 
                                ? 'bg-purple-100 text-purple-700' 
                                : user.role === 'AGENT'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {roles.map((role) => (
                              <option key={role} value={role}>{role}</option>
                            ))}
                          </select>

                          <button 
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No users found</p>
                  </div>
                )}

                {/* Pagination */}
                {userPagination.pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                      onClick={() => setUserPagination({ ...userPagination, page: userPagination.page - 1 })}
                      disabled={userPagination.page === 1}
                      className="px-4 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-500">
                      Page {userPagination.page} of {userPagination.pages}
                    </span>
                    <button
                      onClick={() => setUserPagination({ ...userPagination, page: userPagination.page + 1 })}
                      disabled={userPagination.page === userPagination.pages}
                      className="px-4 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'analytics' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Analytics Dashboard</h2>
                  <select className="input-modern w-auto text-sm">
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                    <option>This year</option>
                  </select>
                </div>
                <div className="text-center py-12 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Analytics features coming soon...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}
