import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { placeOrder } from '../api/orderApi';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const CheckoutPage = () => {
    const navigate           = useNavigate();
    const { cart, fetchCart } = useCart();
    const { user }           = useAuth();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors]   = useState({});

    const [formData, setFormData] = useState({
        full_name:     `${user?.first_name || ''} ${user?.last_name || ''}`.trim(),
        phone:         user?.phone_number || '',
        address_line1: '',
        address_line2: '',
        city:          '',
        state:         '',
        pincode:       '',
        notes:         '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.full_name)     newErrors.full_name     = 'Full name is required';
        if (!formData.phone)         newErrors.phone         = 'Phone number is required';
        else if (!/^\d{10}$/.test(formData.phone))
                                     newErrors.phone         = 'Enter valid 10-digit number';
        if (!formData.address_line1) newErrors.address_line1 = 'Address is required';
        if (!formData.city)          newErrors.city          = 'City is required';
        if (!formData.state)         newErrors.state         = 'State is required';
        if (!formData.pincode)       newErrors.pincode       = 'Pincode is required';
        else if (!/^\d{6}$/.test(formData.pincode))
                                     newErrors.pincode       = 'Enter valid 6-digit pincode';
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            toast.error('Please fix the errors below.');
            return;
        }

        setLoading(true);
        try {
            const data = await placeOrder(formData);
            await fetchCart(); // Reset cart count in navbar
            toast.success('Order placed successfully! 🎉');
            navigate(`/orders/${data.order_number}`);
        } catch (error) {
            const serverErrors = error.response?.data;
            if (serverErrors?.error) {
                toast.error(serverErrors.error);
            } else if (typeof serverErrors === 'object') {
                setErrors(serverErrors);
                toast.error('Please fix the errors below.');
            } else {
                toast.error('Failed to place order. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!cart || cart.items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
                <div className="text-6xl">🛒</div>
                <h2 className="text-2xl font-bold text-gray-700">Your cart is empty</h2>
                <Link to="/products" className="bg-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-pink-600">
                    Continue Shopping
                </Link>
            </div>
        );
    }

    const deliveryCharge = Number(cart.total_price) >= 999 ? 0 : 99;
    const grandTotal     = Number(cart.total_price) + deliveryCharge;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <Toaster position="top-right" />
            <div className="max-w-6xl mx-auto px-4">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Checkout</h1>
                    <p className="text-gray-500 mt-1">Complete your order</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* ── Delivery Form ──────────────────────── */}
                    <div className="flex-1">
                        <div className="bg-white rounded-3xl shadow-sm p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                🚚 Delivery Address
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Full Name"
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        placeholder="John Doe"
                                        error={errors.full_name}
                                        required
                                    />
                                    <Input
                                        label="Phone Number"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="10-digit number"
                                        error={errors.phone}
                                        required
                                    />
                                </div>

                                <Input
                                    label="Address Line 1"
                                    name="address_line1"
                                    value={formData.address_line1}
                                    onChange={handleChange}
                                    placeholder="House/Flat No, Street Name"
                                    error={errors.address_line1}
                                    required
                                />

                                <Input
                                    label="Address Line 2 (Optional)"
                                    name="address_line2"
                                    value={formData.address_line2}
                                    onChange={handleChange}
                                    placeholder="Landmark, Area"
                                    error={errors.address_line2}
                                />

                                <div className="grid grid-cols-3 gap-4">
                                    <Input
                                        label="City"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder="Pune"
                                        error={errors.city}
                                        required
                                    />
                                    <Input
                                        label="State"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        placeholder="Maharashtra"
                                        error={errors.state}
                                        required
                                    />
                                    <Input
                                        label="Pincode"
                                        name="pincode"
                                        value={formData.pincode}
                                        onChange={handleChange}
                                        placeholder="411001"
                                        error={errors.pincode}
                                        required
                                    />
                                </div>

                                {/* Special Notes */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-sm font-medium text-gray-700">
                                        Order Notes (Optional)
                                    </label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        placeholder="Any special instructions for delivery..."
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                                    />
                                </div>

                                {/* Place Order Button */}
                                <Button
                                    type="submit"
                                    loading={loading}
                                    fullWidth
                                >
                                    🎉 Place Order — ₹{grandTotal.toLocaleString('en-IN')}
                                </Button>
                            </form>
                        </div>
                    </div>

                    {/* ── Order Summary ──────────────────────── */}
                    <div className="lg:w-96">
                        <div className="bg-white rounded-3xl shadow-sm p-6 sticky top-24">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">
                                Order Summary
                            </h2>

                            {/* Items */}
                            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                                {cart.items.map(item => (
                                    <div key={item.id} className="flex gap-3 items-center">
                                        <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                            {item.product.image ? (
                                                <img
                                                    src={`http://localhost:8000${item.product.image}`}
                                                    alt={item.product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xl">🛍️</div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate">
                                                {item.product.name}
                                            </p>
                                            <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-800 flex-shrink-0">
                                            ₹{Number(item.subtotal).toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-100 pt-4 space-y-2">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Subtotal</span>
                                    <span>₹{Number(cart.total_price).toLocaleString('en-IN')}</span>
                                </div>
                                {cart.total_discount > 0 && (
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span>Discount Saved</span>
                                        <span>− ₹{Number(cart.total_discount).toLocaleString('en-IN')}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Delivery</span>
                                    <span className={deliveryCharge === 0 ? 'text-green-600 font-medium' : ''}>
                                        {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                                    </span>
                                </div>
                                <div className="flex justify-between font-bold text-lg text-gray-800 border-t border-gray-100 pt-2 mt-2">
                                    <span>Grand Total</span>
                                    <span className="text-pink-600">
                                        ₹{grandTotal.toLocaleString('en-IN')}
                                    </span>
                                </div>
                            </div>

                            {/* Payment Note */}
                            <div className="mt-4 bg-blue-50 rounded-2xl p-3 text-center">
                                <p className="text-xs text-blue-600 font-medium">
                                    💳 Payment on Delivery Available
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;