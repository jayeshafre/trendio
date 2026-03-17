import React from 'react';

const Input = ({ label, type = 'text', name, value, onChange, placeholder, error, required = false, disabled = false }) => {
    return (
        <div className="flex flex-col gap-1">
            {label && (
                <label htmlFor={name} className="text-sm font-medium text-gray-700">
                    {label}{required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                className={`w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 ${
                    error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white focus:border-primary-500'
                } ${disabled ? 'opacity-60 cursor-not-allowed bg-gray-100' : ''}`}
            />
            {error && <p className="text-xs text-red-500 mt-1">⚠ {error}</p>}
        </div>
    );
};

export default Input;