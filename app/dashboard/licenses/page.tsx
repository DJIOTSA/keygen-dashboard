'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Copy, Edit, Key, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { DashboardLayout } from '@/components/dashboard-layout';
import { DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { KeygenLicense } from '@/lib/types';

export default function LicensesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<KeygenLicense | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    userId: '',
    policyId: '',
    expiry: '',
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: licenses, isLoading } = useQuery({
    queryKey: ['licenses'],
    queryFn: () => apiClient.getLicenses(1, 100),
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiClient.getUsers(1, 100),
  });

  const { data: policies } = useQuery({
    queryKey: ['policies'],
    queryFn: () => apiClient.getPolicies(1, 100),
  });

  const createMutation = useMutation({
    mutationFn: (licenseData: any) => apiClient.createLicense(licenseData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      setIsCreateDialogOpen(false);
      setFormData({ name: '', userId: '', policyId: '', expiry: '' });
      toast({
        title: 'License created',
        description: 'The license has been created successfully.',
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
    mutationFn: (id: string) => apiClient.deleteLicense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      setIsDeleteDialogOpen(false);
      setSelectedLicense(null);
      toast({
        title: 'License deleted',
        description: 'The license has been deleted successfully.',
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
    const licenseData = {
      attributes: {
        name: formData.name || undefined,
        expiry: formData.expiry || undefined,
      },
      relationships: {
        ...(formData.userId && {
          user: {
            data: { type: 'users', id: formData.userId }
          }
        }),
        ...(formData.policyId && {
          policy: {
            data: { type: 'policies', id: formData.policyId }
          }
        }),
      },
    };
    createMutation.mutate(licenseData);
  };

  const handleDelete = () => {
    if (selectedLicense) {
      deleteMutation.mutate(selectedLicense.id);
    }
  };

  const copyLicenseKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: 'Copied',
      description: 'License key copied to clipboard',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'expired': return 'destructive';
      case 'suspended': return 'secondary';
      default: return 'outline';
    }
  };

  const columns: ColumnDef<KeygenLicense>[] = [
    {
      accessorKey: 'attributes.name',
      header: 'Name',
      cell: ({ row }) => {
        const name = row.original.attributes.name;
        return name ? (
          <div className="flex items-center space-x-2">
            <Key className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{name}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">Unnamed</span>
        );
      },
    },
    {
      accessorKey: 'attributes.key',
      header: 'License Key',
      cell: ({ row }) => {
        const key = row.original.attributes.key;
        const displayKey = `${key.substring(0, 8)}...${key.substring(key.length - 8)}`;
        return (
          <div className="flex items-center space-x-2">
            <code className="bg-gray-100 px-2 py-1 rounded text-sm">{displayKey}</code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyLicenseKey(key)}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: 'attributes.status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.attributes.status;
        return (
          <Badge variant={getStatusColor(status) as any}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'attributes.uses',
      header: 'Uses',
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.attributes.uses}
        </Badge>
      ),
    },
    {
      accessorKey: 'attributes.expiry',
      header: 'Expiry',
      cell: ({ row }) => {
        const expiry = row.original.attributes.expiry;
        return expiry ? format(new Date(expiry), 'MMM d, yyyy') : 'Never';
      },
    },
    {
      accessorKey: 'attributes.created',
      header: 'Created',
      cell: ({ row }) => format(new Date(row.original.attributes.created), 'MMM d, yyyy'),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const license = row.original;
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
                onClick={() => copyLicenseKey(license.attributes.key)}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Key
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedLicense(license);
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
            <p>Loading licenses...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Licenses</h1>
            <p className="text-muted-foreground">
              Manage software licenses and their assignments
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add License
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={licenses?.data || []}
          searchKey="attributes.name"
          searchPlaceholder="Search licenses..."
        />

        {/* Create License Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create License</DialogTitle>
              <DialogDescription>
                Generate a new license for your software
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">License Name (Optional)</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Premium License"
                />
              </div>
              <div>
                <Label htmlFor="userId">Assign to User (Optional)</Label>
                <Select
                  value={formData.userId}
                  onValueChange={(value) => setFormData({ ...formData, userId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users?.data.map((user: any) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.attributes.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="policyId">Policy (Optional)</Label>
                <Select
                  value={formData.policyId}
                  onValueChange={(value) => setFormData({ ...formData, policyId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a policy" />
                  </SelectTrigger>
                  <SelectContent>
                    {policies?.data.map((policy: any) => (
                      <SelectItem key={policy.id} value={policy.id}>
                        {policy.attributes.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="expiry">Expiry Date (Optional)</Label>
                <Input
                  id="expiry"
                  type="datetime-local"
                  value={formData.expiry}
                  onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create License'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete License Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete License</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this license? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? 'Deleting...' : 'Delete License'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}