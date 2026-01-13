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
  getOrganizations,
  createOrganization,
  updateOrganization,
  deleteOrganization,
} from '@/lib/data-service';
import type { Organization } from '@/types';
import { format } from 'date-fns';

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [deletingOrg, setDeletingOrg] = useState<Organization | null>(null);
  const [formData, setFormData] = useState({ name: '', name_en: '' });
  const [submitting, setSubmitting] = useState(false);

  const loadOrganizations = async () => {
    setLoading(true);
    const data = await getOrganizations();
    setOrganizations(data);
    setLoading(false);
  };

  useEffect(() => {
    loadOrganizations();
  }, []);

  const handleCreate = () => {
    setEditingOrg(null);
    setFormData({ name: '', name_en: '' });
    setDialogOpen(true);
  };

  const handleEdit = (org: Organization) => {
    setEditingOrg(org);
    setFormData({ name: org.name, name_en: org.name_en || '' });
    setDialogOpen(true);
  };

  const handleDelete = (org: Organization) => {
    setDeletingOrg(org);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    if (editingOrg) {
      await updateOrganization(editingOrg.id, formData);
    } else {
      await createOrganization(formData);
    }

    await loadOrganizations();
    setDialogOpen(false);
    setSubmitting(false);
  };

  const handleConfirmDelete = async () => {
    if (!deletingOrg) return;

    await deleteOrganization(deletingOrg.id);
    await loadOrganizations();
    setDeleteDialogOpen(false);
    setDeletingOrg(null);
  };

  const columns = [
    { key: 'name', label: 'Нэр' },
    { key: 'name_en', label: 'Англи нэр' },
    {
      key: 'created_at',
      label: 'Үүсгэсэн',
      render: (org: Organization) => format(new Date(org.created_at), 'yyyy-MM-dd'),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Байгууллагууд</h1>
          <p className="text-muted-foreground">Байгууллагын жагсаалт удирдах</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Шинэ нэмэх
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Бүх байгууллагууд ({organizations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <DataTable
              data={organizations}
              columns={columns}
              onEdit={handleEdit}
              onDelete={handleDelete}
              searchPlaceholder="Байгууллага хайх..."
            />
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingOrg ? 'Байгууллага засах' : 'Шинэ байгууллага нэмэх'}
            </DialogTitle>
            <DialogDescription>
              Байгууллагын мэдээллийг оруулна уу
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Нэр *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Байгууллагын нэр"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name_en">Англи нэр</Label>
              <Input
                id="name_en"
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                placeholder="Organization name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Цуцлах
            </Button>
            <Button onClick={handleSubmit} disabled={!formData.name || submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingOrg ? 'Хадгалах' : 'Нэмэх'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Байгууллага устгах уу?"
        description={`"${deletingOrg?.name}" байгууллагыг устгах гэж байна. Энэ үйлдлийг буцаах боломжгүй.`}
      />
    </div>
  );
}
