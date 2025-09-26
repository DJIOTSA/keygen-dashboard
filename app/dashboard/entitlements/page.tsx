'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Edit, Gift, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { DashboardLayout } from '@/components/dashboard-layout';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { KeygenEntitlement } from '@/lib/types';

export default function EntitlementsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEntitlement, setSelectedEntitlement] = useState<KeygenEntitlement | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['entitlements'],
    queryFn: () => apiClient.getEntitlements(1, 100),
  });

  const createMutation = useMutation({
    mutationFn: (entitlementData: any) => apiClient.createEntitlement(entitlementData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entitlements'] });
      setIsCreateDialogOpen(false);
      setFormData({ name: '', code: '' });
      toast({
        title: 'Entitlement created',
        description: 'The entitlement has been created successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteEntitlement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entitlements'] });
      setIsDeleteDialogOpen(false);
      setSelectedEntitlement(null);
      toast({
        title: 'Entitlement deleted',
        description: 'The entitlement has been deleted successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    },
  });

  const handleCreate = () => {
    createMutation.mutate(formData);
  };

  const handleDelete = () => {
    if (selectedEntitlement) {
      deleteMutation.mutate(selectedEntitlement.id);
    }
  };

  const columns: ColumnDef<KeygenEntitlement>[] = [
    {
      accessorKey: 'attributes.name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Gift className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.original.attributes.name}</span>
        </div>
      ),
    },
    {
      accessorKey: 'attributes.code',
      header: 'Code',
      cell: ({ row }) => (
        <code className="bg-gray-100 px-2 py-1 rounded text-sm">
          {row.original.attributes.code}
        </code>
      ),
    },
    {
      accessorKey: 'attributes.created',
      header: 'Created',
      cell: ({ row }) => format(new Date(row.original.attributes.created), 'MMM d, yyyy'),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const entitlement = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedEntitlement(entitlement);
                  setIsDeleteDialogOpen(true);
                }}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading entitlements...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Entitlements</h1>
            <p className="text-muted-foreground">
              Manage feature entitlements and access controls
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Entitlement
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={data?.data || []}
          searchKey="attributes.name"
          searchPlaceholder="Search entitlements..."
        />

        {/* Create Entitlement Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Entitlement</DialogTitle>
              <DialogDescription>
                Define a new feature entitlement for your products
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Entitlement Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Premium Features"
                />
              </div>
              <div>
                <Label htmlFor="code">Entitlement Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="PREMIUM_FEATURES"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Entitlement'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Entitlement Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Entitlement</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{selectedEntitlement?.attributes.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? 'Deleting...' : 'Delete Entitlement'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}