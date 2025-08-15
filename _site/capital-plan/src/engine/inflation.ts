import { Decimal } from 'decimal.js'

/**
 * Inflate a lump sum amount to future value
 * FV = PV * (1 + inflation)^years
 */
export function inflateLumpSum(
  presentValue: Decimal,
  inflationRate: number,
  years: number
): Decimal {
  return presentValue.mul(new Decimal(1 + inflationRate).pow(years))
}

/**
 * Create an inflated schedule for recurring payments
 * Used for education costs and vacation spending
 */
export function createInflatedSchedule(
  annualAmountToday: Decimal,
  inflationRate: number,
  startYear: number,
  durationYears: number,
  currentAge: number
): Array<{ year: number; age: number; annualAmount: Decimal; monthlyAmount: Decimal }> {
  const schedule = []
  
  for (let i = 0; i < durationYears; i++) {
    const year = startYear + i
    const age = currentAge + year
    const yearsFromNow = year
    
    const inflatedAnnual = inflateLumpSum(annualAmountToday, inflationRate, yearsFromNow)
    const monthlyAmount = inflatedAnnual.div(12)
    
    schedule.push({
      year,
      age,
      annualAmount: inflatedAnnual,
      monthlyAmount,
    })
  }
  
  return schedule
}

/**
 * Convert recurring schedule to monthly cashflow array
 */
export function scheduleToMonthlyCashflows(
  schedule: Array<{ year: number; monthlyAmount: Decimal }>,
  isWithdrawal: boolean = true
): Array<{ monthIndex: number; amount: Decimal }> {
  const cashflows = []
  
  for (const item of schedule) {
    const startMonth = item.year * 12
    
    // Add 12 monthly cashflows for each year
    for (let month = 0; month < 12; month++) {
      const monthIndex = startMonth + month
      const amount = isWithdrawal ? item.monthlyAmount.neg() : item.monthlyAmount
      
      cashflows.push({
        monthIndex,
        amount,
      })
    }
  }
  
  return cashflows
}

/**
 * Calculate monthly inflation rate
 * i_m = (1 + inflation_annual)^(1/12) - 1
 */
export function getMonthlyInflationRate(annualInflationRate: number): Decimal {
  return new Decimal(1 + annualInflationRate).pow(1 / 12).minus(1)
}

/**
 * Grow a monthly amount with inflation over time
 */
export function growMonthlyWithInflation(
  baseMonthlyAmount: Decimal,
  monthlyInflationRate: Decimal,
  months: number
): Decimal {
  return baseMonthlyAmount.mul(new Decimal(1).plus(monthlyInflationRate).pow(months))
}