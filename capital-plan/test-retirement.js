// Test script to validate retirement calculation
// Test Case: Current Age 31, FIRE 60, Monthly Expense 100k, Expected SIP: 21731.54623

function calculateRetirementTest() {
  // Test Case 1
  const testInputs1 = {
    currentAge: 31,
    fireAge: 60,
    currentCorpus: 0,
    monthlyExpense: 100000,
    surviveUntil: 85,
    returnsEarning: 0.12, // 12%
    returnsRetirement: 0.07, // 7%
    inflation: 0.05, // 5%
    stepUp: 0.05 // 5%
  }
  
  // Test Case 2
  const testInputs2 = {
    currentAge: 32,
    fireAge: 45,
    currentCorpus: 0,
    monthlyExpense: 100000,
    surviveUntil: 85,
    returnsEarning: 0.12 * 0.6 + 0.06 * 0.4, // 60% equity, 40% debt = 9.6%
    returnsRetirement: 0.12 * 0.2 + 0.06 * 0.8, // 20% equity, 80% debt = 7.2%
    inflation: 0.05, // 5%
    stepUp: 0.05 // 5%
  }
  
  // Test both cases
  console.log('=== TEST CASE 1 ===')
  const testInputs = testInputs1

  console.log('=== Test Inputs ===')
  console.log(testInputs)

  // Step 1: Calculate required corpus at retirement
  const corpusRequired = calculateRequiredCorpusAtRetirement(testInputs)
  console.log('\n=== Required Corpus at Retirement ===')
  console.log('₹', corpusRequired.toLocaleString())

  // Step 2: Calculate SIP needed
  const sip = calculateSipForCorpus(
    corpusRequired,
    testInputs.currentAge,
    testInputs.fireAge,
    testInputs.currentCorpus,
    testInputs.returnsEarning,
    testInputs.stepUp
  )

  console.log('\n=== SIP Calculation ===')
  console.log('SIP Required: ₹', sip.toFixed(5))
  console.log('Expected SIP: ₹21,731.54623')
  console.log('Match:', Math.abs(sip - 21731.54623) < 1 ? 'YES' : 'NO')

  // Step 3: Validate by simulation
  const validation = validateRetirementPlan(testInputs, sip)
  console.log('\n=== Validation ===')
  console.log('Corpus at retirement:', validation.corpusAtRetirement.toLocaleString())
  console.log('Final corpus at 85:', validation.finalCorpusAt85.toFixed(2))
  console.log('Valid (close to 0):', validation.valid ? 'YES' : 'NO')

  return {
    requiredCorpus: corpusRequired,
    calculatedSip: sip,
    expectedSip: 21731.54623,
    matches: Math.abs(sip - 21731.54623) < 1,
    validation
  }
}

// Helper functions (simplified versions)
function calculateRequiredCorpusAtRetirement(inputs) {
  const {
    fireAge,
    monthlyExpense,
    surviveUntil,
    returnsRetirement,
    inflation,
    currentAge
  } = inputs

  const yearsToRetirement = fireAge - currentAge
  const yearsInRetirement = surviveUntil - fireAge
  
  // Calculate monthly expense at retirement (inflated)
  const monthlyExpenseAtRetirement = monthlyExpense * Math.pow(1 + inflation, yearsToRetirement)
  
  // Convert annual rates to monthly rates
  const monthlyReturnRate = Math.pow(1 + returnsRetirement, 1/12) - 1
  const monthlyInflationRate = Math.pow(1 + inflation, 1/12) - 1
  
  // Calculate present value of growing annuity
  const totalMonths = yearsInRetirement * 12
  const r = monthlyReturnRate
  const g = monthlyInflationRate
  const pmt = monthlyExpenseAtRetirement
  
  let corpus
  
  if (Math.abs(r - g) < 1e-10) {
    corpus = pmt * totalMonths / (1 + r)
  } else {
    const growthRatio = (1 + g) / (1 + r)
    corpus = pmt * (1 - Math.pow(growthRatio, totalMonths)) / (r - g)
  }
  
  return corpus
}

function calculateSipForCorpus(targetCorpus, currentAge, fireAge, currentCorpus, returnsEarning, stepUp) {
  const yearsToAccumulate = fireAge - currentAge
  const monthlyReturnRate = Math.pow(1 + returnsEarning, 1/12) - 1
  
  // Future value of current corpus
  const futureValueOfCurrentCorpus = currentCorpus * Math.pow(1 + returnsEarning, yearsToAccumulate)
  
  // Remaining corpus needed from SIPs
  const remainingCorpus = targetCorpus - futureValueOfCurrentCorpus
  
  if (remainingCorpus <= 0) {
    return 0
  }
  
  console.log('SIP Debug:', {
    targetCorpus,
    futureValueOfCurrentCorpus,
    remainingCorpus,
    yearsToAccumulate,
    monthlyReturnRate
  })
  
  // Try different approaches to match expected result
  
  // Approach 1: Annual step-up applied yearly (not monthly)
  const annualReturnRate = returnsEarning
  const r_annual = annualReturnRate
  const g_annual = stepUp
  
  if (Math.abs(r_annual - g_annual) < 1e-10) {
    // Equal rates case
    const sip_annual = remainingCorpus / (yearsToAccumulate * Math.pow(1 + r_annual, yearsToAccumulate - 1))
    console.log('Approach 1 (Annual, equal rates):', sip_annual / 12)
  } else {
    // Different rates case
    const numerator = remainingCorpus * (r_annual - g_annual)
    const denominator = Math.pow(1 + r_annual, yearsToAccumulate) - Math.pow(1 + g_annual, yearsToAccumulate)
    const sip_annual = numerator / denominator
    console.log('Approach 1 (Annual, different rates):', sip_annual / 12)
  }
  
  // Approach 2: Original monthly approach
  const totalMonths = yearsToAccumulate * 12
  const r = monthlyReturnRate
  const g = Math.pow(1 + stepUp, 1/12) - 1
  
  let sip_monthly
  
  if (Math.abs(r - g) < 1e-10) {
    sip_monthly = remainingCorpus / (totalMonths * Math.pow(1 + r, totalMonths - 1))
  } else {
    const numerator = remainingCorpus * (r - g)
    const denominator = Math.pow(1 + r, totalMonths) - Math.pow(1 + g, totalMonths)
    sip_monthly = numerator / denominator
  }
  
  console.log('Approach 2 (Monthly):', sip_monthly)
  
  // Approach 3: Simple annuity with step-up factor
  const simple_annuity = remainingCorpus / ((Math.pow(1 + annualReturnRate, yearsToAccumulate) - 1) / annualReturnRate)
  const average_step_factor = (1 + Math.pow(1 + stepUp, yearsToAccumulate)) / 2
  const sip_simple = simple_annuity / (12 * average_step_factor)
  console.log('Approach 3 (Simple with avg step-up):', sip_simple)
  
  // Return the monthly approach for now
  return sip_monthly
}

function validateRetirementPlan(inputs, sip) {
  // Simulate accumulation
  const corpusAtRetirement = simulateAccumulation(inputs, sip)
  
  // Simulate withdrawal
  const finalCorpus = simulateWithdrawal(inputs, corpusAtRetirement)
  
  return {
    corpusAtRetirement,
    finalCorpusAt85: finalCorpus,
    valid: Math.abs(finalCorpus) < 1000
  }
}

function simulateAccumulation(inputs, sip) {
  const { currentAge, fireAge, currentCorpus, returnsEarning, stepUp } = inputs
  
  const yearsToAccumulate = fireAge - currentAge
  const monthlyReturnRate = Math.pow(1 + returnsEarning, 1/12) - 1
  const monthlyStepUpRate = Math.pow(1 + stepUp, 1/12) - 1
  
  let corpus = currentCorpus
  let monthlySip = sip
  
  for (let month = 1; month <= yearsToAccumulate * 12; month++) {
    corpus = corpus * (1 + monthlyReturnRate)
    corpus += monthlySip
    monthlySip = monthlySip * (1 + monthlyStepUpRate)
  }
  
  return corpus
}

function simulateWithdrawal(inputs, startingCorpus) {
  const { fireAge, surviveUntil, monthlyExpense, returnsRetirement, inflation, currentAge } = inputs
  
  const yearsToRetirement = fireAge - currentAge
  const yearsInRetirement = surviveUntil - fireAge
  const monthlyReturnRate = Math.pow(1 + returnsRetirement, 1/12) - 1
  const monthlyInflationRate = Math.pow(1 + inflation, 1/12) - 1
  
  const startingExpense = monthlyExpense * Math.pow(1 + inflation, yearsToRetirement)
  
  let corpus = startingCorpus
  let monthlyExpenseAmount = startingExpense
  
  for (let month = 1; month <= yearsInRetirement * 12; month++) {
    corpus = corpus * (1 + monthlyReturnRate)
    corpus -= monthlyExpenseAmount
    monthlyExpenseAmount = monthlyExpenseAmount * (1 + monthlyInflationRate)
    
    if (corpus < 0) {
      console.log(`Corpus went negative at month ${month} of retirement`)
      break
    }
  }
  
  return corpus
}

// Test if expected SIP actually works
function testExpectedSip() {
  const testInputs = {
    currentAge: 31,
    fireAge: 60,
    currentCorpus: 0,
    monthlyExpense: 100000,
    surviveUntil: 85,
    returnsEarning: 0.12,
    returnsRetirement: 0.07,
    inflation: 0.05,
    stepUp: 0.05
  }
  
  const expectedSip = 21731.54623
  
  console.log('\n🔍 Testing Expected SIP:', expectedSip)
  
  // See what corpus this generates
  const corpusGenerated = simulateAccumulation(testInputs, expectedSip)
  console.log('Corpus generated by expected SIP:', corpusGenerated.toLocaleString())
  
  // See if this corpus depletes to zero
  const finalCorpus = simulateWithdrawal(testInputs, corpusGenerated)
  console.log('Final corpus after withdrawal:', finalCorpus.toFixed(2))
  
  // Compare with required corpus
  const requiredCorpus = calculateRequiredCorpusAtRetirement(testInputs)
  console.log('Required corpus:', requiredCorpus.toLocaleString())
  console.log('Difference:', (corpusGenerated - requiredCorpus).toLocaleString())
  
  return {
    expectedSip,
    corpusGenerated,
    requiredCorpus,
    difference: corpusGenerated - requiredCorpus,
    finalCorpus
  }
}

// Run the test
console.log('🧪 Running Retirement Calculation Test...')
const result = calculateRetirementTest()
console.log('\n=== SUMMARY ===')
console.log('Test passed:', result.matches ? 'YES ✅' : 'NO ❌')
console.log('SIP matches expected value:', result.matches)
console.log('Final corpus near zero:', result.validation.valid)

const expectedTest = testExpectedSip()
console.log('\n=== Expected SIP Test ===')
console.log('Expected SIP generates required corpus:', Math.abs(expectedTest.difference) < 1000 ? 'YES' : 'NO')
console.log('Final corpus near zero with expected SIP:', Math.abs(expectedTest.finalCorpus) < 1000 ? 'YES' : 'NO')

// Test Case 2
function testCase2() {
  console.log('\n\n=== TEST CASE 2 ===')
  const testInputs = {
    currentAge: 32,
    fireAge: 45,
    currentCorpus: 0,
    monthlyExpense: 100000,
    surviveUntil: 85,
    returnsEarning: 0.096, // 9.6% (60% equity at 12%, 40% debt at 6%)
    returnsRetirement: 0.072, // 7.2% (20% equity at 12%, 80% debt at 6%)
    inflation: 0.05, // 5%
    stepUp: 0.05 // 5%
  }
  
  console.log('Test Inputs:', testInputs)
  
  // Calculate required corpus
  const corpusRequired = calculateRequiredCorpusAtRetirement(testInputs)
  console.log('Required corpus:', corpusRequired.toLocaleString())
  
  // Calculate SIP
  const sip = calculateSipForCorpus(
    corpusRequired,
    testInputs.currentAge,
    testInputs.fireAge,
    testInputs.currentCorpus,
    testInputs.returnsEarning,
    testInputs.stepUp
  )
  
  console.log('Calculated SIP: ₹', sip.toFixed(7))
  console.log('Expected SIP: ₹130,074.0246')
  console.log('Match:', Math.abs(sip - 130074.0246) < 10 ? 'YES' : 'NO')
  
  // Validate
  const validation = validateRetirementPlan(testInputs, sip)
  console.log('Final corpus at 85:', validation.finalCorpusAt85.toFixed(2))
  console.log('Valid (near zero):', validation.valid)
  
  return { sip, expected: 130074.0246, matches: Math.abs(sip - 130074.0246) < 10 }
}

const test2Result = testCase2()