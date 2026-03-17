import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const navigate  = useNavigate();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [errors, setErrors]     = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.email)    newErrors.email    = 'Email is required';
        if (!formData.password) newErrors.password = 'Password is required';
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
        setLoading(true);
        try {
            const data = await login(formData.email, formData.password);
            toast.success(data.message || 'Welcome back!');
            navigate('/');
        } catch (error) {
            const serverError = error.response?.data?.error;
            toast.error(serverError || 'Login failed. Please try again.');
            if (serverError) setErrors({ general: serverError });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-gray-100 flex items-center justify-center p-4">
            <Toaster position="top-right" />
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-primary-600 mb-1">Trendio</h1>
                        <h2 className="text-xl font-semibold text-gray-800">Welcome back</h2>
                        <p className="text-gray-500 text-sm mt-1">Login to continue shopping</p>
                    </div>
                    {errors.general && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
                            ⚠ {errors.general}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" error={errors.email} required />
                        {/* Password field with forgot password link */}
<div>
    <div className="flex justify-between items-center mb-1">
        <label className="text-sm font-medium text-gray-700">
            Password <span className="text-red-500">*</span>
        </label>
        <Link
            to="/forgot-password"
            className="text-xs text-pink-500 hover:underline font-medium"
        >
            Forgot password?
        </Link>
    </div>
    <input
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Enter your password"
        className={`w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-200 ${
            errors.password
                ? 'border-red-400 bg-red-50'
                : 'border-gray-300 bg-white focus:border-pink-500'
        }`}
    />
    {errors.password && (
        <p className="text-xs text-red-500 mt-1">⚠ {errors.password}</p>
    )}
</div>
                        <Button type="submit" loading={loading} fullWidth>Login</Button>
                    </form>
                    <p className="text-center text-sm text-gray-500 mt-6">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary-600 font-semibold hover:underline">Sign up for free</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;