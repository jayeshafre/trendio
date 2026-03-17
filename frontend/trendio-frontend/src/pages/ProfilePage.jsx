import React, { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile } from '../api/authApi';

const ProfilePage = () => {
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: user?.username || '', first_name: user?.first_name || '',
        last_name: user?.last_name || '', phone_number: user?.phone_number || '',
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await updateUserProfile(formData);
            setUser(prev => ({ ...prev, ...response.user }));
            toast.success('Profile updated successfully!');
            setEditing(false);
        } catch (error) {
            const serverErrors = error.response?.data;
            if (serverErrors) setErrors(serverErrors);
            toast.error('Update failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <Toaster position="top-right" />
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage your Trendio account details</p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100">
                        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-2xl font-bold text-primary-600">
                            {user?.first_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800">{user?.first_name} {user?.last_name}</h2>
                            <p className="text-gray-500 text-sm">{user?.email}</p>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} error={errors.first_name} disabled={!editing} />
                            <Input label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} error={errors.last_name} disabled={!editing} />
                        </div>
                        <Input label="Username" name="username" value={formData.username} onChange={handleChange} error={errors.username} disabled={!editing} />
                        <Input label="Phone Number" name="phone_number" value={formData.phone_number} onChange={handleChange} error={errors.phone_number} disabled={!editing} />
                        <div className="flex gap-3 pt-2">
                            {editing ? (
                                <>
                                    <Button type="submit" loading={loading}>Save Changes</Button>
                                    <Button type="button" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                                </>
                            ) : (
                                <Button type="button" variant="outline" onClick={() => setEditing(true)}>Edit Profile</Button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;