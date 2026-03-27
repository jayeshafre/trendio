import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getMyOrders } from '../api/orderApi'

const statusStyles = {
  pending:    'bg-yellow-50 text-yellow-700 border-yellow-200',
  confirmed:  'bg-blue-50 text-blue-700 border-blue-200',
  processing: 'bg-purple-50 text-purple-700 border-purple-200',
  shipped:    'bg-orange-50 text-orange-700 border-orange-200',
  delivered:  'bg-green-50 text-green-700 border-green-200',
  cancelled:  'bg-red-50 text-red-700 border-red-200',
}

const OrdersPage = () => {
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyOrders()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-white">

      {/* Header */}
      <div className="border-b border-luxury-gray">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <p className="text-gold text-xs tracking-widest uppercase mb-1">My Account</p>
          <h1 className="font-serif text-4xl font-normal text-black">My Orders</h1>
          <p className="text-luxury-midgray text-xs tracking-widest mt-2 uppercase">
            {loading ? '—' : `${orders.length} order${orders.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-px h-16 bg-gold animate-pulse"/>
              <p className="text-xs tracking-widest uppercase text-luxury-midgray">Loading</p>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 border border-luxury-gray flex items-center justify-center mx-auto mb-8">
              <svg className="w-8 h-8 text-luxury-midgray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
            <p className="font-serif text-3xl text-luxury-midgray mb-4">No orders yet</p>
            <p className="text-xs tracking-widest uppercase text-luxury-midgray mb-10">
              Start shopping to see your orders here
            </p>
            <Link
              to="/products"
              className="bg-black text-white text-xs tracking-widest uppercase px-10 py-4 hover:bg-luxury-darkgray transition-all"
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="space-y-px">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 py-3 border-b border-luxury-gray">
              <div className="col-span-4">
                <p className="text-xs tracking-widest uppercase text-luxury-midgray">Order</p>
              </div>
              <div className="col-span-2 text-center">
                <p className="text-xs tracking-widest uppercase text-luxury-midgray">Date</p>
              </div>
              <div className="col-span-2 text-center">
                <p className="text-xs tracking-widest uppercase text-luxury-midgray">Status</p>
              </div>
              <div className="col-span-2 text-center">
                <p className="text-xs tracking-widest uppercase text-luxury-midgray">Total</p>
              </div>
              <div className="col-span-2"/>
            </div>

            {orders.map(order => (
              <div
                key={order.id}
                className="grid grid-cols-12 gap-4 py-5 border-b border-luxury-gray items-center hover:bg-luxury-offwhite transition-colors"
              >
                {/* Order Number */}
                <div className="col-span-4">
                  <p className="text-xs font-medium text-black tracking-wide">{order.order_number}</p>
                  <p className="text-xs text-luxury-midgray mt-0.5 tracking-wide">
                    {order.item_count} item{order.item_count !== 1 ? 's' : ''} · {order.city}
                  </p>
                </div>

                {/* Date */}
                <div className="col-span-2 text-center">
                  <p className="text-xs text-luxury-midgray tracking-wide">
                    {new Date(order.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </p>
                </div>

                {/* Status */}
                <div className="col-span-2 text-center">
                  <span className={`text-xs tracking-widest uppercase px-3 py-1 border ${statusStyles[order.status]}`}>
                    {order.status}
                  </span>
                </div>

                {/* Total */}
                <div className="col-span-2 text-center">
                  <p className="font-serif text-base text-black">
                    ₹{Number(order.grand_total).toLocaleString('en-IN')}
                  </p>
                </div>

                {/* Action */}
                <div className="col-span-2 text-right">
                  <Link
                    to={`/orders/${order.order_number}`}
                    className="text-xs tracking-widest uppercase text-luxury-midgray hover:text-black transition-colors border-b border-luxury-midgray pb-0.5"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default OrdersPage