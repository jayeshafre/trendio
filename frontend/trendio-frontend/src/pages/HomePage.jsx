import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
    const { isAuthenticated, user } = useAuth();
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                <h1 className="text-5xl font-bold text-gray-800 mb-4">
                    Welcome to <span className="text-primary-600">Trendio</span>
                </h1>
                <p className="text-xl text-gray-500 mb-8">Your one-stop shop for everything trendy</p>
                {isAuthenticated ? (
                    <div>
                        <p className="text-lg text-gray-600 mb-6">
                            Hello, <span className="font-bold text-primary-600">{user?.first_name || user?.username}</span>! Ready to shop?
                        </p>
                        <Link to="/products" className="bg-primary-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary-700 transition-colors">
                            Browse Products →
                        </Link>
                    </div>
                ) : (
                    <div className="flex gap-4 justify-center">
                        <Link to="/register" className="bg-primary-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary-700 transition-colors">
                            Get Started Free
                        </Link>
                        <Link to="/login" className="border-2 border-primary-600 text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary-50 transition-colors">
                            Login
                        </Link>
                    </div>
                )}
                <div className="mt-20 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <p className="text-gray-400 text-sm font-medium uppercase tracking-wide">Coming in Module 2</p>
                    <p className="text-2xl font-bold text-gray-700 mt-2">🛍️ Product Catalog</p>
                </div>
            </div>
        </div>
    );
};

export default HomePage;