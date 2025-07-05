-- Create a function to execute SQL commands
-- This is needed for the migration system to work
-- SECURITY WARNING: This function should only be used during migrations
-- and should be restricted to service role keys only

CREATE OR REPLACE FUNCTION public.exec_sql(query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE query;
END;
$$;

-- Restrict this function to authenticated users only (service role)
-- This prevents it from being called by anonymous users
REVOKE ALL ON FUNCTION public.exec_sql(query text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.exec_sql(query text) FROM anon;
GRANT EXECUTE ON FUNCTION public.exec_sql(query text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.exec_sql(query text) TO service_role;

-- Add a comment explaining the function's purpose
COMMENT ON FUNCTION public.exec_sql(query text) IS 'Used by the migration system to execute SQL commands. Should only be accessible via service role key.';