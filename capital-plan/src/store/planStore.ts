import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Decimal } from 'decimal.js'
import { Plan, Profile, Goal, Allocation, ComputedOutput } from '@/engine/types'
import { simulatePlan } from '@/engine/simulate'
import { v4 as uuidv4 } from 'uuid'
import { calculateOptimalStepUpRate } from '@/lib/utils'

interface PlanState {
  plan: Plan
  computed: ComputedOutput | null
  isLoading: boolean
  
  // Actions
  setProfile: (profile: Partial<Profile>) => void
  addGoal: (goal: Omit<Goal, 'id'>) => void
  updateGoal: (id: string, updates: Partial<Goal>) => void
  removeGoal: (id: string) => void
  setAllocation: (goalId: string, lumpsum: Decimal) => void
  clearPlan: () => void
  loadPlan: (plan: Plan) => void
  compute: () => void
}

// Default plan
const createDefaultPlan = (): Plan => {
  const defaultAge = 35
  const defaultSavings = new Decimal(4000000) // ₹40L
  
  return {
    profile: {
      name: 'Saurabh Gandhi',
      age: defaultAge,
      savings: defaultSavings,
      stepUp: {
        annualRate: calculateOptimalStepUpRate(defaultAge, defaultSavings),
      },
      assumptions: {
        equityAnnual: 0.12, // 12%
        debtAnnual: 0.06,   // 6%
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
      monthlySpendToday: new Decimal(100000),
      retireAge: 60,
      planTillAge: 90,
    },
    {
      id: uuidv4(),
      type: 'education',
      title: "Daughter's College Fund",
      inflation: 0.05,
      accumulationStartAge: 35,
      accumulationStopAge: 49,
      duringPreset: 'Regular',
      postPreset: 'Safe',
      startInYears: 14,
      durationYears: 2,
      costPerYearToday: new Decimal(3500000), // ₹35L per year
    },
    {
      id: uuidv4(),
      type: 'purchase',
      title: 'House Down Payment',
      inflation: 0.05,
      accumulationStartAge: 35,
      accumulationStopAge: 45,
      duringPreset: 'Grow',
      purchaseAge: 45,
      itemCostToday: new Decimal(7500000), // ₹75L
    },
    {
      id: uuidv4(),
      type: 'vacation',
      title: 'Vacation Corpus',
      inflation: 0.06,
      accumulationStartAge: 35,
      accumulationStopAge: 60,
      duringPreset: 'Regular',
      firstHolidayAge: 40,
      lastHolidayAge: 70,
      spendPerYearToday: new Decimal(200000), // ₹2L per year
    },
  ],
  allocations: [],
  }
}

export const usePlanStore = create<PlanState>()(
  persist(
    (set, get) => ({
      plan: createDefaultPlan(),
      computed: null,
      isLoading: false,
      
      setProfile: (profileUpdates) => {
        set((state) => {
          const updatedProfile = {
            ...state.plan.profile,
            ...profileUpdates,
          }
          
          // Auto-calculate step-up rate if age or savings changed
          if (profileUpdates.age !== undefined || profileUpdates.savings !== undefined) {
            updatedProfile.stepUp = {
              annualRate: calculateOptimalStepUpRate(updatedProfile.age, updatedProfile.savings)
            }
          }
          
          return {
            plan: {
              ...state.plan,
              profile: updatedProfile,
            },
          }
        })
        
        // Recompute after profile change
        setTimeout(() => get().compute(), 0)
      },
      
      addGoal: (goalData) => {
        const newGoal: Goal = {
          ...goalData,
          id: uuidv4(),
        } as Goal
        
        set((state) => ({
          plan: {
            ...state.plan,
            goals: [...state.plan.goals, newGoal],
          },
        }))
        
        setTimeout(() => get().compute(), 0)
      },
      
      updateGoal: (id, updates) => {
        set((state) => ({
          plan: {
            ...state.plan,
            goals: state.plan.goals.map((goal) =>
              goal.id === id ? ({ ...goal, ...updates } as Goal) : goal
            ),
          },
        }))
        
        setTimeout(() => get().compute(), 0)
      },
      
      removeGoal: (id) => {
        set((state) => ({
          plan: {
            ...state.plan,
            goals: state.plan.goals.filter((goal) => goal.id !== id),
            allocations: state.plan.allocations.filter(
              (allocation) => allocation.goalId !== id
            ),
          },
        }))
        
        setTimeout(() => get().compute(), 0)
      },
      
      setAllocation: (goalId, lumpsum) => {
        set((state) => {
          const existingIndex = state.plan.allocations.findIndex(
            (allocation) => allocation.goalId === goalId
          )
          
          let newAllocations = [...state.plan.allocations]
          
          if (existingIndex >= 0) {
            if (lumpsum.gt(0)) {
              newAllocations[existingIndex] = { goalId, lumpsum }
            } else {
              newAllocations.splice(existingIndex, 1)
            }
          } else if (lumpsum.gt(0)) {
            newAllocations.push({ goalId, lumpsum })
          }
          
          return {
            plan: {
              ...state.plan,
              allocations: newAllocations,
            },
          }
        })
        
        setTimeout(() => get().compute(), 0)
      },
      
      clearPlan: () => {
        set({
          plan: createDefaultPlan(),
          computed: null,
        })
        
        setTimeout(() => get().compute(), 0)
      },
      
      loadPlan: (plan) => {
        set({
          plan,
          computed: null,
        })
        
        setTimeout(() => get().compute(), 0)
      },
      
      compute: () => {
        const { plan } = get()
        
        set({ isLoading: true })
        
        try {
          const computed = simulatePlan(plan)
          set({ computed, isLoading: false })
        } catch (error) {
          console.error('Failed to compute plan:', error)
          set({ isLoading: false })
        }
      },
    }),
    {
      name: 'capital-plan-v1',
      partialize: (state) => ({ plan: state.plan }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert plain objects back to Decimal instances
          state.plan = deserializePlanFromStorage(state.plan)
          // Trigger initial computation
          setTimeout(() => state.compute(), 0)
        }
      },
    }
  )
)

// Helper function to deserialize Decimal objects from localStorage
function deserializePlanFromStorage(plan: any): Plan {
  // Convert savings
  plan.profile.savings = new Decimal(plan.profile.savings)
  
  // Convert goal amounts
  plan.goals = plan.goals.map((goal: any) => {
    switch (goal.type) {
      case 'retirement':
        return {
          ...goal,
          monthlySpendToday: new Decimal(goal.monthlySpendToday),
        }
      case 'education':
        return {
          ...goal,
          costPerYearToday: new Decimal(goal.costPerYearToday),
        }
      case 'vacation':
        return {
          ...goal,
          spendPerYearToday: new Decimal(goal.spendPerYearToday),
        }
      case 'purchase':
        return {
          ...goal,
          itemCostToday: new Decimal(goal.itemCostToday),
        }
      case 'custom':
        return {
          ...goal,
          targetAmount: new Decimal(goal.targetAmount),
        }
      default:
        return goal
    }
  })
  
  // Convert allocations
  plan.allocations = plan.allocations.map((allocation: any) => ({
    ...allocation,
    lumpsum: new Decimal(allocation.lumpsum),
  }))
  
  return plan as Plan
}

// UUID already installed