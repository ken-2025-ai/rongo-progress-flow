-- =====================================================
-- RONGO UNIVERSITY POSTGRADUATE PROGRESS TRACKING SYSTEM
-- Complete Database Schema Migration
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUM TYPES
-- =====================================================

-- User roles in the system
CREATE TYPE user_role AS ENUM (
  'STUDENT',
  'SUPERVISOR', 
  'DEPT_COORDINATOR',
  'SCHOOL_COORDINATOR',
  'PG_DEAN',
  'EXAMINER',
  'SUPER_ADMIN'
);

-- Pipeline stages for student progress
CREATE TYPE pipeline_stage AS ENUM (
  'DEPT_SEMINAR_PENDING',
  'DEPT_SEMINAR_BOOKED',
  'DEPT_SEMINAR_COMPLETED',
  'SCHOOL_SEMINAR_PENDING',
  'SCHOOL_SEMINAR_BOOKED',
  'SCHOOL_SEMINAR_COMPLETED',
  'THESIS_READINESS_CHECK',
  'PG_EXAMINATION',
  'AWAITING_EXAMINER_REPORT',
  'VIVA_SCHEDULED',
  'CORRECTIONS',
  'COMPLETED'
);

-- Seminar levels
CREATE TYPE seminar_level AS ENUM (
  'DEPT_SEMINAR',
  'SCHOOL_SEMINAR'
);

-- Booking/request status
CREATE TYPE request_status AS ENUM (
  'PENDING',
  'APPROVED',
  'REJECTED',
  'CANCELLED'
);

-- Correction status
CREATE TYPE correction_status AS ENUM (
  'PENDING',
  'IN_PROGRESS',
  'SUBMITTED',
  'VERIFIED',
  'REJECTED'
);

-- Evaluation outcome
CREATE TYPE evaluation_outcome AS ENUM (
  'PASS',
  'PASS_WITH_MINOR_CORRECTIONS',
  'PASS_WITH_MAJOR_CORRECTIONS',
  'RESUBMIT',
  'FAIL'
);

-- Study level
CREATE TYPE study_level AS ENUM (
  'MASTERS',
  'PHD'
);

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Schools (Faculties)
CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  code TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Departments under schools
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(school_id, name)
);

-- Postgraduate programmes
CREATE TABLE IF NOT EXISTS programmes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  level study_level DEFAULT 'MASTERS',
  duration_years INTEGER DEFAULT 2,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'STUDENT',
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  staff_id TEXT UNIQUE,
  is_examiner BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Students table (for postgraduate students)
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  registration_number TEXT NOT NULL UNIQUE,
  programme_id UUID NOT NULL REFERENCES programmes(id) ON DELETE RESTRICT,
  supervisor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  co_supervisor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  research_title TEXT,
  current_stage pipeline_stage DEFAULT 'DEPT_SEMINAR_PENDING',
  intake_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
  expected_completion DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- THESIS & SUBMISSION TABLES
-- =====================================================

-- Thesis submissions (versions of thesis documents)
CREATE TABLE IF NOT EXISTS thesis_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_size_bytes BIGINT,
  file_checksum TEXT,
  submission_type TEXT DEFAULT 'DRAFT', -- DRAFT, FINAL, CORRECTION
  submitted_by UUID REFERENCES users(id),
  locked_for_exam BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, version_number)
);

-- =====================================================
-- SEMINAR BOOKING & SCHEDULING
-- =====================================================

-- Seminar booking requests
CREATE TABLE IF NOT EXISTS seminar_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  seminar_level seminar_level NOT NULL,
  requested_date DATE NOT NULL,
  approved_date DATE,
  venue TEXT,
  time_slot TEXT DEFAULT '10:00 AM',
  status request_status DEFAULT 'PENDING',
  notes TEXT,
  approved_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, seminar_level, status) -- Prevent duplicate pending/approved bookings
);

-- Seminar sessions (actual scheduled events)
CREATE TABLE IF NOT EXISTS seminar_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES seminar_bookings(id) ON DELETE SET NULL,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  seminar_level seminar_level NOT NULL,
  scheduled_date DATE NOT NULL,
  start_time TIME DEFAULT '10:00:00',
  end_time TIME DEFAULT '12:00:00',
  venue TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  outcome evaluation_outcome,
  outcome_notes TEXT,
  recorded_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seminar panel members
CREATE TABLE IF NOT EXISTS seminar_panel_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES seminar_sessions(id) ON DELETE CASCADE,
  panelist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'PANELIST', -- CHAIR, PANELIST, SECRETARY
  has_submitted_evaluation BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, panelist_id)
);

-- =====================================================
-- CORRECTIONS & FEEDBACK
-- =====================================================

-- Corrections assigned after seminars/viva
CREATE TABLE IF NOT EXISTS corrections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  session_id UUID REFERENCES seminar_sessions(id) ON DELETE SET NULL,
  viva_id UUID, -- Will reference viva_sessions when created
  assigned_by UUID NOT NULL REFERENCES users(id),
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'NORMAL', -- LOW, NORMAL, HIGH, CRITICAL
  status correction_status DEFAULT 'PENDING',
  evidence_url TEXT,
  evidence_notes TEXT,
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMPTZ,
  deadline DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Supervisor feedback on submissions
CREATE TABLE IF NOT EXISTS submission_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL REFERENCES thesis_submissions(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES users(id),
  feedback_type TEXT DEFAULT 'GENERAL', -- GENERAL, METHODOLOGY, LITERATURE, ANALYSIS, FORMATTING
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- EXAMINATION & VIVA
-- =====================================================

-- Examiner assignments
CREATE TABLE IF NOT EXISTS examiner_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  examiner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  examiner_type TEXT NOT NULL, -- INTERNAL, EXTERNAL
  institution TEXT, -- For external examiners
  assigned_by UUID NOT NULL REFERENCES users(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,
  decline_reason TEXT,
  status request_status DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, examiner_id)
);

-- Examiner reports
CREATE TABLE IF NOT EXISTS examiner_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID NOT NULL REFERENCES examiner_assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  examiner_id UUID NOT NULL REFERENCES users(id),
  report_file_url TEXT,
  recommendation evaluation_outcome,
  summary TEXT,
  strengths TEXT,
  weaknesses TEXT,
  specific_corrections TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Viva voce sessions
CREATE TABLE IF NOT EXISTS viva_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  start_time TIME DEFAULT '09:00:00',
  end_time TIME,
  venue TEXT,
  is_virtual BOOLEAN DEFAULT FALSE,
  meeting_link TEXT,
  status TEXT DEFAULT 'SCHEDULED', -- SCHEDULED, IN_PROGRESS, COMPLETED, POSTPONED, CANCELLED
  outcome evaluation_outcome,
  outcome_notes TEXT,
  final_recommendation TEXT,
  chair_id UUID REFERENCES users(id),
  scheduled_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Viva panel members
CREATE TABLE IF NOT EXISTS viva_panel_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  viva_id UUID NOT NULL REFERENCES viva_sessions(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'EXAMINER', -- CHAIR, INTERNAL_EXAMINER, EXTERNAL_EXAMINER, SUPERVISOR
  evaluation_submitted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(viva_id, member_id)
);

-- =====================================================
-- PROGRESS TRACKING & AUDIT
-- =====================================================

-- Progress reports (periodic submissions)
CREATE TABLE IF NOT EXISTS progress_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  report_period TEXT NOT NULL, -- e.g., "Q1 2026", "Semester 1 2026"
  file_url TEXT,
  summary TEXT,
  achievements TEXT,
  challenges TEXT,
  next_steps TEXT,
  supervisor_comments TEXT,
  supervisor_approved BOOLEAN DEFAULT FALSE,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stage transition history (audit trail)
CREATE TABLE IF NOT EXISTS stage_transitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  from_stage pipeline_stage,
  to_stage pipeline_stage NOT NULL,
  transitioned_by UUID NOT NULL REFERENCES users(id),
  reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'INFO', -- INFO, WARNING, SUCCESS, ERROR, ACTION_REQUIRED
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT, -- students, thesis_submissions, etc.
  entity_id UUID,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_departments_school ON departments(school_id);
CREATE INDEX IF NOT EXISTS idx_programmes_department ON programmes(department_id);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_students_user ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_programme ON students(programme_id);
CREATE INDEX IF NOT EXISTS idx_students_supervisor ON students(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_students_stage ON students(current_stage);
CREATE INDEX IF NOT EXISTS idx_thesis_submissions_student ON thesis_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_seminar_bookings_student ON seminar_bookings(student_id);
CREATE INDEX IF NOT EXISTS idx_seminar_bookings_status ON seminar_bookings(status);
CREATE INDEX IF NOT EXISTS idx_seminar_sessions_student ON seminar_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_corrections_student ON corrections(student_id);
CREATE INDEX IF NOT EXISTS idx_corrections_status ON corrections(status);
CREATE INDEX IF NOT EXISTS idx_examiner_assignments_student ON examiner_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_viva_sessions_student ON viva_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_stage_transitions_student ON stage_transitions(student_id);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at' 
        AND table_schema = 'public'
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;
            CREATE TRIGGER update_%I_updated_at
            BEFORE UPDATE ON %I
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        ', t, t, t, t);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGER: Auto-create user profile on auth signup
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    'STUDENT'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- TRIGGER: Log stage transitions
-- =====================================================

CREATE OR REPLACE FUNCTION log_stage_transition()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.current_stage IS DISTINCT FROM NEW.current_stage THEN
    INSERT INTO stage_transitions (student_id, from_stage, to_stage, transitioned_by, reason)
    VALUES (NEW.id, OLD.current_stage, NEW.current_stage, NEW.user_id, 'Stage updated');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_student_stage_change ON students;
CREATE TRIGGER on_student_stage_change
  AFTER UPDATE OF current_stage ON students
  FOR EACH ROW EXECUTE FUNCTION log_stage_transition();

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE programmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE thesis_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE seminar_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE seminar_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE seminar_panel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE examiner_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE examiner_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE viva_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE viva_panel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE stage_transitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check user role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS user_role AS $$
  SELECT role FROM users WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Helper function to check if user is admin+
CREATE OR REPLACE FUNCTION is_admin_or_above(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT role IN ('DEPT_COORDINATOR', 'SCHOOL_COORDINATOR', 'PG_DEAN', 'SUPER_ADMIN')
  FROM users WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Schools: Read for all authenticated, write for admins
CREATE POLICY "Schools are viewable by authenticated users" ON schools
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Schools are editable by super admins" ON schools
  FOR ALL TO authenticated USING (is_admin_or_above(auth.uid()));

-- Departments: Read for all authenticated, write for admins
CREATE POLICY "Departments are viewable by authenticated users" ON departments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Departments are editable by super admins" ON departments
  FOR ALL TO authenticated USING (is_admin_or_above(auth.uid()));

-- Programmes: Read for all, write for admins
CREATE POLICY "Programmes are viewable by authenticated users" ON programmes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Programmes are editable by super admins" ON programmes
  FOR ALL TO authenticated USING (is_admin_or_above(auth.uid()));

-- Users: Users can read their own profile, admins can read all
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT TO authenticated USING (id = auth.uid() OR is_admin_or_above(auth.uid()));

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE TO authenticated USING (id = auth.uid());

CREATE POLICY "Admins can manage users" ON users
  FOR ALL TO authenticated USING (is_admin_or_above(auth.uid()));

-- Students: Own data + supervisors + admins
CREATE POLICY "Students can view own record" ON students
  FOR SELECT TO authenticated 
  USING (
    user_id = auth.uid() 
    OR supervisor_id = auth.uid() 
    OR co_supervisor_id = auth.uid()
    OR is_admin_or_above(auth.uid())
  );

CREATE POLICY "Students can update own record" ON students
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Admins can manage students" ON students
  FOR ALL TO authenticated USING (is_admin_or_above(auth.uid()));

-- Thesis submissions: Student owns + supervisor + admins
CREATE POLICY "Thesis viewable by relevant parties" ON thesis_submissions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students s 
      WHERE s.id = thesis_submissions.student_id 
      AND (s.user_id = auth.uid() OR s.supervisor_id = auth.uid() OR is_admin_or_above(auth.uid()))
    )
  );

CREATE POLICY "Students can insert thesis submissions" ON thesis_submissions
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM students WHERE id = student_id AND user_id = auth.uid())
  );

-- Seminar bookings
CREATE POLICY "Booking viewable by relevant parties" ON seminar_bookings
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students s 
      WHERE s.id = seminar_bookings.student_id 
      AND (s.user_id = auth.uid() OR s.supervisor_id = auth.uid() OR is_admin_or_above(auth.uid()))
    )
  );

CREATE POLICY "Students can create bookings" ON seminar_bookings
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM students WHERE id = student_id AND user_id = auth.uid())
  );

CREATE POLICY "Admins can manage bookings" ON seminar_bookings
  FOR ALL TO authenticated USING (is_admin_or_above(auth.uid()));

-- Notifications: Users see their own
CREATE POLICY "Users see own notifications" ON notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT TO authenticated WITH CHECK (true);

-- Activity logs: Admins only
CREATE POLICY "Admins can view activity logs" ON activity_logs
  FOR SELECT TO authenticated USING (is_admin_or_above(auth.uid()));

CREATE POLICY "System can insert activity logs" ON activity_logs
  FOR INSERT TO authenticated WITH CHECK (true);

-- Seminar sessions: Viewable by involved parties
CREATE POLICY "Sessions viewable by relevant parties" ON seminar_sessions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students s 
      WHERE s.id = seminar_sessions.student_id 
      AND (s.user_id = auth.uid() OR s.supervisor_id = auth.uid() OR is_admin_or_above(auth.uid()))
    )
    OR EXISTS (
      SELECT 1 FROM seminar_panel_members pm 
      WHERE pm.session_id = seminar_sessions.id AND pm.panelist_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage sessions" ON seminar_sessions
  FOR ALL TO authenticated USING (is_admin_or_above(auth.uid()));

-- Corrections
CREATE POLICY "Corrections viewable by relevant parties" ON corrections
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students s 
      WHERE s.id = corrections.student_id 
      AND (s.user_id = auth.uid() OR s.supervisor_id = auth.uid() OR is_admin_or_above(auth.uid()))
    )
  );

CREATE POLICY "Students can update their corrections" ON corrections
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM students WHERE id = student_id AND user_id = auth.uid())
  );

CREATE POLICY "Admins can manage corrections" ON corrections
  FOR ALL TO authenticated USING (is_admin_or_above(auth.uid()));

-- Examiner assignments
CREATE POLICY "Examiner assignments viewable" ON examiner_assignments
  FOR SELECT TO authenticated
  USING (
    examiner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM students s 
      WHERE s.id = examiner_assignments.student_id 
      AND (s.user_id = auth.uid() OR s.supervisor_id = auth.uid())
    )
    OR is_admin_or_above(auth.uid())
  );

CREATE POLICY "Dean can manage examiner assignments" ON examiner_assignments
  FOR ALL TO authenticated 
  USING (get_user_role(auth.uid()) IN ('PG_DEAN', 'SUPER_ADMIN'));

-- Viva sessions
CREATE POLICY "Viva sessions viewable" ON viva_sessions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students s 
      WHERE s.id = viva_sessions.student_id 
      AND (s.user_id = auth.uid() OR s.supervisor_id = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM viva_panel_members vm 
      WHERE vm.viva_id = viva_sessions.id AND vm.member_id = auth.uid()
    )
    OR is_admin_or_above(auth.uid())
  );

CREATE POLICY "Dean can manage viva sessions" ON viva_sessions
  FOR ALL TO authenticated 
  USING (get_user_role(auth.uid()) IN ('PG_DEAN', 'SUPER_ADMIN'));

-- Progress reports
CREATE POLICY "Progress reports viewable" ON progress_reports
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students s 
      WHERE s.id = progress_reports.student_id 
      AND (s.user_id = auth.uid() OR s.supervisor_id = auth.uid() OR is_admin_or_above(auth.uid()))
    )
  );

CREATE POLICY "Students can manage own progress reports" ON progress_reports
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM students WHERE id = student_id AND user_id = auth.uid())
  );

-- Stage transitions
CREATE POLICY "Stage transitions viewable" ON stage_transitions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students s 
      WHERE s.id = stage_transitions.student_id 
      AND (s.user_id = auth.uid() OR s.supervisor_id = auth.uid() OR is_admin_or_above(auth.uid()))
    )
  );

-- =====================================================
-- SEED DATA: Initial academic structure
-- =====================================================

-- Insert sample schools
INSERT INTO schools (name, code) VALUES
  ('School of Science and Technology', 'SST'),
  ('School of Business and Economics', 'SBE'),
  ('School of Education', 'SOE'),
  ('School of Arts and Social Sciences', 'SASS'),
  ('School of Agriculture and Natural Resources', 'SANR'),
  ('School of Health Sciences', 'SHS')
ON CONFLICT (name) DO NOTHING;

-- Insert sample departments
INSERT INTO departments (school_id, name, code)
SELECT s.id, d.name, d.code
FROM schools s
CROSS JOIN (VALUES
  ('School of Science and Technology', 'Computer Science', 'CS'),
  ('School of Science and Technology', 'Information Technology', 'IT'),
  ('School of Science and Technology', 'Mathematics', 'MATH'),
  ('School of Science and Technology', 'Physics', 'PHY'),
  ('School of Business and Economics', 'Business Administration', 'BA'),
  ('School of Business and Economics', 'Economics', 'ECON'),
  ('School of Business and Economics', 'Accounting', 'ACC'),
  ('School of Education', 'Educational Psychology', 'EDPSY'),
  ('School of Education', 'Curriculum Studies', 'CURR'),
  ('School of Arts and Social Sciences', 'Sociology', 'SOC'),
  ('School of Arts and Social Sciences', 'Political Science', 'POL'),
  ('School of Agriculture and Natural Resources', 'Agricultural Sciences', 'AGRI'),
  ('School of Health Sciences', 'Public Health', 'PH'),
  ('School of Health Sciences', 'Nursing', 'NUR')
) AS d(school_name, name, code)
WHERE s.name = d.school_name
ON CONFLICT DO NOTHING;

-- Insert sample programmes
INSERT INTO programmes (department_id, name, code, level)
SELECT d.id, p.name, p.code, p.level::study_level
FROM departments d
CROSS JOIN (VALUES
  ('Computer Science', 'Master of Science in Computer Science', 'MSC.CS', 'MASTERS'),
  ('Computer Science', 'Doctor of Philosophy in Computer Science', 'PHD.CS', 'PHD'),
  ('Information Technology', 'Master of Science in Information Systems', 'MSC.IS', 'MASTERS'),
  ('Business Administration', 'Master of Business Administration', 'MBA', 'MASTERS'),
  ('Business Administration', 'Doctor of Business Administration', 'DBA', 'PHD'),
  ('Economics', 'Master of Arts in Economics', 'MA.ECON', 'MASTERS'),
  ('Educational Psychology', 'Master of Education', 'MED', 'MASTERS'),
  ('Educational Psychology', 'Doctor of Philosophy in Education', 'PHD.ED', 'PHD'),
  ('Public Health', 'Master of Public Health', 'MPH', 'MASTERS'),
  ('Agricultural Sciences', 'Master of Science in Agriculture', 'MSC.AGRI', 'MASTERS')
) AS p(dept_name, name, code, level)
WHERE d.name = p.dept_name
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Student overview with all related info
CREATE OR REPLACE VIEW student_overview AS
SELECT 
  s.id,
  s.registration_number,
  s.research_title,
  s.current_stage,
  s.intake_year,
  s.created_at,
  u.id as user_id,
  u.email,
  u.first_name,
  u.last_name,
  CONCAT(u.first_name, ' ', u.last_name) as full_name,
  p.name as programme_name,
  p.code as programme_code,
  p.level as study_level,
  d.name as department_name,
  sch.name as school_name,
  sup.id as supervisor_id,
  CONCAT(sup.first_name, ' ', sup.last_name) as supervisor_name,
  sup.email as supervisor_email
FROM students s
JOIN users u ON s.user_id = u.id
JOIN programmes p ON s.programme_id = p.id
JOIN departments d ON p.department_id = d.id
JOIN schools sch ON d.school_id = sch.id
LEFT JOIN users sup ON s.supervisor_id = sup.id;

-- Grant access to view
GRANT SELECT ON student_overview TO authenticated;
