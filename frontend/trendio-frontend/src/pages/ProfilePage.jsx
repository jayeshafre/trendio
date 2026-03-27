import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast'
import Input from '../components/common/Input'
import { useAuth } from '../context/AuthContext'
import { updateUserProfile, changePassword } from '../api/authApi'

const ProfilePage = () => {
  const { user, setUser } = useAuth()
  const [loading, setLoading]   = useState(false)
  const [editing, setEditing]   = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  const [formData, setFormData] = useState({
    username:     user?.username     || '',
    first_name:   user?.first_name   || '',
    last_name:    user?.last_name    || '',
    phone_number: user?.phone_number || '',
  })

  const [pwData, setPwData] = useState({
    old_password:  '',
    new_password:  '',
    new_password2: '',
  })

  const [errors, setErrors]   = useState({})
  const [pwErrors, setPwErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handlePwChange = (e) => {
    const { name, value } = e.target
    setPwData(prev => ({ ...prev, [name]: value }))
    if (pwErrors[name]) setPwErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await updateUserProfile(formData)
      setUser(prev => ({ ...prev, ...response.user }))
      toast.success('Profile updated.')
      setEditing(false)
    } catch (error) {
      const serverErrors = error.response?.data
      if (serverErrors) setErrors(serverErrors)
      toast.error('Update failed.')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (pwData.new_password !== pwData.new_password2) {
      setPwErrors({ new_password2: 'Passwords do not match' })
      return
    }
    setLoading(true)
    try {
      await changePassword(pwData)
      toast.success('Password changed. Please sign in again.')
      setPwData({ old_password: '', new_password: '', new_password2: '' })
    } catch (error) {
      const serverErrors = error.response?.data
      if (serverErrors) setPwErrors(serverErrors)
      toast.error('Password change failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-luxury-offwhite">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="bg-white border-b border-luxury-gray">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <p className="text-gold text-xs tracking-widest uppercase mb-1">My Account</p>
          <h1 className="font-serif text-4xl font-normal text-black">Profile</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* ── Sidebar ───────────────────────────────────── */}
          <div className="md:col-span-1">
            <div className="bg-white border border-luxury-gray p-6">

              {/* Avatar */}
              <div className="text-center mb-6 pb-6 border-b border-luxury-gray">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center text-white font-serif text-2xl mx-auto mb-3">
                  {user?.first_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                </div>
                <p className="font-medium text-black text-sm tracking-wide">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-luxury-midgray mt-1 tracking-wide">
                  {user?.email}
                </p>
              </div>

              {/* Nav */}
              <nav className="space-y-1">
                {[
                  { id: 'profile',  label: 'Personal Info' },
                  { id: 'password', label: 'Change Password' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left text-xs tracking-widest uppercase py-2.5 px-3 transition-all ${
                      activeTab === tab.id
                        ? 'bg-black text-white'
                        : 'text-luxury-midgray hover:text-black hover:bg-luxury-offwhite'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
                <div className="pt-2 border-t border-luxury-gray mt-2">
                  <Link
                    to="/orders"
                    className="block text-xs tracking-widest uppercase py-2.5 px-3 text-luxury-midgray hover:text-black hover:bg-luxury-offwhite transition-all"
                  >
                    My Orders
                  </Link>
                </div>
              </nav>
            </div>
          </div>

          {/* ── Content ───────────────────────────────────── */}
          <div className="md:col-span-3">
            <div className="bg-white border border-luxury-gray p-8">

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <>
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-luxury-gray">
                    <h2 className="font-serif text-2xl font-normal">Personal Information</h2>
                    {!editing && (
                      <button
                        onClick={() => setEditing(true)}
                        className="text-xs tracking-widest uppercase border-b border-black pb-0.5 hover:text-gold hover:border-gold transition-colors"
                      >
                        Edit
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <Input
                        label="First Name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        error={errors.first_name}
                        disabled={!editing}
                      />
                      <Input
                        label="Last Name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        error={errors.last_name}
                        disabled={!editing}
                      />
                    </div>

                    {/* Email - readonly */}
                    <div>
                      <label className="text-xs font-medium tracking-widest uppercase text-luxury-darkgray block mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full px-4 py-3 bg-luxury-offwhite border-b-2 border-luxury-gray text-sm text-luxury-midgray opacity-60 cursor-not-allowed focus:outline-none"
                      />
                      <p className="text-xs text-luxury-midgray mt-1 tracking-wide">Email cannot be changed</p>
                    </div>

                    <Input
                      label="Username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      error={errors.username}
                      disabled={!editing}
                    />

                    <Input
                      label="Phone Number"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      error={errors.phone_number}
                      disabled={!editing}
                    />

                    {editing && (
                      <div className="flex gap-3 pt-2">
                        <button
                          type="submit"
                          disabled={loading}
                          className="bg-black text-white text-xs tracking-widest uppercase px-8 py-3 hover:bg-luxury-darkgray transition-all disabled:opacity-40"
                        >
                          {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setEditing(false); setErrors({}) }}
                          className="border border-luxury-gray text-black text-xs tracking-widest uppercase px-8 py-3 hover:border-black transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </form>

                  {/* Member Since */}
                  {user?.date_joined && (
                    <div className="mt-8 pt-6 border-t border-luxury-gray">
                      <p className="text-xs tracking-widest uppercase text-luxury-midgray">
                        Member Since
                      </p>
                      <p className="text-sm text-black mt-1">
                        {new Date(user.date_joined).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Password Tab */}
              {activeTab === 'password' && (
                <>
                  <div className="mb-8 pb-4 border-b border-luxury-gray">
                    <h2 className="font-serif text-2xl font-normal">Change Password</h2>
                    <p className="text-xs text-luxury-midgray tracking-wide mt-1">
                      Choose a strong password to keep your account secure.
                    </p>
                  </div>

                  <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-md">
                    <Input
                      label="Current Password"
                      type="password"
                      name="old_password"
                      value={pwData.old_password}
                      onChange={handlePwChange}
                      placeholder="••••••••"
                      error={pwErrors.old_password}
                      required
                    />
                    <Input
                      label="New Password"
                      type="password"
                      name="new_password"
                      value={pwData.new_password}
                      onChange={handlePwChange}
                      placeholder="Min 8 characters"
                      error={pwErrors.new_password}
                      required
                    />
                    <Input
                      label="Confirm New Password"
                      type="password"
                      name="new_password2"
                      value={pwData.new_password2}
                      onChange={handlePwChange}
                      placeholder="Repeat new password"
                      error={pwErrors.new_password2}
                      required
                    />

                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-black text-white text-xs tracking-widest uppercase px-8 py-3 hover:bg-luxury-darkgray transition-all disabled:opacity-40"
                    >
                      {loading ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>
                </>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage