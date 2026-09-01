/*
  # Pin the name resolution path on every routine in the public schema

  1. Problem
     None of the functions in `public` set `search_path`. Several of them are
     SECURITY DEFINER, so an unqualified name inside their bodies could in
     principle be resolved to an object planted in an earlier schema and then
     executed with the function owner's rights.

  2. Changes
     - Sets `search_path = public, pg_temp` on every function in the `public`
       schema that does not already have it configured.

  3. Security
     - Closes the `function_search_path_mutable` advisory for all affected
       routines. Behaviour is unchanged: these functions already resolve their
       objects in `public`.
*/

DO $$
DECLARE
  f record;
BEGIN
  FOR f IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prokind = 'f'
      AND (p.proconfig IS NULL OR NOT EXISTS (
            SELECT 1 FROM unnest(p.proconfig) c WHERE c LIKE 'search_path=%'))
  LOOP
    EXECUTE format('ALTER FUNCTION %s SET search_path = public, pg_temp', f.sig);
  END LOOP;
END $$;
