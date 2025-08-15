import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface PercentInputProps {
  value: number // 0.05 = 5%
  onChange: (value: number) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  min?: number
  max?: number
  step?: number
}

export function PercentInput({
  value,
  onChange,
  placeholder = "Enter percentage",
  className,
  disabled,
  min = 0,
  max = 100,
  step = 0.1,
}: PercentInputProps) {
  const [displayValue, setDisplayValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    if (!isFocused) {
      // Show percentage format when not focused
      setDisplayValue((value * 100).toFixed(2))
    }
  }, [value, isFocused])

  const handleFocus = () => {
    setIsFocused(true)
    setDisplayValue((value * 100).toFixed(2))
  }

  const handleBlur = () => {
    setIsFocused(false)
    
    try {
      let numValue = parseFloat(displayValue)
      
      if (isNaN(numValue)) {
        numValue = value * 100 // Reset to previous value
      }
      
      // Apply min/max constraints
      numValue = Math.max(min, Math.min(max, numValue))
      
      // Convert back to decimal (5% -> 0.05)
      onChange(numValue / 100)
      setDisplayValue(numValue.toFixed(2))
    } catch (error) {
      // Reset to previous value
      setDisplayValue((value * 100).toFixed(2))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace('%', '')
    setDisplayValue(inputValue)
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
        type="number"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        step={step}
        min={min}
        max={max}
        className={cn(
          "text-right pr-8",
          className
        )}
      />
      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-muted-foreground text-sm">
        %
      </div>
    </div>
  )
}