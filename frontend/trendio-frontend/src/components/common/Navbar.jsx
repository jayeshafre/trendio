import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Logged out successfully!');
            navigate('/login');
        } catch (error) {
            toast.error('Logout failed.');
        }
    };

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="text-2xl font-bold text-primary-600">Trendio</Link>
                    <div className="flex items-center gap-6">
                        <Link to="/" className="text-gray-600 hover:text-primary-600 text-sm font-medium">Home</Link>
                        <Link to="/products" className="text-gray-600 hover:text-primary-600 text-sm font-medium">Products</Link>
                    </div>
                    <div className="flex items-center gap-3">
                        {isAuthenticated ? (
                            <>
                                <span className="text-sm text-gray-600">
                                    👋 Hello, <span className="font-semibold">{user?.first_name || user?.username}</span>
                                </span>
                                <Link to="/profile" className="text-sm font-medium text-primary-600">Profile</Link>
                                <button onClick={handleLogout} className="text-sm font-medium text-gray-500 hover:text-red-500">Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-primary-600">Login</Link>
                                <Link to="/register" className="bg-primary-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary-700">Sign Up</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;