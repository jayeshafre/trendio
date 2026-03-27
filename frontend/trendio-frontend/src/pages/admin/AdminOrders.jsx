import React, { useState, useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import AdminLayout from '../../components/admin/AdminLayout'
import { getAdminOrders, updateOrderStatus } from '../../api/adminApi'

const statusStyles = {
  pending:    'bg-yellow-50 text-yellow-700',
  confirmed:  'bg-blue-50 text-blue-700',
  processing: 'bg-purple-50 text-purple-700',
  shipped:    'bg-orange-50 text-orange-700',
  delivered:  'bg-green-50 text-green-700',
  cancelled:  'bg-red-50 text-red-700',
}

const statusOptions = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

const AdminOrders = () => {
  const [orders, setOrders]             = useState([])
  const [loading, setLoading]           = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [updating, setUpdating]         = useState(null)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const data = await getAdminOrders(statusFilter)
      setOrders(Array.isArray(data) ? data : data.results || [])
    } catch {
      toast.error('Failed to load orders.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrders() }, [statusFilter])

  const handleStatusUpdate = async (orderNumber, newStatus) => {
    setUpdating(orderNumber)
    try {
      await updateOrderStatus(orderNumber, newStatus)
      toast.success(`Status updated to "${newStatus}".`)
      fetchOrders()
    } catch {
      toast.error('Failed to update status.')
    } finally {
      setUpdating(null)
    }
  }

  return (
    <AdminLayout
      title="Orders"
      subtitle={`${orders.length} orders`}
    >
      <Toaster position="top-right" />

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-6 border-b border-luxury-gray overflow-x-auto">
        <button
          onClick={() => setStatusFilter('')}
          className={`px-4 py-3 text-xs tracking-widest uppercase whitespace-nowrap transition-all border-b-2 ${
            statusFilter === ''
              ? 'border-black text-black'
              : 'border-transparent text-luxury-midgray hover:text-black'
          }`}
        >
          All
        </button>
        {statusOptions.map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-3 text-xs tracking-widest uppercase whitespace-nowrap transition-all border-b-2 ${
              statusFilter === s
                ? 'border-black text-black'
                : 'border-transparent text-luxury-midgray hover:text-black'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-px h-16 bg-gold animate-pulse"/>
        </div>
      ) : (
        <div className="bg-white border border-luxury-gray overflow-hidden">
          <table className="w-full">
            <thead className="bg-luxury-offwhite border-b border-luxury-gray">
              <tr>
                {['Order', 'Customer', 'Items', 'Amount', 'Date', 'Status', 'Update'].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-xs tracking-widest uppercase text-luxury-midgray font-normal">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-offwhite">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-luxury-offwhite transition-colors">

                  {/* Order */}
                  <td className="px-6 py-4">
                    <p className="text-xs font-medium text-black tracking-wide">{order.order_number}</p>
                  </td>

                  {/* Customer */}
                  <td className="px-6 py-4">
                    <p className="text-xs font-medium text-black tracking-wide">{order.full_name}</p>
                    <p className="text-xs text-luxury-midgray tracking-wide">{order.city}</p>
                  </td>

                  {/* Items */}
                  <td className="px-6 py-4 text-xs text-luxury-midgray tracking-widest">
                    {order.item_count}
                  </td>

                  {/* Amount */}
                  <td className="px-6 py-4">
                    <p className="font-serif text-base text-black">
                      ₹{Number(order.grand_total).toLocaleString('en-IN')}
                    </p>
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 text-xs text-luxury-midgray tracking-wide">
                    {new Date(order.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span className={`text-xs tracking-widest uppercase px-2 py-1 ${statusStyles[order.status]}`}>
                      {order.status}
                    </span>
                  </td>

                  {/* Update */}
                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order.order_number, e.target.value)}
                      disabled={updating === order.order_number}
                      className="text-xs tracking-widest uppercase border border-luxury-gray px-2 py-1.5 focus:outline-none focus:border-black transition-all bg-white disabled:opacity-40 cursor-pointer"
                    >
                      {statusOptions.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>

          {orders.length === 0 && (
            <div className="text-center py-16">
              <p className="text-xs tracking-widest uppercase text-luxury-midgray">No orders found</p>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminOrders