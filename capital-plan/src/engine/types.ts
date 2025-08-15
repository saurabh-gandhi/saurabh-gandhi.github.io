import { Decimal } from 'decimal.js'

export type Currency = 'INR'

export type AssetPreset = 'AllIn' | 'Grow' | 'Regular' | 'Safe' | 'Custom'

export interface ReturnAssumptions {
  equityAnnual: number
  debtAnnual: number
}

export interface StepUp {
  annualRate: number
}

export interface Profile {
  name: string
  age: number
  savings: Decimal
  stepUp: StepUp
  assumptions: ReturnAssumptions
}

export interface Allocation {
  goalId: string
  lumpsum: Decimal
}

export interface GoalBase {
  id: string
  type: 'retirement' | 'education' | 'vacation' | 'purchase' | 'custom'
  title: string
  inflation: number
  accumulationStartAge: number
  accumulationStopAge: number
  duringPreset: AssetPreset
  postPreset?: AssetPreset
  customEquityDuring?: number
  customEquityPost?: number
}

export interface RetirementGoal extends GoalBase {
  type: 'retirement'
  monthlySpendToday: Decimal
  retireAge: number
  planTillAge: number
}

export interface EducationGoal extends GoalBase {
  type: 'education'
  startInYears: number
  durationYears: number
  costPerYearToday: Decimal
}

export interface VacationGoal extends GoalBase {
  type: 'vacation'
  firstHolidayAge: number
  lastHolidayAge: number
  spendPerYearToday: Decimal
}

export interface PurchaseGoal extends GoalBase {
  type: 'purchase'
  purchaseAge: number
  itemCostToday: Decimal
}

export interface CustomGoal extends GoalBase {
  type: 'custom'
  description: string
  targetAmount: Decimal
  targetAge: number
}

export type Goal = RetirementGoal | EducationGoal | VacationGoal | PurchaseGoal | CustomGoal

export interface Plan {
  profile: Profile
  goals: Goal[]
  allocations: Allocation[]
}

export interface Cashflow {
  monthIndex: number
  amount: Decimal
}

export interface GoalComputation {
  monthlySipYear1: Decimal
  lumpsum: Decimal
  breakPointCorpus?: Decimal
  actualEndMonth?: number
  schedules: {
    contributions: Cashflow[]
    withdrawals: Cashflow[]
  }
}

export interface ComputedOutput {
  perGoal: Record<string, GoalComputation>
  summaryMonthlySipYear1: Decimal
  stepUp: number
  chartSeries: { year: number; portfolioCr: number; sipAnnual: number | null; sipMonthly: number | null }[]
  unallocated: Decimal
}

export interface ChartDataPoint {
  year: number
  portfolioCr: number
  sipAnnual: number | null
  sipMonthly: number | null
}