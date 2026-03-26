import React, { createContext, useState, useContext, useEffect } from 'react'
import { loginUser, logoutUser, getUserProfile } from '../api/authApi'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // ── On App Load ───────────────────────────────────────────
  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = localStorage.getItem('access_token')
      if (accessToken) {
        try {
          // Always fetch full profile — includes is_staff
          const profile = await getUserProfile()
          console.log('initializeAuth profile:', profile)
          setUser(profile)
        } catch (error) {
          console.log('initializeAuth error:', error)
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          setUser(null)
        }
      }
      setLoading(false)
    }
    initializeAuth()
  }, [])

  // ── Login ─────────────────────────────────────────────────
  const login = async (email, password) => {
    const data = await loginUser({ email, password })

    // Save tokens first
    localStorage.setItem('access_token', data.tokens.access)
    localStorage.setItem('refresh_token', data.tokens.refresh)

    // Always fetch profile after login
    // This guarantees is_staff is included
    try {
      const profile = await getUserProfile()
      console.log('login profile:', profile)
      setUser(profile)
    } catch (error) {
      // Fallback to login response user
      console.log('login profile fallback:', data.user)
      setUser(data.user)
    }

    return data
  }

  // ── Logout ────────────────────────────────────────────────
  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      await logoutUser(refreshToken)
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      isAuthenticated: !!user,
      setUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export default AuthContext