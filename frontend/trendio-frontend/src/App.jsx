import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Common
import Navbar from './components/common/Navbar';
import AdminGuard from './components/admin/AdminGuard';

// Public Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';

// Auth Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Protected Pages
import ProfilePage from './pages/ProfilePage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';

// ─── Route Guards ─────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return <LoadingSpinner />;
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const GuestRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return <LoadingSpinner />;
    return !isAuthenticated ? children : <Navigate to="/" replace />;
};

const LoadingSpinner = () => (
    <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"/>
    </div>
);

// ─── Customer Layout ──────────────────────────────────────────
const CustomerLayout = ({ children }) => (
    <>
        <Navbar />
        {children}
    </>
);

// ─── App Routes ───────────────────────────────────────────────
const AppRoutes = () => (
    <Routes>

        {/* ── Public Customer Routes ────────────────────── */}
        <Route path="/" element={<CustomerLayout><HomePage /></CustomerLayout>} />
        <Route path="/products" element={<CustomerLayout><ProductsPage /></CustomerLayout>} />
        <Route path="/products/:id" element={<CustomerLayout><ProductDetailPage /></CustomerLayout>} />

        {/* ── Guest Only Routes ─────────────────────────── */}
        <Route path="/login" element={
            <GuestRoute><CustomerLayout><LoginPage /></CustomerLayout></GuestRoute>
        } />
        <Route path="/register" element={
            <GuestRoute><CustomerLayout><RegisterPage /></CustomerLayout></GuestRoute>
        } />
        <Route path="/forgot-password" element={
            <GuestRoute><CustomerLayout><ForgotPasswordPage /></CustomerLayout></GuestRoute>
        } />
        <Route path="/reset-password/:uid/:token" element={
            <GuestRoute><CustomerLayout><ResetPasswordPage /></CustomerLayout></GuestRoute>
        } />

        {/* ── Protected Customer Routes ─────────────────── */}
        <Route path="/profile" element={
            <ProtectedRoute><CustomerLayout><ProfilePage /></CustomerLayout></ProtectedRoute>
        } />
        <Route path="/cart" element={
            <ProtectedRoute><CustomerLayout><CartPage /></CustomerLayout></ProtectedRoute>
        } />
        <Route path="/checkout" element={
            <ProtectedRoute><CustomerLayout><CheckoutPage /></CustomerLayout></ProtectedRoute>
        } />
        <Route path="/orders" element={
            <ProtectedRoute><CustomerLayout><OrdersPage /></CustomerLayout></ProtectedRoute>
        } />
        <Route path="/orders/:orderNumber" element={
            <ProtectedRoute><CustomerLayout><OrderDetailPage /></CustomerLayout></ProtectedRoute>
        } />

        {/* ── Admin Routes (No Navbar) ──────────────────── */}
        <Route path="/admin" element={
            <AdminGuard><AdminDashboard /></AdminGuard>
        } />
        <Route path="/admin/products" element={
            <AdminGuard><AdminProducts /></AdminGuard>
        } />
        <Route path="/admin/categories" element={
            <AdminGuard><AdminCategories /></AdminGuard>
        } />
        <Route path="/admin/orders" element={
            <AdminGuard><AdminOrders /></AdminGuard>
        } />

        {/* ── Fallback ──────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
);

// ─── Root App ─────────────────────────────────────────────────
function App() {
    return (
        <Router>
            <AuthProvider>
                <CartProvider>
                    <AppRoutes />
                </CartProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;