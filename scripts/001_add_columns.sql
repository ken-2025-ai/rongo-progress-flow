-- ==========================================
-- SYSTEM ADMIN PORTAL - SCHEMA FIXES (PART 1)
-- Add missing columns safely to existing tables
-- ==========================================

-- Users table additions
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_examiner BOOLEAN DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Schools table additions
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS code TEXT;
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Departments table additions
ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS code TEXT;
ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Programmes table additions
ALTER TABLE public.programmes ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'MASTERS';
ALTER TABLE public.programmes ADD COLUMN IF NOT EXISTS duration_years INTEGER DEFAULT 2;
ALTER TABLE public.programmes ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.programmes ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.programmes ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.programmes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Students table additions
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS co_supervisor_id UUID REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS intake_year TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Thesis submissions additions
ALTER TABLE public.thesis_submissions ADD COLUMN IF NOT EXISTS file_name TEXT;
ALTER TABLE public.thesis_submissions ADD COLUMN IF NOT EXISTS file_size INTEGER;
ALTER TABLE public.thesis_submissions ADD COLUMN IF NOT EXISTS submission_type TEXT DEFAULT 'DRAFT';

-- Corrections additions
ALTER TABLE public.corrections ADD COLUMN IF NOT EXISTS resolved_by UUID REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.corrections ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;

-- Progress reports additions
ALTER TABLE public.progress_reports ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.progress_reports ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE public.progress_reports ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Seminar bookings additions
ALTER TABLE public.seminar_bookings ADD COLUMN IF NOT EXISTS venue TEXT;

-- Evaluations additions
ALTER TABLE public.evaluations ADD COLUMN IF NOT EXISTS file_url TEXT;

-- Examiner assignments additions
ALTER TABLE public.examiner_assignments ADD COLUMN IF NOT EXISTS report_file_url TEXT;
