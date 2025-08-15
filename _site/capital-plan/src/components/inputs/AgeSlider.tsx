import React from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

interface AgeSliderProps {
  value: [number, number]
  onChange: (value: [number, number]) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  className?: string
  label?: string
}

export function AgeSlider({
  value,
  onChange,
  min = 18,
  max = 100,
  step = 1,
  disabled,
  className,
  label,
}: AgeSliderProps) {
  const handleValueChange = (newValue: number[]) => {
    onChange([newValue[0], newValue[1]])
  }

  return (
    <div className={cn("space-y-3", className)}>
      {label && (
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">{label}</span>
          <span className="text-sm text-muted-foreground">
            Age {value[0]} → {value[1]}
          </span>
        </div>
      )}
      
      <div className="px-2">
        <Slider
          value={value}
          onValueChange={handleValueChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className="w-full"
        />
        
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
      
      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center space-x-2">
          <span className="text-muted-foreground">From:</span>
          <span className="font-mono bg-muted px-2 py-1 rounded text-xs">
            {value[0]}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-muted-foreground">To:</span>
          <span className="font-mono bg-muted px-2 py-1 rounded text-xs">
            {value[1]}
          </span>
        </div>
      </div>
    </div>
  )
}