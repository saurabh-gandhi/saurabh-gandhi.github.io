import { Decimal } from 'decimal.js'

console.log('=== Chart Portfolio Simulation Debug ===')
console.log('Please provide the following values from the application:')
console.log('')

// This script will help debug the chart simulation
// User should provide the actual values from the app

function debugPortfolioSimulation(params) {
  const {
    currentAge,
    initialLumpsum = 0,
    contributions = [],
    withdrawals = [],
    equityReturn,
    debtReturn,
    assumedRetirementAge = 60,
  } = params

  console.log('=== Input Parameters ===')
  console.log(`Current Age: ${currentAge}`)
  console.log(`Initial Lumpsum: ₹${initialLumpsum.toLocaleString()}`)
  console.log(`Equity Return: ${(equityReturn * 100).toFixed(1)}%`)
  console.log(`Debt Return: ${(debtReturn * 100).toFixed(1)}%`)
  console.log(`Assumed Retirement Age: ${assumedRetirementAge}`)
  console.log(`Contributions: ${contributions.length} items`)
  console.log(`Withdrawals: ${withdrawals.length} items`)

  function getMonthlyRateForAge(age) {
    let equityPct = age >= assumedRetirementAge ? 0.2 : 0.6
    const annualRate = equityReturn * equityPct + debtReturn * (1 - equityPct)
    return new Decimal(1 + annualRate).pow(1/12).minus(1)
  }

  // Simulate the portfolio step by step
  const maxAge = 90
  const maxMonth = (maxAge - currentAge) * 12
  let balance = new Decimal(initialLumpsum)
  
  // Sort cashflows
  const allCashflows = [...contributions, ...withdrawals]
    .sort((a, b) => a.monthIndex - b.monthIndex)
  
  console.log('\n=== Year-by-Year Simulation ===')
  console.log('Age | Year | Balance (Cr) | Monthly Rate (%) | Cashflows | Pre-Returns | Post-Returns')
  console.log('----'.repeat(20))

  let lastProcessedMonth = 0
  
  for (let month = 0; month <= maxMonth; month += 12) {
    const year = Math.floor(month / 12)
    const age = currentAge + year
    
    if (age > maxAge) break
    
    const preBalance = balance.toNumber()
    
    // Apply returns for the year
    const monthsToProcess = month - lastProcessedMonth
    if (monthsToProcess > 0) {
      const monthlyRate = getMonthlyRateForAge(age)
      const preReturnsBalance = balance.toNumber()
      balance = balance.mul(new Decimal(1).plus(monthlyRate).pow(monthsToProcess))
      const postReturnsBalance = balance.toNumber()
      
      console.log(`${age.toString().padStart(3)} | ${year.toString().padStart(4)} | ${(preReturnsBalance / 10000000).toFixed(2).padStart(12)} | ${(monthlyRate.toNumber() * 100).toFixed(3).padStart(13)} | Processing... | ${(preReturnsBalance / 10000000).toFixed(2).padStart(11)} | ${(postReturnsBalance / 10000000).toFixed(2).padStart(12)}`)
    }
    
    // Process cashflows for this year
    const yearCashflows = allCashflows.filter(cf => 
      cf.monthIndex >= month && cf.monthIndex <= month + 11
    )
    
    let totalCashflow = 0
    for (const cf of yearCashflows) {
      balance = balance.plus(cf.amount)
      totalCashflow += cf.amount.toNumber()
    }
    
    const finalBalance = balance.toNumber()
    
    if (yearCashflows.length > 0) {
      console.log(`    |      |              |               | ₹${(totalCashflow / 100000).toFixed(1)}L CF    |             | ${(finalBalance / 10000000).toFixed(2).padStart(12)}`)
    }
    
    // Check for negative balance
    if (balance.lt(0)) {
      console.log(`*** NEGATIVE BALANCE DETECTED at age ${age}! Balance: ₹${(finalBalance / 10000000).toFixed(2)}Cr ***`)
      
      // Analyze what caused it
      const yearWithdrawals = yearCashflows.filter(cf => cf.amount.lt(0))
      const totalWithdrawal = yearWithdrawals.reduce((sum, cf) => sum + Math.abs(cf.amount.toNumber()), 0)
      
      console.log(`Total withdrawals this year: ₹${(totalWithdrawal / 100000).toFixed(1)}L`)
      console.log(`Balance before withdrawals: ₹${((finalBalance + totalWithdrawal) / 10000000).toFixed(2)}Cr`)
      
      break
    }
    
    lastProcessedMonth = month + 12
  }

  console.log('\n=== Cashflow Analysis ===')
  console.log('Contributions:')
  contributions.forEach((cf, i) => {
    const month = cf.monthIndex
    const year = Math.floor(month / 12)
    const age = currentAge + year
    console.log(`  ${i + 1}. Age ${age} (Month ${month}): +₹${cf.amount.toNumber().toLocaleString()}`)
  })

  console.log('\nWithdrawals:')
  withdrawals.forEach((cf, i) => {
    const month = cf.monthIndex
    const year = Math.floor(month / 12)
    const age = currentAge + year
    console.log(`  ${i + 1}. Age ${age} (Month ${month}): -₹${Math.abs(cf.amount.toNumber()).toLocaleString()}`)
  })
}

// Example usage - replace with actual values from the app
console.log('To use this script, call:')
console.log('')
console.log('debugPortfolioSimulation({')
console.log('  currentAge: 35,  // Current age from app')
console.log('  initialLumpsum: 40000000,  // Initial lumpsum in ₹')
console.log('  equityReturn: 0.12,  // 12%')
console.log('  debtReturn: 0.06,    // 6%')
console.log('  contributions: [')
console.log('    { monthIndex: 0, amount: new Decimal(50000) },  // SIP contributions')
console.log('    // ... more contributions')
console.log('  ],')
console.log('  withdrawals: [')
console.log('    { monthIndex: 300, amount: new Decimal(-100000) },  // Retirement withdrawals')
console.log('    // ... more withdrawals')
console.log('  ]')
console.log('})')
console.log('')
console.log('Please run the app, inspect the console/network to get the actual values,')
console.log('then call this function with those values to debug the issue.')

// Export for use
export { debugPortfolioSimulation }