'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { ServiceTask } from '@/types';
import { cn, formatDate } from '@/lib/utils';

interface RecentTasksTableProps {
  tasks: ServiceTask[];
  title?: string;
  showViewAll?: boolean;
  onViewAll?: () => void;
}

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

export function RecentTasksTable({
  tasks,
  title = 'Сүүлийн дуудлагууд',
  showViewAll = true,
  onViewAll,
}: RecentTasksTableProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {showViewAll && onViewAll && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewAll}
            className="group"
          >
            Бүгдийг харах
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Байгууллага</TableHead>
              <TableHead>Систем</TableHead>
              <TableHead>Инженер</TableHead>
              <TableHead>Огноо</TableHead>
              <TableHead>Төлөв</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell className="font-medium">
                  {task.organization?.name || '-'}
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground">
                    {task.system_type?.name || '-'}
                  </span>
                </TableCell>
                <TableCell>{task.assigned_engineer?.full_name || '-'}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(task.received_at)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      'font-medium',
                      statusStyles[task.status?.name as keyof typeof statusStyles] ||
                      statusStyles['Not started']
                    )}
                  >
                    {statusTranslations[task.status?.name || ''] || task.status?.name || 'Тодорхойгүй'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// Engineer Leaderboard Component
interface EngineerLeaderboardProps {
  data: {
    id: string;
    full_name: string;
    total_tasks: number;
    completed_tasks: number;
    completion_rate: number;
  }[];
}

export function EngineerLeaderboard({ data }: EngineerLeaderboardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Шилдэг инженерүүд</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.slice(0, 5).map((engineer, index) => (
            <div
              key={engineer.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold',
                    index === 0 && 'bg-yellow-500 text-white',
                    index === 1 && 'bg-gray-400 text-white',
                    index === 2 && 'bg-amber-600 text-white',
                    index > 2 && 'bg-muted text-muted-foreground'
                  )}
                >
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium">{engineer.full_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {engineer.completed_tasks} / {engineer.total_tasks} дуудлага
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-600">
                  {engineer.completion_rate}%
                </p>
                <p className="text-xs text-muted-foreground">гүйцэтгэл</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
