'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Copy, MoreHorizontal, Trash2 } from 'lucide-react';
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
import { KeygenToken } from '@/lib/types';
import { toast } from 'sonner';

export default function TokensPage() {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<KeygenToken | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['tokens'],
    queryFn: () => apiClient.getTokens(1, 100),
  });

  const copyLicenseKey = (key: string, message: string = 'Copied to clipboard') => {
    navigator.clipboard.writeText(key);
    toast.success(message);
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await apiClient.deleteToken(id),
    onSuccess:async () => {
      await queryClient.invalidateQueries({ queryKey: ['tokens'] });
      setIsDeleteDialogOpen(false);
      setSelectedToken(null);
      toast.success('Token deleted successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleDelete = async () => {
    if (selectedToken) {
     await deleteMutation.mutateAsync(selectedToken.id);
    }
  };

  const columns: ColumnDef<KeygenToken>[] = [
    {
      accessorKey: 'id',
      header: 'Token',
      cell: ({ row }) => {
        const id = row.original.id;
        return (
          <div className="flex items-center space-x-2">
            <span>{ id ? '***********' : 'N/A'}</span>
            {id && (
              <Button variant="outline" onClick={() => copyLicenseKey(id, 'Token id copied to clipboard')}>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'attributes.kind',
      header: 'kind',
      cell: ({ row }) => {
        const kind = row.original.attributes.kind;
        return (
          <Badge variant={'secondary'}>
            {kind}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'relationships.account.data.id',
      header: 'Account id',
      cell: ({ row }) => {
        const accountId = row.original.relationships?.account?.data?.id;
        return (
          <div className="flex items-center space-x-2">
            <span>{ accountId ? '***********' : 'N/A'}</span>
            {accountId && (
              <Button variant="outline" onClick={() => copyLicenseKey(accountId, 'Account id copied to clipboard')}>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'relationships.bearer.data.id',
      header: 'User ID',
      cell: ({ row }) => {
        const bearerId = row.original.relationships?.bearer?.data?.id;
        return (
          <div className="flex items-center space-x-2">
            <span>{ bearerId ? '***********' : 'N/A'}</span>
            {bearerId && (
              <Button variant="outline" onClick={() => copyLicenseKey(bearerId, 'User id copied to clipboard')}>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'attributes.expiry',
      header: 'Expiry',
      cell: ({ row }) => row.original.attributes.expiry ? format(new Date(row.original.attributes.expiry), 'MMM d, yyyy hh:mm a') : 'N/A',
    },
    {
      accessorKey: 'attributes.updated',
      header: 'Updated',
      cell: ({ row }) => format(new Date(row.original.attributes.updated), 'MMM d, yyyy hh:mm a'),
    },
    {
      accessorKey: 'attributes.created',
      header: 'Created',
      cell: ({ row }) => format(new Date(row.original.attributes.created), 'MMM d, yyyy hh:mm a'),
    },
    {
      id: 'actions',
        cell: ({ row }) => {
          const token = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedToken(token);
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
            <p>Loading tokens...</p>
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
            <h1 className="text-3xl font-bold tracking-tight">Tokens</h1>
            <p className="text-muted-foreground">
              Manage API tokens and their permissions
            </p>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={data?.data || []}
          searchKey="attributes.kind"
          searchPlaceholder="Search tokens by kind..."
        />

        {/* Delete Token Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Token</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this token? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? 'Deleting...' : 'Delete Token'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}