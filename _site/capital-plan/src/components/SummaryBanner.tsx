import React from 'react'
import { usePlanStore } from '@/store/planStore'
import { formatCurrency } from '@/lib/money'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp } from 'lucide-react'

export function SummaryBanner() {
  const { computed, plan } = usePlanStore()

  if (!computed) {
    return (
      <div className="mb-6 rounded-3xl border border-slate-200 bg-white/70 backdrop-blur p-6 shadow-sm">
        <div className="flex items-center justify-center text-slate-600">
          Loading calculation...
        </div>
      </div>
    )
  }

  const monthlyInvestment = formatCurrency(computed.summaryMonthlySipYear1, { 
    compact: false 
  })
  const goalCount = plan.goals.length
  const stepUpPercentage = (computed.stepUp).toFixed(2)

  return (
    <div className="mb-6 relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-emerald-50/80 to-white p-6 shadow-sm">
      <div className="pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full bg-emerald-200/50 blur-2xl opacity-60"></div>
      
      <div className="relative">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-400 text-white shadow-inner flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          
          <div className="flex-1">
            <div className="text-2xl sm:text-3xl font-semibold leading-tight tracking-tight text-slate-900">
              Invest{' '}
              <span className="text-emerald-700">
                {monthlyInvestment}/mo
              </span>
              {' '}towards{' '}
              <span className="text-emerald-700">
                {goalCount} goal{goalCount !== 1 ? 's' : ''}
              </span>
              {' '}
              <span className="font-normal text-emerald-700">this year</span>
            </div>
            
            <div className="text-sm text-slate-600 mt-2">
              Step up by{' '}
              <span className="font-semibold text-emerald-700">
                {stepUpPercentage}%
              </span>
              {' '}every year
            </div>
            
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-medium text-slate-700">
                {goalCount} Active Goal{goalCount !== 1 ? 's' : ''}
              </span>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                Auto step-up enabled
              </span>
            </div>
            
            <div className="mt-4 text-xs text-slate-500">
              * Includes inflation adjustments and compounding effects
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}