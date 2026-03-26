import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import AdminLayout from '../../components/admin/AdminLayout';
import { getAdminProducts, createProduct, updateProduct, deleteProduct } from '../../api/adminApi';
import { getCategories } from '../../api/productApi';

const AdminProducts = () => {
    const [products, setProducts]     = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading]       = useState(true);
    const [showModal, setShowModal]   = useState(false);
    const [editProduct, setEditProduct] = useState(null);
    const [deleting, setDeleting]     = useState(null);

    const fetchData = async () => {
        try {
            const [prods, cats] = await Promise.all([
                getAdminProducts(),
                getCategories()
            ]);
            setProducts(Array.isArray(prods) ? prods : prods.results || []);
            setCategories(cats);
        } catch (error) {
            toast.error('Failed to load products.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleEdit = (product) => {
        setEditProduct(product);
        setShowModal(true);
    };

    const handleAdd = () => {
        setEditProduct(null);
        setShowModal(true);
    };

    const handleDelete = async (product) => {
        if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
        setDeleting(product.id);
        try {
            await deleteProduct(product.id);
            toast.success(`"${product.name}" deleted.`);
            fetchData();
        } catch (error) {
            toast.error('Delete failed.');
        } finally {
            setDeleting(null);
        }
    };

    const handleSave = async (formData, isEdit) => {
        try {
            if (isEdit) {
                await updateProduct(editProduct.id, formData);
                toast.success('Product updated successfully.');
            } else {
                await createProduct(formData);
                toast.success('Product created successfully.');
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to save product.';
            toast.error(msg);
            throw error;
        }
    };

    return (
        <AdminLayout
            title="Products"
            subtitle={`${products.length} products total`}
        >
            <Toaster position="top-right" />

            {/* Add Button */}
            <div className="flex justify-end mb-6">
                <button
                    onClick={handleAdd}
                    className="bg-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-pink-600 transition-colors flex items-center gap-2"
                >
                    + Add Product
                </button>
            </div>

            {/* Products Table */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-pink-500 border-t-transparent"/>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr className="text-left text-gray-500">
                                <th className="px-6 py-4 font-medium">Product</th>
                                <th className="px-6 py-4 font-medium">Category</th>
                                <th className="px-6 py-4 font-medium">Price</th>
                                <th className="px-6 py-4 font-medium">Stock</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Featured</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {products.map(product => (
                                <tr key={product.id} className="hover:bg-gray-50 transition-colors">

                                    {/* Product */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                                {product.image ? (
                                                    <img
                                                        src={`http://localhost:8000${product.image}`}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xl">🛍️</div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800 max-w-xs truncate">
                                                    {product.name}
                                                </p>
                                                {product.sku && (
                                                    <p className="text-xs text-gray-400">SKU: {product.sku}</p>
                                                )}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Category */}
                                    <td className="px-6 py-4 text-gray-600">
                                        {product.category?.name || '—'}
                                    </td>

                                    {/* Price */}
                                    <td className="px-6 py-4">
                                        <p className="font-semibold text-gray-800">
                                            ₹{Number(product.price).toLocaleString('en-IN')}
                                        </p>
                                        {product.compare_price && (
                                            <p className="text-xs text-gray-400 line-through">
                                                ₹{Number(product.compare_price).toLocaleString('en-IN')}
                                            </p>
                                        )}
                                    </td>

                                    {/* Stock */}
                                    <td className="px-6 py-4">
                                        <span className={`font-semibold ${
                                            product.stock === 0
                                                ? 'text-red-500'
                                                : product.stock < 10
                                                ? 'text-orange-500'
                                                : 'text-green-600'
                                        }`}>
                                            {product.stock}
                                        </span>
                                    </td>

                                    {/* Status */}
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                            product.is_active
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                        }`}>
                                            {product.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>

                                    {/* Featured */}
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                            product.is_featured
                                                ? 'bg-yellow-100 text-yellow-700'
                                                : 'bg-gray-100 text-gray-500'
                                        }`}>
                                            {product.is_featured ? '⭐ Yes' : 'No'}
                                        </span>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(product)}
                                                className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors"
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product)}
                                                disabled={deleting === product.id}
                                                className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-60"
                                            >
                                                {deleting === product.id ? '...' : '🗑️ Delete'}
                                            </button>
                                        </div>
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {products.length === 0 && (
                        <div className="text-center py-16 text-gray-400">
                            <p className="text-4xl mb-2">📦</p>
                            <p>No products yet. Add your first product!</p>
                        </div>
                    )}
                </div>
            )}

            {/* Product Modal */}
            {showModal && (
                <ProductModal
                    product={editProduct}
                    categories={categories}
                    onSave={handleSave}
                    onClose={() => setShowModal(false)}
                />
            )}

        </AdminLayout>
    );
};

// ─── Product Modal ────────────────────────────────────────────
const ProductModal = ({ product, categories, onSave, onClose }) => {
    const isEdit = !!product;
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(
        product?.image ? `http://localhost:8000${product.image}` : null
    );

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
    });

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        if (type === 'file') {
            const file = files[0];
            setFormData(prev => ({ ...prev, image: file }));
            if (file) setImagePreview(URL.createObjectURL(file));
        } else if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (key === 'image' && !value) return;
            if (value !== null && value !== undefined) {
                data.append(key, value);
            }
        });

        try {
            await onSave(data, isEdit);
        } catch {
            // Error handled in parent
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">
                        {isEdit ? '✏️ Edit Product' : '➕ Add New Product'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                        ×
                    </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    {/* Image Upload */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">
                            Product Image
                        </label>
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 bg-gray-100 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="preview" className="w-full h-full object-cover"/>
                                ) : (
                                    <span className="text-3xl">🛍️</span>
                                )}
                            </div>
                            <input
                                type="file"
                                name="image"
                                accept="image/*"
                                onChange={handleChange}
                                className="text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-pink-50 file:text-pink-600 file:font-semibold hover:file:bg-pink-100"
                            />
                        </div>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">
                            Product Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Classic White T-Shirt"
                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Product description..."
                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                        />
                    </div>

                    {/* Price Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">
                                Price (₹) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                min="0"
                                step="0.01"
                                placeholder="499"
                                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">
                                Compare Price (₹)
                            </label>
                            <input
                                type="number"
                                name="compare_price"
                                value={formData.compare_price}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                placeholder="999"
                                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                            />
                        </div>
                    </div>

                    {/* Stock + SKU Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">
                                Stock <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                required
                                min="0"
                                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">
                                SKU
                            </label>
                            <input
                                type="text"
                                name="sku"
                                value={formData.sku}
                                onChange={handleChange}
                                placeholder="e.g. TSH-WHT-001"
                                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">
                            Category
                        </label>
                        <select
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                        >
                            <option value="">Select Category</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Toggles */}
                    <div className="flex gap-6">
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
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="is_featured"
                                checked={formData.is_featured}
                                onChange={handleChange}
                                className="accent-pink-500 w-4 h-4"
                            />
                            <span className="text-sm font-medium text-gray-700">Featured</span>
                        </label>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-pink-500 text-white py-3 rounded-xl font-semibold hover:bg-pink-600 transition-colors disabled:opacity-60"
                        >
                            {loading ? 'Saving...' : isEdit ? '✅ Update Product' : '➕ Add Product'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 border-2 border-gray-200 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default AdminProducts;