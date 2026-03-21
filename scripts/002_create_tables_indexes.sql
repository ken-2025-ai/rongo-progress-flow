-- ==========================================
-- SYSTEM ADMIN PORTAL - SCHEMA FIXES (PART 2)
-- Create missing tables and indexes
-- ==========================================

-- SYSTEM ACTIVITY LOG (if missing)
CREATE TABLE IF NOT EXISTS public.system_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL, 
  entity_id UUID NOT NULL,
  metadata JSONB, 
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- CREATE INDEXES FOR PERFORMANCE
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_department ON public.users(department_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_students_supervisor ON public.students(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_students_programme ON public.students(programme_id);
CREATE INDEX IF NOT EXISTS idx_students_stage ON public.students(current_stage);
CREATE INDEX IF NOT EXISTS idx_students_user ON public.students(user_id);
CREATE INDEX IF NOT EXISTS idx_departments_school ON public.departments(school_id);
CREATE INDEX IF NOT EXISTS idx_programmes_department ON public.programmes(department_id);
CREATE INDEX IF NOT EXISTS idx_progress_reports_student ON public.progress_reports(student_id);
CREATE INDEX IF NOT EXISTS idx_seminar_bookings_student ON public.seminar_bookings(student_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_student ON public.evaluations(student_id);
CREATE INDEX IF NOT EXISTS idx_thesis_submissions_student ON public.thesis_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_examiner_assignments_student ON public.examiner_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_examiner_assignments_examiner ON public.examiner_assignments(examiner_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON public.system_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON public.system_activity_log(entity_type, entity_id);
