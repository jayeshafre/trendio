import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductDetail } from '../api/productApi';

// ✅ NEW IMPORTS
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import toast, { Toaster } from 'react-hot-toast';

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [error, setError] = useState('');

    // ✅ AUTH + CART
    const { isAuthenticated } = useAuth();
    const { addItem, loading: cartLoading } = useCart();

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

                {/* ✅ Toast Container */}
                <Toaster position="top-right" />

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

                        {/* Image */}
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

                        {/* Info */}
                        <div className="p-8 flex flex-col justify-between">
                            <div>

                                {product.category && (
                                    <Link
                                        to={`/products?category=${product.category.slug}`}
                                        className="text-pink-500 text-sm font-medium hover:underline"
                                    >
                                        {product.category.name}
                                    </Link>
                                )}

                                <h1 className="text-3xl font-bold text-gray-800 mt-2 mb-4">
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
                                </div>

                                {/* Stock */}
                                <div className="mb-6">
                                    {product.is_in_stock ? (
                                        <span className="text-green-600">
                                            In Stock ({product.stock})
                                        </span>
                                    ) : (
                                        <span className="text-red-500">
                                            Out of Stock
                                        </span>
                                    )}
                                </div>

                                {/* Quantity */}
                                {product.is_in_stock && (
                                    <div className="flex items-center gap-4 mb-6">
                                        <span>Quantity:</span>
                                        <div className="flex border rounded-xl">
                                            <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                                            <span className="px-4">{quantity}</span>
                                            <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}>+</button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* ✅ ADD TO CART BUTTON */}
                            <div className="space-y-4">

                                <button
                                    disabled={!product.is_in_stock || cartLoading}
                                    onClick={async () => {
                                        if (!isAuthenticated) {
                                            toast.error('Please login to add items to cart.');
                                            navigate('/login');
                                            return;
                                        }

                                        try {
                                            await addItem(product.id, quantity);
                                            toast.success('Added to cart!');
                                        } catch (err) {
                                            toast.error('Failed to add item.');
                                        }
                                    }}
                                    className={`w-full py-4 rounded-2xl font-bold text-lg ${
                                        product.is_in_stock
                                            ? 'bg-pink-500 text-white hover:bg-pink-600'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    {cartLoading ? 'Adding...' :
                                        product.is_in_stock ? '🛒 Add to Cart' : 'Out of Stock'}
                                </button>

                                <button
                                    onClick={() => navigate('/products')}
                                    className="w-full py-3 border rounded-xl"
                                >
                                    ← Continue Shopping
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;