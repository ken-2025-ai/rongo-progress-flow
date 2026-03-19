-- ==========================================
-- 1. ENUMS (Strict Type Safety)
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
      'DEPT_SEMINAR_PENDING', 'DEPT_SEMINAR_COMPLETED',
      'SCHOOL_SEMINAR_PENDING', 'SCHOOL_SEMINAR_COMPLETED',
      'THESIS_READINESS_CHECK', 'PG_EXAMINATION', 
      'VIVA_SCHEDULED', 'CORRECTIONS', 'COMPLETED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE status_code_type AS ENUM (
      'PENDING_SUPERVISOR', 'PENDING_DEPT', 'APPROVED', 'RETURNED', 'REJECTED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE evaluation_type_enum AS ENUM (
      'DEPT_SEMINAR', 'SCHOOL_SEMINAR', 'VIVA'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE recommendation_enum AS ENUM (
      'PASS', 'MINOR_CORRECTIONS', 'MAJOR_CORRECTIONS', 'REPEAT_SEMINAR', 'FAIL'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


-- ==========================================
-- 2. CORE AUTH & ACADEMIC ENTITIES
-- ==========================================

-- USERS TABLE (The Identity Authority)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role role_type NOT NULL DEFAULT 'STUDENT',
  staff_id TEXT UNIQUE, -- For academic staff identifiers
  department_id UUID, -- Reference to department for staff
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SCHOOLS TABLE
CREATE TABLE IF NOT EXISTS public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link users to departments for non-students
ALTER TABLE public.users ADD CONSTRAINT fk_user_dept FOREIGN KEY (department_id) REFERENCES public.departments(id);

-- PROGRAMMES TABLE
CREATE TABLE IF NOT EXISTS public.programmes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL
);


-- ==========================================
-- 3. STUDENT PROFILE & WORKFLOW STATE
-- ==========================================

-- STUDENTS TABLE
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  registration_number TEXT UNIQUE NOT NULL,
  programme_id UUID NOT NULL REFERENCES public.programmes(id),
  supervisor_id UUID REFERENCES public.users(id),
  research_title TEXT,
  current_stage stage_code_type DEFAULT 'DEPT_SEMINAR_PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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


-- ==========================================
-- 4. DOCUMENTS & SUBMISSIONS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.thesis_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  file_checksum TEXT,
  submitted_by UUID REFERENCES public.users(id),
  locked_for_exam BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  category evaluation_type_enum NOT NULL,
  description TEXT NOT NULL,
  urgency TEXT, 
  created_by UUID REFERENCES public.users(id),
  status status_code_type DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.progress_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  quarter TEXT NOT NULL,
  year TEXT NOT NULL,
  synopsis TEXT,
  file_url TEXT NOT NULL,
  status status_code_type DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- ==========================================
-- 5. SEMINARS & EXAMINATIONS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.seminar_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  seminar_level evaluation_type_enum NOT NULL, 
  requested_date DATE NOT NULL,
  approved_date DATE,
  status status_code_type DEFAULT 'PENDING',
  approved_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  examiner_id UUID REFERENCES public.users(id),
  evaluation_type evaluation_type_enum NOT NULL,
  score NUMERIC(5,2),
  recommendation recommendation_enum NOT NULL,
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ==========================================
-- 6. SYSTEM AUDIT
-- ==========================================

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
-- 7. POWER AUTOMATION (TRIGGERS)
-- ==========================================

-- Profile sync trigger: Automatically create public profile on auth signup
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
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ==========================================
-- 8. SEED DATA (CORE STRUCTURE)
-- ==========================================

INSERT INTO public.schools (name) 
VALUES ('INFOCOMS')
ON CONFLICT (name) DO NOTHING;

-- Map IDs for departments (Seed Logic)
DO $$
DECLARE
    school_id UUID;
    ihrs_id UUID;
    cmj_id UUID;
BEGIN
    SELECT id INTO school_id FROM public.schools WHERE name = 'INFOCOMS' LIMIT 1;
    
    INSERT INTO public.departments (school_id, name) VALUES (school_id, 'IHRS') ON CONFLICT DO NOTHING;
    INSERT INTO public.departments (school_id, name) VALUES (school_id, 'CMJ') ON CONFLICT DO NOTHING;

    SELECT id INTO ihrs_id FROM public.departments WHERE name = 'IHRS' LIMIT 1;
    SELECT id INTO cmj_id FROM public.departments WHERE name = 'CMJ' LIMIT 1;

    -- Seed Programmes for IHRS
    INSERT INTO public.programmes (department_id, name, code) VALUES (ihrs_id, 'MSc. Human Resource Management', 'MSc.HRM') ON CONFLICT DO NOTHING;
    INSERT INTO public.programmes (department_id, name, code) VALUES (ihrs_id, 'PhD. Human Resource Management', 'PhD.HRM') ON CONFLICT DO NOTHING;
    
    -- Seed Programmes for CMJ
    INSERT INTO public.programmes (department_id, name, code) VALUES (cmj_id, 'MSc. Communication Studies', 'MSc.CS') ON CONFLICT DO NOTHING;
    INSERT INTO public.programmes (department_id, name, code) VALUES (cmj_id, 'PhD. Communication Studies', 'PhD.CS') ON CONFLICT DO NOTHING;
    INSERT INTO public.programmes (department_id, name, code) VALUES (cmj_id, 'MA. Journalism', 'MA.J') ON CONFLICT DO NOTHING;
END $$;


-- ==========================================
-- 9. SECURITY (RLS)
-- ==========================================

-- Robust RLS Matrix
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seminar_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thesis_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

-- 1. GLOBAL SUPER ADMIN BYPASS
CREATE POLICY "Super Admin Bypass Users" ON public.users FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'SUPER_ADMIN'));
CREATE POLICY "Super Admin Bypass Schools" ON public.schools FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'SUPER_ADMIN'));
CREATE POLICY "Super Admin Bypass Departments" ON public.departments FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'SUPER_ADMIN'));
CREATE POLICY "Super Admin Bypass Students" ON public.students FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'SUPER_ADMIN'));
CREATE POLICY "Super Admin Bypass Reports" ON public.progress_reports FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'SUPER_ADMIN'));
CREATE POLICY "Super Admin Bypass Bookings" ON public.seminar_bookings FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'SUPER_ADMIN'));
CREATE POLICY "Super Admin Bypass Thesis" ON public.thesis_submissions FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'SUPER_ADMIN'));

-- 2. USER/STUDENT POLICIES
CREATE POLICY "Users view self" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Students view own profile" ON public.students FOR SELECT USING (auth.uid() = user_id);

-- 3. PROGRESS REPORTS POLICIES
CREATE POLICY "Students insert own reports" ON public.progress_reports FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.students WHERE user_id = auth.uid() AND id = student_id)
);

CREATE POLICY "Students view own reports" ON public.progress_reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.students WHERE user_id = auth.uid() AND id = student_id)
);

CREATE POLICY "Supervisors view mentee reports" ON public.progress_reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.students WHERE supervisor_id = auth.uid() AND id = student_id)
);

CREATE POLICY "Supervisors update mentee reports" ON public.progress_reports FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.students WHERE supervisor_id = auth.uid() AND id = student_id)
);

CREATE POLICY "Coordinators view department reports" ON public.progress_reports FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    JOIN public.students s ON s.id = student_id
    JOIN public.programmes p ON p.id = s.programme_id
    WHERE u.id = auth.uid() 
    AND u.role IN ('DEPT_COORDINATOR', 'SCHOOL_COORDINATOR')
    AND u.department_id = p.department_id
  )
);

CREATE POLICY "Coordinators update department reports" ON public.progress_reports FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.users u 
    JOIN public.students s ON s.id = student_id
    JOIN public.programmes p ON p.id = s.programme_id
    WHERE u.id = auth.uid() 
    AND u.role IN ('DEPT_COORDINATOR', 'SCHOOL_COORDINATOR')
    AND u.department_id = p.department_id
  )
);

-- 4. SEMINAR BOOKINGS POLICIES
CREATE POLICY "Students manage own bookings" ON public.seminar_bookings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.students WHERE user_id = auth.uid() AND id = student_id)
);
CREATE POLICY "Coordinators handle bookings" ON public.seminar_bookings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('DEPT_COORDINATOR', 'SCHOOL_COORDINATOR'))
);

-- 5. THESIS SUBMISSIONS POLICIES
CREATE POLICY "Students upload thesis" ON public.thesis_submissions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.students WHERE user_id = auth.uid() AND id = student_id)
);
CREATE POLICY "Academic staff view thesis" ON public.thesis_submissions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('SUPERVISOR', 'DEPT_COORDINATOR', 'PG_DEAN', 'EXAMINER'))
);

-- 6. PUBLIC ENTITIES
CREATE POLICY "Public view schools" ON public.schools FOR SELECT USING (true);
CREATE POLICY "Public view depts" ON public.departments FOR SELECT USING (true);
CREATE POLICY "Public view programmes" ON public.programmes FOR SELECT USING (true);
