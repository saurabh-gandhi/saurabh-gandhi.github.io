import React, { useState, useEffect } from 'react'
import { usePlanStore } from '@/store/planStore'
import { EducationGoal, AssetPreset } from '@/engine/types'
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

interface EditEducationProps {
  goalId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditEducation({ goalId, open, onOpenChange }: EditEducationProps) {
  const { plan, updateGoal } = usePlanStore()
  const goal = plan.goals.find(g => g.id === goalId) as EducationGoal | undefined
  
  const [formData, setFormData] = useState({
    title: '',
    startInYears: 5,
    durationYears: 4,
    costPerYearToday: new Decimal(0),
    inflation: 0.05,
    duringPreset: 'Regular' as AssetPreset,
    customEquityDuring: 60,
  })

  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title,
        startInYears: goal.startInYears,
        durationYears: goal.durationYears,
        costPerYearToday: goal.costPerYearToday,
        inflation: goal.inflation,
        duringPreset: goal.duringPreset,
        customEquityDuring: goal.customEquityDuring || 60,
      })
    }
  }, [goal])

  if (!goal) return null

  const handleSave = () => {
    const targetAge = plan.profile.age + formData.startInYears
    updateGoal(goalId, {
      ...formData,
      accumulationStartAge: plan.profile.age,
      accumulationStopAge: targetAge,
    })
    onOpenChange(false)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[85vh] flex flex-col">
        <DrawerHeader className="flex-shrink-0">
          <DrawerTitle className="text-slate-900">Edit Education Goal</DrawerTitle>
          <DrawerDescription className="text-slate-600">
            Configure your education funding parameters
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
            <Label htmlFor="costPerYear">Cost Per Year (Today's Value)</Label>
            <CurrencyInput
              value={formData.costPerYearToday}
              onChange={(value) => setFormData(prev => ({ ...prev, costPerYearToday: value }))}
              placeholder="₹5,00,000"
              className="rounded-xl border-slate-200"
            />
            <p className="text-xs text-slate-500 mt-1">
              Annual education cost in today's value. Will be adjusted for inflation.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startInYears">Starts In (Years)</Label>
              <Input
                id="startInYears"
                type="number"
                value={formData.startInYears}
                onChange={(e) => setFormData(prev => ({ ...prev, startInYears: parseInt(e.target.value) || 1 }))}
                className="rounded-xl border-slate-200"
                min="1"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="durationYears">Duration (Years)</Label>
              <Input
                id="durationYears"
                type="number"
                value={formData.durationYears}
                onChange={(e) => setFormData(prev => ({ ...prev, durationYears: parseInt(e.target.value) || 4 }))}
                className="rounded-xl border-slate-200"
                min="1"
                max="10"
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
            <p className="text-xs text-slate-500 mt-1">
              Expected inflation rate for education costs (typically higher than general inflation)
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
            <h4 className="font-medium text-slate-900 mb-2">Education Goal Summary</h4>
            <div className="text-sm text-slate-600 space-y-1">
              <div>Total Duration: {formData.durationYears} years</div>
              <div>Starting Age: {plan.profile.age + formData.startInYears}</div>
              <div>Annual Cost (today): ₹{(formData.costPerYearToday.toNumber() / 100000).toFixed(1)}L</div>
              <div>Total Cost (today): ₹{(formData.costPerYearToday.mul(formData.durationYears).toNumber() / 100000).toFixed(1)}L</div>
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