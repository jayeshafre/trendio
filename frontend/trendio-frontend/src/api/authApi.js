import axiosInstance from './axios';

export const registerUser = async (userData) => {
    const response = await axiosInstance.post('/auth/register/', userData);
    return response.data;
};

export const loginUser = async (credentials) => {
    const response = await axiosInstance.post('/auth/login/', credentials);
    return response.data;
};

export const logoutUser = async (refreshToken) => {
    const response = await axiosInstance.post('/auth/logout/', {
        refresh: refreshToken
    });
    return response.data;
};

export const getUserProfile = async () => {
    const response = await axiosInstance.get('/auth/profile/');
    return response.data;
};

export const updateUserProfile = async (profileData) => {
    const response = await axiosInstance.put('/auth/profile/', profileData);
    return response.data;
};

export const changePassword = async (passwordData) => {
    const response = await axiosInstance.post('/auth/change-password/', passwordData);
    return response.data;
};

// ─── Forgot Password ──────────────────────────────────────────
export const forgotPassword = async (email) => {
    const response = await axiosInstance.post('/auth/forgot-password/', { email });
    return response.data;
};

// ─── Validate Reset Token ─────────────────────────────────────
export const validateResetToken = async (uid, token) => {
    const response = await axiosInstance.get(`/auth/reset-password/${uid}/${token}/validate/`);
    return response.data;
};

// ─── Reset Password ───────────────────────────────────────────
export const resetPassword = async (uid, token, passwords) => {
    const response = await axiosInstance.post(
        `/auth/reset-password/${uid}/${token}/`,
        passwords
    );
    return response.data;
};