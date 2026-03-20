import axiosInstance from './axios';

// ─── Place Order ──────────────────────────────────────────────
export const placeOrder = async (orderData) => {
    const response = await axiosInstance.post('/orders/place/', orderData);
    return response.data;
};

// ─── Get My Orders ────────────────────────────────────────────
export const getMyOrders = async () => {
    const response = await axiosInstance.get('/orders/');
    return response.data;
};

// ─── Get Order Detail ─────────────────────────────────────────
export const getOrderDetail = async (orderNumber) => {
    const response = await axiosInstance.get(`/orders/${orderNumber}/`);
    return response.data;
};

// ─── Cancel Order ─────────────────────────────────────────────
export const cancelOrder = async (orderNumber) => {
    const response = await axiosInstance.post(`/orders/${orderNumber}/cancel/`);
    return response.data;
};