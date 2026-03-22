-- ============================================================
-- FULL POSTGRADUATE RESEARCH PIPELINE
-- Adds missing stages, examiner_assignments, and state validation
-- ============================================================

-- 1. Add new stage: AWAITING_EXAMINER_REPORT (between PG_EXAMINATION and VIVA_SCHEDULED)
DO $$ BEGIN
  ALTER TYPE stage_code_type ADD VALUE 'AWAITING_EXAMINER_REPORT';
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 2. Add VIVA_REQUIRED and REPEAT_VIVA to recommendation_enum
DO $$ BEGIN
  ALTER TYPE recommendation_enum ADD VALUE 'VIVA_REQUIRED';
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
  ALTER TYPE recommendation_enum ADD VALUE 'REPEAT_VIVA';
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 3. Create examiner_assignments table
CREATE TABLE IF NOT EXISTS public.examiner_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  examiner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  examiner_type TEXT NOT NULL CHECK (examiner_type IN ('INTERNAL', 'EXTERNAL')),
  assigned_by UUID REFERENCES public.users(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  report_submitted_at TIMESTAMPTZ,
  UNIQUE (student_id, examiner_id)
);

CREATE INDEX IF NOT EXISTS idx_examiner_assignments_student ON public.examiner_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_examiner_assignments_examiner ON public.examiner_assignments(examiner_id);

ALTER TABLE public.examiner_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super Admin Bypass Examiner Assignments" ON public.examiner_assignments;
CREATE POLICY "Super Admin Bypass Examiner Assignments" ON public.examiner_assignments
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users su WHERE su.id = auth.uid() AND su.role = 'SUPER_ADMIN'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users su WHERE su.id = auth.uid() AND su.role = 'SUPER_ADMIN'));

DROP POLICY IF EXISTS "PG Dean manage examiner assignments" ON public.examiner_assignments;
CREATE POLICY "PG Dean manage examiner assignments" ON public.examiner_assignments
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'PG_DEAN'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'PG_DEAN'));

DROP POLICY IF EXISTS "Examiners view own assignments" ON public.examiner_assignments;
CREATE POLICY "Examiners view own assignments" ON public.examiner_assignments
  FOR SELECT USING (examiner_id = auth.uid());

-- 4. State machine: valid stage transitions (NO SKIPPING)
CREATE OR REPLACE FUNCTION public.validate_stage_transition()
RETURNS TRIGGER AS $$
DECLARE
  valid_next stage_code_type[];
  from_idx int;
  to_idx int;
BEGIN
  -- Allow same stage (e.g. no change)
  IF NEW.current_stage = OLD.current_stage THEN
    RETURN NEW;
  END IF;

  -- Canonical forward flow (strict ordering)
  valid_next := ARRAY[
    'DEPT_SEMINAR_PENDING'::stage_code_type,
    'DEPT_SEMINAR_BOOKED'::stage_code_type,
    'DEPT_SEMINAR_COMPLETED'::stage_code_type,
    'SCHOOL_SEMINAR_PENDING'::stage_code_type,
    'SCHOOL_SEMINAR_BOOKED'::stage_code_type,
    'SCHOOL_SEMINAR_COMPLETED'::stage_code_type,
    'THESIS_READINESS_CHECK'::stage_code_type,
    'PG_EXAMINATION'::stage_code_type,
    'AWAITING_EXAMINER_REPORT'::stage_code_type,
    'VIVA_SCHEDULED'::stage_code_type,
    'CORRECTIONS'::stage_code_type,
    'COMPLETED'::stage_code_type
  ];

  from_idx := array_position(valid_next, OLD.current_stage);
  to_idx := array_position(valid_next, NEW.current_stage);

  -- Unknown stage
  IF from_idx IS NULL OR to_idx IS NULL THEN
    RAISE EXCEPTION 'Invalid stage transition: % -> %. Unknown stage.', OLD.current_stage, NEW.current_stage;
  END IF;

  -- CORRECTIONS can come from many stages and go back to appropriate stage
  IF NEW.current_stage = 'CORRECTIONS'::stage_code_type THEN
    IF OLD.current_stage IN ('DEPT_SEMINAR_COMPLETED', 'SCHOOL_SEMINAR_COMPLETED', 'THESIS_READINESS_CHECK', 'PG_EXAMINATION', 'AWAITING_EXAMINER_REPORT', 'VIVA_SCHEDULED') THEN
      RETURN NEW;
    END IF;
  END IF;

  -- From CORRECTIONS: can advance to various stages based on context
  IF OLD.current_stage = 'CORRECTIONS'::stage_code_type THEN
    IF NEW.current_stage IN ('DEPT_SEMINAR_COMPLETED', 'SCHOOL_SEMINAR_COMPLETED', 'THESIS_READINESS_CHECK', 'PG_EXAMINATION', 'VIVA_SCHEDULED', 'COMPLETED', 'DEPT_SEMINAR_PENDING', 'SCHOOL_SEMINAR_PENDING') THEN
      RETURN NEW;
    END IF;
  END IF;

  -- Repeat seminar: go back
  IF NEW.current_stage IN ('DEPT_SEMINAR_PENDING'::stage_code_type, 'SCHOOL_SEMINAR_PENDING'::stage_code_type) THEN
    IF OLD.current_stage IN ('DEPT_SEMINAR_BOOKED'::stage_code_type, 'DEPT_SEMINAR_COMPLETED'::stage_code_type, 'SCHOOL_SEMINAR_BOOKED'::stage_code_type, 'SCHOOL_SEMINAR_COMPLETED'::stage_code_type) THEN
      RETURN NEW;
    END IF;
  END IF;

  -- Normal forward: exactly one step
  IF to_idx > from_idx THEN
    IF to_idx - from_idx = 1 THEN
      RETURN NEW;
    END IF;
    -- Allow PG_EXAMINATION -> VIVA_SCHEDULED (legacy path; AWAITING_EXAMINER_REPORT is optional)
    IF OLD.current_stage = 'PG_EXAMINATION'::stage_code_type AND NEW.current_stage = 'VIVA_SCHEDULED'::stage_code_type THEN
      RETURN NEW;
    END IF;
    RAISE EXCEPTION 'Stage skip forbidden: cannot jump from % to %. Move one step at a time.', OLD.current_stage, NEW.current_stage;
  END IF;

  -- Backward not allowed except for CORRECTIONS and REPEAT cases above
  RAISE EXCEPTION 'Invalid stage transition: % -> %', OLD.current_stage, NEW.current_stage;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_stage_transition ON public.students;
CREATE TRIGGER trg_validate_stage_transition
  BEFORE UPDATE OF current_stage ON public.students
  FOR EACH ROW
  EXECUTE PROCEDURE public.validate_stage_transition();
