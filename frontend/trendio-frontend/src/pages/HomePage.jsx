import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getFeaturedProducts, getCategories } from '../api/productApi'

// ─── Product Card ─────────────────────────────────────────────
export const ProductCard = ({ product }) => {
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      to={`/products/${product.id}`}
      className="group block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-luxury-offwhite aspect-[3/4]">
        {product.image ? (
          <img
            src={`http://localhost:8000${product.image}`}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl opacity-20">◈</span>
          </div>
        )}

        {/* Discount Badge */}
        {product.discount_percentage > 0 && (
          <div className="absolute top-3 left-3 bg-black text-white text-xs tracking-widest px-2 py-1">
            -{product.discount_percentage}%
          </div>
        )}

        {/* Out of Stock Overlay */}
        {!product.is_in_stock && (
          <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center">
            <span className="text-xs tracking-widest uppercase text-luxury-darkgray border border-luxury-darkgray px-4 py-2">
              Sold Out
            </span>
          </div>
        )}

        {/* Quick View Overlay */}
        <div className={`absolute bottom-0 left-0 right-0 bg-black text-white text-center py-3 text-xs tracking-widest uppercase transition-all duration-300 ${
          hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
        }`}>
          View Product
        </div>
      </div>

      {/* Info */}
      <div className="pt-3 pb-2">
        <p className="text-xs tracking-wider text-luxury-midgray uppercase mb-1">
          {product.category_name}
        </p>
        <h3 className="text-sm font-medium text-black tracking-wide leading-snug">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-sm font-medium text-black">
            ₹{Number(product.price).toLocaleString('en-IN')}
          </span>
          {product.compare_price && (
            <span className="text-xs text-luxury-midgray line-through">
              ₹{Number(product.compare_price).toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

// ─── Section Header ───────────────────────────────────────────
const SectionHeader = ({ eyebrow, title, subtitle, center = false }) => (
  <div className={`mb-12 ${center ? 'text-center' : ''}`}>
    {eyebrow && (
      <p className="text-xs tracking-widest uppercase text-gold mb-2">{eyebrow}</p>
    )}
    <h2 className="font-serif text-3xl md:text-4xl font-normal text-black leading-tight">
      {title}
    </h2>
    {subtitle && (
      <p className="text-sm text-luxury-midgray mt-3 max-w-md tracking-wide leading-relaxed">
        {subtitle}
      </p>
    )}
  </div>
)

// ─── Home Page ────────────────────────────────────────────────
const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [categories, setCategories]             = useState([])
  const [loading, setLoading]                   = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [products, cats] = await Promise.all([
          getFeaturedProducts(),
          getCategories()
        ])
        setFeaturedProducts(products)
        setCategories(cats)
      } catch (error) {
        console.error('Failed to fetch homepage data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="bg-white">

      {/* ── HERO SECTION ─────────────────────────────────── */}
      <section className="relative h-[92vh] bg-black overflow-hidden">

        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent z-10"/>
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1600&auto=format&fit=crop&q=80')`,
          }}
        />

        {/* Hero Content */}
        <div className="relative z-20 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="max-w-xl">
              <p className="text-gold text-xs tracking-widest uppercase mb-4">
                New Collection 2026
              </p>
              <h1 className="font-serif text-5xl md:text-7xl font-normal text-white leading-tight mb-6">
                Define Your<br />
                <em>Style Story</em>
              </h1>
              <p className="text-white/70 text-sm tracking-wide leading-relaxed mb-10 max-w-sm">
                Discover curated fashion that speaks to your individuality.
                Premium quality, timeless design.
              </p>
              <div className="flex gap-4">
                <Link
                  to="/products"
                  className="bg-white text-black text-xs tracking-widest uppercase px-8 py-4 hover:bg-gold hover:text-black transition-all duration-300"
                >
                  Shop Now
                </Link>
                <Link
                  to="/products?featured=true"
                  className="border border-white text-white text-xs tracking-widest uppercase px-8 py-4 hover:bg-white hover:text-black transition-all duration-300"
                >
                  New Arrivals
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
          <div className="w-px h-12 bg-white/30 animate-pulse"/>
          <p className="text-white/50 text-xs tracking-widest uppercase">Scroll</p>
        </div>
      </section>

      {/* ── CATEGORY STRIP ───────────────────────────────── */}
      <section className="border-b border-luxury-gray">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-3">
            {categories.map((cat, index) => {
              const catImages = {
                men:   'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&auto=format&fit=crop&q=80',
                women: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&auto=format&fit=crop&q=80',
                kids:  'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=800&auto=format&fit=crop&q=80',
              }
              return (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.slug}`}
                  className={`group relative overflow-hidden h-96 ${
                    index !== categories.length - 1 ? 'border-r border-luxury-gray' : ''
                  }`}
                >
                  {/* Image */}
                  <img
                    src={catImages[cat.slug] || catImages.men}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300"/>
                  {/* Label */}
                  <div className="absolute bottom-6 left-6">
                    <p className="text-white/70 text-xs tracking-widest uppercase mb-1">
                      {cat.product_count} Styles
                    </p>
                    <h3 className="font-serif text-3xl text-white font-normal">
                      {cat.name}
                    </h3>
                    <p className="text-white/80 text-xs tracking-widest uppercase mt-3 flex items-center gap-2">
                      Explore
                      <span className="inline-block transition-transform duration-300 group-hover:translate-x-2">→</span>
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <SectionHeader
          eyebrow="Handpicked For You"
          title="Featured Collection"
          subtitle="Carefully curated pieces that define modern elegance and timeless style."
        />

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="animate-pulse">
                <div className="bg-luxury-offwhite aspect-[3/4]"/>
                <div className="mt-3 space-y-2">
                  <div className="h-3 bg-luxury-gray rounded w-1/3"/>
                  <div className="h-4 bg-luxury-gray rounded w-3/4"/>
                  <div className="h-3 bg-luxury-gray rounded w-1/4"/>
                </div>
              </div>
            ))}
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-luxury-midgray text-sm tracking-wide">No featured products yet.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 4).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="text-center mt-12">
              <Link
                to="/products"
                className="inline-block border border-black text-black text-xs tracking-widest uppercase px-10 py-3 hover:bg-black hover:text-white transition-all duration-300"
              >
                View All Products
              </Link>
            </div>
          </>
        )}
      </section>

      {/* ── BRAND STATEMENT ──────────────────────────────── */}
      <section className="bg-black py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-gold text-xs tracking-widest uppercase mb-6">Our Philosophy</p>
          <h2 className="font-serif text-4xl md:text-5xl text-white font-normal leading-tight mb-6">
            "Fashion is the armor to<br />
            <em>survive everyday life."</em>
          </h2>
          <p className="text-white/50 text-sm tracking-widest uppercase">— Bill Cunningham</p>
          <div className="w-12 h-px bg-gold mx-auto mt-8"/>
        </div>
      </section>

      {/* ── NEW ARRIVALS BANNER ───────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-6">

          {/* Left Large */}
          <Link
            to="/products?category=women"
            className="group relative overflow-hidden h-[500px] bg-luxury-offwhite"
          >
            <img
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80"
              alt="Women's Collection"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-all duration-300"/>
            <div className="absolute bottom-8 left-8">
              <p className="text-white/80 text-xs tracking-widest uppercase mb-2">New Season</p>
              <h3 className="font-serif text-3xl text-white mb-4">Women's Edit</h3>
              <span className="text-white text-xs tracking-widest uppercase border-b border-white pb-1">
                Shop Now
              </span>
            </div>
          </Link>

          {/* Right Stacked */}
          <div className="flex flex-col gap-6">
           <Link
                to="/products?category=men"
                className="group relative overflow-hidden h-[237px] bg-luxury-offwhite"
            >
                <img
                    src="https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&auto=format&fit=crop&q=80"
                    alt="Men's Collection"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.parentNode.style.background = '#2a2a2a'
                    }}
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-all duration-300"/>
                <div className="absolute bottom-6 left-6">
                    <h3 className="font-serif text-2xl text-white mb-2">Men's Edit</h3>
                    <span className="text-white text-xs tracking-widest uppercase border-b border-white pb-1">
                        Shop Now
                    </span>
                </div>
            </Link>

            <Link
              to="/products?category=kids"
              className="group relative overflow-hidden h-[237px] bg-luxury-offwhite"
            >
              <img
                src="https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800&auto=format&fit=crop&q=80"
                alt="Kids Collection"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-all duration-300"/>
              <div className="absolute bottom-6 left-6">
                <h3 className="font-serif text-2xl text-white mb-2">Kids' Edit</h3>
                <span className="text-white text-xs tracking-widest uppercase border-b border-white pb-1">
                  Shop Now
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURES STRIP ───────────────────────────────── */}
      <section className="border-t border-luxury-gray">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-luxury-gray">
            {[
              { icon: '◈', title: 'Premium Quality',   desc: 'Curated for excellence'        },
              { icon: '◇', title: 'Free Shipping',      desc: 'On orders above ₹999'          },
              { icon: '○', title: 'Easy Returns',       desc: '7-day hassle-free returns'     },
              { icon: '□', title: 'Secure Payment',     desc: '100% protected transactions'   },
            ].map(item => (
              <div key={item.title} className="py-10 px-8 text-center">
                <p className="text-2xl text-gold mb-3">{item.icon}</p>
                <p className="text-xs tracking-widest uppercase font-medium mb-1">{item.title}</p>
                <p className="text-xs text-luxury-midgray tracking-wide">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ───────────────────────────────────── */}
      <section className="bg-luxury-offwhite py-20">
        <div className="max-w-xl mx-auto px-6 text-center">
          <p className="text-gold text-xs tracking-widest uppercase mb-3">Stay Connected</p>
          <h2 className="font-serif text-3xl font-normal mb-4">Join the Inner Circle</h2>
          <p className="text-luxury-midgray text-sm tracking-wide mb-8">
            Subscribe for exclusive access to new collections, private sales, and style inspiration.
          </p>
          <div className="flex gap-0 border border-black">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-5 py-3 text-sm bg-white focus:outline-none tracking-wide"
            />
            <button className="bg-black text-white text-xs tracking-widest uppercase px-6 py-3 hover:bg-luxury-darkgray transition-colors whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

            {/* Brand */}
            <div>
              <h3 className="font-serif text-2xl font-normal text-white mb-4">TRENDIO</h3>
              <p className="text-white/50 text-xs tracking-wide leading-relaxed">
                Defining modern luxury through thoughtful design and premium craftsmanship.
              </p>
              <div className="flex gap-4 mt-6">
                {['Instagram', 'Twitter', 'Pinterest'].map(s => (
                  <a key={s} href="#" className="text-white/40 text-xs tracking-widest uppercase hover:text-gold transition-colors">
                    {s}
                  </a>
                ))}
              </div>
            </div>

            {/* Shop */}
            <div>
              <h4 className="text-xs tracking-widest uppercase text-white/60 mb-4">Shop</h4>
              <ul className="space-y-2.5">
                {['Men', 'Women', 'Kids', 'New Arrivals', 'Sale'].map(item => (
                  <li key={item}>
                    <Link
                      to="/products"
                      className="text-white/60 text-xs tracking-wide hover:text-gold transition-colors gold-underline"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Help */}
            <div>
              <h4 className="text-xs tracking-widest uppercase text-white/60 mb-4">Help</h4>
              <ul className="space-y-2.5">
                {['Size Guide', 'Shipping Info', 'Returns', 'Track Order', 'Contact Us'].map(item => (
                  <li key={item}>
                    <a href="#" className="text-white/60 text-xs tracking-wide hover:text-gold transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Account */}
            <div>
              <h4 className="text-xs tracking-widest uppercase text-white/60 mb-4">Account</h4>
              <ul className="space-y-2.5">
                {[
                  { label: 'My Account',  to: '/profile' },
                  { label: 'My Orders',   to: '/orders'  },
                  { label: 'Wishlist',    to: '/'        },
                 
                ].map(item => (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      className="text-white/60 text-xs tracking-wide hover:text-gold transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/30 text-xs tracking-widest">
              © 2026 TRENDIO. ALL RIGHTS RESERVED.
            </p>
            <div className="flex gap-6">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(item => (
                <a key={item} href="#" className="text-white/30 text-xs tracking-widest hover:text-gold transition-colors">
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}

export default HomePage