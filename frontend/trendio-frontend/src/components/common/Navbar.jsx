import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate   = useNavigate();
    const [, setSearchParams] = useSearchParams();
    const [search, setSearch] = useState('');
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Logged out successfully!');
            navigate('/login');
        } catch {
            toast.error('Logout failed.');
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (search.trim()) {
            navigate(`/products?search=${encodeURIComponent(search.trim())}`);
            setSearch('');
        }
    };

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16 gap-4">

                    {/* Logo */}
                    <Link to="/" className="text-2xl font-bold text-pink-500 flex-shrink-0">
                        Trendio
                    </Link>

                    {/* Category Links */}
                    <div className="hidden md:flex items-center gap-1">
                        {[
                            { label: '👔 Men',   slug: 'men'   },
                            { label: '👗 Women', slug: 'women' },
                            { label: '🧸 Kids',  slug: 'kids'  },
                        ].map(cat => (
                            <Link
                                key={cat.slug}
                                to={`/products?category=${cat.slug}`}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-pink-500 hover:bg-pink-50 rounded-lg transition-colors"
                            >
                                {cat.label}
                            </Link>
                        ))}
                    </div>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="flex-1 max-w-sm">
                        <div className="flex items-center border border-gray-300 rounded-full overflow-hidden focus-within:ring-2 focus-within:ring-pink-500 focus-within:border-pink-500">
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search products..."
                                className="flex-1 px-4 py-2 text-sm focus:outline-none"
                            />
                            <button
                                type="submit"
                                className="bg-pink-500 text-white px-4 py-2 text-sm hover:bg-pink-600 transition-colors"
                            >
                                🔍
                            </button>
                        </div>
                    </form>

                    {/* Auth Section */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                        {isAuthenticated ? (
                            <>
                                <span className="text-sm text-gray-600 hidden md:block">
                                    👋 <span className="font-semibold">{user?.first_name || user?.username}</span>
                                </span>
                                <Link
                                    to="/profile"
                                    className="text-sm font-medium text-pink-500 hover:underline"
                                >
                                    Profile
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="text-sm font-medium text-gray-500 hover:text-red-500 transition-colors"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-sm font-medium text-gray-600 hover:text-pink-500"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-pink-500 text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-pink-600 transition-colors"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>

                </div>
            </div>
        </nav>
    );
};

export default Navbar;