import React, { useState, useEffect } from 'react'
import { usePlanStore } from '@/store/planStore'
import { VacationGoal, AssetPreset } from '@/engine/types'
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

interface EditVacationProps {
  goalId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditVacation({ goalId, open, onOpenChange }: EditVacationProps) {
  const { plan, updateGoal } = usePlanStore()
  const goal = plan.goals.find(g => g.id === goalId) as VacationGoal | undefined
  
  const [formData, setFormData] = useState({
    title: '',
    firstHolidayAge: 35,
    lastHolidayAge: 65,
    spendPerYearToday: new Decimal(0),
    inflation: 0.06,
    duringPreset: 'Regular' as AssetPreset,
    customEquityDuring: 60,
  })

  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title,
        firstHolidayAge: goal.firstHolidayAge,
        lastHolidayAge: goal.lastHolidayAge,
        spendPerYearToday: goal.spendPerYearToday,
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
      accumulationStopAge: formData.firstHolidayAge,
    })
    onOpenChange(false)
  }

  const totalYears = formData.lastHolidayAge - formData.firstHolidayAge + 1
  const yearsToStart = formData.firstHolidayAge - plan.profile.age

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[85vh] flex flex-col">
        <DrawerHeader className="flex-shrink-0">
          <DrawerTitle className="text-slate-900">Edit Vacation Goal</DrawerTitle>
          <DrawerDescription className="text-slate-600">
            Configure your vacation and travel planning parameters
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
              placeholder="Annual Vacation Fund, Travel Fund, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="spendPerYear">Annual Vacation Spending (Today's Value)</Label>
            <CurrencyInput
              value={formData.spendPerYearToday}
              onChange={(value) => setFormData(prev => ({ ...prev, spendPerYearToday: value }))}
              placeholder="₹3,00,000"
              className="rounded-xl border-slate-200"
            />
            <p className="text-xs text-slate-500 mt-1">
              How much you want to spend on vacations each year in today's value
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstHolidayAge">Start Vacations At Age</Label>
              <Input
                id="firstHolidayAge"
                type="number"
                value={formData.firstHolidayAge}
                onChange={(e) => setFormData(prev => ({ ...prev, firstHolidayAge: parseInt(e.target.value) || 35 }))}
                className="rounded-xl border-slate-200"
                min={plan.profile.age + 1}
                max="80"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastHolidayAge">Stop Vacations At Age</Label>
              <Input
                id="lastHolidayAge"
                type="number"
                value={formData.lastHolidayAge}
                onChange={(e) => setFormData(prev => ({ ...prev, lastHolidayAge: parseInt(e.target.value) || 65 }))}
                className="rounded-xl border-slate-200"
                min={formData.firstHolidayAge}
                max="100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="inflation">Travel Inflation Rate (%)</Label>
            <Input
              id="inflation"
              type="number"
              step="0.1"
              value={(formData.inflation * 100).toFixed(1)}
              onChange={(e) => setFormData(prev => ({ ...prev, inflation: parseFloat(e.target.value) / 100 || 0.06 }))}
              className="rounded-xl border-slate-200"
            />
            <p className="text-xs text-slate-500 mt-1">
              Travel costs typically inflate faster than general inflation (default: 6%)
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
            <h4 className="font-medium text-slate-900 mb-2">Vacation Goal Summary</h4>
            <div className="text-sm text-slate-600 space-y-1">
              <div>Vacation years: {totalYears} years</div>
              <div>Starts in: {yearsToStart > 0 ? `${yearsToStart} years` : 'Already started'}</div>
              <div>Annual spend (today): ₹{(formData.spendPerYearToday.toNumber() / 100000).toFixed(1)}L</div>
              <div>Total spend (today): ₹{(formData.spendPerYearToday.mul(totalYears).toNumber() / 100000).toFixed(1)}L</div>
            </div>
          </div>

          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4">
            <h4 className="font-medium text-emerald-900 mb-2">💡 Vacation Fund Strategy</h4>
            <div className="text-sm text-emerald-800 space-y-1">
              <div>• Start accumulating before your first vacation</div>
              <div>• Money is withdrawn annually during vacation years</div>
              <div>• Consider higher inflation for international travel</div>
              <div>• Adjust spending based on destinations planned</div>
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