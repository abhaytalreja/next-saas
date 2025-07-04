import { z } from 'zod'

// User schemas
export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  image: z.string().url().optional(),
})

export const updateUserSchema = createUserSchema.partial()

// Organization schemas
export const createOrganizationSchema = z.object({
  name: z.string().min(1).max(50),
  slug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/),
  image: z.string().url().optional(),
})

export const updateOrganizationSchema = createOrganizationSchema.partial()

// Member schemas
export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']),
})

export const updateMemberRoleSchema = z.object({
  role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']),
})

// Type exports
export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>