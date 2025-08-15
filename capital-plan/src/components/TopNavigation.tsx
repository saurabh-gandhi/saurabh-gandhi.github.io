import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Share2, TrendingUp, Menu, Zap, ArrowLeft } from 'lucide-react'
import { samplePlans } from '@/lib/samplePlans'

interface TopNavigationProps {
  onShare: () => void
  onToggleSidebar?: () => void
  onLoadSamplePlan?: (planId: string) => void
}

const navItems = [
  { name: 'Plan', active: true },
  { name: 'Invest', active: false },
]

export function TopNavigation({ onShare, onToggleSidebar, onLoadSamplePlan }: TopNavigationProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-slate-200">
      <div className="mx-auto max-w-6xl h-14 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Back Button */}
          <button
            onClick={() => {
              // Check if we're in development (localhost) or production
              const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
              
              if (isLocalhost) {
                // In development, alert user to manually navigate
                alert('In development mode: Please open youfirstwealth.html from the parent directory manually')
              } else {
                // In production (GitHub Pages), navigate to the root path
                window.location.href = '/youfirstwealth.html'
              }
            }}
            className="rounded-lg p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
            title="Back to YouFirst Wealth"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden rounded-lg p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <img 
            src="/youfirstlogo.jpeg" 
            alt="YouFirst Wealth" 
            className="w-8 h-8 rounded-2xl object-cover shadow-sm"
          />
          <span className="font-semibold tracking-tight text-slate-900">YouFirstPlan</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => {
                if (item.name === 'Invest') {
                  window.open('https://www.assetplus.in/mfd/ARN-332142', '_blank')
                }
              }}
              className={`transition-colors ${
                item.active 
                  ? 'text-emerald-700 font-medium' 
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              {item.name}
            </button>
          ))}
          
          {/* Sample Plans Dropdown */}
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-600" />
            <Select onValueChange={onLoadSamplePlan}>
              <SelectTrigger className="w-36 h-8 rounded-lg border-slate-200 text-xs">
                <SelectValue placeholder="Sample Plans" />
              </SelectTrigger>
              <SelectContent>
                {samplePlans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id} className="text-xs">
                    <div>
                      <div className="font-medium">{plan.name}</div>
                      <div className="text-slate-500 text-xs">{plan.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </nav>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onShare}
            className="rounded-xl bg-emerald-600 px-3 py-2 text-white text-sm font-medium shadow-sm hover:bg-emerald-700 flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>
    </header>
  )
}