import { z } from 'zod'

export const emailSchema = z.string().email('Invalid email address')
export const phoneSchema = z.string().regex(/^\+?[\d\s()-]{10,}$/, 'Invalid phone number')
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters')
export const requiredString = z.string().min(1, 'This field is required')
export const positiveNumber = z.number().positive('Must be a positive number')

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export const signupCompanySchema = z.object({
  full_name: requiredString,
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  business_name: requiredString,
  business_type: requiredString,
})

export const signupClientSchema = z.object({
  full_name: requiredString,
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
})

export const createJobSchema = z.object({
  address_id: z.string().uuid(),
  service_type_id: z.string().uuid(),
  assigned_worker_id: z.string().uuid().optional(),
  scheduled_date: z.string(),
  scheduled_time: z.string().optional(),
  price: positiveNumber,
})

export const createClientSchema = z.object({
  full_name: requiredString,
  email: emailSchema,
  phone: phoneSchema.optional(),
})

export const createAddressSchema = z.object({
  street: requiredString,
  unit: z.string().optional(),
  city: requiredString,
  state: requiredString,
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
})

export const createServiceTypeSchema = z.object({
  name: requiredString,
  default_price: positiveNumber,
  estimated_duration_minutes: z.number().int().positive().optional(),
  checklist_items: z.array(z.string()).optional(),
})

export const feedbackSchema = z.object({
  type: z.enum(['bug', 'feature_request', 'general']),
  description: requiredString,
})

export function validateEmail(email: string): boolean {
  return emailSchema.safeParse(email).success
}

export function validatePhone(phone: string): boolean {
  return phoneSchema.safeParse(phone).success
}

export function validatePassword(password: string): boolean {
  return passwordSchema.safeParse(password).success
}
