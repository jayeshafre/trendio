import axiosInstance from './axios';

// ─── Categories ───────────────────────────────────────────────
export const getCategories = async () => {
    const response = await axiosInstance.get('/products/categories/');
    return response.data;
};

// ─── Products ─────────────────────────────────────────────────
export const getProducts = async (params = {}) => {
    const response = await axiosInstance.get('/products/', { params });
    return response.data;
};

export const getProductDetail = async (id) => {
    const response = await axiosInstance.get(`/products/${id}/`);
    return response.data;
};

export const getFeaturedProducts = async () => {
    const response = await axiosInstance.get('/products/featured/');
    return response.data;
};

export const getProductsByCategory = async (slug) => {
    const response = await axiosInstance.get(`/products/category/${slug}/`);
    return response.data;
};