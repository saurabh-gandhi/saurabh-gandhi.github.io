import React, { useState, useEffect } from 'react'
import { Decimal } from 'decimal.js'
import { Input } from '@/components/ui/input'
import { parseCurrencyInput, formatCompactCurrency } from '@/lib/money'
import { cn } from '@/lib/utils'

interface CurrencyInputProps {
  value: Decimal
  onChange: (value: Decimal) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  min?: number
  max?: number
}

export function CurrencyInput({
  value,
  onChange,
  placeholder = "Enter amount",
  className,
  disabled,
  min = 0,
  max,
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    if (!isFocused) {
      // Show compact format when not focused
      if (value.gt(0)) {
        setDisplayValue(formatCompactCurrency(value.toNumber()))
      } else {
        setDisplayValue('')
      }
    }
  }, [value, isFocused])

  const handleFocus = () => {
    setIsFocused(true)
    // Show raw number when focused
    setDisplayValue(value.gt(0) ? value.toFixed() : '')
  }

  const handleBlur = () => {
    setIsFocused(false)
    // Parse and update the value
    try {
      const parsed = parseCurrencyInput(displayValue)
      
      // Apply min/max constraints
      let constrainedValue = parsed
      if (min !== undefined && parsed.lt(min)) {
        constrainedValue = new Decimal(min)
      }
      if (max !== undefined && parsed.gt(max)) {
        constrainedValue = new Decimal(max)
      }
      
      onChange(constrainedValue)
    } catch (error) {
      // Reset to previous value on invalid input
      setDisplayValue(value.gt(0) ? formatCompactCurrency(value.toNumber()) : '')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayValue(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur()
      ;(e.target as HTMLInputElement).blur()
    }
  }

  return (
    <div className="relative">
      <Input
        type="text"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "font-mono text-right pr-8",
          className
        )}
      />
      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-muted-foreground text-sm">
        ₹
      </div>
      {isFocused && (
        <div className="absolute top-full left-0 mt-1 text-xs text-muted-foreground">
          Use L for Lakhs, Cr for Crores (e.g., 10L, 1.5Cr)
        </div>
      )}
    </div>
  )
}