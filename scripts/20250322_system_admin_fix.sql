-- ==========================================
-- SYSTEM ADMIN FIX MIGRATION
-- Ensures all required tables exist with proper structure
-- ==========================================

-- ==========================================
-- 1. ENUMS (Safe Creation with Existence Check)
-- ==========================================
DO $$ BEGIN
    CREATE TYPE role_type AS ENUM (
      'STUDENT', 'SUPERVISOR', 'DEPT_COORDINATOR', 'SCHOOL_COORDINATOR', 'PG_DEAN', 'EXAMINER', 'SUPER_ADMIN'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE stage_code_type AS ENUM (
      'DEPT_SEMINAR_PENDING', 'DEPT_SEMINAR_BOOKED', 'DEPT_SEMINAR_COMPLETED',
      'SCHOOL_SEMINAR_PENDING', 'SCHOOL_SEMINAR_BOOKED', 'SCHOOL_SEMINAR_COMPLETED',
      'THESIS_READINESS_CHECK', 'PG_EXAMINATION', 
      'VIVA_SCHEDULED', 'CORRECTIONS', 'COMPLETED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE status_code_type AS ENUM (
      'PENDING', 'PENDING_SUPERVISOR', 'PENDING_DEPT',
      'APPROVED', 'COMPLETED', 'RETURNED', 'REJECTED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE evaluation_type_enum AS ENUM (
      'DEPT_SEMINAR', 'SCHOOL_SEMINAR', 'VIVA',
      'THESIS_REVIEW', 'SEMINAR_II', 'PG_EXAMINATION'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE recommendation_enum AS ENUM (
      'PENDING', 'PASS', 'MINOR_CORRECTIONS', 'MAJOR_CORRECTIONS', 'REPEAT_SEMINAR', 'FAIL'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add missing enum values safely
DO $$ BEGIN ALTER TYPE stage_code_type ADD VALUE 'DEPT_SEMINAR_BOOKED'; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TYPE stage_code_type ADD VALUE 'SCHOOL_SEMINAR_BOOKED'; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TYPE stage_code_type ADD VALUE 'AWAITING_EXAMINER_REPORT'; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TYPE recommendation_enum ADD VALUE 'VIVA_REQUIRED'; EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN ALTER TYPE recommendation_enum ADD VALUE 'REPEAT_VIVA'; EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ==========================================
-- 2. CORE TABLES
-- ==========================================

-- SCHOOLS TABLE
CREATE TABLE IF NOT EXISTS public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  code TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint for department names within a school
CREATE UNIQUE INDEX IF NOT EXISTS uq_departments_school_name ON public.departments (school_id, name);

-- USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  role role_type NOT NULL DEFAULT 'STUDENT',
  staff_id TEXT UNIQUE,
  department_id UUID REFERENCES public.departments(id),
  is_active BOOLEAN DEFAULT TRUE,
  is_examiner BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROGRAMMES TABLE
CREATE TABLE IF NOT EXISTS public.programmes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  level TEXT DEFAULT 'MASTERS', -- MASTERS, PHD
  duration_years INTEGER DEFAULT 2,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STUDENTS TABLE
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  registration_number TEXT UNIQUE NOT NULL,
  programme_id UUID NOT NULL REFERENCES public.programmes(id),
  supervisor_id UUID REFERENCES public.users(id),
  co_supervisor_id UUID REFERENCES public.users(id),
  research_title TEXT,
  current_stage stage_code_type DEFAULT 'DEPT_SEMINAR_PENDING',
  intake_year TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns safely
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_examiner BOOLEAN DEFAULT FALSE;
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS code TEXT;
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS code TEXT;
ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.programmes ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'MASTERS';
ALTER TABLE public.programmes ADD COLUMN IF NOT EXISTS duration_years INTEGER DEFAULT 2;
ALTER TABLE public.programmes ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.programmes ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.programmes ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.programmes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS co_supervisor_id UUID REFERENCES public.users(id);
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS intake_year TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- ==========================================
-- 3. WORKFLOW TABLES
-- ==========================================

-- STUDENT STAGE HISTORY
CREATE TABLE IF NOT EXISTS public.student_stage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  stage_code stage_code_type NOT NULL,
  status_code status_code_type NOT NULL,
  changed_by UUID REFERENCES public.users(id), 
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- THESIS SUBMISSIONS
CREATE TABLE IF NOT EXISTS public.thesis_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_size INTEGER,
  file_checksum TEXT,
  submitted_by UUID REFERENCES public.users(id),
  locked_for_exam BOOLEAN DEFAULT FALSE,
  submission_type TEXT DEFAULT 'DRAFT',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.thesis_submissions ADD COLUMN IF NOT EXISTS file_name TEXT;
ALTER TABLE public.thesis_submissions ADD COLUMN IF NOT EXISTS file_size INTEGER;
ALTER TABLE public.thesis_submissions ADD COLUMN IF NOT EXISTS submission_type TEXT DEFAULT 'DRAFT';

-- CORRECTIONS
CREATE TABLE IF NOT EXISTS public.corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  category evaluation_type_enum NOT NULL,
  description TEXT NOT NULL,
  urgency TEXT DEFAULT 'NORMAL',
  created_by UUID REFERENCES public.users(id),
  resolved_by UUID REFERENCES public.users(id),
  resolved_at TIMESTAMPTZ,
  status status_code_type DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.corrections ADD COLUMN IF NOT EXISTS resolved_by UUID REFERENCES public.users(id);
ALTER TABLE public.corrections ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;

-- PROGRESS REPORTS
CREATE TABLE IF NOT EXISTS public.progress_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  quarter TEXT NOT NULL,
  year TEXT NOT NULL,
  synopsis TEXT,
  notes TEXT,
  file_url TEXT NOT NULL,
  reviewed_by UUID REFERENCES public.users(id),
  reviewed_at TIMESTAMPTZ,
  status status_code_type DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.progress_reports ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES public.users(id);
ALTER TABLE public.progress_reports ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- SEMINAR BOOKINGS
CREATE TABLE IF NOT EXISTS public.seminar_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  seminar_level evaluation_type_enum NOT NULL, 
  requested_date DATE NOT NULL,
  approved_date DATE,
  venue TEXT,
  status status_code_type DEFAULT 'PENDING',
  approved_by UUID REFERENCES public.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.seminar_bookings ADD COLUMN IF NOT EXISTS venue TEXT;

-- EVALUATIONS
CREATE TABLE IF NOT EXISTS public.evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  evaluator_id UUID REFERENCES public.users(id),
  evaluation_type evaluation_type_enum NOT NULL,
  score NUMERIC(5,2),
  recommendation recommendation_enum NOT NULL DEFAULT 'PENDING',
  comments TEXT,
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.evaluations ADD COLUMN IF NOT EXISTS file_url TEXT;

-- EXAMINER ASSIGNMENTS
CREATE TABLE IF NOT EXISTS public.examiner_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  examiner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  examiner_type TEXT NOT NULL CHECK (examiner_type IN ('INTERNAL', 'EXTERNAL')),
  assigned_by UUID REFERENCES public.users(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  report_submitted_at TIMESTAMPTZ,
  report_file_url TEXT,
  UNIQUE (student_id, examiner_id)
);

ALTER TABLE public.examiner_assignments ADD COLUMN IF NOT EXISTS report_file_url TEXT;

CREATE INDEX IF NOT EXISTS idx_examiner_assignments_student ON public.examiner_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_examiner_assignments_examiner ON public.examiner_assignments(examiner_id);

-- SYSTEM ACTIVITY LOG
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
-- 4. PROFILE SYNC TRIGGER
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name, role)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'first_name', 
    new.raw_user_meta_data->>'last_name',
    CASE 
      WHEN new.email = 'kenkendagor3@gmail.com' THEN 'SUPER_ADMIN'::role_type
      ELSE 'STUDENT'::role_type
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = COALESCE(EXCLUDED.first_name, public.users.first_name),
    last_name = COALESCE(EXCLUDED.last_name, public.users.last_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==========================================
-- 5. ENABLE RLS ON ALL TABLES
-- ==========================================
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

-- ==========================================
-- 6. RLS POLICIES - SUPER ADMIN BYPASS
-- ==========================================
DO $$ 
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY['users', 'schools', 'departments', 'programmes', 'students', 'progress_reports', 'seminar_bookings', 'thesis_submissions', 'corrections', 'evaluations', 'examiner_assignments', 'student_stage_history', 'system_activity_log'])
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Super Admin Bypass %s" ON public.%s', tbl, tbl);
    EXECUTE format('
      CREATE POLICY "Super Admin Bypass %s" ON public.%s
      FOR ALL
      USING (EXISTS (SELECT 1 FROM public.users su WHERE su.id = auth.uid() AND su.role = ''SUPER_ADMIN''))
      WITH CHECK (EXISTS (SELECT 1 FROM public.users su WHERE su.id = auth.uid() AND su.role = ''SUPER_ADMIN''))
    ', tbl, tbl);
  END LOOP;
END $$;

-- ==========================================
-- 7. PUBLIC READ POLICIES FOR REFERENCE DATA
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
-- 8. STUDENT-SPECIFIC POLICIES
-- ==========================================
DROP POLICY IF EXISTS "Students view own profile" ON public.students;
CREATE POLICY "Students view own profile" ON public.students
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Supervisors view mentees" ON public.students;
CREATE POLICY "Supervisors view mentees" ON public.students
  FOR SELECT USING (supervisor_id = auth.uid() OR co_supervisor_id = auth.uid());

-- ==========================================
-- 9. HELPER INDEXES FOR PERFORMANCE
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_department ON public.users(department_id);
CREATE INDEX IF NOT EXISTS idx_students_supervisor ON public.students(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_students_programme ON public.students(programme_id);
CREATE INDEX IF NOT EXISTS idx_students_stage ON public.students(current_stage);
CREATE INDEX IF NOT EXISTS idx_departments_school ON public.departments(school_id);
CREATE INDEX IF NOT EXISTS idx_programmes_department ON public.programmes(department_id);
CREATE INDEX IF NOT EXISTS idx_progress_reports_student ON public.progress_reports(student_id);
CREATE INDEX IF NOT EXISTS idx_seminar_bookings_student ON public.seminar_bookings(student_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_student ON public.evaluations(student_id);
CREATE INDEX IF NOT EXISTS idx_thesis_submissions_student ON public.thesis_submissions(student_id);

-- ==========================================
-- MIGRATION COMPLETE
-- ==========================================
