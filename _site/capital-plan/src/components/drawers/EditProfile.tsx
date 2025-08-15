import React, { useState, useEffect } from 'react'
import { usePlanStore } from '@/store/planStore'
import { CurrencyInput } from '@/components/inputs/CurrencyInput'
import { PercentInput } from '@/components/inputs/PercentInput'
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
import { calculateOptimalStepUpRate } from '@/lib/utils'

interface EditProfileProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditProfile({ open, onOpenChange }: EditProfileProps) {
  const { plan, setProfile } = usePlanStore()
  
  const [formData, setFormData] = useState({
    name: '',
    age: 35,
    savings: new Decimal(0),
    equityReturn: 0.12,
    debtReturn: 0.06,
  })
  
  // Calculate step-up rate based on current form values
  const calculatedStepUpRate = calculateOptimalStepUpRate(formData.age, formData.savings)

  useEffect(() => {
    setFormData({
      name: plan.profile.name,
      age: plan.profile.age,
      savings: plan.profile.savings,
      equityReturn: plan.profile.assumptions.equityAnnual,
      debtReturn: plan.profile.assumptions.debtAnnual,
    })
  }, [plan.profile])

  const handleSave = () => {
    setProfile({
      name: formData.name,
      age: formData.age,
      savings: formData.savings,
      assumptions: {
        equityAnnual: formData.equityReturn,
        debtAnnual: formData.debtReturn,
      },
    })
    onOpenChange(false)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[85vh] flex flex-col">
        <DrawerHeader className="flex-shrink-0">
          <DrawerTitle className="text-slate-900">Edit Profile</DrawerTitle>
          <DrawerDescription className="text-slate-600">
            Update your basic information and investment assumptions
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="flex-1 px-4 overflow-y-auto">
          <div className="space-y-6 pb-6">
            <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="rounded-xl border-slate-200"
              placeholder="Your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Current Age</Label>
            <Input
              id="age"
              type="number"
              value={formData.age}
              onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) || 35 }))}
              className="rounded-xl border-slate-200"
              min="18"
              max="100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="savings">Total Savings Available</Label>
            <CurrencyInput
              value={formData.savings}
              onChange={(value) => setFormData(prev => ({ ...prev, savings: value }))}
              placeholder="₹40,00,000"
              className="rounded-xl border-slate-200"
            />
            <p className="text-xs text-slate-500 mt-1">
              Total amount available for investment across all goals
            </p>
          </div>

          <div className="space-y-2">
            <Label>Annual Step-up Rate (Auto-calculated)</Label>
            <div className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium">
              {(calculatedStepUpRate * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Automatically calculated based on your age and savings (3%-7% range)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="equityReturn">Expected Equity Return</Label>
              <PercentInput
                value={formData.equityReturn}
                onChange={(value) => setFormData(prev => ({ ...prev, equityReturn: value }))}
                className="rounded-xl border-slate-200"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="debtReturn">Expected Debt Return</Label>
              <PercentInput
                value={formData.debtReturn}
                onChange={(value) => setFormData(prev => ({ ...prev, debtReturn: value }))}
                className="rounded-xl border-slate-200"
              />
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <h4 className="font-medium text-slate-900 mb-2">Default Assumptions</h4>
            <div className="text-sm text-slate-600 space-y-1">
              <div>• Equity: 12% annual return</div>
              <div>• Debt: 6% annual return</div>
              <div>• Step-up: Auto-calculated (3%-7% based on age & savings)</div>
              <div>• All returns are nominal (before inflation)</div>
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