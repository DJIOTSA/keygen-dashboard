'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Copy, CreditCard as Edit, Ellipsis, Key, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
import { apiClient } from '@/lib/api-client';
import { KeygenLicense } from '@/lib/types';
import { toast } from 'sonner';

export default function LicensesPage() {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<KeygenLicense | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: licenses, isLoading } = useQuery({
    queryKey: ['licenses'],
    queryFn: async () => await apiClient.getLicenses(1, 100),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteLicense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['licenses'] });
      setIsDeleteDialogOpen(false);
      setSelectedLicense(null);
      toast.success("License deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });


  const handleDelete = async () => {
    if (selectedLicense) {
      await deleteMutation.mutateAsync(selectedLicense.id);
    }
  };

  const copyLicenseKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("License key copied to clipboard");
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
          <Badge variant={getStatusColor(status)}>
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
                <Ellipsis className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => navigate(`/dashboard/licenses/${license.id}`)}
              >
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
      <>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading licenses...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Licenses</h1>
            <p className="text-muted-foreground">
              Manage software licenses and their assignments
            </p>
          </div>
          <Button onClick={() => navigate('/dashboard/licenses/new')}>
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
    </>
  );
}