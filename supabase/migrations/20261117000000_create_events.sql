-- ==============================================================================
-- Community Skills Hub — Events Schema & Access Control Migration (Final)
-- Stage 3, Task 1
-- ==============================================================================

-- 1. Helper Security Functions for Role Verification
-- Using SECURITY DEFINER and STABLE allows PostgreSQL to evaluate and cache
-- the user's role check efficiently during query execution while preventing RLS recursion.

CREATE OR REPLACE FUNCTION public.is_organizer_or_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND ('organizer' = ANY(roles) OR 'admin' = ANY(roles))
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND 'admin' = ANY(roles)
  );
$$;

-- Revoke default PUBLIC and anon execution privileges on helper functions
REVOKE EXECUTE ON FUNCTION public.is_organizer_or_admin() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;

-- Explicitly grant execution to authenticated and service_role
GRANT EXECUTE ON FUNCTION public.is_organizer_or_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;

-- 2. Create events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL,
  event_type TEXT NOT NULL,
  location TEXT,
  online_meeting_url TEXT,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  registration_type TEXT NOT NULL DEFAULT 'internal',
  registration_url TEXT,
  capacity INTEGER,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_event_title CHECK (char_length(trim(title)) >= 3),
  CONSTRAINT valid_event_category CHECK (char_length(trim(category)) >= 2),
  CONSTRAINT valid_event_dates CHECK (end_at > start_at),
  CONSTRAINT valid_event_type CHECK (event_type IN ('online', 'offline', 'hybrid')),
  CONSTRAINT valid_registration_type CHECK (registration_type IN ('internal', 'external')),
  CONSTRAINT valid_event_status CHECK (status IN ('draft', 'published', 'completed', 'cancelled')),
  CONSTRAINT valid_capacity CHECK (capacity IS NULL OR capacity > 0),
  CONSTRAINT valid_external_registration CHECK (
    registration_type = 'internal'
    OR (registration_type = 'external' AND registration_url IS NOT NULL AND trim(registration_url) <> '')
  )
);

-- 3. Discovery and Lookup Indexes
-- Primary discovery index for filtering upcoming published events
CREATE INDEX IF NOT EXISTS idx_events_discovery
  ON public.events (status, start_at ASC)
  WHERE status = 'published';

-- Organizer events lookup
CREATE INDEX IF NOT EXISTS idx_events_organizer
  ON public.events (organizer_id, created_at DESC);

-- Category filtering index
CREATE INDEX IF NOT EXISTS idx_events_category
  ON public.events (category, start_at ASC);

-- Event type filtering index
CREATE INDEX IF NOT EXISTS idx_events_type
  ON public.events (event_type);

-- 4. Triggers: updated_at and published_at automation
-- - On INSERT with status = 'published', sets published_at to now()
-- - On UPDATE transitioning from any other status to published, sets published_at to now()
-- - On UPDATE while remaining published, preserves OLD.published_at
-- - On every UPDATE, updates updated_at to now()
CREATE OR REPLACE FUNCTION public.handle_event_timestamps()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status = 'published' THEN
      NEW.published_at = now();
    ELSE
      NEW.published_at = NULL;
    END IF;

  ELSIF TG_OP = 'UPDATE' THEN
    NEW.updated_at = now();

    -- Transitioning from any other status to published
    IF NEW.status = 'published' AND OLD.status IS DISTINCT FROM 'published' THEN
      NEW.published_at = now();
    -- Remaining published: preserve original publication timestamp
    ELSIF NEW.status = 'published' AND OLD.status = 'published' THEN
      NEW.published_at = OLD.published_at;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_event_timestamps ON public.events;
CREATE TRIGGER on_event_timestamps
  BEFORE INSERT OR UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_event_timestamps();

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies

-- Policy 1: SELECT (Public Discovery of Published Events)
-- Applies to anon and authenticated users.
-- Evaluates without calling any helper functions, ensuring seamless discovery for unauthenticated visitors.
DROP POLICY IF EXISTS "Events are viewable by public if published or by owner" ON public.events;
DROP POLICY IF EXISTS "Anyone can view published events" ON public.events;
CREATE POLICY "Anyone can view published events"
  ON public.events
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

-- Policy 2: SELECT (Private / Draft Events for Organizers and Admins)
-- Applies strictly to authenticated users.
-- Admins can view all events across all statuses.
-- Active organizers can view their own private, draft, cancelled, or completed events.
DROP POLICY IF EXISTS "Organizers and admins can view private events" ON public.events;
CREATE POLICY "Organizers and admins can view private events"
  ON public.events
  FOR SELECT
  TO authenticated
  USING (
    public.is_admin()
    OR (
      organizer_id = auth.uid()
      AND public.is_organizer_or_admin()
    )
  );

-- Policy 3: INSERT (Active Organizers and Admins only)
-- Only users who currently hold the 'organizer' or 'admin' role in profiles.roles can create events.
-- The organizer_id must match auth.uid() unless created by an admin.
DROP POLICY IF EXISTS "Organizers and admins can create events" ON public.events;
CREATE POLICY "Organizers and admins can create events"
  ON public.events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_organizer_or_admin()
    AND (organizer_id = auth.uid() OR public.is_admin())
  );

-- Policy 4: UPDATE (Active Event Organizer and Admins only)
-- An organizer can update only their own events while they currently hold the organizer role.
-- Admins can update any event.
-- Organizers cannot reassign the event to another organizer.
DROP POLICY IF EXISTS "Organizers and admins can update events" ON public.events;
CREATE POLICY "Organizers and admins can update events"
  ON public.events
  FOR UPDATE
  TO authenticated
  USING (
    public.is_admin()
    OR (
      organizer_id = auth.uid()
      AND public.is_organizer_or_admin()
    )
  )
  WITH CHECK (
    public.is_admin()
    OR (
      organizer_id = auth.uid()
      AND public.is_organizer_or_admin()
    )
  );

-- Policy 5: DELETE (Active Event Organizer and Admins only)
-- An organizer can delete only their own events while they currently hold the organizer role.
-- An admin can delete any event.
-- Standard participants (or users whose organizer role has been revoked) cannot delete events.
DROP POLICY IF EXISTS "Organizers and admins can delete events" ON public.events;
CREATE POLICY "Organizers and admins can delete events"
  ON public.events
  FOR DELETE
  TO authenticated
  USING (
    public.is_admin()
    OR (
      organizer_id = auth.uid()
      AND public.is_organizer_or_admin()
    )
  );

-- 7. Permissions & Grants
REVOKE ALL ON public.events FROM anon;
REVOKE ALL ON public.events FROM authenticated;

-- Public can read (gated by RLS Policies 1 & 2)
GRANT SELECT ON public.events TO anon;
GRANT SELECT ON public.events TO authenticated;

-- Authenticated organizers/admins can mutate (gated by RLS Policies 3, 4, 5)
GRANT INSERT, UPDATE, DELETE ON public.events TO authenticated;

-- Service role retains full administrative access
GRANT ALL ON public.events TO service_role;
