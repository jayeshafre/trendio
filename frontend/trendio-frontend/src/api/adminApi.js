import axiosInstance from './axios';

// ─── Dashboard Stats ──────────────────────────────────────────
export const getDashboardStats = async () => {
    const response = await axiosInstance.get('/orders/admin/stats/');
    return response.data;
};

// ─── Admin Products ───────────────────────────────────────────
export const getAdminProducts = async () => {
    const response = await axiosInstance.get('/products/admin/all/');
    return response.data;
};

export const createProduct = async (formData) => {
    const response = await axiosInstance.post('/products/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export const updateProduct = async (id, formData) => {
    const response = await axiosInstance.put(`/products/${id}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export const deleteProduct = async (id) => {
    const response = await axiosInstance.delete(`/products/${id}/`);
    return response.data;
};

// ─── Admin Categories ─────────────────────────────────────────
export const createCategory = async (data) => {
    const response = await axiosInstance.post('/products/categories/', data);
    return response.data;
};

export const updateCategory = async (id, data) => {
    const response = await axiosInstance.put(`/products/categories/${id}/`, data);
    return response.data;
};

export const deleteCategory = async (id) => {
    const response = await axiosInstance.delete(`/products/categories/${id}/`);
    return response.data;
};

// ─── Admin Orders ─────────────────────────────────────────────
export const getAdminOrders = async (statusFilter = '') => {
    const params = statusFilter ? { status: statusFilter } : {};
    const response = await axiosInstance.get('/orders/admin/all/', { params });
    return response.data;
};

export const updateOrderStatus = async (orderNumber, newStatus) => {
    const response = await axiosInstance.put(
        `/orders/admin/${orderNumber}/status/`,
        { status: newStatus }
    );
    return response.data;
};