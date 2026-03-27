import React from 'react'

const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
}) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={name}
          className="text-xs font-medium tracking-widest uppercase text-luxury-darkgray"
        >
          {label}{required && <span className="text-gold ml-1">*</span>}
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
        className={`
          w-full px-4 py-3
          bg-white
          border-b-2 border-t-0 border-l-0 border-r-0
          text-sm text-black placeholder-luxury-midgray
          focus:outline-none focus:border-black
          transition-all duration-300
          ${error ? 'border-red-400' : 'border-luxury-gray'}
          ${disabled ? 'opacity-40 cursor-not-allowed bg-luxury-offwhite' : ''}
        `}
      />
      {error && (
        <p className="text-xs text-red-500 tracking-wide">{error}</p>
      )}
    </div>
  )
}

export default Input