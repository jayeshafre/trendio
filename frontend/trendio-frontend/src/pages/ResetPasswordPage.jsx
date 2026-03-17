import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { validateResetToken, resetPassword } from '../api/authApi';

const ResetPasswordPage = () => {
    const { uid, token } = useParams();
    const navigate       = useNavigate();

    const [formData, setFormData]   = useState({ new_password: '', new_password2: '' });
    const [errors, setErrors]       = useState({});
    const [loading, setLoading]     = useState(false);
    const [validating, setValidating] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [userEmail, setUserEmail]   = useState('');

    // ─── Validate Token on Page Load ─────────────────────────
    useEffect(() => {
        const checkToken = async () => {
            try {
                const data = await validateResetToken(uid, token);
                setTokenValid(true);
                setUserEmail(data.email);
            } catch (error) {
                setTokenValid(false);
            } finally {
                setValidating(false);
            }
        };
        checkToken();
    }, [uid, token]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.new_password)
            newErrors.new_password = 'Password is required';
        else if (formData.new_password.length < 8)
            newErrors.new_password = 'Password must be at least 8 characters';
        if (!formData.new_password2)
            newErrors.new_password2 = 'Please confirm your password';
        else if (formData.new_password !== formData.new_password2)
            newErrors.new_password2 = 'Passwords do not match';
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);

        try {
            await resetPassword(uid, token, formData);
            toast.success('Password reset successful!');
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            const serverError = error.response?.data;
            if (serverError?.error) {
                toast.error(serverError.error);
            } else if (serverError?.new_password) {
                setErrors({ new_password: serverError.new_password[0] });
            } else {
                toast.error('Reset failed. Please request a new link.');
            }
        } finally {
            setLoading(false);
        }
    };

    // ─── Loading State ────────────────────────────────────────
    if (validating) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-500 text-sm">Validating reset link...</p>
                </div>
            </div>
        );
    }

    // ─── Invalid Token State ──────────────────────────────────
    if (!tokenValid) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-gray-100 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">

                        {/* Error Icon */}
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Link Expired
                        </h2>
                        <p className="text-gray-500 text-sm mb-8">
                            This password reset link is invalid or has expired.
                            Please request a new one.
                        </p>

                        <Link
                            to="/forgot-password"
                            className="block w-full bg-pink-500 text-white py-3 rounded-lg font-semibold text-sm hover:bg-pink-600 transition-colors text-center"
                        >
                            Request New Link
                        </Link>
                        <Link
                            to="/login"
                            className="block w-full text-center text-gray-500 text-sm mt-3 hover:text-gray-700"
                        >
                            Back to Login
                        </Link>

                    </div>
                </div>
            </div>
        );
    }

    // ─── Reset Form ───────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-gray-100 flex items-center justify-center p-4">
            <Toaster position="top-right" />
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-lg p-8">

                    {/* Header */}
                    <div className="text-center mb-8">
                        <Link to="/" className="text-2xl font-bold text-pink-500">
                            Trendio
                        </Link>

                        <div className="w-14 h-14 bg-pink-100 rounded-full flex items-center justify-center mx-auto mt-4 mb-4">
                            <svg className="w-7 h-7 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                        </div>

                        <h2 className="text-xl font-bold text-gray-800">
                            Set new password
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">
                            for <span className="text-pink-500 font-medium">{userEmail}</span>
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="New Password"
                            type="password"
                            name="new_password"
                            value={formData.new_password}
                            onChange={handleChange}
                            placeholder="Min 8 characters"
                            error={errors.new_password}
                            required
                        />
                        <Input
                            label="Confirm New Password"
                            type="password"
                            name="new_password2"
                            value={formData.new_password2}
                            onChange={handleChange}
                            placeholder="Repeat new password"
                            error={errors.new_password2}
                            required
                        />

                        {/* Password Rules */}
                        <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 space-y-1">
                            <p className={formData.new_password.length >= 8 ? 'text-green-500' : ''}>
                                {formData.new_password.length >= 8 ? '✅' : '○'} At least 8 characters
                            </p>
                            <p className={/[A-Z]/.test(formData.new_password) ? 'text-green-500' : ''}>
                                {/[A-Z]/.test(formData.new_password) ? '✅' : '○'} One uppercase letter
                            </p>
                            <p className={/[0-9]/.test(formData.new_password) ? 'text-green-500' : ''}>
                                {/[0-9]/.test(formData.new_password) ? '✅' : '○'} One number
                            </p>
                        </div>

                        <Button
                            type="submit"
                            loading={loading}
                            fullWidth
                        >
                            Reset Password
                        </Button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        <Link to="/login" className="text-pink-500 font-semibold hover:underline">
                            Back to Login
                        </Link>
                    </p>

                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;