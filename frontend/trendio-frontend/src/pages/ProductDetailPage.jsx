import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductDetail } from '../api/productApi';

const ProductDetailPage = () => {
    const { id }       = useParams();
    const navigate     = useNavigate();
    const [product, setProduct]   = useState(null);
    const [loading, setLoading]   = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [error, setError]       = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const data = await getProductDetail(id);
                setProduct(data);
            } catch (err) {
                setError('Product not found.');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"/>
        </div>
    );

    if (error || !product) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
            <div className="text-6xl">😕</div>
            <h2 className="text-2xl font-bold text-gray-700">Product Not Found</h2>
            <Link to="/products" className="bg-pink-500 text-white px-6 py-2 rounded-xl font-semibold hover:bg-pink-600">
                Back to Products
            </Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-6xl mx-auto px-4">

                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
                    <Link to="/" className="hover:text-pink-500">Home</Link>
                    <span>/</span>
                    <Link to="/products" className="hover:text-pink-500">Products</Link>
                    <span>/</span>
                    {product.category && (
                        <>
                            <Link
                                to={`/products?category=${product.category.slug}`}
                                className="hover:text-pink-500"
                            >
                                {product.category.name}
                            </Link>
                            <span>/</span>
                        </>
                    )}
                    <span className="text-gray-600 font-medium">{product.name}</span>
                </nav>

                <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0">

                        {/* ── Product Image ──────────────────── */}
                        <div className="bg-gray-100 flex items-center justify-center min-h-96 relative">
                            {product.image ? (
                                <img
                                    src={`http://localhost:8000${product.image}`}
                                    alt={product.name}
                                    className="w-full h-full object-cover max-h-[500px]"
                                />
                            ) : (
                                <div className="text-9xl">🛍️</div>
                            )}
                            {product.discount_percentage > 0 && (
                                <div className="absolute top-4 left-4 bg-green-500 text-white font-bold px-3 py-1 rounded-full">
                                    {product.discount_percentage}% OFF
                                </div>
                            )}
                        </div>

                        {/* ── Product Info ───────────────────── */}
                        <div className="p-8 flex flex-col justify-between">
                            <div>
                                {/* Category */}
                                {product.category && (
                                    <Link
                                        to={`/products?category=${product.category.slug}`}
                                        className="text-pink-500 text-sm font-medium hover:underline"
                                    >
                                        {product.category.name}
                                    </Link>
                                )}

                                {/* Name */}
                                <h1 className="text-3xl font-bold text-gray-800 mt-2 mb-4 leading-tight">
                                    {product.name}
                                </h1>

                                {/* Price */}
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="text-4xl font-bold text-gray-900">
                                        ₹{Number(product.price).toLocaleString('en-IN')}
                                    </span>
                                    {product.compare_price && (
                                        <span className="text-xl text-gray-400 line-through">
                                            ₹{Number(product.compare_price).toLocaleString('en-IN')}
                                        </span>
                                    )}
                                    {product.discount_percentage > 0 && (
                                        <span className="bg-green-100 text-green-700 text-sm font-bold px-2 py-1 rounded-lg">
                                            Save {product.discount_percentage}%
                                        </span>
                                    )}
                                </div>

                                {/* Stock Status */}
                                <div className="mb-6">
                                    {product.is_in_stock ? (
                                        <span className="flex items-center gap-2 text-green-600 text-sm font-medium">
                                            <span className="w-2 h-2 bg-green-500 rounded-full"/>
                                            In Stock ({product.stock} available)
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2 text-red-500 text-sm font-medium">
                                            <span className="w-2 h-2 bg-red-500 rounded-full"/>
                                            Out of Stock
                                        </span>
                                    )}
                                </div>

                                {/* Description */}
                                {product.description && (
                                    <div className="mb-6">
                                        <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
                                        <p className="text-gray-500 text-sm leading-relaxed">
                                            {product.description}
                                        </p>
                                    </div>
                                )}

                                {/* SKU */}
                                {product.sku && (
                                    <p className="text-xs text-gray-400 mb-6">
                                        SKU: {product.sku}
                                    </p>
                                )}
                            </div>

                            {/* ── Actions ────────────────────── */}
                            <div className="space-y-4">
                                {/* Quantity Selector */}
                                {product.is_in_stock && (
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-medium text-gray-700">Quantity:</span>
                                        <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                                            <button
                                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                                className="px-4 py-2 text-lg font-bold hover:bg-gray-100 transition-colors"
                                            >
                                                −
                                            </button>
                                            <span className="px-4 py-2 font-semibold text-gray-800 min-w-[3rem] text-center">
                                                {quantity}
                                            </span>
                                            <button
                                                onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                                                className="px-4 py-2 text-lg font-bold hover:bg-gray-100 transition-colors"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Add to Cart Button — Module 3 */}
                                <button
                                    disabled={!product.is_in_stock}
                                    className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
                                        product.is_in_stock
                                            ? 'bg-pink-500 text-white hover:bg-pink-600 shadow-lg hover:shadow-pink-200'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    {product.is_in_stock ? '🛒 Add to Cart' : 'Out of Stock'}
                                </button>

                                <button
                                    onClick={() => navigate('/products')}
                                    className="w-full py-3 rounded-2xl font-semibold text-gray-600 border-2 border-gray-200 hover:bg-gray-50 transition-colors"
                                >
                                    ← Continue Shopping
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Delivery Info */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                    {[
                        { icon: '🚚', title: 'Free Delivery',   desc: 'On orders above ₹999' },
                        { icon: '↩️', title: 'Easy Returns',    desc: '7-day return policy'  },
                        { icon: '🔒', title: 'Secure Payment',  desc: '100% safe checkout'   },
                    ].map(item => (
                        <div key={item.title} className="bg-white rounded-2xl p-4 text-center shadow-sm">
                            <div className="text-2xl mb-1">{item.icon}</div>
                            <div className="font-semibold text-gray-700 text-sm">{item.title}</div>
                            <div className="text-gray-400 text-xs">{item.desc}</div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default ProductDetailPage;