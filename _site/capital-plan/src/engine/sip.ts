import { Decimal } from 'decimal.js'
import { Cashflow } from './types'

/**
 * Generate stepped SIP cashflow schedule
 * SIP amount increases annually by step-up rate
 */
export function generateSteppedSipSchedule(
  initialMonthlySip: Decimal,
  stepUpRate: number,
  startMonth: number,
  endMonth: number
): Cashflow[] {
  const cashflows: Cashflow[] = []
  
  for (let month = startMonth; month <= endMonth; month++) {
    const yearIndex = Math.floor(month / 12)
    const steppedSip = initialMonthlySip.mul(new Decimal(1 + stepUpRate).pow(yearIndex))
    
    cashflows.push({
      monthIndex: month,
      amount: steppedSip,
    })
  }
  
  return cashflows
}

/**
 * Calculate future value of stepped SIP
 * More accurate than closed-form due to step changes
 */
export function calculateSteppedSipFV(
  initialMonthlySip: Decimal,
  stepUpRate: number,
  monthlyReturnRate: Decimal,
  startMonth: number,
  endMonth: number
): Decimal {
  let futureValue = new Decimal(0)
  
  for (let month = startMonth; month <= endMonth; month++) {
    const yearIndex = Math.floor(month / 12)
    const steppedSip = initialMonthlySip.mul(new Decimal(1 + stepUpRate).pow(yearIndex))
    
    // Calculate remaining months to compound
    const remainingMonths = endMonth - month
    const compoundedValue = steppedSip.mul(
      new Decimal(1).plus(monthlyReturnRate).pow(remainingMonths)
    )
    
    futureValue = futureValue.plus(compoundedValue)
  }
  
  return futureValue
}

/**
 * Calculate future value with early stop when target is reached
 * Stops SIP contributions when portfolio value reaches target amount
 */
export function calculateSteppedSipFVWithEarlyStop(
  initialMonthlySip: Decimal,
  stepUpRate: number,
  monthlyReturnRate: Decimal,
  startMonth: number,
  endMonth: number,
  targetAmount: Decimal,
  initialBalance: Decimal = new Decimal(0)
): { finalValue: Decimal, stopMonth: number } {
  let portfolioValue = initialBalance
  let month = startMonth
  
  while (month <= endMonth) {
    const yearIndex = Math.floor(month / 12)
    const steppedSip = initialMonthlySip.mul(new Decimal(1 + stepUpRate).pow(yearIndex))
    
    // Apply monthly return
    portfolioValue = portfolioValue.mul(new Decimal(1).plus(monthlyReturnRate))
    
    // Add SIP contribution
    portfolioValue = portfolioValue.plus(steppedSip)
    
    // Check if target is reached
    if (portfolioValue.gte(targetAmount)) {
      return { finalValue: portfolioValue, stopMonth: month }
    }
    
    month++
  }
  
  return { finalValue: portfolioValue, stopMonth: endMonth }
}

/**
 * Calculate required SIP for a target amount using binary search
 */
export function calculateRequiredSip(
  targetAmount: Decimal,
  stepUpRate: number,
  monthlyReturnRate: Decimal,
  startMonth: number,
  endMonth: number,
  tolerance: Decimal = new Decimal(1) // ₹1 tolerance
): Decimal {
  let low = new Decimal(100) // Minimum ₹100
  let high = targetAmount.div(12) // Maximum possible SIP
  
  let iterations = 0
  const maxIterations = 50
  
  while (iterations < maxIterations && high.minus(low).gt(tolerance)) {
    const mid = low.plus(high).div(2)
    
    const achievedAmount = calculateSteppedSipFV(
      mid,
      stepUpRate,
      monthlyReturnRate,
      startMonth,
      endMonth
    )
    
    if (achievedAmount.lt(targetAmount)) {
      low = mid
    } else {
      high = mid
    }
    
    iterations++
  }
  
  return low.plus(high).div(2)
}

/**
 * Calculate required SIP that stops when target is reached (more efficient)
 */
export function calculateRequiredSipWithEarlyStop(
  targetAmount: Decimal,
  stepUpRate: number,
  monthlyReturnRate: Decimal,
  startMonth: number,
  endMonth: number,
  initialBalance: Decimal = new Decimal(0),
  tolerance: Decimal = new Decimal(1)
): { sip: Decimal, stopMonth: number } {
  let low = new Decimal(100) // Minimum ₹100
  let high = targetAmount.div(6) // Maximum possible SIP (conservative)
  
  let bestSip = low
  let bestStopMonth = endMonth
  let iterations = 0
  const maxIterations = 50
  
  while (iterations < maxIterations && high.minus(low).gt(tolerance)) {
    const mid = low.plus(high).div(2)
    
    const result = calculateSteppedSipFVWithEarlyStop(
      mid,
      stepUpRate,
      monthlyReturnRate,
      startMonth,
      endMonth,
      targetAmount,
      initialBalance
    )
    
    if (result.finalValue.lt(targetAmount)) {
      low = mid
    } else {
      high = mid
      bestSip = mid
      bestStopMonth = result.stopMonth
    }
    
    iterations++
  }
  
  return { sip: bestSip, stopMonth: bestStopMonth }
}

/**
 * Get SIP amount for a specific year (accounting for step-up)
 */
export function getSipForYear(
  initialSip: Decimal,
  stepUpRate: number,
  year: number
): Decimal {
  return initialSip.mul(new Decimal(1 + stepUpRate).pow(year))
}

/**
 * Calculate total SIP contribution over time period
 */
export function calculateTotalSipContribution(
  initialMonthlySip: Decimal,
  stepUpRate: number,
  startMonth: number,
  endMonth: number
): Decimal {
  let totalContribution = new Decimal(0)
  
  for (let month = startMonth; month <= endMonth; month++) {
    const yearIndex = Math.floor(month / 12)
    const steppedSip = initialMonthlySip.mul(new Decimal(1 + stepUpRate).pow(yearIndex))
    totalContribution = totalContribution.plus(steppedSip)
  }
  
  return totalContribution
}