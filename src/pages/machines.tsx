'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Activity, Copy, Ellipsis, Monitor, Trash2 } from 'lucide-react';
import { useState } from 'react';

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
import { KeygenMachine } from '@/lib/types';
import { toast } from 'sonner';

export default function MachinesPage() {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<KeygenMachine | null>(null);

  const copyLicenseKey = (key: string, message: string = 'Copied to clipboard') => {
    navigator.clipboard.writeText(key);
    toast.success(message);
  };

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['machines'],
    queryFn: () => apiClient.getMachines(1, 100),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteMachine(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['machines'] });
      setIsDeleteDialogOpen(false);
      setSelectedMachine(null);
      toast.success('Machine deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleDelete = async () => {
    if (selectedMachine) {
      await deleteMutation.mutateAsync(selectedMachine.id);
    }
  };

  const getStatusColor = (lastValidated?: string) => {
    if (!lastValidated) return 'outline';
    
    const lastValidatedDate = new Date(lastValidated);
    const now = new Date();
    const diffInHours = (now.getTime() - lastValidatedDate.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) return 'default'; // Active (green)
    if (diffInHours < 168) return 'secondary'; // Idle (yellow)
    return 'destructive'; // Inactive (red)
  };

  const getStatusText = (lastValidated?: string) => {
    if (!lastValidated) return 'Never';
    
    const lastValidatedDate = new Date(lastValidated);
    const now = new Date();
    const diffInHours = (now.getTime() - lastValidatedDate.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Active';
    if (diffInHours < 24) return 'Recent';
    if (diffInHours < 168) return 'Idle';
    return 'Inactive';
  };

  const columns: ColumnDef<KeygenMachine>[] = [
    {
      accessorKey: 'attributes.name',
      header: 'Name',
      cell: ({ row }) => {
        const name = row.original.attributes.name;
        return name ? (
          <div className="flex items-center space-x-2">
            <Monitor className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{name}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">Unnamed</span>
        );
      },
    },
    {
      accessorKey: 'attributes.hostname',
      header: 'Hostname',
      cell: ({ row }) => (
        <code className="bg-gray-100 px-2 py-1 rounded text-sm">
          {row.original.attributes.hostname}
        </code>
      ),
    },
    {
      accessorKey: 'attributes.platform',
      header: 'Platform',
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.attributes.platform}
        </Badge>
      ),
    },
    {
      accessorKey: 'attributes.cores',
      header: 'CPU Cores',
      cell: ({ row }) => (
        <Badge variant="secondary">
          {row.original.attributes.cores}
        </Badge>
      ),
    },
    {
      accessorKey: 'attributes.ip',
      header: 'IP Address',
      cell: ({ row }) => (
        <code className="text-sm">{row.original.attributes.ip}</code>
      ),
    },
    {
      accessorKey: 'attributes.lastValidated',
      header: 'Status',
      cell: ({ row }) => {
        const lastValidated = row.original.attributes.lastValidated;
        return (
          <div className="flex items-center space-x-2">
            <Activity className="h-3 w-3" />
            <Badge variant={getStatusColor(lastValidated)}>
              {getStatusText(lastValidated)}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: 'relationships.license.data.id',
      header: 'License id',
      cell: ({ row }) => {
        const licenseId = row.original.relationships?.license?.data?.id;
        return (
          <div className="flex items-center space-x-2">
            <span>{licenseId?.substring(0, 4)}...{licenseId?.substring(licenseId?.length - 4)}</span>
            {licenseId && (
              <Copy className="h-4 w-4" onClick={() => copyLicenseKey(licenseId, 'License id copied to clipboard')} />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'relationships.user.data.id',
      header: 'User id',
      cell: ({ row }) => {
        const userId = row.original.relationships?.user?.data?.id;
        return (
          <div className="flex items-center space-x-2">
            <span>{userId?.substring(0, 4)}...{userId?.substring(userId?.length - 4)}</span> 
            {userId && (
              <Copy className="h-4 w-4" onClick={() => copyLicenseKey(userId, 'User id copied to clipboard')} />
            )}
          </div>
        );
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
        const machine = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <Ellipsis className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setSelectedMachine(machine);
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
            <p>Loading machines...</p>
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
            <h1 className="text-3xl font-bold tracking-tight">Machines</h1>
            <p className="text-muted-foreground">
              Monitor registered machines and their license usage
            </p>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={data?.data || []}
          searchKey="attributes.hostname"
          searchPlaceholder="Search machines by hostname..."
        />

        {/* Delete Machine Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Machine</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete <strong>{selectedMachine?.attributes.hostname}</strong>? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? 'Deleting...' : 'Delete Machine'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}