'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Check, Edit, MoreHorizontal, Plus, Shield, Trash2 } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { KeygenPolicy } from '@/lib/types';

export default function PoliciesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<KeygenPolicy | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    productId: '',
    strict: false,
    floating: false,
    requireHeartbeat: false,
    maxMachines: '',
    maxUses: '',
    duration: '',
    scheme: 'ED25519_SIGN',
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: policies, isLoading } = useQuery({
    queryKey: ['policies'],
    queryFn: () => apiClient.getPolicies(1, 100),
  });

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: () => apiClient.getProducts(1, 100),
  });

  const createMutation = useMutation({
    mutationFn: (policyData: any) => apiClient.createPolicy(policyData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      setIsCreateDialogOpen(false);
      setFormData({
        name: '',
        productId: '',
        strict: false,
        floating: false,
        requireHeartbeat: false,
        maxMachines: '',
        maxUses: '',
        duration: '',
        scheme: 'ED25519_SIGN',
      });
      toast({
        title: 'Policy created',
        description: 'The policy has been created successfully.',
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
    mutationFn: (id: string) => apiClient.deletePolicy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      setIsDeleteDialogOpen(false);
      setSelectedPolicy(null);
      toast({
        title: 'Policy deleted',
        description: 'The policy has been deleted successfully.',
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
    const policyData = {
      attributes: {
        name: formData.name,
        strict: formData.strict,
        floating: formData.floating,
        requireHeartbeat: formData.requireHeartbeat,
        scheme: formData.scheme,
        ...(formData.maxMachines && { maxMachines: parseInt(formData.maxMachines) }),
        ...(formData.maxUses && { maxUses: parseInt(formData.maxUses) }),
        ...(formData.duration && { duration: parseInt(formData.duration) }),
      },
      relationships: {
        ...(formData.productId && {
          product: {
            data: { type: 'products', id: formData.productId }
          }
        }),
      },
    };
    createMutation.mutate(policyData);
  };

  const handleDelete = () => {
    if (selectedPolicy) {
      deleteMutation.mutate(selectedPolicy.id);
    }
  };

  const columns: ColumnDef<KeygenPolicy>[] = [
    {
      accessorKey: 'attributes.name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.original.attributes.name}</span>
        </div>
      ),
    },
    {
      accessorKey: 'attributes.scheme',
      header: 'Scheme',
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.attributes.scheme}
        </Badge>
      ),
    },
    {
      accessorKey: 'attributes.maxMachines',
      header: 'Max Machines',
      cell: ({ row }) => {
        const max = row.original.attributes.maxMachines;
        return max ? (
          <Badge variant="secondary">{max}</Badge>
        ) : (
          <span className="text-muted-foreground">Unlimited</span>
        );
      },
    },
    {
      accessorKey: 'attributes.maxUses',
      header: 'Max Uses',
      cell: ({ row }) => {
        const max = row.original.attributes.maxUses;
        return max ? (
          <Badge variant="secondary">{max}</Badge>
        ) : (
          <span className="text-muted-foreground">Unlimited</span>
        );
      },
    },
    {
      accessorKey: 'attributes.duration',
      header: 'Duration',
      cell: ({ row }) => {
        const duration = row.original.attributes.duration;
        return duration ? (
          <Badge variant="outline">{duration}s</Badge>
        ) : (
          <span className="text-muted-foreground">Permanent</span>
        );
      },
    },
    {
      header: 'Flags',
      cell: ({ row }) => {
        const policy = row.original.attributes;
        return (
          <div className="flex items-center space-x-2">
            {policy.strict && (
              <Badge variant="outline" className="text-xs">
                <Check className="h-3 w-3 mr-1" />
                Strict
              </Badge>
            )}
            {policy.floating && (
              <Badge variant="outline" className="text-xs">
                <Check className="h-3 w-3 mr-1" />
                Floating
              </Badge>
            )}
            {policy.requireHeartbeat && (
              <Badge variant="outline" className="text-xs">
                <Check className="h-3 w-3 mr-1" />
                Heartbeat
              </Badge>
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
        const policy = row.original;
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
                  setSelectedPolicy(policy);
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
            <p>Loading policies...</p>
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
            <h1 className="text-3xl font-bold tracking-tight">Policies</h1>
            <p className="text-muted-foreground">
              Define license policies and validation rules
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Policy
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={policies?.data || []}
          searchKey="attributes.name"
          searchPlaceholder="Search policies..."
        />

        {/* Create Policy Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Policy</DialogTitle>
              <DialogDescription>
                Define a new license policy with validation rules
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <Label htmlFor="name">Policy Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Premium Policy"
                />
              </div>
              
              <div>
                <Label htmlFor="productId">Product (Optional)</Label>
                <Select
                  value={formData.productId}
                  onValueChange={(value) => setFormData({ ...formData, productId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products?.data.map((product: any) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.attributes.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="scheme">Encryption Scheme</Label>
                <Select
                  value={formData.scheme}
                  onValueChange={(value) => setFormData({ ...formData, scheme: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select scheme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ED25519_SIGN">ED25519 Sign</SelectItem>
                    <SelectItem value="RSA_2048_PKCS1_SIGN">RSA 2048 PKCS1</SelectItem>
                    <SelectItem value="RSA_2048_PSS_SIGN">RSA 2048 PSS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxMachines">Max Machines</Label>
                  <Input
                    id="maxMachines"
                    type="number"
                    value={formData.maxMachines}
                    onChange={(e) => setFormData({ ...formData, maxMachines: e.target.value })}
                    placeholder="Leave empty for unlimited"
                  />
                </div>
                <div>
                  <Label htmlFor="maxUses">Max Uses</Label>
                  <Input
                    id="maxUses"
                    type="number"
                    value={formData.maxUses}
                    onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                    placeholder="Leave empty for unlimited"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="duration">Duration (seconds)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="Leave empty for permanent"
                />
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Strict Mode</Label>
                    <div className="text-sm text-muted-foreground">
                      Enforce strict license validation
                    </div>
                  </div>
                  <Switch
                    checked={formData.strict}
                    onCheckedChange={(checked) => setFormData({ ...formData, strict: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Floating License</Label>
                    <div className="text-sm text-muted-foreground">
                      Allow license to move between machines
                    </div>
                  </div>
                  <Switch
                    checked={formData.floating}
                    onCheckedChange={(checked) => setFormData({ ...formData, floating: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Heartbeat</Label>
                    <div className="text-sm text-muted-foreground">
                      Require periodic heartbeat validation
                    </div>
                  </div>
                  <Switch
                    checked={formData.requireHeartbeat}
                    onCheckedChange={(checked) => setFormData({ ...formData, requireHeartbeat: checked })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Policy'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Policy Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Policy</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{selectedPolicy?.attributes.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? 'Deleting...' : 'Delete Policy'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}