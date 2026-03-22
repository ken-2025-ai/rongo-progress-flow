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
      schools: {
        Row: {
          id: string
          name: string
          code: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      departments: {
        Row: {
          id: string
          school_id: string
          name: string
          code: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          school_id: string
          name: string
          code?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          school_id?: string
          name?: string
          code?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_school_id_fkey"
            columns: ["school_id"]
            referencedRelation: "schools"
            referencedColumns: ["id"]
          }
        ]
      }
      programmes: {
        Row: {
          id: string
          department_id: string
          name: string
          code: string
          level: StudyLevel
          duration_years: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          department_id: string
          name: string
          code: string
          level?: StudyLevel
          duration_years?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          department_id?: string
          name?: string
          code?: string
          level?: StudyLevel
          duration_years?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "programmes_department_id_fkey"
            columns: ["department_id"]
            referencedRelation: "departments"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          id: string
          email: string | null
          first_name: string | null
          last_name: string | null
          phone: string | null
          avatar_url: string | null
          role: UserRole
          department_id: string | null
          staff_id: string | null
          is_examiner: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: UserRole
          department_id?: string | null
          staff_id?: string | null
          is_examiner?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: UserRole
          department_id?: string | null
          staff_id?: string | null
          is_examiner?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_department_id_fkey"
            columns: ["department_id"]
            referencedRelation: "departments"
            referencedColumns: ["id"]
          }
        ]
      }
      students: {
        Row: {
          id: string
          user_id: string
          registration_number: string
          programme_id: string
          supervisor_id: string | null
          co_supervisor_id: string | null
          research_title: string | null
          current_stage: PipelineStage
          intake_year: number
          expected_completion: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          registration_number: string
          programme_id: string
          supervisor_id?: string | null
          co_supervisor_id?: string | null
          research_title?: string | null
          current_stage?: PipelineStage
          intake_year?: number
          expected_completion?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          registration_number?: string
          programme_id?: string
          supervisor_id?: string | null
          co_supervisor_id?: string | null
          research_title?: string | null
          current_stage?: PipelineStage
          intake_year?: number
          expected_completion?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_programme_id_fkey"
            columns: ["programme_id"]
            referencedRelation: "programmes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_supervisor_id_fkey"
            columns: ["supervisor_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_co_supervisor_id_fkey"
            columns: ["co_supervisor_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      thesis_submissions: {
        Row: {
          id: string
          student_id: string
          version_number: number
          file_url: string
          file_name: string | null
          file_size_bytes: number | null
          file_checksum: string | null
          submission_type: string
          submitted_by: string | null
          locked_for_exam: boolean
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          version_number?: number
          file_url: string
          file_name?: string | null
          file_size_bytes?: number | null
          file_checksum?: string | null
          submission_type?: string
          submitted_by?: string | null
          locked_for_exam?: boolean
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          version_number?: number
          file_url?: string
          file_name?: string | null
          file_size_bytes?: number | null
          file_checksum?: string | null
          submission_type?: string
          submitted_by?: string | null
          locked_for_exam?: boolean
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "thesis_submissions_student_id_fkey"
            columns: ["student_id"]
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "thesis_submissions_submitted_by_fkey"
            columns: ["submitted_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      seminar_bookings: {
        Row: {
          id: string
          student_id: string
          seminar_level: SeminarLevel
          requested_date: string
          approved_date: string | null
          venue: string | null
          time_slot: string
          status: RequestStatus
          notes: string | null
          approved_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          seminar_level: SeminarLevel
          requested_date: string
          approved_date?: string | null
          venue?: string | null
          time_slot?: string
          status?: RequestStatus
          notes?: string | null
          approved_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          seminar_level?: SeminarLevel
          requested_date?: string
          approved_date?: string | null
          venue?: string | null
          time_slot?: string
          status?: RequestStatus
          notes?: string | null
          approved_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seminar_bookings_student_id_fkey"
            columns: ["student_id"]
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seminar_bookings_approved_by_fkey"
            columns: ["approved_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      seminar_sessions: {
        Row: {
          id: string
          booking_id: string | null
          student_id: string
          seminar_level: SeminarLevel
          scheduled_date: string
          start_time: string
          end_time: string
          venue: string | null
          is_completed: boolean
          outcome: EvaluationOutcome | null
          outcome_notes: string | null
          recorded_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_id?: string | null
          student_id: string
          seminar_level: SeminarLevel
          scheduled_date: string
          start_time?: string
          end_time?: string
          venue?: string | null
          is_completed?: boolean
          outcome?: EvaluationOutcome | null
          outcome_notes?: string | null
          recorded_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_id?: string | null
          student_id?: string
          seminar_level?: SeminarLevel
          scheduled_date?: string
          start_time?: string
          end_time?: string
          venue?: string | null
          is_completed?: boolean
          outcome?: EvaluationOutcome | null
          outcome_notes?: string | null
          recorded_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seminar_sessions_booking_id_fkey"
            columns: ["booking_id"]
            referencedRelation: "seminar_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seminar_sessions_student_id_fkey"
            columns: ["student_id"]
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seminar_sessions_recorded_by_fkey"
            columns: ["recorded_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      seminar_panel_members: {
        Row: {
          id: string
          session_id: string
          panelist_id: string
          role: string
          has_submitted_evaluation: boolean
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          panelist_id: string
          role?: string
          has_submitted_evaluation?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          panelist_id?: string
          role?: string
          has_submitted_evaluation?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seminar_panel_members_session_id_fkey"
            columns: ["session_id"]
            referencedRelation: "seminar_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seminar_panel_members_panelist_id_fkey"
            columns: ["panelist_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      corrections: {
        Row: {
          id: string
          student_id: string
          session_id: string | null
          viva_id: string | null
          assigned_by: string
          description: string
          priority: string
          status: CorrectionStatus
          evidence_url: string | null
          evidence_notes: string | null
          verified_by: string | null
          verified_at: string | null
          deadline: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          session_id?: string | null
          viva_id?: string | null
          assigned_by: string
          description: string
          priority?: string
          status?: CorrectionStatus
          evidence_url?: string | null
          evidence_notes?: string | null
          verified_by?: string | null
          verified_at?: string | null
          deadline?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          session_id?: string | null
          viva_id?: string | null
          assigned_by?: string
          description?: string
          priority?: string
          status?: CorrectionStatus
          evidence_url?: string | null
          evidence_notes?: string | null
          verified_by?: string | null
          verified_at?: string | null
          deadline?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "corrections_student_id_fkey"
            columns: ["student_id"]
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "corrections_session_id_fkey"
            columns: ["session_id"]
            referencedRelation: "seminar_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "corrections_assigned_by_fkey"
            columns: ["assigned_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "corrections_verified_by_fkey"
            columns: ["verified_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      submission_feedback: {
        Row: {
          id: string
          submission_id: string
          reviewer_id: string
          feedback_type: string
          content: string
          is_approved: boolean
          created_at: string
        }
        Insert: {
          id?: string
          submission_id: string
          reviewer_id: string
          feedback_type?: string
          content: string
          is_approved?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          submission_id?: string
          reviewer_id?: string
          feedback_type?: string
          content?: string
          is_approved?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "submission_feedback_submission_id_fkey"
            columns: ["submission_id"]
            referencedRelation: "thesis_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submission_feedback_reviewer_id_fkey"
            columns: ["reviewer_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      examiner_assignments: {
        Row: {
          id: string
          student_id: string
          examiner_id: string
          examiner_type: string
          institution: string | null
          assigned_by: string
          assigned_at: string
          accepted_at: string | null
          declined_at: string | null
          decline_reason: string | null
          status: RequestStatus
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          examiner_id: string
          examiner_type: string
          institution?: string | null
          assigned_by: string
          assigned_at?: string
          accepted_at?: string | null
          declined_at?: string | null
          decline_reason?: string | null
          status?: RequestStatus
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          examiner_id?: string
          examiner_type?: string
          institution?: string | null
          assigned_by?: string
          assigned_at?: string
          accepted_at?: string | null
          declined_at?: string | null
          decline_reason?: string | null
          status?: RequestStatus
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "examiner_assignments_student_id_fkey"
            columns: ["student_id"]
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "examiner_assignments_examiner_id_fkey"
            columns: ["examiner_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "examiner_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      examiner_reports: {
        Row: {
          id: string
          assignment_id: string
          student_id: string
          examiner_id: string
          report_file_url: string | null
          recommendation: EvaluationOutcome | null
          summary: string | null
          strengths: string | null
          weaknesses: string | null
          specific_corrections: string | null
          submitted_at: string
          created_at: string
        }
        Insert: {
          id?: string
          assignment_id: string
          student_id: string
          examiner_id: string
          report_file_url?: string | null
          recommendation?: EvaluationOutcome | null
          summary?: string | null
          strengths?: string | null
          weaknesses?: string | null
          specific_corrections?: string | null
          submitted_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          assignment_id?: string
          student_id?: string
          examiner_id?: string
          report_file_url?: string | null
          recommendation?: EvaluationOutcome | null
          summary?: string | null
          strengths?: string | null
          weaknesses?: string | null
          specific_corrections?: string | null
          submitted_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "examiner_reports_assignment_id_fkey"
            columns: ["assignment_id"]
            referencedRelation: "examiner_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "examiner_reports_student_id_fkey"
            columns: ["student_id"]
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "examiner_reports_examiner_id_fkey"
            columns: ["examiner_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      viva_sessions: {
        Row: {
          id: string
          student_id: string
          scheduled_date: string
          start_time: string
          end_time: string | null
          venue: string | null
          is_virtual: boolean
          meeting_link: string | null
          status: string
          outcome: EvaluationOutcome | null
          outcome_notes: string | null
          final_recommendation: string | null
          chair_id: string | null
          scheduled_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          scheduled_date: string
          start_time?: string
          end_time?: string | null
          venue?: string | null
          is_virtual?: boolean
          meeting_link?: string | null
          status?: string
          outcome?: EvaluationOutcome | null
          outcome_notes?: string | null
          final_recommendation?: string | null
          chair_id?: string | null
          scheduled_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          scheduled_date?: string
          start_time?: string
          end_time?: string | null
          venue?: string | null
          is_virtual?: boolean
          meeting_link?: string | null
          status?: string
          outcome?: EvaluationOutcome | null
          outcome_notes?: string | null
          final_recommendation?: string | null
          chair_id?: string | null
          scheduled_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "viva_sessions_student_id_fkey"
            columns: ["student_id"]
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viva_sessions_chair_id_fkey"
            columns: ["chair_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viva_sessions_scheduled_by_fkey"
            columns: ["scheduled_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      viva_panel_members: {
        Row: {
          id: string
          viva_id: string
          member_id: string
          role: string
          evaluation_submitted: boolean
          created_at: string
        }
        Insert: {
          id?: string
          viva_id: string
          member_id: string
          role?: string
          evaluation_submitted?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          viva_id?: string
          member_id?: string
          role?: string
          evaluation_submitted?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "viva_panel_members_viva_id_fkey"
            columns: ["viva_id"]
            referencedRelation: "viva_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viva_panel_members_member_id_fkey"
            columns: ["member_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      progress_reports: {
        Row: {
          id: string
          student_id: string
          report_period: string
          file_url: string | null
          summary: string | null
          achievements: string | null
          challenges: string | null
          next_steps: string | null
          supervisor_comments: string | null
          supervisor_approved: boolean
          approved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          report_period: string
          file_url?: string | null
          summary?: string | null
          achievements?: string | null
          challenges?: string | null
          next_steps?: string | null
          supervisor_comments?: string | null
          supervisor_approved?: boolean
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          report_period?: string
          file_url?: string | null
          summary?: string | null
          achievements?: string | null
          challenges?: string | null
          next_steps?: string | null
          supervisor_comments?: string | null
          supervisor_approved?: boolean
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_reports_student_id_fkey"
            columns: ["student_id"]
            referencedRelation: "students"
            referencedColumns: ["id"]
          }
        ]
      }
      stage_transitions: {
        Row: {
          id: string
          student_id: string
          from_stage: PipelineStage | null
          to_stage: PipelineStage
          transitioned_by: string
          reason: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          from_stage?: PipelineStage | null
          to_stage: PipelineStage
          transitioned_by: string
          reason?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          from_stage?: PipelineStage | null
          to_stage?: PipelineStage
          transitioned_by?: string
          reason?: string | null
          metadata?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stage_transitions_student_id_fkey"
            columns: ["student_id"]
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stage_transitions_transitioned_by_fkey"
            columns: ["transitioned_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          link: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: string
          link?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          link?: string | null
          is_read?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          entity_type: string | null
          entity_id: string | null
          details: Json
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          entity_type?: string | null
          entity_id?: string | null
          details?: Json
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          entity_type?: string | null
          entity_id?: string | null
          details?: Json
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { user_id: string }
        Returns: UserRole
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_coordinator: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role: UserRole
      pipeline_stage: PipelineStage
      seminar_level: SeminarLevel
      request_status: RequestStatus
      correction_status: CorrectionStatus
      evaluation_outcome: EvaluationOutcome
      study_level: StudyLevel
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
      user_role: ['STUDENT', 'SUPERVISOR', 'DEPT_COORDINATOR', 'SCHOOL_COORDINATOR', 'PG_DEAN', 'EXAMINER', 'SUPER_ADMIN'] as const,
      pipeline_stage: ['DEPT_SEMINAR_PENDING', 'DEPT_SEMINAR_BOOKED', 'DEPT_SEMINAR_COMPLETED', 'SCHOOL_SEMINAR_PENDING', 'SCHOOL_SEMINAR_BOOKED', 'SCHOOL_SEMINAR_COMPLETED', 'THESIS_READINESS_CHECK', 'PG_EXAMINATION', 'AWAITING_EXAMINER_REPORT', 'VIVA_SCHEDULED', 'CORRECTIONS', 'COMPLETED'] as const,
      seminar_level: ['DEPT_SEMINAR', 'SCHOOL_SEMINAR'] as const,
      request_status: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'] as const,
      correction_status: ['PENDING', 'IN_PROGRESS', 'SUBMITTED', 'VERIFIED', 'REJECTED'] as const,
      evaluation_outcome: ['PASS', 'PASS_WITH_MINOR_CORRECTIONS', 'PASS_WITH_MAJOR_CORRECTIONS', 'RESUBMIT', 'FAIL'] as const,
      study_level: ['MASTERS', 'PHD'] as const,
    },
  },
} as const
