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
      'DEPT_SEMINAR_PENDING', 'DEPT_SEMINAR_BOOKED', 'DEPT_SEMINAR_COMPLETED',
      'SCHOOL_SEMINAR_PENDING', 'SCHOOL_SEMINAR_BOOKED', 'SCHOOL_SEMINAR_COMPLETED',
      'THESIS_READINESS_CHECK', 'PG_EXAMINATION', 
      'VIVA_SCHEDULED', 'CORRECTIONS', 'COMPLETED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Backfill enum values for existing deployments
DO $$ BEGIN
  ALTER TYPE stage_code_type ADD VALUE 'DEPT_SEMINAR_BOOKED';
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
  ALTER TYPE stage_code_type ADD VALUE 'SCHOOL_SEMINAR_BOOKED';
EXCEPTION WHEN duplicate_object THEN null;
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
  ALTER TYPE status_code_type ADD VALUE 'PENDING';
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
  ALTER TYPE status_code_type ADD VALUE 'COMPLETED';
EXCEPTION WHEN duplicate_object THEN null;
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
  ALTER TYPE evaluation_type_enum ADD VALUE 'THESIS_REVIEW';
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
  ALTER TYPE evaluation_type_enum ADD VALUE 'SEMINAR_II';
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
  ALTER TYPE evaluation_type_enum ADD VALUE 'PG_EXAMINATION';
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE recommendation_enum AS ENUM (
      'PENDING', 'PASS', 'MINOR_CORRECTIONS', 'MAJOR_CORRECTIONS', 'REPEAT_SEMINAR', 'FAIL'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TYPE recommendation_enum ADD VALUE 'PENDING';
EXCEPTION WHEN duplicate_object THEN null;
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

-- Needed for seed INSERT ... ON CONFLICT DO NOTHING
CREATE UNIQUE INDEX IF NOT EXISTS uq_departments_school_name
  ON public.departments (school_id, name);

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
  notes TEXT,
  file_url TEXT NOT NULL,
  status status_code_type DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.progress_reports
  ADD COLUMN IF NOT EXISTS notes TEXT;


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
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.seminar_bookings
  ADD COLUMN IF NOT EXISTS notes TEXT;

CREATE TABLE IF NOT EXISTS public.evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  evaluator_id UUID REFERENCES public.users(id),
  evaluation_type evaluation_type_enum NOT NULL,
  score NUMERIC(5,2),
  recommendation recommendation_enum NOT NULL,
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compatibility: older DBs used examiner_id; frontend expects evaluator_id.
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'evaluations'
      AND column_name = 'examiner_id'
  ) THEN
    EXECUTE 'ALTER TABLE public.evaluations RENAME COLUMN examiner_id TO evaluator_id';
  END IF;
EXCEPTION WHEN undefined_column THEN null;
END $$;


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

-- Seed all Schools
INSERT INTO public.schools (name) VALUES ('INFOCOMS') ON CONFLICT (name) DO NOTHING;
INSERT INTO public.schools (name) VALUES ('SAES')     ON CONFLICT (name) DO NOTHING;
INSERT INTO public.schools (name) VALUES ('SASSB')    ON CONFLICT (name) DO NOTHING;
INSERT INTO public.schools (name) VALUES ('Education') ON CONFLICT (name) DO NOTHING;

-- Seed INFOCOMS departments and programmes
DO $$
DECLARE
    infocoms_id UUID;
    ihrs_id     UUID;
    cmj_id      UUID;
BEGIN
    SELECT id INTO infocoms_id FROM public.schools WHERE name = 'INFOCOMS' LIMIT 1;

    -- Departments under INFOCOMS
    INSERT INTO public.departments (school_id, name) VALUES (infocoms_id, 'IHRS') ON CONFLICT DO NOTHING;
    INSERT INTO public.departments (school_id, name) VALUES (infocoms_id, 'CMJ')  ON CONFLICT DO NOTHING;

    SELECT id INTO ihrs_id FROM public.departments WHERE name = 'IHRS' LIMIT 1;
    SELECT id INTO cmj_id  FROM public.departments WHERE name = 'CMJ'  LIMIT 1;

    -- IHRS Programmes
    INSERT INTO public.programmes (department_id, name, code)
      VALUES (ihrs_id, 'MSc. IT Specialization',   'MSc.ITS')  ON CONFLICT DO NOTHING;
    INSERT INTO public.programmes (department_id, name, code)
      VALUES (ihrs_id, 'PhD. IT Specialization',   'PhD.ITS')  ON CONFLICT DO NOTHING;
    INSERT INTO public.programmes (department_id, name, code)
      VALUES (ihrs_id, 'MSc. Health Informatics',  'MSc.HI')   ON CONFLICT DO NOTHING;
    INSERT INTO public.programmes (department_id, name, code)
      VALUES (ihrs_id, 'PhD. Health Informatics',  'PhD.HI')   ON CONFLICT DO NOTHING;

    -- CMJ Programmes
    INSERT INTO public.programmes (department_id, name, code)
      VALUES (cmj_id, 'MSc. Photography',  'MSc.PHO') ON CONFLICT DO NOTHING;
    INSERT INTO public.programmes (department_id, name, code)
      VALUES (cmj_id, 'PhD. Photography',  'PhD.PHO') ON CONFLICT DO NOTHING;
    INSERT INTO public.programmes (department_id, name, code)
      VALUES (cmj_id, 'MA. Journalism',    'MA.J')    ON CONFLICT DO NOTHING;
    INSERT INTO public.programmes (department_id, name, code)
      VALUES (cmj_id, 'PhD. Journalism',   'PhD.J')   ON CONFLICT DO NOTHING;
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
ALTER TABLE public.student_stage_history ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- 9.1 Super Admin bypass (covers USING + WITH CHECK)
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Super Admin Bypass Users" ON public.users;
CREATE POLICY "Super Admin Bypass Users" ON public.users
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users su WHERE su.id = auth.uid() AND su.role = 'SUPER_ADMIN'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users su WHERE su.id = auth.uid() AND su.role = 'SUPER_ADMIN'));

DROP POLICY IF EXISTS "Super Admin Bypass Schools" ON public.schools;
CREATE POLICY "Super Admin Bypass Schools" ON public.schools
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users su WHERE su.id = auth.uid() AND su.role = 'SUPER_ADMIN'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users su WHERE su.id = auth.uid() AND su.role = 'SUPER_ADMIN'));

DROP POLICY IF EXISTS "Super Admin Bypass Departments" ON public.departments;
CREATE POLICY "Super Admin Bypass Departments" ON public.departments
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users su WHERE su.id = auth.uid() AND su.role = 'SUPER_ADMIN'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users su WHERE su.id = auth.uid() AND su.role = 'SUPER_ADMIN'));

DROP POLICY IF EXISTS "Super Admin Bypass Students" ON public.students;
CREATE POLICY "Super Admin Bypass Students" ON public.students
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users su WHERE su.id = auth.uid() AND su.role = 'SUPER_ADMIN'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users su WHERE su.id = auth.uid() AND su.role = 'SUPER_ADMIN'));

DROP POLICY IF EXISTS "Super Admin Bypass Reports" ON public.progress_reports;
CREATE POLICY "Super Admin Bypass Reports" ON public.progress_reports
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users su WHERE su.id = auth.uid() AND su.role = 'SUPER_ADMIN'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users su WHERE su.id = auth.uid() AND su.role = 'SUPER_ADMIN'));

DROP POLICY IF EXISTS "Super Admin Bypass Bookings" ON public.seminar_bookings;
CREATE POLICY "Super Admin Bypass Bookings" ON public.seminar_bookings
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users su WHERE su.id = auth.uid() AND su.role = 'SUPER_ADMIN'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users su WHERE su.id = auth.uid() AND su.role = 'SUPER_ADMIN'));

DROP POLICY IF EXISTS "Super Admin Bypass Thesis" ON public.thesis_submissions;
CREATE POLICY "Super Admin Bypass Thesis" ON public.thesis_submissions
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users su WHERE su.id = auth.uid() AND su.role = 'SUPER_ADMIN'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users su WHERE su.id = auth.uid() AND su.role = 'SUPER_ADMIN'));

DROP POLICY IF EXISTS "Super Admin Bypass Corrections" ON public.corrections;
CREATE POLICY "Super Admin Bypass Corrections" ON public.corrections
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users su WHERE su.id = auth.uid() AND su.role = 'SUPER_ADMIN'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users su WHERE su.id = auth.uid() AND su.role = 'SUPER_ADMIN'));

DROP POLICY IF EXISTS "Super Admin Bypass Evaluations" ON public.evaluations;
CREATE POLICY "Super Admin Bypass Evaluations" ON public.evaluations
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users su WHERE su.id = auth.uid() AND su.role = 'SUPER_ADMIN'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users su WHERE su.id = auth.uid() AND su.role = 'SUPER_ADMIN'));

DROP POLICY IF EXISTS "Super Admin Bypass Stage History" ON public.student_stage_history;
CREATE POLICY "Super Admin Bypass Stage History" ON public.student_stage_history
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users su WHERE su.id = auth.uid() AND su.role = 'SUPER_ADMIN'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users su WHERE su.id = auth.uid() AND su.role = 'SUPER_ADMIN'));

-- ------------------------------------------------------------
-- 9.2 users (names used in joins)
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Users view self" ON public.users;
CREATE POLICY "Users view self" ON public.users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users view staff profiles" ON public.users;
CREATE POLICY "Users view staff profiles" ON public.users
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND
    role IN ('SUPERVISOR', 'DEPT_COORDINATOR', 'SCHOOL_COORDINATOR', 'PG_DEAN', 'EXAMINER', 'SUPER_ADMIN')
  );

-- ------------------------------------------------------------
-- 9.3 Public entities
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Public view schools" ON public.schools;
CREATE POLICY "Public view schools" ON public.schools FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public view depts" ON public.departments;
CREATE POLICY "Public view depts" ON public.departments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public view programmes" ON public.programmes;
CREATE POLICY "Public view programmes" ON public.programmes FOR SELECT USING (true);

-- ------------------------------------------------------------
-- 9.4 students (read + procedural stage updates)
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Students view own profile" ON public.students;
CREATE POLICY "Students view own profile" ON public.students
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Supervisors view mentees" ON public.students;
CREATE POLICY "Supervisors view mentees" ON public.students
  FOR SELECT
  USING (supervisor_id = auth.uid());

DROP POLICY IF EXISTS "Dept coordinators view dept students" ON public.students;
CREATE POLICY "Dept coordinators view dept students" ON public.students
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.users u
      JOIN public.programmes p ON p.id = students.programme_id
      WHERE u.id = auth.uid()
        AND u.role = 'DEPT_COORDINATOR'
        AND u.department_id = p.department_id
    )
  );

DROP POLICY IF EXISTS "School coordinators view school students" ON public.students;
CREATE POLICY "School coordinators view school students" ON public.students
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.users u
      JOIN public.departments u_dept ON u_dept.id = u.department_id
      JOIN public.programmes p ON p.id = students.programme_id
      JOIN public.departments d ON d.id = p.department_id
      WHERE u.id = auth.uid()
        AND u.role = 'SCHOOL_COORDINATOR'
        AND d.school_id = u_dept.school_id
    )
  );

DROP POLICY IF EXISTS "PG Dean view exam pipeline students" ON public.students;
CREATE POLICY "PG Dean view exam pipeline students" ON public.students
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'PG_DEAN'));

DROP POLICY IF EXISTS "Examiners view exam queue students" ON public.students;
CREATE POLICY "Examiners view exam queue students" ON public.students
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role = 'EXAMINER'
        AND students.current_stage IN ('SCHOOL_SEMINAR_BOOKED', 'PG_EXAMINATION', 'VIVA_SCHEDULED')
    )
  );

-- UPDATE policies for stage transitions
DROP POLICY IF EXISTS "Dept coordinators update dept students stage" ON public.students;
CREATE POLICY "Dept coordinators update dept students stage" ON public.students
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.users u
      JOIN public.programmes p ON p.id = students.programme_id
      WHERE u.id = auth.uid()
        AND u.role = 'DEPT_COORDINATOR'
        AND u.department_id = p.department_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.users u
      JOIN public.programmes p ON p.id = students.programme_id
      WHERE u.id = auth.uid()
        AND u.role = 'DEPT_COORDINATOR'
        AND u.department_id = p.department_id
    )
  );

DROP POLICY IF EXISTS "School coordinators update school students stage" ON public.students;
CREATE POLICY "School coordinators update school students stage" ON public.students
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.users u
      JOIN public.departments u_dept ON u_dept.id = u.department_id
      JOIN public.programmes p ON p.id = students.programme_id
      JOIN public.departments d ON d.id = p.department_id
      WHERE u.id = auth.uid()
        AND u.role = 'SCHOOL_COORDINATOR'
        AND d.school_id = u_dept.school_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.users u
      JOIN public.departments u_dept ON u_dept.id = u.department_id
      JOIN public.programmes p ON p.id = students.programme_id
      JOIN public.departments d ON d.id = p.department_id
      WHERE u.id = auth.uid()
        AND u.role = 'SCHOOL_COORDINATOR'
        AND d.school_id = u_dept.school_id
    )
  );

DROP POLICY IF EXISTS "PG Dean update exam pipeline students stage" ON public.students;
CREATE POLICY "PG Dean update exam pipeline students stage" ON public.students
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'PG_DEAN')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'PG_DEAN')
  );

DROP POLICY IF EXISTS "Examiners update exam queue students stage" ON public.students;
CREATE POLICY "Examiners update exam queue students stage" ON public.students
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role = 'EXAMINER'
        AND students.current_stage IN ('SCHOOL_SEMINAR_BOOKED', 'PG_EXAMINATION', 'VIVA_SCHEDULED')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role = 'EXAMINER'
    )
  );

-- ------------------------------------------------------------
-- 9.5 progress_reports (read + updates)
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Students insert own reports" ON public.progress_reports;
CREATE POLICY "Students insert own reports" ON public.progress_reports
  FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.students s WHERE s.user_id = auth.uid() AND s.id = progress_reports.student_id)
  );

DROP POLICY IF EXISTS "Students view own reports" ON public.progress_reports;
CREATE POLICY "Students view own reports" ON public.progress_reports
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.students s WHERE s.user_id = auth.uid() AND s.id = progress_reports.student_id)
  );

DROP POLICY IF EXISTS "Supervisors view mentee reports" ON public.progress_reports;
CREATE POLICY "Supervisors view mentee reports" ON public.progress_reports
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.students s WHERE s.supervisor_id = auth.uid() AND s.id = progress_reports.student_id)
  );

DROP POLICY IF EXISTS "Supervisors update mentee reports" ON public.progress_reports;
CREATE POLICY "Supervisors update mentee reports" ON public.progress_reports
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.students s WHERE s.supervisor_id = auth.uid() AND s.id = progress_reports.student_id)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.students s WHERE s.supervisor_id = auth.uid() AND s.id = progress_reports.student_id)
  );

DROP POLICY IF EXISTS "Coordinators view department reports" ON public.progress_reports;
CREATE POLICY "Coordinators view department reports" ON public.progress_reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.users u
      JOIN public.students s ON s.id = progress_reports.student_id
      JOIN public.programmes p ON p.id = s.programme_id
      WHERE u.id = auth.uid()
        AND u.role IN ('DEPT_COORDINATOR', 'SCHOOL_COORDINATOR')
        AND (
          (u.role = 'DEPT_COORDINATOR' AND u.department_id = p.department_id)
          OR
          (u.role = 'SCHOOL_COORDINATOR' AND EXISTS (
            SELECT 1
            FROM public.departments u_dept
            JOIN public.departments d ON d.id = p.department_id
            WHERE u_dept.id = u.department_id
              AND d.school_id = u_dept.school_id
          ))
        )
    )
  );

DROP POLICY IF EXISTS "Coordinators update department reports" ON public.progress_reports;
CREATE POLICY "Coordinators update department reports" ON public.progress_reports
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.users u
      JOIN public.students s ON s.id = progress_reports.student_id
      JOIN public.programmes p ON p.id = s.programme_id
      WHERE u.id = auth.uid()
        AND u.role IN ('DEPT_COORDINATOR', 'SCHOOL_COORDINATOR')
        AND (
          (u.role = 'DEPT_COORDINATOR' AND u.department_id = p.department_id)
          OR
          (u.role = 'SCHOOL_COORDINATOR' AND EXISTS (
            SELECT 1
            FROM public.departments u_dept
            JOIN public.departments d ON d.id = p.department_id
            WHERE u_dept.id = u.department_id
              AND d.school_id = u_dept.school_id
          ))
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.users u
      JOIN public.students s ON s.id = progress_reports.student_id
      JOIN public.programmes p ON p.id = s.programme_id
      WHERE u.id = auth.uid()
        AND u.role IN ('DEPT_COORDINATOR', 'SCHOOL_COORDINATOR')
        AND (
          (u.role = 'DEPT_COORDINATOR' AND u.department_id = p.department_id)
          OR
          (u.role = 'SCHOOL_COORDINATOR' AND EXISTS (
            SELECT 1
            FROM public.departments u_dept
            JOIN public.departments d ON d.id = p.department_id
            WHERE u_dept.id = u.department_id
              AND d.school_id = u_dept.school_id
          ))
        )
    )
  );

-- ------------------------------------------------------------
-- 9.6 seminar_bookings
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Students read own bookings" ON public.seminar_bookings;
CREATE POLICY "Students read own bookings" ON public.seminar_bookings
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.students s WHERE s.user_id = auth.uid() AND s.id = seminar_bookings.student_id)
  );

DROP POLICY IF EXISTS "Students insert own bookings" ON public.seminar_bookings;
CREATE POLICY "Students insert own bookings" ON public.seminar_bookings
  FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.students s WHERE s.user_id = auth.uid() AND s.id = seminar_bookings.student_id)
  );

DROP POLICY IF EXISTS "Dept coordinators manage dept bookings" ON public.seminar_bookings;
CREATE POLICY "Dept coordinators manage dept bookings" ON public.seminar_bookings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.users u
      JOIN public.students s ON s.id = seminar_bookings.student_id
      JOIN public.programmes p ON p.id = s.programme_id
      WHERE u.id = auth.uid()
        AND u.role = 'DEPT_COORDINATOR'
        AND u.department_id = p.department_id
    )
  );

DROP POLICY IF EXISTS "Dept coordinators update dept bookings" ON public.seminar_bookings;
CREATE POLICY "Dept coordinators update dept bookings" ON public.seminar_bookings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.users u
      JOIN public.students s ON s.id = seminar_bookings.student_id
      JOIN public.programmes p ON p.id = s.programme_id
      WHERE u.id = auth.uid()
        AND u.role = 'DEPT_COORDINATOR'
        AND u.department_id = p.department_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.users u
      JOIN public.students s ON s.id = seminar_bookings.student_id
      JOIN public.programmes p ON p.id = s.programme_id
      WHERE u.id = auth.uid()
        AND u.role = 'DEPT_COORDINATOR'
        AND u.department_id = p.department_id
    )
  );

DROP POLICY IF EXISTS "School coordinators manage school bookings" ON public.seminar_bookings;
CREATE POLICY "School coordinators manage school bookings" ON public.seminar_bookings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.users u
      JOIN public.departments u_dept ON u_dept.id = u.department_id
      JOIN public.students s ON s.id = seminar_bookings.student_id
      JOIN public.programmes p ON p.id = s.programme_id
      JOIN public.departments d ON d.id = p.department_id
      WHERE u.id = auth.uid()
        AND u.role = 'SCHOOL_COORDINATOR'
        AND d.school_id = u_dept.school_id
    )
  );

DROP POLICY IF EXISTS "School coordinators update school bookings" ON public.seminar_bookings;
CREATE POLICY "School coordinators update school bookings" ON public.seminar_bookings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.users u
      JOIN public.departments u_dept ON u_dept.id = u.department_id
      JOIN public.students s ON s.id = seminar_bookings.student_id
      JOIN public.programmes p ON p.id = s.programme_id
      JOIN public.departments d ON d.id = p.department_id
      WHERE u.id = auth.uid()
        AND u.role = 'SCHOOL_COORDINATOR'
        AND d.school_id = u_dept.school_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.users u
      JOIN public.departments u_dept ON u_dept.id = u.department_id
      JOIN public.students s ON s.id = seminar_bookings.student_id
      JOIN public.programmes p ON p.id = s.programme_id
      JOIN public.departments d ON d.id = p.department_id
      WHERE u.id = auth.uid()
        AND u.role = 'SCHOOL_COORDINATOR'
        AND d.school_id = u_dept.school_id
    )
  );

DROP POLICY IF EXISTS "PG Dean view viva bookings" ON public.seminar_bookings;
CREATE POLICY "PG Dean view viva bookings" ON public.seminar_bookings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role = 'PG_DEAN'
        AND seminar_bookings.seminar_level = 'VIVA'
    )
  );

DROP POLICY IF EXISTS "PG Dean upsert viva bookings" ON public.seminar_bookings;
CREATE POLICY "PG Dean upsert viva bookings" ON public.seminar_bookings
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.users u
      JOIN public.students s ON s.id = seminar_bookings.student_id
      WHERE u.id = auth.uid()
        AND u.role = 'PG_DEAN'
        AND seminar_bookings.seminar_level = 'VIVA'
        AND s.current_stage = 'VIVA_SCHEDULED'
    )
  );

DROP POLICY IF EXISTS "PG Dean update viva bookings" ON public.seminar_bookings;
CREATE POLICY "PG Dean update viva bookings" ON public.seminar_bookings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role = 'PG_DEAN'
        AND seminar_bookings.seminar_level = 'VIVA'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role = 'PG_DEAN'
        AND seminar_bookings.seminar_level = 'VIVA'
    )
  );

-- ------------------------------------------------------------
-- 9.7 corrections (StudentDashboard reads them)
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Students view own corrections" ON public.corrections;
CREATE POLICY "Students view own corrections" ON public.corrections
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.students s WHERE s.user_id = auth.uid() AND s.id = corrections.student_id)
  );

-- ------------------------------------------------------------
-- 9.8 evaluations (read + insert for staff)
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Students view own evaluations" ON public.evaluations;
CREATE POLICY "Students view own evaluations" ON public.evaluations
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.students s WHERE s.user_id = auth.uid() AND s.id = evaluations.student_id)
  );

DROP POLICY IF EXISTS "Supervisors view mentee evaluations" ON public.evaluations;
CREATE POLICY "Supervisors view mentee evaluations" ON public.evaluations
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.students s WHERE s.supervisor_id = auth.uid() AND s.id = evaluations.student_id)
  );

DROP POLICY IF EXISTS "Dept coordinators view dept evaluations" ON public.evaluations;
CREATE POLICY "Dept coordinators view dept evaluations" ON public.evaluations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.users u
      JOIN public.students s ON s.id = evaluations.student_id
      JOIN public.programmes p ON p.id = s.programme_id
      WHERE u.id = auth.uid()
        AND u.role = 'DEPT_COORDINATOR'
        AND u.department_id = p.department_id
    )
  );

DROP POLICY IF EXISTS "School coordinators view school evaluations" ON public.evaluations;
CREATE POLICY "School coordinators view school evaluations" ON public.evaluations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.users u
      JOIN public.departments u_dept ON u_dept.id = u.department_id
      JOIN public.students s ON s.id = evaluations.student_id
      JOIN public.programmes p ON p.id = s.programme_id
      JOIN public.departments d ON d.id = p.department_id
      WHERE u.id = auth.uid()
        AND u.role = 'SCHOOL_COORDINATOR'
        AND d.school_id = u_dept.school_id
    )
  );

DROP POLICY IF EXISTS "PG Dean view evaluations" ON public.evaluations;
CREATE POLICY "PG Dean view evaluations" ON public.evaluations
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'PG_DEAN')
  );

DROP POLICY IF EXISTS "Examiners view their own evaluations" ON public.evaluations;
CREATE POLICY "Examiners view their own evaluations" ON public.evaluations
  FOR SELECT
  USING (evaluator_id = auth.uid());

DROP POLICY IF EXISTS "Dept coordinators insert evaluations" ON public.evaluations;
CREATE POLICY "Dept coordinators insert evaluations" ON public.evaluations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.users u
      JOIN public.students s ON s.id = evaluations.student_id
      JOIN public.programmes p ON p.id = s.programme_id
      WHERE u.id = auth.uid()
        AND u.role = 'DEPT_COORDINATOR'
        AND u.department_id = p.department_id
    )
  );

DROP POLICY IF EXISTS "School coordinators insert evaluations" ON public.evaluations;
CREATE POLICY "School coordinators insert evaluations" ON public.evaluations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.users u
      JOIN public.departments u_dept ON u_dept.id = u.department_id
      JOIN public.students s ON s.id = evaluations.student_id
      JOIN public.programmes p ON p.id = s.programme_id
      JOIN public.departments d ON d.id = p.department_id
      WHERE u.id = auth.uid()
        AND u.role = 'SCHOOL_COORDINATOR'
        AND d.school_id = u_dept.school_id
    )
  );

DROP POLICY IF EXISTS "PG Dean insert evaluations" ON public.evaluations;
CREATE POLICY "PG Dean insert evaluations" ON public.evaluations
  FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'PG_DEAN')
  );

DROP POLICY IF EXISTS "Examiners insert evaluations" ON public.evaluations;
CREATE POLICY "Examiners insert evaluations" ON public.evaluations
  FOR INSERT
  WITH CHECK (
    evaluator_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.students s
      WHERE s.id = evaluations.student_id
        AND s.current_stage IN ('SCHOOL_SEMINAR_BOOKED', 'PG_EXAMINATION', 'VIVA_SCHEDULED')
    )
  );

-- ------------------------------------------------------------
-- 9.9 student_stage_history (for timeline)
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Students view own stage history" ON public.student_stage_history;
CREATE POLICY "Students view own stage history" ON public.student_stage_history
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.students s WHERE s.user_id = auth.uid() AND s.id = student_stage_history.student_id)
  );

DROP POLICY IF EXISTS "Staff view stage history by jurisdiction" ON public.student_stage_history;
CREATE POLICY "Staff view stage history by jurisdiction" ON public.student_stage_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.students s
      LEFT JOIN public.programmes p ON p.id = s.programme_id
      WHERE s.id = student_stage_history.student_id
        AND (
          s.supervisor_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
              AND u.role = 'DEPT_COORDINATOR'
              AND p.department_id = u.department_id
          )
          OR EXISTS (
            SELECT 1 FROM public.users u
            JOIN public.departments u_dept ON u_dept.id = u.department_id
            JOIN public.departments d ON d.id = p.department_id
            WHERE u.id = auth.uid()
              AND u.role = 'SCHOOL_COORDINATOR'
              AND d.school_id = u_dept.school_id
          )
          OR EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
              AND u.role = 'PG_DEAN'
          )
          OR EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
              AND u.role = 'EXAMINER'
          )
        )
    )
  );

DROP POLICY IF EXISTS "Staff insert stage history via triggers" ON public.student_stage_history;
CREATE POLICY "Staff insert stage history via triggers" ON public.student_stage_history
  FOR INSERT
  WITH CHECK (
    changed_by = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.students s
      LEFT JOIN public.programmes p ON p.id = s.programme_id
      WHERE s.id = student_stage_history.student_id
        AND (
          s.user_id = auth.uid()
          OR s.supervisor_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
              AND u.role = 'DEPT_COORDINATOR'
              AND p.department_id = u.department_id
          )
          OR EXISTS (
            SELECT 1
            FROM public.users u
            JOIN public.departments u_dept ON u_dept.id = u.department_id
            JOIN public.departments d ON d.id = p.department_id
            WHERE u.id = auth.uid()
              AND u.role = 'SCHOOL_COORDINATOR'
              AND d.school_id = u_dept.school_id
          )
          OR EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
              AND u.role = 'PG_DEAN'
              AND s.current_stage IN ('THESIS_READINESS_CHECK','PG_EXAMINATION','VIVA_SCHEDULED','CORRECTIONS','COMPLETED')
          )
          OR EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
              AND u.role = 'EXAMINER'
              AND s.current_stage IN ('SCHOOL_SEMINAR_BOOKED','PG_EXAMINATION','VIVA_SCHEDULED')
          )
        )
    )
  );

-- ============================================================
-- Thesis/escalation tables: indexes to support upserts/joins
-- ============================================================
CREATE UNIQUE INDEX IF NOT EXISTS uq_seminar_bookings_student_level
  ON public.seminar_bookings (student_id, seminar_level);

CREATE INDEX IF NOT EXISTS idx_progress_reports_student_created
  ON public.progress_reports (student_id, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS uq_progress_reports_student_quarter_year
  ON public.progress_reports (student_id, quarter, year);

CREATE INDEX IF NOT EXISTS idx_evaluations_student_created
  ON public.evaluations (student_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_evaluations_evaluator
  ON public.evaluations (evaluator_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_thesis_submissions_student_version
  ON public.thesis_submissions (student_id, version_number);

-- ============================================================
-- student_stage_history logging trigger
-- ============================================================
CREATE OR REPLACE FUNCTION public.log_student_stage_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.current_stage IS DISTINCT FROM OLD.current_stage THEN
    INSERT INTO public.student_stage_history (
      student_id,
      stage_code,
      status_code,
      changed_by,
      notes
    )
    VALUES (
      NEW.id,
      NEW.current_stage,
      CASE
        WHEN NEW.current_stage = 'CORRECTIONS' THEN 'RETURNED'::status_code_type
        WHEN NEW.current_stage LIKE '%_COMPLETED' OR NEW.current_stage = 'COMPLETED' THEN 'APPROVED'::status_code_type
        ELSE 'PENDING'::status_code_type
      END,
      auth.uid(),
      NULL
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_student_stage_history ON public.students;
CREATE TRIGGER trg_student_stage_history
  AFTER UPDATE OF current_stage ON public.students
  FOR EACH ROW
  EXECUTE PROCEDURE public.log_student_stage_change();
