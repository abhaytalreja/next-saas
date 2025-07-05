/**
 * This file will be auto-generated from your Supabase database schema
 * Run: npm run generate:types
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          email_verified_at: string | null
          name: string | null
          avatar_url: string | null
          timezone: string
          locale: string
          metadata: Json
          last_seen_at: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          email: string
          email_verified_at?: string | null
          name?: string | null
          avatar_url?: string | null
          timezone?: string
          locale?: string
          metadata?: Json
          last_seen_at?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          email_verified_at?: string | null
          name?: string | null
          avatar_url?: string | null
          timezone?: string
          locale?: string
          metadata?: Json
          last_seen_at?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          domain: string | null
          logo_url: string | null
          settings: Json
          metadata: Json
          subscription_status: string
          subscription_ends_at: string | null
          trial_ends_at: string | null
          is_active: boolean
          created_by: string
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          domain?: string | null
          logo_url?: string | null
          settings?: Json
          metadata?: Json
          subscription_status?: string
          subscription_ends_at?: string | null
          trial_ends_at?: string | null
          is_active?: boolean
          created_by: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          domain?: string | null
          logo_url?: string | null
          settings?: Json
          metadata?: Json
          subscription_status?: string
          subscription_ends_at?: string | null
          trial_ends_at?: string | null
          is_active?: boolean
          created_by?: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      memberships: {
        Row: {
          id: string
          user_id: string
          organization_id: string
          role: string
          permissions: Json
          invited_at: string | null
          invited_by: string | null
          accepted_at: string | null
          rejected_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          organization_id: string
          role?: string
          permissions?: Json
          invited_at?: string | null
          invited_by?: string | null
          accepted_at?: string | null
          rejected_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string
          role?: string
          permissions?: Json
          invited_at?: string | null
          invited_by?: string | null
          accepted_at?: string | null
          rejected_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          organization_id: string
          name: string
          slug: string
          description: string | null
          type: string
          settings: Json
          metadata: Json
          is_archived: boolean
          created_by: string
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          slug: string
          description?: string | null
          type?: string
          settings?: Json
          metadata?: Json
          is_archived?: boolean
          created_by: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          slug?: string
          description?: string | null
          type?: string
          settings?: Json
          metadata?: Json
          is_archived?: boolean
          created_by?: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}