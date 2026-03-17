import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getProducts, getCategories } from '../api/productApi';
import { ProductCard } from './HomePage';

const ProductsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const [products, setProducts]     = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading]       = useState(true);
    const [total, setTotal]           = useState(0);

    // Get filters from URL
    const currentCategory = searchParams.get('category') || '';
    const currentSearch   = searchParams.get('search')   || '';
    const currentSort     = searchParams.get('sort')     || '-created_at';
    const currentMin      = searchParams.get('min_price')|| '';
    const currentMax      = searchParams.get('max_price')|| '';

    const [searchInput, setSearchInput] = useState(currentSearch);

    // Fetch products whenever filters change
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (currentCategory) params.category  = currentCategory;
            if (currentSearch)   params.search    = currentSearch;
            if (currentSort)     params.sort      = currentSort;
            if (currentMin)      params.min_price = currentMin;
            if (currentMax)      params.max_price = currentMax;

            const data = await getProducts(params);
            // Handle both array and paginated responses
            if (Array.isArray(data)) {
                setProducts(data);
                setTotal(data.length);
            } else {
                setProducts(data.results || data);
                setTotal(data.count || data.length);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    }, [currentCategory, currentSearch, currentSort, currentMin, currentMax]);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    // Fetch categories once
    useEffect(() => {
        getCategories().then(setCategories).catch(console.error);
    }, []);

    const updateFilter = (key, value) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) newParams.set(key, value);
        else newParams.delete(key);
        setSearchParams(newParams);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        updateFilter('search', searchInput);
    };

    const clearFilters = () => {
        setSearchInput('');
        setSearchParams({});
    };

    const categoryStyles = {
        men:   'bg-blue-100 text-blue-700',
        women: 'bg-pink-100 text-pink-700',
        kids:  'bg-orange-100 text-orange-700',
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">

                {/* ── Page Header ───────────────────────────── */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">
                        {currentCategory
                            ? categories.find(c => c.slug === currentCategory)?.name || 'Products'
                            : 'All Products'
                        }
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {loading ? 'Loading...' : `${total} products found`}
                    </p>
                </div>

                <div className="flex gap-8">

                    {/* ── Sidebar Filters ───────────────────── */}
                    <aside className="w-60 flex-shrink-0">

                        {/* Search */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
                            <h3 className="font-semibold text-gray-700 mb-3">Search</h3>
                            <form onSubmit={handleSearch} className="flex gap-2">
                                <input
                                    type="text"
                                    value={searchInput}
                                    onChange={e => setSearchInput(e.target.value)}
                                    placeholder="Search products..."
                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                                />
                                <button
                                    type="submit"
                                    className="bg-pink-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-pink-600"
                                >
                                    🔍
                                </button>
                            </form>
                        </div>

                        {/* Categories */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
                            <h3 className="font-semibold text-gray-700 mb-3">Category</h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => updateFilter('category', '')}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        !currentCategory
                                            ? 'bg-pink-500 text-white'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    All Categories
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => updateFilter('category', cat.slug)}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            currentCategory === cat.slug
                                                ? 'bg-pink-500 text-white'
                                                : `${categoryStyles[cat.slug] || 'text-gray-600 hover:bg-gray-100'}`
                                        }`}
                                    >
                                        {cat.slug === 'men'   && '👔 '}
                                        {cat.slug === 'women' && '👗 '}
                                        {cat.slug === 'kids'  && '🧸 '}
                                        {cat.name}
                                        <span className="float-right text-xs opacity-70">
                                            ({cat.product_count})
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
                            <h3 className="font-semibold text-gray-700 mb-3">Price Range</h3>
                            <div className="space-y-2">
                                {[
                                    { label: 'Under ₹500',        min: '',    max: '500'  },
                                    { label: '₹500 – ₹1,000',     min: '500', max: '1000' },
                                    { label: '₹1,000 – ₹2,000',   min: '1000',max: '2000' },
                                    { label: 'Above ₹2,000',      min: '2000',max: ''     },
                                ].map(range => (
                                    <button
                                        key={range.label}
                                        onClick={() => {
                                            updateFilter('min_price', range.min);
                                            updateFilter('max_price', range.max);
                                        }}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                            currentMin === range.min && currentMax === range.max
                                                ? 'bg-pink-500 text-white'
                                                : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        {range.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Clear Filters */}
                        {(currentCategory || currentSearch || currentMin || currentMax) && (
                            <button
                                onClick={clearFilters}
                                className="w-full border-2 border-pink-500 text-pink-500 py-2 rounded-xl text-sm font-semibold hover:bg-pink-50 transition-colors"
                            >
                                ✕ Clear All Filters
                            </button>
                        )}
                    </aside>

                    {/* ── Products Grid ─────────────────────── */}
                    <div className="flex-1">

                        {/* Sort Bar */}
                        <div className="bg-white rounded-2xl px-4 py-3 shadow-sm mb-6 flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                                {loading ? 'Loading...' : `${total} results`}
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">Sort:</span>
                                <select
                                    value={currentSort}
                                    onChange={e => updateFilter('sort', e.target.value)}
                                    className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                >
                                    <option value="-created_at">Newest First</option>
                                    <option value="created_at">Oldest First</option>
                                    <option value="price">Price: Low to High</option>
                                    <option value="-price">Price: High to Low</option>
                                    <option value="name">Name: A to Z</option>
                                    <option value="-name">Name: Z to A</option>
                                </select>
                            </div>
                        </div>

                        {/* Loading Skeleton */}
                        {loading ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                {[1,2,3,4,5,6].map(i => (
                                    <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                                        <div className="h-56 bg-gray-200 animate-pulse"/>
                                        <div className="p-4 space-y-2">
                                            <div className="h-4 bg-gray-200 rounded animate-pulse"/>
                                            <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"/>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            /* Empty State */
                            <div className="text-center py-20">
                                <div className="text-6xl mb-4">🔍</div>
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                    No products found
                                </h3>
                                <p className="text-gray-400 mb-6">
                                    Try adjusting your filters or search term.
                                </p>
                                <button
                                    onClick={clearFilters}
                                    className="bg-pink-500 text-white px-6 py-2 rounded-xl font-semibold hover:bg-pink-600"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        ) : (
                            /* Products Grid */
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
    );
};

export default ProductsPage;