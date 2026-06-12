'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Edit, Trash2, X, Bed, Bath, Square, MapPin, Home, ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react'

interface Property {
  id: string
  title: string
  price: number
  address: string
  city: string
  state: string
  zipCode: string
  beds?: number
  baths?: number
  sqft?: number
  propertyType: string
  status: string
  description: string
  images: { url: string; isPrimary: boolean }[]
}

export default function PropertyList() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [editForm, setEditForm] = useState<any>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, pages: 0 })

  useEffect(() => {
    fetchProperties()
  }, [currentPage, statusFilter])

  const fetchProperties = async () => {
    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams()
      params.set('limit', '20')
      params.set('page', currentPage.toString())
      if (statusFilter) params.set('status', statusFilter)
      if (searchQuery) params.set('search', searchQuery)

      const response = await fetch(`/api/properties?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setProperties(data.properties || [])
        if (data.pagination) {
          setPagination(data.pagination)
        }
      }
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchProperties()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/properties/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        setProperties(properties.filter(p => p.id !== id))
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete property')
      }
    } catch (error) {
      console.error('Error deleting property:', error)
      alert('An error occurred while deleting the property')
    }
  }

  const handleEdit = (property: Property) => {
    setEditingProperty(property)
    setEditForm({
      title: property.title,
      description: property.description,
      price: property.price,
      address: property.address,
      city: property.city,
      state: property.state,
      zipCode: property.zipCode,
      beds: property.beds || '',
      baths: property.baths || '',
      sqft: property.sqft || '',
      propertyType: property.propertyType,
      status: property.status
    })
  }

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/properties/${editingProperty?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      })

      if (response.ok) {
        const updatedProperty = await response.json()
        setProperties(properties.map(p => p.id === editingProperty?.id ? { ...p, ...updatedProperty } : p))
        setEditingProperty(null)
        alert('Property updated successfully!')
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to update property')
      }
    } catch (error) {
      console.error('Error updating property:', error)
      alert('An error occurred while updating the property')
    }
  }

  const handleCancelEdit = () => {
    setEditingProperty(null)
    setEditForm({})
  }

  const formatPrice = (price: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-700'
      case 'PENDING': return 'bg-yellow-100 text-yellow-700'
      case 'SOLD': return 'bg-blue-100 text-blue-700'
      case 'RENTED': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0066cc]"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-modern pl-10"
            />
          </div>
          <button type="submit" className="btn-primary">
            Search
          </button>
        </form>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="input-modern w-auto"
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="PENDING">Pending</option>
          <option value="SOLD">Sold</option>
          <option value="RENTED">Rented</option>
        </select>
      </div>

      {/* Properties Grid */}
      {properties.length === 0 ? (
        <div className="text-center py-12">
          <Home className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">No properties found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div key={property.id} className="card-modern overflow-hidden group">
                <div className="relative h-48">
                  {property.images?.[0] ? (
                    <Image src={property.images[0].url} alt={property.title} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <Home className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(property.status)}`}>
                    {property.status}
                  </span>
                </div>
                <div className="p-5">
                  <div className="text-xl font-bold text-[#0066cc] mb-2">{formatPrice(property.price)}</div>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{property.title}</h3>
                  <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
                    <MapPin className="w-4 h-4" />
                    <span className="line-clamp-1">{property.address}, {property.city}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    {(property.beds || 0) > 0 && <span className="flex items-center gap-1"><Bed className="w-4 h-4" />{property.beds}</span>}
                    {(property.baths || 0) > 0 && <span className="flex items-center gap-1"><Bath className="w-4 h-4" />{Math.floor(property.baths || 0)}</span>}
                    {property.sqft && property.sqft > 0 && <span className="flex items-center gap-1"><Square className="w-4 h-4" />{property.sqft?.toLocaleString()}</span>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(property)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#0066cc] text-white rounded-lg text-sm font-medium hover:bg-[#0052a3] transition-colors"
                    >
                      <Edit className="w-4 h-4" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(property.id)}
                      className="flex items-center justify-center px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {currentPage} of {pagination.pages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(pagination.pages, p + 1))}
                disabled={currentPage === pagination.pages}
                className="flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Edit Modal */}
      {editingProperty && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Edit Property</h2>
              <button onClick={handleCancelEdit} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={editForm.title || ''}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  className="input-modern"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  rows={4}
                  className="input-modern"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                  <input
                    type="number"
                    value={editForm.price || ''}
                    onChange={(e) => setEditForm({...editForm, price: Number(e.target.value)})}
                    className="input-modern"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                  <select
                    value={editForm.propertyType || ''}
                    onChange={(e) => setEditForm({...editForm, propertyType: e.target.value})}
                    className="input-modern"
                  >
                    <option value="SINGLE_FAMILY">Single Family</option>
                    <option value="CONDO">Condo</option>
                    <option value="TOWNHOUSE">Townhome</option>
                    <option value="APARTMENT">Apartment</option>
                    <option value="MULTI_FAMILY">Multi Family</option>
                    <option value="LAND">Land</option>
                    <option value="COMMERCIAL">Commercial</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  value={editForm.address || ''}
                  onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                  className="input-modern"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={editForm.city || ''}
                    onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                    className="input-modern"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    value={editForm.state || ''}
                    onChange={(e) => setEditForm({...editForm, state: e.target.value})}
                    className="input-modern"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                  <input
                    type="text"
                    value={editForm.zipCode || ''}
                    onChange={(e) => setEditForm({...editForm, zipCode: e.target.value})}
                    className="input-modern"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Beds</label>
                  <input
                    type="number"
                    value={editForm.beds || ''}
                    onChange={(e) => setEditForm({...editForm, beds: Number(e.target.value)})}
                    className="input-modern"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Baths</label>
                  <input
                    type="number"
                    step="0.5"
                    value={editForm.baths || ''}
                    onChange={(e) => setEditForm({...editForm, baths: Number(e.target.value)})}
                    className="input-modern"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sqft</label>
                  <input
                    type="number"
                    value={editForm.sqft || ''}
                    onChange={(e) => setEditForm({...editForm, sqft: Number(e.target.value)})}
                    className="input-modern"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={editForm.status || ''}
                  onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                  className="input-modern"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="PENDING">Pending</option>
                  <option value="SOLD">Sold</option>
                  <option value="RENTED">Rented</option>
                  <option value="OFF_MARKET">Off Market</option>
                </select>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6 flex justify-end gap-3">
              <button
                onClick={handleCancelEdit}
                className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:border-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="btn-primary"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
