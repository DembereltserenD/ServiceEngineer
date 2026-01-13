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
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  getEngineers,
  createEngineer,
  updateEngineer,
  deleteEngineer,
} from '@/lib/data-service';
import type { Engineer } from '@/types';

export default function EngineersPage() {
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Engineer | null>(null);
  const [deletingItem, setDeletingItem] = useState<Engineer | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    employee_code: '',
    email: '',
    phone: '',
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const data = await getEngineers();
    setEngineers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({ full_name: '', employee_code: '', email: '', phone: '', is_active: true });
    setDialogOpen(true);
  };

  const handleEdit = (item: Engineer) => {
    setEditingItem(item);
    setFormData({
      full_name: item.full_name,
      employee_code: item.employee_code || '',
      email: item.email || '',
      phone: item.phone || '',
      is_active: item.is_active,
    });
    setDialogOpen(true);
  };

  const handleDelete = (item: Engineer) => {
    setDeletingItem(item);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    if (editingItem) {
      await updateEngineer(editingItem.id, formData);
    } else {
      await createEngineer(formData);
    }

    await loadData();
    setDialogOpen(false);
    setSubmitting(false);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;

    await deleteEngineer(deletingItem.id);
    await loadData();
    setDeleteDialogOpen(false);
    setDeletingItem(null);
  };

  const columns = [
    { key: 'full_name', label: 'Нэр' },
    { key: 'employee_code', label: 'Код' },
    { key: 'email', label: 'Имэйл' },
    { key: 'phone', label: 'Утас' },
    {
      key: 'is_active',
      label: 'Төлөв',
      render: (item: Engineer) => (
        <Badge variant={item.is_active ? 'default' : 'secondary'}>
          {item.is_active ? 'Идэвхтэй' : 'Идэвхгүй'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Инженерүүд</h1>
          <p className="text-muted-foreground">Инженерийн жагсаалт удирдах</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Шинэ нэмэх
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Бүх инженерүүд ({engineers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <DataTable
              data={engineers}
              columns={columns}
              onEdit={handleEdit}
              onDelete={handleDelete}
              searchPlaceholder="Инженер хайх..."
            />
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Инженер засах' : 'Шинэ инженер нэмэх'}
            </DialogTitle>
            <DialogDescription>Инженерийн мэдээллийг оруулна уу</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Овог нэр *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Инженерийн нэр"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employee_code">Ажилтны код</Label>
              <Input
                id="employee_code"
                value={formData.employee_code}
                onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })}
                placeholder="Код"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Имэйл</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Утас</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="99119911"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_active: Boolean(checked) })
                }
              />
              <Label htmlFor="is_active">Идэвхтэй</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Цуцлах
            </Button>
            <Button onClick={handleSubmit} disabled={!formData.full_name || submitting}>
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
        title="Инженер устгах уу?"
        description={`"${deletingItem?.full_name}" инженерийг устгах гэж байна. Энэ үйлдлийг буцаах боломжгүй.`}
      />
    </div>
  );
}
