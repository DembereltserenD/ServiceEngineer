'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { HydrationBoundary } from '@/components/hydration-boundary';
import {
  KPIGrid,
  MonthlyTrendChart,
  StatusPieChart,
  EngineerBarChart,
  SystemTypeChart,
  OrganizationChart,
  CompletionRateChart,
} from '@/components/dashboard';
import { RecentTasksTable, EngineerLeaderboard } from '@/components/dashboard';
import {
  getDashboardKPIs,
  getMonthlyStats,
  getEngineerPerformance,
  getSystemTypeStats,
  getOrganizationStats,
  getStatusDistribution,
  getServiceTasks,
} from '@/lib/data-service';
import { formatNumber } from '@/lib/utils';
import type {
  DashboardKPIs,
  MonthlyStats,
  EngineerPerformance,
  SystemTypeStats,
  OrganizationStats,
  ServiceTask,
} from '@/types';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
  const [engineerPerformance, setEngineerPerformance] = useState<EngineerPerformance[]>([]);
  const [systemTypeStats, setSystemTypeStats] = useState<SystemTypeStats[]>([]);
  const [organizationStats, setOrganizationStats] = useState<OrganizationStats[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<{ name: string; value: number; color: string }[]>([]);
  const [recentTasks, setRecentTasks] = useState<ServiceTask[]>([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [
          kpisData,
          monthlyData,
          engineerData,
          systemData,
          orgData,
          statusData,
          tasksData,
        ] = await Promise.all([
          getDashboardKPIs(),
          getMonthlyStats(),
          getEngineerPerformance(),
          getSystemTypeStats(),
          getOrganizationStats(),
          getStatusDistribution(),
          getServiceTasks({ limit: 8 }),
        ]);

        setKpis(kpisData);
        setMonthlyStats(monthlyData);
        setEngineerPerformance(engineerData);
        setSystemTypeStats(systemData);
        setOrganizationStats(orgData);
        setStatusDistribution(statusData);
        setRecentTasks(tasksData.tasks);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !kpis) {
    return (
      <DashboardLayout title="Хянах самбар">
        <div className="flex h-[50vh] items-center justify-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            Ачаалж байна...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const kpiCards = [
    {
      label: 'Нийт дуудлага',
      value: formatNumber(kpis.totalTasks),
      icon: 'Phone',
      color: 'blue',
      subtitle: 'Бүх цаг үеийн',
    },
    {
      label: 'Дууссан',
      value: formatNumber(kpis.completedTasks),
      icon: 'CheckCircle',
      color: 'green',
      trend: { value: 2.5, isPositive: true },
    },
    {
      label: 'Хүлээгдэж буй',
      value: kpis.pendingTasks,
      icon: 'Clock',
      color: 'yellow',
    },
    {
      label: 'Явагдаж буй',
      value: kpis.inProgressTasks,
      icon: 'Loader',
      color: 'purple',
    },
    {
      label: 'Дундаж хугацаа',
      value: `${kpis.avgResolutionDays} өдөр`,
      icon: 'Calendar',
      color: 'cyan',
    },
    {
      label: 'Гүйцэтгэл',
      value: `${kpis.completionRate}%`,
      icon: 'TrendingUp',
      color: 'emerald',
      trend: { value: 1.2, isPositive: true },
    },
  ];

  return (
    <DashboardLayout title="Хянах самбар">
      <HydrationBoundary fallback={
        <div className="flex h-[50vh] items-center justify-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            Ачаалж байна...
          </div>
        </div>
      }>
        <div className="space-y-6">
          {/* KPI Cards */}
          <KPIGrid kpis={kpiCards} />

          {/* Charts Row 1 */}
          <div className="grid gap-6 lg:grid-cols-3">
            <MonthlyTrendChart data={monthlyStats} />
            <StatusPieChart data={statusDistribution} />
          </div>

          {/* Charts Row 2 */}
          <div className="grid gap-6 lg:grid-cols-3">
            <EngineerBarChart data={engineerPerformance} />
            <SystemTypeChart data={systemTypeStats} />
          </div>

          {/* Charts Row 3 */}
          <div className="grid gap-6 lg:grid-cols-2">
            <OrganizationChart data={organizationStats} />
            <CompletionRateChart data={monthlyStats} />
          </div>

          {/* Recent Tasks & Leaderboard */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RecentTasksTable
                tasks={recentTasks}
                onViewAll={() => router.push('/tasks')}
              />
            </div>
            <EngineerLeaderboard data={engineerPerformance} />
          </div>
        </div>
      </HydrationBoundary>
    </DashboardLayout>
  );
}
