import React, { useState } from 'react'
import { usePlanStore } from '@/store/planStore'
import { 
  Info, 
  Download, 
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronRight,
  PiggyBank, 
  GraduationCap, 
  Home, 
  Plane, 
  Target
} from 'lucide-react'
import { Decimal } from 'decimal.js'

interface YearlyData {
  year: number
  age: number
  phase: 'SIP Active' | 'SIP Stopped' | 'Withdrawal'
  annualSip: Decimal | null
  withdrawal: Decimal | null
  cumulativeInvestment: Decimal
  portfolioValue: Decimal
  goalRemaining: Decimal | null
  isPeakCorpus?: boolean
  isCorpusExhausted?: boolean
}

type CurrencyUnit = 'L' | 'Cr'
type ValueType = 'Real' | 'Nominal'

const goalIcons = {
  retirement: PiggyBank,
  education: GraduationCap,
  purchase: Home,
  vacation: Plane,
  custom: Target,
}

const goalColors = {
  retirement: 'text-blue-600',
  education: 'text-purple-600',
  purchase: 'text-emerald-600',
  vacation: 'text-orange-600',
  custom: 'text-slate-600',
}

interface GoalTableProps {
  goal: any
  currencyUnit: CurrencyUnit
  valueType: ValueType
  onExport: (goalTitle: string, data: YearlyData[]) => void
}

function SingleGoalTable({ goal, currencyUnit, valueType, onExport }: GoalTableProps) {
  const { plan, computed } = usePlanStore()
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set(['accumulation']))
  
  if (!computed) return null

  const goalComputation = computed.perGoal[goal.id]
  if (!goalComputation) return null

  const currentAge = plan.profile.age
  const IconComponent = goalIcons[goal.type as keyof typeof goalIcons]
  const colorClass = goalColors[goal.type as keyof typeof goalColors]

  // Helper functions - defined before use
  const getGoalEndAge = (goal: any): number => {
    switch (goal.type) {
      case 'retirement': return goal.planTillAge || 85
      case 'education': return currentAge + goal.startInYears + goal.durationYears
      case 'vacation': return goal.lastHolidayAge
      case 'purchase': return goal.purchaseAge + 1
      case 'custom': return goal.targetAge + 1
      default: return currentAge + 30
    }
  }

  const hasWithdrawalAtAge = (goal: any, age: number): boolean => {
    switch (goal.type) {
      case 'retirement': return age >= goal.retireAge
      case 'education':
        const educationStart = currentAge + goal.startInYears
        return age >= educationStart && age < educationStart + goal.durationYears
      case 'vacation': return age >= goal.firstHolidayAge && age <= goal.lastHolidayAge
      case 'purchase': return age === goal.purchaseAge
      case 'custom': return age === goal.targetAge
      default: return false
    }
  }

  const calculateWithdrawal = (goal: any, age: number): Decimal => {
    const yearsFromNow = age - currentAge
    const inflationRate = goal.inflation || 0.05
    const inflationFactor = new Decimal(1 + inflationRate).pow(yearsFromNow)
    
    switch (goal.type) {
      case 'retirement': 
        // Only calculate withdrawal if at or past retirement age
        if (age >= goal.retireAge) {
          return goal.monthlySpendToday.mul(12).mul(inflationFactor)
        }
        return new Decimal(0)
      case 'education': return goal.costPerYearToday.mul(inflationFactor)
      case 'vacation': return goal.spendPerYearToday.mul(inflationFactor)
      case 'purchase': return goal.itemCostToday.mul(inflationFactor)
      case 'custom': return goal.targetAmount.mul(inflationFactor)
      default: return new Decimal(0)
    }
  }

  const getGoalReturnRate = (goal: any, age: number): number => {
    const assumptions = plan.profile.assumptions
    
    // Use goal-specific allocation settings
    if (goal.type === 'retirement' && age >= goal.retireAge && goal.postPreset) {
      // Post-retirement returns
      switch (goal.postPreset) {
        case 'Safe': return assumptions.debtAnnual
        case 'Regular': return assumptions.equityAnnual * 0.4 + assumptions.debtAnnual * 0.6
        case 'Custom':
          const equityPct = (goal.customEquityPost || 20) / 100
          return assumptions.equityAnnual * equityPct + assumptions.debtAnnual * (1 - equityPct)
        default: return assumptions.debtAnnual
      }
    } else {
      // Pre-retirement/accumulation returns
      switch (goal.duringPreset) {
        case 'AllIn': return assumptions.equityAnnual
        case 'Grow': return assumptions.equityAnnual * 0.8 + assumptions.debtAnnual * 0.2
        case 'Regular': return assumptions.equityAnnual * 0.6 + assumptions.debtAnnual * 0.4
        case 'Safe': return assumptions.debtAnnual
        case 'Custom':
          const equityPct = (goal.customEquityDuring || 60) / 100
          return assumptions.equityAnnual * equityPct + assumptions.debtAnnual * (1 - equityPct)
        default: return assumptions.equityAnnual * 0.6 + assumptions.debtAnnual * 0.4
      }
    }
  }

  const getGoalTargetValue = (goal: any): Decimal => {
    if (goalComputation.breakPointCorpus) {
      return goalComputation.breakPointCorpus
    }
    
    const yearsToGoal = getGoalEndAge(goal) - currentAge
    const inflationFactor = new Decimal(1 + goal.inflation).pow(yearsToGoal)
    
    switch (goal.type) {
      case 'education': return goal.costPerYearToday.mul(goal.durationYears).mul(inflationFactor)
      case 'vacation':
        const vacationYears = goal.lastHolidayAge - goal.firstHolidayAge + 1
        return goal.spendPerYearToday.mul(vacationYears).mul(inflationFactor)
      case 'purchase': return goal.itemCostToday.mul(inflationFactor)
      case 'custom': return goal.targetAmount.mul(inflationFactor)
      default: return new Decimal(50000000)
    }
  }

  // Generate goal-specific yearly data
  const generateGoalData = (): YearlyData[] => {
    const data: YearlyData[] = []
    let cumulativeInvestment = new Decimal(0)
    let portfolioValue = new Decimal(0)

    // Add allocated lumpsum
    const allocation = plan.allocations.find(a => a.goalId === goal.id)
    if (allocation) {
      portfolioValue = allocation.lumpsum
    }

    // Determine goal timeline
    const startAge = goal.accumulationStartAge
    const stopAge = goal.accumulationStopAge
    const endAge = getGoalEndAge(goal)
    
    for (let age = currentAge; age <= Math.min(90, endAge + 5); age++) {
      const year = new Date().getFullYear() + (age - currentAge)
      
      // Determine phase
      let phase: YearlyData['phase'] = 'SIP Stopped'
      if (age >= startAge && age < stopAge) {
        phase = 'SIP Active'
      } else if (hasWithdrawalAtAge(goal, age)) {
        phase = 'Withdrawal'
      }
      
      // Debug for retirement goals
      if (goal.type === 'retirement' && age >= goal.retireAge && age <= goal.retireAge + 2) {
        console.log(`🏠 Table Debug Age ${age}:`)
        console.log(`  - Phase: ${phase}`)
        console.log(`  - hasWithdrawalAtAge: ${hasWithdrawalAtAge(goal, age)}`)
        console.log(`  - retireAge: ${goal.retireAge}`)
      }

      // Calculate SIP
      let annualSip: Decimal | null = null
      if (phase === 'SIP Active' && goalComputation.monthlySipYear1.gt(0)) {
        const yearIndex = age - currentAge
        const stepUpRate = plan.profile.stepUp.annualRate
        annualSip = goalComputation.monthlySipYear1.mul(12).mul(
          new Decimal(1 + stepUpRate).pow(yearIndex)
        )
        cumulativeInvestment = cumulativeInvestment.plus(annualSip)
      }

      // Calculate withdrawal
      let withdrawal: Decimal | null = null
      const calculatedWithdrawal = calculateWithdrawal(goal, age)
      if (calculatedWithdrawal.gt(0)) {
        withdrawal = calculatedWithdrawal
        phase = 'Withdrawal' // Update phase if there's a withdrawal
      }
      
      // Debug withdrawal calculation
      if (goal.type === 'retirement' && age >= goal.retireAge && age <= goal.retireAge + 2) {
        console.log(`  - Calculated withdrawal: ₹${calculatedWithdrawal.div(100000).toFixed(1)}L`)
        console.log(`  - Final withdrawal: ${withdrawal ? '₹' + withdrawal.div(100000).toFixed(1) + 'L' : 'null'}`)
      }

      // Simulate portfolio growth
      const returnRate = getGoalReturnRate(goal, age)
      const monthlyReturn = new Decimal(returnRate).div(12)
      
      for (let month = 0; month < 12; month++) {
        portfolioValue = portfolioValue.mul(new Decimal(1).plus(monthlyReturn))
        
        if (annualSip && annualSip.gt(0)) {
          portfolioValue = portfolioValue.plus(annualSip.div(12))
        }
      }

      // Apply annual withdrawal once per year (after monthly growth)
      if (withdrawal && withdrawal.gt(0)) {
        portfolioValue = portfolioValue.minus(withdrawal)
      }

      // Calculate goal remaining
      let goalRemaining: Decimal | null = null
      if (age < endAge) {
        const targetValue = getGoalTargetValue(goal)
        goalRemaining = Decimal.max(targetValue.minus(portfolioValue), 0)
        if (goalRemaining.lte(1000)) goalRemaining = null
      }

      data.push({
        year,
        age,
        phase,
        annualSip,
        withdrawal,
        cumulativeInvestment,
        portfolioValue: Decimal.max(portfolioValue, 0),
        goalRemaining,
      })

      // Stop if portfolio is exhausted or goal is complete
      if (portfolioValue.lte(0) && age >= stopAge) break
      if (age >= endAge && !withdrawal) break
    }

    // Mark peak corpus
    let peakIndex = 0
    let peakValue = new Decimal(0)
    data.forEach((row, index) => {
      if (row.portfolioValue.gt(peakValue)) {
        peakValue = row.portfolioValue
        peakIndex = index
      }
    })
    if (peakIndex < data.length) {
      data[peakIndex].isPeakCorpus = true
    }

    return data
  }

  const yearlyData = generateGoalData()

  const formatCurrency = (value: Decimal | null, showSign: boolean = false): string => {
    if (value === null) return '—'
    
    const absValue = value.abs()
    const sign = value.lt(0) ? '−' : (showSign && value.gt(0) ? '+' : '')
    
    if (currencyUnit === 'Cr') {
      return `${sign}₹${absValue.div(10000000).toFixed(1)}Cr`
    } else {
      return `${sign}₹${absValue.div(100000).toFixed(1)}L`
    }
  }

  const adjustForValueType = (value: Decimal, yearsFromNow: number): Decimal => {
    return valueType === 'Real' ? value.div(new Decimal(1.05).pow(yearsFromNow)) : value
  }

  const togglePhase = (phase: string) => {
    setExpandedPhases(prev => {
      const newSet = new Set(prev)
      newSet.has(phase) ? newSet.delete(phase) : newSet.add(phase)
      return newSet
    })
  }

  // Group data by phases
  const accumulationData = yearlyData.filter(row => row.phase !== 'Withdrawal')
  const withdrawalData = yearlyData.filter(row => row.phase === 'Withdrawal')

  const getPhaseLabel = (phaseType: 'accumulation' | 'withdrawal'): string => {
    if (phaseType === 'accumulation') {
      const ages = accumulationData.map(d => d.age)
      return `Accumulation Phase (Age ${Math.min(...ages)}–${Math.max(...ages)})`
    } else {
      const ages = withdrawalData.map(d => d.age)
      const phaseNames = {
        retirement: 'Retirement Phase',
        education: 'Education Phase',  
        vacation: 'Vacation Phase',
        purchase: 'Purchase Phase',
        custom: 'Goal Achievement Phase'
      }
      return `${phaseNames[goal.type as keyof typeof phaseNames] || 'Withdrawal Phase'} (Age ${Math.min(...ages)}–${Math.max(...ages)})`
    }
  }

  const targetValue = getGoalTargetValue(goal)
  const realTargetValue = targetValue.div(new Decimal(1.05).pow(getGoalEndAge(goal) - currentAge))

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm mb-6">
      {/* Header */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-slate-100 ${colorClass}`}>
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{goal.title}</h3>
              <p className="text-sm text-slate-600 capitalize">{goal.type} Goal</p>
            </div>
          </div>
          <button
            onClick={() => onExport(goal.title, yearlyData)}
            className="flex items-center gap-2 px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-full transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        {/* Goal Summary */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl">
          <div>
            <div className="flex items-center gap-1 text-sm text-slate-600 mb-1">
              <span>Target value (future)</span>
              <Info className="w-3 h-3" />
            </div>
            <div className="text-lg font-semibold text-slate-900">
              {formatCurrency(targetValue)}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1 text-sm text-slate-600 mb-1">
              <span>Today's value (real)</span>
              <Info className="w-3 h-3" />
            </div>
            <div className="text-lg font-semibold text-slate-900">
              {formatCurrency(realTargetValue)}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1 text-sm text-slate-600 mb-1">
              <span>Monthly SIP (Year 1)</span>
              <Info className="w-3 h-3" />
            </div>
            <div className="text-lg font-semibold text-emerald-700">
              {formatCurrency(goalComputation.monthlySipYear1)}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-white border-b border-slate-200">
            <tr>
              <th className="sticky left-0 bg-white px-4 py-3 text-left font-medium text-slate-900 border-r border-slate-200">Year</th>
              <th className="sticky left-16 bg-white px-4 py-3 text-left font-medium text-slate-900 border-r border-slate-200">Age</th>
              <th className="px-4 py-3 text-left font-medium text-slate-900">Phase</th>
              <th className="px-4 py-3 text-right font-medium text-slate-900">
                <div className="flex items-center justify-end gap-1">
                  <ArrowUp className="w-3 h-3 text-emerald-600" />
                  Annual SIP (₹/{currencyUnit.toLowerCase()})
                </div>
              </th>
              <th className="px-4 py-3 text-right font-medium text-slate-900">
                <div className="flex items-center justify-end gap-1">
                  <ArrowDown className="w-3 h-3 text-red-600" />
                  Withdrawal (₹/{currencyUnit.toLowerCase()})
                </div>
              </th>
              <th className="px-4 py-3 text-right font-medium text-slate-900">
                Cumulative Investment (₹{currencyUnit})
              </th>
              <th className="px-4 py-3 text-right font-medium text-slate-900">
                Portfolio Value (₹{currencyUnit})
              </th>
              <th className="px-4 py-3 text-right font-medium text-slate-900">
                Goal Remaining (₹{currencyUnit})
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Accumulation Phase */}
            {accumulationData.length > 0 && (
              <>
                <tr className="bg-slate-50">
                  <td colSpan={8} className="px-4 py-2">
                    <button
                      onClick={() => togglePhase('accumulation')}
                      className="flex items-center gap-2 font-medium text-slate-700 hover:text-slate-900"
                    >
                      {expandedPhases.has('accumulation') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      {getPhaseLabel('accumulation')}
                    </button>
                  </td>
                </tr>
                {expandedPhases.has('accumulation') && accumulationData.map((row, index) => {
                  const yearsFromNow = row.age - currentAge
                  return (
                    <tr 
                      key={row.year} 
                      className={`border-b border-slate-100 hover:bg-slate-50 ${row.isPeakCorpus ? 'bg-emerald-50' : ''}`}
                    >
                      <td className="sticky left-0 bg-white px-4 py-3 font-mono border-r border-slate-200">{row.year}</td>
                      <td className="sticky left-16 bg-white px-4 py-3 font-mono border-r border-slate-200">{row.age}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          row.phase === 'SIP Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {row.phase}
                        </span>
                        {row.isPeakCorpus && (
                          <span className="ml-2 inline-block px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Peak Corpus
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {row.annualSip ? formatCurrency(adjustForValueType(row.annualSip, yearsFromNow)) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">—</td>
                      <td className="px-4 py-3 text-right font-mono">
                        {formatCurrency(adjustForValueType(row.cumulativeInvestment, yearsFromNow))}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {formatCurrency(adjustForValueType(row.portfolioValue, yearsFromNow))}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {row.goalRemaining ? formatCurrency(adjustForValueType(row.goalRemaining, yearsFromNow)) : '— (Goal met)'}
                      </td>
                    </tr>
                  )
                })}
              </>
            )}

            {/* Withdrawal Phase */}
            {withdrawalData.length > 0 && (
              <>
                <tr className="bg-slate-50">
                  <td colSpan={8} className="px-4 py-2">
                    <button
                      onClick={() => togglePhase('withdrawal')}
                      className="flex items-center gap-2 font-medium text-slate-700 hover:text-slate-900"
                    >
                      {expandedPhases.has('withdrawal') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      {getPhaseLabel('withdrawal')}
                    </button>
                  </td>
                </tr>
                {expandedPhases.has('withdrawal') && withdrawalData.map((row, index) => {
                  const yearsFromNow = row.age - currentAge
                  return (
                    <tr 
                      key={row.year} 
                      className={`border-b border-slate-100 hover:bg-slate-50 ${row.isCorpusExhausted ? 'bg-red-50' : ''}`}
                    >
                      <td className="sticky left-0 bg-white px-4 py-3 font-mono border-r border-slate-200">{row.year}</td>
                      <td className="sticky left-16 bg-white px-4 py-3 font-mono border-r border-slate-200">{row.age}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${colorClass.replace('text-', 'bg-').replace('-600', '-100')} ${colorClass.replace('-600', '-800')}`}>
                          {row.phase}
                        </span>
                        {row.isCorpusExhausted && (
                          <span className="ml-2 inline-block px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Corpus ends @ Age {row.age}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">—</td>
                      <td className="px-4 py-3 text-right font-mono text-red-600">
                        {row.withdrawal ? formatCurrency(
                          // For retirement goals, always show nominal (future) withdrawal amounts to match chart
                          goal.type === 'retirement' ? row.withdrawal : 
                          (valueType === 'Real' ? adjustForValueType(row.withdrawal, yearsFromNow) : row.withdrawal), 
                          true
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {formatCurrency(adjustForValueType(row.cumulativeInvestment, yearsFromNow))}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {formatCurrency(adjustForValueType(row.portfolioValue, yearsFromNow))}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">—</td>
                    </tr>
                  )
                })}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function GoalSpecificTables() {
  const { plan } = usePlanStore()
  const [currencyUnit, setCurrencyUnit] = useState<CurrencyUnit>('L')
  const [valueType, setValueType] = useState<ValueType>('Real')

  const exportGoalData = (goalTitle: string, data: YearlyData[]) => {
    const headers = ['Year', 'Age', 'Phase', 'Annual SIP', 'Withdrawal', 'Cumulative Investment', 'Portfolio Value', 'Goal Remaining']
    const formatValue = (value: Decimal | null): string => 
      value ? value.div(currencyUnit === 'Cr' ? 10000000 : 100000).toFixed(1) : ''

    const rows = data.map(row => [
      row.year, row.age, row.phase,
      formatValue(row.annualSip), formatValue(row.withdrawal),
      formatValue(row.cumulativeInvestment), formatValue(row.portfolioValue), formatValue(row.goalRemaining)
    ])

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${goalTitle.toLowerCase().replace(/\s+/g, '-')}-${valueType.toLowerCase()}-${currencyUnit}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mt-8">
      {/* Global Controls */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Goal-by-Goal Breakdown</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <label className="text-slate-600">Units:</label>
            <button
              onClick={() => setCurrencyUnit(currencyUnit === 'L' ? 'Cr' : 'L')}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-700 transition-colors"
            >
              ₹{currencyUnit}
            </button>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <label className="text-slate-600">Values:</label>
            <button
              onClick={() => setValueType(valueType === 'Real' ? 'Nominal' : 'Real')}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-700 transition-colors"
            >
              {valueType}
            </button>
          </div>
        </div>
      </div>

      {/* Individual Goal Tables */}
      {plan.goals.map((goal) => (
        <SingleGoalTable
          key={goal.id}
          goal={goal}
          currencyUnit={currencyUnit}
          valueType={valueType}
          onExport={exportGoalData}
        />
      ))}

      {/* Summary Footer */}
      <div className="p-6 border border-slate-200 rounded-2xl bg-slate-50">
        <div className="text-center text-sm text-slate-600">
          Showing {valueType.toLowerCase()} values in ₹{currencyUnit}. 
          <span className="ml-1">
            {valueType === 'Real' ? 'Adjusted for 5% inflation.' : 'Nominal future values.'}
          </span>
        </div>
      </div>
    </div>
  )
}