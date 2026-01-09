export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          name_en: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          name_en?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          name_en?: string | null;
          created_at?: string;
        };
      };
      buildings: {
        Row: {
          id: string;
          organization_id: string | null;
          name: string;
          code: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string | null;
          name: string;
          code?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string | null;
          name?: string;
          code?: string | null;
          created_at?: string;
        };
      };
      engineers: {
        Row: {
          id: string;
          full_name: string;
          employee_code: string | null;
          email: string | null;
          phone: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          employee_code?: string | null;
          email?: string | null;
          phone?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          employee_code?: string | null;
          email?: string | null;
          phone?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      system_types: {
        Row: {
          id: string;
          name: string;
          name_en: string | null;
          icon: string | null;
          color: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          name_en?: string | null;
          icon?: string | null;
          color?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          name_en?: string | null;
          icon?: string | null;
          color?: string | null;
        };
      };
      call_types: {
        Row: {
          id: string;
          name: string;
          name_en: string | null;
          priority: number;
        };
        Insert: {
          id?: string;
          name: string;
          name_en?: string | null;
          priority?: number;
        };
        Update: {
          id?: string;
          name?: string;
          name_en?: string | null;
          priority?: number;
        };
      };
      task_statuses: {
        Row: {
          id: string;
          name: string;
          name_en: string | null;
          color: string | null;
          sort_order: number | null;
        };
        Insert: {
          id?: string;
          name: string;
          name_en?: string | null;
          color?: string | null;
          sort_order?: number | null;
        };
        Update: {
          id?: string;
          name?: string;
          name_en?: string | null;
          color?: string | null;
          sort_order?: number | null;
        };
      };
      service_tasks: {
        Row: {
          id: string;
          organization_id: string | null;
          building_id: string | null;
          assigned_engineer_id: string | null;
          status_id: string | null;
          call_type_id: string | null;
          system_type_id: string | null;
          description: string | null;
          engineering_comment: string | null;
          akt_number: number | null;
          received_at: string;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
          resolution_days: number | null;
          original_path: string | null;
        };
        Insert: {
          id?: string;
          organization_id?: string | null;
          building_id?: string | null;
          assigned_engineer_id?: string | null;
          status_id?: string | null;
          call_type_id?: string | null;
          system_type_id?: string | null;
          description?: string | null;
          engineering_comment?: string | null;
          akt_number?: number | null;
          received_at: string;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
          original_path?: string | null;
        };
        Update: {
          id?: string;
          organization_id?: string | null;
          building_id?: string | null;
          assigned_engineer_id?: string | null;
          status_id?: string | null;
          call_type_id?: string | null;
          system_type_id?: string | null;
          description?: string | null;
          engineering_comment?: string | null;
          akt_number?: number | null;
          received_at?: string;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
          original_path?: string | null;
        };
      };
    };
    Views: {
      dashboard_stats: {
        Row: {
          total_tasks: number;
          completed_tasks: number;
          in_progress_tasks: number;
          not_started_tasks: number;
          avg_resolution_days: number | null;
          today_tasks: number;
          this_month_tasks: number;
        };
      };
      monthly_stats: {
        Row: {
          month: string;
          total: number;
          completed: number;
          in_progress: number;
          not_started: number;
          completion_rate: number;
          avg_resolution_days: number | null;
        };
      };
      engineer_performance: {
        Row: {
          id: string;
          full_name: string;
          employee_code: string | null;
          total_tasks: number;
          completed_tasks: number;
          avg_resolution_days: number | null;
          same_day_completions: number;
          completion_rate: number;
        };
      };
      system_type_stats: {
        Row: {
          id: string;
          system_type: string;
          color: string | null;
          total: number;
          completed: number;
          percentage: number;
        };
      };
      organization_stats: {
        Row: {
          id: string;
          name: string;
          total_tasks: number;
          completed_tasks: number;
          completion_rate: number;
          percentage: number;
        };
      };
    };
  };
}

// Helper types
export type ServiceTask = Database['public']['Tables']['service_tasks']['Row'];
export type Organization = Database['public']['Tables']['organizations']['Row'];
export type Engineer = Database['public']['Tables']['engineers']['Row'];
export type SystemType = Database['public']['Tables']['system_types']['Row'];
export type CallType = Database['public']['Tables']['call_types']['Row'];
export type TaskStatus = Database['public']['Tables']['task_statuses']['Row'];

export type DashboardStats = Database['public']['Views']['dashboard_stats']['Row'];
export type MonthlyStatsView = Database['public']['Views']['monthly_stats']['Row'];
export type EngineerPerformanceView = Database['public']['Views']['engineer_performance']['Row'];
export type SystemTypeStatsView = Database['public']['Views']['system_type_stats']['Row'];
export type OrganizationStatsView = Database['public']['Views']['organization_stats']['Row'];

// Extended task with joins
export interface ServiceTaskWithRelations extends ServiceTask {
  organizations?: Organization | null;
  engineers?: Engineer | null;
  task_statuses?: TaskStatus | null;
  system_types?: SystemType | null;
  call_types?: CallType | null;
}
