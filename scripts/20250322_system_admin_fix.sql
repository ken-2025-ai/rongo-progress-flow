-- ==========================================
-- SYSTEM ADMIN PORTAL - SCHEMA FIXES
-- Safe migration that adds missing columns and ensures all required tables exist
-- ==========================================

-- ==========================================
-- 1. ADD MISSING COLUMNS SAFELY
-- ==========================================

-- Users table additions
ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS is_examiner BOOLEAN DEFAULT FALSE;
ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Schools table additions
ALTER TABLE IF EXISTS public.schools ADD COLUMN IF NOT EXISTS code TEXT;
ALTER TABLE IF EXISTS public.schools ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE IF EXISTS public.schools ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE IF EXISTS public.schools ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Departments table additions
ALTER TABLE IF EXISTS public.departments ADD COLUMN IF NOT EXISTS code TEXT;
ALTER TABLE IF EXISTS public.departments ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE IF EXISTS public.departments ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE IF EXISTS public.departments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Programmes table additions
ALTER TABLE IF EXISTS public.programmes ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'MASTERS';
ALTER TABLE IF EXISTS public.programmes ADD COLUMN IF NOT EXISTS duration_years INTEGER DEFAULT 2;
ALTER TABLE IF EXISTS public.programmes ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE IF EXISTS public.programmes ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE IF EXISTS public.programmes ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE IF EXISTS public.programmes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Students table additions
ALTER TABLE IF EXISTS public.students ADD COLUMN IF NOT EXISTS co_supervisor_id UUID REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS public.students ADD COLUMN IF NOT EXISTS intake_year TEXT;
ALTER TABLE IF EXISTS public.students ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE IF EXISTS public.students ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Thesis submissions additions
ALTER TABLE IF EXISTS public.thesis_submissions ADD COLUMN IF NOT EXISTS file_name TEXT;
ALTER TABLE IF EXISTS public.thesis_submissions ADD COLUMN IF NOT EXISTS file_size INTEGER;
ALTER TABLE IF EXISTS public.thesis_submissions ADD COLUMN IF NOT EXISTS submission_type TEXT DEFAULT 'DRAFT';

-- Corrections additions
ALTER TABLE IF EXISTS public.corrections ADD COLUMN IF NOT EXISTS resolved_by UUID REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS public.corrections ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;

-- Progress reports additions
ALTER TABLE IF EXISTS public.progress_reports ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS public.progress_reports ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE IF EXISTS public.progress_reports ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Seminar bookings additions
ALTER TABLE IF EXISTS public.seminar_bookings ADD COLUMN IF NOT EXISTS venue TEXT;

-- Evaluations additions
ALTER TABLE IF EXISTS public.evaluations ADD COLUMN IF NOT EXISTS file_url TEXT;

-- Examiner assignments additions
ALTER TABLE IF EXISTS public.examiner_assignments ADD COLUMN IF NOT EXISTS report_file_url TEXT;

-- ==========================================
-- 2. CREATE MISSING TABLES
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
-- 3. CREATE INDEXES FOR PERFORMANCE
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

-- ==========================================
-- 4. ENSURE RLS IS ENABLED
-- ==========================================
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.programmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.progress_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.seminar_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.thesis_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.examiner_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.student_stage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.system_activity_log ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 5. CREATE/UPDATE RLS POLICIES - SUPER ADMIN BYPASS
-- ==========================================

-- Drop existing super admin policies
DROP POLICY IF EXISTS "Super Admin Bypass users" ON public.users;
DROP POLICY IF EXISTS "Super Admin Bypass schools" ON public.schools;
DROP POLICY IF EXISTS "Super Admin Bypass departments" ON public.departments;
DROP POLICY IF EXISTS "Super Admin Bypass programmes" ON public.programmes;
DROP POLICY IF EXISTS "Super Admin Bypass students" ON public.students;
DROP POLICY IF EXISTS "Super Admin Bypass progress_reports" ON public.progress_reports;
DROP POLICY IF EXISTS "Super Admin Bypass seminar_bookings" ON public.seminar_bookings;
DROP POLICY IF EXISTS "Super Admin Bypass thesis_submissions" ON public.thesis_submissions;
DROP POLICY IF EXISTS "Super Admin Bypass corrections" ON public.corrections;
DROP POLICY IF EXISTS "Super Admin Bypass evaluations" ON public.evaluations;
DROP POLICY IF EXISTS "Super Admin Bypass examiner_assignments" ON public.examiner_assignments;
DROP POLICY IF EXISTS "Super Admin Bypass student_stage_history" ON public.student_stage_history;
DROP POLICY IF EXISTS "Super Admin Bypass system_activity_log" ON public.system_activity_log;

-- Create new super admin bypass policies
CREATE POLICY "Super Admin Bypass users" ON public.users
  FOR ALL USING (EXISTS (SELECT 1 FROM public.users su WHERE su.id = auth.uid() AND su.role = 'SUPER_ADMIN'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users su WHERE su.id = auth.uid() AND su.role = 'SUPER_ADMIN'));

CREATE POLICY "Super Admin Bypass schools" ON public.schools
  FOR ALL USING (EXISTS (SELECT 1 FROM public.users su WHERE su.id = auth.uid() AND su.role = 'SUPER_ADMIN'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users su WHERE su.id = auth.uid() AND su.role = 'SUPER_ADMIN'));

CREATE POLICY "Super Admin Bypass departments" ON public.departments
  FOR ALL USING (EXISTS (SELECT 1 FROM public.users su WHERE su.id = auth.uid() AND su.role = 'SUPER_ADMIN'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users su WHERE su.id = auth.uid() AND su.role = 'SUPER_ADMIN'));

CREATE POLICY "Super Admin Bypass programmes" ON public.programmes
  FOR ALL USING (EXISTS (SELECT 1 FROM public.users su WHERE su.id = auth.uid() AND su.role = 'SUPER_ADMIN'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users su WHERE su.id = auth.uid() AND su.role = 'SUPER_ADMIN'));

CREATE POLICY "Super Admin Bypass students" ON public.students
  FOR ALL USING (EXISTS (SELECT 1 FROM public.users su WHERE su.id = auth.uid() AND su.role = 'SUPER_ADMIN'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users su WHERE su.id = auth.uid() AND su.role = 'SUPER_ADMIN'));

CREATE POLICY "Super Admin Bypass progress_reports" ON public.progress_reports
  FOR ALL USING (EXISTS (SELECT 1 FROM public.users su WHERE su.id = auth.uid() AND su.role = 'SUPER_ADMIN'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users su WHERE su.id = auth.uid() AND su.role = 'SUPER_ADMIN'));

CREATE POLICY "Super Admin Bypass seminar_bookings" ON public.seminar_bookings
  FOR ALL USING (EXISTS (SELECT 1 FROM public.users su WHERE su.id = auth.uid() AND su.role = 'SUPER_ADMIN'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users su WHERE su.id = auth.uid() AND su.role = 'SUPER_ADMIN'));

CREATE POLICY "Super Admin Bypass thesis_submissions" ON public.thesis_submissions
  FOR ALL USING (EXISTS (SELECT 1 FROM public.users su WHERE su.id = auth.uid() AND su.role = 'SUPER_ADMIN'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users su WHERE su.id = auth.uid() AND su.role = 'SUPER_ADMIN'));

CREATE POLICY "Super Admin Bypass corrections" ON public.corrections
  FOR ALL USING (EXISTS (SELECT 1 FROM public.users su WHERE su.id = auth.uid() AND su.role = 'SUPER_ADMIN'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users su WHERE su.id = auth.uid() AND su.role = 'SUPER_ADMIN'));

CREATE POLICY "Super Admin Bypass evaluations" ON public.evaluations
  FOR ALL USING (EXISTS (SELECT 1 FROM public.users su WHERE su.id = auth.uid() AND su.role = 'SUPER_ADMIN'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users su WHERE su.id = auth.uid() AND su.role = 'SUPER_ADMIN'));

CREATE POLICY "Super Admin Bypass examiner_assignments" ON public.examiner_assignments
  FOR ALL USING (EXISTS (SELECT 1 FROM public.users su WHERE su.id = auth.uid() AND su.role = 'SUPER_ADMIN'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users su WHERE su.id = auth.uid() AND su.role = 'SUPER_ADMIN'));

CREATE POLICY "Super Admin Bypass student_stage_history" ON public.student_stage_history
  FOR ALL USING (EXISTS (SELECT 1 FROM public.users su WHERE su.id = auth.uid() AND su.role = 'SUPER_ADMIN'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users su WHERE su.id = auth.uid() AND su.role = 'SUPER_ADMIN'));

CREATE POLICY "Super Admin Bypass system_activity_log" ON public.system_activity_log
  FOR ALL USING (EXISTS (SELECT 1 FROM public.users su WHERE su.id = auth.uid() AND su.role = 'SUPER_ADMIN'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users su WHERE su.id = auth.uid() AND su.role = 'SUPER_ADMIN'));

-- ==========================================
-- 6. PUBLIC READ POLICIES FOR REFERENCE DATA
-- ==========================================
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

-- ==========================================
-- 7. STUDENT-SPECIFIC POLICIES
-- ==========================================
DROP POLICY IF EXISTS "Students view own profile" ON public.students;
CREATE POLICY "Students view own profile" ON public.students
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Supervisors view mentees" ON public.students;
CREATE POLICY "Supervisors view mentees" ON public.students
  FOR SELECT USING (supervisor_id = auth.uid() OR co_supervisor_id = auth.uid());

-- ==========================================
-- MIGRATION COMPLETE
-- ==========================================
