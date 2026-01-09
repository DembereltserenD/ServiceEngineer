'use client';

import { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
} from 'lucide-react';
import { getServiceTasks, getFilterOptions } from '@/lib/data-service';
import type { ServiceTask } from '@/types';

const statusStyles: Record<string, string> = {
  Completed: 'bg-green-500/10 text-green-700 border-green-200',
  'In progress': 'bg-purple-500/10 text-purple-700 border-purple-200',
  'Not started': 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
};

// Mongolian translations for status names
const statusTranslations: Record<string, string> = {
  Completed: 'Дууссан',
  'In progress': 'Явагдаж буй',
  'Not started': 'Эхлээгүй',
};

interface FilterOptionsType {
  statuses: { id: string; name: string }[];
  systemTypes: { id: string; name: string }[];
  engineers: { id: string; full_name: string }[];
  organizations: { id: string; name: string }[];
}

export default function TasksPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [systemTypeFilter, setSystemTypeFilter] = useState<string>('all');
  const [engineerFilter, setEngineerFilter] = useState<string>('all');
  const [organizationFilter, setOrganizationFilter] = useState<string>('all');

  const [tasks, setTasks] = useState<ServiceTask[]>([]);
  const [totalTasks, setTotalTasks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState<FilterOptionsType | null>(null);

  const pageSize = 20;

  // Load filter options
  useEffect(() => {
    async function loadFilterOptions() {
      const options = await getFilterOptions();
      setFilterOptions(options as FilterOptionsType);
    }
    loadFilterOptions();
  }, []);

  // Load tasks
  useEffect(() => {
    async function loadTasks() {
      setLoading(true);
      try {
        const result = await getServiceTasks({
          page,
          limit: pageSize,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          engineerId: engineerFilter !== 'all' ? engineerFilter : undefined,
          organizationId: organizationFilter !== 'all' ? organizationFilter : undefined,
          systemTypeId: systemTypeFilter !== 'all' ? systemTypeFilter : undefined,
          search: searchQuery || undefined,
        });
        setTasks(result.tasks);
        setTotalTasks(result.total);
      } catch (error) {
        console.error('Error loading tasks:', error);
      } finally {
        setLoading(false);
      }
    }
    loadTasks();
  }, [page, statusFilter, systemTypeFilter, engineerFilter, organizationFilter, searchQuery]);

  const totalPages = Math.ceil(totalTasks / pageSize);

  const clearFilters = () => {
    setStatusFilter('all');
    setSystemTypeFilter('all');
    setEngineerFilter('all');
    setOrganizationFilter('all');
    setSearchQuery('');
    setPage(1);
  };

  const hasActiveFilters =
    statusFilter !== 'all' ||
    systemTypeFilter !== 'all' ||
    engineerFilter !== 'all' ||
    organizationFilter !== 'all' ||
    searchQuery !== '';

  return (
    <DashboardLayout title="Дуудлагууд">
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Шүүлтүүр
              </CardTitle>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="mr-2 h-4 w-4" />
                  Цэвэрлэх
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {/* Search */}
              <div className="relative lg:col-span-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Хайх..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="pl-8"
                />
              </div>

              {/* Status Filter */}
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Төлөв" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Бүх төлөв</SelectItem>
                  {filterOptions?.statuses.map((status) => (
                    <SelectItem key={status.id} value={status.name}>
                      {statusTranslations[status.name] || status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* System Type Filter */}
              <Select
                value={systemTypeFilter}
                onValueChange={(value) => {
                  setSystemTypeFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Систем" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Бүх систем</SelectItem>
                  {filterOptions?.systemTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Engineer Filter */}
              <Select
                value={engineerFilter}
                onValueChange={(value) => {
                  setEngineerFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Инженер" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Бүх инженер</SelectItem>
                  {filterOptions?.engineers.map((eng) => (
                    <SelectItem key={eng.id} value={eng.id}>
                      {eng.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Organization Filter */}
              <Select
                value={organizationFilter}
                onValueChange={(value) => {
                  setOrganizationFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Байгууллага" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Бүх байгууллага</SelectItem>
                  {filterOptions?.organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Дуудлагууд ({totalTasks.toLocaleString()})
            </CardTitle>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Экспорт
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto scrollbar-thin">
              <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">№</TableHead>
                    <TableHead>Байгууллага</TableHead>
                    <TableHead>Систем</TableHead>
                    <TableHead className="max-w-[250px]">Шалтгаан</TableHead>
                    <TableHead>Инженер</TableHead>
                    <TableHead>Хүлээн авсан</TableHead>
                    <TableHead>Дууссан</TableHead>
                    <TableHead>Хугацаа</TableHead>
                    <TableHead>Төлөв</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="h-24 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Ачаалж байна...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : tasks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="h-24 text-center">
                        Өгөгдөл олдсонгүй
                      </TableCell>
                    </TableRow>
                  ) : (
                    tasks.map((task, idx) => (
                      <TableRow key={task.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-medium text-muted-foreground">
                          {(page - 1) * pageSize + idx + 1}
                        </TableCell>
                        <TableCell className="font-medium">
                          {task.organization?.name || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal">
                            {task.system_type?.name || '-'}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[250px]">
                          <p className="truncate" title={task.description || ''}>
                            {task.description || '-'}
                          </p>
                        </TableCell>
                        <TableCell>{task.assigned_engineer?.full_name || '-'}</TableCell>
                        <TableCell className="text-muted-foreground whitespace-nowrap">
                          {task.received_at
                            ? format(new Date(task.received_at), 'yyyy-MM-dd')
                            : '-'}
                        </TableCell>
                        <TableCell className="text-muted-foreground whitespace-nowrap">
                          {task.completed_at
                            ? format(new Date(task.completed_at), 'yyyy-MM-dd')
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {task.resolution_days !== undefined && task.resolution_days !== null ? (
                            <span className="text-sm whitespace-nowrap">
                              {task.resolution_days === 0 ? 'Тухайн өдөр' : `${task.resolution_days} өдөр`}
                            </span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              'font-medium whitespace-nowrap',
                              statusStyles[task.status?.name || ''] || statusStyles['Not started']
                            )}
                          >
                            {statusTranslations[task.status?.name || ''] || task.status?.name || 'Тодорхойгүй'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-2 py-4">
              <p className="text-sm text-muted-foreground">
                {totalTasks > 0
                  ? `${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, totalTasks)} / ${totalTasks.toLocaleString()}`
                  : '0 үр дүн'}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Өмнөх
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? 'default' : 'outline'}
                        size="sm"
                        className="w-8"
                        onClick={() => setPage(pageNum)}
                        disabled={loading}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || loading}
                >
                  Дараах
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
