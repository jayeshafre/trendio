import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast'
import Input from '../components/common/Input'
import { forgotPassword } from '../api/authApi'

const ForgotPasswordPage = () => {
  const [email, setEmail]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError]         = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) { setError('Email is required'); return }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Enter a valid email'); return }

    setLoading(true)
    setError('')
    try {
      await forgotPassword(email)
      setSubmitted(true)
    } catch (error) {
      const serverError = error.response?.data
      if (serverError?.email) setError(serverError.email[0] || serverError.email)
      else toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex">

        {/* Left Image */}
        <div className="hidden lg:block flex-1 relative overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&auto=format&fit=crop&q=80"
            alt="Fashion"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40"/>
        </div>

        {/* Right */}
        <div className="flex-1 lg:max-w-md flex flex-col justify-center px-12 py-16">
          <Link to="/" className="font-serif text-2xl font-bold tracking-wider text-black mb-16 block">
            TRENDIO
          </Link>

          <div className="text-center">
            {/* Check Icon */}
            <div className="w-16 h-16 border-2 border-gold flex items-center justify-center mx-auto mb-8">
              <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7"/>
              </svg>
            </div>

            <p className="text-gold text-xs tracking-widest uppercase mb-3">Email Sent</p>
            <h2 className="font-serif text-3xl font-normal mb-4">Check Your Inbox</h2>
            <p className="text-luxury-midgray text-sm tracking-wide mb-2">
              We sent a password reset link to:
            </p>
            <p className="text-black font-medium text-sm mb-8">{email}</p>
            <p className="text-luxury-midgray text-xs tracking-wide mb-10">
              Didn't receive it? Check your spam folder or try again.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => setSubmitted(false)}
                className="w-full border border-black text-black text-xs tracking-widest uppercase py-3 hover:bg-black hover:text-white transition-all"
              >
                Try Different Email
              </button>
              <Link
                to="/login"
                className="block text-xs tracking-widest uppercase text-luxury-midgray hover:text-black transition-colors text-center mt-4"
              >
                ← Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

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
            Reset Your<br /><em>Password</em>
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
          <p className="text-gold text-xs tracking-widest uppercase mb-2">Account Recovery</p>
          <h1 className="font-serif text-3xl font-normal mb-3">Forgot Password?</h1>
          <p className="text-luxury-midgray text-sm tracking-wide leading-relaxed">
            Enter your email address and we'll send you a secure link to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email Address"
            type="email"
            name="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (error) setError('') }}
            placeholder="your@email.com"
            error={error}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white text-xs tracking-widest uppercase py-4 hover:bg-luxury-darkgray transition-all disabled:opacity-40"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="text-xs tracking-wide text-luxury-midgray mt-8 text-center">
          Remember your password?{' '}
          <Link to="/login" className="text-black border-b border-black hover:text-gold hover:border-gold transition-colors">
            Sign In
          </Link>
        </p>

      </div>
    </div>
  )
}

export default ForgotPasswordPage