'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { getOrganizationStats, getDashboardKPIs } from '@/lib/data-service';
import { Building2, CheckCircle, Clock, TrendingUp, Loader2 } from 'lucide-react';
import type { OrganizationStats, DashboardKPIs } from '@/types';

export default function OrganizationsPage() {
  const [loading, setLoading] = useState(true);
  const [organizationStats, setOrganizationStats] = useState<OrganizationStats[]>([]);
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [orgData, kpisData] = await Promise.all([
          getOrganizationStats(),
          getDashboardKPIs(),
        ]);
        setOrganizationStats(orgData);
        setKpis(kpisData);
      } catch (error) {
        console.error('Error loading organization data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  if (loading || !kpis) {
    return (
      <DashboardLayout title="Байгууллагууд">
        <div className="flex h-[50vh] items-center justify-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            Ачаалж байна...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate totals
  const totalTasks = organizationStats.reduce((sum, o) => sum + o.total_tasks, 0);
  const totalCompleted = organizationStats.reduce((sum, o) => sum + o.completed_tasks, 0);

  return (
    <DashboardLayout title="Байгууллагууд">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Нийт байгууллага</p>
                  <p className="text-2xl font-bold">{organizationStats.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Нийт дуудлага</p>
                  <p className="text-2xl font-bold">{totalTasks.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Дууссан</p>
                  <p className="text-2xl font-bold">{totalCompleted.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-500/10">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Дундаж гүйцэтгэл</p>
                  <p className="text-2xl font-bold">
                    {totalTasks > 0 ? ((totalCompleted / totalTasks) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Байгууллагуудын дуудлагын тоо</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={organizationStats}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: 'currentColor', fontSize: 10 }}
                      interval={0}
                      angle={-30}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fill: 'currentColor' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="total_tasks" name="Нийт" radius={[4, 4, 0, 0]}>
                      {organizationStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Хуваарилалт</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={organizationStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="total_tasks"
                      nameKey="name"
                      label={({ percent }) => `${((percent ?? 0) * 100).toFixed(1)}%`}
                    >
                      {organizationStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Organization Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {organizationStats.map((org, index) => (
            <Card key={org.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${colors[index % colors.length]}20` }}
                    >
                      <Building2 className="h-5 w-5" style={{ color: colors[index % colors.length] }} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{org.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {org.percentage.toFixed(1)}% нийт дуудлагаас
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      org.completion_rate >= 93
                        ? 'border-green-200 bg-green-50 text-green-700'
                        : org.completion_rate >= 90
                        ? 'border-yellow-200 bg-yellow-50 text-yellow-700'
                        : 'border-red-200 bg-red-50 text-red-700'
                    }
                  >
                    {org.completion_rate.toFixed(1)}%
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Нийт дуудлага</span>
                    <span className="font-medium">{org.total_tasks.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Дууссан</span>
                    <span className="font-medium text-green-600">
                      {org.completed_tasks.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Үлдсэн</span>
                    <span className="font-medium text-yellow-600">
                      {(org.total_tasks - org.completed_tasks).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Гүйцэтгэл</span>
                      <span className="font-medium">{org.completion_rate.toFixed(1)}%</span>
                    </div>
                    <Progress value={org.completion_rate} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
