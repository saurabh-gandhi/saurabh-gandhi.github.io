import { compress, decompress } from 'lz-string'
import { Plan } from '@/engine/types'
import { PlanSchema } from './schema'
import { Decimal } from 'decimal.js'

/**
 * Create compact representation of plan for URL sharing
 */
function createCompactPlan(plan: Plan): any {
  return {
    // Profile - use short keys
    p: {
      n: plan.profile.name,
      a: plan.profile.age,
      s: plan.profile.savings.toString(),
      su: plan.profile.stepUp.annualRate,
      eq: plan.profile.assumptions.equityAnnual,
      db: plan.profile.assumptions.debtAnnual
    },
    // Goals - use short keys and omit defaults
    g: plan.goals.map(goal => {
      const compact: any = {
        i: goal.id,
        t: goal.type,
        ti: goal.title,
        inf: goal.inflation,
        sa: goal.accumulationStartAge,
        ea: goal.accumulationStopAge,
        dp: goal.duringPreset
      }
      
      // Add type-specific fields with short keys
      if (goal.type === 'retirement') {
        const r = goal as any
        compact.ms = r.monthlySpendToday.toString()
        compact.ra = r.retireAge
        compact.pa = r.planTillAge
        if (r.postPreset) compact.pp = r.postPreset
        if (r.customEquityDuring) compact.ced = r.customEquityDuring
        if (r.customEquityPost) compact.cep = r.customEquityPost
      } else if (goal.type === 'education') {
        const e = goal as any
        compact.sy = e.startInYears
        compact.dy = e.durationYears
        compact.cy = e.costPerYearToday.toString()
      } else if (goal.type === 'vacation') {
        const v = goal as any
        compact.fha = v.firstHolidayAge
        compact.lha = v.lastHolidayAge  
        compact.spy = v.spendPerYearToday.toString()
      } else if (goal.type === 'purchase') {
        const p = goal as any
        compact.pa = p.purchaseAge
        compact.ic = p.itemCostToday.toString()
      } else if (goal.type === 'custom') {
        const c = goal as any
        compact.d = c.description
        compact.ta = c.targetAmount.toString()
        compact.tage = c.targetAge
      }
      
      return compact
    }),
    // Allocations - use short keys
    a: plan.allocations.map(alloc => ({
      g: alloc.goalId,
      l: alloc.lumpsum.toString()
    }))
  }
}

/**
 * Restore plan from compact representation
 */
function restoreCompactPlan(compact: any): Plan {
  return {
    profile: {
      name: compact.p.n,
      age: compact.p.a,
      savings: new Decimal(compact.p.s),
      stepUp: {
        annualRate: compact.p.su
      },
      assumptions: {
        equityAnnual: compact.p.eq,
        debtAnnual: compact.p.db
      }
    },
    goals: compact.g.map((g: any) => {
      const goal: any = {
        id: g.i,
        type: g.t,
        title: g.ti,
        inflation: g.inf,
        accumulationStartAge: g.sa,
        accumulationStopAge: g.ea,
        duringPreset: g.dp
      }
      
      // Restore type-specific fields
      if (g.t === 'retirement') {
        goal.monthlySpendToday = new Decimal(g.ms)
        goal.retireAge = g.ra
        goal.planTillAge = g.pa
        if (g.pp) goal.postPreset = g.pp
        if (g.ced) goal.customEquityDuring = g.ced
        if (g.cep) goal.customEquityPost = g.cep
      } else if (g.t === 'education') {
        goal.startInYears = g.sy
        goal.durationYears = g.dy
        goal.costPerYearToday = new Decimal(g.cy)
      } else if (g.t === 'vacation') {
        goal.firstHolidayAge = g.fha
        goal.lastHolidayAge = g.lha
        goal.spendPerYearToday = new Decimal(g.spy)
      } else if (g.t === 'purchase') {
        goal.purchaseAge = g.pa
        goal.itemCostToday = new Decimal(g.ic)
      } else if (g.t === 'custom') {
        goal.description = g.d
        goal.targetAmount = new Decimal(g.ta)
        goal.targetAge = g.tage
      }
      
      return goal
    }),
    allocations: compact.a.map((a: any) => ({
      goalId: a.g,
      lumpsum: new Decimal(a.l)
    }))
  }
}

/**
 * Generate a short hash ID from plan data
 */
function generateShortId(plan: Plan): string {
  // Create a deterministic hash from plan data
  const planString = JSON.stringify(createCompactPlan(plan))
  
  // Simple hash function
  let hash = 0
  for (let i = 0; i < planString.length; i++) {
    const char = planString.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  // Convert to base36 (0-9, a-z) and take first 10 characters
  const hashString = Math.abs(hash).toString(36)
  const timestamp = Date.now().toString(36).slice(-4) // Last 4 chars of timestamp
  
  return (hashString + timestamp).substring(0, 10).padEnd(10, '0')
}

/**
 * Store plan data in localStorage with short ID
 */
function storePlan(planId: string, plan: Plan): void {
  try {
    const compactPlan = createCompactPlan(plan)
    const compressed = compress(JSON.stringify(compactPlan))
    
    // Store in localStorage with expiry (30 days)
    const storageData = {
      data: compressed,
      timestamp: Date.now(),
      expires: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
    }
    
    localStorage.setItem(`plan_${planId}`, JSON.stringify(storageData))
    console.log(`✅ Plan stored with ID: ${planId}`)
  } catch (error) {
    console.error('❌ Failed to store plan:', error)
    throw new Error('Failed to store plan data')
  }
}

/**
 * Retrieve plan data from localStorage by short ID
 */
function retrievePlan(planId: string): Plan | null {
  try {
    const stored = localStorage.getItem(`plan_${planId}`)
    if (!stored) {
      console.log(`❌ No plan found for ID: ${planId}`)
      return null
    }
    
    const storageData = JSON.parse(stored)
    
    // Check if expired
    if (Date.now() > storageData.expires) {
      console.log(`⏰ Plan ${planId} has expired, removing...`)
      localStorage.removeItem(`plan_${planId}`)
      return null
    }
    
    // Decompress and restore plan
    const jsonString = decompress(storageData.data)
    if (!jsonString) {
      throw new Error('Failed to decompress plan data')
    }
    
    const compactPlan = JSON.parse(jsonString)
    const restoredPlan = restoreCompactPlan(compactPlan)
    
    console.log(`✅ Plan retrieved for ID: ${planId}`)
    return restoredPlan
  } catch (error) {
    console.error(`❌ Failed to retrieve plan ${planId}:`, error)
    return null
  }
}

/**
 * Clean up expired plans from localStorage
 */
function cleanupExpiredPlans(): void {
  try {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('plan_'))
    let cleaned = 0
    
    keys.forEach(key => {
      try {
        const stored = localStorage.getItem(key)
        if (stored) {
          const storageData = JSON.parse(stored)
          if (Date.now() > storageData.expires) {
            localStorage.removeItem(key)
            cleaned++
          }
        }
      } catch (error) {
        // Remove corrupted entries
        localStorage.removeItem(key)
        cleaned++
      }
    })
    
    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} expired plans`)
    }
  } catch (error) {
    console.error('❌ Failed to cleanup expired plans:', error)
  }
}

/**
 * Serialize plan to short URL ID
 */
export function serializePlan(plan: Plan): string {
  try {
    console.log('🔄 Starting plan serialization...', plan)
    
    // Validate plan structure first
    if (!plan || typeof plan !== 'object') {
      throw new Error('Invalid plan object')
    }
    
    if (!plan.profile || !plan.goals || !plan.allocations) {
      throw new Error('Missing required plan properties')
    }
    
    // Clean up expired plans periodically (10% chance)
    if (Math.random() < 0.1) {
      cleanupExpiredPlans()
    }
    
    // Generate short ID and store plan
    const planId = generateShortId(plan)
    storePlan(planId, plan)
    
    console.log(`✅ Plan serialized with ID: ${planId}`)
    
    return planId
  } catch (error) {
    console.error('❌ Failed to serialize plan:', error)
    console.error('❌ Error details:', error.message, error.stack)
    throw new Error(`Failed to create shareable link: ${error.message}`)
  }
}

/**
 * Deserialize plan from URL parameter (short ID or legacy encoded data)
 */
export function deserializePlan(encoded: string): Plan | null {
  try {
    // Check if this is a short ID (10 characters or less, alphanumeric)
    if (encoded.length <= 10 && /^[a-z0-9]+$/i.test(encoded)) {
      console.log(`🔄 Retrieving plan with short ID: ${encoded}`)
      const plan = retrievePlan(encoded)
      if (plan) {
        const validatedPlan = PlanSchema.parse(plan)
        return validatedPlan
      }
      return null
    }
    
    // Legacy format - decode base64 compressed data
    console.log(`🔄 Decoding legacy format: ${encoded.substring(0, 20)}...`)
    
    // Restore base64 padding and characters
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
    while (base64.length % 4) {
      base64 += '='
    }
    
    const binaryString = atob(base64)
    const bytes = Uint8Array.from(binaryString, (char) => char.charCodeAt(0))
    const compressed = new TextDecoder().decode(bytes)
    const jsonString = decompress(compressed)
    
    if (!jsonString) {
      throw new Error('Failed to decompress data')
    }
    
    // Parse compact format
    const compactPlan = JSON.parse(jsonString)
    
    // Check if this is the old format (with __decimal objects)
    if (compactPlan.profile && compactPlan.profile.name) {
      // Old format - handle Decimal objects
      const parsed = JSON.parse(jsonString, (key, value) => {
        if (value && typeof value === 'object' && value.__decimal) {
          return new Decimal(value.__decimal)
        }
        return value
      })
      const validatedPlan = PlanSchema.parse(parsed)
      return validatedPlan
    } else {
      // New compact format - restore from compact representation
      const restoredPlan = restoreCompactPlan(compactPlan)
      const validatedPlan = PlanSchema.parse(restoredPlan)
      return validatedPlan
    }
  } catch (error) {
    console.error('Failed to deserialize plan:', error)
    return null
  }
}

/**
 * Generate shareable URL
 */
export function generateShareUrl(plan: Plan, baseUrl?: string): string {
  const encoded = serializePlan(plan)
  const base = baseUrl || window.location.origin + window.location.pathname
  return `${base}?p=${encoded}`
}

/**
 * Extract plan from current URL
 */
export function getPlanFromUrl(): Plan | null {
  if (typeof window === 'undefined') return null
  
  const urlParams = new URLSearchParams(window.location.search)
  const encoded = urlParams.get('p')
  
  if (!encoded) return null
  
  return deserializePlan(encoded)
}

/**
 * Check if current URL has a shared plan
 */
export function hasSharedPlan(): boolean {
  if (typeof window === 'undefined') return false
  
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.has('p')
}

/**
 * Clear shared plan from URL
 */
export function clearSharedPlanFromUrl(): void {
  if (typeof window === 'undefined') return
  
  const url = new URL(window.location.href)
  url.searchParams.delete('p')
  
  window.history.replaceState({}, document.title, url.toString())
}

/**
 * Estimate serialized size for debugging
 */
export function estimateSerializedSize(plan: Plan): { 
  original: number
  compressed: number
  ratio: number
} {
  const jsonString = JSON.stringify(plan)
  const compressed = compress(jsonString)
  
  return {
    original: jsonString.length,
    compressed: compressed.length,
    ratio: compressed.length / jsonString.length
  }
}