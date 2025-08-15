import React, { useState, useEffect } from 'react'
import { usePlanStore } from '@/store/planStore'
import { RetirementGoal, AssetPreset } from '@/engine/types'
import { CurrencyInput } from '@/components/inputs/CurrencyInput'
import { AssetPresetSelect } from '@/components/inputs/AssetPresetSelect'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Decimal } from 'decimal.js'

interface EditRetirementProps {
  goalId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditRetirement({ goalId, open, onOpenChange }: EditRetirementProps) {
  const { plan, updateGoal } = usePlanStore()
  const goal = plan.goals.find(g => g.id === goalId) as RetirementGoal | undefined
  
  const [formData, setFormData] = useState({
    title: '',
    monthlySpendToday: new Decimal(0),
    retireAge: 60,
    planTillAge: 90,
    inflation: 0.05,
    duringPreset: 'Regular' as AssetPreset,
    postPreset: 'Safe' as AssetPreset,
    customEquityDuring: 60,
    customEquityPost: 10,
  })

  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title,
        monthlySpendToday: goal.monthlySpendToday,
        retireAge: goal.retireAge,
        planTillAge: goal.planTillAge,
        inflation: goal.inflation,
        duringPreset: goal.duringPreset,
        postPreset: goal.postPreset || 'Safe',
        customEquityDuring: goal.customEquityDuring || 60,
        customEquityPost: goal.customEquityPost || 10,
      })
    }
  }, [goal])

  if (!goal) return null

  const handleSave = () => {
    updateGoal(goalId, {
      ...formData,
      accumulationStartAge: plan.profile.age,
      accumulationStopAge: formData.retireAge,
    })
    onOpenChange(false)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[85vh] flex flex-col">
        <DrawerHeader className="flex-shrink-0">
          <DrawerTitle className="text-slate-900">Edit Retirement Goal</DrawerTitle>
          <DrawerDescription className="text-slate-600">
            Configure your retirement planning parameters
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="flex-1 px-4 overflow-y-auto">
          <div className="space-y-6 pb-6">
          <div className="space-y-2">
            <Label htmlFor="title">Goal Name</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="rounded-xl border-slate-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlySpend">Monthly Spending (Today's Value)</Label>
            <CurrencyInput
              value={formData.monthlySpendToday}
              onChange={(value) => setFormData(prev => ({ ...prev, monthlySpendToday: value }))}
              placeholder="₹1,00,000"
              className="rounded-xl border-slate-200"
            />
            <p className="text-xs text-slate-500 mt-1">
              How much do you spend per month today? This will be adjusted for inflation.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="retireAge">Retirement Age</Label>
              <Input
                id="retireAge"
                type="number"
                value={formData.retireAge}
                onChange={(e) => setFormData(prev => ({ ...prev, retireAge: parseInt(e.target.value) || 60 }))}
                className="rounded-xl border-slate-200"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="planTillAge">Plan Till Age</Label>
              <Input
                id="planTillAge"
                type="number"
                value={formData.planTillAge}
                onChange={(e) => setFormData(prev => ({ ...prev, planTillAge: parseInt(e.target.value) || 90 }))}
                className="rounded-xl border-slate-200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="inflation">Inflation Rate (%)</Label>
            <Input
              id="inflation"
              type="number"
              step="0.1"
              value={(formData.inflation * 100).toFixed(1)}
              onChange={(e) => setFormData(prev => ({ ...prev, inflation: parseFloat(e.target.value) / 100 || 0.05 }))}
              className="rounded-xl border-slate-200"
            />
          </div>

          <div className="space-y-3">
            <Label>Asset Allocation During Accumulation</Label>
            <AssetPresetSelect
              value={formData.duringPreset}
              customEquity={formData.customEquityDuring}
              onChange={(preset, customEquity) => 
                setFormData(prev => ({ 
                  ...prev, 
                  duringPreset: preset,
                  customEquityDuring: customEquity || 60 
                }))
              }
            />
          </div>

          <div className="space-y-3">
            <Label>Asset Allocation During Retirement</Label>
            <AssetPresetSelect
              value={formData.postPreset}
              customEquity={formData.customEquityPost}
              onChange={(preset, customEquity) => 
                setFormData(prev => ({ 
                  ...prev, 
                  postPreset: preset,
                  customEquityPost: customEquity || 10 
                }))
              }
            />
          </div>

          <div className="border border-emerald-200 rounded-xl p-4 bg-emerald-50">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <h3 className="font-semibold text-emerald-800">FIRE Calculator Preview</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Years to FIRE:</span>
                <span className="font-medium">{formData.retireAge - plan.profile.age} years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Retirement Duration:</span>
                <span className="font-medium">{formData.planTillAge - formData.retireAge} years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Monthly Expense (Inflated):</span>
                <span className="font-medium">
                  ₹{Math.round(formData.monthlySpendToday.toNumber() * 
                    Math.pow(1 + formData.inflation, formData.retireAge - plan.profile.age)
                  ).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Return During Earning:</span>
                <span className="font-medium">
                  {formData.duringPreset === 'Custom' 
                    ? `${((formData.customEquityDuring || 60) * 0.12 + (100 - (formData.customEquityDuring || 60)) * 0.06).toFixed(1)}%`
                    : formData.duringPreset === 'Regular' ? '9.6%' : '12.0%'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Return During Retirement:</span>
                <span className="font-medium">
                  {formData.postPreset === 'Custom' 
                    ? `${((formData.customEquityPost || 20) * 0.12 + (100 - (formData.customEquityPost || 20)) * 0.06).toFixed(1)}%`
                    : formData.postPreset === 'Safe' ? '6.0%' : '7.2%'
                  }
                </span>
              </div>
            </div>
          </div>
          </div>
        </div>

        <DrawerFooter className="flex-shrink-0 border-t border-slate-100">
          <div className="flex gap-3">
            <Button onClick={handleSave} className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700">
              Save Changes
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="flex-1 rounded-xl border-slate-200">
                Cancel
              </Button>
            </DrawerClose>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}