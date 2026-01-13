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
import {
  getTaskStatuses,
  createTaskStatus,
  updateTaskStatus,
  deleteTaskStatus,
} from '@/lib/data-service';
import type { TaskStatus } from '@/types';

export default function TaskStatusesPage() {
  const [items, setItems] = useState<TaskStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TaskStatus | null>(null);
  const [deletingItem, setDeletingItem] = useState<TaskStatus | null>(null);
  const [formData, setFormData] = useState({ name: '', name_en: '', color: '', sort_order: 0 });
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const data = await getTaskStatuses();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({ name: '', name_en: '', color: '#3b82f6', sort_order: items.length + 1 });
    setDialogOpen(true);
  };

  const handleEdit = (item: TaskStatus) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      name_en: item.name_en || '',
      color: item.color || '#3b82f6',
      sort_order: item.sort_order,
    });
    setDialogOpen(true);
  };

  const handleDelete = (item: TaskStatus) => {
    setDeletingItem(item);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    if (editingItem) {
      await updateTaskStatus(editingItem.id, formData);
    } else {
      await createTaskStatus(formData);
    }

    await loadData();
    setDialogOpen(false);
    setSubmitting(false);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;

    await deleteTaskStatus(deletingItem.id);
    await loadData();
    setDeleteDialogOpen(false);
    setDeletingItem(null);
  };

  const columns = [
    { key: 'name', label: 'Нэр' },
    { key: 'name_en', label: 'Англи нэр' },
    {
      key: 'color',
      label: 'Өнгө',
      render: (item: TaskStatus) => (
        <div className="flex items-center gap-2">
          <div
            className="h-6 w-6 rounded border"
            style={{ backgroundColor: item.color || '#ccc' }}
          />
          <span className="text-sm text-muted-foreground">{item.color}</span>
        </div>
      ),
    },
    { key: 'sort_order', label: 'Эрэмбэ' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Төлвүүд</h1>
          <p className="text-muted-foreground">Даалгаврын төлвийн жагсаалт удирдах</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Шинэ нэмэх
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Бүх төлвүүд ({items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <DataTable
              data={items}
              columns={columns}
              onEdit={handleEdit}
              onDelete={handleDelete}
              searchPlaceholder="Төлөв хайх..."
            />
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Төлөв засах' : 'Шинэ төлөв нэмэх'}
            </DialogTitle>
            <DialogDescription>Төлвийн мэдээллийг оруулна уу</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Нэр *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Төлвийн нэр"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name_en">Англи нэр</Label>
              <Input
                id="name_en"
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                placeholder="Status name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Өнгө</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-20 h-10"
                />
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="#3b82f6"
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sort_order">Эрэмбэ *</Label>
              <Input
                id="sort_order"
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                placeholder="1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Цуцлах
            </Button>
            <Button onClick={handleSubmit} disabled={!formData.name || submitting}>
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
        title="Төлөв устгах уу?"
        description={`"${deletingItem?.name}" төлвийг устгах гэж байна. Энэ үйлдлийг буцаах боломжгүй.`}
      />
    </div>
  );
}
