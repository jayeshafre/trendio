import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { Toaster } from 'react-hot-toast'

const CartPage = () => {
  const navigate = useNavigate()
  const { cart, loading, updateItem, removeItem, emptyCart } = useCart()

  if (loading && !cart) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-px h-16 bg-gold animate-pulse"/>
        <p className="text-xs tracking-widest uppercase text-luxury-midgray">Loading</p>
      </div>
    </div>
  )

  const isEmpty = !cart || cart.items.length === 0
  const deliveryCharge = cart ? (Number(cart.total_price) >= 999 ? 0 : 99) : 0
  const grandTotal = cart ? Number(cart.total_price) + deliveryCharge : 0

  return (
    <div className="min-h-screen bg-white">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="border-b border-luxury-gray">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-gold text-xs tracking-widest uppercase mb-1">Shopping</p>
              <h1 className="font-serif text-4xl font-normal text-black">My Bag</h1>
            </div>
            {!isEmpty && (
              <button
                onClick={emptyCart}
                className="text-xs tracking-widest uppercase text-luxury-midgray hover:text-black transition-colors border-b border-luxury-midgray pb-0.5"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {isEmpty ? (
        <div className="max-w-7xl mx-auto px-6 py-24 text-center">
          <div className="w-20 h-20 border border-luxury-gray flex items-center justify-center mx-auto mb-8">
            <svg className="w-8 h-8 text-luxury-midgray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
            </svg>
          </div>
          <p className="font-serif text-3xl text-luxury-midgray mb-4">Your bag is empty</p>
          <p className="text-xs tracking-widest uppercase text-luxury-midgray mb-10">
            Discover our latest collections
          </p>
          <Link
            to="/products"
            className="bg-black text-white text-xs tracking-widest uppercase px-10 py-4 hover:bg-luxury-darkgray transition-all"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col lg:flex-row gap-12">

            {/* ── Cart Items ─────────────────────────────── */}
            <div className="flex-1">

              {/* Column Headers */}
              <div className="grid grid-cols-12 gap-4 pb-4 border-b border-luxury-gray mb-6">
                <div className="col-span-6">
                  <p className="text-xs tracking-widest uppercase text-luxury-midgray">Product</p>
                </div>
                <div className="col-span-2 text-center">
                  <p className="text-xs tracking-widest uppercase text-luxury-midgray">Price</p>
                </div>
                <div className="col-span-2 text-center">
                  <p className="text-xs tracking-widest uppercase text-luxury-midgray">Qty</p>
                </div>
                <div className="col-span-2 text-right">
                  <p className="text-xs tracking-widest uppercase text-luxury-midgray">Total</p>
                </div>
              </div>

              {/* Items */}
              <div className="divide-y divide-luxury-gray">
                {cart.items.map(item => (
                  <div key={item.id} className="grid grid-cols-12 gap-4 py-6 items-center">

                    {/* Product */}
                    <div className="col-span-6 flex gap-4">
                      <Link to={`/products/${item.product.id}`} className="flex-shrink-0">
                        <div className="w-20 h-24 bg-luxury-offwhite overflow-hidden">
                          {item.product.image ? (
                            <img
                              src={`http://localhost:8000${item.product.image}`}
                              alt={item.product.name}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl opacity-20">◈</div>
                          )}
                        </div>
                      </Link>
                      <div className="min-w-0 flex flex-col justify-center">
                        <p className="text-xs tracking-widest text-luxury-midgray uppercase mb-1">
                          {item.product.category_name}
                        </p>
                        <Link
                          to={`/products/${item.product.id}`}
                          className="font-medium text-sm text-black hover:text-gold transition-colors tracking-wide leading-snug"
                        >
                          {item.product.name}
                        </Link>
                        <button
                          onClick={() => removeItem(item.id)}
                          disabled={loading}
                          className="text-xs tracking-widest uppercase text-luxury-midgray hover:text-black transition-colors mt-3 text-left w-fit border-b border-luxury-midgray pb-0.5"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="col-span-2 text-center">
                      <p className="text-sm text-black">
                        ₹{Number(item.product.price).toLocaleString('en-IN')}
                      </p>
                    </div>

                    {/* Quantity */}
                    <div className="col-span-2 flex items-center justify-center">
                      <div className="flex items-center border border-luxury-gray">
                        <button
                          onClick={() => item.quantity > 1 ? updateItem(item.id, item.quantity - 1) : removeItem(item.id)}
                          disabled={loading}
                          className="w-8 h-8 flex items-center justify-center hover:bg-luxury-offwhite transition-colors text-sm disabled:opacity-40"
                        >
                          −
                        </button>
                        <span className="w-8 h-8 flex items-center justify-center text-xs font-medium border-x border-luxury-gray">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateItem(item.id, item.quantity + 1)}
                          disabled={loading}
                          className="w-8 h-8 flex items-center justify-center hover:bg-luxury-offwhite transition-colors text-sm disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="col-span-2 text-right">
                      <p className="text-sm font-medium text-black">
                        ₹{Number(item.subtotal).toLocaleString('en-IN')}
                      </p>
                    </div>

                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-luxury-gray">
                <Link
                  to="/products"
                  className="text-xs tracking-widest uppercase text-luxury-midgray hover:text-black transition-colors border-b border-luxury-midgray pb-0.5"
                >
                  ← Continue Shopping
                </Link>
              </div>
            </div>

            {/* ── Order Summary ──────────────────────────── */}
            <div className="lg:w-80 flex-shrink-0">
              <div className="border border-luxury-gray p-6 sticky top-24">
                <h2 className="font-serif text-xl font-normal mb-6 pb-4 border-b border-luxury-gray">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-xs tracking-wide text-luxury-midgray">
                    <span>Subtotal ({cart.total_items} items)</span>
                    <span>₹{Number(cart.total_compare_price).toLocaleString('en-IN')}</span>
                  </div>
                  {cart.total_discount > 0 && (
                    <div className="flex justify-between text-xs tracking-wide text-black">
                      <span>Discount</span>
                      <span>− ₹{Number(cart.total_discount).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs tracking-wide text-luxury-midgray">
                    <span>Delivery</span>
                    <span className={deliveryCharge === 0 ? 'text-black' : ''}>
                      {deliveryCharge === 0 ? 'Free' : `₹${deliveryCharge}`}
                    </span>
                  </div>
                  {deliveryCharge > 0 && (
                    <p className="text-xs text-luxury-midgray tracking-wide">
                      Add ₹{(999 - Number(cart.total_price)).toLocaleString('en-IN')} more for free delivery
                    </p>
                  )}
                </div>

                <div className="flex justify-between font-medium text-sm border-t border-luxury-gray pt-4 mb-6">
                  <span className="tracking-widest uppercase text-xs">Total</span>
                  <span className="font-serif text-xl">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>

                {cart.total_discount > 0 && (
                  <div className="bg-luxury-offwhite px-4 py-3 mb-6 text-center">
                    <p className="text-xs tracking-widest uppercase text-black">
                      You save ₹{Number(cart.total_discount).toLocaleString('en-IN')}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-black text-white text-xs tracking-widest uppercase py-4 hover:bg-luxury-darkgray transition-all"
                >
                  Proceed to Checkout
                </button>

                <div className="mt-6 flex justify-center gap-6">
                  {[
                    { icon: '🔒', text: 'Secure' },
                    { icon: '↩️', text: 'Returns' },
                    { icon: '◈', text: 'Premium' },
                  ].map(b => (
                    <div key={b.text} className="text-center">
                      <p className="text-base mb-1">{b.icon}</p>
                      <p className="text-xs text-luxury-midgray tracking-widest uppercase">{b.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}

export default CartPage