import axiosInstance from './axios';

// ─── Get Cart ─────────────────────────────────────────────────
export const getCart = async () => {
    const response = await axiosInstance.get('/cart/');
    return response.data;
};

// ─── Get Cart Count ───────────────────────────────────────────
export const getCartCount = async () => {
    const response = await axiosInstance.get('/cart/count/');
    return response.data.count;
};

// ─── Add to Cart ──────────────────────────────────────────────
export const addToCart = async (productId, quantity = 1) => {
    const response = await axiosInstance.post('/cart/add/', {
        product_id: productId,
        quantity,
    });
    return response.data;
};

// ─── Update Quantity ──────────────────────────────────────────
export const updateCartItem = async (itemId, quantity) => {
    const response = await axiosInstance.put(`/cart/update/${itemId}/`, {
        quantity,
    });
    return response.data;
};

// ─── Remove Item ──────────────────────────────────────────────
export const removeCartItem = async (itemId) => {
    const response = await axiosInstance.delete(`/cart/remove/${itemId}/`);
    return response.data;
};

// ─── Clear Cart ───────────────────────────────────────────────
export const clearCart = async () => {
    const response = await axiosInstance.delete('/cart/clear/');
    return response.data;
};