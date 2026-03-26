import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const navItems = [
  { path: '/admin',            icon: '📊', label: 'Dashboard'  },
  { path: '/admin/products',   icon: '👕', label: 'Products'   },
  { path: '/admin/categories', icon: '📂', label: 'Categories' },
  { path: '/admin/orders',     icon: '📦', label: 'Orders'     },
]

const AdminSidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out.')
      navigate('/login')
    } catch {
      toast.error('Logout failed.')
    }
  }

  return (
    <aside className="w-60 bg-gray-900 min-h-screen flex flex-col fixed top-0 left-0 z-40">

      <div className="px-6 py-5 border-b border-gray-700">
        <Link to="/" className="text-2xl font-bold text-pink-500">
          Trendio
        </Link>
        <p className="text-gray-400 text-xs mt-0.5">Admin Dashboard</p>
      </div>

      <div className="px-6 py-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {user?.first_name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div>
            <p className="text-white text-sm font-medium">
              {user?.first_name || user?.username}
            </p>
            <p className="text-gray-400 text-xs">Administrator</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(item => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-pink-500 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-700 space-y-1">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
        >
          <span>🛍️</span> View Store
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-red-900 hover:text-red-300 transition-all"
        >
          <span>🚪</span> Logout
        </button>
      </div>

    </aside>
  )
}

export default AdminSidebar