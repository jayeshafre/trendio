import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import AdminLayout from '../../components/admin/AdminLayout';
import { getCategories } from '../../api/productApi';
import { createCategory, updateCategory, deleteCategory } from '../../api/adminApi';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading]       = useState(true);
    const [showModal, setShowModal]   = useState(false);
    const [editCat, setEditCat]       = useState(null);
    const [deleting, setDeleting]     = useState(null);

    const fetchCategories = async () => {
        try {
            const data = await getCategories();
            setCategories(data);
        } catch {
            toast.error('Failed to load categories.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCategories(); }, []);

    const handleDelete = async (cat) => {
        if (!window.confirm(`Delete "${cat.name}"?`)) return;
        setDeleting(cat.id);
        try {
            await deleteCategory(cat.id);
            toast.success(`"${cat.name}" deleted.`);
            fetchCategories();
        } catch {
            toast.error('Delete failed. Category may have products.');
        } finally {
            setDeleting(null);
        }
    };

    const handleSave = async (formData, isEdit) => {
        try {
            if (isEdit) {
                await updateCategory(editCat.id, formData);
                toast.success('Category updated.');
            } else {
                await createCategory(formData);
                toast.success('Category created.');
            }
            setShowModal(false);
            fetchCategories();
        } catch (error) {
            toast.error('Failed to save category.');
            throw error;
        }
    };

    const categoryEmojis = { men: '👔', women: '👗', kids: '🧸' };

    return (
        <AdminLayout
            title="Categories"
            subtitle={`${categories.length} categories`}
        >
            <Toaster position="top-right" />

            {/* Add Button */}
            <div className="flex justify-end mb-6">
                <button
                    onClick={() => { setEditCat(null); setShowModal(true); }}
                    className="bg-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-pink-600 transition-colors"
                >
                    + Add Category
                </button>
            </div>

            {/* Categories Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-pink-500 border-t-transparent"/>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {categories.map(cat => (
                        <div key={cat.id} className="bg-white rounded-2xl shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">
                                        {categoryEmojis[cat.slug] || '📂'}
                                    </span>
                                    <div>
                                        <h3 className="font-bold text-gray-800">{cat.name}</h3>
                                        <p className="text-xs text-gray-400">/{cat.slug}</p>
                                    </div>
                                </div>
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                    cat.is_active
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-700'
                                }`}>
                                    {cat.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            <p className="text-sm text-gray-500 mb-4">
                                {cat.product_count} products
                            </p>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setEditCat(cat); setShowModal(true); }}
                                    className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-xl text-xs font-semibold hover:bg-blue-100 transition-colors"
                                >
                                    ✏️ Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(cat)}
                                    disabled={deleting === cat.id}
                                    className="flex-1 bg-red-50 text-red-600 py-2 rounded-xl text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-60"
                                >
                                    {deleting === cat.id ? '...' : '🗑️ Delete'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Category Modal */}
            {showModal && (
                <CategoryModal
                    category={editCat}
                    onSave={handleSave}
                    onClose={() => setShowModal(false)}
                />
            )}
        </AdminLayout>
    );
};

// ─── Category Modal ───────────────────────────────────────────
const CategoryModal = ({ category, onSave, onClose }) => {
    const isEdit = !!category;
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name:        category?.name        || '',
        description: category?.description || '',
        is_active:   category?.is_active   ?? true,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(formData, isEdit);
        } catch {
            // handled in parent
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">
                        {isEdit ? '✏️ Edit Category' : '➕ Add Category'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">
                            Category Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Men"
                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Category description..."
                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                        />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            name="is_active"
                            checked={formData.is_active}
                            onChange={handleChange}
                            className="accent-pink-500 w-4 h-4"
                        />
                        <span className="text-sm font-medium text-gray-700">Active</span>
                    </label>
                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-pink-500 text-white py-3 rounded-xl font-semibold hover:bg-pink-600 disabled:opacity-60"
                        >
                            {loading ? 'Saving...' : isEdit ? '✅ Update' : '➕ Add'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 border-2 border-gray-200 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminCategories;