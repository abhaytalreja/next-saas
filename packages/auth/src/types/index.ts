import { z } from 'zod'

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  image: z.string().optional(),
  role: z.enum(['USER', 'ADMIN']).default('USER'),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type User = z.infer<typeof UserSchema>

export const SessionSchema = z.object({
  user: UserSchema,
  expires: z.string(),
})

export type Session = z.infer<typeof SessionSchema>