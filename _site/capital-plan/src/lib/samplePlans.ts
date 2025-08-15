import { Decimal } from 'decimal.js'
import { v4 as uuidv4 } from 'uuid'
import { Plan } from '@/engine/types'

export interface SamplePlan {
  id: string
  name: string
  description: string
  plan: Plan
}

export const samplePlans: SamplePlan[] = [
  {
    id: 'early-retirement-fire',
    name: 'Early Retirement (FIRE)',
    description: 'Retire at 45 with ₹1Cr monthly expenses',
    plan: {
      profile: {
        name: 'Alex Kumar',
        age: 32,
        savings: new Decimal(1000000), // ₹10L
        stepUp: {
          annualRate: 0.05
        },
        assumptions: {
          equityAnnual: 0.12,
          debtAnnual: 0.06,
        },
      },
      goals: [
        {
          id: uuidv4(),
          type: 'retirement',
          title: 'Early Retirement',
          inflation: 0.05,
          accumulationStartAge: 32,
          accumulationStopAge: 45,
          duringPreset: 'Regular',
          postPreset: 'Safe',
          monthlySpendToday: new Decimal(100000),
          retireAge: 45,
          planTillAge: 85,
        },
      ],
      allocations: [
        {
          goalId: '',
          lumpsum: new Decimal(1000000), // Will be updated with actual goal ID
        },
      ],
    },
  },
  {
    id: 'family-planner',
    name: 'Family Planner',
    description: 'Education + Retirement for a family',
    plan: {
      profile: {
        name: 'Priya Sharma',
        age: 35,
        savings: new Decimal(2500000), // ₹25L
        stepUp: {
          annualRate: 0.05
        },
        assumptions: {
          equityAnnual: 0.12,
          debtAnnual: 0.06,
        },
      },
      goals: [
        {
          id: uuidv4(),
          type: 'retirement',
          title: 'Retirement',
          inflation: 0.05,
          accumulationStartAge: 35,
          accumulationStopAge: 60,
          duringPreset: 'Regular',
          postPreset: 'Safe',
          monthlySpendToday: new Decimal(80000),
          retireAge: 60,
          planTillAge: 85,
        },
        {
          id: uuidv4(),
          type: 'education',
          title: "Child's Education",
          inflation: 0.06,
          accumulationStartAge: 35,
          accumulationStopAge: 49,
          duringPreset: 'Grow',
          postPreset: 'Safe',
          startInYears: 14,
          durationYears: 4,
          costPerYearToday: new Decimal(500000), // ₹5L per year
        },
        {
          id: uuidv4(),
          type: 'purchase',
          title: 'Dream Home',
          inflation: 0.07,
          accumulationStartAge: 35,
          accumulationStopAge: 42,
          duringPreset: 'Regular',
          postPreset: 'Safe',
          purchaseAge: 42,
          itemCostToday: new Decimal(8000000), // ₹80L
        },
      ],
      allocations: [
        {
          goalId: '',
          lumpsum: new Decimal(1500000), // ₹15L for retirement
        },
        {
          goalId: '',
          lumpsum: new Decimal(500000), // ₹5L for education
        },
        {
          goalId: '',
          lumpsum: new Decimal(500000), // ₹5L for home
        },
      ],
    },
  },
  {
    id: 'young-professional',
    name: 'Young Professional',
    description: 'Just started career with vacation & purchase goals',
    plan: {
      profile: {
        name: 'Rohit Patel',
        age: 25,
        savings: new Decimal(500000), // ₹5L
        stepUp: {
          annualRate: 0.08
        },
        assumptions: {
          equityAnnual: 0.12,
          debtAnnual: 0.06,
        },
      },
      goals: [
        {
          id: uuidv4(),
          type: 'retirement',
          title: 'Retirement',
          inflation: 0.05,
          accumulationStartAge: 25,
          accumulationStopAge: 55,
          duringPreset: 'AllIn',
          postPreset: 'Regular',
          monthlySpendToday: new Decimal(60000),
          retireAge: 55,
          planTillAge: 80,
        },
        {
          id: uuidv4(),
          type: 'vacation',
          title: 'Dream Vacations',
          inflation: 0.05,
          accumulationStartAge: 25,
          accumulationStopAge: 35,
          duringPreset: 'Grow',
          postPreset: 'Safe',
          firstHolidayAge: 35,
          lastHolidayAge: 50,
          spendPerYearToday: new Decimal(300000), // ₹3L per year
        },
        {
          id: uuidv4(),
          type: 'purchase',
          title: 'Car Purchase',
          inflation: 0.05,
          accumulationStartAge: 25,
          accumulationStopAge: 30,
          duringPreset: 'Regular',
          postPreset: 'Safe',
          purchaseAge: 30,
          itemCostToday: new Decimal(1200000), // ₹12L
        },
      ],
      allocations: [
        {
          goalId: '',
          lumpsum: new Decimal(200000), // ₹2L for retirement
        },
        {
          goalId: '',
          lumpsum: new Decimal(150000), // ₹1.5L for vacation
        },
        {
          goalId: '',
          lumpsum: new Decimal(150000), // ₹1.5L for car
        },
      ],
    },
  },
]

// Helper function to prepare sample plan for loading
export function prepareSamplePlan(samplePlan: SamplePlan): Plan {
  const plan = JSON.parse(JSON.stringify(samplePlan.plan)) // Deep clone
  
  // Update allocation goal IDs to match the goals
  plan.allocations.forEach((allocation: any, index: number) => {
    if (plan.goals[index]) {
      allocation.goalId = plan.goals[index].id
    }
  })
  
  // Convert Decimal strings back to Decimal objects if needed
  plan.profile.savings = new Decimal(plan.profile.savings)
  plan.goals.forEach((goal: any) => {
    if (goal.monthlySpendToday) goal.monthlySpendToday = new Decimal(goal.monthlySpendToday)
    if (goal.costPerYearToday) goal.costPerYearToday = new Decimal(goal.costPerYearToday)
    if (goal.itemCostToday) goal.itemCostToday = new Decimal(goal.itemCostToday)
    if (goal.spendPerYearToday) goal.spendPerYearToday = new Decimal(goal.spendPerYearToday)
    if (goal.targetAmount) goal.targetAmount = new Decimal(goal.targetAmount)
  })
  plan.allocations.forEach((allocation: any) => {
    allocation.lumpsum = new Decimal(allocation.lumpsum)
  })
  
  return plan
}