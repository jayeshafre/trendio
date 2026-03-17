import React, { createContext, useState, useContext, useEffect } from 'react';
import { loginUser, logoutUser, getUserProfile } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser]       = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            const accessToken = localStorage.getItem('access_token');
            if (accessToken) {
                try {
                    const profile = await getUserProfile();
                    setUser(profile);
                } catch (error) {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                }
            }
            setLoading(false);
        };
        initializeAuth();
    }, []);

    const login = async (email, password) => {
        const data = await loginUser({ email, password });
        localStorage.setItem('access_token', data.tokens.access);
        localStorage.setItem('refresh_token', data.tokens.refresh);
        setUser(data.user);
        return data;
    };

    const logout = async () => {
        try {
            const refreshToken = localStorage.getItem('refresh_token');
            await logoutUser(refreshToken);
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            logout,
            isAuthenticated: !!user,
            setUser
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export default AuthContext;