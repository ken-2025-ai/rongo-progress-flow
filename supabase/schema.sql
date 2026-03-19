-- ==========================================
-- 1. ENUMS (For Strict Type Safety)
-- ==========================================
CREATE TYPE role_type AS ENUM (
  'STUDENT', 'SUPERVISOR', 'DEPT_COORDINATOR', 'SCHOOL_COORDINATOR', 'PG_DEAN', 'EXAMINER'
);

CREATE TYPE stage_code_type AS ENUM (
  'DEPT_SEMINAR_PENDING', 'DEPT_SEMINAR_COMPLETED',
  'SCHOOL_SEMINAR_PENDING', 'SCHOOL_SEMINAR_COMPLETED',
  'THESIS_READINESS_CHECK', 'PG_EXAMINATION', 
  'VIVA_SCHEDULED', 'CORRECTIONS', 'COMPLETED'
);

CREATE TYPE status_code_type AS ENUM (
  'PENDING', 'APPROVED', 'RETURNED', 'REJECTED'
);

CREATE TYPE evaluation_type_enum AS ENUM (
  'DEPT_SEMINAR', 'SCHOOL_SEMINAR', 'VIVA'
);

CREATE TYPE recommendation_enum AS ENUM (
  'PASS', 'MINOR_CORRECTIONS', 'MAJOR_CORRECTIONS', 'REPEAT_SEMINAR', 'FAIL'
);


-- ==========================================
-- 2. CORE AUTH & ACADEMIC ENTITIES
-- ==========================================

-- USERS TABLE 
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role role_type NOT NULL DEFAULT 'STUDENT',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SCHOOLS TABLE
CREATE TABLE public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DEPARTMENTS TABLE
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROGRAMMES TABLE
CREATE TABLE public.programmes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL
);


-- ==========================================
-- 3. STUDENT PROFILE & WORKFLOW STATE
-- ==========================================

-- STUDENTS TABLE
CREATE TABLE public.students (
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

-- STUDENT STAGE HISTORY (Event Workflow Tracing)
CREATE TABLE public.student_stage_history (
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

-- THESIS SUBMISSIONS (Only tracking reference urls)
CREATE TABLE public.thesis_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  file_checksum TEXT,
  submitted_by UUID REFERENCES public.users(id),
  locked_for_exam BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CORRECTIONS TABLE
CREATE TABLE public.corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  category evaluation_type_enum NOT NULL,
  description TEXT NOT NULL,
  urgency TEXT, 
  created_by UUID REFERENCES public.users(id),
  status status_code_type DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ==========================================
-- 5. SEMINARS & EXAMINATIONS
-- ==========================================

-- SEMINAR BOOKINGS
CREATE TABLE public.seminar_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  seminar_level evaluation_type_enum NOT NULL, 
  requested_date DATE NOT NULL,
  approved_date DATE,
  status status_code_type DEFAULT 'PENDING',
  approved_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- EXAMINER ASSIGNMENTS (For locking external/internal assessors)
CREATE TABLE public.examiner_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  internal_examiner_id UUID REFERENCES public.users(id),
  external_examiner_name TEXT, 
  external_examiner_institution TEXT,
  assigned_by UUID REFERENCES public.users(id), 
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- EVALUATIONS TABLE
CREATE TABLE public.evaluations (
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
-- 6. SYSTEM AUDIT & NOTIFICATIONS
-- ==========================================

-- SYSTEM ACTIVITY LOG 
CREATE TABLE public.system_activity_log (
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
-- 7. PERFORMANCE INDEXES
-- ==========================================

CREATE INDEX idx_students_stage ON public.students(current_stage);
CREATE INDEX idx_evaluations_student_type ON public.evaluations(student_id, evaluation_type);
CREATE INDEX idx_stage_history_student ON public.student_stage_history(student_id);
CREATE INDEX idx_activity_log_entity ON public.system_activity_log(entity_type, entity_id);

-- ==========================================
-- 8. ROW LEVEL SECURITY (RLS) & POLICIES
-- ==========================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thesis_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seminar_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_stage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.corrections ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------
-- USERS: Can see all active users (for assignment lists) but only update themselves
-- ----------------------------------------------------
CREATE POLICY "Users can view active users" ON public.users 
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can update own record" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- ----------------------------------------------------
-- STUDENTS: The Isolation Matrix
-- ----------------------------------------------------
-- Student Role: Can only view their own academic profile
CREATE POLICY "Student can view own profile" ON public.students
  FOR SELECT USING (auth.uid() = user_id);

-- Supervisor Role: Can only view students assigned to them explicitly
CREATE POLICY "Supervisor can view assigned students" ON public.students
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'SUPERVISOR')
    AND auth.uid() = supervisor_id
  );

-- Admin Roles (Dept, School, Dean): Can view all students
CREATE POLICY "Admins can view all students" ON public.students
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('DEPT_COORDINATOR', 'SCHOOL_COORDINATOR', 'PG_DEAN'))
  );

-- ----------------------------------------------------
-- THESIS_SUBMISSIONS: Locking Mutation
-- ----------------------------------------------------
-- Student: Can view own submissions, and Insert ONLY IF locked_for_exam is FALSE. Cannot delete.
CREATE POLICY "Student view own thesis" ON public.thesis_submissions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.students s WHERE s.id = thesis_submissions.student_id AND s.user_id = auth.uid())
  );

CREATE POLICY "Student insert thesis if unlocked" ON public.thesis_submissions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.students s WHERE s.id = thesis_submissions.student_id AND s.user_id = auth.uid())
    AND NOT locked_for_exam
  );

-- Admins: View all thesis
CREATE POLICY "Admins view all thesis" ON public.thesis_submissions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('DEPT_COORDINATOR', 'SCHOOL_COORDINATOR', 'PG_DEAN', 'EXAMINER'))
  );

-- Dean: Can UPDATE thesis to lock it
CREATE POLICY "Dean can lock thesis" ON public.thesis_submissions
  FOR UPDATE USING (
     EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'PG_DEAN')
  );

-- ----------------------------------------------------
-- EVALUATIONS: Examiner Guardrails 
-- ----------------------------------------------------
-- Examiner: Can only view their OWN evaluations 
CREATE POLICY "Examiners view own evaluations" ON public.evaluations
  FOR SELECT USING (auth.uid() = examiner_id);

-- Examiner: Can insert evaluations strictly for themselves
CREATE POLICY "Examiners insert own evaluations" ON public.evaluations
  FOR INSERT WITH CHECK (auth.uid() = examiner_id);

-- Dean & School Admin: Can view all evaluations to make consensus decisions
CREATE POLICY "Admins view all evaluations" ON public.evaluations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('PG_DEAN', 'SCHOOL_COORDINATOR', 'DEPT_COORDINATOR'))
  );

-- ----------------------------------------------------
-- WORKFLOW ENGINE (STAGE HISTORY & AUDIT)
-- ----------------------------------------------------
-- Only Admins (Coordinators/Deans) can insert into stage history to physically advance a student.
CREATE POLICY "Admins can advance student stages" ON public.student_stage_history
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('DEPT_COORDINATOR', 'SCHOOL_COORDINATOR', 'PG_DEAN'))
  );

-- System Log: Append-only for all users! Nothing can be deleted or updated.
CREATE POLICY "Users can append logs" ON public.system_activity_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only Dean views system logs" ON public.system_activity_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'PG_DEAN')
  );

-- ----------------------------------------------------
-- PROGRESS REPORTS: Tracking student submissions
-- ----------------------------------------------------
CREATE TABLE public.progress_reports (
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

ALTER TABLE public.progress_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Student view own reports" ON public.progress_reports
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.students s WHERE s.id = progress_reports.student_id AND s.user_id = auth.uid())
  );

CREATE POLICY "Student insert own reports" ON public.progress_reports
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.students s WHERE s.id = progress_reports.student_id AND s.user_id = auth.uid())
  );

CREATE POLICY "Admins view all reports" ON public.progress_reports
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('SUPERVISOR', 'DEPT_COORDINATOR', 'SCHOOL_COORDINATOR', 'PG_DEAN'))
  );
