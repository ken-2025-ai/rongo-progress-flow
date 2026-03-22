-- ============================================================
-- THESIS SUBMISSION STORAGE
-- Creates thesis_payloads bucket and RLS for student uploads
-- Run this migration AFTER schema.sql (requires students table)
-- ============================================================

-- 1. Create thesis_payloads bucket (public = true so getPublicUrl works for downloads)
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('thesis_payloads', 'thesis_payloads', true);
EXCEPTION
  WHEN unique_violation THEN NULL;
  WHEN undefined_table THEN NULL;
END $$;

-- 2. Storage RLS: Students can upload to their own folder (student_id/path)
DROP POLICY IF EXISTS "Students upload thesis to own folder" ON storage.objects;
CREATE POLICY "Students upload thesis to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'thesis_payloads'
  AND (storage.foldername(name))[1] IN (
    SELECT s.id::text FROM public.students s WHERE s.user_id = auth.uid()
  )
);

-- 3. Storage RLS: Students can read their own files; staff can read all (for reviews)
DROP POLICY IF EXISTS "Students read own thesis files" ON storage.objects;
CREATE POLICY "Students read own thesis files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'thesis_payloads'
  AND (
    (storage.foldername(name))[1] IN (
      SELECT s.id::text FROM public.students s WHERE s.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
      AND u.role IN ('SUPERVISOR', 'DEPT_COORDINATOR', 'SCHOOL_COORDINATOR', 'PG_DEAN', 'EXAMINER', 'SUPER_ADMIN')
    )
  )
);
