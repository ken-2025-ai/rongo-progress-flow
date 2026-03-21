export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      departments: {
        Row: {
          created_at: string | null
          id: string
          name: string
          school_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          school_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          school_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_initials: string
          created_at: string
          department: string | null
          full_name: string
          id: string
          updated_at: string
        }
        Insert: {
          avatar_initials?: string
          created_at?: string
          department?: string | null
          full_name?: string
          id: string
          updated_at?: string
        }
        Update: {
          avatar_initials?: string
          created_at?: string
          department?: string | null
          full_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      programmes: {
        Row: {
          code: string
          department_id: string
          id: string
          name: string
        }
        Insert: {
          code: string
          department_id: string
          id?: string
          name: string
        }
        Update: {
          code?: string
          department_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "programmes_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      progress_reports: {
        Row: {
          created_at: string | null
          file_url: string
          id: string
          quarter: string
          status: Database["public"]["Enums"]["status_code_type"] | null
          student_id: string
          synopsis: string | null
          year: string
        }
        Insert: {
          created_at?: string | null
          file_url: string
          id?: string
          quarter: string
          status?: Database["public"]["Enums"]["status_code_type"] | null
          student_id: string
          synopsis?: string | null
          year: string
        }
        Update: {
          created_at?: string | null
          file_url?: string
          id?: string
          quarter?: string
          status?: Database["public"]["Enums"]["status_code_type"] | null
          student_id?: string
          synopsis?: string | null
          year?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_reports_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      seminar_bookings: {
        Row: {
          approved_by: string | null
          approved_date: string | null
          created_at: string | null
          id: string
          panel_members: Json | null
          requested_date: string
          seminar_level: string
          status: Database["public"]["Enums"]["status_code_type"] | null
          student_id: string
          venue: string | null
        }
        Insert: {
          approved_by?: string | null
          approved_date?: string | null
          created_at?: string | null
          id?: string
          panel_members?: Json | null
          requested_date: string
          seminar_level: string
          status?: Database["public"]["Enums"]["status_code_type"] | null
          student_id: string
          venue?: string | null
        }
        Update: {
          approved_by?: string | null
          approved_date?: string | null
          created_at?: string | null
          id?: string
          panel_members?: Json | null
          requested_date?: string
          seminar_level?: string
          status?: Database["public"]["Enums"]["status_code_type"] | null
          student_id?: string
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seminar_bookings_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seminar_bookings_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_clearance_checklist: {
        Row: {
          dean_cleared: boolean | null
          department_cleared: boolean | null
          finance_cleared: boolean | null
          id: string
          student_id: string
          updated_at: string | null
        }
        Insert: {
          dean_cleared?: boolean | null
          department_cleared?: boolean | null
          finance_cleared?: boolean | null
          id?: string
          student_id: string
          updated_at?: string | null
        }
        Update: {
          dean_cleared?: boolean | null
          department_cleared?: boolean | null
          finance_cleared?: boolean | null
          id?: string
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_clearance_checklist_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_financial_node: {
        Row: {
          balance_remaining: number | null
          id: string
          is_cleared_for_exam: boolean | null
          student_id: string
        }
        Insert: {
          balance_remaining?: number | null
          id?: string
          is_cleared_for_exam?: boolean | null
          student_id: string
        }
        Update: {
          balance_remaining?: number | null
          id?: string
          is_cleared_for_exam?: boolean | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_financial_node_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_parent_contacts: {
        Row: {
          alt_phone_number: string | null
          created_at: string | null
          guardian_email: string | null
          guardian_name: string
          id: string
          phone_number: string
          physical_address: string | null
          relationship: string | null
          student_id: string
        }
        Insert: {
          alt_phone_number?: string | null
          created_at?: string | null
          guardian_email?: string | null
          guardian_name: string
          id?: string
          phone_number: string
          physical_address?: string | null
          relationship?: string | null
          student_id: string
        }
        Update: {
          alt_phone_number?: string | null
          created_at?: string | null
          guardian_email?: string | null
          guardian_name?: string
          id?: string
          phone_number?: string
          physical_address?: string | null
          relationship?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_parent_contacts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_stage_history: {
        Row: {
          changed_by: string | null
          created_at: string | null
          id: string
          notes: string | null
          stage_code: Database["public"]["Enums"]["stage_code_type"]
          status_code: Database["public"]["Enums"]["status_code_type"]
          student_id: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          stage_code: Database["public"]["Enums"]["stage_code_type"]
          status_code: Database["public"]["Enums"]["status_code_type"]
          student_id: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          stage_code?: Database["public"]["Enums"]["stage_code_type"]
          status_code?: Database["public"]["Enums"]["status_code_type"]
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_stage_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_stage_history_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          created_at: string | null
          current_stage: Database["public"]["Enums"]["stage_code_type"] | null
          id: string
          programme_id: string
          registration_number: string
          research_title: string | null
          supervisor_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_stage?: Database["public"]["Enums"]["stage_code_type"] | null
          id?: string
          programme_id: string
          registration_number: string
          research_title?: string | null
          supervisor_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_stage?: Database["public"]["Enums"]["stage_code_type"] | null
          id?: string
          programme_id?: string
          registration_number?: string
          research_title?: string | null
          supervisor_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_programme_id_fkey"
            columns: ["programme_id"]
            isOneToOne: false
            referencedRelation: "programmes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      thesis_submissions: {
        Row: {
          created_at: string | null
          file_name: string | null
          file_url: string
          id: string
          institutional_feedback: string | null
          locked_for_exam: boolean | null
          similarity_index: number | null
          status: Database["public"]["Enums"]["status_code_type"] | null
          student_id: string
          submission_level: string | null
          version_number: number
        }
        Insert: {
          created_at?: string | null
          file_name?: string | null
          file_url: string
          id?: string
          institutional_feedback?: string | null
          locked_for_exam?: boolean | null
          similarity_index?: number | null
          status?: Database["public"]["Enums"]["status_code_type"] | null
          student_id: string
          submission_level?: string | null
          version_number: number
        }
        Update: {
          created_at?: string | null
          file_name?: string | null
          file_url?: string
          id?: string
          institutional_feedback?: string | null
          locked_for_exam?: boolean | null
          similarity_index?: number | null
          status?: Database["public"]["Enums"]["status_code_type"] | null
          student_id?: string
          submission_level?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "thesis_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          department_id: string | null
          email: string
          first_name: string | null
          id: string
          is_active: boolean | null
          is_examiner: boolean | null
          last_name: string | null
          role: Database["public"]["Enums"]["role_type"]
          staff_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department_id?: string | null
          email: string
          first_name?: string | null
          id: string
          is_active?: boolean | null
          is_examiner?: boolean | null
          last_name?: string | null
          role?: Database["public"]["Enums"]["role_type"]
          staff_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department_id?: string | null
          email?: string
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          is_examiner?: boolean | null
          last_name?: string | null
          role?: Database["public"]["Enums"]["role_type"]
          staff_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      viva_voce_log: {
        Row: {
          created_at: string | null
          examiners_present: Json | null
          id: string
          outcome: string | null
          panel_chair_id: string | null
          report_file_url: string | null
          scheduled_date: string
          status: string | null
          student_id: string
          venue: string | null
        }
        Insert: {
          created_at?: string | null
          examiners_present?: Json | null
          id?: string
          outcome?: string | null
          panel_chair_id?: string | null
          report_file_url?: string | null
          scheduled_date: string
          status?: string | null
          student_id: string
          venue?: string | null
        }
        Update: {
          created_at?: string | null
          examiners_present?: Json | null
          id?: string
          outcome?: string | null
          panel_chair_id?: string | null
          report_file_url?: string | null
          scheduled_date?: string
          status?: string | null
          student_id?: string
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "viva_voce_log_panel_chair_id_fkey"
            columns: ["panel_chair_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viva_voce_log_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "student" | "supervisor" | "panel" | "admin" | "dean"
      role_type:
        | "STUDENT"
        | "SUPERVISOR"
        | "DEPT_COORDINATOR"
        | "SCHOOL_COORDINATOR"
        | "PG_DEAN"
        | "EXAMINER"
        | "SUPER_ADMIN"
      stage_code_type:
        | "DEPT_SEMINAR_PENDING"
        | "DEPT_SEMINAR_COMPLETED"
        | "SCHOOL_SEMINAR_PENDING"
        | "SCHOOL_SEMINAR_COMPLETED"
        | "THESIS_READINESS_CHECK"
        | "PG_EXAMINATION"
        | "VIVA_SCHEDULED"
        | "CORRECTIONS"
        | "COMPLETED"
      status_code_type:
        | "PENDING_SUPERVISOR"
        | "PENDING_DEPT"
        | "APPROVED"
        | "RETURNED"
        | "REJECTED"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

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

export const Constants = {
  public: {
    Enums: {
      app_role: ["student", "supervisor", "panel", "admin", "dean"],
      role_type: [
        "STUDENT",
        "SUPERVISOR",
        "DEPT_COORDINATOR",
        "SCHOOL_COORDINATOR",
        "PG_DEAN",
        "EXAMINER",
        "SUPER_ADMIN",
      ],
      stage_code_type: [
        "DEPT_SEMINAR_PENDING",
        "DEPT_SEMINAR_COMPLETED",
        "SCHOOL_SEMINAR_PENDING",
        "SCHOOL_SEMINAR_COMPLETED",
        "THESIS_READINESS_CHECK",
        "PG_EXAMINATION",
        "VIVA_SCHEDULED",
        "CORRECTIONS",
        "COMPLETED",
      ],
      status_code_type: [
        "PENDING_SUPERVISOR",
        "PENDING_DEPT",
        "APPROVED",
        "RETURNED",
        "REJECTED",
      ],
    },
  },
} as const
