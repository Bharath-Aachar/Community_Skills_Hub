-- ==============================================================================
-- Community Skills Hub — Public Organizer Profile Visibility Migration (Final)
-- Stage 3, Task 2 Architecture
-- ==============================================================================

-- 1. Clean up any previous draft policies or functions from earlier revisions
DROP POLICY IF EXISTS "Public can view names of published event organizers" ON public.profiles;
DROP POLICY IF EXISTS "Anon can view names of published event organizers" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated can view names of published event organizers" ON public.profiles;
DROP FUNCTION IF EXISTS public.is_published_organizer(UUID);

-- 2. Strict Privilege Hygiene on public.profiles
-- Explicitly revoke any previous column-level SELECT grants on public.profiles from anon and PUBLIC
REVOKE SELECT (id, full_name) ON public.profiles FROM anon;
REVOKE SELECT (id, full_name) ON public.profiles FROM PUBLIC;

-- Explicitly revoke all table-level privileges on public.profiles from PUBLIC and anon
REVOKE ALL ON public.profiles FROM PUBLIC;
REVOKE ALL ON public.profiles FROM anon;

-- Preserve authenticated user privileges (gated by "Users can read own profile" RLS policy)
GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE (full_name) ON public.profiles TO authenticated;

-- Ensure service_role retains full access for server-side administration
GRANT ALL ON public.profiles TO service_role;

-- 3. Partial Index for Blazing-Fast Published Organizer Lookups
CREATE INDEX IF NOT EXISTS idx_events_published_organizer
  ON public.events (organizer_id)
  WHERE status = 'published';

-- 4. Dedicated Public Organizer View (Security Definer View)
--
-- Security Design:
-- - Columns: Exposes STRICTLY (id, full_name). Internal roles, timestamps, email,
--   and other private account fields are completely omitted from the view projection.
-- - Filter: Includes ONLY users currently possessing the 'organizer' or 'admin' role in
--   profiles.roles AND who have at least one event with status = 'published'.
-- - Role Revocation: If an organizer's role is revoked (e.g. demoted to participant),
--   their record immediately vanishes from this view.
-- - Unpublishing: If all events of an organizer are unpublished or deleted, their record
--   immediately vanishes from this view.
-- - Participants: Standard participants never have published events and lack the organizer role,
--   ensuring 100% privacy for participant profiles.
-- - Security Configuration: Uses WITH (security_invoker = false) and ALTER VIEW OWNER TO postgres.
--   The view query evaluates under postgres ownership, completely avoiding RLS recursion loops
--   and eliminating any need to broaden direct table grants on public.profiles for anon.
CREATE OR REPLACE VIEW public.public_organizers
WITH (security_invoker = false)
AS
SELECT
  p.id,
  p.full_name
FROM public.profiles p
WHERE ('organizer' = ANY(p.roles) OR 'admin' = ANY(p.roles))
  AND EXISTS (
    SELECT 1
    FROM public.events e
    WHERE e.organizer_id = p.id
      AND e.status = 'published'
  );

-- Ensure view is owned by postgres
ALTER VIEW public.public_organizers OWNER TO postgres;

-- 5. View Grants
-- Restrict default PUBLIC access; grant SELECT strictly to anon, authenticated, and service_role.
REVOKE ALL ON public.public_organizers FROM PUBLIC;
GRANT SELECT ON public.public_organizers TO anon, authenticated, service_role;
