"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Check,
  Copy,
  Package,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import * as z from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/lib/api-client";
import { parseMetadata } from "@/lib/utils";
import { toast } from "sonner";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  code: z.string().optional(),
  url: z.string().optional(),
  distributionStrategy: z
    .string()
    .min(1, "Distribution strategy is required")
    .optional(),
  platforms: z.array(z.string()).optional(),
  metadata: z.string().optional(),
});

const DISTRIBUTION_STRATEGIES = ["LICENSED", "OPEN", "CLOSED"];

const COMMON_PLATFORMS = ["windows", "macos", "linux", "ios", "android", "web"];

type ProductFormData = z.infer<typeof productSchema>;

export default function ProductDetailPage() {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [newPlatform, setNewPlatform] = useState("");
  const params = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const productId = params.id as string;
  const isNew = productId === "new";

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      distributionStrategy: "LICENSED",
    },
  });

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => apiClient.getProduct(productId),
    enabled: !isNew,
  });

  useEffect(() => {
    if (product && !isNew) {
      form.reset({
        name: product.data.attributes.name,
        code: product.data.attributes.code || '',
        url: product.data.attributes.url || '',
        distributionStrategy: product.data.attributes.distributionStrategy || 'LICENSED',
        platforms: product.data.attributes.platforms || [],
        metadata: product.data.attributes.metadata
          ? JSON.stringify(product.data.attributes.metadata, null, 2)
          : "",
      });
    }
  }, [product, form, isNew]);

  const createMutation = useMutation({
    mutationFn: (productData: ProductFormData) =>
      apiClient.createProduct({
        ...productData,
        metadata: parseMetadata(productData.metadata || ""),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product created successfully");
      navigate("/dashboard/products");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (productData: ProductFormData) =>
      await apiClient.updateProduct(productId, {
        ...productData,
        metadata: parseMetadata(productData.metadata || ""),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await queryClient.invalidateQueries({ queryKey: ["product", productId] });
      toast.success("Product updated successfully");
    },
    onError: (error) => {
      console.error(error);
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => await apiClient.deleteProduct(productId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      setIsDeleteDialogOpen(false);
      toast.success("Product deleted successfully");
      navigate("/dashboard/products");
    },
    onError: (error) => {
      console.error(error);
      toast.error(error.message);
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    if (isNew) {
      await createMutation.mutateAsync({
        ...data,
        code: data.code?.length ? data.code : null,
        url: data.url?.length ? data.url : null,
        distributionStrategy: data.distributionStrategy,
        platforms: data.platforms,
      });
    } else {
      console.log('update mutation')
      await updateMutation.mutateAsync({
        ...data,
        code: data.code?.length ? data.code : null,
        url: data.url?.length ? data.url : null,
        distributionStrategy: data.distributionStrategy,
        platforms: data.platforms,
      });
    }
  };

  const handleDelete = async () => {
    if (productId) {
      await deleteMutation.mutateAsync();
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (isLoading && !isNew) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading product...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard/products")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {isNew ? "Create Product" : "Edit Product"}
              </h1>
              <p className="text-muted-foreground">
                {isNew
                  ? "Add a new product to your system"
                  : "Update product information and settings"}
              </p>
            </div>
          </div>
          {!isNew && (
            <Button
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Product
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Product Information</span>
            </CardTitle>
            <CardDescription>
              {isNew
                ? "Enter the details for the new product"
                : "Update the product information below"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input
                              placeholder="My Awesome Product"
                              {...field}
                            />
                          </FormControl>
                          {field.value && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopy(field.value, "name")}
                            >
                              {copiedField === "name" ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="distributionStrategy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Distribution Strategy</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select distribution strategy" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {DISTRIBUTION_STRATEGIES.map((strategy) => (
                              <SelectItem key={strategy} value={strategy}>
                                {strategy}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="platforms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Platforms</FormLabel>
                        <div className="space-y-2">
                          {/* existing platforms */}
                          <div className="flex flex-wrap gap-2">
                            {(Array.isArray(field.value)
                              ? field.value
                              : []
                            ).map((platform: string, idx: number) => (
                              <Badge
                                key={`${platform}-${idx}`}
                                variant="secondary"
                                className="flex items-center gap-1"
                              >
                                <span>{platform}</span>

                                {/* use a real button and onMouseDown to avoid blur/click race */}
                                <button
                                  type="button"
                                  aria-label={`Remove ${platform}`}
                                  onMouseDown={(e) => {
                                    e.preventDefault(); // prevent blur/focus race
                                    const next = (
                                      Array.isArray(field.value)
                                        ? field.value
                                        : []
                                    ).filter((p: string) => p !== platform);
                                    field.onChange(next);
                                  }}
                                  className="ml-1 inline-flex items-center"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>

                          {/* add new platform input */}
                          <div className="flex gap-2">
                            <Input
                              placeholder="Add platform"
                              value={newPlatform}
                              onChange={(e) => setNewPlatform(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  const v = newPlatform.trim();
                                  if (!v) return;
                                  const curr = Array.isArray(field.value)
                                    ? field.value
                                    : [];
                                  if (!curr.includes(v)) {
                                    field.onChange([...curr, v]);
                                  }
                                  setNewPlatform("");
                                }
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const v = newPlatform.trim();
                                if (!v) return;
                                const curr = Array.isArray(field.value)
                                  ? field.value
                                  : [];
                                if (!curr.includes(v)) {
                                  field.onChange([...curr, v]);
                                }
                                setNewPlatform("");
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* quick add common platforms */}
                          <div className="flex flex-wrap gap-1">
                            {COMMON_PLATFORMS.filter(
                              (p) =>
                                !(
                                  Array.isArray(field.value) ? field.value : []
                                ).includes(p)
                            ).map((platform) => (
                              <Button
                                key={platform}
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const curr = Array.isArray(field.value)
                                    ? field.value
                                    : [];
                                  if (!curr.includes(platform)) {
                                    field.onChange([...curr, platform]);
                                  }
                                }}
                                className="h-6 px-2 text-xs"
                              >
                                + {platform}
                              </Button>
                            ))}
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="metadata"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Metadata (JSON)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='{"key": "value"}'
                            className="font-mono text-sm"
                            rows={5}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/dashboard/products")}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      createMutation.isPending || updateMutation.isPending
                    }
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {createMutation.isPending || updateMutation.isPending
                      ? "Saving..."
                      : isNew
                      ? "Create Product"
                      : "Update Product"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Delete Product Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Product</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this product? This action cannot
                be undone.
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