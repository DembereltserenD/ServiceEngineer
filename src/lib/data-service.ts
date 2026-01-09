import { supabase } from "./supabase";
import type {
  DashboardKPIs,
  MonthlyStats,
  EngineerPerformance,
  SystemTypeStats,
  OrganizationStats,
  CallTypeStats,
  ServiceTask,
  TaskStatus,
  Engineer,
  Organization,
  SystemType,
  CallType,
} from "@/types";

// Type definitions for Supabase views
interface DashboardStatsRow {
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  not_started_tasks: number;
  avg_resolution_days: number | null;
  today_tasks: number;
  this_month_tasks: number;
}

interface MonthlyStatsRow {
  month: string;
  total: number;
  completed: number;
  in_progress: number;
  not_started: number;
  completion_rate: number;
  avg_resolution_days: number | null;
}

interface EngineerPerformanceRow {
  id: string;
  full_name: string;
  employee_code: string | null;
  total_tasks: number;
  completed_tasks: number;
  avg_resolution_days: number | null;
  same_day_completions: number;
  completion_rate: number;
}

interface SystemTypeStatsRow {
  id: string;
  system_type: string;
  color: string | null;
  total: number;
  completed: number;
  percentage: number;
}

interface OrganizationStatsRow {
  id: string;
  name: string;
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number;
  percentage: number;
}

// Dashboard KPIs
export async function getDashboardKPIs(): Promise<DashboardKPIs> {
  const { data, error } = await supabase
    .from("dashboard_stats")
    .select("*")
    .single();

  if (error || !data) {
    console.error("Error fetching dashboard stats:", error);
    return {
      totalTasks: 0,
      completedTasks: 0,
      completionRate: 0,
      avgResolutionDays: 0,
      pendingTasks: 0,
      inProgressTasks: 0,
      todaysTasks: 0,
      thisMonthTasks: 0,
    };
  }

  const row = data as DashboardStatsRow;
  return {
    totalTasks: row.total_tasks,
    completedTasks: row.completed_tasks,
    completionRate:
      row.completed_tasks > 0
        ? Math.round((row.completed_tasks / row.total_tasks) * 1000) / 10
        : 0,
    avgResolutionDays: row.avg_resolution_days || 0,
    pendingTasks: row.not_started_tasks,
    inProgressTasks: row.in_progress_tasks,
    todaysTasks: row.today_tasks,
    thisMonthTasks: row.this_month_tasks,
  };
}

// Monthly Statistics
export async function getMonthlyStats(): Promise<MonthlyStats[]> {
  const { data, error } = await supabase
    .from("monthly_stats")
    .select("*")
    .order("month", { ascending: true })
    .limit(12);

  if (error || !data) {
    console.error("Error fetching monthly stats:", error);
    return [];
  }

  return (data as MonthlyStatsRow[]).map((row) => ({
    month: row.month,
    total: row.total,
    completed: row.completed,
    in_progress: row.in_progress,
    not_started: row.not_started,
    completion_rate: row.completion_rate,
    avg_resolution_days: row.avg_resolution_days || undefined,
  }));
}

// Engineer Performance - fetches ALL engineers
export async function getEngineerPerformance(): Promise<EngineerPerformance[]> {
  const { data, error } = await supabase
    .from("engineer_performance")
    .select("*")
    .order("total_tasks", { ascending: false });

  if (error || !data) {
    console.error("Error fetching engineer performance:", error);
    return [];
  }

  return (data as EngineerPerformanceRow[]).map((row) => ({
    id: row.id,
    full_name: row.full_name,
    employee_code: row.employee_code || undefined,
    total_tasks: row.total_tasks,
    completed_tasks: row.completed_tasks,
    avg_resolution_days: row.avg_resolution_days || 0,
    same_day_completions: row.same_day_completions,
    completion_rate: row.completion_rate,
  }));
}

// System Type Statistics
export async function getSystemTypeStats(): Promise<SystemTypeStats[]> {
  const { data, error } = await supabase
    .from("system_type_stats")
    .select("*")
    .order("total", { ascending: false });

  if (error || !data) {
    console.error("Error fetching system type stats:", error);
    return [];
  }

  const defaultColors = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
    "#ec4899",
  ];

  return (data as SystemTypeStatsRow[]).map((row, index) => ({
    system_type: row.system_type,
    total: row.total,
    completed: row.completed,
    percentage: row.percentage,
    color: row.color || defaultColors[index % defaultColors.length],
  }));
}

// Organization Statistics
export async function getOrganizationStats(): Promise<OrganizationStats[]> {
  const { data, error } = await supabase
    .from("organization_stats")
    .select("*")
    .order("total_tasks", { ascending: false });

  if (error || !data) {
    console.error("Error fetching organization stats:", error);
    return [];
  }

  return (data as OrganizationStatsRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    total_tasks: row.total_tasks,
    completed_tasks: row.completed_tasks,
    completion_rate: row.completion_rate,
    percentage: row.percentage,
  }));
}

// Call Type Statistics
export async function getCallTypeStats(): Promise<CallTypeStats[]> {
  const { data, error } = await supabase.from("service_tasks").select(`
      call_type_id,
      call_types!inner(name)
    `);

  if (error || !data) {
    console.error("Error fetching call type stats:", error);
    return [];
  }

  // Count by call type
  const counts: Record<string, { name: string; count: number }> = {};
  for (const item of data as CallTypeQueryRow[]) {
    const callType = item.call_types;
    if (callType?.name) {
      if (!counts[callType.name]) {
        counts[callType.name] = { name: callType.name, count: 0 };
      }
      counts[callType.name].count++;
    }
  }

  const total = Object.values(counts).reduce(
    (sum, item) => sum + item.count,
    0
  );

  return Object.values(counts)
    .map((item) => ({
      name: item.name,
      count: item.count,
      percentage: total > 0 ? Math.round((item.count / total) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

// Status Distribution
export async function getStatusDistribution() {
  const { data, error } = await supabase
    .from("dashboard_stats")
    .select("*")
    .single();

  if (error || !data) {
    console.error("Error fetching status distribution:", error);
    return [];
  }

  const row = data as DashboardStatsRow;
  return [
    { name: "Дууссан", value: row.completed_tasks, color: "#22c55e" },
    { name: "Явагдаж буй", value: row.in_progress_tasks, color: "#8b5cf6" },
    { name: "Эхлээгүй", value: row.not_started_tasks, color: "#f59e0b" },
  ];
}

// Service Tasks with filters
interface TaskFilters {
  page?: number;
  limit?: number;
  status?: string;
  engineerId?: string;
  organizationId?: string;
  systemTypeId?: string;
  search?: string;
}

// Type for service task row from Supabase
interface ServiceTaskRow {
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
  organizations: { id: string; name: string } | null;
  engineers: {
    id: string;
    full_name: string;
    employee_code: string | null;
  } | null;
  task_statuses: { id: string; name: string; color: string | null } | null;
  system_types: { id: string; name: string; color: string | null } | null;
  call_types: { id: string; name: string } | null;
}

// Type for call type query
interface CallTypeQueryRow {
  call_type_id: string | null;
  call_types: { name: string } | null;
}

export async function getServiceTasks(filters: TaskFilters = {}): Promise<{
  tasks: ServiceTask[];
  total: number;
}> {
  const {
    page = 1,
    limit = 20,
    status,
    engineerId,
    organizationId,
    systemTypeId,
    search,
  } = filters;

  let query = supabase.from("service_tasks").select(
    `
      *,
      organizations(id, name),
      engineers:assigned_engineer_id(id, full_name, employee_code),
      task_statuses:status_id(id, name, color),
      system_types:system_type_id(id, name, color),
      call_types:call_type_id(id, name)
    `,
    { count: "exact" }
  );

  // Apply filters
  if (status && status !== "all") {
    const { data: statusData } = await supabase
      .from("task_statuses")
      .select("id")
      .eq("name", status)
      .single();
    if (statusData) {
      query = query.eq("status_id", (statusData as { id: string }).id);
    }
  }

  if (engineerId && engineerId !== "all") {
    query = query.eq("assigned_engineer_id", engineerId);
  }

  if (organizationId && organizationId !== "all") {
    query = query.eq("organization_id", organizationId);
  }

  if (systemTypeId && systemTypeId !== "all") {
    query = query.eq("system_type_id", systemTypeId);
  }

  if (search) {
    query = query.or(`description.ilike.%${search}%`);
  }

  // Pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await query
    .order("received_at", { ascending: false })
    .range(from, to);

  if (error || !data) {
    console.error("Error fetching tasks:", error);
    return { tasks: [], total: 0 };
  }

  // Transform data to match expected format
  const tasks: ServiceTask[] = (data as ServiceTaskRow[]).map((row) => ({
    id: row.id,
    organization_id: row.organization_id || "",
    building_id: row.building_id || undefined,
    assigned_engineer_id: row.assigned_engineer_id || undefined,
    status_id: row.status_id || "",
    call_type_id: row.call_type_id || undefined,
    system_type_id: row.system_type_id || undefined,
    description: row.description || undefined,
    engineering_comment: row.engineering_comment || undefined,
    akt_number: row.akt_number || undefined,
    received_at: row.received_at,
    completed_at: row.completed_at || undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,
    resolution_days: row.resolution_days || undefined,
    organization: row.organizations as Organization | undefined,
    assigned_engineer: row.engineers as Engineer | undefined,
    status: row.task_statuses as TaskStatus | undefined,
    system_type: row.system_types as SystemType | undefined,
    call_type: row.call_types as CallType | undefined,
  }));

  return { tasks, total: count || 0 };
}

// Get filter options from database
export async function getFilterOptions(): Promise<{
  statuses: TaskStatus[];
  systemTypes: SystemType[];
  engineers: Engineer[];
  organizations: Organization[];
}> {
  const [statusesRes, systemTypesRes, engineersRes, orgsRes] =
    await Promise.all([
      supabase.from("task_statuses").select("*").order("sort_order"),
      supabase.from("system_types").select("*").order("name"),
      supabase
        .from("engineers")
        .select("*")
        .eq("is_active", true)
        .order("full_name"),
      supabase.from("organizations").select("*").order("name"),
    ]);

  return {
    statuses: (statusesRes.data || []) as TaskStatus[],
    systemTypes: (systemTypesRes.data || []) as SystemType[],
    engineers: (engineersRes.data || []) as Engineer[],
    organizations: (orgsRes.data || []) as Organization[],
  };
}

// Get all engineers
export async function getEngineers(): Promise<Engineer[]> {
  const { data, error } = await supabase
    .from("engineers")
    .select("*")
    .eq("is_active", true)
    .order("full_name");

  if (error || !data) {
    console.error("Error fetching engineers:", error);
    return [];
  }

  return data as Engineer[];
}

// Get all organizations
export async function getOrganizations(): Promise<Organization[]> {
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .order("name");

  if (error || !data) {
    console.error("Error fetching organizations:", error);
    return [];
  }

  return data as Organization[];
}
