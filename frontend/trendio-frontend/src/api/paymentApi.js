import axiosInstance from './axios';

// ─── Create Payment ───────────────────────────────────────────
export const createPayment = async (orderNumber) => {
    const response = await axiosInstance.post('/payments/create/', {
        order_number: orderNumber
    });
    return response.data;
};

// ─── Verify Payment ───────────────────────────────────────────
export const verifyPayment = async (paymentData) => {
    const response = await axiosInstance.post('/payments/verify/', paymentData);
    return response.data;
};

// ─── Record Failed Payment ────────────────────────────────────
export const recordFailedPayment = async (razorpayOrderId) => {
    const response = await axiosInstance.post('/payments/failed/', {
        razorpay_order_id: razorpayOrderId
    });
    return response.data;
};

// ─── Get Payment Status ───────────────────────────────────────
export const getPaymentStatus = async (orderNumber) => {
    const response = await axiosInstance.get(`/payments/status/${orderNumber}/`);
    return response.data;
};