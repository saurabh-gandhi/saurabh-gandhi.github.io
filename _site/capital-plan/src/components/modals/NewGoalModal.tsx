import React, { useState } from 'react'
import { usePlanStore } from '@/store/planStore'
import { Goal } from '@/engine/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { CurrencyInput } from '@/components/inputs/CurrencyInput'
import { Decimal } from 'decimal.js'
import { v4 as uuidv4 } from 'uuid'

interface NewGoalModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewGoalModal({ open, onOpenChange }: NewGoalModalProps) {
  const { plan, addGoal } = usePlanStore()
  const [goalType, setGoalType] = useState<Goal['type']>('retirement')
  const [title, setTitle] = useState('')
  const [targetAmount, setTargetAmount] = useState(new Decimal(1000000))
  const [targetAge, setTargetAge] = useState(65)

  const handleCreate = () => {
    const baseGoal = {
      id: uuidv4(),
      title: title || getDefaultTitle(goalType),
      inflation: 0.05,
      accumulationStartAge: plan.profile.age,
      accumulationStopAge: targetAge,
      duringPreset: 'Regular' as const,
    }

    let newGoal: Goal

    switch (goalType) {
      case 'retirement':
        newGoal = {
          ...baseGoal,
          type: 'retirement',
          monthlySpendToday: new Decimal(100000),
          retireAge: targetAge,
          planTillAge: 90,
          postPreset: 'Safe',
        }
        break
      case 'education':
        newGoal = {
          ...baseGoal,
          type: 'education',
          startInYears: Math.max(1, targetAge - plan.profile.age),
          durationYears: 4,
          costPerYearToday: targetAmount.div(4),
        }
        break
      case 'purchase':
        newGoal = {
          ...baseGoal,
          type: 'purchase',
          purchaseAge: targetAge,
          itemCostToday: targetAmount,
        }
        break
      case 'vacation':
        newGoal = {
          ...baseGoal,
          type: 'vacation',
          firstHolidayAge: Math.max(plan.profile.age + 1, targetAge - 10),
          lastHolidayAge: targetAge,
          spendPerYearToday: targetAmount.div(10),
          inflation: 0.06,
        }
        break
      case 'custom':
        newGoal = {
          ...baseGoal,
          type: 'custom',
          description: 'Custom financial goal',
          targetAmount,
          targetAge,
        }
        break
    }

    addGoal(newGoal)
    onOpenChange(false)
    
    // Reset form
    setTitle('')
    setTargetAmount(new Decimal(1000000))
    setTargetAge(65)
    setGoalType('retirement')
  }

  const getDefaultTitle = (type: Goal['type']) => {
    switch (type) {
      case 'retirement': return 'Retirement'
      case 'education': return 'Education Fund'
      case 'purchase': return 'Major Purchase'
      case 'vacation': return 'Vacation Fund'
      case 'custom': return 'Custom Goal'
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[85vh] flex flex-col">
        <DrawerHeader className="flex-shrink-0">
          <DrawerTitle className="text-slate-900">Create New Goal</DrawerTitle>
          <DrawerDescription className="text-slate-600">
            Add a new financial goal to your plan
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="flex-1 px-4 overflow-y-auto">
          <div className="space-y-6 pb-6">
          <div className="space-y-2">
            <Label>Goal Type</Label>
            <Select value={goalType} onValueChange={(value) => setGoalType(value as Goal['type'])}>
              <SelectTrigger className="rounded-xl border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="retirement">Retirement</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="purchase">Major Purchase</SelectItem>
                <SelectItem value="vacation">Vacation Fund</SelectItem>
                <SelectItem value="custom">Custom Goal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Goal Name</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={getDefaultTitle(goalType)}
              className="rounded-xl border-slate-200"
            />
          </div>

          {goalType !== 'retirement' && (
            <div className="space-y-2">
              <Label htmlFor="amount">
                {goalType === 'vacation' ? 'Annual Spending' : 'Target Amount'}
              </Label>
              <CurrencyInput
                value={targetAmount}
                onChange={setTargetAmount}
                placeholder="₹10,00,000"
                className="rounded-xl border-slate-200"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="age">
              {goalType === 'retirement' ? 'Retirement Age' : 'Target Age'}
            </Label>
            <Input
              id="age"
              type="number"
              value={targetAge}
              onChange={(e) => setTargetAge(parseInt(e.target.value) || 65)}
              className="rounded-xl border-slate-200"
              min={plan.profile.age + 1}
              max="100"
            />
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-600">
              This will create a basic goal that you can customize further by clicking on it after creation.
            </p>
          </div>
          </div>
        </div>

        <DrawerFooter className="flex-shrink-0 border-t border-slate-100">
          <div className="flex gap-3">
            <Button onClick={handleCreate} className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700">
              Create Goal
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