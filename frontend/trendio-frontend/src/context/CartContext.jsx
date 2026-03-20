import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCart, getCartCount, addToCart, updateCartItem, removeCartItem, clearCart } from '../api/cartApi';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [cart, setCart]         = useState(null);
    const [cartCount, setCartCount] = useState(0);
    const [loading, setLoading]   = useState(false);

    // Fetch cart when user logs in
    useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
        } else {
            setCart(null);
            setCartCount(0);
        }
    }, [isAuthenticated]);

    const fetchCart = async () => {
        try {
            const data = await getCart();
            setCart(data);
            setCartCount(data.total_items || 0);
        } catch (error) {
            console.error('Failed to fetch cart:', error);
        }
    };

    // ─── Add to Cart ─────────────────────────────────────────
    const addItem = async (productId, quantity = 1) => {
        setLoading(true);
        try {
            const data = await addToCart(productId, quantity);
            setCart(data.cart);
            setCartCount(data.cart.total_items);
            toast.success('Added to cart! 🛒');
            return true;
        } catch (error) {
            const msg = error.response?.data?.error || 'Failed to add to cart.';
            toast.error(msg);
            return false;
        } finally {
            setLoading(false);
        }
    };

    // ─── Update Quantity ──────────────────────────────────────
    const updateItem = async (itemId, quantity) => {
        setLoading(true);
        try {
            const data = await updateCartItem(itemId, quantity);
            setCart(data.cart);
            setCartCount(data.cart.total_items);
            return true;
        } catch (error) {
            const msg = error.response?.data?.error || 'Failed to update cart.';
            toast.error(msg);
            return false;
        } finally {
            setLoading(false);
        }
    };

    // ─── Remove Item ──────────────────────────────────────────
    const removeItem = async (itemId) => {
        setLoading(true);
        try {
            const data = await removeCartItem(itemId);
            setCart(data.cart);
            setCartCount(data.cart.total_items);
            toast.success('Item removed from cart.');
            return true;
        } catch (error) {
            toast.error('Failed to remove item.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    // ─── Clear Cart ───────────────────────────────────────────
    const emptyCart = async () => {
        setLoading(true);
        try {
            const data = await clearCart();
            setCart(data.cart);
            setCartCount(0);
            toast.success('Cart cleared.');
            return true;
        } catch (error) {
            toast.error('Failed to clear cart.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return (
        <CartContext.Provider value={{
            cart,
            cartCount,
            loading,
            fetchCart,
            addItem,
            updateItem,
            removeItem,
            emptyCart,
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within CartProvider');
    return context;
};

export default CartContext;