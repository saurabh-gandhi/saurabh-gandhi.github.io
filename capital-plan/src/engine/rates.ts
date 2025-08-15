import { Decimal } from 'decimal.js'
import { AssetPreset, ReturnAssumptions } from './types'

/**
 * Convert annual rate to effective monthly rate
 * r_m = (1 + r_annual)^(1/12) - 1
 */
export function toMonthlyRate(annualRate: number): Decimal {
  return new Decimal(1 + annualRate).pow(1 / 12).minus(1)
}

/**
 * Get equity percentage for asset preset
 */
export function getEquityPercentage(preset: AssetPreset, customEquity?: number): Decimal {
  switch (preset) {
    case 'AllIn':
      return new Decimal(1.0)
    case 'Grow':
      return new Decimal(0.8)
    case 'Regular':
      return new Decimal(0.6)
    case 'Safe':
      return new Decimal(0.1)
    case 'Custom':
      // Convert percentage to decimal (e.g., 60 -> 0.60)
      return new Decimal((customEquity || 60) / 100)
    default:
      return new Decimal(0.6)
  }
}

/**
 * Calculate blended monthly return rate using simple weighted average method
 * r_blend_annual = equityPct * r_equity_annual + (1 - equityPct) * r_debt_annual
 * r_blend_m = (1 + r_blend_annual)^(1/12) - 1
 */
export function getBlendedMonthlyRate(
  equityPct: Decimal,
  assumptions: ReturnAssumptions
): Decimal {
  // Calculate blended annual rate first
  const blendedAnnualRate = equityPct
    .mul(assumptions.equityAnnual)
    .plus(new Decimal(1).minus(equityPct).mul(assumptions.debtAnnual))
  
  // Convert blended annual rate to monthly
  return toMonthlyRate(blendedAnnualRate.toNumber())
}

/**
 * Get monthly return rate for asset preset
 */
export function getPresetMonthlyRate(
  preset: AssetPreset,
  assumptions: ReturnAssumptions,
  customEquity?: number
): Decimal {
  const equityPct = getEquityPercentage(preset, customEquity)
  return getBlendedMonthlyRate(equityPct, assumptions)
}

/**
 * Check if asset allocation is appropriate for time horizon
 * Returns warning message if allocation is risky
 */
export function validateAssetAllocation(
  preset: AssetPreset,
  timeToGoalYears: number,
  customEquity?: number
): string | null {
  const equityPct = getEquityPercentage(preset, customEquity).toNumber()
  
  if (timeToGoalYears < 3 && equityPct > 0.2) {
    return `High equity allocation (${(equityPct * 100).toFixed(0)}%) for short-term goal (<3 years)`
  }
  
  if (timeToGoalYears > 10 && preset !== 'AllIn') {
    return `Consider All-in allocation for long-term goal (>10 years)`
  }
  
  return null
}