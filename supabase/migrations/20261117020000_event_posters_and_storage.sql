-- ==============================================================================
-- Community Skills Hub — Event Posters Storage & Schema Migration
-- Stage 3: Event Poster Upload & Storage Access Controls
-- ==============================================================================

-- 1. Add image_path column to public.events if it does not exist
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS image_path TEXT;

-- 2. Create or configure event-posters storage bucket in storage.buckets
-- Bucket is public for CDN read access, enforces 5 MB file size limit and allowed MIME types.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-posters',
  'event-posters',
  true,
  5242880, -- 5 MB in bytes (5 * 1024 * 1024)
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- 3. Ensure storage.objects has Row-Level Security enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Ensure table-level permissions are granted to standard Supabase roles
GRANT ALL ON TABLE storage.objects TO authenticated;
GRANT SELECT ON TABLE storage.objects TO anon;

-- 4. Storage RLS Policies for event-posters bucket

-- Policy 1: Public SELECT (Any anonymous or authenticated visitor can view posters)
DROP POLICY IF EXISTS "Public Read Access for Event Posters" ON storage.objects;
DROP POLICY IF EXISTS "Public Event Poster Read Access" ON storage.objects;
CREATE POLICY "Public Read Access for Event Posters"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'event-posters');

-- Policy 2: INSERT (Organizers and Admins can upload posters to their own folder)
-- Folder structure is organized by organizer ID: <organizer_id>/<filename>
DROP POLICY IF EXISTS "Organizers and Admins Can Upload Event Posters" ON storage.objects;
DROP POLICY IF EXISTS "Organizers can upload event posters" ON storage.objects;
CREATE POLICY "Organizers and Admins Can Upload Event Posters"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'event-posters'
    AND (
      public.is_admin()
      OR (
        public.is_organizer_or_admin()
        AND (
          (storage.foldername(name))[1] = (SELECT auth.uid())::text
          OR split_part(name, '/', 1) = (SELECT auth.uid())::text
        )
      )
    )
  );

-- Policy 3: UPDATE (Organizers and Admins can update/overwrite their own posters)
DROP POLICY IF EXISTS "Organizers and Admins Can Update Event Posters" ON storage.objects;
DROP POLICY IF EXISTS "Organizers can update own event posters" ON storage.objects;
CREATE POLICY "Organizers and Admins Can Update Event Posters"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'event-posters'
    AND (
      public.is_admin()
      OR (
        public.is_organizer_or_admin()
        AND (
          (storage.foldername(name))[1] = (SELECT auth.uid())::text
          OR split_part(name, '/', 1) = (SELECT auth.uid())::text
        )
      )
    )
  )
  WITH CHECK (
    bucket_id = 'event-posters'
    AND (
      public.is_admin()
      OR (
        public.is_organizer_or_admin()
        AND (
          (storage.foldername(name))[1] = (SELECT auth.uid())::text
          OR split_part(name, '/', 1) = (SELECT auth.uid())::text
        )
      )
    )
  );

-- Policy 4: DELETE (Organizers and Admins can delete their own posters)
DROP POLICY IF EXISTS "Organizers and Admins Can Delete Event Posters" ON storage.objects;
DROP POLICY IF EXISTS "Organizers can delete own event posters" ON storage.objects;
CREATE POLICY "Organizers and Admins Can Delete Event Posters"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'event-posters'
    AND (
      public.is_admin()
      OR (
        public.is_organizer_or_admin()
        AND (
          (storage.foldername(name))[1] = (SELECT auth.uid())::text
          OR split_part(name, '/', 1) = (SELECT auth.uid())::text
        )
      )
    )
  );
