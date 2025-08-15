import { Decimal } from 'decimal.js'
import { Plan, Cashflow, ComputedOutput, Goal, ChartDataPoint } from './types'
import { generateSteppedSipSchedule, calculateRequiredSip, calculateRequiredSipWithEarlyStop } from './sip'
import { generateRetirementWithdrawalSchedule, calculateRequiredRetirementCorpus } from './retirement'
import { createInflatedSchedule, scheduleToMonthlyCashflows, inflateLumpSum } from './inflation'
import { getPresetMonthlyRate } from './rates'

/**
 * Main simulation function - computes the complete financial plan
 */
export function simulatePlan(plan: Plan): ComputedOutput {
  const { profile, goals, allocations } = plan
  const currentAge = profile.age
  
  console.log('🔄 simulatePlan called with goals:', goals.map(g => ({ 
    type: g.type, 
    title: g.title, 
    retireAge: g.retireAge, 
    monthlySpendToday: g.monthlySpendToday?.toNumber?.() || 0,
    postPreset: g.postPreset 
  })))
  
  // Calculate total unallocated savings
  const totalAllocated = allocations.reduce(
    (sum, alloc) => sum.plus(alloc.lumpsum),
    new Decimal(0)
  )
  const unallocated = profile.savings.minus(totalAllocated)
  
  // Compute each goal
  const perGoal: Record<string, any> = {}
  const allContributions: Cashflow[] = []
  const allWithdrawals: Cashflow[] = []
  
  for (const goal of goals) {
    const allocation = allocations.find(a => a.goalId === goal.id)
    const lumpsum = allocation?.lumpsum || new Decimal(0)
    
    const goalComputation = computeGoal(goal, lumpsum, profile, currentAge)
    perGoal[goal.id] = goalComputation
    
    // Collect cashflows
    allContributions.push(...goalComputation.schedules.contributions)
    allWithdrawals.push(...goalComputation.schedules.withdrawals)
  }
  
  // Calculate summary metrics
  const summaryMonthlySipYear1 = Object.values(perGoal)
    .reduce((sum: Decimal, goal: any) => sum.plus(goal.monthlySipYear1), new Decimal(0))
  
  // Calculate total lumpsum amount
  const totalLumpsum = allocations.reduce(
    (sum, alloc) => sum.plus(alloc.lumpsum),
    new Decimal(0)
  )
  
  // Generate portfolio simulation for chart
  console.log('📊 Generating chart with withdrawals:', allWithdrawals.length, 'contributions:', allContributions.length)
  const chartSeries = generatePortfolioSeries(
    profile,
    allContributions,
    allWithdrawals,
    currentAge,
    totalLumpsum,
    goals
  )
  
  return {
    perGoal,
    summaryMonthlySipYear1,
    stepUp: profile.stepUp.annualRate * 100,
    chartSeries,
    unallocated,
  }
}

/**
 * Compute financial requirements for a single goal
 */
function computeGoal(
  goal: Goal,
  lumpsum: Decimal,
  profile: any,
  currentAge: number
): any {
  const startMonth = (goal.accumulationStartAge - currentAge) * 12
  const endMonth = (goal.accumulationStopAge - currentAge) * 12 - 1
  
  const duringRate = getPresetMonthlyRate(
    goal.duringPreset,
    profile.assumptions,
    goal.customEquityDuring
  )
  
  let targetAmount = new Decimal(0)
  let withdrawalSchedule: Cashflow[] = []
  let breakPointCorpus: Decimal | undefined
  
  // Calculate target amount and withdrawal schedule based on goal type
  switch (goal.type) {
    case 'retirement':
      breakPointCorpus = calculateRequiredRetirementCorpus(
        goal as any,
        profile.assumptions,
        currentAge
      )
      targetAmount = breakPointCorpus
      withdrawalSchedule = generateRetirementWithdrawalSchedule(goal as any, currentAge)
      break
      
    case 'purchase':
      const yearsFromNow = goal.purchaseAge - currentAge
      targetAmount = inflateLumpSum(goal.itemCostToday, goal.inflation, yearsFromNow)
      withdrawalSchedule = [{
        monthIndex: (goal.purchaseAge - currentAge) * 12,
        amount: targetAmount.neg()
      }]
      break
      
    case 'education':
      const educationSchedule = createInflatedSchedule(
        goal.costPerYearToday,
        goal.inflation,
        goal.startInYears,
        goal.durationYears,
        currentAge
      )
      targetAmount = educationSchedule.reduce(
        (sum, item) => sum.plus(item.annualAmount),
        new Decimal(0)
      )
      withdrawalSchedule = scheduleToMonthlyCashflows(educationSchedule, true)
      break
      
    case 'vacation':
      const vacationYears = goal.lastHolidayAge - goal.firstHolidayAge + 1
      const vacationSchedule = createInflatedSchedule(
        goal.spendPerYearToday,
        goal.inflation,
        goal.firstHolidayAge - currentAge,
        vacationYears,
        currentAge
      )
      targetAmount = vacationSchedule.reduce(
        (sum, item) => sum.plus(item.annualAmount),
        new Decimal(0)
      )
      withdrawalSchedule = scheduleToMonthlyCashflows(vacationSchedule, true)
      break
      
    case 'custom':
      const customYears = goal.targetAge - currentAge
      targetAmount = inflateLumpSum(goal.targetAmount, goal.inflation, customYears)
      withdrawalSchedule = [{
        monthIndex: (goal.targetAge - currentAge) * 12,
        amount: targetAmount.neg()
      }]
      break
  }
  
  // Calculate required SIP (accounting for lumpsum compounding from start)
  // Lumpsum grows from current age (month 0) to goal accumulation start
  const lumpSumAtStart = startMonth > 0 
    ? lumpsum.mul(new Decimal(1).plus(duringRate).pow(startMonth))
    : lumpsum
  
  // Calculate how much the lumpsum will be worth at the end of accumulation period
  const lumpSumFV = lumpSumAtStart.mul(new Decimal(1).plus(duringRate).pow(endMonth - startMonth))
  const remainingTarget = Decimal.max(targetAmount.minus(lumpSumFV), 0)
  
  let monthlySipYear1 = new Decimal(0)
  let actualEndMonth = endMonth
  let contributionSchedule: Cashflow[] = []
  
  if (remainingTarget.gt(0)) {
    if (goal.type === 'retirement') {
      // Use early stop calculation for retirement goals as well
      const sipResult = calculateRequiredSipWithEarlyStop(
        remainingTarget,
        profile.stepUp.annualRate,
        duringRate,
        startMonth,
        endMonth,
        lumpSumAtStart
      )
      
      monthlySipYear1 = sipResult.sip
      actualEndMonth = sipResult.stopMonth
      
      // Generate SIP contribution schedule only until target is reached
      contributionSchedule = generateSteppedSipSchedule(
        monthlySipYear1,
        profile.stepUp.annualRate,
        startMonth,
        actualEndMonth
      )
    } else {
      // Use early stop calculation for non-retirement goals
      const sipResult = calculateRequiredSipWithEarlyStop(
        remainingTarget,
        profile.stepUp.annualRate,
        duringRate,
        startMonth,
        endMonth,
        lumpSumAtStart
      )
      
      monthlySipYear1 = sipResult.sip
      actualEndMonth = sipResult.stopMonth
      
      // Generate SIP contribution schedule only until target is reached
      contributionSchedule = generateSteppedSipSchedule(
        monthlySipYear1,
        profile.stepUp.annualRate,
        startMonth,
        actualEndMonth
      )
    }
  } else {
    // No SIP needed if lumpsum is sufficient
    contributionSchedule = []
  }
  
  return {
    monthlySipYear1,
    lumpsum,
    breakPointCorpus,
    actualEndMonth,
    schedules: {
      contributions: contributionSchedule,
      withdrawals: withdrawalSchedule,
    },
  }
}

/**
 * Generate portfolio value series for charting
 */
function generatePortfolioSeries(
  profile: any,
  contributions: Cashflow[],
  withdrawals: Cashflow[],
  currentAge: number,
  initialLumpsum: Decimal = new Decimal(0),
  goals: any[] = []
): ChartDataPoint[] {
  console.log('📈 generatePortfolioSeries starting with:', { 
    contributionsCount: contributions.length, 
    withdrawalsCount: withdrawals.length, 
    currentAge, 
    initialLumpsum: initialLumpsum.toNumber() 
  })
  // Find retirement goal for allocation switching
  const retirementGoal = goals.find(g => g.type === 'retirement')
  
  // Calculate the maximum month needed based on actual cashflows
  const contributionMaxMonth = contributions.length > 0 ? Math.max(...contributions.map(c => c.monthIndex)) : 0
  const withdrawalMaxMonth = withdrawals.length > 0 ? Math.max(...withdrawals.map(w => w.monthIndex)) : 0
  
  // Use the maximum of actual cashflows, add 2 years buffer, ensure at least 3 years, cap at age 90
  const minYears = 3
  const maxAge = 90
  const bufferYears = 2
  
  const actualMaxMonth = Math.max(contributionMaxMonth, withdrawalMaxMonth)
  const maxMonth = Math.min(
    Math.max(actualMaxMonth + (bufferYears * 12), minYears * 12),
    (maxAge - currentAge) * 12
  )
  
  const series: ChartDataPoint[] = []
  let balance = initialLumpsum // Start with lumpsum available from beginning
  
  // Sort all cashflows by month
  const allCashflows = [...contributions, ...withdrawals]
    .sort((a, b) => a.monthIndex - b.monthIndex)
  
  let lastProcessedMonth = 0
  
  // Process month by month for accuracy, but sample yearly for chart
  let currentMonth = 0
  
  while (currentMonth <= maxMonth) {
    const age = currentAge + Math.floor(currentMonth / 12)
    
    // Apply monthly returns
    const monthlyRate = getAverageMonthlyRateForAge(profile.assumptions, age, goals)
    const preReturnsBalance = balance.toNumber()
    const monthlyReturn = balance.mul(monthlyRate)
    balance = balance.mul(new Decimal(1).plus(monthlyRate))
    
    // Process cashflows for this month
    const monthCashflows = allCashflows.filter(cf => cf.monthIndex === currentMonth)
    let monthlyNetCashflow = new Decimal(0)
    
    for (const cf of monthCashflows) {
      balance = balance.plus(cf.amount)
      monthlyNetCashflow = monthlyNetCashflow.plus(cf.amount)
    }
    
    
    let withdrawalAnnual = 0
    
    // Sample for chart every 12 months
    if (currentMonth % 12 === 0) {
      const year = Math.floor(currentMonth / 12)
      const sipAnnual = contributions
        .filter(c => Math.floor(c.monthIndex / 12) === year)
        .reduce((sum, c) => sum + c.amount.toNumber(), 0)
      
      withdrawalAnnual = withdrawals
        .filter(w => Math.floor(w.monthIndex / 12) === year)
        .reduce((sum, w) => sum + w.amount.toNumber(), 0)
      
      const sipMonthly = sipAnnual > 0 ? sipAnnual / 12 : null // Average monthly SIP for the year, null when no contributions
      
      // Debug retirement phase
      if (withdrawalAnnual < 0) {
        const annualReturnRate = (monthlyRate.toNumber() * 12 * 100).toFixed(1)
        const estimatedAnnualReturns = balance.toNumber() * monthlyRate.toNumber() * 12
        console.log(`📊 Chart Year ${year + new Date().getFullYear()}: Portfolio=₹${(balance.toNumber() / 100000).toFixed(1)}L, Withdrawal=₹${(-withdrawalAnnual / 100000).toFixed(1)}L, Est.Returns=₹${(estimatedAnnualReturns / 100000).toFixed(1)}L (${annualReturnRate}%)`)
      }
      
      series.push({
        year,
        portfolioCr: balance.div(10000000).toNumber(), // Convert to Crores
        sipAnnual: sipAnnual > 0 ? sipAnnual : null,
        sipMonthly: sipMonthly,
      })
      
      // Stop simulation early if portfolio is exhausted during retirement
      if (balance.lte(1000) && withdrawalAnnual < 0) {
        console.log(`🏁 Portfolio exhausted at year ${year + new Date().getFullYear()}, stopping simulation`)
        break
      }
    }
    
    currentMonth++
  }
  
  return series
}

/**
 * Calculate monthly return rate based on age and retirement goal settings
 */
function getAverageMonthlyRateForAge(assumptions: any, age: number, goals: any[] = []): Decimal {
  // Find retirement goal to get proper allocation settings
  const retirementGoal = goals.find(g => g.type === 'retirement')
  
  let equityPct: number
  
  if (retirementGoal && age >= retirementGoal.retireAge) {
    // Post-retirement: Use the exact same calculation as retirement corpus calculation
    const postReturnRate = getPresetMonthlyRate(retirementGoal.postPreset, assumptions, retirementGoal.customEquityPost)
    const avgAnnualRate = (new Decimal(1).plus(postReturnRate).pow(12).minus(1)).toNumber()
    
    // Debug post-retirement return rate
    if (age === retirementGoal.retireAge) {
      console.log(`🏦 Post-retirement returns: preset=${retirementGoal.postPreset}, monthlyRate=${postReturnRate.toNumber()}, annualRate=${(avgAnnualRate * 100).toFixed(1)}%`)
    }
    
    // Return the monthly rate directly, bypass equity calculation
    return postReturnRate
  } else if (retirementGoal && age < retirementGoal.retireAge) {
    // Pre-retirement: Use the exact same calculation as everywhere else
    const preReturnRate = getPresetMonthlyRate(retirementGoal.duringPreset, assumptions, retirementGoal.customEquityDuring)
    return preReturnRate
  } else {
    // No retirement goal or age beyond plan: use Regular allocation
    const regularRate = getPresetMonthlyRate('Regular', assumptions)
    return regularRate
  }
}