import React from 'react'
import { Goal } from '@/engine/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCompactCurrency } from '@/lib/money'
import { 
  PiggyBank, 
  GraduationCap, 
  Home, 
  Plane, 
  Target,
  Edit3,
  Trash2
} from 'lucide-react'
import { Decimal } from 'decimal.js'

interface GoalCardProps {
  goal: Goal
  monthlySip?: Decimal
  onClick?: () => void
  onDelete?: () => void
}

const goalIcons = {
  retirement: PiggyBank,
  education: GraduationCap,
  purchase: Home,
  vacation: Plane,
  custom: Target,
}

const goalColors = {
  retirement: 'from-blue-50 to-blue-100/50 border-blue-200',
  education: 'from-purple-50 to-purple-100/50 border-purple-200',
  purchase: 'from-emerald-50 to-emerald-100/50 border-emerald-200',
  vacation: 'from-orange-50 to-orange-100/50 border-orange-200',
  custom: 'from-slate-50 to-slate-100/50 border-slate-200',
}

const iconColors = {
  retirement: 'from-blue-600 to-blue-400',
  education: 'from-purple-600 to-purple-400',
  purchase: 'from-emerald-600 to-emerald-400',
  vacation: 'from-orange-600 to-orange-400',
  custom: 'from-slate-600 to-slate-400',
}

export function GoalCard({ goal, monthlySip, onClick, onDelete }: GoalCardProps) {
  const Icon = goalIcons[goal.type]
  const gradientClass = goalColors[goal.type]
  const iconGradient = iconColors[goal.type]
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDelete) {
      if (confirm(`Are you sure you want to delete "${goal.title}"? This action cannot be undone.`)) {
        onDelete()
      }
    }
  }
  
  return (
    <div 
      className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br ${gradientClass} p-3 shadow-sm transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-md`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${iconGradient} flex items-center justify-center shadow-sm`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-sm text-slate-900">
              {goal.title}
            </h3>
            <div className="text-xs text-slate-600 mt-0.5">
              Age {goal.accumulationStartAge} → {goal.accumulationStopAge}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={handleDelete}
            className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <Edit3 className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          {monthlySip && monthlySip.gt(0) ? (
            <div>
              <div className="font-semibold text-slate-900">
                {formatCompactCurrency(monthlySip.toNumber())}/mo
              </div>
              <div className="text-xs text-slate-600">
                SIP Amount
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-600">
              No SIP required
            </div>
          )}
        </div>
        
        <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-1 text-xs font-medium text-slate-700">
          {goal.duringPreset}
        </span>
      </div>
    </div>
  )
}