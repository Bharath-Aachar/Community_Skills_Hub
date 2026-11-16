-- ==============================================================================
-- Community Skills Hub — Profiles and Role Architecture Migration (Final)
-- Stage 2, Task 2
-- ==============================================================================

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  roles TEXT[] NOT NULL DEFAULT ARRAY['participant']::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraint: roles array can only contain 'participant', 'organizer', or 'admin'
  CONSTRAINT valid_roles_elements CHECK (
    roles <@ ARRAY['participant', 'organizer', 'admin']::TEXT[]
    AND cardinality(roles) > 0
  )
);

-- Index for fast user role lookups
CREATE INDEX IF NOT EXISTS idx_profiles_roles ON public.profiles USING GIN (roles);

-- 2. Trigger to automatically update updated_at on profile changes
CREATE OR REPLACE FUNCTION public.handle_profile_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_updated_at ON public.profiles;
CREATE TRIGGER on_profile_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_profile_updated_at();

-- 3. Stricter Security Trigger: Protect the `roles` column
-- Multi-vector authorization check:
-- - Checks Supabase JWT claims (auth.jwt() ->> 'role')
-- - Checks PostgREST request context (current_setting('request.jwt.claim.role'))
-- - Checks original session initiator (session_user) rather than current_user,
--   ensuring that SECURITY DEFINER ownership does not unintentionally authorize changes.
-- Normal authenticated users or client requests can NEVER modify `roles`.
-- Only trusted server-side admin processes using the service-role key or direct
-- database administrator sessions (session_user) can modify `roles`.
CREATE OR REPLACE FUNCTION public.protect_profile_roles()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  jwt_role TEXT;
BEGIN
  -- If roles have not changed, allow update to proceed
  IF (OLD.roles IS NOT DISTINCT FROM NEW.roles) THEN
    RETURN NEW;
  END IF;

  -- Attempt to resolve the JWT role claim from the calling request context
  BEGIN
    jwt_role := COALESCE(
      auth.jwt() ->> 'role',
      current_setting('request.jwt.claim.role', true)
    );
  EXCEPTION WHEN OTHERS THEN
    jwt_role := NULL;
  END;

  -- Strictly verify whether the original caller is a trusted service_role request
  -- or a direct database administrator session (using session_user, not current_user)
  IF (
    jwt_role = 'service_role'
    OR session_user IN ('postgres', 'supabase_admin')
  ) THEN
    RETURN NEW;
  ELSE
    RAISE EXCEPTION 'Security Violation: Modifying the roles column requires server-side administrative authorization (service_role).'
      USING ERRCODE = '42501';
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_role_update ON public.profiles;
CREATE TRIGGER on_profile_role_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_roles();

-- 4. Auth Hook Trigger: Automatically create profile upon user registration in auth.users
-- Strictly assigns ARRAY['participant']::TEXT[].
-- Ignores any client-supplied role parameters in user metadata.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    roles,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''), ''),
    ARRAY['participant']::TEXT[], -- Enforce participant role exclusively for public registrations
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = EXCLUDED.full_name,
    updated_at = now();
    -- Note: roles is deliberately omitted from ON CONFLICT UPDATE to prevent role escalation.
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
-- Policy 1: Authenticated users can view their own profile
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy 2: Authenticated users can update their own permitted profile data
-- Uses auth.uid() = id for USING and WITH CHECK to prevent recursive queries.
-- Protection of the roles column is enforced by column-level grants and the on_profile_role_update trigger.
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 7. Column-Level Grants (Defense-in-Depth)
-- Revoke all direct permissions from public / anon
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.profiles FROM authenticated;

-- Grant authenticated users SELECT on the table
GRANT SELECT ON public.profiles TO authenticated;

-- Grant authenticated users UPDATE ONLY on full_name.
-- (updated_at is updated by the database trigger, and roles cannot be modified by users)
GRANT UPDATE (full_name) ON public.profiles TO authenticated;

-- Grant full table access to service_role for server-side admin management
GRANT ALL ON public.profiles TO service_role;
