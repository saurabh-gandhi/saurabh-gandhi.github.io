import React, { useState, useEffect } from 'react'
import { usePlanStore } from './store/planStore'
import { TopNavigation } from './components/TopNavigation'
import { LeftSidebar } from './components/LeftSidebar'
import { SummaryBanner } from './components/SummaryBanner'
import { AllocationStrip } from './components/AllocationStrip'
import { WealthChartWithTable } from './components/WealthChart'
import { EditProfile } from './components/drawers/EditProfile'
import { EditRetirement } from './components/drawers/EditRetirement'
import { EditEducation } from './components/drawers/EditEducation'
import { EditPurchase } from './components/drawers/EditPurchase'
import { EditVacation } from './components/drawers/EditVacation'
import { EditCustom } from './components/drawers/EditCustom'
import { NewGoalModal } from './components/modals/NewGoalModal'
import { ShareModal } from './components/modals/ShareModal'
import { getPlanFromUrl, hasSharedPlan } from './lib/share'
import { samplePlans, prepareSamplePlan } from './lib/samplePlans'

function App() {
  const { loadPlan, clearPlan, compute, plan, removeGoal } = usePlanStore()
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showProfileEdit, setShowProfileEdit] = useState(false)
  const [showNewGoal, setShowNewGoal] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)

  // Load shared plan on mount
  useEffect(() => {
    if (hasSharedPlan()) {
      const sharedPlan = getPlanFromUrl()
      if (sharedPlan) {
        loadPlan(sharedPlan)
      }
    } else {
      // Trigger initial computation for default plan
      compute()
    }
  }, [loadPlan, compute])

  const handleEditProfile = () => {
    setShowProfileEdit(true)
  }

  const handleEditGoal = (goalId: string) => {
    setSelectedGoal(goalId)
  }

  const handleNewGoal = () => {
    setShowNewGoal(true)
  }

  const handleClearPlan = () => {
    if (confirm('Are you sure you want to clear all goals and reset the plan?')) {
      clearPlan()
    }
  }

  const handleShare = () => {
    setShowShareModal(true)
  }

  const handleDeleteGoal = (goalId: string) => {
    removeGoal(goalId)
  }

  const handleLoadSamplePlan = (planId: string) => {
    const samplePlan = samplePlans.find(p => p.id === planId)
    if (samplePlan) {
      const preparedPlan = prepareSamplePlan(samplePlan)
      loadPlan(preparedPlan)
      // Show a brief notification
      console.log(`📋 Loaded sample plan: ${samplePlan.name}`)
    }
  }

  // Get the selected goal for editing
  const goalToEdit = selectedGoal ? plan.goals.find(g => g.id === selectedGoal) : null

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white text-slate-900 overflow-hidden">
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -top-24 right-[-10%] h-72 w-72 rounded-full bg-emerald-200 blur-3xl opacity-30"></div>
      
      <TopNavigation 
        onShare={handleShare} 
        onToggleSidebar={() => setShowSidebar(!showSidebar)}
        onLoadSamplePlan={handleLoadSamplePlan}
      />
      
      <div className="flex flex-1 min-h-0">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <LeftSidebar
            onEditProfile={handleEditProfile}
            onEditGoal={handleEditGoal}
            onNewGoal={handleNewGoal}
            onClearPlan={handleClearPlan}
            onDeleteGoal={handleDeleteGoal}
          />
        </div>
        
        {/* Mobile Sidebar Drawer */}
        {showSidebar && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowSidebar(false)} />
            <div className="relative flex w-72 flex-col bg-white">
              <LeftSidebar
                onEditProfile={handleEditProfile}
                onEditGoal={handleEditGoal}
                onNewGoal={handleNewGoal}
                onClearPlan={handleClearPlan}
                onDeleteGoal={handleDeleteGoal}
              />
            </div>
          </div>
        )}
        
        <main className="flex-1 px-3 sm:px-4 lg:px-6 py-4 overflow-y-auto">
          <div className="max-w-6xl space-y-4 sm:space-y-6">
            <SummaryBanner />
            <AllocationStrip />
            <WealthChartWithTable />
          </div>
        </main>
      </div>

      {/* Modals and Drawers */}
      <EditProfile 
        open={showProfileEdit} 
        onOpenChange={setShowProfileEdit} 
      />
      
      <NewGoalModal 
        open={showNewGoal} 
        onOpenChange={setShowNewGoal} 
      />
      
      <ShareModal 
        open={showShareModal} 
        onOpenChange={setShowShareModal} 
      />

      {/* Goal Edit Drawers */}
      {goalToEdit?.type === 'retirement' && (
        <EditRetirement
          goalId={selectedGoal!}
          open={!!selectedGoal}
          onOpenChange={(open) => !open && setSelectedGoal(null)}
        />
      )}

      {goalToEdit?.type === 'education' && (
        <EditEducation
          goalId={selectedGoal!}
          open={!!selectedGoal}
          onOpenChange={(open) => !open && setSelectedGoal(null)}
        />
      )}

      {goalToEdit?.type === 'purchase' && (
        <EditPurchase
          goalId={selectedGoal!}
          open={!!selectedGoal}
          onOpenChange={(open) => !open && setSelectedGoal(null)}
        />
      )}

      {goalToEdit?.type === 'vacation' && (
        <EditVacation
          goalId={selectedGoal!}
          open={!!selectedGoal}
          onOpenChange={(open) => !open && setSelectedGoal(null)}
        />
      )}

      {goalToEdit?.type === 'custom' && (
        <EditCustom
          goalId={selectedGoal!}
          open={!!selectedGoal}
          onOpenChange={(open) => !open && setSelectedGoal(null)}
        />
      )}
    </div>
  )
}

export default App