import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Decimal } from 'decimal.js'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calculate optimal step-up rate based on age, savings, and financial profile
 * Returns a rate between 3% and 7%
 */
export function calculateOptimalStepUpRate(age: number, savings: Decimal): number {
  // Base step-up rate based on age
  let stepUpRate = 0.05 // 5% base rate
  
  // Younger people can afford higher step-ups (career growth potential)
  if (age <= 30) {
    stepUpRate = 0.07 // 7% for young professionals
  } else if (age <= 35) {
    stepUpRate = 0.06 // 6% for early career
  } else if (age <= 45) {
    stepUpRate = 0.05 // 5% for mid career
  } else if (age <= 55) {
    stepUpRate = 0.04 // 4% for late career
  } else {
    stepUpRate = 0.03 // 3% for pre-retirement
  }
  
  // Adjust based on current savings level
  const savingsInLakhs = savings.div(100000).toNumber()
  
  // If low savings, might need higher step-ups to catch up
  if (savingsInLakhs < 10) {
    stepUpRate += 0.005 // Add 0.5%
  } else if (savingsInLakhs > 50) {
    stepUpRate -= 0.005 // Reduce 0.5% if already well-funded
  }
  
  // Ensure we stay within 3% to 7% bounds
  return Math.min(Math.max(stepUpRate, 0.03), 0.07)
}