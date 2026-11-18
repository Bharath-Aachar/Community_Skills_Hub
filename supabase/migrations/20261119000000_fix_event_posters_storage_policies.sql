-- ==============================================================================
-- Community Skills Hub — Fix Event Poster Storage Policies (Scalar Subquery Form)
-- Stage 3: Event Poster Upload Access Control Fix
-- ==============================================================================

-- 1. INSERT Policy (Organizers and Admins can upload posters to their own folder)
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

-- 2. UPDATE Policy (Organizers and Admins can update/overwrite their own posters)
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

-- 3. DELETE Policy (Organizers and Admins can delete their own posters)
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
