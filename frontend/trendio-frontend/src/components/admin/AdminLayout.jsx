import React from 'react'
import AdminSidebar from './AdminSidebar'

const AdminLayout = ({ children, title, subtitle, action }) => {
  return (
    <div className="flex min-h-screen bg-luxury-offwhite">

      <AdminSidebar />

      <main className="flex-1 ml-64">

        {/* Header */}
        <div className="bg-white border-b border-luxury-gray px-8 py-5 flex items-center justify-between">
          <div>
            <p className="text-gold text-xs tracking-widest uppercase mb-1">Admin</p>
            <h1 className="font-serif text-2xl font-normal text-black">{title}</h1>
            {subtitle && (
              <p className="text-luxury-midgray text-xs tracking-widest uppercase mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>

        {/* Content */}
        <div className="p-8">
          {children}
        </div>

      </main>
    </div>
  )
}

export default AdminLayout