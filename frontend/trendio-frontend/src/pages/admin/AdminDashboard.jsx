import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getDashboardStats } from '../../api/adminApi';

const StatCard = ({ icon, label, value, sub, color }) => (
    <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center gap-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-gray-500 text-sm">{label}</p>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
    </div>
);

const statusStyles = {
    pending:    'bg-yellow-100 text-yellow-700',
    confirmed:  'bg-blue-100 text-blue-700',
    processing: 'bg-purple-100 text-purple-700',
    shipped:    'bg-orange-100 text-orange-700',
    delivered:  'bg-green-100 text-green-700',
    cancelled:  'bg-red-100 text-red-700',
};

const AdminDashboard = () => {
    const [stats, setStats]   = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getDashboardStats()
            .then(setStats)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <AdminLayout title="Dashboard">
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"/>
            </div>
        </AdminLayout>
    );

    return (
        <AdminLayout
            title="Dashboard"
            subtitle="Welcome back! Here's what's happening with Trendio."
        >
            {/* ── Stats Grid ─────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    icon="💰"
                    label="Total Revenue"
                    value={`₹${Number(stats?.revenue?.total || 0).toLocaleString('en-IN')}`}
                    sub="From confirmed orders"
                    color="bg-green-100"
                />
                <StatCard
                    icon="📦"
                    label="Total Orders"
                    value={stats?.orders?.total || 0}
                    sub={`${stats?.orders?.pending || 0} pending`}
                    color="bg-blue-100"
                />
                <StatCard
                    icon="👕"
                    label="Products"
                    value={stats?.products?.active || 0}
                    sub={`${stats?.products?.out_of_stock || 0} out of stock`}
                    color="bg-purple-100"
                />
                <StatCard
                    icon="👥"
                    label="Customers"
                    value={stats?.users?.total || 0}
                    sub="Registered users"
                    color="bg-pink-100"
                />
            </div>

            {/* ── Order Status Breakdown ─────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="font-bold text-gray-800 mb-4">Order Status Breakdown</h2>
                    <div className="space-y-3">
                        {[
                            { label: 'Pending',   value: stats?.orders?.pending,   color: 'bg-yellow-400' },
                            { label: 'Confirmed', value: stats?.orders?.confirmed, color: 'bg-blue-400'   },
                            { label: 'Shipped',   value: stats?.orders?.shipped,   color: 'bg-orange-400' },
                            { label: 'Delivered', value: stats?.orders?.delivered, color: 'bg-green-400'  },
                            { label: 'Cancelled', value: stats?.orders?.cancelled, color: 'bg-red-400'    },
                        ].map(item => {
                            const total = stats?.orders?.total || 1;
                            const pct   = Math.round(((item.value || 0) / total) * 100);
                            return (
                                <div key={item.label}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600 font-medium">{item.label}</span>
                                        <span className="text-gray-800 font-bold">{item.value || 0}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${item.color} transition-all duration-500`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="font-bold text-gray-800 mb-4">Quick Stats</h2>
                    <div className="space-y-4">
                        {[
                            { icon: '📂', label: 'Categories',        value: stats?.categories?.total    },
                            { icon: '⭐', label: 'Featured Products',  value: stats?.products?.featured   },
                            { icon: '🚫', label: 'Out of Stock',       value: stats?.products?.out_of_stock },
                            { icon: '✅', label: 'Active Products',    value: stats?.products?.active     },
                        ].map(item => (
                            <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50">
                                <span className="flex items-center gap-2 text-sm text-gray-600">
                                    <span>{item.icon}</span> {item.label}
                                </span>
                                <span className="font-bold text-gray-800">{item.value || 0}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Recent Orders ──────────────────────────── */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-gray-800">Recent Orders</h2>
                    <a href="/admin/orders" className="text-pink-500 text-sm hover:underline">
                        View All →
                    </a>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-400 border-b border-gray-100">
                                <th className="pb-3 font-medium">Order</th>
                                <th className="pb-3 font-medium">Customer</th>
                                <th className="pb-3 font-medium">Status</th>
                                <th className="pb-3 font-medium text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {stats?.recent_orders?.map(order => (
                                <tr key={order.order_number} className="hover:bg-gray-50">
                                    <td className="py-3 font-medium text-gray-800">
                                        {order.order_number}
                                    </td>
                                    <td className="py-3 text-gray-500">{order.user_email}</td>
                                    <td className="py-3">
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${statusStyles[order.status]}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="py-3 font-bold text-gray-800 text-right">
                                        ₹{Number(order.grand_total).toLocaleString('en-IN')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </AdminLayout>
    );
};

export default AdminDashboard;