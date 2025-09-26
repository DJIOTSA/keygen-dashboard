"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Edit, MoreHorizontal, Package, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { DashboardLayout } from "@/components/dashboard-layout";
import { DataTable } from "@/components/data-table";
import { EditProductModal } from "@/components/molecules/edit-product-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiClient } from "@/lib/api-client";
import { KeygenProduct } from "@/lib/types";
import { toast } from "sonner";

export default function ProductsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<KeygenProduct | null>(
    null
  );
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => apiClient.getProducts(1, 100),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteProduct(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
      toast("Product deleted successfully");
    },
    onError: (error) => {
      console.log("Error deleting product:", error);
      toast.error(error.message);
    },
  });

  const handleDelete = () => {
    if (selectedProduct) {
      deleteMutation.mutate(selectedProduct.id);
    }
  };

  const columns: ColumnDef<KeygenProduct>[] = [
    {
      accessorKey: "attributes.name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.original.attributes.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "attributes.distributionStrategy",
      header: "Distribution",
      cell: ({ row }) => (
        <Badge variant="secondary">
          {row.original.attributes.distributionStrategy}
        </Badge>
      ),
    },
    {
      accessorKey: "attributes.platforms",
      header: "Platforms",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.attributes.platforms
            ?.slice(0, 3)
            .map((platform, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {platform}
              </Badge>
            ))}
          {row.original.attributes.platforms?.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{row.original.attributes.platforms.length - 3}
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "attributes.url",
      header: "URL",
      cell: ({ row }) => {
        const url = row.original.attributes.url;
        return url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {url.length > 30 ? `${url.substring(0, 30)}...` : url}
          </a>
        ) : (
          "N/A"
        );
      },
    },
    {
      accessorKey: "attributes.created",
      header: "Created",
      cell: ({ row }) =>
        format(new Date(row.original.attributes.created), "MMM d, yyyy"),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setSelectedProduct(product);
                  setTimeout(() => setIsEditDialogOpen(true), 100);
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedProduct(product);
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
            <p>Loading products...</p>
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
            <h1 className="text-3xl font-bold tracking-tight">Products</h1>
            <p className="text-muted-foreground">
              Manage your software products and their distribution settings
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={data?.data || []}
          searchKey="attributes.name"
          searchPlaceholder="Search products..."
        />

        <EditProductModal
          id={selectedProduct?.id}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          trigger={<></>}
          product={selectedProduct}
          title="Edit Product"
          description="Update product information"
        />

        <EditProductModal
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          title="Add Product"
          description="Add a new product to your Keygen server"
        />

        {/* Delete Product Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Product</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete{" "}
                {selectedProduct?.attributes.name}? This action cannot be
                undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete Product"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
