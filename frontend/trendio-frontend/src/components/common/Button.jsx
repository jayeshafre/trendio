import React from 'react';

const Button = ({ children, type = 'button', onClick, loading = false, disabled = false, variant = 'primary', fullWidth = false }) => {
    const base = `px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center gap-2 ${fullWidth ? 'w-full' : ''} ${disabled || loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`;

    const variants = {
        primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
        outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
        ghost:   'text-gray-600 hover:bg-gray-100 focus:ring-gray-400',
    };

    return (
        <button type={type} onClick={onClick} disabled={disabled || loading} className={`${base} ${variants[variant]}`}>
            {loading && (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
            )}
            {children}
        </button>
    );
};

export default Button;