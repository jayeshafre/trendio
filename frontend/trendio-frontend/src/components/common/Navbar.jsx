import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import toast from 'react-hot-toast'

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const { cartCount } = useCart()
  const navigate = useNavigate()
  const [search, setSearch]       = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [scrolled, setScrolled]   = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = async () => {
    await logout()
    toast.success('See you soon.')
    navigate('/login')
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`)
      setSearch('')
      setShowSearch(false)
    }
  }

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-black text-white text-center py-2">
        <p className="text-xs tracking-widest uppercase">
          Free Shipping on Orders Above ₹999 &nbsp;|&nbsp; Use Code{' '}
          <span className="text-gold font-medium">TRENDIO10</span> for 10% Off
        </p>
      </div>

      {/* Main Navbar */}
      <nav className={`bg-white sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'shadow-md' : 'border-b border-luxury-gray'
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16 gap-6">

            {/* ── Left — Category Links ─────────────────── */}
            <div className="hidden md:flex items-center gap-8 flex-shrink-0">
              {[
                { label: 'MEN',   slug: 'men'   },
                { label: 'WOMEN', slug: 'women' },
                { label: 'KIDS',  slug: 'kids'  },
              ].map(cat => (
                <Link
                  key={cat.slug}
                  to={`/products?category=${cat.slug}`}
                  className="text-xs font-medium tracking-widest text-black hover:text-gold transition-colors gold-underline"
                >
                  {cat.label}
                </Link>
              ))}
            </div>

            {/* ── Center — Logo ─────────────────────────── */}
            <Link
              to="/"
              className="absolute left-1/2 -translate-x-1/2 font-serif text-2xl font-bold tracking-wider text-black hover:text-gold transition-colors"
            >
              TRENDIO
            </Link>

            {/* ── Right — Search + Icons ────────────────── */}
            <div className="flex items-center gap-1 ml-auto">

              {/* Search Bar */}
              <div className="hidden md:flex items-center border border-luxury-gray rounded-sm overflow-hidden mr-2">
                <div className="flex items-center px-3 py-2 gap-2 bg-luxury-offwhite min-w-[220px]">
                  <svg className="w-3.5 h-3.5 text-luxury-midgray flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                  <form onSubmit={handleSearch} className="flex-1">
                    <input
                      type="text"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search for products, brands and more"
                      className="w-full text-xs bg-transparent focus:outline-none text-black placeholder-luxury-midgray tracking-wide"
                    />
                  </form>
                </div>
              </div>

              {/* Mobile Search Icon */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="md:hidden flex flex-col items-center gap-0.5 px-3 py-2 text-black hover:text-gold transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </button>

              {/* ── Nav Icons ─────────────────────────── */}

              {isAuthenticated ? (
                <>
                  {/* Profile Icon */}
                  <Link
                    to="/profile"
                    className="flex flex-col items-center gap-0.5 px-3 py-2 text-black hover:text-gold transition-colors group"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/>
                    </svg>
                    <span className="text-xs tracking-wide font-medium">
                      {user?.first_name || 'Profile'}
                    </span>
                  </Link>

                  {/* Wishlist Icon */}
                  <Link
                    to="/products"
                    className="flex flex-col items-center gap-0.5 px-3 py-2 text-black hover:text-gold transition-colors group"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                    </svg>
                    <span className="text-xs tracking-wide font-medium">Wishlist</span>
                  </Link>

                  {/* Orders Icon */}
                  <Link
                    to="/orders"
                    className="flex flex-col items-center gap-0.5 px-3 py-2 text-black hover:text-gold transition-colors group"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                    </svg>
                    <span className="text-xs tracking-wide font-medium">Orders</span>
                  </Link>

                  {/* Bag / Cart Icon */}
                  <Link
                    to="/cart"
                    className="relative flex flex-col items-center gap-0.5 px-3 py-2 text-black hover:text-gold transition-colors group"
                  >
                    <div className="relative">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                      </svg>
                      {/* Badge */}
                      {cartCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-gold text-black text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                          {cartCount > 9 ? '9+' : cartCount}
                        </span>
                      )}
                    </div>
                    <span className="text-xs tracking-wide font-medium">Bag</span>
                  </Link>

                  {/* Sign Out */}
                  <button
                    onClick={handleLogout}
                    className="flex flex-col items-center gap-0.5 px-3 py-2 text-luxury-midgray hover:text-black transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                    </svg>
                    <span className="text-xs tracking-wide font-medium">Sign Out</span>
                  </button>

                </>
              ) : (
                <>
                  {/* Sign In Icon */}
                  <Link
                    to="/login"
                    className="flex flex-col items-center gap-0.5 px-3 py-2 text-black hover:text-gold transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/>
                    </svg>
                    <span className="text-xs tracking-wide font-medium">Sign In</span>
                  </Link>

                  {/* Wishlist Icon */}
                  <Link
                    to="/login"
                    className="flex flex-col items-center gap-0.5 px-3 py-2 text-black hover:text-gold transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                    </svg>
                    <span className="text-xs tracking-wide font-medium">Wishlist</span>
                  </Link>

                  {/* Bag Icon */}
                  <Link
                    to="/login"
                    className="flex flex-col items-center gap-0.5 px-3 py-2 text-black hover:text-gold transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                    </svg>
                    <span className="text-xs tracking-wide font-medium">Bag</span>
                  </Link>

                  {/* Join Button */}
                  <Link
                    to="/register"
                    className="ml-2 bg-black text-white text-xs tracking-widest uppercase px-5 py-2.5 hover:bg-luxury-darkgray transition-colors flex-shrink-0"
                  >
                    Join
                  </Link>
                </>
              )}

            </div>
          </div>
        </div>

        {/* ── Mobile Search Dropdown ─────────────────────── */}
        {showSearch && (
          <div className="border-t border-luxury-gray bg-white px-6 py-4 md:hidden">
            <form onSubmit={handleSearch}>
              <div className="flex items-center gap-3 border-b-2 border-black pb-2">
                <svg className="w-4 h-4 text-luxury-midgray flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search products..."
                  autoFocus
                  className="flex-1 text-sm tracking-wide focus:outline-none placeholder-luxury-midgray"
                />
                <button
                  type="button"
                  onClick={() => setShowSearch(false)}
                  className="text-luxury-midgray hover:text-black"
                >
                  ×
                </button>
              </div>
            </form>
          </div>
        )}

      </nav>
    </>
  )
}

export default Navbar