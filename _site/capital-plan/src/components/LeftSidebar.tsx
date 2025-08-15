import React, { useState } from 'react'
import { usePlanStore } from '@/store/planStore'
import { GoalCard } from './GoalCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCompactCurrency } from '@/lib/money'
import { 
  User, 
  Edit3, 
  Plus, 
  Trash2,
  Settings
} from 'lucide-react'

interface LeftSidebarProps {
  onEditProfile: () => void
  onEditGoal: (goalId: string) => void
  onNewGoal: () => void
  onClearPlan: () => void
  onDeleteGoal: (goalId: string) => void
}

export function LeftSidebar({ 
  onEditProfile, 
  onEditGoal, 
  onNewGoal,
  onClearPlan,
  onDeleteGoal
}: LeftSidebarProps) {
  const { plan, computed } = usePlanStore()

  return (
    <div className="w-72 lg:w-80 bg-white/70 backdrop-blur border-r border-slate-200 flex flex-col h-full">
      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        {/* Profile Section */}
        <div className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-emerald-400 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold tracking-tight text-slate-900">Profile</span>
            </div>
            <button 
              onClick={onEditProfile}
              className="p-1 text-slate-500 hover:text-emerald-600 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            <div>
              <div className="font-medium text-slate-900">
                {plan.profile.name} – {plan.profile.age}
              </div>
              <div className="text-sm text-slate-600">
                Age {plan.profile.age} years
              </div>
            </div>
            
            <div className="pt-3 border-t border-slate-100">
              <div className="text-sm text-slate-600">
                Total Savings
              </div>
              <div className="font-semibold text-emerald-700 text-lg">
                {formatCompactCurrency(plan.profile.savings.toNumber())}
              </div>
            </div>
          </div>
        </div>

        {/* Goals Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center">
                <Settings className="w-4 h-4 text-slate-600" />
              </div>
              <h2 className="font-semibold text-slate-900">
                GOALS
              </h2>
            </div>
            <div className="flex gap-1">
              <button
                onClick={onClearPlan}
                className="p-1 text-xs text-slate-500 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onNewGoal}
                className="p-1 text-xs text-slate-500 hover:text-emerald-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="space-y-3">
            {plan.goals.map((goal) => {
              const goalComputation = computed?.perGoal[goal.id]
              const monthlySip = goalComputation?.monthlySipYear1
              
              return (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  monthlySip={monthlySip}
                  onClick={() => onEditGoal(goal.id)}
                  onDelete={() => onDeleteGoal(goal.id)}
                />
              )
            })}
            
            {plan.goals.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <div className="mb-2">No goals yet</div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onNewGoal}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add your first goal
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {/* Quick Stats */}
        {computed && (
          <div className="rounded-2xl border border-slate-200 bg-emerald-50/50 p-4 shadow-sm">
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Total Goals:</span>
                <span className="font-medium text-slate-900">{plan.goals.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Step-up Rate:</span>
                <span className="font-medium text-emerald-700">
                  {computed.stepUp.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Unallocated:</span>
                <span className={`font-medium ${computed.unallocated.gte(0) ? 'text-emerald-700' : 'text-red-600'}`}>
                  {formatCompactCurrency(computed.unallocated.toNumber())}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}