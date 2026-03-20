import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { getOrderDetail, cancelOrder } from '../api/orderApi';

const statusStyles = {
    pending:    { bg: 'bg-yellow-100', text: 'text-yellow-700', bar: 'bg-yellow-400' },
    confirmed:  { bg: 'bg-blue-100',   text: 'text-blue-700',   bar: 'bg-blue-400'   },
    processing: { bg: 'bg-purple-100', text: 'text-purple-700', bar: 'bg-purple-400' },
    shipped:    { bg: 'bg-orange-100', text: 'text-orange-700', bar: 'bg-orange-400' },
    delivered:  { bg: 'bg-green-100',  text: 'text-green-700',  bar: 'bg-green-400'  },
    cancelled:  { bg: 'bg-red-100',    text: 'text-red-700',    bar: 'bg-red-400'    },
};

const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const OrderDetailPage = () => {
    const { orderNumber } = useParams();
    const navigate        = useNavigate();
    const [order, setOrder]     = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        getOrderDetail(orderNumber)
            .then(setOrder)
            .catch(() => navigate('/orders'))
            .finally(() => setLoading(false));
    }, [orderNumber]);

    const handleCancel = async () => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;
        setCancelling(true);
        try {
            const data = await cancelOrder(orderNumber);
            setOrder(data.order);
            toast.success('Order cancelled successfully.');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Cancellation failed.');
        } finally {
            setCancelling(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"/>
        </div>
    );

    if (!order) return null;

    const style       = statusStyles[order.status] || statusStyles.pending;
    const currentStep = statusSteps.indexOf(order.status);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <Toaster position="top-right" />
            <div className="max-w-4xl mx-auto px-4">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Link to="/orders" className="text-pink-500 text-sm hover:underline mb-2 block">
                            ← Back to Orders
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-800">
                            {order.order_number}
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'long', year: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                            })}
                        </p>
                    </div>

                    {/* Status Badge */}
                    <div className={`px-4 py-2 rounded-2xl font-bold text-sm ${style.bg} ${style.text}`}>
                        {order.status_display_info?.icon} {order.status_display}
                    </div>
                </div>

                {/* ── Order Progress ────────────────────────── */}
                {order.status !== 'cancelled' && (
                    <div className="bg-white rounded-3xl shadow-sm p-6 mb-6">
                        <h2 className="font-bold text-gray-800 mb-6">Order Progress</h2>
                        <div className="flex items-center justify-between relative">
                            {/* Progress Line */}
                            <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 mx-8">
                                <div
                                    className="h-full bg-pink-500 transition-all duration-500"
                                    style={{ width: `${Math.max(0, currentStep / (statusSteps.length - 1)) * 100}%` }}
                                />
                            </div>

                            {statusSteps.map((step, index) => {
                                const isDone    = index <= currentStep;
                                const isCurrent = index === currentStep;
                                return (
                                    <div key={step} className="flex flex-col items-center relative z-10">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                                            isDone
                                                ? 'bg-pink-500 text-white'
                                                : 'bg-gray-200 text-gray-400'
                                        } ${isCurrent ? 'ring-4 ring-pink-200' : ''}`}>
                                            {isDone ? '✓' : index + 1}
                                        </div>
                                        <p className={`text-xs mt-2 capitalize font-medium ${
                                            isDone ? 'text-pink-500' : 'text-gray-400'
                                        }`}>
                                            {step}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ── Order Items ───────────────────────── */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white rounded-3xl shadow-sm p-6">
                            <h2 className="font-bold text-gray-800 mb-4">
                                Items Ordered ({order.items.length})
                            </h2>
                            <div className="space-y-4">
                                {order.items.map(item => (
                                    <div key={item.id} className="flex gap-4 items-center">
                                        <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                            {item.product_image ? (
                                                <img
                                                    src={`http://localhost:8000/${item.product_image}`}
                                                    alt={item.product_name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-2xl">🛍️</div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-800 truncate">
                                                {item.product_name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                ₹{Number(item.product_price).toLocaleString('en-IN')} × {item.quantity}
                                            </p>
                                        </div>
                                        <span className="font-bold text-gray-800 flex-shrink-0">
                                            ₹{Number(item.subtotal).toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Delivery Address */}
                        <div className="bg-white rounded-3xl shadow-sm p-6">
                            <h2 className="font-bold text-gray-800 mb-4">🚚 Delivery Address</h2>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p className="font-semibold text-gray-800">{order.full_name}</p>
                                <p>{order.phone}</p>
                                <p>{order.address_line1}</p>
                                {order.address_line2 && <p>{order.address_line2}</p>}
                                <p>{order.city}, {order.state} — {order.pincode}</p>
                            </div>
                            {order.notes && (
                                <div className="mt-3 bg-gray-50 rounded-xl p-3">
                                    <p className="text-xs text-gray-500 font-medium">Special Instructions:</p>
                                    <p className="text-sm text-gray-600 mt-1">{order.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Price Summary ─────────────────────── */}
                    <div className="space-y-4">
                        <div className="bg-white rounded-3xl shadow-sm p-6">
                            <h2 className="font-bold text-gray-800 mb-4">Price Details</h2>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>Order Amount</span>
                                    <span>₹{Number(order.total_amount).toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Delivery</span>
                                    <span className={order.delivery_charge == 0 ? 'text-green-600 font-medium' : ''}>
                                        {order.delivery_charge == 0 ? 'FREE' : `₹${order.delivery_charge}`}
                                    </span>
                                </div>
                                <div className="flex justify-between font-bold text-lg text-gray-800 border-t border-gray-100 pt-2 mt-2">
                                    <span>Grand Total</span>
                                    <span className="text-pink-600">
                                        ₹{Number(order.grand_total).toLocaleString('en-IN')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3">
                            {order.can_cancel && (
                                <button
                                    onClick={handleCancel}
                                    disabled={cancelling}
                                    className="w-full border-2 border-red-400 text-red-500 py-3 rounded-2xl font-semibold text-sm hover:bg-red-50 transition-colors disabled:opacity-60"
                                >
                                    {cancelling ? 'Cancelling...' : '❌ Cancel Order'}
                                </button>
                            )}
                            <Link
                                to="/products"
                                className="block w-full bg-pink-500 text-white py-3 rounded-2xl font-semibold text-sm hover:bg-pink-600 transition-colors text-center"
                            >
                                Continue Shopping →
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default OrderDetailPage;