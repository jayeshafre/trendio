import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { getProductDetail } from '../api/productApi'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import toast from 'react-hot-toast'

const ProductDetailPage = () => {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const { isAuthenticated } = useAuth()
  const { addItem, loading: cartLoading } = useCart()

  const [product, setProduct]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [error, setError]       = useState('')
  const [activeTab, setActiveTab] = useState('description')

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductDetail(id)
        setProduct(data)
      } catch {
        setError('Product not found.')
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to your bag.')
      navigate('/login')
      return
    }
    await addItem(product.id, quantity)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-px h-16 bg-gold animate-pulse"/>
        <p className="text-xs tracking-widest uppercase text-luxury-midgray">Loading</p>
      </div>
    </div>
  )

  if (error || !product) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-white">
      <p className="font-serif text-3xl text-luxury-midgray">Product Not Found</p>
      <Link
        to="/products"
        className="text-xs tracking-widest uppercase border-b border-black pb-0.5 hover:text-gold hover:border-gold transition-colors"
      >
        Continue Shopping
      </Link>
    </div>
  )

  return (
    <div className="min-h-screen bg-white">
      <Toaster position="top-right" />

      {/* Breadcrumb */}
      <div className="border-b border-luxury-gray">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <nav className="flex items-center gap-2 text-xs tracking-widest uppercase text-luxury-midgray">
            <Link to="/" className="hover:text-gold transition-colors">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-gold transition-colors">Shop</Link>
            {product.category && (
              <>
                <span>/</span>
                <Link
                  to={`/products?category=${product.category.slug}`}
                  className="hover:text-gold transition-colors"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-black">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">

          {/* ── Image ────────────────────────────────────── */}
          <div className="relative">
            <div className="aspect-[3/4] overflow-hidden bg-luxury-offwhite">
              {product.image ? (
                <img
                  src={`http://localhost:8000${product.image}`}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-8xl opacity-10">◈</span>
                </div>
              )}
            </div>

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.discount_percentage > 0 && (
                <span className="bg-black text-white text-xs tracking-widest px-3 py-1">
                  -{product.discount_percentage}%
                </span>
              )}
              {product.is_featured && (
                <span className="bg-gold text-black text-xs tracking-widest px-3 py-1">
                  Featured
                </span>
              )}
            </div>
          </div>

          {/* ── Info ─────────────────────────────────────── */}
          <div className="flex flex-col justify-center">

            {/* Category */}
            {product.category && (
              <Link
                to={`/products?category=${product.category.slug}`}
                className="text-xs tracking-widest uppercase text-gold hover:text-gold-dark transition-colors mb-3"
              >
                {product.category.name}
              </Link>
            )}

            {/* Name */}
            <h1 className="font-serif text-4xl font-normal text-black leading-tight mb-4">
              {product.name}
            </h1>

            {/* Divider */}
            <div className="w-12 h-px bg-gold mb-6"/>

            {/* Price */}
            <div className="flex items-baseline gap-4 mb-8">
              <span className="font-serif text-3xl font-normal text-black">
                ₹{Number(product.price).toLocaleString('en-IN')}
              </span>
              {product.compare_price && (
                <span className="text-luxury-midgray line-through text-lg">
                  ₹{Number(product.compare_price).toLocaleString('en-IN')}
                </span>
              )}
              {product.discount_percentage > 0 && (
                <span className="text-xs tracking-widest text-gold uppercase">
                  {product.discount_percentage}% off
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="mb-8">
              {product.is_in_stock ? (
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-black rounded-full"/>
                  <span className="text-xs tracking-widest uppercase text-black">
                    In Stock — {product.stock} Available
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-luxury-midgray rounded-full"/>
                  <span className="text-xs tracking-widest uppercase text-luxury-midgray">
                    Sold Out
                  </span>
                </div>
              )}
            </div>

            {/* Quantity */}
            {product.is_in_stock && (
              <div className="mb-8">
                <p className="text-xs tracking-widest uppercase mb-3">Quantity</p>
                <div className="flex items-center border border-luxury-gray w-fit">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-luxury-offwhite transition-colors text-lg"
                  >
                    −
                  </button>
                  <span className="w-12 h-10 flex items-center justify-center text-sm font-medium border-x border-luxury-gray">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-luxury-offwhite transition-colors text-lg"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3 mb-10">
              <button
                onClick={handleAddToCart}
                disabled={!product.is_in_stock || cartLoading}
                className={`w-full py-4 text-xs tracking-widest uppercase font-medium transition-all duration-300 ${
                  product.is_in_stock
                    ? 'bg-black text-white hover:bg-luxury-darkgray'
                    : 'bg-luxury-gray text-luxury-midgray cursor-not-allowed'
                }`}
              >
                {cartLoading ? 'Adding...' : product.is_in_stock ? 'Add to Bag' : 'Sold Out'}
              </button>
              <button
                onClick={() => navigate('/products')}
                className="w-full py-4 text-xs tracking-widest uppercase font-medium border border-luxury-gray hover:border-black transition-all duration-300"
              >
                Continue Shopping
              </button>
            </div>

            {/* SKU */}
            {product.sku && (
              <p className="text-xs text-luxury-midgray tracking-widest mb-8">
                SKU: {product.sku}
              </p>
            )}

            {/* Tabs */}
            <div className="border-t border-luxury-gray pt-6">
              <div className="flex gap-6 mb-4">
                {['description', 'details', 'delivery'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`text-xs tracking-widest uppercase pb-2 transition-all ${
                      activeTab === tab
                        ? 'border-b border-black text-black'
                        : 'text-luxury-midgray hover:text-black'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="text-sm text-luxury-darkgray leading-relaxed tracking-wide">
                {activeTab === 'description' && (
                  <p>{product.description || 'Premium quality fashion piece from our latest collection.'}</p>
                )}
                {activeTab === 'details' && (
                  <ul className="space-y-1.5">
                    <li>• Premium quality materials</li>
                    <li>• Carefully crafted construction</li>
                    <li>• True to size fit</li>
                    <li>• Machine washable</li>
                  </ul>
                )}
                {activeTab === 'delivery' && (
                  <ul className="space-y-1.5">
                    <li>• Free shipping on orders above ₹999</li>
                    <li>• Standard delivery: 3-5 business days</li>
                    <li>• Express delivery available</li>
                    <li>• Easy 7-day returns</li>
                  </ul>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage