import React, { useId } from 'react'
import { useTheme } from '@/context/ThemeContext'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  required?: boolean
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  required,
  className = '',
  id,
  ...props
}) => {
  const { currentTheme } = useTheme()
  const generatedId = useId()
  const inputId = id || generatedId
  
  return (
    <div className="mb-4">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-semibold mb-2"
          style={{
            color: currentTheme.colors.text,
            fontFamily: currentTheme.typography.bodyFont
          }}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={`
          w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-all duration-300
          ${error ? 'border-red-500 focus:border-red-500' : ''}
          ${className}
        `}
        style={{
          backgroundColor: currentTheme.colors.cardBg,
          borderColor: error ? '#ef4444' : currentTheme.colors.borderColor,
          color: currentTheme.colors.text,
          fontFamily: currentTheme.typography.bodyFont
        }}
        onFocus={(e) => {
          if (!error) {
            e.target.style.borderColor = currentTheme.colors.accent
          }
        }}
        onBlur={(e) => {
          if (!error) {
            e.target.style.borderColor = currentTheme.colors.borderColor
          }
        }}
        {...props}
      />
      {error && (
        <p 
          className="mt-2 text-sm" 
          style={{
            color: '#ef4444',
            fontFamily: currentTheme.typography.bodyFont
          }}
        >
          {error}
        </p>
      )}
    </div>
  )
}