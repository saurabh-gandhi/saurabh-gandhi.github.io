import React, { useState, useEffect } from 'react'
import { usePlanStore } from '@/store/planStore'
import { CustomGoal, AssetPreset } from '@/engine/types'
import { CurrencyInput } from '@/components/inputs/CurrencyInput'
import { AssetPresetSelect } from '@/components/inputs/AssetPresetSelect'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
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

interface EditCustomProps {
  goalId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditCustom({ goalId, open, onOpenChange }: EditCustomProps) {
  const { plan, updateGoal } = usePlanStore()
  const goal = plan.goals.find(g => g.id === goalId) as CustomGoal | undefined
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAmount: new Decimal(0),
    targetAge: 50,
    inflation: 0.05,
    duringPreset: 'Regular' as AssetPreset,
    customEquityDuring: 60,
  })

  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title,
        description: goal.description,
        targetAmount: goal.targetAmount,
        targetAge: goal.targetAge,
        inflation: goal.inflation,
        duringPreset: goal.duringPreset,
        customEquityDuring: goal.customEquityDuring || 60,
      })
    }
  }, [goal])

  if (!goal) return null

  const handleSave = () => {
    updateGoal(goalId, {
      ...formData,
      accumulationStartAge: plan.profile.age,
      accumulationStopAge: formData.targetAge,
    })
    onOpenChange(false)
  }

  const yearsToGo = formData.targetAge - plan.profile.age

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[85vh] flex flex-col">
        <DrawerHeader className="flex-shrink-0">
          <DrawerTitle className="text-slate-900">Edit Custom Goal</DrawerTitle>
          <DrawerDescription className="text-slate-600">
            Configure your custom financial goal parameters
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
              placeholder="Emergency Fund, Business Investment, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="rounded-xl border-slate-200 min-h-[80px]"
              placeholder="Describe what this goal is for and any special considerations..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAmount">Target Amount (Today's Value)</Label>
            <CurrencyInput
              value={formData.targetAmount}
              onChange={(value) => setFormData(prev => ({ ...prev, targetAmount: value }))}
              placeholder="₹25,00,000"
              className="rounded-xl border-slate-200"
            />
            <p className="text-xs text-slate-500 mt-1">
              Total amount needed in today's purchasing power
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAge">Target Achievement Age</Label>
            <Input
              id="targetAge"
              type="number"
              value={formData.targetAge}
              onChange={(e) => setFormData(prev => ({ ...prev, targetAge: parseInt(e.target.value) || 50 }))}
              className="rounded-xl border-slate-200"
              min={plan.profile.age + 1}
              max="100"
            />
            <p className="text-xs text-slate-500 mt-1">
              When do you want to achieve this goal?
            </p>
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
            <p className="text-xs text-slate-500 mt-1">
              Expected inflation rate for this type of goal
            </p>
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

          <div className="rounded-2xl bg-slate-50 p-4">
            <h4 className="font-medium text-slate-900 mb-2">Custom Goal Summary</h4>
            <div className="text-sm text-slate-600 space-y-1">
              <div>Time to achieve: {yearsToGo} years</div>
              <div>Target amount (today): ₹{(formData.targetAmount.toNumber() / 100000).toFixed(1)}L</div>
              <div>Future value*: ₹{(formData.targetAmount.mul(Math.pow(1 + formData.inflation, yearsToGo)).toNumber() / 100000).toFixed(1)}L</div>
              <div className="text-xs">*Adjusted for {(formData.inflation * 100).toFixed(1)}% annual inflation</div>
            </div>
          </div>

          <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4">
            <h4 className="font-medium text-blue-900 mb-2">💡 Custom Goal Tips</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <div>• Be specific about what you want to achieve</div>
              <div>• Consider if this goal has special inflation characteristics</div>
              <div>• Adjust asset allocation based on time horizon</div>
              <div>• Review and update goals periodically</div>
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