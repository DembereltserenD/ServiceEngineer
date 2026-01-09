'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart,
  Line,
} from 'recharts';
import {
  getMonthlyStats,
  getEngineerPerformance,
  getSystemTypeStats,
  getOrganizationStats,
  getCallTypeStats,
  getStatusDistribution,
} from '@/lib/data-service';
import type {
  MonthlyStats,
  EngineerPerformance,
  SystemTypeStats,
  OrganizationStats,
  CallTypeStats,
} from '@/types';
import { TrendingUp, PieChartIcon, BarChart3, Activity } from 'lucide-react';
import { Loader2 } from 'lucide-react';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
  const [engineerPerformance, setEngineerPerformance] = useState<EngineerPerformance[]>([]);
  const [systemTypeStats, setSystemTypeStats] = useState<SystemTypeStats[]>([]);
  const [organizationStats, setOrganizationStats] = useState<OrganizationStats[]>([]);
  const [callTypeStats, setCallTypeStats] = useState<CallTypeStats[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<{ name: string; value: number; color: string }[]>([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [monthly, engineers, systems, orgs, calls, status] = await Promise.all([
          getMonthlyStats(),
          getEngineerPerformance(),
          getSystemTypeStats(),
          getOrganizationStats(),
          getCallTypeStats(),
          getStatusDistribution(),
        ]);
        setMonthlyStats(monthly);
        setEngineerPerformance(engineers);
        setSystemTypeStats(systems);
        setOrganizationStats(orgs);
        setCallTypeStats(calls);
        setStatusDistribution(status);
      } catch (error) {
        console.error('Error loading analytics data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const callTypeColors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  if (loading) {
    return (
      <DashboardLayout title="Аналитик">
        <div className="flex h-[50vh] items-center justify-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            Ачаалж байна...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate dynamic height for engineer chart
  const engineerChartHeight = Math.max(400, engineerPerformance.length * 50);

  return (
    <DashboardLayout title="Аналитик">
      <div className="space-y-6">
        <Tabs defaultValue="trends" className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-4">
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Чиг хандлага
            </TabsTrigger>
            <TabsTrigger value="distribution" className="flex items-center gap-2">
              <PieChartIcon className="h-4 w-4" />
              Хуваарилалт
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Харьцуулалт
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Гүйцэтгэл
            </TabsTrigger>
          </TabsList>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Сарын дуудлагын чиг хандлага</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={monthlyStats.map((m) => ({ ...m, month: m.month.substring(5) }))}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" tick={{ fill: 'currentColor' }} />
                      <YAxis yAxisId="left" tick={{ fill: 'currentColor' }} />
                      <YAxis yAxisId="right" orientation="right" domain={[70, 100]} tick={{ fill: 'currentColor' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="total" name="Нийт" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar yAxisId="left" dataKey="completed" name="Дууссан" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      <Line yAxisId="right" type="monotone" dataKey="completion_rate" name="Гүйцэтгэл (%)" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b', strokeWidth: 2 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Шийдвэрлэх хугацааны чиг хандлага</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyStats.map((m) => ({ month: m.month.substring(5), days: m.avg_resolution_days }))}>
                      <defs>
                        <linearGradient id="colorDays" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" tick={{ fill: 'currentColor' }} />
                      <YAxis domain={[0, 2]} tick={{ fill: 'currentColor' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        formatter={(value) => [`${value} өдөр`, 'Дундаж хугацаа']}
                      />
                      <Area type="monotone" dataKey="days" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorDays)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Distribution Tab */}
          <TabsContent value="distribution" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Төлөвийн хуваарилалт</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(1)}%`}
                        >
                          {statusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Дуудлагын төрлөөр</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={callTypeStats}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="count"
                          nameKey="name"
                        >
                          {callTypeStats.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={callTypeColors[index % callTypeColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Системийн төрлөөр</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={systemTypeStats} layout="vertical" margin={{ left: 100 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis type="number" tick={{ fill: 'currentColor' }} />
                        <YAxis dataKey="system_type" type="category" tick={{ fill: 'currentColor' }} width={90} />
                        <Tooltip />
                        <Bar dataKey="total" name="Нийт" radius={[0, 4, 4, 0]}>
                          {systemTypeStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Байгууллагаар</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={organizationStats}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="total_tasks"
                          nameKey="name"
                          label={({ percent }) => `${((percent ?? 0) * 100).toFixed(1)}%`}
                        >
                          {organizationStats.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'][index % 6]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Comparison Tab */}
          <TabsContent value="comparison" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Байгууллагуудын харьцуулалт</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={organizationStats}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" tick={{ fill: 'currentColor', fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={60} />
                      <YAxis tick={{ fill: 'currentColor' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                      <Bar dataKey="total_tasks" name="Нийт" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="completed_tasks" name="Дууссан" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Системийн төрлүүдийн гүйцэтгэл</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={systemTypeStats}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="system_type" tick={{ fill: 'currentColor', fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={80} />
                      <YAxis tick={{ fill: 'currentColor' }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="total" name="Нийт" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="completed" name="Дууссан" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Инженерүүдийн гүйцэтгэл</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ height: `${engineerChartHeight}px` }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={engineerPerformance} layout="vertical" margin={{ left: 20, right: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" tick={{ fill: 'currentColor' }} />
                      <YAxis
                        dataKey="full_name"
                        type="category"
                        tick={{ fill: 'currentColor', fontSize: 12 }}
                        width={120}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                      <Bar dataKey="total_tasks" name="Нийт" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={18} />
                      <Bar dataKey="completed_tasks" name="Дууссан" fill="#22c55e" radius={[0, 4, 4, 0]} barSize={18} />
                      <Bar dataKey="same_day_completions" name="Тухайн өдөр" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={18} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Шийдвэрлэх дундаж хугацаа (инженерээр)</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ height: `${Math.max(300, engineerPerformance.length * 40)}px` }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={engineerPerformance} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" domain={[0, 2]} tick={{ fill: 'currentColor' }} />
                      <YAxis
                        dataKey="full_name"
                        type="category"
                        tick={{ fill: 'currentColor', fontSize: 12 }}
                        width={120}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        formatter={(value) => [`${value} өдөр`, 'Дундаж хугацаа']}
                      />
                      <Bar dataKey="avg_resolution_days" name="Дундаж хугацаа" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
