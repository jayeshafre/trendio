import React, { useState, useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import AdminLayout from '../../components/admin/AdminLayout'
import { getCategories } from '../../api/productApi'
import { createCategory, updateCategory, deleteCategory } from '../../api/adminApi'

const AdminCategories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [showModal, setShowModal]   = useState(false)
  const [editCat, setEditCat]       = useState(null)
  const [deleting, setDeleting]     = useState(null)

  const fetchCategories = async () => {
    try {
      const data = await getCategories()
      setCategories(data)
    } catch {
      toast.error('Failed to load categories.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCategories() }, [])

  const handleAdd = () => {
    setEditCat(null)
    setShowModal(true)
  }

  const handleEdit = (cat) => {
    setEditCat(cat)
    setShowModal(true)
  }

  const handleModalClose = () => {
    setShowModal(false)
    setEditCat(null)
  }

  const handleDelete = async (cat) => {
    if (!window.confirm(`Delete "${cat.name}"?`)) return
    setDeleting(cat.id)
    try {
      await deleteCategory(cat.id)
      toast.success(`"${cat.name}" deleted.`)
      fetchCategories()
    } catch {
      toast.error('Delete failed. Category may have products.')
    } finally {
      setDeleting(null)
    }
  }

  const handleSave = async (formData, isEdit) => {
    try {
      if (isEdit) await updateCategory(editCat.id, formData)
      else await createCategory(formData)
      toast.success(isEdit ? 'Category updated.' : 'Category created.')
      setShowModal(false)
      setEditCat(null)
      fetchCategories()
    } catch {
      toast.error('Failed to save category.')
      throw new Error()
    }
  }

  const catSymbols = { men: '◈', women: '◇', kids: '○' }

  return (
    <AdminLayout
      title="Categories"
      subtitle={`${categories.length} categories`}
    >
      <Toaster position="top-right" />

      {/* Add Button */}
      <div className="flex justify-end mb-6">
        <button
          type="button"
          onClick={handleAdd}
          className="bg-black text-white text-xs tracking-widest uppercase px-6 py-3 hover:bg-luxury-darkgray transition-all cursor-pointer"
        >
          + Add Category
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-px h-16 bg-gold animate-pulse"/>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map(cat => (
            <div key={cat.id} className="bg-white border border-luxury-gray p-6">

              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-serif text-lg">
                  {catSymbols[cat.slug] || '□'}
                </div>
                <span className={`text-xs tracking-widest uppercase px-2 py-1 ${
                  cat.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {cat.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <h3 className="font-serif text-xl font-normal text-black mb-1">{cat.name}</h3>
              <p className="text-xs text-luxury-midgray tracking-widest uppercase mb-1">/{cat.slug}</p>
              <p className="text-xs text-luxury-midgray tracking-wide mb-6">
                {cat.product_count} products
              </p>

              <div className="flex gap-4 border-t border-luxury-gray pt-4">
                <button
                  type="button"
                  onClick={() => handleEdit(cat)}
                  className="text-xs tracking-widest uppercase text-blue-600 hover:text-blue-800 transition-colors cursor-pointer border-b border-blue-400 pb-0.5"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(cat)}
                  disabled={deleting === cat.id}
                  className="text-xs tracking-widest uppercase text-red-500 hover:text-red-700 transition-colors cursor-pointer border-b border-red-400 pb-0.5 disabled:opacity-40"
                >
                  {deleting === cat.id ? '...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <CategoryModal
          category={editCat}
          onSave={handleSave}
          onClose={handleModalClose}
        />
      )}
    </AdminLayout>
  )
}

// ─── Category Modal ───────────────────────────────────────────
const CategoryModal = ({ category, onSave, onClose }) => {
  const isEdit = !!category
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name:        category?.name        || '',
    description: category?.description || '',
    is_active:   category?.is_active   ?? true,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSave(formData, isEdit)
    } catch {
      // handled in parent
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = 'unset' }
  }, [])

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[999] p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white w-full max-w-md shadow-2xl">

        <div className="flex items-center justify-between px-8 py-5 border-b border-luxury-gray">
          <h2 className="font-serif text-xl font-normal">
            {isEdit ? 'Edit Category' : 'Add Category'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-luxury-midgray hover:text-black transition-colors text-2xl leading-none cursor-pointer w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">

          <div>
            <label className="text-xs font-medium tracking-widest uppercase text-luxury-darkgray block mb-1.5">
              Category Name <span className="text-gold">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g. Men"
              className="w-full border-b-2 border-luxury-gray px-0 py-2.5 text-sm focus:outline-none focus:border-black transition-all tracking-wide"
            />
          </div>

          <div>
            <label className="text-xs font-medium tracking-widest uppercase text-luxury-darkgray block mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Category description..."
              className="w-full border-b-2 border-luxury-gray px-0 py-2.5 text-sm focus:outline-none focus:border-black transition-all resize-none tracking-wide"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="accent-black w-4 h-4 cursor-pointer"
            />
            <span className="text-xs tracking-widest uppercase">Active</span>
          </label>

          <div className="flex gap-4 pt-4 border-t border-luxury-gray">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-black text-white text-xs tracking-widest uppercase py-3.5 hover:bg-luxury-darkgray transition-all disabled:opacity-40 cursor-pointer"
            >
              {loading ? 'Saving...' : isEdit ? 'Update Category' : 'Add Category'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-luxury-gray text-black text-xs tracking-widest uppercase py-3.5 hover:border-black transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default AdminCategories