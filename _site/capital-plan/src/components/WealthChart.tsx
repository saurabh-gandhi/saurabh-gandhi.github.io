import React, { useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
} from 'recharts'
import { usePlanStore } from '@/store/planStore'
import { TrendingUp } from 'lucide-react'
import { GoalSpecificTables } from './GoalSpecificTable'

export function WealthChart() {
  const { plan, computed } = usePlanStore()
  const selectedGoal = 'all' // Always show all goals
  const [showAnnualSip, setShowAnnualSip] = useState(false)

  // Custom tick formatters with 1 decimal place
  const formatSipTick = (value: number) => {
    if (value === 0) return '₹0'
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`
    return `₹${Math.round(value)}`
  }

  const formatPortfolioTick = (value: number) => {
    if (value === 0) return '₹0'
    if (value >= 1) return `₹${value.toFixed(1)}Cr` // 1+ crores
    if (value >= 0.01) return `₹${(value * 100).toFixed(1)}L` // Convert to lakhs
    return `₹${(value * 10000).toFixed(1)}K` // Convert to thousands
  }

  // Generate goal-specific chart data - always use main simulation
  const getFilteredChartData = () => {
    console.log('🎯 WealthChart getFilteredChartData called, using main simulation chartSeries')
    return computed?.chartSeries || []
  }

  const chartData = getFilteredChartData()
  console.log('📈 WealthChart chartData:', {
    length: chartData.length, 
    firstPoint: chartData[0], 
    lastPoint: chartData[chartData.length - 1],
    maxValue: Math.max(...chartData.map(d => d.portfolioCr || 0))
  })

  // Generate nice tick intervals for 5-6 ticks
  const generateNiceTickInterval = (maxValue: number, targetTicks: number = 5): number[] => {
    const rawInterval = maxValue / (targetTicks - 1)
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawInterval)))
    const normalizedInterval = rawInterval / magnitude
    
    // Choose nice intervals: 1, 2, 5, 10
    let niceInterval
    if (normalizedInterval <= 1) niceInterval = 1
    else if (normalizedInterval <= 2) niceInterval = 2
    else if (normalizedInterval <= 5) niceInterval = 5
    else niceInterval = 10
    
    const tickInterval = niceInterval * magnitude
    const maxTick = Math.ceil(maxValue / tickInterval) * tickInterval
    
    const ticks = []
    for (let i = 0; i <= Math.floor(maxTick / tickInterval); i++) {
      ticks.push(i * tickInterval)
    }
    
    return ticks.slice(0, 6) // Max 6 ticks
  }

  // Calculate appropriate Y-axis domains based on current chart data
  const axisDomains = React.useMemo(() => {
    if (!chartData.length) return { 
      portfolio: [0, 1], 
      sip: [0, 25000],
      portfolioTicks: [0, 0.2, 0.4, 0.6, 0.8, 1.0],
      sipTicks: [0, 5000, 10000, 15000, 20000, 25000]
    }
    
    const portfolioValues = chartData.map(d => d.portfolioCr).filter(v => v > 0)
    const sipValues = chartData.map(d => d.sipMonthly).filter(v => v !== null && v > 0) as number[]
    
    // Calculate max values with fallbacks
    const maxPortfolio = portfolioValues.length > 0 ? Math.max(...portfolioValues) : 0.5
    const maxSip = sipValues.length > 0 ? Math.max(...sipValues) : 25000
    
    // Generate nice ticks for portfolio (max 6 ticks)
    const portfolioTicks = generateNiceTickInterval(maxPortfolio * 1.1, 5)
    const portfolioDomain = [0, Math.max(...portfolioTicks)]
    
    // Generate nice ticks for SIP (max 6 ticks)  
    const sipTicks = generateNiceTickInterval(maxSip * 1.1, 5)
    const sipDomain = [0, Math.max(...sipTicks)]
    
    console.log('Chart domains:', {
      selectedGoal,
      maxPortfolio,
      maxSip,
      portfolioDomain,
      sipDomain,
      portfolioTicks,
      sipTicks,
      dataLength: chartData.length
    })
    
    return { 
      portfolio: portfolioDomain, 
      sip: sipDomain,
      portfolioTicks,
      sipTicks
    }
  }, [chartData, selectedGoal])

  if (!computed || !chartData.length) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          <h2 className="text-xl font-semibold text-slate-900">Planned Wealth Path</h2>
        </div>
        <div className="h-80 flex items-center justify-center text-slate-600">
          No data available
        </div>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = chartData[label]
      const portfolioValue = payload[0]?.value || 0
      const age = plan.profile.age + label
      const currentYear = new Date().getFullYear()
      const chartYear = currentYear + label
      
      return (
        <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-2xl shadow-lg p-3">
          <div className="text-sm font-medium text-slate-900 mb-2">
            {chartYear} (Age {age})
            {selectedGoal !== 'all' && (
              <div className="text-xs text-slate-500">
                {plan.goals.find(g => g.id === selectedGoal)?.title}
              </div>
            )}
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
                <span className="text-slate-700">Portfolio Value</span>
              </div>
              <span className="font-medium text-slate-900">
                {formatPortfolioTick(portfolioValue)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 border-2 border-emerald-500 rounded-full mr-2"></div>
                <span className="text-slate-700">Monthly SIP</span>
              </div>
              <span className="font-medium text-slate-900">
                {data?.sipMonthly ? formatSipTick(data.sipMonthly) : '—'}
              </span>
            </div>
            {showAnnualSip && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 border-2 border-emerald-700 bg-emerald-100 rounded-full mr-2"></div>
                  <span className="text-slate-700">Annual SIP</span>
                </div>
                <span className="font-medium text-slate-900">
                  {data?.sipAnnual ? formatSipTick(data.sipAnnual) : '—'}
                </span>
              </div>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-emerald-600" />
        <h2 className="text-xl font-semibold text-slate-900">Planned Wealth Path</h2>
      </div>
        <div className="h-64 sm:h-72 lg:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              key={`${selectedGoal}-${axisDomains.portfolio[1]}-${axisDomains.sip[1]}`}
              data={chartData}
              margin={{
                top: 20,
                right: 80,
                left: 90,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              
              <XAxis
                dataKey="year"
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(value) => `${new Date().getFullYear() + value}`}
                axisLine={false}
                tickLine={false}
              />
              
              <YAxis
                yAxisId="portfolio"
                orientation="right"
                stroke="#64748b"
                fontSize={11}
                tickFormatter={formatPortfolioTick}
                axisLine={false}
                tickLine={false}
                domain={axisDomains.portfolio}
                ticks={axisDomains.portfolioTicks}
                type="number"
                allowDataOverflow={false}
                scale="linear"
                width={50}
              />
              
              <YAxis
                yAxisId="sipMonthly"
                orientation="left"
                stroke="#059669"
                fontSize={11}
                tickFormatter={formatSipTick}
                axisLine={false}
                tickLine={false}
                domain={axisDomains.sip}
                ticks={axisDomains.sipTicks}
                type="number"
                allowDataOverflow={false}
                scale="linear"
                width={70}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              {/* Portfolio Area Chart */}
              <Area
                yAxisId="portfolio"
                type="monotone"
                dataKey="portfolioCr"
                stroke="#059669"
                strokeWidth={2}
                fill="#059669"
                fillOpacity={0.1}
                dot={false}
              />
              
              {/* Monthly SIP Line */}
              <Line
                yAxisId="sipMonthly"
                type="monotone"
                dataKey="sipMonthly"
                stroke="#059669"
                strokeWidth={2.5}
                strokeDasharray="6 4"
                dot={false}
                connectNulls={false}
              />
              
              {/* Annual SIP Line - conditionally rendered */}
              {showAnnualSip && (
                <Line
                  yAxisId="sipMonthly"
                  type="monotone"
                  dataKey="sipAnnual"
                  stroke="#047857"
                  strokeWidth={2}
                  strokeDasharray="12 6"
                  dot={false}
                  connectNulls={false}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-6 text-sm text-slate-600">
            <div className="flex items-center">
              <div className="w-6 h-3 bg-emerald-500 opacity-20 mr-2 rounded-sm"></div>
              <span>Portfolio Value (₹Cr) — right axis</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-0 border-t-[2.5px] border-emerald-500 mr-2" style={{borderStyle: 'dashed', borderDasharray: '6 4'}}></div>
              <span>Monthly SIP (₹) — left axis</span>
            </div>
            {showAnnualSip && (
              <div className="flex items-center">
                <div className="w-6 h-0 border-t-2 border-emerald-700 mr-2" style={{borderStyle: 'dashed', borderDasharray: '12 6'}}></div>
                <span>Annual SIP (₹/yr) — dashed</span>
              </div>
            )}
          </div>
          
          <button
            onClick={() => setShowAnnualSip(!showAnnualSip)}
            className="text-xs px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors"
          >
            {showAnnualSip ? 'Hide' : 'Show'} Annual SIP
          </button>
        </div>
    </div>
  )
}

export function WealthChartWithTable() {
  return (
    <div>
      <WealthChart />
      <GoalSpecificTables />
    </div>
  )
}