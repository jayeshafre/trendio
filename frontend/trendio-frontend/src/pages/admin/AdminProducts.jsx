import React, { useState, useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import AdminLayout from '../../components/admin/AdminLayout'
import {
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from '../../api/adminApi'
import { getCategories } from '../../api/productApi'

const AdminProducts = () => {
  const [products, setProducts]     = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [modalOpen, setModalOpen]   = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [deleting, setDeleting]     = useState(null)
  const [search, setSearch]         = useState('')

  const loadData = async () => {
    setLoading(true)
    try {
      const [prods, cats] = await Promise.all([
        getAdminProducts(),
        getCategories()
      ])
      setProducts(Array.isArray(prods) ? prods : (prods.results || []))
      setCategories(cats)
    } catch (err) {
      console.error('Load error:', err)
      toast.error('Failed to load products.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  // ── Button Handlers ───────────────────────────────────────
  const openAddModal = () => {
    console.log('Opening add modal')
    setEditProduct(null)
    setModalOpen(true)
  }

  const openEditModal = (product) => {
    console.log('Opening edit modal for:', product.name)
    setEditProduct(product)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditProduct(null)
  }

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"?`)) return
    setDeleting(product.id)
    try {
      await deleteProduct(product.id)
      toast.success('Product deleted.')
      await loadData()
    } catch {
      toast.error('Delete failed.')
    } finally {
      setDeleting(null)
    }
  }

  const handleSave = async (formData, isEdit) => {
    try {
      if (isEdit) {
        await updateProduct(editProduct.id, formData)
        toast.success('Product updated.')
      } else {
        await createProduct(formData)
        toast.success('Product created.')
      }
      closeModal()
      await loadData()
    } catch (err) {
      console.error('Save error:', err)
      toast.error('Failed to save.')
      throw err
    }
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout title="Products" subtitle={`${products.length} products`}>
      <Toaster position="top-right" />

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center border border-luxury-gray bg-white px-4 py-2.5 gap-3" style={{ minWidth: '280px' }}>
          <svg className="w-4 h-4 text-luxury-midgray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="text-sm focus:outline-none text-black placeholder-luxury-midgray bg-transparent flex-1"
          />
        </div>

        <button
          onClick={openAddModal}
          style={{
            backgroundColor: '#000',
            color: '#fff',
            padding: '12px 24px',
            fontSize: '11px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          + Add Product
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-px h-16 bg-gold animate-pulse"/>
        </div>
      ) : (
        <div className="bg-white border border-luxury-gray">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#F5F5F5' }}>
              <tr>
                {['Product', 'Category', 'Price', 'Stock', 'Status', 'Featured', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontSize: '11px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#999',
                    fontWeight: 'normal',
                    borderBottom: '1px solid #E8E8E8'
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((product, idx) => (
                <tr
                  key={product.id}
                  style={{
                    backgroundColor: idx % 2 === 0 ? '#fff' : '#fafafa',
                    borderBottom: '1px solid #F5F5F5'
                  }}
                >
                  {/* Product */}
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '48px', backgroundColor: '#F5F5F5', overflow: 'hidden', flexShrink: 0 }}>
                        {product.image ? (
                          <img
                            src={`http://localhost:8000${product.image}`}
                            alt={product.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>◈</div>
                        )}
                      </div>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: '500', color: '#000', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {product.name}
                        </p>
                        {product.sku && (
                          <p style={{ fontSize: '11px', color: '#999' }}>SKU: {product.sku}</p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td style={{ padding: '16px', fontSize: '12px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {product.category?.name || '—'}
                  </td>

                  {/* Price */}
                  <td style={{ padding: '16px' }}>
                    <p style={{ fontSize: '14px', color: '#000' }}>
                      ₹{Number(product.price).toLocaleString('en-IN')}
                    </p>
                    {product.compare_price && (
                      <p style={{ fontSize: '11px', color: '#999', textDecoration: 'line-through' }}>
                        ₹{Number(product.compare_price).toLocaleString('en-IN')}
                      </p>
                    )}
                  </td>

                  {/* Stock */}
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      fontSize: '14px',
                      color: product.stock === 0 ? '#ef4444' : product.stock < 10 ? '#f97316' : '#000'
                    }}>
                      {product.stock}
                    </span>
                  </td>

                  {/* Status */}
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      fontSize: '11px',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      padding: '3px 8px',
                      backgroundColor: product.is_active ? '#f0fdf4' : '#fef2f2',
                      color: product.is_active ? '#166534' : '#991b1b'
                    }}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  {/* Featured */}
                  <td style={{ padding: '16px', fontSize: '12px', color: product.is_featured ? '#D4AF37' : '#999' }}>
                    {product.is_featured ? '◈ Yes' : '—'}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <button
                        onClick={() => openEditModal(product)}
                        style={{
                          fontSize: '11px',
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          color: '#2563eb',
                          background: 'none',
                          border: 'none',
                          borderBottom: '1px solid #2563eb',
                          cursor: 'pointer',
                          padding: '0 0 2px 0'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        disabled={deleting === product.id}
                        style={{
                          fontSize: '11px',
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          color: '#ef4444',
                          background: 'none',
                          border: 'none',
                          borderBottom: '1px solid #ef4444',
                          cursor: deleting === product.id ? 'not-allowed' : 'pointer',
                          padding: '0 0 2px 0',
                          opacity: deleting === product.id ? 0.4 : 1
                        }}
                      >
                        {deleting === product.id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '64px', color: '#999', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {search ? 'No products match your search' : 'No products yet. Click + Add Product to start.'}
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <ProductModal
          product={editProduct}
          categories={categories}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}

    </AdminLayout>
  )
}

// ─── Product Modal ─────────────────────────────────────────────
const ProductModal = ({ product, categories, onSave, onClose }) => {
  const isEdit = !!product
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState(
    product?.image ? `http://localhost:8000${product.image}` : null
  )
  const [form, setForm] = useState({
    name:          product?.name          || '',
    description:   product?.description   || '',
    price:         product?.price         || '',
    compare_price: product?.compare_price || '',
    stock:         product?.stock         ?? 0,
    sku:           product?.sku           || '',
    category_id:   product?.category?.id  || '',
    is_active:     product?.is_active     ?? true,
    is_featured:   product?.is_featured   ?? false,
    image:         null,
  })

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target
    if (type === 'file') {
      const file = files[0]
      if (file) {
        setForm(prev => ({ ...prev, image: file }))
        setImagePreview(URL.createObjectURL(file))
      }
    } else if (type === 'checkbox') {
      setForm(prev => ({ ...prev, [name]: checked }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const data = new FormData()
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'image' && !value) return
      if (value !== null && value !== undefined) data.append(key, value)
    })
    try {
      await onSave(data, isEdit)
    } catch {
      // handled in parent
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px'
      }}
    >
      <div style={{
        backgroundColor: '#fff',
        width: '100%',
        maxWidth: '560px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
      }}>

        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 32px',
          borderBottom: '1px solid #E8E8E8',
          position: 'sticky',
          top: 0,
          backgroundColor: '#fff',
          zIndex: 1
        }}>
          <h2 style={{ fontSize: '20px', fontFamily: 'Georgia, serif', fontWeight: 'normal' }}>
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#999',
              lineHeight: 1,
              padding: '4px 8px'
            }}
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Image */}
          <div>
            <label style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#444', display: 'block', marginBottom: '12px' }}>
              Product Image
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '64px', height: '80px', backgroundColor: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                {imagePreview ? (
                  <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                ) : (
                  <span style={{ opacity: 0.2, fontSize: '24px' }}>◈</span>
                )}
              </div>
              <input type="file" name="image" accept="image/*" onChange={handleChange}
                style={{ fontSize: '12px', color: '#666' }}
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <label style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#444', display: 'block', marginBottom: '6px' }}>
              Name *
            </label>
            <input type="text" name="name" value={form.name} onChange={handleChange} required
              placeholder="e.g. Classic Linen Shirt"
              style={{ width: '100%', borderBottom: '2px solid #E8E8E8', padding: '10px 0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#444', display: 'block', marginBottom: '6px' }}>
              Description
            </label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3}
              placeholder="Product description..."
              style={{ width: '100%', borderBottom: '2px solid #E8E8E8', padding: '10px 0', fontSize: '14px', outline: 'none', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
            />
          </div>

          {/* Price Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <label style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#444', display: 'block', marginBottom: '6px' }}>Price (₹) *</label>
              <input type="number" name="price" value={form.price} onChange={handleChange} required min="0" step="0.01" placeholder="499"
                style={{ width: '100%', borderBottom: '2px solid #E8E8E8', padding: '10px 0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#444', display: 'block', marginBottom: '6px' }}>Compare Price (₹)</label>
              <input type="number" name="compare_price" value={form.compare_price} onChange={handleChange} min="0" step="0.01" placeholder="999"
                style={{ width: '100%', borderBottom: '2px solid #E8E8E8', padding: '10px 0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Stock + SKU */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <label style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#444', display: 'block', marginBottom: '6px' }}>Stock *</label>
              <input type="number" name="stock" value={form.stock} onChange={handleChange} required min="0"
                style={{ width: '100%', borderBottom: '2px solid #E8E8E8', padding: '10px 0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#444', display: 'block', marginBottom: '6px' }}>SKU</label>
              <input type="text" name="sku" value={form.sku} onChange={handleChange} placeholder="TSH-WHT-001"
                style={{ width: '100%', borderBottom: '2px solid #E8E8E8', padding: '10px 0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#444', display: 'block', marginBottom: '6px' }}>Category</label>
            <select name="category_id" value={form.category_id} onChange={handleChange}
              style={{ width: '100%', borderBottom: '2px solid #E8E8E8', padding: '10px 0', fontSize: '14px', outline: 'none', background: 'transparent', cursor: 'pointer', boxSizing: 'border-box' }}
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Toggles */}
          <div style={{ display: 'flex', gap: '32px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Active</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" name="is_featured" checked={form.is_featured} onChange={handleChange}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Featured</span>
            </label>
          </div>

          {/* Submit Buttons */}
          <div style={{ display: 'flex', gap: '12px', paddingTop: '16px', borderTop: '1px solid #E8E8E8' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                backgroundColor: loading ? '#999' : '#000',
                color: '#fff',
                padding: '14px',
                fontSize: '11px',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Add Product'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                backgroundColor: '#fff',
                color: '#000',
                padding: '14px',
                fontSize: '11px',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                border: '1px solid #E8E8E8',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default AdminProducts