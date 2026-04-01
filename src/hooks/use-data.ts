/**
 * React Hooks for Data Fetching
 * Uses SWR for caching, revalidation, and real-time sync
 */

import useSWR from "swr";
import {
  schoolsService,
  departmentsService,
  programmesService,
  usersService,
  studentsService,
  thesisService,
  seminarBookingsService,
  correctionsService,
  notificationsService,
  transitionsService,
  vivaService,
  examinerService,
  progressReportsService,
} from "@/lib/database";
import type {
  School,
  Department,
  Programme,
  User,
  StudentWithRelations,
  ThesisSubmission,
  SeminarBooking,
  Correction,
  Notification,
  StageTransition,
  VivaSession,
  ExaminerAssignment,
  ProgressReport,
  PipelineStage,
  RequestStatus,
  SeminarLevel,
} from "@/integrations/supabase/types";

// =====================================================
// ACADEMIC STRUCTURE HOOKS
// =====================================================

export function useSchools() {
  return useSWR<School[]>("schools", () => schoolsService.getAll(), {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // 1 minute
  });
}

export function useSchool(id: string | undefined) {
  return useSWR<School | null>(
    id ? `school-${id}` : null,
    () => (id ? schoolsService.getById(id) : null),
    { revalidateOnFocus: false }
  );
}

export function useDepartments() {
  return useSWR<Department[]>("departments", () => departmentsService.getAll(), {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });
}

export function useDepartmentsBySchool(schoolId: string | undefined) {
  return useSWR<Department[]>(
    schoolId ? `departments-school-${schoolId}` : null,
    () => (schoolId ? departmentsService.getBySchool(schoolId) : []),
    { revalidateOnFocus: false }
  );
}

export function useDepartment(id: string | undefined) {
  return useSWR<Department | null>(
    id ? `department-${id}` : null,
    () => (id ? departmentsService.getById(id) : null),
    { revalidateOnFocus: false }
  );
}

export function useProgrammes() {
  return useSWR<Programme[]>("programmes", () => programmesService.getAll(), {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });
}

export function useProgrammesByDepartment(departmentId: string | undefined) {
  return useSWR<Programme[]>(
    departmentId ? `programmes-dept-${departmentId}` : null,
    () => (departmentId ? programmesService.getByDepartment(departmentId) : []),
    { revalidateOnFocus: false }
  );
}

export function useProgramme(id: string | undefined) {
  return useSWR<Programme | null>(
    id ? `programme-${id}` : null,
    () => (id ? programmesService.getById(id) : null),
    { revalidateOnFocus: false }
  );
}

// =====================================================
// USER HOOKS
// =====================================================

export function useUsers() {
  return useSWR<User[]>("users", () => usersService.getAll(), {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  });
}

export function useUser(id: string | undefined) {
  return useSWR<User | null>(
    id ? `user-${id}` : null,
    () => (id ? usersService.getById(id) : null),
    { revalidateOnFocus: false }
  );
}

export function useUsersByRole(role: string | undefined) {
  return useSWR<User[]>(
    role ? `users-role-${role}` : null,
    () => (role ? usersService.getByRole(role) : []),
    { revalidateOnFocus: false }
  );
}

export function useSupervisors() {
  return useSWR<User[]>("supervisors", () => usersService.getSupervisors(), {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });
}

export function useExaminers() {
  return useSWR<User[]>("examiners", () => usersService.getExaminers(), {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });
}

// =====================================================
// STUDENT HOOKS
// =====================================================

export function useStudents() {
  return useSWR<StudentWithRelations[]>("students", () => studentsService.getAll(), {
    revalidateOnFocus: false,
    dedupingInterval: 15000,
  });
}

export function useStudent(id: string | undefined) {
  return useSWR<StudentWithRelations | null>(
    id ? `student-${id}` : null,
    () => (id ? studentsService.getById(id) : null),
    { revalidateOnFocus: false }
  );
}

export function useStudentByUserId(userId: string | undefined) {
  return useSWR<StudentWithRelations | null>(
    userId ? `student-user-${userId}` : null,
    () => (userId ? studentsService.getByUserId(userId) : null),
    { revalidateOnFocus: false }
  );
}

export function useStudentsBySupervisor(supervisorId: string | undefined) {
  return useSWR<StudentWithRelations[]>(
    supervisorId ? `students-supervisor-${supervisorId}` : null,
    () => (supervisorId ? studentsService.getBySupervisor(supervisorId) : []),
    { revalidateOnFocus: false, dedupingInterval: 15000 }
  );
}

export function useStudentsByStage(stage: PipelineStage | undefined) {
  return useSWR<StudentWithRelations[]>(
    stage ? `students-stage-${stage}` : null,
    () => (stage ? studentsService.getByStage(stage) : []),
    { revalidateOnFocus: false, dedupingInterval: 15000 }
  );
}

export function useStudentsByDepartment(departmentId: string | undefined) {
  return useSWR<StudentWithRelations[]>(
    departmentId ? `students-dept-${departmentId}` : null,
    () => (departmentId ? studentsService.getByDepartment(departmentId) : []),
    { revalidateOnFocus: false, dedupingInterval: 15000 }
  );
}

// =====================================================
// THESIS HOOKS
// =====================================================

export function useThesisSubmissions(studentId: string | undefined) {
  return useSWR<ThesisSubmission[]>(
    studentId ? `thesis-${studentId}` : null,
    () => (studentId ? thesisService.getByStudent(studentId) : []),
    { revalidateOnFocus: false }
  );
}

export function useLatestThesis(studentId: string | undefined) {
  return useSWR<ThesisSubmission | null>(
    studentId ? `thesis-latest-${studentId}` : null,
    () => (studentId ? thesisService.getLatest(studentId) : null),
    { revalidateOnFocus: false }
  );
}

// =====================================================
// SEMINAR BOOKING HOOKS
// =====================================================

export function useSeminarBookings() {
  return useSWR<SeminarBooking[]>("seminar-bookings", () => seminarBookingsService.getAll(), {
    revalidateOnFocus: false,
    dedupingInterval: 15000,
  });
}

export function useSeminarBookingsByStudent(studentId: string | undefined) {
  return useSWR<SeminarBooking[]>(
    studentId ? `bookings-student-${studentId}` : null,
    () => (studentId ? seminarBookingsService.getByStudent(studentId) : []),
    { revalidateOnFocus: false }
  );
}

export function useSeminarBookingsByStatus(status: RequestStatus | undefined) {
  return useSWR<SeminarBooking[]>(
    status ? `bookings-status-${status}` : null,
    () => (status ? seminarBookingsService.getByStatus(status) : []),
    { revalidateOnFocus: false, dedupingInterval: 15000 }
  );
}

export function usePendingSeminarBookings(level?: SeminarLevel) {
  return useSWR<SeminarBooking[]>(
    level ? `bookings-pending-${level}` : "bookings-pending",
    () => seminarBookingsService.getPending(level),
    { revalidateOnFocus: false, dedupingInterval: 15000 }
  );
}

// =====================================================
// CORRECTIONS HOOKS
// =====================================================

export function useCorrections(studentId: string | undefined) {
  return useSWR<Correction[]>(
    studentId ? `corrections-${studentId}` : null,
    () => (studentId ? correctionsService.getByStudent(studentId) : []),
    { revalidateOnFocus: false }
  );
}

export function usePendingCorrections(studentId: string | undefined) {
  return useSWR<Correction[]>(
    studentId ? `corrections-pending-${studentId}` : null,
    () => (studentId ? correctionsService.getPending(studentId) : []),
    { revalidateOnFocus: false }
  );
}

// =====================================================
// NOTIFICATION HOOKS
// =====================================================

export function useNotifications(userId: string | undefined) {
  return useSWR<Notification[]>(
    userId ? `notifications-${userId}` : null,
    () => (userId ? notificationsService.getByUser(userId) : []),
    { 
      revalidateOnFocus: true,
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  );
}

export function useUnreadNotifications(userId: string | undefined) {
  return useSWR<Notification[]>(
    userId ? `notifications-unread-${userId}` : null,
    () => (userId ? notificationsService.getUnread(userId) : []),
    { 
      revalidateOnFocus: true,
      refreshInterval: 30000,
    }
  );
}

// =====================================================
// STAGE TRANSITIONS HOOKS
// =====================================================

export function useStageTransitions(studentId: string | undefined) {
  return useSWR<StageTransition[]>(
    studentId ? `transitions-${studentId}` : null,
    () => (studentId ? transitionsService.getByStudent(studentId) : []),
    { revalidateOnFocus: false }
  );
}

// =====================================================
// VIVA & EXAMINATION HOOKS
// =====================================================

export function useVivaSessions(studentId: string | undefined) {
  return useSWR<VivaSession[]>(
    studentId ? `viva-${studentId}` : null,
    () => (studentId ? vivaService.getByStudent(studentId) : []),
    { revalidateOnFocus: false }
  );
}

export function useExaminerAssignments(studentId: string | undefined) {
  return useSWR<ExaminerAssignment[]>(
    studentId ? `examiners-${studentId}` : null,
    () => (studentId ? examinerService.getByStudent(studentId) : []),
    { revalidateOnFocus: false }
  );
}

// =====================================================
// PROGRESS REPORTS HOOKS
// =====================================================

export function useProgressReports(studentId: string | undefined) {
  return useSWR<ProgressReport[]>(
    studentId ? `progress-${studentId}` : null,
    () => (studentId ? progressReportsService.getByStudent(studentId) : []),
    { revalidateOnFocus: false }
  );
}
