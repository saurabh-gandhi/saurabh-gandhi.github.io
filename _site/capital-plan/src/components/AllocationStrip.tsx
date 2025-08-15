import React from 'react'
import { usePlanStore } from '@/store/planStore'
import { formatCompactCurrency } from '@/lib/money'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CurrencyInput } from '@/components/inputs/CurrencyInput'
import { Decimal } from 'decimal.js'

export function AllocationStrip() {
  const { plan, computed, setAllocation } = usePlanStore()

  if (!computed) {
    return null
  }

  const totalAllocated = plan.allocations.reduce(
    (sum, alloc) => sum.plus(alloc.lumpsum),
    new Decimal(0)
  )
  const unallocated = plan.profile.savings.minus(totalAllocated)

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">Savings Allocation</h2>
        <div className="text-sm">
          <span className={`font-medium ${unallocated.lt(0) ? 'text-red-600' : 'text-emerald-700'}`}>
            {formatCompactCurrency(unallocated.toNumber())} Left
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plan.goals.map((goal) => {
          const allocation = plan.allocations.find(a => a.goalId === goal.id)
          const lumpsum = allocation?.lumpsum || new Decimal(0)
          const goalComputation = computed.perGoal[goal.id]
          const monthlySip = goalComputation?.monthlySipYear1 || new Decimal(0)
          
          return (
            <div key={goal.id} className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <h3 className="font-medium text-sm text-slate-900">{goal.title}</h3>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-600 block mb-1">
                    Lumpsum Allocation
                  </label>
                  <CurrencyInput
                    value={lumpsum}
                    onChange={(value) => setAllocation(goal.id, value)}
                    placeholder="₹0"
                    className="h-8 text-sm border-slate-200 rounded-xl"
                  />
                </div>
                
                <div className="pt-2 border-t border-slate-100">
                  <label className="text-xs text-slate-600 block mb-1">
                    Required Monthly SIP
                  </label>
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-emerald-700">
                      {formatCompactCurrency(monthlySip.toNumber())}
                    </div>
                    <div className="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full">
                      Age {plan.profile.age}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Active indicator */}
              {monthlySip.gt(0) && (
                <div className="absolute -top-1 -right-1">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
                </div>
              )}
            </div>
          )
        })}
      </div>
      
      {unallocated.lt(0) && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 text-red-600 shrink-0 mt-0.5">⚠️</div>
            <div className="text-sm text-red-800">
              <div className="font-medium">Over-allocated by {formatCompactCurrency(unallocated.abs().toNumber())}</div>
              <div className="mt-1">Please reduce some allocations to match your available savings.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}