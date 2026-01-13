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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  getBuildings,
  getOrganizations,
  createBuilding,
  updateBuilding,
  deleteBuilding,
} from '@/lib/data-service';
import type { Building, Organization } from '@/types';

export default function BuildingsPage() {
  const [buildings, setBuildings] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [deletingItem, setDeletingItem] = useState<any | null>(null);
  const [formData, setFormData] = useState({ organization_id: '', name: '', code: '' });
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [buildingsData, orgsData] = await Promise.all([
      getBuildings(),
      getOrganizations()
    ]);
    setBuildings(buildingsData);
    setOrganizations(orgsData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({ organization_id: '', name: '', code: '' });
    setDialogOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      organization_id: item.organization_id || '',
      name: item.name,
      code: item.code || ''
    });
    setDialogOpen(true);
  };

  const handleDelete = (item: any) => {
    setDeletingItem(item);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    if (editingItem) {
      await updateBuilding(editingItem.id, formData);
    } else {
      await createBuilding(formData);
    }

    await loadData();
    setDialogOpen(false);
    setSubmitting(false);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;

    await deleteBuilding(deletingItem.id);
    await loadData();
    setDeleteDialogOpen(false);
    setDeletingItem(null);
  };

  const columns = [
    {
      key: 'name',
      label: 'Нэр',
    },
    {
      key: 'code',
      label: 'Код',
    },
    {
      key: 'organization_id',
      label: 'Байгууллага',
      render: (item: any) => {
        const org = organizations.find((o) => o.id === item.organization_id);
        return org?.name || '-';
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Барилгууд</h1>
          <p className="text-muted-foreground">Барилгын жагсаалт удирдах</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Шинэ нэмэх
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Бүх барилгууд ({buildings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <DataTable
              data={buildings}
              columns={columns}
              onEdit={handleEdit}
              onDelete={handleDelete}
              searchPlaceholder="Барилга хайх..."
            />
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Барилга засах' : 'Шинэ барилга нэмэх'}
            </DialogTitle>
            <DialogDescription>Барилгын мэдээллийг оруулна уу</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="organization_id">Байгууллага *</Label>
              <Select
                value={formData.organization_id}
                onValueChange={(value) => setFormData({ ...formData, organization_id: value })}
              >
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
            <div className="space-y-2">
              <Label htmlFor="name">Нэр *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Барилгын нэр"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Код</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="Барилгын код"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Цуцлах
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.name || !formData.organization_id || submitting}
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
        title="Барилга устгах уу?"
        description={`"${deletingItem?.name}" барилгыг устгах гэж байна. Энэ үйлдлийг буцаах боломжгүй.`}
      />
    </div>
  );
}
