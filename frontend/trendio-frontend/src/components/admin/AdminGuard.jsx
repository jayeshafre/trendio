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

const StatCard = ({ icon, label, value, sub, accent }) => (
  <div className="bg-white border border-luxury-gray p-6">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-10 h-10 flex items-center justify-center text-xl ${accent || 'bg-luxury-offwhite'}`}>
        {icon}
      </div>
      <span className="text-xs tracking-widest uppercase text-luxury-midgray">{label}</span>
    </div>
    <p className="font-serif text-3xl font-normal text-black mb-1">{value}</p>
    {sub && <p className="text-xs text-luxury-midgray tracking-wide">{sub}</p>}
  </div>
)

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
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-px h-16 bg-gold animate-pulse"/>
          <p className="text-xs tracking-widest uppercase text-luxury-midgray">Loading</p>
        </div>
      </div>
    </AdminLayout>
  )

  return (
    <AdminLayout
      title="Dashboard"
      subtitle={`Overview — ${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}`}
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon="₹"
          label="Revenue"
          value={`₹${Number(stats?.revenue?.total || 0).toLocaleString('en-IN')}`}
          sub="From confirmed orders"
          accent="bg-gold/10 text-gold"
        />
        <StatCard
          icon="◈"
          label="Orders"
          value={stats?.orders?.total || 0}
          sub={`${stats?.orders?.pending || 0} pending`}
          accent="bg-black text-white"
        />
        <StatCard
          icon="◇"
          label="Products"
          value={stats?.products?.active || 0}
          sub={`${stats?.products?.out_of_stock || 0} out of stock`}
          accent="bg-luxury-offwhite text-black"
        />
        <StatCard
          icon="○"
          label="Customers"
          value={stats?.users?.total || 0}
          sub="Registered users"
          accent="bg-luxury-offwhite text-black"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Order Breakdown */}
        <div className="lg:col-span-1 bg-white border border-luxury-gray p-6">
          <h2 className="text-xs tracking-widest uppercase font-medium mb-6 pb-3 border-b border-luxury-gray">
            Order Status
          </h2>
          <div className="space-y-4">
            {[
              { label: 'Pending',   value: stats?.orders?.pending,   w: 'bg-yellow-400' },
              { label: 'Confirmed', value: stats?.orders?.confirmed, w: 'bg-blue-400'   },
              { label: 'Shipped',   value: stats?.orders?.shipped,   w: 'bg-orange-400' },
              { label: 'Delivered', value: stats?.orders?.delivered, w: 'bg-green-400'  },
              { label: 'Cancelled', value: stats?.orders?.cancelled, w: 'bg-red-400'    },
            ].map(item => {
              const total = stats?.orders?.total || 1
              const pct   = Math.round(((item.value || 0) / total) * 100)
              return (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="tracking-widest uppercase text-luxury-midgray">{item.label}</span>
                    <span className="font-medium text-black">{item.value || 0}</span>
                  </div>
                  <div className="w-full bg-luxury-offwhite h-1">
                    <div className={`h-1 ${item.w} transition-all duration-700`} style={{ width: `${pct}%` }}/>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="lg:col-span-1 bg-white border border-luxury-gray p-6">
          <h2 className="text-xs tracking-widest uppercase font-medium mb-6 pb-3 border-b border-luxury-gray">
            Quick Stats
          </h2>
          <div className="space-y-4">
            {[
              { label: 'Categories',       value: stats?.categories?.total,        icon: '□' },
              { label: 'Featured Products',value: stats?.products?.featured,       icon: '◈' },
              { label: 'Out of Stock',     value: stats?.products?.out_of_stock,   icon: '○' },
              { label: 'Active Products',  value: stats?.products?.active,         icon: '◇' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-luxury-offwhite">
                <span className="flex items-center gap-2 text-xs tracking-widest uppercase text-luxury-midgray">
                  <span className="text-gold">{item.icon}</span> {item.label}
                </span>
                <span className="font-serif text-lg text-black">{item.value || 0}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-1 bg-black p-6 flex flex-col">
          <h2 className="text-xs tracking-widest uppercase text-white/60 font-medium mb-6 pb-3 border-b border-white/10">
            Quick Actions
          </h2>
          <div className="space-y-3 flex-1">
            {[
              { to: '/admin/products',   label: 'Add New Product',   icon: '+' },
              { to: '/admin/categories', label: 'Add Category',       icon: '+' },
              { to: '/admin/orders',     label: 'View All Orders',    icon: '→' },
              { to: '/',                 label: 'View Storefront',    icon: '↗' },
            ].map(item => (
              <Link
                key={item.label}
                to={item.to}
                className="flex items-center justify-between text-xs tracking-widest uppercase text-white/60 hover:text-white py-2 border-b border-white/10 transition-colors group"
              >
                {item.label}
                <span className="group-hover:text-gold transition-colors">{item.icon}</span>
              </Link>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-white/10">
            <p className="text-xs text-white/30 tracking-widest uppercase">Trendio Admin v1.0</p>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
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
        <table className="w-full">
          <thead className="bg-luxury-offwhite">
            <tr>
              {['Order', 'Customer', 'Status', 'Amount'].map(h => (
                <th key={h} className="px-6 py-3 text-left text-xs tracking-widest uppercase text-luxury-midgray font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-luxury-offwhite">
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </AdminLayout>
  )
}

export default AdminDashboard