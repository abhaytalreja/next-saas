-- Temporarily disable the activity trigger to test project creation
-- Migration: 010_temporary_disable_activity_trigger
-- Date: 2025-01-12

-- Drop the trigger temporarily
DROP TRIGGER IF EXISTS activity_projects ON projects;

-- We can re-enable it later once we confirm the function works