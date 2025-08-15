import { z } from 'zod'
import { Decimal } from 'decimal.js'

const DecimalSchema = z
  .union([z.string(), z.number(), z.instanceof(Decimal)])
  .transform((val) => new Decimal(val.toString()))

const AssetPresetSchema = z.enum(['AllIn', 'Grow', 'Regular', 'Safe', 'Custom'])

const ReturnAssumptionsSchema = z.object({
  equityAnnual: z.number().min(0).max(1),
  debtAnnual: z.number().min(0).max(1),
})

const StepUpSchema = z.object({
  annualRate: z.number().min(0).max(1),
})

const ProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  age: z.number().int().min(18).max(100),
  savings: DecimalSchema,
  stepUp: StepUpSchema,
  assumptions: ReturnAssumptionsSchema,
})

const AllocationSchema = z.object({
  goalId: z.string(),
  lumpsum: DecimalSchema,
})

const GoalBaseSchema = z.object({
  id: z.string(),
  type: z.enum(['retirement', 'education', 'vacation', 'purchase', 'custom']),
  title: z.string().min(1),
  inflation: z.number().min(0).max(1),
  accumulationStartAge: z.number().int().min(18),
  accumulationStopAge: z.number().int().min(18),
  duringPreset: AssetPresetSchema,
  postPreset: AssetPresetSchema.optional(),
  customEquityDuring: z.number().min(0).max(100).optional(),
  customEquityPost: z.number().min(0).max(100).optional(),
}).refine((data) => data.accumulationStopAge >= data.accumulationStartAge, {
  message: "Stop age must be greater than or equal to start age",
  path: ["accumulationStopAge"],
})

const RetirementGoalSchema = GoalBaseSchema.extend({
  type: z.literal('retirement'),
  monthlySpendToday: DecimalSchema,
  retireAge: z.number().int().min(18),
  planTillAge: z.number().int().min(18),
}).refine((data) => data.planTillAge > data.retireAge, {
  message: "Plan till age must be greater than retire age",
  path: ["planTillAge"],
})

const EducationGoalSchema = GoalBaseSchema.extend({
  type: z.literal('education'),
  startInYears: z.number().int().min(0),
  durationYears: z.number().int().min(1),
  costPerYearToday: DecimalSchema,
})

const VacationGoalSchema = GoalBaseSchema.extend({
  type: z.literal('vacation'),
  firstHolidayAge: z.number().int().min(18),
  lastHolidayAge: z.number().int().min(18),
  spendPerYearToday: DecimalSchema,
}).refine((data) => data.lastHolidayAge >= data.firstHolidayAge, {
  message: "Last holiday age must be greater than or equal to first holiday age",
  path: ["lastHolidayAge"],
})

const PurchaseGoalSchema = GoalBaseSchema.extend({
  type: z.literal('purchase'),
  purchaseAge: z.number().int().min(18),
  itemCostToday: DecimalSchema,
})

const CustomGoalSchema = GoalBaseSchema.extend({
  type: z.literal('custom'),
  description: z.string(),
  targetAmount: DecimalSchema,
  targetAge: z.number().int().min(18),
})

const GoalSchema = z.discriminatedUnion('type', [
  RetirementGoalSchema,
  EducationGoalSchema,
  VacationGoalSchema,
  PurchaseGoalSchema,
  CustomGoalSchema,
])

const PlanSchema = z.object({
  profile: ProfileSchema,
  goals: z.array(GoalSchema),
  allocations: z.array(AllocationSchema),
}).refine((data) => {
  const totalAllocated = data.allocations.reduce(
    (sum, alloc) => sum.plus(alloc.lumpsum),
    new Decimal(0)
  )
  return totalAllocated.lte(data.profile.savings)
}, {
  message: "Total allocations cannot exceed available savings",
  path: ["allocations"],
})

export {
  DecimalSchema,
  AssetPresetSchema,
  ProfileSchema,
  AllocationSchema,
  GoalSchema,
  RetirementGoalSchema,
  EducationGoalSchema,
  VacationGoalSchema,
  PurchaseGoalSchema,
  CustomGoalSchema,
  PlanSchema,
}