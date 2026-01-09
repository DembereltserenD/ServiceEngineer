'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { getEngineerPerformance, getFilterOptions } from '@/lib/data-service';
import { CheckCircle, Clock, Award, TrendingUp, User, Loader2 } from 'lucide-react';
import type { EngineerPerformance } from '@/types';

export default function EngineersPage() {
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState<EngineerPerformance[]>([]);
  const [totalEngineers, setTotalEngineers] = useState(0);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [performance, options] = await Promise.all([
          getEngineerPerformance(),
          getFilterOptions(),
        ]);
        setPerformanceData(performance);
        setTotalEngineers(options.engineers.length);
      } catch (error) {
        console.error('Error loading engineer data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const colors = ['#22c55e', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#10b981'];

  if (loading) {
    return (
      <DashboardLayout title="Инженерүүд">
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
  const avgCompletionRate = performanceData.length > 0
    ? performanceData.reduce((sum, e) => sum + e.completion_rate, 0) / performanceData.length
    : 0;
  const avgResolutionDays = performanceData.length > 0
    ? performanceData.reduce((sum, e) => sum + e.avg_resolution_days, 0) / performanceData.length
    : 0;

  return (
    <DashboardLayout title="Инженерүүд">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Нийт инженер</p>
                  <p className="text-2xl font-bold">{totalEngineers}</p>
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
                  <p className="text-sm text-muted-foreground">Дундаж гүйцэтгэл</p>
                  <p className="text-2xl font-bold">{avgCompletionRate.toFixed(1)}%</p>
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
                  <p className="text-sm text-muted-foreground">Дундаж хугацаа</p>
                  <p className="text-2xl font-bold">{avgResolutionDays.toFixed(1)} өдөр</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-500/10">
                  <Award className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Шилдэг инженер</p>
                  <p className="text-lg font-bold truncate">{performanceData[0]?.full_name || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Performance Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Дуудлагын тоо
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ height: Math.max(350, performanceData.length * 40) }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={performanceData.map(e => ({
                      ...e,
                      short_name: e.full_name.split(' ')[0],
                    }))}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" tick={{ fill: 'currentColor' }} />
                    <YAxis
                      dataKey="short_name"
                      type="category"
                      tick={{ fill: 'currentColor', fontSize: 11 }}
                      width={100}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      labelFormatter={(_, payload) => payload?.[0]?.payload?.full_name || ''}
                    />
                    <Legend />
                    <Bar dataKey="completed_tasks" name="Дууссан" fill="#22c55e" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="total_tasks" name="Нийт" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Task Distribution Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Дуудлагын хуваарилалт
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={performanceData.map((e, i) => ({
                        name: e.full_name,
                        value: e.total_tasks,
                        fill: colors[i % colors.length],
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${(name || '').toString().split(' ')[0]} ${((percent || 0) * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {performanceData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value, name) => [`${value} дуудлага`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Radar Chart - Top 5 Engineers Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Топ 5 инженерийн харьцуулалт
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  {(() => {
                    const top5 = performanceData.slice(0, 5);
                    const maxTasks = Math.max(...top5.map(e => e.total_tasks), 1);
                    const maxCompleted = Math.max(...top5.map(e => e.completed_tasks), 1);
                    const maxSameDay = Math.max(...top5.map(e => e.same_day_completions), 1);

                    return (
                      <RadarChart
                        cx="50%"
                        cy="50%"
                        outerRadius="70%"
                        data={[
                          { metric: 'Гүйцэтгэл %', ...Object.fromEntries(top5.map(e => [e.full_name, e.completion_rate])) },
                          { metric: 'Нийт дуудлага', ...Object.fromEntries(top5.map(e => [e.full_name, (e.total_tasks / maxTasks) * 100])) },
                          { metric: 'Дууссан', ...Object.fromEntries(top5.map(e => [e.full_name, (e.completed_tasks / maxCompleted) * 100])) },
                          { metric: 'Тухайн өдөр', ...Object.fromEntries(top5.map(e => [e.full_name, (e.same_day_completions / maxSameDay) * 100])) },
                        ]}
                      >
                        <PolarGrid className="stroke-muted" />
                        <PolarAngleAxis dataKey="metric" tick={{ fill: 'currentColor', fontSize: 11 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'currentColor', fontSize: 10 }} />
                        {top5.map((engineer, index) => (
                          <Radar
                            key={engineer.id}
                            name={engineer.full_name}
                            dataKey={engineer.full_name}
                            stroke={colors[index]}
                            fill={colors[index]}
                            fillOpacity={0.15}
                            strokeWidth={2}
                          />
                        ))}
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                          formatter={(value: number | undefined) => `${(value ?? 0).toFixed(1)}%`}
                        />
                      </RadarChart>
                    );
                  })()}
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Completion Rate Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Гүйцэтгэлийн хувь
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={performanceData.map(e => ({
                      ...e,
                      short_name: e.full_name.split(' ')[0],
                    }))}
                    margin={{ top: 5, right: 30, left: 20, bottom: 80 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="short_name"
                      tick={{ fill: 'currentColor', fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      interval={0}
                      height={80}
                    />
                    <YAxis domain={[0, 100]} tick={{ fill: 'currentColor' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      labelFormatter={(_, payload) => payload?.[0]?.payload?.full_name || ''}
                      formatter={(value) => [`${value}%`, 'Гүйцэтгэл']}
                    />
                    <Bar dataKey="completion_rate" name="Гүйцэтгэл %" radius={[4, 4, 0, 0]}>
                      {performanceData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.completion_rate >= 90 ? '#22c55e' : entry.completion_rate >= 70 ? '#f59e0b' : '#ef4444'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Engineer Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {performanceData.map((engineer, index) => (
            <Card key={engineer.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback
                      style={{ backgroundColor: colors[index % colors.length] }}
                      className="text-white font-bold"
                    >
                      {engineer.full_name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold truncate">{engineer.full_name}</h3>
                      {index === 0 && (
                        <Badge className="bg-yellow-500 text-white shrink-0">
                          <Award className="mr-1 h-3 w-3" />
                          #1
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Код: {engineer.employee_code || '-'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Нийт дуудлага</span>
                    <span className="font-medium">{engineer.total_tasks}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Дууссан</span>
                    <span className="font-medium text-green-600">
                      {engineer.completed_tasks}
                    </span>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Гүйцэтгэл</span>
                      <span className="font-medium">{engineer.completion_rate}%</span>
                    </div>
                    <Progress value={engineer.completion_rate} className="h-2" />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Дундаж хугацаа</span>
                    <span className="font-medium">{engineer.avg_resolution_days} өдөр</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Тухайн өдөр дууссан</span>
                    <span className="font-medium text-blue-600">
                      {engineer.same_day_completions}
                    </span>
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
