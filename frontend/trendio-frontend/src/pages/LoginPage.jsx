import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast'
import Input from '../components/common/Input'
import { useAuth } from '../context/AuthContext'

const LoginPage = () => {
  const navigate  = useNavigate()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors]     = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.email)    newErrors.email    = 'Email is required'
    if (!formData.password) newErrors.password = 'Password is required'
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setLoading(true)
    try {
      await login(formData.email, formData.password)
      toast.success('Welcome back.')
      navigate('/')
    } catch (error) {
      const serverError = error.response?.data?.error
      toast.error(serverError || 'Invalid credentials.')
      if (serverError) setErrors({ general: serverError })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex">
      <Toaster position="top-right" />

      {/* Left — Image */}
      <div className="hidden lg:block flex-1 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&auto=format&fit=crop&q=80"
          alt="Fashion"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30"/>
        <div className="absolute bottom-12 left-12">
          <h2 className="font-serif text-5xl text-white font-normal leading-tight">
            Welcome<br /><em>Back</em>
          </h2>
          <div className="w-12 h-px bg-gold mt-4"/>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 lg:max-w-md flex flex-col justify-center px-12 py-16">

        {/* Logo */}
        <Link to="/" className="font-serif text-2xl font-bold tracking-wider text-black mb-12 block">
          TRENDIO
        </Link>

        <div className="mb-8">
          <p className="text-gold text-xs tracking-widest uppercase mb-2">Welcome Back</p>
          <h1 className="font-serif text-3xl font-normal">Sign In</h1>
        </div>

        {errors.general && (
          <div className="border-l-2 border-red-400 pl-4 mb-6">
            <p className="text-xs text-red-500 tracking-wide">{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your@email.com"
            error={errors.email}
            required
          />
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-medium tracking-widest uppercase text-luxury-darkgray">
                Password <span className="text-gold">*</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-xs tracking-widest uppercase text-luxury-midgray hover:text-gold transition-colors"
              >
                Forgot?
              </Link>
            </div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={`w-full px-4 py-3 bg-white border-b-2 text-sm focus:outline-none transition-all duration-300 ${
                errors.password ? 'border-red-400' : 'border-luxury-gray focus:border-black'
              }`}
            />
            {errors.password && (
              <p className="text-xs text-red-500 mt-1 tracking-wide">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white text-xs tracking-widest uppercase py-4 hover:bg-luxury-darkgray transition-all duration-300 disabled:opacity-40"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p className="text-xs tracking-wide text-luxury-midgray mt-8 text-center">
          New to Trendio?{' '}
          <Link to="/register" className="text-black border-b border-black hover:text-gold hover:border-gold transition-colors">
            Create Account
          </Link>
        </p>

      </div>
    </div>
  )
}

export default LoginPage