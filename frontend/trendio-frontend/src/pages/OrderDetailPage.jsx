import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast'
import { getOrderDetail, cancelOrder } from '../api/orderApi'
import { getPaymentStatus } from '../api/paymentApi'
import { useRazorpay } from '../utils/useRazorpay'

const statusStyles = {
  pending:    { pill: 'bg-yellow-50 text-yellow-700', bar: 'bg-yellow-400' },
  confirmed:  { pill: 'bg-blue-50 text-blue-700',    bar: 'bg-blue-400'   },
  processing: { pill: 'bg-purple-50 text-purple-700', bar: 'bg-purple-400' },
  shipped:    { pill: 'bg-orange-50 text-orange-700', bar: 'bg-orange-400' },
  delivered:  { pill: 'bg-green-50 text-green-700',  bar: 'bg-green-500'  },
  cancelled:  { pill: 'bg-red-50 text-red-700',      bar: 'bg-red-400'    },
}

const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']

const OrderDetailPage = () => {
  const { orderNumber }     = useParams()
  const navigate            = useNavigate()
  const [searchParams]      = useSearchParams()
  const { initiatePayment } = useRazorpay()

  const [order, setOrder]           = useState(null)
  const [loading, setLoading]       = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState(null)

  const paymentResult = searchParams.get('payment')

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await getOrderDetail(orderNumber)
        setOrder(data)
      } catch {
        toast.error('Order not found.')
        navigate('/orders')
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [orderNumber])

  useEffect(() => {
    if (order) {
      getPaymentStatus(order.order_number)
        .then(setPaymentStatus)
        .catch(console.error)
    }
  }, [order])

  const handleCancel = async () => {
    if (!window.confirm('Cancel this order?')) return
    setCancelling(true)
    try {
      const data = await cancelOrder(orderNumber)
      setOrder(data.order)
      toast.success('Order cancelled.')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Cancellation failed.')
    } finally {
      setCancelling(false)
    }
  }

  const handlePayNow = () => {
    initiatePayment({
      orderNumber: order.order_number,
      onSuccess: () => {
        window.location.href = `/orders/${order.order_number}?payment=success`
      },
      onFailure: () => {
        toast.error('Payment failed. Please try again.')
      }
    })
  }

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-px h-16 bg-gold animate-pulse"/>
        <p className="text-xs tracking-widest uppercase text-luxury-midgray">Loading Order</p>
      </div>
    </div>
  )

  if (!order) return null

  const style       = statusStyles[order.status] || statusStyles.pending
  const currentStep = statusSteps.indexOf(order.status)
  const showPayNow  = paymentStatus &&
    (paymentStatus.status === 'pending' || paymentStatus.status === 'failed') &&
    order.status !== 'cancelled'

  return (
    <div className="min-h-screen bg-white">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="border-b border-luxury-gray">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <Link
            to="/orders"
            className="text-xs tracking-widest uppercase text-luxury-midgray hover:text-black transition-colors flex items-center gap-2 mb-4 w-fit"
          >
            ← My Orders
          </Link>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-gold text-xs tracking-widest uppercase mb-1">Order Detail</p>
              <h1 className="font-serif text-3xl font-normal text-black">{order.order_number}</h1>
              <p className="text-luxury-midgray text-xs tracking-wide mt-1">
                Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'long', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}
              </p>
            </div>
            <span className={`text-xs tracking-widest uppercase px-4 py-2 border ${style.pill}`}>
              {order.status_display}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* ── Payment Result Banners ──────────────────────── */}
        {paymentResult === 'success' && (
          <div className="border-l-4 border-green-500 bg-green-50 px-6 py-4 mb-8 flex items-center gap-4">
            <span className="text-2xl">✓</span>
            <div>
              <p className="font-medium text-green-800 text-sm tracking-wide">Payment Successful</p>
              <p className="text-xs text-green-600 tracking-wide mt-0.5">
                Your order has been confirmed and is being processed.
              </p>
            </div>
          </div>
        )}

        {paymentResult === 'failed' && (
          <div className="border-l-4 border-red-400 bg-red-50 px-6 py-4 mb-8 flex items-center gap-4">
            <span className="text-2xl">×</span>
            <div>
              <p className="font-medium text-red-800 text-sm tracking-wide">Payment Failed</p>
              <p className="text-xs text-red-600 tracking-wide mt-0.5">
                Your order was placed but payment failed. Retry below.
              </p>
            </div>
          </div>
        )}

        {/* ── Progress Bar ─────────────────────────────────── */}
        {order.status !== 'cancelled' && (
          <div className="bg-luxury-offwhite border border-luxury-gray p-8 mb-8">
            <p className="text-xs tracking-widest uppercase text-luxury-midgray mb-8">Order Progress</p>
            <div className="relative">
              {/* Line */}
              <div className="absolute top-3 left-0 right-0 h-px bg-luxury-gray mx-8">
                <div
                  className="h-px bg-black transition-all duration-700"
                  style={{
                    width: `${Math.max(0, currentStep / (statusSteps.length - 1)) * 100}%`
                  }}
                />
              </div>

              {/* Steps */}
              <div className="flex items-start justify-between relative">
                {statusSteps.map((step, index) => {
                  const isDone    = index <= currentStep
                  const isCurrent = index === currentStep
                  return (
                    <div key={step} className="flex flex-col items-center z-10 flex-1">
                      <div className={`w-6 h-6 flex items-center justify-center text-xs border-2 transition-all ${
                        isDone
                          ? 'bg-black border-black text-white'
                          : 'bg-white border-luxury-gray text-luxury-midgray'
                      } ${isCurrent ? 'ring-2 ring-offset-2 ring-black' : ''}`}>
                        {isDone ? '✓' : ''}
                      </div>
                      <p className={`text-xs mt-2 tracking-widest uppercase text-center transition-colors ${
                        isDone ? 'text-black font-medium' : 'text-luxury-midgray'
                      }`}>
                        {step}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Cancelled Banner ─────────────────────────────── */}
        {order.status === 'cancelled' && (
          <div className="border border-red-200 bg-red-50 px-6 py-5 mb-8">
            <p className="text-xs tracking-widest uppercase font-medium text-red-700 mb-1">
              Order Cancelled
            </p>
            <p className="text-xs text-red-500 tracking-wide">
              This order has been cancelled. Stock has been restored.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left ─────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Order Items */}
            <div className="border border-luxury-gray">
              <div className="px-6 py-4 border-b border-luxury-gray">
                <h2 className="text-xs tracking-widest uppercase font-medium">
                  Items ({order.items.length})
                </h2>
              </div>
              <div className="divide-y divide-luxury-offwhite">
                {order.items.map(item => (
                  <div key={item.id} className="flex gap-4 px-6 py-5 items-center">

                    {/* Image */}
                    <div className="w-16 h-20 bg-luxury-offwhite overflow-hidden flex-shrink-0">
                      {item.product_image ? (
                        <img
                          src={`http://localhost:8000/${item.product_image}`}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center opacity-20 text-xl">◈</div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-black tracking-wide truncate">
                        {item.product_name}
                      </p>
                      <p className="text-xs text-luxury-midgray tracking-wide mt-1">
                        ₹{Number(item.product_price).toLocaleString('en-IN')} × {item.quantity}
                      </p>
                    </div>

                    {/* Subtotal */}
                    <p className="font-serif text-base text-black flex-shrink-0">
                      ₹{Number(item.subtotal).toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="border border-luxury-gray">
              <div className="px-6 py-4 border-b border-luxury-gray">
                <h2 className="text-xs tracking-widest uppercase font-medium">Delivery Address</h2>
              </div>
              <div className="px-6 py-5 text-sm text-luxury-darkgray space-y-1.5 tracking-wide">
                <p className="font-medium text-black">{order.full_name}</p>
                <p>{order.phone}</p>
                <p>{order.address_line1}</p>
                {order.address_line2 && <p>{order.address_line2}</p>}
                <p>{order.city}, {order.state} — {order.pincode}</p>
              </div>
              {order.notes && (
                <div className="mx-6 mb-5 bg-luxury-offwhite px-4 py-3 border-t border-luxury-gray">
                  <p className="text-xs tracking-widest uppercase text-luxury-midgray mb-1">
                    Special Instructions
                  </p>
                  <p className="text-xs text-luxury-darkgray tracking-wide">{order.notes}</p>
                </div>
              )}
            </div>

          </div>

          {/* ── Right ────────────────────────────────────── */}
          <div className="space-y-4">

            {/* Price Summary */}
            <div className="border border-luxury-gray">
              <div className="px-6 py-4 border-b border-luxury-gray">
                <h2 className="text-xs tracking-widest uppercase font-medium">Price Details</h2>
              </div>
              <div className="px-6 py-5 space-y-3">
                <div className="flex justify-between text-xs text-luxury-midgray tracking-wide">
                  <span>Order Amount</span>
                  <span>₹{Number(order.total_amount).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-xs text-luxury-midgray tracking-wide">
                  <span>Delivery</span>
                  <span className={Number(order.delivery_charge) === 0 ? 'text-black' : ''}>
                    {Number(order.delivery_charge) === 0 ? 'Free' : `₹${order.delivery_charge}`}
                  </span>
                </div>
                <div className="flex justify-between border-t border-luxury-gray pt-3 mt-1">
                  <span className="text-xs tracking-widest uppercase font-medium">Total</span>
                  <span className="font-serif text-xl text-black">
                    ₹{Number(order.grand_total).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Payment Status */}
              {paymentStatus?.status && (
                <div className={`mx-4 mb-4 px-4 py-2 text-center text-xs tracking-widest uppercase border ${
                  paymentStatus.status === 'success' ? 'border-green-200 bg-green-50 text-green-700' :
                  paymentStatus.status === 'failed'  ? 'border-red-200 bg-red-50 text-red-700' :
                  'border-yellow-200 bg-yellow-50 text-yellow-700'
                }`}>
                  {paymentStatus.status === 'success' && '✓ Payment Complete'}
                  {paymentStatus.status === 'failed'  && '× Payment Failed'}
                  {paymentStatus.status === 'pending' && '⏳ Payment Pending'}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {showPayNow && (
                <button
                  onClick={handlePayNow}
                  className="w-full bg-black text-white text-xs tracking-widest uppercase py-4 hover:bg-luxury-darkgray transition-all"
                >
                  Pay Now
                </button>
              )}

              {order.can_cancel && (
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="w-full border border-red-200 text-red-500 text-xs tracking-widest uppercase py-4 hover:bg-red-50 transition-all disabled:opacity-40"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Order'}
                </button>
              )}

              <Link
                to="/products"
                className="block w-full border border-luxury-gray text-black text-xs tracking-widest uppercase py-4 hover:border-black transition-all text-center"
              >
                Continue Shopping
              </Link>

              <Link
                to="/orders"
                className="block w-full text-center text-xs tracking-widest uppercase text-luxury-midgray hover:text-black transition-colors"
              >
                ← All Orders
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetailPage