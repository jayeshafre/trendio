import React, { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { getDashboardStats } from '../../api/adminApi'
import { Link } from 'react-router-dom'

const statusStyles = {
  pending:    'bg-yellow-50 text-yellow-700',
  confirmed:  'bg-blue-50 text-blue-700',
  processing: 'bg-purple-50 text-purple-700',
  shipped:    'bg-orange-50 text-orange-700',
  delivered:  'bg-green-50 text-green-700',
  cancelled:  'bg-red-50 text-red-700',
}

const AdminDashboard = () => {
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <AdminLayout title="Dashboard">
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-4">
          <div className="w-px h-16 bg-gold animate-pulse"/>
          <p className="text-xs tracking-widest uppercase text-white/40">Loading</p>
        </div>
      </div>
    </AdminLayout>
  )

  return (
    <AdminLayout
      title="Dashboard"
      subtitle={new Date().toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      })}
    >
      {/* ── KPI Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

        {/* Revenue */}
        <div className="bg-black border border-white/10 p-6">
          <p className="text-xs tracking-widest uppercase text-white/40 mb-4">Revenue</p>
          <p className="font-serif text-3xl text-white font-normal">
            ₹{Number(stats?.revenue?.total || 0).toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-white/30 tracking-wide mt-2">From confirmed orders</p>
          <div className="w-8 h-px bg-gold mt-4"/>
        </div>

        {/* Orders */}
        <div className="bg-white border border-luxury-gray p-6">
          <p className="text-xs tracking-widest uppercase text-luxury-midgray mb-4">Orders</p>
          <p className="font-serif text-3xl text-black font-normal">
            {stats?.orders?.total || 0}
          </p>
          <p className="text-xs text-luxury-midgray tracking-wide mt-2">
            {stats?.orders?.pending || 0} pending
          </p>
          <div className="w-8 h-px bg-luxury-gray mt-4"/>
        </div>

        {/* Products */}
        <div className="bg-white border border-luxury-gray p-6">
          <p className="text-xs tracking-widest uppercase text-luxury-midgray mb-4">Products</p>
          <p className="font-serif text-3xl text-black font-normal">
            {stats?.products?.active || 0}
          </p>
          <p className="text-xs text-luxury-midgray tracking-wide mt-2">
            {stats?.products?.out_of_stock || 0} out of stock
          </p>
          <div className="w-8 h-px bg-luxury-gray mt-4"/>
        </div>

        {/* Customers */}
        <div className="bg-white border border-luxury-gray p-6">
          <p className="text-xs tracking-widest uppercase text-luxury-midgray mb-4">Customers</p>
          <p className="font-serif text-3xl text-black font-normal">
            {stats?.users?.total || 0}
          </p>
          <p className="text-xs text-luxury-midgray tracking-wide mt-2">Registered users</p>
          <div className="w-8 h-px bg-luxury-gray mt-4"/>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Order Status Breakdown */}
        <div className="lg:col-span-1 bg-white border border-luxury-gray p-6">
          <h2 className="text-xs tracking-widest uppercase font-medium mb-6 pb-3 border-b border-luxury-gray">
            Order Breakdown
          </h2>
          <div className="space-y-5">
            {[
              { label: 'Pending',   value: stats?.orders?.pending,   bar: 'bg-yellow-400' },
              { label: 'Confirmed', value: stats?.orders?.confirmed, bar: 'bg-blue-400'   },
              { label: 'Shipped',   value: stats?.orders?.shipped,   bar: 'bg-orange-400' },
              { label: 'Delivered', value: stats?.orders?.delivered, bar: 'bg-green-500'  },
              { label: 'Cancelled', value: stats?.orders?.cancelled, bar: 'bg-red-400'    },
            ].map(item => {
              const total = stats?.orders?.total || 1
              const pct   = Math.round(((item.value || 0) / total) * 100)
              return (
                <div key={item.label}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs tracking-widest uppercase text-luxury-midgray">
                      {item.label}
                    </span>
                    <span className="text-xs font-medium text-black">{item.value || 0}</span>
                  </div>
                  <div className="w-full bg-luxury-offwhite h-0.5">
                    <div
                      className={`h-0.5 ${item.bar} transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Inventory Stats */}
        <div className="lg:col-span-1 bg-white border border-luxury-gray p-6">
          <h2 className="text-xs tracking-widest uppercase font-medium mb-6 pb-3 border-b border-luxury-gray">
            Inventory
          </h2>
          <div className="space-y-4">
            {[
              { label: 'Categories',        value: stats?.categories?.total,      icon: '□' },
              { label: 'Active Products',   value: stats?.products?.active,       icon: '◈' },
              { label: 'Featured',          value: stats?.products?.featured,     icon: '◇' },
              { label: 'Out of Stock',      value: stats?.products?.out_of_stock, icon: '○' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-luxury-offwhite last:border-0">
                <span className="flex items-center gap-2 text-xs tracking-widest uppercase text-luxury-midgray">
                  <span className="text-gold text-sm">{item.icon}</span>
                  {item.label}
                </span>
                <span className="font-serif text-xl text-black">{item.value || 0}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-1 bg-black border border-white/10 p-6 flex flex-col">
          <h2 className="text-xs tracking-widest uppercase text-white/40 font-medium mb-6 pb-3 border-b border-white/10">
            Quick Actions
          </h2>
          <div className="space-y-1 flex-1">
            {[
              { to: '/admin/products',   label: 'Add New Product',  icon: '+' },
              { to: '/admin/categories', label: 'Add Category',      icon: '+' },
              { to: '/admin/orders',     label: 'Manage Orders',     icon: '→' },
              { to: '/',                 label: 'View Storefront',   icon: '↗' },
            ].map(item => (
              <Link
                key={item.label}
                to={item.to}
                className="flex items-center justify-between text-xs tracking-widest uppercase text-white/50 hover:text-white py-3 border-b border-white/5 last:border-0 transition-colors group"
              >
                {item.label}
                <span className="group-hover:text-gold transition-colors text-base">
                  {item.icon}
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-auto pt-4 border-t border-white/10">
            <p className="text-xs text-white/20 tracking-widest uppercase">
              TRENDIO ADMIN
            </p>
          </div>
        </div>

      </div>

      {/* Recent Orders Table */}
      <div className="bg-white border border-luxury-gray">
        <div className="flex items-center justify-between px-6 py-4 border-b border-luxury-gray">
          <h2 className="text-xs tracking-widest uppercase font-medium">Recent Orders</h2>
          <Link
            to="/admin/orders"
            className="text-xs tracking-widest uppercase text-luxury-midgray hover:text-black transition-colors border-b border-luxury-midgray pb-0.5"
          >
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-luxury-offwhite">
              <tr>
                {['Order', 'Customer', 'Status', 'Amount', 'Date'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs tracking-widest uppercase text-luxury-midgray font-normal">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-offwhite">
              {stats?.recent_orders?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-xs tracking-widest uppercase text-luxury-midgray">
                    No orders yet
                  </td>
                </tr>
              )}
              {stats?.recent_orders?.map(order => (
                <tr key={order.order_number} className="hover:bg-luxury-offwhite transition-colors">
                  <td className="px-6 py-4 text-xs font-medium text-black tracking-wide">
                    {order.order_number}
                  </td>
                  <td className="px-6 py-4 text-xs text-luxury-midgray tracking-wide">
                    {order.user_email}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs tracking-widest uppercase px-2 py-1 ${statusStyles[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-serif text-base text-black">
                    ₹{Number(order.grand_total).toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-xs text-luxury-midgray tracking-wide">
                    {new Date(order.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </AdminLayout>
  )
}

export default AdminDashboard