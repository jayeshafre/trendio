import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import AdminLayout from '../../components/admin/AdminLayout';
import { getAdminOrders, updateOrderStatus } from '../../api/adminApi';

const statusStyles = {
    pending:    'bg-yellow-100 text-yellow-700',
    confirmed:  'bg-blue-100 text-blue-700',
    processing: 'bg-purple-100 text-purple-700',
    shipped:    'bg-orange-100 text-orange-700',
    delivered:  'bg-green-100 text-green-700',
    cancelled:  'bg-red-100 text-red-700',
};

const statusOptions = [
    'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'
];

const AdminOrders = () => {
    const [orders, setOrders]         = useState([]);
    const [loading, setLoading]       = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [updating, setUpdating]     = useState(null);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await getAdminOrders(statusFilter);
            setOrders(Array.isArray(data) ? data : data.results || []);
        } catch {
            toast.error('Failed to load orders.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, [statusFilter]);

    const handleStatusUpdate = async (orderNumber, newStatus) => {
        setUpdating(orderNumber);
        try {
            await updateOrderStatus(orderNumber, newStatus);
            toast.success(`Order status updated to "${newStatus}".`);
            fetchOrders();
        } catch (error) {
            toast.error('Failed to update status.');
        } finally {
            setUpdating(null);
        }
    };

    return (
        <AdminLayout
            title="Orders"
            subtitle={`${orders.length} orders`}
        >
            <Toaster position="top-right" />

            {/* Filter Bar */}
            <div className="flex gap-2 mb-6 flex-wrap">
                <button
                    onClick={() => setStatusFilter('')}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                        statusFilter === ''
                            ? 'bg-pink-500 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                >
                    All Orders
                </button>
                {statusOptions.map(s => (
                    <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-colors ${
                            statusFilter === s
                                ? 'bg-pink-500 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {/* Orders Table */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-pink-500 border-t-transparent"/>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr className="text-left text-gray-500">
                                <th className="px-6 py-4 font-medium">Order</th>
                                <th className="px-6 py-4 font-medium">Customer</th>
                                <th className="px-6 py-4 font-medium">Items</th>
                                <th className="px-6 py-4 font-medium">Amount</th>
                                <th className="px-6 py-4 font-medium">Date</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Update</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {orders.map(order => (
                                <tr key={order.id} className="hover:bg-gray-50 transition-colors">

                                    {/* Order Number */}
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-800 text-xs">
                                            {order.order_number}
                                        </p>
                                    </td>

                                    {/* Customer */}
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-gray-700">{order.full_name}</p>
                                        <p className="text-xs text-gray-400">{order.city}</p>
                                    </td>

                                    {/* Items */}
                                    <td className="px-6 py-4 text-gray-600">
                                        {order.item_count} item{order.item_count !== 1 ? 's' : ''}
                                    </td>

                                    {/* Amount */}
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-800">
                                            ₹{Number(order.grand_total).toLocaleString('en-IN')}
                                        </p>
                                    </td>

                                    {/* Date */}
                                    <td className="px-6 py-4 text-gray-500 text-xs">
                                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                                            day: 'numeric', month: 'short', year: 'numeric'
                                        })}
                                    </td>

                                    {/* Status */}
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${statusStyles[order.status]}`}>
                                            {order.status}
                                        </span>
                                    </td>

                                    {/* Update Status */}
                                    <td className="px-6 py-4">
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleStatusUpdate(order.order_number, e.target.value)}
                                            disabled={updating === order.order_number}
                                            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-60"
                                        >
                                            {statusOptions.map(s => (
                                                <option key={s} value={s} className="capitalize">{s}</option>
                                            ))}
                                        </select>
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {orders.length === 0 && (
                        <div className="text-center py-16 text-gray-400">
                            <p className="text-4xl mb-2">📦</p>
                            <p>No orders found.</p>
                        </div>
                    )}
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminOrders;