// Core data types for Digital Power Service Dashboard

export interface Organization {
  id: string;
  name: string;
  name_en?: string;
  created_at: string;
}

export interface Building {
  id: string;
  organization_id: string;
  name: string;
  code?: string;
  created_at: string;
}

export interface Engineer {
  id: string;
  full_name: string;
  employee_code?: string;
  email?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
}

export interface SystemType {
  id: string;
  name: string;
  name_en?: string;
  icon?: string;
  color?: string;
}

export interface CallType {
  id: string;
  name: string;
  name_en?: string;
  priority?: number;
}

export interface TaskStatus {
  id: string;
  name: "Completed" | "In progress" | "Not started";
  name_en?: string;
  color?: string;
  sort_order: number;
}

export interface ServiceTask {
  id: string;
  organization_id: string;
  building_id?: string;
  assigned_engineer_id?: string;
  status_id: string;
  call_type_id?: string;
  system_type_id?: string;
  description?: string;
  engineering_comment?: string;
  akt_number?: number;
  received_at: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  resolution_days?: number;

  // Joined data
  organization?: Organization;
  building?: Building;
  assigned_engineer?: Engineer;
  status?: TaskStatus;
  call_type?: CallType;
  system_type?: SystemType;
}

// Analytics types
export interface DashboardKPIs {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  avgResolutionDays: number;
  pendingTasks: number;
  inProgressTasks: number;
  todaysTasks: number;
  thisMonthTasks: number;
}

export interface MonthlyStats {
  month: string;
  total: number;
  completed: number;
  in_progress: number;
  not_started: number;
  completion_rate: number;
  avg_resolution_days?: number;
  [key: string]: string | number | undefined;
}

export interface EngineerPerformance {
  id: string;
  full_name: string;
  employee_code?: string;
  total_tasks: number;
  completed_tasks: number;
  avg_resolution_days: number;
  same_day_completions: number;
  completion_rate: number;
  [key: string]: string | number | undefined;
}

export interface SystemTypeStats {
  system_type: string;
  total: number;
  completed: number;
  percentage: number;
  color: string;
  [key: string]: string | number;
}

export interface OrganizationStats {
  id: string;
  name: string;
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number;
  percentage: number;
  [key: string]: string | number;
}

export interface CallTypeStats {
  name: string;
  count: number;
  percentage: number;
  [key: string]: string | number;
}

// Query parameters
export interface TaskQueryParams {
  page?: number;
  limit?: number;
  status?: "Completed" | "In progress" | "Not started";
  engineer_id?: string;
  organization_id?: string;
  system_type?: string;
  call_type?: string;
  from_date?: string;
  to_date?: string;
  search?: string;
  sort_by?: "received_at" | "completed_at" | "organization" | "engineer";
  sort_order?: "asc" | "desc";
}

// Filter state
export interface FilterState {
  status: string[];
  engineers: string[];
  organizations: string[];
  systemTypes: string[];
  callTypes: string[];
  dateRange: {
    from?: Date;
    to?: Date;
  };
  search: string;
}
