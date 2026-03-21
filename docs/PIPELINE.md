# Postgraduate Research Pipeline

## Flow Overview

```
Student → Supervisor Approval → Dept Seminar → Dept Corrections
    → School Seminar → School Corrections → PG Dean Approval
    → Examiner Assignment → Examiner Reports → Viva Voce
    → Final Corrections → Graduation Clearance
```

## Stage Sequence (Canonical Order)

| # | Stage Code | Description |
|---|------------|-------------|
| 1 | `DEPT_SEMINAR_PENDING` | Student prepares, supervisor approves proposal |
| 2 | `DEPT_SEMINAR_BOOKED` | Dept coordinator schedules seminar |
| 3 | `DEPT_SEMINAR_COMPLETED` | Dept seminar passed |
| 4 | `SCHOOL_SEMINAR_PENDING` | Forwarded to school (dept clearance) |
| 5 | `SCHOOL_SEMINAR_BOOKED` | School coordinator schedules seminar |
| 6 | `SCHOOL_SEMINAR_COMPLETED` | School seminar passed |
| 7 | `THESIS_READINESS_CHECK` | School corrections done, thesis ready for PG |
| 8 | `PG_EXAMINATION` | PG Dean approves thesis for examination |
| 9 | `AWAITING_EXAMINER_REPORT` | Examiners assigned, awaiting reports |
| 10 | `VIVA_SCHEDULED` | Viva voce scheduled |
| 11 | `CORRECTIONS` | Final corrections (can loop from any stage) |
| 12 | `COMPLETED` | Research completed, graduation clearance |

## Critical Rule: No Skipping

Students **must NOT skip levels**:

- Cannot go to School without Department clearance
- Cannot go to PG Dean without School readiness approval
- Cannot do Viva without examiner reports (or legacy direct path)

Enforced by `validate_stage_transition()` trigger in the database.

## Decision Outcomes (Evaluations)

- `PASS` → Advance
- `MINOR_CORRECTIONS` / `MAJOR_CORRECTIONS` → `CORRECTIONS` stage
- `REPEAT_SEMINAR` → Back to `DEPT_SEMINAR_PENDING` or `SCHOOL_SEMINAR_PENDING`
- `VIVA_REQUIRED` → `VIVA_SCHEDULED`
- `REPEAT_VIVA` → Stay in `VIVA_SCHEDULED` (reschedule)
- `FAIL` → May return to earlier stage

## Tables

| Table | Purpose |
|-------|---------|
| `students` | `current_stage` holds pipeline position |
| `student_stage_history` | Audit trail of stage changes |
| `seminar_bookings` | Dept/School/Viva bookings |
| `evaluations` | Panel recommendations |
| `examiner_assignments` | Internal/external examiner assignment by PG Dean |
| `corrections` | Correction items per student |
| `thesis_submissions` | Thesis versions |

## Frontend Usage

Use `src/lib/pipeline.ts`:

```ts
import { STAGE_SEQUENCE, STAGE_LABELS, formatStage, getStageNumeric, isValidTransition } from '@/lib/pipeline';
```
