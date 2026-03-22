-- Run this in Supabase Dashboard → SQL Editor if thesis uploads fail
-- (e.g. when migrations weren't applied)

-- Create bucket (ignore if already exists)
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('thesis_payloads', 'thesis_payloads', true);
EXCEPTION WHEN unique_violation THEN NULL;
END $$;

-- Allow students to upload to their folder
DROP POLICY IF EXISTS "Students upload thesis to own folder" ON storage.objects;
CREATE POLICY "Students upload thesis to own folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'thesis_payloads'
  AND (storage.foldername(name))[1] IN (
    SELECT s.id::text FROM public.students s WHERE s.user_id = auth.uid()
  )
);

-- Allow students + staff to read
DROP POLICY IF EXISTS "Students read own thesis files" ON storage.objects;
CREATE POLICY "Students read own thesis files"
ON storage.objects FOR SELECT TO authenticated
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
