'use client'

export default function SearchFilters({ 
  filters, 
  onFiltersChange, 
  onSearch 
}: {
  filters: any
  onFiltersChange: (filters: any) => void
  onSearch: () => void
}) {
  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch()
  }

  return (
    <form onSubmit={handleSearch} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Location Search */}
        <div className="md:col-span-2">
          <input
            type="text"
            placeholder="City, Neighborhood, ZIP"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filters.city}
            onChange={(e) => handleFilterChange('city', e.target.value)}
          />
        </div>

        {/* Price Range */}
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min Price"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
          />
          <input
            type="number"
            placeholder="Max Price"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
          />
        </div>

        {/* Beds and Baths */}
        <div className="flex gap-2">
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filters.minBeds}
            onChange={(e) => handleFilterChange('minBeds', e.target.value)}
          >
            <option value="">Min Beds</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
            <option value="5">5+</option>
          </select>
          
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filters.minBaths}
            onChange={(e) => handleFilterChange('minBaths', e.target.value)}
          >
            <option value="">Min Baths</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
          </select>
        </div>

        {/* Property Type */}
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={filters.propertyType}
          onChange={(e) => handleFilterChange('propertyType', e.target.value)}
        >
          <option value="">Property Type</option>
          <option value="SINGLE_FAMILY">Single Family</option>
          <option value="CONDO">Condo</option>
          <option value="TOWNHOUSE">Townhouse</option>
          <option value="MULTI_FAMILY">Multi-Family</option>
          <option value="APARTMENT">Apartment</option>
          <option value="COMMERCIAL">Commercial</option>
          <option value="LAND">Land</option>
        </select>

        {/* Search Button */}
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Search
        </button>
      </div>

      {/* Advanced Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <input
            type="number"
            placeholder="Min Sq Ft"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filters.minSqft}
            onChange={(e) => handleFilterChange('minSqft', e.target.value)}
          />
        </div>
        
        <div>
          <input
            type="number"
            placeholder="Max Sq Ft"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filters.maxSqft}
            onChange={(e) => handleFilterChange('maxSqft', e.target.value)}
          />
        </div>

        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          <option value="">Any Status</option>
          <option value="ACTIVE">Active</option>
          <option value="PENDING">Pending</option>
          <option value="SOLD">Sold</option>
          <option value="RENTED">Rented</option>
          <option value="OFF_MARKET">Off Market</option>
        </select>

        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={filters.sortBy}
          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
        >
          <option value="createdAt">Sort by Date</option>
          <option value="price">Sort by Price</option>
          <option value="sqft">Sort by Size</option>
          <option value="beds">Sort by Beds</option>
        </select>
      </div>

      {/* Sort Order */}
      <div className="flex items-center gap-4">
        <select
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={filters.sortOrder}
          onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>

        <button
          type="button"
          onClick={() => onFiltersChange({
            search: '',
            city: '',
            propertyType: '',
            status: '',
            minPrice: '',
            maxPrice: '',
            minBeds: '',
            maxBeds: '',
            minBaths: '',
            maxBaths: '',
            minSqft: '',
            maxSqft: '',
            sortBy: 'createdAt',
            sortOrder: 'desc'
          })}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Clear Filters
        </button>
      </div>
    </form>
  )
}