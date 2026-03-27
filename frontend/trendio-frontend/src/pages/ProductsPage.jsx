import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { getProducts, getCategories } from '../api/productApi'
import { ProductCard } from './HomePage'

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts]     = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [total, setTotal]           = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const currentCategory = searchParams.get('category') || ''
  const currentSearch   = searchParams.get('search')   || ''
  const currentSort     = searchParams.get('sort')     || '-created_at'
  const currentMin      = searchParams.get('min_price')|| ''
  const currentMax      = searchParams.get('max_price')|| ''

  const [searchInput, setSearchInput] = useState(currentSearch)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (currentCategory) params.category  = currentCategory
      if (currentSearch)   params.search    = currentSearch
      if (currentSort)     params.sort      = currentSort
      if (currentMin)      params.min_price = currentMin
      if (currentMax)      params.max_price = currentMax

      const data = await getProducts(params)
      if (Array.isArray(data)) {
        setProducts(data)
        setTotal(data.length)
      } else {
        setProducts(data.results || data)
        setTotal(data.count || data.length)
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }, [currentCategory, currentSearch, currentSort, currentMin, currentMax])

  useEffect(() => { fetchProducts() }, [fetchProducts])
  useEffect(() => {
    getCategories().then(setCategories).catch(console.error)
  }, [])

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams)
    if (value) newParams.set(key, value)
    else newParams.delete(key)
    setSearchParams(newParams)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    updateFilter('search', searchInput)
  }

  const clearFilters = () => {
    setSearchInput('')
    setSearchParams({})
  }

  const activeFiltersCount = [currentCategory, currentSearch, currentMin, currentMax].filter(Boolean).length

  return (
    <div className="min-h-screen bg-white">

      {/* Page Header */}
      <div className="border-b border-luxury-gray">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs tracking-widest uppercase text-gold mb-1">Trendio</p>
              <h1 className="font-serif text-4xl font-normal text-black">
                {currentCategory
                  ? categories.find(c => c.slug === currentCategory)?.name || 'Collection'
                  : currentSearch
                  ? `Results for "${currentSearch}"`
                  : 'All Products'
                }
              </h1>
            </div>
            <p className="text-xs tracking-widest text-luxury-midgray uppercase">
              {loading ? '—' : `${total} pieces`}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex gap-8 py-8">

          {/* ── Sidebar ──────────────────────────────────── */}
          <aside className={`flex-shrink-0 transition-all duration-300 ${sidebarOpen ? 'w-56' : 'w-0 overflow-hidden'}`}>
            <div className="space-y-8">

              {/* Search */}
              <div>
                <h3 className="text-xs tracking-widest uppercase font-medium mb-4">Search</h3>
                <form onSubmit={handleSearch}>
                  <div className="flex border-b border-black">
                    <input
                      type="text"
                      value={searchInput}
                      onChange={e => setSearchInput(e.target.value)}
                      placeholder="Search..."
                      className="flex-1 py-2 text-xs tracking-wide focus:outline-none placeholder-luxury-midgray"
                    />
                    <button type="submit" className="text-xs px-2 hover:text-gold transition-colors">→</button>
                  </div>
                </form>
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-xs tracking-widest uppercase font-medium mb-4">Category</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => updateFilter('category', '')}
                    className={`block w-full text-left text-xs tracking-wide py-1 transition-colors ${
                      !currentCategory
                        ? 'text-black font-medium'
                        : 'text-luxury-midgray hover:text-black'
                    }`}
                  >
                    All Categories
                    {!currentCategory && <span className="float-right text-gold">✓</span>}
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => updateFilter('category', cat.slug)}
                      className={`block w-full text-left text-xs tracking-wide py-1 transition-colors ${
                        currentCategory === cat.slug
                          ? 'text-black font-medium'
                          : 'text-luxury-midgray hover:text-black'
                      }`}
                    >
                      {cat.name}
                      <span className="float-right text-luxury-midgray">({cat.product_count})</span>
                      {currentCategory === cat.slug && <span className="float-right text-gold mr-2">✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <h3 className="text-xs tracking-widest uppercase font-medium mb-4">Price</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Under ₹500',      min: '',    max: '500'  },
                    { label: '₹500 – ₹1,000',   min: '500', max: '1000' },
                    { label: '₹1,000 – ₹2,000', min: '1000',max: '2000' },
                    { label: 'Above ₹2,000',    min: '2000',max: ''     },
                  ].map(range => (
                    <button
                      key={range.label}
                      onClick={() => {
                        updateFilter('min_price', range.min)
                        updateFilter('max_price', range.max)
                      }}
                      className={`block w-full text-left text-xs tracking-wide py-1 transition-colors ${
                        currentMin === range.min && currentMax === range.max
                          ? 'text-black font-medium'
                          : 'text-luxury-midgray hover:text-black'
                      }`}
                    >
                      {range.label}
                      {currentMin === range.min && currentMax === range.max && (
                        <span className="float-right text-gold">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs tracking-widest uppercase text-luxury-midgray hover:text-black transition-colors border-b border-luxury-midgray pb-0.5"
                >
                  Clear All Filters ({activeFiltersCount})
                </button>
              )}
            </div>
          </aside>

          {/* ── Products ─────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-luxury-gray">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-xs tracking-widest uppercase text-luxury-midgray hover:text-black transition-colors flex items-center gap-2"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h10M4 18h7"/>
                </svg>
                {sidebarOpen ? 'Hide' : 'Show'} Filters
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs tracking-widest uppercase text-luxury-midgray">Sort:</span>
                <select
                  value={currentSort}
                  onChange={e => updateFilter('sort', e.target.value)}
                  className="text-xs tracking-widest uppercase border-none focus:outline-none bg-transparent cursor-pointer"
                >
                  <option value="-created_at">Newest</option>
                  <option value="price">Price: Low</option>
                  <option value="-price">Price: High</option>
                  <option value="name">A — Z</option>
                </select>
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-luxury-offwhite aspect-[3/4]"/>
                    <div className="mt-3 space-y-2">
                      <div className="h-3 bg-luxury-gray rounded w-1/3"/>
                      <div className="h-4 bg-luxury-gray rounded w-3/4"/>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24">
                <p className="font-serif text-3xl text-luxury-midgray mb-4">No results found</p>
                <p className="text-xs tracking-widest uppercase text-luxury-midgray mb-8">
                  Try adjusting your filters
                </p>
                <button
                  onClick={clearFilters}
                  className="border border-black text-black text-xs tracking-widest uppercase px-8 py-3 hover:bg-black hover:text-white transition-all"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductsPage