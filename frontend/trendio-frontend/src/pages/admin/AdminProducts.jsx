import React, { useState, useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import AdminLayout from '../../components/admin/AdminLayout'
import { getAdminProducts, createProduct, updateProduct, deleteProduct } from '../../api/adminApi'
import { getCategories } from '../../api/productApi'

const AdminProducts = () => {
  const [products, setProducts]     = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [showModal, setShowModal]   = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [deleting, setDeleting]     = useState(null)
  const [search, setSearch]         = useState('')

  const fetchData = async () => {
    try {
      const [prods, cats] = await Promise.all([getAdminProducts(), getCategories()])
      setProducts(Array.isArray(prods) ? prods : prods.results || [])
      setCategories(cats)
    } catch {
      toast.error('Failed to load.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"?`)) return
    setDeleting(product.id)
    try {
      await deleteProduct(product.id)
      toast.success(`"${product.name}" deleted.`)
      fetchData()
    } catch { toast.error('Delete failed.') }
    finally { setDeleting(null) }
  }

  const handleSave = async (formData, isEdit) => {
    try {
      if (isEdit) await updateProduct(editProduct.id, formData)
      else await createProduct(formData)
      toast.success(isEdit ? 'Product updated.' : 'Product created.')
      setShowModal(false)
      fetchData()
    } catch (error) {
      toast.error('Failed to save.')
      throw error
    }
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout
      title="Products"
      subtitle={`${products.length} total`}
      action={
        <button
          onClick={() => { setEditProduct(null); setShowModal(true) }}
          className="bg-black text-white text-xs tracking-widest uppercase px-6 py-3 hover:bg-luxury-darkgray transition-all"
        >
          + Add Product
        </button>
      }
    >
      <Toaster position="top-right" />

      {/* Search */}
      <div className="bg-white border border-luxury-gray mb-6">
        <div className="flex items-center gap-4 px-4 border-b border-luxury-gray py-3">
          <svg className="w-4 h-4 text-luxury-midgray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="flex-1 text-sm tracking-wide focus:outline-none text-black placeholder-luxury-midgray py-1"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-px h-16 bg-gold animate-pulse"/>
        </div>
      ) : (
        <div className="bg-white border border-luxury-gray overflow-hidden">
          <table className="w-full">
            <thead className="bg-luxury-offwhite border-b border-luxury-gray">
              <tr>
                {['Product', 'Category', 'Price', 'Stock', 'Status', 'Featured', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-xs tracking-widest uppercase text-luxury-midgray font-normal">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-offwhite">
              {filtered.map(product => (
                <tr key={product.id} className="hover:bg-luxury-offwhite transition-colors">

                  {/* Product */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-12 bg-luxury-offwhite overflow-hidden flex-shrink-0">
                        {product.image ? (
                          <img
                            src={`http://localhost:8000${product.image}`}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg opacity-20">◈</div>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-black tracking-wide max-w-[180px] truncate">
                          {product.name}
                        </p>
                        {product.sku && (
                          <p className="text-xs text-luxury-midgray tracking-wide">SKU: {product.sku}</p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4 text-xs text-luxury-midgray tracking-widest uppercase">
                    {product.category?.name || '—'}
                  </td>

                  {/* Price */}
                  <td className="px-6 py-4">
                    <p className="font-serif text-sm text-black">
                      ₹{Number(product.price).toLocaleString('en-IN')}
                    </p>
                    {product.compare_price && (
                      <p className="text-xs text-luxury-midgray line-through">
                        ₹{Number(product.compare_price).toLocaleString('en-IN')}
                      </p>
                    )}
                  </td>

                  {/* Stock */}
                  <td className="px-6 py-4">
                    <span className={`font-serif text-sm ${
                      product.stock === 0 ? 'text-red-500' :
                      product.stock < 10 ? 'text-orange-500' : 'text-black'
                    }`}>
                      {product.stock}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span className={`text-xs tracking-widest uppercase px-2 py-1 ${
                      product.is_active
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-700'
                    }`}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  {/* Featured */}
                  <td className="px-6 py-4">
                    <span className={`text-xs tracking-widest uppercase ${
                      product.is_featured ? 'text-gold' : 'text-luxury-midgray'
                    }`}>
                      {product.is_featured ? '◈ Yes' : '—'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => { setEditProduct(product); setShowModal(true) }}
                        className="text-xs tracking-widest uppercase text-luxury-midgray hover:text-black transition-colors border-b border-luxury-midgray pb-0.5"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        disabled={deleting === product.id}
                        className="text-xs tracking-widest uppercase text-red-400 hover:text-red-600 transition-colors border-b border-red-400 pb-0.5 disabled:opacity-40"
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
            <div className="text-center py-16 text-luxury-midgray">
              <p className="text-xs tracking-widest uppercase">No products found</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <ProductModal
          product={editProduct}
          categories={categories}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}
    </AdminLayout>
  )
}

// ─── Product Modal ────────────────────────────────────────────
const ProductModal = ({ product, categories, onSave, onClose }) => {
  const isEdit = !!product
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState(
    product?.image ? `http://localhost:8000${product.image}` : null
  )
  const [formData, setFormData] = useState({
    name:          product?.name          || '',
    description:   product?.description   || '',
    price:         product?.price         || '',
    compare_price: product?.compare_price || '',
    stock:         product?.stock         || 0,
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
      setFormData(prev => ({ ...prev, image: file }))
      if (file) setImagePreview(URL.createObjectURL(file))
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const data = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'image' && !value) return
      if (value !== null && value !== undefined) data.append(key, value)
    })
    try { await onSave(data, isEdit) }
    catch { }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-luxury-gray">
          <h2 className="font-serif text-xl font-normal">
            {isEdit ? 'Edit Product' : 'Add Product'}
          </h2>
          <button onClick={onClose} className="text-luxury-midgray hover:text-black transition-colors text-2xl leading-none">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">

          {/* Image */}
          <div>
            <label className="text-xs font-medium tracking-widest uppercase text-luxury-darkgray block mb-3">
              Product Image
            </label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-20 bg-luxury-offwhite flex items-center justify-center flex-shrink-0 overflow-hidden">
                {imagePreview ? (
                  <img src={imagePreview} alt="preview" className="w-full h-full object-cover"/>
                ) : (
                  <span className="text-2xl opacity-20">◈</span>
                )}
              </div>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                className="text-xs text-luxury-midgray file:mr-3 file:py-2 file:px-4 file:border file:border-black file:bg-white file:text-black file:text-xs file:tracking-widest file:uppercase hover:file:bg-black hover:file:text-white file:transition-all"
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-xs font-medium tracking-widest uppercase text-luxury-darkgray block mb-1.5">
              Product Name <span className="text-gold">*</span>
            </label>
            <input
              type="text" name="name" value={formData.name} onChange={handleChange} required
              placeholder="e.g. Classic Linen Shirt"
              className="w-full border-b-2 border-luxury-gray px-0 py-2.5 text-sm focus:outline-none focus:border-black transition-all tracking-wide"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium tracking-widest uppercase text-luxury-darkgray block mb-1.5">
              Description
            </label>
            <textarea
              name="description" value={formData.description} onChange={handleChange} rows={3}
              placeholder="Product description..."
              className="w-full border-b-2 border-luxury-gray px-0 py-2.5 text-sm focus:outline-none focus:border-black transition-all resize-none tracking-wide"
            />
          </div>

          {/* Price Row */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-medium tracking-widest uppercase text-luxury-darkgray block mb-1.5">
                Price (₹) <span className="text-gold">*</span>
              </label>
              <input
                type="number" name="price" value={formData.price} onChange={handleChange} required min="0" step="0.01"
                placeholder="499"
                className="w-full border-b-2 border-luxury-gray px-0 py-2.5 text-sm focus:outline-none focus:border-black transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-medium tracking-widest uppercase text-luxury-darkgray block mb-1.5">
                Compare Price (₹)
              </label>
              <input
                type="number" name="compare_price" value={formData.compare_price} onChange={handleChange} min="0" step="0.01"
                placeholder="999"
                className="w-full border-b-2 border-luxury-gray px-0 py-2.5 text-sm focus:outline-none focus:border-black transition-all"
              />
            </div>
          </div>

          {/* Stock + SKU */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-medium tracking-widest uppercase text-luxury-darkgray block mb-1.5">
                Stock <span className="text-gold">*</span>
              </label>
              <input
                type="number" name="stock" value={formData.stock} onChange={handleChange} required min="0"
                className="w-full border-b-2 border-luxury-gray px-0 py-2.5 text-sm focus:outline-none focus:border-black transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-medium tracking-widest uppercase text-luxury-darkgray block mb-1.5">
                SKU
              </label>
              <input
                type="text" name="sku" value={formData.sku} onChange={handleChange}
                placeholder="TSH-WHT-001"
                className="w-full border-b-2 border-luxury-gray px-0 py-2.5 text-sm focus:outline-none focus:border-black transition-all"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-medium tracking-widest uppercase text-luxury-darkgray block mb-1.5">
              Category
            </label>
            <select
              name="category_id" value={formData.category_id} onChange={handleChange}
              className="w-full border-b-2 border-luxury-gray px-0 py-2.5 text-sm focus:outline-none focus:border-black transition-all bg-transparent"
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Toggles */}
          <div className="flex gap-8 pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange}
                className="accent-black w-4 h-4"
              />
              <span className="text-xs tracking-widest uppercase">Active</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleChange}
                className="accent-black w-4 h-4"
              />
              <span className="text-xs tracking-widest uppercase">Featured</span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4 border-t border-luxury-gray">
            <button
              type="submit" disabled={loading}
              className="flex-1 bg-black text-white text-xs tracking-widest uppercase py-3.5 hover:bg-luxury-darkgray transition-all disabled:opacity-40"
            >
              {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Add Product'}
            </button>
            <button
              type="button" onClick={onClose}
              className="flex-1 border border-luxury-gray text-black text-xs tracking-widest uppercase py-3.5 hover:border-black transition-all"
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