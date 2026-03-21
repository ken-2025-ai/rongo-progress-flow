-- ==========================================
-- SYSTEM ADMIN PORTAL - SAFE MIGRATIONS
-- Simplified column additions for existing tables
-- ==========================================

-- Step 1: Add missing columns to users table (if not exists)
DO $$ BEGIN
  ALTER TABLE public.users ADD COLUMN phone TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.users ADD COLUMN is_examiner BOOLEAN DEFAULT FALSE;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.users ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Step 2: Add missing columns to schools table
DO $$ BEGIN
  ALTER TABLE public.schools ADD COLUMN code TEXT UNIQUE;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.schools ADD COLUMN description TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.schools ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.schools ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Step 3: Add missing columns to departments table
DO $$ BEGIN
  ALTER TABLE public.departments ADD COLUMN code TEXT UNIQUE;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.departments ADD COLUMN description TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.departments ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.departments ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Step 4: Add missing columns to programmes table
DO $$ BEGIN
  ALTER TABLE public.programmes ADD COLUMN level TEXT DEFAULT 'MASTERS';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.programmes ADD COLUMN duration_years INTEGER DEFAULT 2;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.programmes ADD COLUMN description TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.programmes ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.programmes ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.programmes ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Step 5: Add missing columns to students table
DO $$ BEGIN
  ALTER TABLE public.students ADD COLUMN co_supervisor_id UUID REFERENCES public.users(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.students ADD COLUMN intake_year TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.students ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.students ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Step 6: Add missing columns to thesis_submissions table
DO $$ BEGIN
  ALTER TABLE public.thesis_submissions ADD COLUMN file_name TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.thesis_submissions ADD COLUMN file_size INTEGER;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.thesis_submissions ADD COLUMN submission_type TEXT DEFAULT 'DRAFT';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Step 7: Add missing columns to corrections table
DO $$ BEGIN
  ALTER TABLE public.corrections ADD COLUMN resolved_by UUID REFERENCES public.users(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.corrections ADD COLUMN resolved_at TIMESTAMPTZ;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Step 8: Add missing columns to progress_reports table
DO $$ BEGIN
  ALTER TABLE public.progress_reports ADD COLUMN reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.progress_reports ADD COLUMN reviewed_at TIMESTAMPTZ;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.progress_reports ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Step 9: Add missing columns to seminar_bookings table
DO $$ BEGIN
  ALTER TABLE public.seminar_bookings ADD COLUMN venue TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Step 10: Add missing columns to evaluations table
DO $$ BEGIN
  ALTER TABLE public.evaluations ADD COLUMN file_url TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Step 11: Add missing columns to examiner_assignments table
DO $$ BEGIN
  ALTER TABLE public.examiner_assignments ADD COLUMN report_file_url TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- ==========================================
-- CREATE INDEXES FOR PERFORMANCE
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_schools_code ON public.schools(code);
CREATE INDEX IF NOT EXISTS idx_schools_is_active ON public.schools(is_active);
CREATE INDEX IF NOT EXISTS idx_departments_code ON public.departments(code);
CREATE INDEX IF NOT EXISTS idx_departments_school_id ON public.departments(school_id);
CREATE INDEX IF NOT EXISTS idx_departments_is_active ON public.departments(is_active);
CREATE INDEX IF NOT EXISTS idx_programmes_department_id ON public.programmes(department_id);
CREATE INDEX IF NOT EXISTS idx_programmes_level ON public.programmes(level);
CREATE INDEX IF NOT EXISTS idx_programmes_is_active ON public.programmes(is_active);
CREATE INDEX IF NOT EXISTS idx_students_user_id ON public.students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_programme_id ON public.students(programme_id);
CREATE INDEX IF NOT EXISTS idx_students_supervisor_id ON public.students(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_students_is_active ON public.students(is_active);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_department_id ON public.users(department_id);
CREATE INDEX IF NOT EXISTS idx_thesis_submissions_student_id ON public.thesis_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_progress_reports_student_id ON public.progress_reports(student_id);
CREATE INDEX IF NOT EXISTS idx_corrections_student_id ON public.corrections(student_id);

-- ==========================================
-- ENSURE RLS IS ENABLED (safe if already enabled)
-- ==========================================

ALTER TABLE IF EXISTS public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.programmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.thesis_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.progress_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.seminar_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.examiner_assignments ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- Add Super Admin RLS policies if missing
-- ==========================================

-- Allow super_admin to read all records
DROP POLICY IF EXISTS "super_admin_read_all" ON public.schools;
CREATE POLICY "super_admin_read_all" ON public.schools FOR SELECT 
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'SUPER_ADMIN');

DROP POLICY IF EXISTS "super_admin_write_all" ON public.schools;
CREATE POLICY "super_admin_write_all" ON public.schools FOR INSERT 
  WITH CHECK ((SELECT role FROM public.users WHERE id = auth.uid()) = 'SUPER_ADMIN');

DROP POLICY IF EXISTS "super_admin_update_all" ON public.schools;
CREATE POLICY "super_admin_update_all" ON public.schools FOR UPDATE 
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'SUPER_ADMIN');

DROP POLICY IF EXISTS "super_admin_delete_all" ON public.schools;
CREATE POLICY "super_admin_delete_all" ON public.schools FOR DELETE 
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'SUPER_ADMIN');
