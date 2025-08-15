import React, { useState, useEffect } from 'react'
import { usePlanStore } from '@/store/planStore'
import { PurchaseGoal, AssetPreset } from '@/engine/types'
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

interface EditPurchaseProps {
  goalId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditPurchase({ goalId, open, onOpenChange }: EditPurchaseProps) {
  const { plan, updateGoal } = usePlanStore()
  const goal = plan.goals.find(g => g.id === goalId) as PurchaseGoal | undefined
  
  const [formData, setFormData] = useState({
    title: '',
    purchaseAge: 45,
    itemCostToday: new Decimal(0),
    inflation: 0.05,
    duringPreset: 'Regular' as AssetPreset,
    customEquityDuring: 60,
  })

  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title,
        purchaseAge: goal.purchaseAge,
        itemCostToday: goal.itemCostToday,
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
      accumulationStopAge: formData.purchaseAge,
    })
    onOpenChange(false)
  }

  const yearsToGo = formData.purchaseAge - plan.profile.age

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[85vh] flex flex-col">
        <DrawerHeader className="flex-shrink-0">
          <DrawerTitle className="text-slate-900">Edit Purchase Goal</DrawerTitle>
          <DrawerDescription className="text-slate-600">
            Configure your major purchase planning parameters
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
              placeholder="House, Car, Property, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="itemCost">Item Cost (Today's Value)</Label>
            <CurrencyInput
              value={formData.itemCostToday}
              onChange={(value) => setFormData(prev => ({ ...prev, itemCostToday: value }))}
              placeholder="₹50,00,000"
              className="rounded-xl border-slate-200"
            />
            <p className="text-xs text-slate-500 mt-1">
              Current market price of the item you want to purchase
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purchaseAge">Target Purchase Age</Label>
            <Input
              id="purchaseAge"
              type="number"
              value={formData.purchaseAge}
              onChange={(e) => setFormData(prev => ({ ...prev, purchaseAge: parseInt(e.target.value) || 45 }))}
              className="rounded-xl border-slate-200"
              min={plan.profile.age + 1}
              max="100"
            />
            <p className="text-xs text-slate-500 mt-1">
              When do you plan to make this purchase?
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
              Expected price inflation for this type of item
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
            <h4 className="font-medium text-slate-900 mb-2">Purchase Goal Summary</h4>
            <div className="text-sm text-slate-600 space-y-1">
              <div>Time to purchase: {yearsToGo} years</div>
              <div>Current cost: ₹{(formData.itemCostToday.toNumber() / 100000).toFixed(1)}L</div>
              <div>Future cost*: ₹{(formData.itemCostToday.mul(Math.pow(1 + formData.inflation, yearsToGo)).toNumber() / 100000).toFixed(1)}L</div>
              <div className="text-xs">*Adjusted for {(formData.inflation * 100).toFixed(1)}% annual inflation</div>
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