import React from 'react'
import AdminSidebar from './AdminSidebar'

const AdminLayout = ({ children, title, subtitle }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F5F5F5' }}>

      {/* Sidebar */}
      <div style={{ width: '256px', flexShrink: 0 }}>
        <AdminSidebar />
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {/* Header */}
        <div className="bg-white border-b border-luxury-gray px-8 py-5">
          <p className="text-gold text-xs tracking-widest uppercase mb-1">Admin</p>
          <h1 className="font-serif text-2xl font-normal text-black">{title}</h1>
          {subtitle && (
            <p className="text-luxury-midgray text-xs tracking-widest uppercase mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="p-8">
          {children}
        </div>
      </div>

    </div>
  )
}

export default AdminLayout