import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { forgotPassword } from '../api/authApi';

const ForgotPasswordPage = () => {
    const [email, setEmail]       = useState('');
    const [loading, setLoading]   = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError]       = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            setError('Email is required');
            return;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Enter a valid email address');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await forgotPassword(email);
            setSubmitted(true);
        } catch (error) {
            const serverError = error.response?.data;
            if (serverError?.email) {
                setError(serverError.email[0] || serverError.email);
            } else if (serverError?.message) {
                setError(serverError.message);
            } else {
                toast.error('Something went wrong. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // ─── Success State ────────────────────────────────────────
    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-gray-100 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">

                        {/* Success Icon */}
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Check your email
                        </h2>
                        <p className="text-gray-500 text-sm mb-2">
                            We sent a password reset link to:
                        </p>
                        <p className="text-pink-500 font-semibold mb-6">
                            {email}
                        </p>
                        <p className="text-gray-400 text-xs mb-8">
                            Didn't receive the email? Check your spam folder or try again.
                        </p>

                        <div className="space-y-3">
                            <button
                                onClick={() => setSubmitted(false)}
                                className="w-full border-2 border-pink-500 text-pink-500 py-3 rounded-lg font-semibold text-sm hover:bg-pink-50 transition-colors"
                            >
                                Try a different email
                            </button>
                            <Link
                                to="/login"
                                className="block w-full text-center text-gray-500 text-sm hover:text-gray-700"
                            >
                                Back to Login
                            </Link>
                        </div>

                    </div>
                </div>
            </div>
        );
    }

    // ─── Form State ───────────────────────────────────────────
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

                        {/* Lock Icon */}
                        <div className="w-14 h-14 bg-pink-100 rounded-full flex items-center justify-center mx-auto mt-4 mb-4">
                            <svg className="w-7 h-7 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>

                        <h2 className="text-xl font-bold text-gray-800">
                            Forgot your password?
                        </h2>
                        <p className="text-gray-500 text-sm mt-2">
                            No worries! Enter your email and we'll send you a reset link.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Email Address"
                            type="email"
                            name="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (error) setError('');
                            }}
                            placeholder="john@example.com"
                            error={error}
                            required
                        />

                        <Button
                            type="submit"
                            loading={loading}
                            fullWidth
                        >
                            Send Reset Link
                        </Button>
                    </form>

                    {/* Back to Login */}
                    <p className="text-center text-sm text-gray-500 mt-6">
                        Remember your password?{' '}
                        <Link
                            to="/login"
                            className="text-pink-500 font-semibold hover:underline"
                        >
                            Back to Login
                        </Link>
                    </p>

                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;