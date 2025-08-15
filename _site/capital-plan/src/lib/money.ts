import { Decimal } from 'decimal.js'

/**
 * Format currency in Indian format with ₹ symbol
 */
export function formatCurrency(amount: Decimal | number, options: {
  compact?: boolean
  showDecimals?: boolean
} = {}): string {
  const { compact = false, showDecimals = false } = options
  const numAmount = typeof amount === 'number' ? amount : amount.toNumber()
  
  if (compact) {
    return formatCompactCurrency(numAmount, showDecimals)
  }
  
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  })
  
  return formatter.format(numAmount)
}

/**
 * Format currency in compact form (L/Cr)
 */
export function formatCompactCurrency(amount: number, showDecimals: boolean = false): string {
  const abs = Math.abs(amount)
  const sign = amount < 0 ? '-' : ''
  
  if (abs >= 10000000) {
    // Crores
    const cr = abs / 10000000
    const formatted = showDecimals ? cr.toFixed(2) : cr.toFixed(1)
    return `${sign}₹${formatted}Cr`
  } else if (abs >= 100000) {
    // Lakhs
    const l = abs / 100000
    const formatted = showDecimals ? l.toFixed(2) : l.toFixed(1)
    return `${sign}₹${formatted}L`
  } else if (abs >= 1000) {
    // Thousands
    const k = abs / 1000
    const formatted = showDecimals ? k.toFixed(2) : k.toFixed(1)
    return `${sign}₹${formatted}K`
  } else {
    // Regular
    const formatted = showDecimals ? abs.toFixed(2) : abs.toFixed(0)
    return `${sign}₹${formatted}`
  }
}

/**
 * Parse currency input (handles L/Cr suffixes)
 */
export function parseCurrencyInput(input: string): Decimal {
  const cleaned = input.replace(/[₹,\s]/g, '').toLowerCase()
  
  if (cleaned.includes('cr')) {
    const value = parseFloat(cleaned.replace('cr', ''))
    return new Decimal(value * 10000000)
  }
  
  if (cleaned.includes('l')) {
    const value = parseFloat(cleaned.replace('l', ''))
    return new Decimal(value * 100000)
  }
  
  if (cleaned.includes('k')) {
    const value = parseFloat(cleaned.replace('k', ''))
    return new Decimal(value * 1000)
  }
  
  return new Decimal(cleaned || 0)
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`
}

/**
 * Format number with Indian number system separators
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-IN').format(value)
}

/**
 * Convert Decimal to display value for inputs
 */
export function decimalToInputValue(decimal: Decimal): string {
  return decimal.toFixed()
}

/**
 * Create compact display with suffix
 */
export function getCompactSuffix(amount: number): { value: number; suffix: string } {
  const abs = Math.abs(amount)
  
  if (abs >= 10000000) {
    return { value: amount / 10000000, suffix: 'Cr' }
  } else if (abs >= 100000) {
    return { value: amount / 100000, suffix: 'L' }
  } else if (abs >= 1000) {
    return { value: amount / 1000, suffix: 'K' }
  } else {
    return { value: amount, suffix: '' }
  }
}