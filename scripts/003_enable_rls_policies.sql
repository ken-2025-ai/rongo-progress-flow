-- ==========================================
-- SYSTEM ADMIN PORTAL - SCHEMA FIXES (PART 3)
-- Enable RLS and set up policies
-- ==========================================

-- ENSURE RLS IS ENABLED
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seminar_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thesis_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.examiner_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_stage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_activity_log ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ POLICIES FOR REFERENCE DATA
DROP POLICY IF EXISTS "Public view schools" ON public.schools;
CREATE POLICY "Public view schools" ON public.schools FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public view departments" ON public.departments;
CREATE POLICY "Public view departments" ON public.departments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public view programmes" ON public.programmes;
CREATE POLICY "Public view programmes" ON public.programmes FOR SELECT USING (true);

-- Users can view staff profiles for lookups
DROP POLICY IF EXISTS "Authenticated view staff" ON public.users;
CREATE POLICY "Authenticated view staff" ON public.users
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND role IN ('SUPERVISOR', 'DEPT_COORDINATOR', 'SCHOOL_COORDINATOR', 'PG_DEAN', 'EXAMINER', 'SUPER_ADMIN')
  );

-- Users can view their own profile
DROP POLICY IF EXISTS "Users view self" ON public.users;
CREATE POLICY "Users view self" ON public.users FOR SELECT USING (auth.uid() = id);

-- STUDENT-SPECIFIC POLICIES
DROP POLICY IF EXISTS "Students view own profile" ON public.students;
CREATE POLICY "Students view own profile" ON public.students
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Supervisors view mentees" ON public.students;
CREATE POLICY "Supervisors view mentees" ON public.students
  FOR SELECT USING (supervisor_id = auth.uid() OR co_supervisor_id = auth.uid());
