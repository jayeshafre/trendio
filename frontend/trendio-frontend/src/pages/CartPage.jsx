import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Toaster } from 'react-hot-toast';

const CartPage = () => {
    const navigate = useNavigate();
    const { cart, loading, updateItem, removeItem, emptyCart } = useCart();

    if (loading && !cart) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"/>
        </div>
    );

    const isEmpty = !cart || cart.items.length === 0;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <Toaster position="top-right" />
            <div className="max-w-6xl mx-auto px-4">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Shopping Cart</h1>
                        <p className="text-gray-500 mt-1">
                            {isEmpty ? 'Your cart is empty' : `${cart.total_items} items in your cart`}
                        </p>
                    </div>
                    {!isEmpty && (
                        <button
                            onClick={emptyCart}
                            className="text-sm text-red-500 hover:text-red-600 font-medium border border-red-200 px-4 py-2 rounded-xl hover:bg-red-50 transition-colors"
                        >
                            🗑 Clear Cart
                        </button>
                    )}
                </div>

                {isEmpty ? (
                    /* Empty State */
                    <div className="bg-white rounded-3xl shadow-sm p-16 text-center">
                        <div className="text-8xl mb-6">🛒</div>
                        <h2 className="text-2xl font-bold text-gray-700 mb-3">
                            Your cart is empty
                        </h2>
                        <p className="text-gray-400 mb-8">
                            Looks like you haven't added anything yet.
                        </p>
                        <Link
                            to="/products"
                            className="bg-pink-500 text-white px-8 py-3 rounded-2xl font-semibold hover:bg-pink-600 transition-colors"
                        >
                            Start Shopping →
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8">

                        {/* ── Cart Items ─────────────────────── */}
                        <div className="flex-1 space-y-4">
                            {cart.items.map(item => (
                                <CartItemCard
                                    key={item.id}
                                    item={item}
                                    onUpdate={updateItem}
                                    onRemove={removeItem}
                                    loading={loading}
                                />
                            ))}

                            {/* Continue Shopping */}
                            <Link
                                to="/products"
                                className="inline-flex items-center gap-2 text-pink-500 font-medium hover:underline mt-4"
                            >
                                ← Continue Shopping
                            </Link>
                        </div>

                        {/* ── Order Summary ──────────────────── */}
                        <div className="lg:w-96">
                            <div className="bg-white rounded-3xl shadow-sm p-6 sticky top-24">
                                <h2 className="text-xl font-bold text-gray-800 mb-6">
                                    Order Summary
                                </h2>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Subtotal ({cart.total_items} items)</span>
                                        <span>₹{Number(cart.total_compare_price).toLocaleString('en-IN')}</span>
                                    </div>
                                    {cart.total_discount > 0 && (
                                        <div className="flex justify-between text-sm text-green-600 font-medium">
                                            <span>Discount</span>
                                            <span>− ₹{Number(cart.total_discount).toLocaleString('en-IN')}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Delivery</span>
                                        <span className={Number(cart.total_price) >= 999 ? 'text-green-600 font-medium' : ''}>
                                            {Number(cart.total_price) >= 999 ? 'FREE' : '₹99'}
                                        </span>
                                    </div>
                                    <div className="border-t border-gray-100 pt-3">
                                        <div className="flex justify-between font-bold text-lg text-gray-800">
                                            <span>Total</span>
                                            <span className="text-pink-600">
                                                ₹{(
                                                    Number(cart.total_price) +
                                                    (Number(cart.total_price) >= 999 ? 0 : 99)
                                                ).toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                        {Number(cart.total_price) < 999 && (
                                            <p className="text-xs text-gray-400 mt-1">
                                                Add ₹{(999 - Number(cart.total_price)).toLocaleString('en-IN')} more for free delivery
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Savings Banner */}
                                {cart.total_discount > 0 && (
                                    <div className="bg-green-50 border border-green-100 rounded-2xl px-4 py-3 mb-6 text-center">
                                        <p className="text-green-700 text-sm font-semibold">
                                            🎉 You save ₹{Number(cart.total_discount).toLocaleString('en-IN')} on this order!
                                        </p>
                                    </div>
                                )}

                                {/* Checkout Button — Module 4 */}
                                <button
                                    onClick={() => navigate('/checkout')}
                                    className="w-full bg-pink-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-pink-600 transition-colors shadow-lg hover:shadow-pink-200"
                                >
                                    Proceed to Checkout →
                                </button>

                                {/* Trust Badges */}
                                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                                    {[
                                        { icon: '🔒', text: 'Secure' },
                                        { icon: '↩️', text: 'Easy Return' },
                                        { icon: '🚚', text: 'Fast Delivery' },
                                    ].map(badge => (
                                        <div key={badge.text} className="text-xs text-gray-400">
                                            <div className="text-lg">{badge.icon}</div>
                                            {badge.text}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Cart Item Card ───────────────────────────────────────────
const CartItemCard = ({ item, onUpdate, onRemove, loading }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm p-4 flex gap-4">

            {/* Product Image */}
            <Link to={`/products/${item.product.id}`} className="flex-shrink-0">
                <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden">
                    {item.product.image ? (
                        <img
                            src={`http://localhost:8000${item.product.image}`}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">
                            🛍️
                        </div>
                    )}
                </div>
            </Link>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs text-pink-500 font-medium">
                            {item.product.category_name}
                        </p>
                        <Link
                            to={`/products/${item.product.id}`}
                            className="font-semibold text-gray-800 hover:text-pink-500 transition-colors line-clamp-2 text-sm leading-snug"
                        >
                            {item.product.name}
                        </Link>
                    </div>
                    {/* Remove Button */}
                    <button
                        onClick={() => onRemove(item.id)}
                        disabled={loading}
                        className="text-gray-400 hover:text-red-500 transition-colors ml-2 flex-shrink-0"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                {/* Price */}
                <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-gray-900">
                        ₹{Number(item.product.price).toLocaleString('en-IN')}
                    </span>
                    {item.product.compare_price && (
                        <span className="text-xs text-gray-400 line-through">
                            ₹{Number(item.product.compare_price).toLocaleString('en-IN')}
                        </span>
                    )}
                </div>

                {/* Quantity + Subtotal */}
                <div className="flex items-center justify-between mt-3">
                    {/* Quantity Control */}
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                        <button
                            onClick={() => {
                                if (item.quantity > 1) onUpdate(item.id, item.quantity - 1);
                                else onRemove(item.id);
                            }}
                            disabled={loading}
                            className="px-3 py-1 text-lg font-bold hover:bg-gray-100 transition-colors disabled:opacity-50"
                        >
                            −
                        </button>
                        <span className="px-3 py-1 font-semibold text-gray-800 min-w-[2.5rem] text-center text-sm">
                            {item.quantity}
                        </span>
                        <button
                            onClick={() => onUpdate(item.id, item.quantity + 1)}
                            disabled={loading}
                            className="px-3 py-1 text-lg font-bold hover:bg-gray-100 transition-colors disabled:opacity-50"
                        >
                            +
                        </button>
                    </div>

                    {/* Subtotal */}
                    <span className="font-bold text-pink-600">
                        ₹{Number(item.subtotal).toLocaleString('en-IN')}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
