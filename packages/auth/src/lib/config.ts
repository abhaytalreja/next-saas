import { NextAuthOptions } from 'next-auth'
import { z } from 'zod'

const envSchema = z.object({
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
})

export const env = envSchema.parse(process.env)

export function createAuthConfig(): NextAuthOptions {
  return {
    secret: env.NEXTAUTH_SECRET,
    providers: [
      // Add providers here based on environment variables
    ],
    callbacks: {
      session: async ({ session, token }) => {
        if (session?.user && token?.sub) {
          session.user.id = token.sub
        }
        return session
      },
      jwt: async ({ user, token }) => {
        if (user) {
          token.uid = user.id
        }
        return token
      },
    },
    session: {
      strategy: 'jwt',
    },
    pages: {
      signIn: '/auth/signin',
      signOut: '/auth/signout',
      error: '/auth/error',
    },
  }
}