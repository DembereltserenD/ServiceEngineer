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
  getSystemTypes,
  createSystemType,
  updateSystemType,
  deleteSystemType,
} from '@/lib/data-service';
import type { SystemType } from '@/types';

export default function SystemTypesPage() {
  const [items, setItems] = useState<SystemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SystemType | null>(null);
  const [deletingItem, setDeletingItem] = useState<SystemType | null>(null);
  const [formData, setFormData] = useState({ name: '', name_en: '', icon: '', color: '' });
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const data = await getSystemTypes();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({ name: '', name_en: '', icon: '', color: '#3b82f6' });
    setDialogOpen(true);
  };

  const handleEdit = (item: SystemType) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      name_en: item.name_en || '',
      icon: item.icon || '',
      color: item.color || '#3b82f6',
    });
    setDialogOpen(true);
  };

  const handleDelete = (item: SystemType) => {
    setDeletingItem(item);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    if (editingItem) {
      await updateSystemType(editingItem.id, formData);
    } else {
      await createSystemType(formData);
    }

    await loadData();
    setDialogOpen(false);
    setSubmitting(false);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;

    await deleteSystemType(deletingItem.id);
    await loadData();
    setDeleteDialogOpen(false);
    setDeletingItem(null);
  };

  const columns = [
    { key: 'name', label: 'Нэр' },
    { key: 'name_en', label: 'Англи нэр' },
    { key: 'icon', label: 'Дүрс' },
    {
      key: 'color',
      label: 'Өнгө',
      render: (item: SystemType) => (
        <div className="flex items-center gap-2">
          <div
            className="h-6 w-6 rounded border"
            style={{ backgroundColor: item.color || '#ccc' }}
          />
          <span className="text-sm text-muted-foreground">{item.color}</span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Системийн төрлүүд</h1>
          <p className="text-muted-foreground">Системийн төрлийн жагсаалт удирдах</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Шинэ нэмэх
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Бүх системийн төрлүүд ({items.length})</CardTitle>
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
              searchPlaceholder="Системийн төрөл хайх..."
            />
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Системийн төрөл засах' : 'Шинэ системийн төрөл нэмэх'}
            </DialogTitle>
            <DialogDescription>Системийн төрлийн мэдээллийг оруулна уу</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Нэр *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Системийн нэр"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name_en">Англи нэр</Label>
              <Input
                id="name_en"
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                placeholder="System name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="icon">Дүрс (Lucide icon нэр)</Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="Phone, Camera, Flame..."
              />
              <p className="text-xs text-muted-foreground">
                Жишээ: Phone, Camera, Flame, Key, Car, Volume2
              </p>
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
        title="Системийн төрөл устгах уу?"
        description={`"${deletingItem?.name}" системийн төрлийг устгах гэж байна. Энэ үйлдлийг буцаах боломжгүй.`}
      />
    </div>
  );
}
