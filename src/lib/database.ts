/**
 * Database Service Layer
 * Provides typed access to Supabase operations with proper error handling
 */

import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import type {
  School, SchoolInsert, SchoolUpdate,
  Department, DepartmentInsert, DepartmentUpdate,
  Programme, ProgrammeInsert, ProgrammeUpdate,
  User, UserInsert, UserUpdate,
  Student, StudentInsert, StudentUpdate,
  ThesisSubmission, ThesisSubmissionInsert,
  SeminarBooking, SeminarBookingInsert, SeminarBookingUpdate,
  SeminarSession, SeminarSessionInsert,
  Correction, CorrectionInsert, CorrectionUpdate,
  ExaminerAssignment, ExaminerAssignmentInsert,
  ExaminerReport,
  VivaSession, VivaSessionInsert, VivaSessionUpdate,
  Notification, NotificationInsert,
  StageTransition,
  ProgressReport,
  StudentWithRelations,
  PipelineStage,
  RequestStatus,
  CorrectionStatus,
  SeminarLevel,
} from "@/integrations/supabase/types";

// =====================================================
// ERROR HANDLING
// =====================================================

export class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: string
  ) {
    super(message);
    this.name = "DatabaseError";
  }
}

function handleError(error: unknown, operation: string): never {
  console.error(`Database error in ${operation}:`, error);
  if (error && typeof error === "object" && "message" in error) {
    throw new DatabaseError(
      (error as { message: string }).message,
      (error as { code?: string }).code,
      (error as { details?: string }).details
    );
  }
  throw new DatabaseError(`Unknown error in ${operation}`);
}

// =====================================================
// SCHOOLS SERVICE
// =====================================================

export const schoolsService = {
  async getAll(): Promise<School[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from("schools")
      .select("*")
      .order("name");
    if (error) handleError(error, "schoolsService.getAll");
    return data || [];
  },

  async getById(id: string): Promise<School | null> {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase
      .from("schools")
      .select("*")
      .eq("id", id)
      .single();
    if (error && error.code !== "PGRST116") handleError(error, "schoolsService.getById");
    return data;
  },

  async create(school: SchoolInsert): Promise<School> {
    if (!isSupabaseConfigured) throw new DatabaseError("Supabase not configured");
    const { data, error } = await supabase
      .from("schools")
      .insert(school)
      .select()
      .single();
    if (error) handleError(error, "schoolsService.create");
    return data!;
  },

  async update(id: string, updates: SchoolUpdate): Promise<School> {
    if (!isSupabaseConfigured) throw new DatabaseError("Supabase not configured");
    const { data, error } = await supabase
      .from("schools")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) handleError(error, "schoolsService.update");
    return data!;
  },

  async delete(id: string): Promise<void> {
    if (!isSupabaseConfigured) throw new DatabaseError("Supabase not configured");
    const { error } = await supabase.from("schools").delete().eq("id", id);
    if (error) handleError(error, "schoolsService.delete");
  },
};

// =====================================================
// DEPARTMENTS SERVICE
// =====================================================

export const departmentsService = {
  async getAll(): Promise<Department[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from("departments")
      .select("*, school:schools(*)")
      .order("name");
    if (error) handleError(error, "departmentsService.getAll");
    return data || [];
  },

  async getBySchool(schoolId: string): Promise<Department[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from("departments")
      .select("*")
      .eq("school_id", schoolId)
      .order("name");
    if (error) handleError(error, "departmentsService.getBySchool");
    return data || [];
  },

  async getById(id: string): Promise<Department | null> {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase
      .from("departments")
      .select("*, school:schools(*)")
      .eq("id", id)
      .single();
    if (error && error.code !== "PGRST116") handleError(error, "departmentsService.getById");
    return data;
  },

  async create(department: DepartmentInsert): Promise<Department> {
    if (!isSupabaseConfigured) throw new DatabaseError("Supabase not configured");
    const { data, error } = await supabase
      .from("departments")
      .insert(department)
      .select()
      .single();
    if (error) handleError(error, "departmentsService.create");
    return data!;
  },

  async update(id: string, updates: DepartmentUpdate): Promise<Department> {
    if (!isSupabaseConfigured) throw new DatabaseError("Supabase not configured");
    const { data, error } = await supabase
      .from("departments")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) handleError(error, "departmentsService.update");
    return data!;
  },

  async delete(id: string): Promise<void> {
    if (!isSupabaseConfigured) throw new DatabaseError("Supabase not configured");
    const { error } = await supabase.from("departments").delete().eq("id", id);
    if (error) handleError(error, "departmentsService.delete");
  },
};

// =====================================================
// PROGRAMMES SERVICE
// =====================================================

export const programmesService = {
  async getAll(): Promise<Programme[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from("programmes")
      .select("*, department:departments(*, school:schools(*))")
      .order("name");
    if (error) handleError(error, "programmesService.getAll");
    return data || [];
  },

  async getByDepartment(departmentId: string): Promise<Programme[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from("programmes")
      .select("*")
      .eq("department_id", departmentId)
      .order("name");
    if (error) handleError(error, "programmesService.getByDepartment");
    return data || [];
  },

  async getById(id: string): Promise<Programme | null> {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase
      .from("programmes")
      .select("*, department:departments(*, school:schools(*))")
      .eq("id", id)
      .single();
    if (error && error.code !== "PGRST116") handleError(error, "programmesService.getById");
    return data;
  },

  async create(programme: ProgrammeInsert): Promise<Programme> {
    if (!isSupabaseConfigured) throw new DatabaseError("Supabase not configured");
    const { data, error } = await supabase
      .from("programmes")
      .insert(programme)
      .select()
      .single();
    if (error) handleError(error, "programmesService.create");
    return data!;
  },

  async update(id: string, updates: ProgrammeUpdate): Promise<Programme> {
    if (!isSupabaseConfigured) throw new DatabaseError("Supabase not configured");
    const { data, error } = await supabase
      .from("programmes")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) handleError(error, "programmesService.update");
    return data!;
  },

  async delete(id: string): Promise<void> {
    if (!isSupabaseConfigured) throw new DatabaseError("Supabase not configured");
    const { error } = await supabase.from("programmes").delete().eq("id", id);
    if (error) handleError(error, "programmesService.delete");
  },
};

// =====================================================
// USERS SERVICE
// =====================================================

export const usersService = {
  async getAll(): Promise<User[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from("users")
      .select("*, department:departments(*)")
      .order("last_name");
    if (error) handleError(error, "usersService.getAll");
    return data || [];
  },

  async getById(id: string): Promise<User | null> {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase
      .from("users")
      .select("*, department:departments(*, school:schools(*))")
      .eq("id", id)
      .single();
    if (error && error.code !== "PGRST116") handleError(error, "usersService.getById");
    return data;
  },

  async getByRole(role: string): Promise<User[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from("users")
      .select("*, department:departments(*)")
      .eq("role", role)
      .order("last_name");
    if (error) handleError(error, "usersService.getByRole");
    return data || [];
  },

  async getSupervisors(): Promise<User[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from("users")
      .select("*, department:departments(*)")
      .in("role", ["SUPERVISOR", "DEPT_COORDINATOR", "SCHOOL_COORDINATOR", "PG_DEAN"])
      .order("last_name");
    if (error) handleError(error, "usersService.getSupervisors");
    return data || [];
  },

  async getExaminers(): Promise<User[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from("users")
      .select("*, department:departments(*)")
      .eq("is_examiner", true)
      .order("last_name");
    if (error) handleError(error, "usersService.getExaminers");
    return data || [];
  },

  async update(id: string, updates: UserUpdate): Promise<User> {
    if (!isSupabaseConfigured) throw new DatabaseError("Supabase not configured");
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) handleError(error, "usersService.update");
    return data!;
  },
};

// =====================================================
// STUDENTS SERVICE
// =====================================================

export const studentsService = {
  async getAll(): Promise<StudentWithRelations[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from("students")
      .select(`
        *,
        user:users(*),
        programme:programmes(*, department:departments(*, school:schools(*))),
        supervisor:users!students_supervisor_id_fkey(*),
        co_supervisor:users!students_co_supervisor_id_fkey(*)
      `)
      .order("created_at", { ascending: false });
    if (error) handleError(error, "studentsService.getAll");
    return (data || []) as StudentWithRelations[];
  },

  async getById(id: string): Promise<StudentWithRelations | null> {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase
      .from("students")
      .select(`
        *,
        user:users(*),
        programme:programmes(*, department:departments(*, school:schools(*))),
        supervisor:users!students_supervisor_id_fkey(*),
        co_supervisor:users!students_co_supervisor_id_fkey(*)
      `)
      .eq("id", id)
      .single();
    if (error && error.code !== "PGRST116") handleError(error, "studentsService.getById");
    return data as StudentWithRelations | null;
  },

  async getByUserId(userId: string): Promise<StudentWithRelations | null> {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase
      .from("students")
      .select(`
        *,
        user:users(*),
        programme:programmes(*, department:departments(*, school:schools(*))),
        supervisor:users!students_supervisor_id_fkey(*),
        co_supervisor:users!students_co_supervisor_id_fkey(*)
      `)
      .eq("user_id", userId)
      .single();
    if (error && error.code !== "PGRST116") handleError(error, "studentsService.getByUserId");
    return data as StudentWithRelations | null;
  },

  async getBySupervisor(supervisorId: string): Promise<StudentWithRelations[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from("students")
      .select(`
        *,
        user:users(*),
        programme:programmes(*, department:departments(*, school:schools(*))),
        supervisor:users!students_supervisor_id_fkey(*),
        co_supervisor:users!students_co_supervisor_id_fkey(*)
      `)
      .or(`supervisor_id.eq.${supervisorId},co_supervisor_id.eq.${supervisorId}`)
      .order("created_at", { ascending: false });
    if (error) handleError(error, "studentsService.getBySupervisor");
    return (data || []) as StudentWithRelations[];
  },

  async getByStage(stage: PipelineStage): Promise<StudentWithRelations[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from("students")
      .select(`
        *,
        user:users(*),
        programme:programmes(*, department:departments(*, school:schools(*))),
        supervisor:users!students_supervisor_id_fkey(*),
        co_supervisor:users!students_co_supervisor_id_fkey(*)
      `)
      .eq("current_stage", stage)
      .order("created_at", { ascending: false });
    if (error) handleError(error, "studentsService.getByStage");
    return (data || []) as StudentWithRelations[];
  },

  async getByDepartment(departmentId: string): Promise<StudentWithRelations[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from("students")
      .select(`
        *,
        user:users(*),
        programme:programmes!inner(*, department:departments!inner(*, school:schools(*))),
        supervisor:users!students_supervisor_id_fkey(*),
        co_supervisor:users!students_co_supervisor_id_fkey(*)
      `)
      .eq("programme.department_id", departmentId)
      .order("created_at", { ascending: false });
    if (error) handleError(error, "studentsService.getByDepartment");
    return (data || []) as StudentWithRelations[];
  },

  async create(student: StudentInsert): Promise<Student> {
    if (!isSupabaseConfigured) throw new DatabaseError("Supabase not configured");
    const { data, error } = await supabase
      .from("students")
      .insert(student)
      .select()
      .single();
    if (error) handleError(error, "studentsService.create");
    return data!;
  },

  async update(id: string, updates: StudentUpdate): Promise<Student> {
    if (!isSupabaseConfigured) throw new DatabaseError("Supabase not configured");
    const { data, error } = await supabase
      .from("students")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) handleError(error, "studentsService.update");
    return data!;
  },

  async updateStage(
    studentId: string,
    newStage: PipelineStage,
    transitionedBy: string,
    reason?: string
  ): Promise<Student> {
    if (!isSupabaseConfigured) throw new DatabaseError("Supabase not configured");

    // Get current stage
    const { data: student, error: fetchError } = await supabase
      .from("students")
      .select("current_stage")
      .eq("id", studentId)
      .single();
    if (fetchError) handleError(fetchError, "studentsService.updateStage.fetch");

    const fromStage = student?.current_stage;

    // Update student stage
    const { data, error } = await supabase
      .from("students")
      .update({ current_stage: newStage })
      .eq("id", studentId)
      .select()
      .single();
    if (error) handleError(error, "studentsService.updateStage.update");

    // Record transition
    await supabase.from("stage_transitions").insert({
      student_id: studentId,
      from_stage: fromStage,
      to_stage: newStage,
      transitioned_by: transitionedBy,
      reason,
    });

    return data!;
  },

  async delete(id: string): Promise<void> {
    if (!isSupabaseConfigured) throw new DatabaseError("Supabase not configured");
    const { error } = await supabase.from("students").delete().eq("id", id);
    if (error) handleError(error, "studentsService.delete");
  },
};

// =====================================================
// THESIS SUBMISSIONS SERVICE
// =====================================================

export const thesisService = {
  async getByStudent(studentId: string): Promise<ThesisSubmission[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from("thesis_submissions")
      .select("*")
      .eq("student_id", studentId)
      .order("version_number", { ascending: false });
    if (error) handleError(error, "thesisService.getByStudent");
    return data || [];
  },

  async getLatest(studentId: string): Promise<ThesisSubmission | null> {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase
      .from("thesis_submissions")
      .select("*")
      .eq("student_id", studentId)
      .order("version_number", { ascending: false })
      .limit(1)
      .single();
    if (error && error.code !== "PGRST116") handleError(error, "thesisService.getLatest");
    return data;
  },

  async create(submission: ThesisSubmissionInsert): Promise<ThesisSubmission> {
    if (!isSupabaseConfigured) throw new DatabaseError("Supabase not configured");
    
    // Get next version number
    const { data: latest } = await supabase
      .from("thesis_submissions")
      .select("version_number")
      .eq("student_id", submission.student_id)
      .order("version_number", { ascending: false })
      .limit(1)
      .single();

    const nextVersion = (latest?.version_number || 0) + 1;

    const { data, error } = await supabase
      .from("thesis_submissions")
      .insert({ ...submission, version_number: nextVersion })
      .select()
      .single();
    if (error) handleError(error, "thesisService.create");
    return data!;
  },

  async uploadFile(
    userId: string,
    file: File
  ): Promise<{ path: string; url: string }> {
    if (!isSupabaseConfigured) throw new DatabaseError("Supabase not configured");

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error } = await supabase.storage
      .from("thesis-documents")
      .upload(filePath, file);
    if (error) handleError(error, "thesisService.uploadFile");

    const { data: urlData } = supabase.storage
      .from("thesis-documents")
      .getPublicUrl(filePath);

    return { path: filePath, url: urlData.publicUrl };
  },
};

// =====================================================
// SEMINAR BOOKINGS SERVICE
// =====================================================

export const seminarBookingsService = {
  async getAll(): Promise<SeminarBooking[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from("seminar_bookings")
      .select(`
        *,
        student:students(*, user:users(*), programme:programmes(*))
      `)
      .order("requested_date", { ascending: false });
    if (error) handleError(error, "seminarBookingsService.getAll");
    return data || [];
  },

  async getByStudent(studentId: string): Promise<SeminarBooking[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from("seminar_bookings")
      .select("*")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });
    if (error) handleError(error, "seminarBookingsService.getByStudent");
    return data || [];
  },

  async getByStatus(status: RequestStatus): Promise<SeminarBooking[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from("seminar_bookings")
      .select(`
        *,
        student:students(*, user:users(*), programme:programmes(*))
      `)
      .eq("status", status)
      .order("requested_date");
    if (error) handleError(error, "seminarBookingsService.getByStatus");
    return data || [];
  },

  async getPending(level?: SeminarLevel): Promise<SeminarBooking[]> {
    if (!isSupabaseConfigured) return [];
    let query = supabase
      .from("seminar_bookings")
      .select(`
        *,
        student:students(*, user:users(*), programme:programmes(*))
      `)
      .eq("status", "PENDING");
    
    if (level) query = query.eq("seminar_level", level);
    
    const { data, error } = await query.order("requested_date");
    if (error) handleError(error, "seminarBookingsService.getPending");
    return data || [];
  },

  async create(booking: SeminarBookingInsert): Promise<SeminarBooking> {
    if (!isSupabaseConfigured) throw new DatabaseError("Supabase not configured");
    const { data, error } = await supabase
      .from("seminar_bookings")
      .insert(booking)
      .select()
      .single();
    if (error) handleError(error, "seminarBookingsService.create");
    return data!;
  },

  async approve(
    id: string,
    approvedBy: string,
    approvedDate: string,
    venue?: string
  ): Promise<SeminarBooking> {
    if (!isSupabaseConfigured) throw new DatabaseError("Supabase not configured");
    const { data, error } = await supabase
      .from("seminar_bookings")
      .update({
        status: "APPROVED" as RequestStatus,
        approved_by: approvedBy,
        approved_date: approvedDate,
        venue,
      })
      .eq("id", id)
      .select()
      .single();
    if (error) handleError(error, "seminarBookingsService.approve");
    return data!;
  },

  async reject(id: string, approvedBy: string, notes?: string): Promise<SeminarBooking> {
    if (!isSupabaseConfigured) throw new DatabaseError("Supabase not configured");
    const { data, error } = await supabase
      .from("seminar_bookings")
      .update({
        status: "REJECTED" as RequestStatus,
        approved_by: approvedBy,
        notes,
      })
      .eq("id", id)
      .select()
      .single();
    if (error) handleError(error, "seminarBookingsService.reject");
    return data!;
  },
};

// =====================================================
// CORRECTIONS SERVICE
// =====================================================

export const correctionsService = {
  async getByStudent(studentId: string): Promise<Correction[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from("corrections")
      .select(`
        *,
        assigned_by_user:users!corrections_assigned_by_fkey(*),
        verified_by_user:users!corrections_verified_by_fkey(*)
      `)
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });
    if (error) handleError(error, "correctionsService.getByStudent");
    return data || [];
  },

  async getPending(studentId: string): Promise<Correction[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from("corrections")
      .select("*")
      .eq("student_id", studentId)
      .in("status", ["PENDING", "IN_PROGRESS", "SUBMITTED"])
      .order("priority")
      .order("created_at");
    if (error) handleError(error, "correctionsService.getPending");
    return data || [];
  },

  async create(correction: CorrectionInsert): Promise<Correction> {
    if (!isSupabaseConfigured) throw new DatabaseError("Supabase not configured");
    const { data, error } = await supabase
      .from("corrections")
      .insert(correction)
      .select()
      .single();
    if (error) handleError(error, "correctionsService.create");
    return data!;
  },

  async updateStatus(
    id: string,
    status: CorrectionStatus,
    evidenceUrl?: string,
    evidenceNotes?: string
  ): Promise<Correction> {
    if (!isSupabaseConfigured) throw new DatabaseError("Supabase not configured");
    const { data, error } = await supabase
      .from("corrections")
      .update({ status, evidence_url: evidenceUrl, evidence_notes: evidenceNotes })
      .eq("id", id)
      .select()
      .single();
    if (error) handleError(error, "correctionsService.updateStatus");
    return data!;
  },

  async verify(id: string, verifiedBy: string): Promise<Correction> {
    if (!isSupabaseConfigured) throw new DatabaseError("Supabase not configured");
    const { data, error } = await supabase
      .from("corrections")
      .update({
        status: "VERIFIED" as CorrectionStatus,
        verified_by: verifiedBy,
        verified_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();
    if (error) handleError(error, "correctionsService.verify");
    return data!;
  },
};

// =====================================================
// NOTIFICATIONS SERVICE
// =====================================================

export const notificationsService = {
  async getByUser(userId: string): Promise<Notification[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) handleError(error, "notificationsService.getByUser");
    return data || [];
  },

  async getUnread(userId: string): Promise<Notification[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .eq("is_read", false)
      .order("created_at", { ascending: false });
    if (error) handleError(error, "notificationsService.getUnread");
    return data || [];
  },

  async create(notification: NotificationInsert): Promise<Notification> {
    if (!isSupabaseConfigured) throw new DatabaseError("Supabase not configured");
    const { data, error } = await supabase
      .from("notifications")
      .insert(notification)
      .select()
      .single();
    if (error) handleError(error, "notificationsService.create");
    return data!;
  },

  async markAsRead(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);
    if (error) handleError(error, "notificationsService.markAsRead");
  },

  async markAllAsRead(userId: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);
    if (error) handleError(error, "notificationsService.markAllAsRead");
  },
};

// =====================================================
// STAGE TRANSITIONS SERVICE
// =====================================================

export const transitionsService = {
  async getByStudent(studentId: string): Promise<StageTransition[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from("stage_transitions")
      .select(`
        *,
        transitioned_by_user:users!stage_transitions_transitioned_by_fkey(*)
      `)
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });
    if (error) handleError(error, "transitionsService.getByStudent");
    return data || [];
  },
};

// =====================================================
// VIVA SESSIONS SERVICE
// =====================================================

export const vivaService = {
  async getByStudent(studentId: string): Promise<VivaSession[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from("viva_sessions")
      .select(`
        *,
        chair:users!viva_sessions_chair_id_fkey(*),
        panel_members:viva_panel_members(*, member:users(*))
      `)
      .eq("student_id", studentId)
      .order("scheduled_date", { ascending: false });
    if (error) handleError(error, "vivaService.getByStudent");
    return data || [];
  },

  async create(viva: VivaSessionInsert): Promise<VivaSession> {
    if (!isSupabaseConfigured) throw new DatabaseError("Supabase not configured");
    const { data, error } = await supabase
      .from("viva_sessions")
      .insert(viva)
      .select()
      .single();
    if (error) handleError(error, "vivaService.create");
    return data!;
  },

  async update(id: string, updates: VivaSessionUpdate): Promise<VivaSession> {
    if (!isSupabaseConfigured) throw new DatabaseError("Supabase not configured");
    const { data, error } = await supabase
      .from("viva_sessions")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) handleError(error, "vivaService.update");
    return data!;
  },
};

// =====================================================
// EXAMINER ASSIGNMENTS SERVICE
// =====================================================

export const examinerService = {
  async getByStudent(studentId: string): Promise<ExaminerAssignment[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from("examiner_assignments")
      .select(`
        *,
        examiner:users!examiner_assignments_examiner_id_fkey(*),
        assigned_by_user:users!examiner_assignments_assigned_by_fkey(*)
      `)
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });
    if (error) handleError(error, "examinerService.getByStudent");
    return data || [];
  },

  async assign(assignment: ExaminerAssignmentInsert): Promise<ExaminerAssignment> {
    if (!isSupabaseConfigured) throw new DatabaseError("Supabase not configured");
    const { data, error } = await supabase
      .from("examiner_assignments")
      .insert(assignment)
      .select()
      .single();
    if (error) handleError(error, "examinerService.assign");
    return data!;
  },

  async getReportsByStudent(studentId: string): Promise<ExaminerReport[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from("examiner_reports")
      .select(`
        *,
        examiner:users!examiner_reports_examiner_id_fkey(*)
      `)
      .eq("student_id", studentId)
      .order("submitted_at", { ascending: false });
    if (error) handleError(error, "examinerService.getReportsByStudent");
    return data || [];
  },
};

// =====================================================
// PROGRESS REPORTS SERVICE
// =====================================================

export const progressReportsService = {
  async getByStudent(studentId: string): Promise<ProgressReport[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from("progress_reports")
      .select("*")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false });
    if (error) handleError(error, "progressReportsService.getByStudent");
    return data || [];
  },

  async create(report: Partial<ProgressReport> & { student_id: string; report_period: string }): Promise<ProgressReport> {
    if (!isSupabaseConfigured) throw new DatabaseError("Supabase not configured");
    const { data, error } = await supabase
      .from("progress_reports")
      .insert(report)
      .select()
      .single();
    if (error) handleError(error, "progressReportsService.create");
    return data!;
  },
};

// =====================================================
// ACTIVITY LOGS SERVICE
// =====================================================

export const activityLogsService = {
  async log(
    userId: string | null,
    action: string,
    entityType?: string,
    entityId?: string,
    details?: Record<string, unknown>
  ): Promise<void> {
    if (!isSupabaseConfigured) return;
    await supabase.from("activity_logs").insert({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details: details || {},
    });
  },

  async getRecent(limit = 100): Promise<unknown[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from("activity_logs")
      .select(`
        *,
        user:users(first_name, last_name, email)
      `)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) handleError(error, "activityLogsService.getRecent");
    return data || [];
  },
};
