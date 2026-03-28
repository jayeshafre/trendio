import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const navItems = [
  { path: '/admin',            icon: '◈', label: 'Dashboard'  },
  { path: '/admin/products',   icon: '◇', label: 'Products'   },
  { path: '/admin/categories', icon: '□', label: 'Categories' },
  { path: '/admin/orders',     icon: '○', label: 'Orders'     },
]

const AdminSidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Signed out.')
      navigate('/login')
    } catch {
      toast.error('Sign out failed.')
    }
  }

  return (
    <div
      style={{
        width: '256px',
        backgroundColor: '#000000',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
      }}
    >
      {/* Logo */}
      <div className="px-8 py-6 border-b border-white/10">
        <Link to="/" className="font-serif text-xl font-bold tracking-widest text-white hover:text-gold transition-colors">
          TRENDIO
        </Link>
        <p className="text-white/40 text-xs tracking-widest uppercase mt-1">Admin Console</p>
      </div>

      {/* Admin Info */}
      <div className="px-8 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gold flex items-center justify-center text-black font-bold text-xs font-serif flex-shrink-0">
            {user?.first_name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div>
            <p className="text-white text-xs font-medium tracking-wide">
              {user?.first_name || user?.username}
            </p>
            <p className="text-white/40 text-xs tracking-widest uppercase">Administrator</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map(item => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3 text-xs tracking-widest uppercase transition-all ${
                isActive
                  ? 'bg-white text-black'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-4 py-4 border-t border-white/10 space-y-1">
        <Link
          to="/"
          className="flex items-center gap-4 px-4 py-3 text-xs tracking-widest uppercase text-white/50 hover:text-white hover:bg-white/5 transition-all"
        >
          <span>→</span> View Store
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3 text-xs tracking-widest uppercase text-white/50 hover:text-white hover:bg-white/5 transition-all"
        >
          <span>×</span> Sign Out
        </button>
      </div>
    </div>
  )
}

export default AdminSidebar