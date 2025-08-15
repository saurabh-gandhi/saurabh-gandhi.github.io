import React from 'react'
import { AssetPreset } from '@/engine/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PercentInput } from './PercentInput'

interface AssetPresetSelectProps {
  value: AssetPreset
  customEquity?: number
  onChange: (preset: AssetPreset, customEquity?: number) => void
  disabled?: boolean
  className?: string
}

const presetLabels: Record<AssetPreset, string> = {
  AllIn: 'All-in (100% Equity)',
  Grow: 'Grow (80% Equity)',
  Regular: 'Regular (60% Equity)',
  Safe: 'Safe (10% Equity)',
  Custom: 'Custom',
}

const presetDescriptions: Record<AssetPreset, string> = {
  AllIn: 'Maximum growth, higher risk. Suitable for >10 years.',
  Grow: 'High growth with some stability. Good for 5-10 years.',
  Regular: 'Balanced approach. Suitable for most goals.',
  Safe: 'Low risk, steady returns. For short-term goals.',
  Custom: 'Set your own equity allocation percentage.',
}

export function AssetPresetSelect({
  value,
  customEquity = 60,
  onChange,
  disabled,
  className,
}: AssetPresetSelectProps) {
  const handlePresetChange = (newPreset: AssetPreset) => {
    onChange(newPreset, customEquity)
  }

  const handleCustomEquityChange = (newEquity: number) => {
    onChange('Custom', newEquity)
  }

  return (
    <div className={className}>
      <Select
        value={value}
        onValueChange={handlePresetChange}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select asset allocation" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(presetLabels).map(([preset, label]) => (
            <SelectItem key={preset} value={preset}>
              <div>
                <div className="font-medium">{label}</div>
                <div className="text-xs text-muted-foreground">
                  {presetDescriptions[preset as AssetPreset]}
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {value === 'Custom' && (
        <div className="mt-3 space-y-2">
          <label className="text-sm font-medium">Equity Allocation</label>
          <PercentInput
            value={customEquity / 100}
            onChange={(value) => handleCustomEquityChange(value * 100)}
            min={0}
            max={100}
            placeholder="Equity %"
            disabled={disabled}
          />
          <p className="text-xs text-muted-foreground">
            Remaining {(100 - customEquity).toFixed(1)}% will be allocated to debt.
          </p>
        </div>
      )}
      
      <div className="mt-2 text-xs text-muted-foreground">
        {presetDescriptions[value]}
      </div>
    </div>
  )
}