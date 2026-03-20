import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders } from '../api/orderApi';
import { Toaster } from 'react-hot-toast';

const statusStyles = {
    pending:    'bg-yellow-100 text-yellow-700',
    confirmed:  'bg-blue-100 text-blue-700',
    processing: 'bg-purple-100 text-purple-700',
    shipped:    'bg-orange-100 text-orange-700',
    delivered:  'bg-green-100 text-green-700',
    cancelled:  'bg-red-100 text-red-700',
};

const OrdersPage = () => {
    const [orders, setOrders]   = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMyOrders()
            .then(setOrders)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"/>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <Toaster position="top-right" />
            <div className="max-w-4xl mx-auto px-4">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>
                    <p className="text-gray-500 mt-1">
                        {orders.length === 0
                            ? 'No orders yet'
                            : `${orders.length} order${orders.length !== 1 ? 's' : ''} placed`
                        }
                    </p>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-3xl shadow-sm p-16 text-center">
                        <div className="text-8xl mb-6">📦</div>
                        <h2 className="text-2xl font-bold text-gray-700 mb-3">No orders yet</h2>
                        <p className="text-gray-400 mb-8">Start shopping to see your orders here.</p>
                        <Link
                            to="/products"
                            className="bg-pink-500 text-white px-8 py-3 rounded-2xl font-semibold hover:bg-pink-600"
                        >
                            Start Shopping →
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map(order => (
                            <OrderCard key={order.id} order={order} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const OrderCard = ({ order }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row justify-between gap-4">

                {/* Left Side */}
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-gray-800">{order.order_number}</h3>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusStyles[order.status]}`}>
                            {order.status_display_info?.icon} {order.status_display}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500">
                        {order.item_count} item{order.item_count !== 1 ? 's' : ''} •
                        Delivering to {order.city}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'long', year: 'numeric'
                        })}
                    </p>
                </div>

                {/* Right Side */}
                <div className="flex flex-col sm:items-end gap-2">
                    <span className="text-xl font-bold text-pink-600">
                        ₹{Number(order.grand_total).toLocaleString('en-IN')}
                    </span>
                    <Link
                        to={`/orders/${order.order_number}`}
                        className="bg-pink-500 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-pink-600 transition-colors text-center"
                    >
                        View Details →
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default OrdersPage;