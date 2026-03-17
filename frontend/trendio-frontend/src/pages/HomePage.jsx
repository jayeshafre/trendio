import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getFeaturedProducts, getCategories } from '../api/productApi';

const HomePage = () => {
    const { isAuthenticated, user } = useAuth();
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [categories, setCategories]             = useState([]);
    const [loading, setLoading]                   = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [products, cats] = await Promise.all([
                    getFeaturedProducts(),
                    getCategories()
                ]);
                setFeaturedProducts(products);
                setCategories(cats);
            } catch (error) {
                console.error('Failed to fetch homepage data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Category icons and gradients
    const categoryStyles = {
        men:   { emoji: '👔', gradient: 'from-blue-500 to-blue-700',   light: 'bg-blue-50',  text: 'text-blue-600'  },
        women: { emoji: '👗', gradient: 'from-pink-500 to-pink-700',   light: 'bg-pink-50',  text: 'text-pink-600'  },
        kids:  { emoji: '🧸', gradient: 'from-yellow-400 to-orange-500', light: 'bg-orange-50', text: 'text-orange-600' },
    };

    return (
        <div className="min-h-screen bg-gray-50">

            {/* ── Hero Banner ───────────────────────────────── */}
            <section className="bg-gradient-to-r from-pink-500 to-pink-700 text-white">
                <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center text-center">
                    <span className="bg-white text-pink-600 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
                        New Arrivals 2026
                    </span>
                    <h1 className="text-5xl font-bold mb-4 leading-tight">
                        Dress to <span className="text-yellow-300">Impress</span>
                    </h1>
                    <p className="text-pink-100 text-lg mb-8 max-w-xl">
                        Discover the latest trends for Men, Women & Kids.
                        Style that speaks before you do.
                    </p>
                    <div className="flex gap-4">
                        <Link
                            to="/products"
                            className="bg-white text-pink-600 font-bold px-8 py-3 rounded-full hover:bg-pink-50 transition-colors shadow-lg"
                        >
                            Shop Now
                        </Link>
                        {!isAuthenticated && (
                            <Link
                                to="/register"
                                className="border-2 border-white text-white font-bold px-8 py-3 rounded-full hover:bg-white hover:text-pink-600 transition-colors"
                            >
                                Join Free
                            </Link>
                        )}
                    </div>
                    {isAuthenticated && (
                        <p className="mt-4 text-pink-200 text-sm">
                            Welcome back, <span className="font-bold text-white">{user?.first_name || user?.username}</span>! 👋
                        </p>
                    )}
                </div>
            </section>

            {/* ── Shop by Category ──────────────────────────── */}
            <section className="max-w-7xl mx-auto px-4 py-16">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-gray-800">Shop by Category</h2>
                    <p className="text-gray-500 mt-2">Find exactly what you're looking for</p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-3 gap-6">
                        {[1,2,3].map(i => (
                            <div key={i} className="h-40 bg-gray-200 rounded-2xl animate-pulse"/>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-6">
                        {categories.map(cat => {
                            const style = categoryStyles[cat.slug] || {
                                emoji: '🛍️',
                                gradient: 'from-gray-500 to-gray-700',
                                light: 'bg-gray-50',
                                text: 'text-gray-600'
                            };
                            return (
                                <Link
                                    key={cat.id}
                                    to={`/products?category=${cat.slug}`}
                                    className="group relative overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300"
                                >
                                    <div className={`bg-gradient-to-br ${style.gradient} p-8 text-white text-center`}>
                                        <div className="text-5xl mb-3">{style.emoji}</div>
                                        <h3 className="text-xl font-bold">{cat.name}</h3>
                                        <p className="text-sm opacity-80 mt-1">
                                            {cat.product_count} Products
                                        </p>
                                        <div className="mt-4 inline-block bg-white bg-opacity-20 px-4 py-1 rounded-full text-sm font-medium group-hover:bg-opacity-30 transition-all">
                                            Shop Now →
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* ── Featured Products ─────────────────────────── */}
            <section className="max-w-7xl mx-auto px-4 pb-16">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Featured Products</h2>
                        <p className="text-gray-500 mt-1">Handpicked just for you</p>
                    </div>
                    <Link
                        to="/products"
                        className="text-pink-500 font-semibold hover:underline text-sm"
                    >
                        View All →
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[1,2,3,4].map(i => (
                            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                                <div className="h-56 bg-gray-200 animate-pulse"/>
                                <div className="p-4 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded animate-pulse"/>
                                    <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"/>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : featuredProducts.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <p className="text-4xl mb-2">🛍️</p>
                        <p>No featured products yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {featuredProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </section>

            {/* ── Banner Strip ──────────────────────────────── */}
            <section className="bg-pink-500 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h2 className="text-2xl font-bold mb-2">🚚 Free Shipping on Orders Above ₹999</h2>
                    <p className="text-pink-100 text-sm">Use code <span className="font-bold text-yellow-300">TRENDIO10</span> for 10% off your first order</p>
                </div>
            </section>

        </div>
    );
};

// ─── Product Card Component ───────────────────────────────────
export const ProductCard = ({ product }) => {
    return (
        <Link
            to={`/products/${product.id}`}
            className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
        >
            {/* Image */}
            <div className="relative overflow-hidden bg-gray-100 h-56">
                {product.image ? (
                    <img
                        src={`http://localhost:8000${product.image}`}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                        🛍️
                    </div>
                )}
                {/* Discount Badge */}
                {product.discount_percentage > 0 && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {product.discount_percentage}% OFF
                    </div>
                )}
                {/* Out of Stock Badge */}
                {!product.is_in_stock && (
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                        <span className="bg-white text-gray-700 text-xs font-bold px-3 py-1 rounded-full">
                            Out of Stock
                        </span>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-4">
                <p className="text-xs text-pink-500 font-medium mb-1">
                    {product.category_name}
                </p>
                <h3 className="text-sm font-semibold text-gray-800 mb-2 line-clamp-2 leading-snug">
                    {product.name}
                </h3>
                <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900">
                        ₹{Number(product.price).toLocaleString('en-IN')}
                    </span>
                    {product.compare_price && (
                        <span className="text-sm text-gray-400 line-through">
                            ₹{Number(product.compare_price).toLocaleString('en-IN')}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default HomePage;