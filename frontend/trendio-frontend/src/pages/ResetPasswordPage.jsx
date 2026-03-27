import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast'
import Input from '../components/common/Input'
import { validateResetToken, resetPassword } from '../api/authApi'

const ResetPasswordPage = () => {
  const { uid, token } = useParams()
  const navigate       = useNavigate()

  const [formData, setFormData]     = useState({ new_password: '', new_password2: '' })
  const [errors, setErrors]         = useState({})
  const [loading, setLoading]       = useState(false)
  const [validating, setValidating] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [userEmail, setUserEmail]   = useState('')

  useEffect(() => {
    const checkToken = async () => {
      try {
        const data = await validateResetToken(uid, token)
        setTokenValid(true)
        setUserEmail(data.email)
      } catch {
        setTokenValid(false)
      } finally {
        setValidating(false)
      }
    }
    checkToken()
  }, [uid, token])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.new_password || formData.new_password.length < 8)
      newErrors.new_password = 'Min 8 characters'
    if (formData.new_password !== formData.new_password2)
      newErrors.new_password2 = 'Passwords do not match'
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
      await resetPassword(uid, token, formData)
      toast.success('Password reset successfully.')
      setTimeout(() => navigate('/login'), 2000)
    } catch (error) {
      const serverError = error.response?.data
      if (serverError?.error) toast.error(serverError.error)
      else if (serverError?.new_password) setErrors({ new_password: serverError.new_password[0] })
      else toast.error('Reset failed. Please request a new link.')
    } finally {
      setLoading(false)
    }
  }

  // Loading
  if (validating) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-px h-16 bg-gold animate-pulse"/>
        <p className="text-xs tracking-widest uppercase text-luxury-midgray">Validating Link</p>
      </div>
    </div>
  )

  // Invalid Token
  if (!tokenValid) return (
    <div className="min-h-screen bg-white flex">
      <div className="hidden lg:block flex-1 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&auto=format&fit=crop&q=80"
          alt="Fashion"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"/>
      </div>
      <div className="flex-1 lg:max-w-md flex flex-col justify-center px-12 py-16">
        <Link to="/" className="font-serif text-2xl font-bold tracking-wider text-black mb-16 block">
          TRENDIO
        </Link>
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-red-300 flex items-center justify-center mx-auto mb-8">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </div>
          <p className="text-gold text-xs tracking-widest uppercase mb-3">Link Expired</p>
          <h2 className="font-serif text-3xl font-normal mb-4">Reset Link Invalid</h2>
          <p className="text-luxury-midgray text-sm tracking-wide mb-10">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Link
            to="/forgot-password"
            className="block w-full bg-black text-white text-xs tracking-widest uppercase py-4 hover:bg-luxury-darkgray transition-all text-center mb-4"
          >
            Request New Link
          </Link>
          <Link
            to="/login"
            className="text-xs tracking-widest uppercase text-luxury-midgray hover:text-black transition-colors"
          >
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white flex">
      <Toaster position="top-right" />

      {/* Left Image */}
      <div className="hidden lg:block flex-1 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&auto=format&fit=crop&q=80"
          alt="Fashion"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"/>
        <div className="absolute bottom-12 left-12">
          <h2 className="font-serif text-5xl text-white font-normal leading-tight">
            New<br /><em>Password</em>
          </h2>
          <div className="w-12 h-px bg-gold mt-4"/>
        </div>
      </div>

      {/* Right Form */}
      <div className="flex-1 lg:max-w-md flex flex-col justify-center px-12 py-16">

        <Link to="/" className="font-serif text-2xl font-bold tracking-wider text-black mb-16 block">
          TRENDIO
        </Link>

        <div className="mb-10">
          <p className="text-gold text-xs tracking-widest uppercase mb-2">Security</p>
          <h1 className="font-serif text-3xl font-normal mb-2">Set New Password</h1>
          <p className="text-luxury-midgray text-xs tracking-widest">for {userEmail}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="New Password"
            type="password"
            name="new_password"
            value={formData.new_password}
            onChange={handleChange}
            placeholder="Min 8 characters"
            error={errors.new_password}
            required
          />
          <Input
            label="Confirm New Password"
            type="password"
            name="new_password2"
            value={formData.new_password2}
            onChange={handleChange}
            placeholder="Repeat new password"
            error={errors.new_password2}
            required
          />

          {/* Password Rules */}
          <div className="space-y-1.5 border-l-2 border-luxury-gray pl-4">
            {[
              { rule: formData.new_password.length >= 8, label: 'At least 8 characters' },
              { rule: /[A-Z]/.test(formData.new_password), label: 'One uppercase letter' },
              { rule: /[0-9]/.test(formData.new_password), label: 'One number' },
            ].map(item => (
              <p key={item.label} className={`text-xs tracking-wide transition-colors ${
                item.rule ? 'text-black' : 'text-luxury-midgray'
              }`}>
                {item.rule ? '✓' : '○'} {item.label}
              </p>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white text-xs tracking-widest uppercase py-4 hover:bg-luxury-darkgray transition-all disabled:opacity-40"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <Link
          to="/login"
          className="text-xs tracking-widest uppercase text-luxury-midgray hover:text-black transition-colors text-center mt-8 block"
        >
          ← Back to Sign In
        </Link>

      </div>
    </div>
  )
}

export default ResetPasswordPage