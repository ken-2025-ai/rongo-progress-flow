export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// =====================================================
// ENUM TYPES
// =====================================================

export type UserRole = 
  | 'STUDENT'
  | 'SUPERVISOR'
  | 'DEPT_COORDINATOR'
  | 'SCHOOL_COORDINATOR'
  | 'PG_DEAN'
  | 'EXAMINER'
  | 'SUPER_ADMIN'

export type PipelineStage =
  | 'DEPT_SEMINAR_PENDING'
  | 'DEPT_SEMINAR_BOOKED'
  | 'DEPT_SEMINAR_COMPLETED'
  | 'SCHOOL_SEMINAR_PENDING'
  | 'SCHOOL_SEMINAR_BOOKED'
  | 'SCHOOL_SEMINAR_COMPLETED'
  | 'THESIS_READINESS_CHECK'
  | 'PG_EXAMINATION'
  | 'AWAITING_EXAMINER_REPORT'
  | 'VIVA_SCHEDULED'
  | 'CORRECTIONS'
  | 'COMPLETED'

export type SeminarLevel = 'DEPT_SEMINAR' | 'SCHOOL_SEMINAR'

export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'

export type CorrectionStatus = 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED'

export type EvaluationOutcome = 
  | 'PASS'
  | 'PASS_WITH_MINOR_CORRECTIONS'
  | 'PASS_WITH_MAJOR_CORRECTIONS'
  | 'RESUBMIT'
  | 'FAIL'

export type StudyLevel = 'MASTERS' | 'PHD'

// =====================================================
// DATABASE TYPE DEFINITIONS
// =====================================================

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {

        }
        Relationships: [
          {
            foreignKeyName: "departments_school_id_fkey"
            columns: ["school_id"]

            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {

        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
<
        Returns: boolean
      }
    }
    Enums: {

    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// =====================================================
// TYPE HELPERS
// =====================================================

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

// =====================================================
// CONVENIENCE TYPE ALIASES
// =====================================================

export type School = Tables<'schools'>
export type Department = Tables<'departments'>
export type Programme = Tables<'programmes'>
export type User = Tables<'users'>
export type Student = Tables<'students'>
export type ThesisSubmission = Tables<'thesis_submissions'>
export type SeminarBooking = Tables<'seminar_bookings'>
export type SeminarSession = Tables<'seminar_sessions'>
export type SeminarPanelMember = Tables<'seminar_panel_members'>
export type Correction = Tables<'corrections'>
export type SubmissionFeedback = Tables<'submission_feedback'>
export type ExaminerAssignment = Tables<'examiner_assignments'>
export type ExaminerReport = Tables<'examiner_reports'>
export type VivaSession = Tables<'viva_sessions'>
export type VivaPanelMember = Tables<'viva_panel_members'>
export type ProgressReport = Tables<'progress_reports'>
export type StageTransition = Tables<'stage_transitions'>
export type Notification = Tables<'notifications'>
export type ActivityLog = Tables<'activity_logs'>

// Insert types
export type SchoolInsert = TablesInsert<'schools'>
export type DepartmentInsert = TablesInsert<'departments'>
export type ProgrammeInsert = TablesInsert<'programmes'>
export type UserInsert = TablesInsert<'users'>
export type StudentInsert = TablesInsert<'students'>
export type ThesisSubmissionInsert = TablesInsert<'thesis_submissions'>
export type SeminarBookingInsert = TablesInsert<'seminar_bookings'>
export type SeminarSessionInsert = TablesInsert<'seminar_sessions'>
export type CorrectionInsert = TablesInsert<'corrections'>
export type ExaminerAssignmentInsert = TablesInsert<'examiner_assignments'>
export type VivaSessionInsert = TablesInsert<'viva_sessions'>
export type NotificationInsert = TablesInsert<'notifications'>

// Update types
export type SchoolUpdate = TablesUpdate<'schools'>
export type DepartmentUpdate = TablesUpdate<'departments'>
export type ProgrammeUpdate = TablesUpdate<'programmes'>
export type UserUpdate = TablesUpdate<'users'>
export type StudentUpdate = TablesUpdate<'students'>
export type SeminarBookingUpdate = TablesUpdate<'seminar_bookings'>
export type CorrectionUpdate = TablesUpdate<'corrections'>
export type VivaSessionUpdate = TablesUpdate<'viva_sessions'>

// =====================================================
// EXTENDED TYPES WITH RELATIONS
// =====================================================

export type StudentWithRelations = Student & {
  user?: User
  programme?: Programme & {
    department?: Department & {
      school?: School
    }
  }
  supervisor?: User
  co_supervisor?: User
}

export type DepartmentWithSchool = Department & {
  school?: School
}

export type ProgrammeWithDepartment = Programme & {
  department?: DepartmentWithSchool
}

export type SeminarBookingWithStudent = SeminarBooking & {
  student?: StudentWithRelations
  approved_by_user?: User
}

export type CorrectionWithRelations = Correction & {
  student?: StudentWithRelations
  assigned_by_user?: User
  verified_by_user?: User
}

export type VivaSessionWithRelations = VivaSession & {
  student?: StudentWithRelations
  chair?: User
  panel_members?: (VivaPanelMember & { member?: User })[]
}

export const Constants = {
  public: {
    Enums: {

    },
  },
} as const
