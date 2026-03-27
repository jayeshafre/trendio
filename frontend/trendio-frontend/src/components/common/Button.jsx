import React from 'react'

const Button = ({
  children,
  type = 'button',
  onClick,
  loading = false,
  disabled = false,
  variant = 'primary',
  fullWidth = false,
  size = 'md',
}) => {

  const base = `
    inline-flex items-center justify-center gap-2
    font-sans font-medium tracking-widest uppercase
    transition-all duration-300
    focus:outline-none
    ${fullWidth ? 'w-full' : ''}
    ${disabled || loading ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
  `

  const sizes = {
    sm: 'px-6 py-2 text-xs',
    md: 'px-8 py-3 text-xs',
    lg: 'px-12 py-4 text-sm',
  }

  const variants = {
    // Solid black
    primary: `
      bg-black text-white
      hover:bg-luxury-darkgray
      border border-black
    `,
    // Outlined
    outline: `
      bg-transparent text-black
      border border-black
      hover:bg-black hover:text-white
    `,
    // Gold accent
    gold: `
      bg-gold text-black
      border border-gold
      hover:bg-gold-dark
    `,
    // Ghost
    ghost: `
      bg-transparent text-black
      border border-transparent
      hover:border-black
    `,
    // White
    white: `
      bg-white text-black
      border border-white
      hover:bg-transparent hover:text-white
    `,
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${sizes[size]} ${variants[variant]}`}
    >
      {loading && (
        <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
      )}
      {children}
    </button>
  )
}

export default Button