import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { registerUser } from '../api/authApi';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '', username: '', first_name: '', last_name: '',
        phone_number: '', password: '', password2: '',
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.email)       newErrors.email      = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Enter a valid email';
        if (!formData.username)    newErrors.username   = 'Username is required';
        if (!formData.first_name)  newErrors.first_name = 'First name is required';
        if (!formData.password)    newErrors.password   = 'Password is required';
        else if (formData.password.length < 8) newErrors.password = 'Min 8 characters';
        if (formData.password !== formData.password2) newErrors.password2 = 'Passwords do not match';
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
        setLoading(true);
        try {
            await registerUser(formData);
            toast.success('Account created! Please login.');
            navigate('/login');
        } catch (error) {
            const serverErrors = error.response?.data;
            if (serverErrors) {
                const mappedErrors = {};
                Object.keys(serverErrors).forEach(key => {
                    mappedErrors[key] = Array.isArray(serverErrors[key]) ? serverErrors[key][0] : serverErrors[key];
                });
                setErrors(mappedErrors);
            }
            toast.error('Registration failed. Please fix the errors.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-gray-100 flex items-center justify-center p-4">
            <Toaster position="top-right" />
            <div className="w-full max-w-lg">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-primary-600 mb-1">Trendio</h1>
                        <h2 className="text-xl font-semibold text-gray-800">Create your account</h2>
                        <p className="text-gray-500 text-sm mt-1">Join thousands of happy shoppers</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} placeholder="John" error={errors.first_name} required />
                            <Input label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Doe" error={errors.last_name} />
                        </div>
                        <Input label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" error={errors.email} required />
                        <Input label="Username" name="username" value={formData.username} onChange={handleChange} placeholder="johndoe" error={errors.username} required />
                        <Input label="Phone Number" type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange} placeholder="9876543210" error={errors.phone_number} />
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Password" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Min 8 characters" error={errors.password} required />
                            <Input label="Confirm Password" type="password" name="password2" value={formData.password2} onChange={handleChange} placeholder="Repeat password" error={errors.password2} required />
                        </div>
                        <Button type="submit" loading={loading} fullWidth>Create Account</Button>
                    </form>
                    <p className="text-center text-sm text-gray-500 mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary-600 font-semibold hover:underline">Login here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;