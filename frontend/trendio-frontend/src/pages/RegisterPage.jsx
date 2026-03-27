import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast'
import Input from '../components/common/Input'
import { registerUser } from '../api/authApi'

const RegisterPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '', username: '', first_name: '', last_name: '',
    phone_number: '', password: '', password2: '',
  })
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.email)      newErrors.email      = 'Email is required'
    if (!formData.username)   newErrors.username   = 'Username is required'
    if (!formData.first_name) newErrors.first_name = 'First name is required'
    if (!formData.password || formData.password.length < 8)
                              newErrors.password   = 'Min 8 characters'
    if (formData.password !== formData.password2)
                              newErrors.password2  = 'Passwords do not match'
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
      await registerUser(formData)
      toast.success('Account created. Please sign in.')
      navigate('/login')
    } catch (error) {
      const serverErrors = error.response?.data
      if (serverErrors) {
        const mapped = {}
        Object.keys(serverErrors).forEach(key => {
          mapped[key] = Array.isArray(serverErrors[key]) ? serverErrors[key][0] : serverErrors[key]
        })
        setErrors(mapped)
      }
      toast.error('Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex">
      <Toaster position="top-right" />

      {/* Left — Form */}
      <div className="flex-1 lg:max-w-lg flex flex-col justify-center px-12 py-16 overflow-y-auto">

        <Link to="/" className="font-serif text-2xl font-bold tracking-wider text-black mb-12 block">
          TRENDIO
        </Link>

        <div className="mb-8">
          <p className="text-gold text-xs tracking-widest uppercase mb-2">New Member</p>
          <h1 className="font-serif text-3xl font-normal">Create Account</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" name="first_name" value={formData.first_name}
              onChange={handleChange} placeholder="John" error={errors.first_name} required />
            <Input label="Last Name" name="last_name" value={formData.last_name}
              onChange={handleChange} placeholder="Doe" error={errors.last_name} />
          </div>

          <Input label="Email Address" type="email" name="email" value={formData.email}
            onChange={handleChange} placeholder="your@email.com" error={errors.email} required />

          <Input label="Username" name="username" value={formData.username}
            onChange={handleChange} placeholder="johndoe" error={errors.username} required />

          <Input label="Phone Number" type="tel" name="phone_number" value={formData.phone_number}
            onChange={handleChange} placeholder="10-digit number" error={errors.phone_number} />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Password" type="password" name="password" value={formData.password}
              onChange={handleChange} placeholder="Min 8 chars" error={errors.password} required />
            <Input label="Confirm Password" type="password" name="password2" value={formData.password2}
              onChange={handleChange} placeholder="Repeat" error={errors.password2} required />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white text-xs tracking-widest uppercase py-4 hover:bg-luxury-darkgray transition-all duration-300 disabled:opacity-40 mt-2"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-xs tracking-wide text-luxury-midgray mt-8 text-center">
          Already a member?{' '}
          <Link to="/login" className="text-black border-b border-black hover:text-gold hover:border-gold transition-colors">
            Sign In
          </Link>
        </p>

      </div>

      {/* Right — Image */}
      <div className="hidden lg:block flex-1 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&auto=format&fit=crop&q=80"
          alt="Fashion"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30"/>
        <div className="absolute bottom-12 right-12 text-right">
          <h2 className="font-serif text-5xl text-white font-normal leading-tight">
            Join the<br /><em>Circle</em>
          </h2>
          <div className="w-12 h-px bg-gold mt-4 ml-auto"/>
        </div>
      </div>

    </div>
  )
}

export default RegisterPage