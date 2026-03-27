import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { placeOrder } from '../api/orderApi'
import { useRazorpay } from '../utils/useRazorpay'
import Input from '../components/common/Input'

const CheckoutPage = () => {
  const navigate            = useNavigate()
  const { cart, fetchCart } = useCart()
  const { user }            = useAuth()
  const { initiatePayment } = useRazorpay()

  const [loading, setLoading]         = useState(false)
  const [errors, setErrors]           = useState({})
  const [paymentMethod, setPaymentMethod] = useState('online')

  const [formData, setFormData] = useState({
    full_name:     `${user?.first_name || ''} ${user?.last_name || ''}`.trim(),
    phone:         user?.phone_number || '',
    address_line1: '',
    address_line2: '',
    city:          '',
    state:         '',
    pincode:       '',
    notes:         '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.full_name)
      newErrors.full_name = 'Required'
    if (!formData.phone)
      newErrors.phone = 'Required'
    else if (!/^\d{10}$/.test(formData.phone))
      newErrors.phone = 'Enter valid 10-digit number'
    if (!formData.address_line1)
      newErrors.address_line1 = 'Required'
    if (!formData.city)
      newErrors.city = 'Required'
    if (!formData.state)
      newErrors.state = 'Required'
    if (!formData.pincode)
      newErrors.pincode = 'Required'
    else if (!/^\d{6}$/.test(formData.pincode))
      newErrors.pincode = 'Enter valid 6-digit pincode'
    return newErrors
  }

  const handlePlaceOrder = async () => {
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      toast.error('Please fill all required fields.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setLoading(true)

    try {
      const orderData   = await placeOrder(formData)
      const orderNumber = orderData.order_number

      await fetchCart()

      if (paymentMethod === 'cod') {
        toast.success('Order placed successfully.')
        navigate(`/orders/${orderNumber}`)
        return
      }

      setLoading(false)

      await initiatePayment({
        orderNumber,
        onSuccess: () => {
          navigate(`/orders/${orderNumber}?payment=success`)
        },
        onFailure: () => {
          navigate(`/orders/${orderNumber}?payment=failed`)
        },
      })
    } catch (error) {
      const serverErrors = error.response?.data
      if (serverErrors?.error) {
        toast.error(serverErrors.error)
      } else if (typeof serverErrors === 'object') {
        setErrors(serverErrors)
        toast.error('Please fix the errors below.')
      } else {
        toast.error('Failed to place order. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6">
        <div className="w-20 h-20 border border-luxury-gray flex items-center justify-center">
          <svg className="w-8 h-8 text-luxury-midgray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
          </svg>
        </div>
        <p className="font-serif text-3xl text-luxury-midgray">Your bag is empty</p>
        <Link
          to="/products"
          className="bg-black text-white text-xs tracking-widest uppercase px-10 py-4 hover:bg-luxury-darkgray transition-all"
        >
          Continue Shopping
        </Link>
      </div>
    )
  }

  const deliveryCharge = Number(cart.total_price) >= 999 ? 0 : 99
  const grandTotal     = Number(cart.total_price) + deliveryCharge

  return (
    <div className="min-h-screen bg-white">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="border-b border-luxury-gray">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <p className="text-gold text-xs tracking-widest uppercase mb-1">Almost There</p>
          <h1 className="font-serif text-4xl font-normal text-black">Checkout</h1>
        </div>
      </div>

      {/* Steps Indicator */}
      <div className="border-b border-luxury-gray bg-luxury-offwhite">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-6">
          {[
            { n: '1', label: 'Bag',      done: true  },
            { n: '2', label: 'Delivery', done: false, active: true },
            { n: '3', label: 'Payment',  done: false },
          ].map((step, i) => (
            <div key={step.n} className="flex items-center gap-2">
              <div className={`w-5 h-5 flex items-center justify-center text-xs border ${
                step.active
                  ? 'bg-black border-black text-white'
                  : step.done
                  ? 'bg-gold border-gold text-black'
                  : 'border-luxury-midgray text-luxury-midgray'
              }`}>
                {step.done ? '✓' : step.n}
              </div>
              <span className={`text-xs tracking-widest uppercase ${
                step.active ? 'text-black font-medium' : 'text-luxury-midgray'
              }`}>
                {step.label}
              </span>
              {i < 2 && <span className="text-luxury-midgray ml-4">—</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-12">

          {/* ── Left — Forms ───────────────────────────── */}
          <div className="flex-1 space-y-8">

            {/* Delivery Address */}
            <div>
              <h2 className="font-serif text-2xl font-normal text-black mb-6 pb-3 border-b border-luxury-gray">
                Delivery Address
              </h2>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <Input
                    label="Full Name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    error={errors.full_name}
                    required
                  />
                  <Input
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10-digit number"
                    error={errors.phone}
                    required
                  />
                </div>

                <Input
                  label="Address Line 1"
                  name="address_line1"
                  value={formData.address_line1}
                  onChange={handleChange}
                  placeholder="House / Flat No, Street Name"
                  error={errors.address_line1}
                  required
                />

                <Input
                  label="Address Line 2 (Optional)"
                  name="address_line2"
                  value={formData.address_line2}
                  onChange={handleChange}
                  placeholder="Landmark, Area"
                />

                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Pune"
                    error={errors.city}
                    required
                  />
                  <Input
                    label="State"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Maharashtra"
                    error={errors.state}
                    required
                  />
                  <Input
                    label="Pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="411001"
                    error={errors.pincode}
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-medium tracking-widest uppercase text-luxury-darkgray block mb-1.5">
                    Order Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Any special instructions for delivery..."
                    rows={2}
                    className="w-full border-b-2 border-luxury-gray px-0 py-2.5 text-sm focus:outline-none focus:border-black transition-all resize-none tracking-wide placeholder-luxury-midgray"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <h2 className="font-serif text-2xl font-normal text-black mb-6 pb-3 border-b border-luxury-gray">
                Payment Method
              </h2>
              <div className="space-y-3">

                {/* Online Payment */}
                <label className={`flex items-center gap-5 p-5 border cursor-pointer transition-all ${
                  paymentMethod === 'online'
                    ? 'border-black bg-black text-white'
                    : 'border-luxury-gray hover:border-black'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="online"
                    checked={paymentMethod === 'online'}
                    onChange={() => setPaymentMethod('online')}
                    className="accent-white"
                  />
                  <div className="flex-1">
                    <p className={`text-xs tracking-widest uppercase font-medium ${
                      paymentMethod === 'online' ? 'text-white' : 'text-black'
                    }`}>
                      Pay Online
                    </p>
                    <p className={`text-xs tracking-wide mt-0.5 ${
                      paymentMethod === 'online' ? 'text-white/60' : 'text-luxury-midgray'
                    }`}>
                      UPI, Cards, Net Banking, Wallets via Razorpay
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    {['UPI', 'Card', 'NB'].map(m => (
                      <span key={m} className={`text-xs px-2 py-0.5 border ${
                        paymentMethod === 'online'
                          ? 'border-white/30 text-white/60'
                          : 'border-luxury-gray text-luxury-midgray'
                      }`}>
                        {m}
                      </span>
                    ))}
                  </div>
                </label>

                {/* Cash on Delivery */}
                <label className={`flex items-center gap-5 p-5 border cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-black bg-black text-white'
                    : 'border-luxury-gray hover:border-black'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="accent-white"
                  />
                  <div className="flex-1">
                    <p className={`text-xs tracking-widest uppercase font-medium ${
                      paymentMethod === 'cod' ? 'text-white' : 'text-black'
                    }`}>
                      Cash on Delivery
                    </p>
                    <p className={`text-xs tracking-wide mt-0.5 ${
                      paymentMethod === 'cod' ? 'text-white/60' : 'text-luxury-midgray'
                    }`}>
                      Pay when your order arrives
                    </p>
                  </div>
                  <span className={`text-xs tracking-widest uppercase px-2 py-0.5 border ${
                    paymentMethod === 'cod'
                      ? 'border-white/30 text-white/60'
                      : 'border-luxury-gray text-luxury-midgray'
                  }`}>
                    Available
                  </span>
                </label>

              </div>
            </div>

          </div>

          {/* ── Right — Order Summary ───────────────────── */}
          <div className="lg:w-96 flex-shrink-0">
            <div className="border border-luxury-gray p-6 sticky top-24">

              <h2 className="font-serif text-xl font-normal mb-6 pb-4 border-b border-luxury-gray">
                Order Summary
              </h2>

              {/* Items */}
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
                {cart.items.map(item => (
                  <div key={item.id} className="flex gap-3 items-center">
                    <div className="w-12 h-14 bg-luxury-offwhite overflow-hidden flex-shrink-0">
                      {item.product.image ? (
                        <img
                          src={`http://localhost:8000${item.product.image}`}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center opacity-20 text-lg">◈</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-black tracking-wide truncate">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-luxury-midgray tracking-wide mt-0.5">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-black flex-shrink-0">
                      ₹{Number(item.subtotal).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-luxury-gray pt-4 space-y-2.5">
                <div className="flex justify-between text-xs text-luxury-midgray tracking-wide">
                  <span>Subtotal</span>
                  <span>₹{Number(cart.total_price).toLocaleString('en-IN')}</span>
                </div>
                {cart.total_discount > 0 && (
                  <div className="flex justify-between text-xs text-black tracking-wide">
                    <span>You Save</span>
                    <span>− ₹{Number(cart.total_discount).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-luxury-midgray tracking-wide">
                  <span>Delivery</span>
                  <span className={deliveryCharge === 0 ? 'text-black' : ''}>
                    {deliveryCharge === 0 ? 'Free' : `₹${deliveryCharge}`}
                  </span>
                </div>
                <div className="flex justify-between border-t border-luxury-gray pt-3 mt-3">
                  <span className="text-xs tracking-widest uppercase font-medium">Total</span>
                  <span className="font-serif text-xl text-black">
                    ₹{grandTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className={`mt-6 w-full py-4 text-xs tracking-widest uppercase font-medium transition-all ${
                  loading
                    ? 'bg-luxury-midgray text-white cursor-not-allowed'
                    : 'bg-black text-white hover:bg-luxury-darkgray'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Processing...
                  </span>
                ) : paymentMethod === 'online'
                  ? `Pay ₹${grandTotal.toLocaleString('en-IN')}`
                  : `Place Order — ₹${grandTotal.toLocaleString('en-IN')}`
                }
              </button>

              {/* Security */}
              <div className="mt-4 flex items-center justify-center gap-2">
                <div className="w-px h-3 bg-luxury-gray"/>
                <p className="text-xs text-luxury-midgray tracking-widest">
                  🔒 Secured by Razorpay
                </p>
                <div className="w-px h-3 bg-luxury-gray"/>
              </div>

              {/* Trust */}
              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-luxury-gray pt-4">
                {[
                  { icon: '◈', text: 'Premium' },
                  { icon: '↩️', text: 'Returns' },
                  { icon: '◇', text: 'Secure'  },
                ].map(b => (
                  <div key={b.text} className="text-center">
                    <p className="text-sm mb-1 text-gold">{b.icon}</p>
                    <p className="text-xs tracking-widest uppercase text-luxury-midgray">{b.text}</p>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default CheckoutPage