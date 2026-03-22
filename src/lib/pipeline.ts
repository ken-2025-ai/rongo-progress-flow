/**
 * POSTGRADUATE RESEARCH PIPELINE — Canonical Stage Machine
 *
 * Flow: Dept → School → PG Dean → Examiners → Viva → Final Clearance
 * Rule: Students MUST NOT skip levels. Each transition is validated.
 */

export type StageCode =
  | "DEPT_SEMINAR_PENDING"
  | "DEPT_SEMINAR_BOOKED"
  | "DEPT_SEMINAR_COMPLETED"
  | "SCHOOL_SEMINAR_PENDING"
  | "SCHOOL_SEMINAR_BOOKED"
  | "SCHOOL_SEMINAR_COMPLETED"
  | "THESIS_READINESS_CHECK"
  | "PG_EXAMINATION"
  | "AWAITING_EXAMINER_REPORT"
  | "VIVA_SCHEDULED"
  | "CORRECTIONS"
  | "COMPLETED";

/** Canonical order — defines pipeline sequence. No skipping allowed. */
export const STAGE_SEQUENCE: StageCode[] = [
  "DEPT_SEMINAR_PENDING",       // 1. Student prepares, supervisor approves
  "DEPT_SEMINAR_BOOKED",        // 2. Dept coordinator schedules
  "DEPT_SEMINAR_COMPLETED",     // 3. Dept seminar done
  "SCHOOL_SEMINAR_PENDING",     // 4. Forwarded to school (dept clearance)
  "SCHOOL_SEMINAR_BOOKED",      // 5. School coordinator schedules
  "SCHOOL_SEMINAR_COMPLETED",   // 6. School seminar done
  "THESIS_READINESS_CHECK",     // 7. School corrections done, ready for PG
  "PG_EXAMINATION",             // 8. PG Dean approves thesis for examination
  "AWAITING_EXAMINER_REPORT",   // 9. Examiners assigned, awaiting reports
  "VIVA_SCHEDULED",             // 10. Viva scheduled
  "CORRECTIONS",                // 11. Final corrections (can loop)
  "COMPLETED",                  // 12. Research completed, graduation clearance
];

/** Human-readable labels for UI */
export const STAGE_LABELS: Record<StageCode, string> = {
  DEPT_SEMINAR_PENDING: "Dept Proposal Pending",
  DEPT_SEMINAR_BOOKED: "Dept Seminar Scheduled",
  DEPT_SEMINAR_COMPLETED: "Dept Seminar Passed",
  SCHOOL_SEMINAR_PENDING: "Forwarded to School",
  SCHOOL_SEMINAR_BOOKED: "School Seminar Scheduled",
  SCHOOL_SEMINAR_COMPLETED: "School Seminar Passed",
  THESIS_READINESS_CHECK: "Thesis Readiness Check",
  PG_EXAMINATION: "Under Examination",
  AWAITING_EXAMINER_REPORT: "Awaiting Examiner Reports",
  VIVA_SCHEDULED: "Viva Voce Scheduled",
  CORRECTIONS: "Corrections",
  COMPLETED: "Research Completed",
};

/** Valid forward transitions. CORRECTIONS and REPEAT_* can go backward. */
export const VALID_TRANSITIONS: Partial<Record<StageCode, StageCode[]>> = {
  DEPT_SEMINAR_PENDING: ["DEPT_SEMINAR_BOOKED", "CORRECTIONS"],
  DEPT_SEMINAR_BOOKED: ["DEPT_SEMINAR_COMPLETED", "DEPT_SEMINAR_PENDING"], // repeat
  DEPT_SEMINAR_COMPLETED: ["SCHOOL_SEMINAR_PENDING", "CORRECTIONS"],
  SCHOOL_SEMINAR_PENDING: ["SCHOOL_SEMINAR_BOOKED", "CORRECTIONS"],
  SCHOOL_SEMINAR_BOOKED: ["SCHOOL_SEMINAR_COMPLETED", "SCHOOL_SEMINAR_PENDING"],
  SCHOOL_SEMINAR_COMPLETED: ["THESIS_READINESS_CHECK", "CORRECTIONS"],
  THESIS_READINESS_CHECK: ["PG_EXAMINATION", "CORRECTIONS"],
  PG_EXAMINATION: ["AWAITING_EXAMINER_REPORT", "CORRECTIONS"],
  AWAITING_EXAMINER_REPORT: ["VIVA_SCHEDULED", "PG_EXAMINATION", "CORRECTIONS"],
  VIVA_SCHEDULED: ["COMPLETED", "CORRECTIONS", "VIVA_SCHEDULED"], // repeat viva
  CORRECTIONS: ["DEPT_SEMINAR_COMPLETED", "SCHOOL_SEMINAR_COMPLETED", "THESIS_READINESS_CHECK", "PG_EXAMINATION", "VIVA_SCHEDULED", "COMPLETED", "DEPT_SEMINAR_PENDING", "SCHOOL_SEMINAR_PENDING"],
  COMPLETED: [],
};

/** Which role can advance from this stage */
export const STAGE_OWNERS: Partial<Record<StageCode, string[]>> = {
  DEPT_SEMINAR_PENDING: ["SUPERVISOR", "DEPT_COORDINATOR"],
  DEPT_SEMINAR_BOOKED: ["DEPT_COORDINATOR"],
  DEPT_SEMINAR_COMPLETED: ["DEPT_COORDINATOR"],
  SCHOOL_SEMINAR_PENDING: ["SCHOOL_COORDINATOR"],
  SCHOOL_SEMINAR_BOOKED: ["SCHOOL_COORDINATOR"],
  SCHOOL_SEMINAR_COMPLETED: ["SCHOOL_COORDINATOR"],
  THESIS_READINESS_CHECK: ["SCHOOL_COORDINATOR"],
  PG_EXAMINATION: ["PG_DEAN"],
  AWAITING_EXAMINER_REPORT: ["PG_DEAN", "EXAMINER"],
  VIVA_SCHEDULED: ["PG_DEAN", "EXAMINER"],
  CORRECTIONS: ["SUPERVISOR", "DEPT_COORDINATOR", "SCHOOL_COORDINATOR", "PG_DEAN"],
  COMPLETED: ["PG_DEAN"],
};

export function getStageIndex(stage: string): number {
  const idx = STAGE_SEQUENCE.indexOf(stage as StageCode);
  return idx === -1 ? 0 : idx;
}

export function getStageNumeric(stage: string): number {
  return getStageIndex(stage) + 1;
}

export function isValidTransition(from: string, to: string): boolean {
  const allowed = VALID_TRANSITIONS[from as StageCode];
  if (!allowed) return false;
  return allowed.includes(to as StageCode);
}

export function canAdvanceTo(from: string, to: string): boolean {
  const fromIdx = getStageIndex(from);
  const toIdx = getStageIndex(to);
  if (fromIdx === -1 || toIdx === -1) return false;
  return isValidTransition(from, to);
}

export function getNextStages(stage: string): StageCode[] {
  return (VALID_TRANSITIONS[stage as StageCode] ?? []) as StageCode[];
}

export function formatStage(stage: string): string {
  return STAGE_LABELS[stage as StageCode] ?? stage.replace(/_/g, " ");
}

/** High-level phases for PipelineRail (0-4) */
export const PHASE_LABELS = [
  "Department Seminar",
  "School Seminar",
  "PG Examination",
  "Viva & Corrections",
  "Final Clearance",
] as const;

/** Map stage to phase index (0-4) for simplified progress UI */
export function getPhaseForStage(stage: string): number {
  const idx = getStageIndex(stage);
  if (idx < 0) return 0;
  if (idx <= 2) return 0;   // Dept
  if (idx <= 5) return 1;   // School
  if (idx <= 8) return 2;   // PG Exam + Awaiting + Viva scheduled
  if (idx <= 10) return 3;  // Viva, Corrections
  return 4;                 // Completed
}
