'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { DataTable } from '@/components/admin/data-table';
import { DeleteConfirmDialog } from '@/components/admin/delete-confirm-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  getServiceTasks,
  getOrganizations,
  getBuildings,
  getEngineers,
  getTaskStatuses,
  getCallTypes,
  getSystemTypes,
  createServiceTask,
  updateServiceTask,
  deleteServiceTask,
} from '@/lib/data-service';
import type { Organization, Engineer, TaskStatus, CallType, SystemType } from '@/types';
import { format } from 'date-fns';

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [statuses, setStatuses] = useState<TaskStatus[]>([]);
  const [callTypes, setCallTypes] = useState<CallType[]>([]);
  const [systemTypes, setSystemTypes] = useState<SystemType[]>([]);

  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [deletingItem, setDeletingItem] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    organization_id: '',
    building_id: '',
    assigned_engineer_id: '',
    status_id: '',
    call_type_id: '',
    system_type_id: '',
    description: '',
    engineering_comment: '',
    akt_number: undefined as number | undefined,
    received_at: new Date().toISOString().split('T')[0],
    completed_at: '',
  });

  const loadData = async () => {
    setLoading(true);
    const [tasksData, orgsData, buildingsData, engineersData, statusesData, callTypesData, systemTypesData] =
      await Promise.all([
        getServiceTasks({ limit: 100 }),
        getOrganizations(),
        getBuildings(),
        getEngineers(),
        getTaskStatuses(),
        getCallTypes(),
        getSystemTypes(),
      ]);

    setTasks(tasksData.tasks);
    setOrganizations(orgsData);
    setBuildings(buildingsData);
    setEngineers(engineersData);
    setStatuses(statusesData);
    setCallTypes(callTypesData);
    setSystemTypes(systemTypesData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({
      organization_id: '',
      building_id: '',
      assigned_engineer_id: '',
      status_id: statuses.find((s) => s.name === 'Not started')?.id || '',
      call_type_id: '',
      system_type_id: '',
      description: '',
      engineering_comment: '',
      akt_number: undefined,
      received_at: new Date().toISOString().split('T')[0],
      completed_at: '',
    });
    setDialogOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      organization_id: item.organization_id || '',
      building_id: item.building_id || '',
      assigned_engineer_id: item.assigned_engineer_id || '',
      status_id: item.status_id || '',
      call_type_id: item.call_type_id || '',
      system_type_id: item.system_type_id || '',
      description: item.description || '',
      engineering_comment: item.engineering_comment || '',
      akt_number: item.akt_number,
      received_at: item.received_at ? item.received_at.split('T')[0] : '',
      completed_at: item.completed_at ? item.completed_at.split('T')[0] : '',
    });
    setDialogOpen(true);
  };

  const handleDelete = (item: any) => {
    setDeletingItem(item);
    setDeleteDialogOpen(true);
  };

  const handleStatusChange = (statusId: string) => {
    const status = statuses.find((s) => s.id === statusId);
    const isCompleted = status?.name === 'Completed';

    setFormData({
      ...formData,
      status_id: statusId,
      completed_at: isCompleted && !formData.completed_at
        ? new Date().toISOString().split('T')[0]
        : formData.completed_at,
    });
  };

  const handleOrgChange = (orgId: string) => {
    setFormData({
      ...formData,
      organization_id: orgId,
      building_id: '', // Clear building selection when org changes
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    const payload = {
      ...formData,
      akt_number: formData.akt_number || undefined,
      building_id: formData.building_id || undefined,
      assigned_engineer_id: formData.assigned_engineer_id || undefined,
      call_type_id: formData.call_type_id || undefined,
      system_type_id: formData.system_type_id || undefined,
      completed_at: formData.completed_at || undefined,
    };

    if (editingItem) {
      await updateServiceTask(editingItem.id, payload);
    } else {
      await createServiceTask(payload);
    }

    await loadData();
    setDialogOpen(false);
    setSubmitting(false);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;

    await deleteServiceTask(deletingItem.id);
    await loadData();
    setDeleteDialogOpen(false);
    setDeletingItem(null);
  };

  const filteredBuildings = buildings.filter(
    (b) => !formData.organization_id || b.organization_id === formData.organization_id
  );

  const columns = [
    {
      key: 'organization',
      label: 'Байгууллага',
      render: (item: any) => item.organization?.name || '-',
    },
    {
      key: 'building',
      label: 'Байр',
      render: (item: any) => item.building?.name || '-',
    },
    {
      key: 'system_type',
      label: 'Систем',
      render: (item: any) => item.system_type?.name || '-',
    },
    {
      key: 'status',
      label: 'Төлөв',
      render: (item: any) => (
        <Badge
          style={{
            backgroundColor: item.status?.color || '#ccc',
            color: 'white',
          }}
        >
          {item.status?.name || '-'}
        </Badge>
      ),
    },
    {
      key: 'received_at',
      label: 'Хүлээн авсан',
      render: (item: any) => format(new Date(item.received_at), 'yyyy-MM-dd'),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Дуудлагууд</h1>
          <p className="text-muted-foreground">Үйлчилгээний дуудлагын жагсаалт удирдах</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Шинэ нэмэх
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Сүүлийн дуудлагууд ({tasks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <DataTable
              data={tasks}
              columns={columns}
              onEdit={handleEdit}
              onDelete={handleDelete}
              searchPlaceholder="Дуудлага хайх..."
            />
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Дуудлага засах' : 'Шинэ дуудлага нэмэх'}
            </DialogTitle>
            <DialogDescription>Дуудлагын мэдээллийг оруулна уу</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Organization */}
            <div className="space-y-2">
              <Label htmlFor="organization_id">Байгууллага *</Label>
              <Select value={formData.organization_id} onValueChange={handleOrgChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Байгууллага сонгох" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Building */}
            <div className="space-y-2">
              <Label htmlFor="building_id">Байр</Label>
              <Select
                value={formData.building_id}
                onValueChange={(value) => setFormData({ ...formData, building_id: value })}
                disabled={!formData.organization_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Байр сонгох" />
                </SelectTrigger>
                <SelectContent>
                  {filteredBuildings.map((building) => (
                    <SelectItem key={building.id} value={building.id}>
                      {building.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status_id">Төлөв *</Label>
                <Select value={formData.status_id} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Төлөв сонгох" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status.id} value={status.id}>
                        {status.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Engineer */}
              <div className="space-y-2">
                <Label htmlFor="assigned_engineer_id">Инженер</Label>
                <Select
                  value={formData.assigned_engineer_id}
                  onValueChange={(value) => setFormData({ ...formData, assigned_engineer_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Инженер сонгох" />
                  </SelectTrigger>
                  <SelectContent>
                    {engineers.map((engineer) => (
                      <SelectItem key={engineer.id} value={engineer.id}>
                        {engineer.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* System Type */}
              <div className="space-y-2">
                <Label htmlFor="system_type_id">Системийн төрөл</Label>
                <Select
                  value={formData.system_type_id}
                  onValueChange={(value) => setFormData({ ...formData, system_type_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Төрөл сонгох" />
                  </SelectTrigger>
                  <SelectContent>
                    {systemTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Call Type */}
              <div className="space-y-2">
                <Label htmlFor="call_type_id">Дуудлагын төрөл</Label>
                <Select
                  value={formData.call_type_id}
                  onValueChange={(value) => setFormData({ ...formData, call_type_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Төрөл сонгох" />
                  </SelectTrigger>
                  <SelectContent>
                    {callTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Тайлбар</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Дуудлагын тайлбар"
                rows={3}
              />
            </div>

            {/* Engineering Comment */}
            <div className="space-y-2">
              <Label htmlFor="engineering_comment">Инженерийн тэмдэглэл</Label>
              <Textarea
                id="engineering_comment"
                value={formData.engineering_comment}
                onChange={(e) => setFormData({ ...formData, engineering_comment: e.target.value })}
                placeholder="Тэмдэглэл"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* AKT Number */}
              <div className="space-y-2">
                <Label htmlFor="akt_number">АКТ дугаар</Label>
                <Input
                  id="akt_number"
                  type="number"
                  value={formData.akt_number || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      akt_number: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  placeholder="123"
                />
              </div>

              {/* Received At */}
              <div className="space-y-2">
                <Label htmlFor="received_at">Хүлээн авсан *</Label>
                <Input
                  id="received_at"
                  type="date"
                  value={formData.received_at}
                  onChange={(e) => setFormData({ ...formData, received_at: e.target.value })}
                />
              </div>

              {/* Completed At */}
              <div className="space-y-2">
                <Label htmlFor="completed_at">Дууссан</Label>
                <Input
                  id="completed_at"
                  type="date"
                  value={formData.completed_at}
                  onChange={(e) => setFormData({ ...formData, completed_at: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Цуцлах
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.organization_id || !formData.status_id || !formData.received_at || submitting}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingItem ? 'Хадгалах' : 'Нэмэх'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Дуудлага устгах уу?"
        description="Энэ дуудлагыг устгах гэж байна. Энэ үйлдлийг буцаах боломжгүй."
      />
    </div>
  );
}
