import React from 'react'
import AdminSidebar from './AdminSidebar'

const AdminLayout = ({ children, title, subtitle }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">

      <AdminSidebar />

      <main className="flex-1 ml-60">
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          {subtitle && (
            <p className="text-gray-500 text-sm mt-0.5">{subtitle}</p>
          )}
        </div>
        <div className="p-8">
          {children}
        </div>
      </main>

    </div>
  )
}

export default AdminLayout