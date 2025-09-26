/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Copy, Plus, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useCopyToClipboard } from "react-use";
import { z } from "zod";

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
import type { KeygenProduct } from "@/lib/types";
import { parseMetadata } from "@/lib/utils";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  code: z.string().optional(),
  url: z.string().url().optional().or(z.literal("")),
  distributionStrategy: z
    .string()
    .min(1, "Distribution strategy is required")
    .optional(),
  platforms: z.array(z.string()).optional(),
  metadata: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductModalProps {
  id?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: KeygenProduct | null;
  title?: string;
  description?: string;
  trigger?: React.ReactNode;
}

const DISTRIBUTION_STRATEGIES = ["LICENSED", "OPEN", "CLOSED"];

const COMMON_PLATFORMS = ["windows", "macos", "linux", "ios", "android", "web"];

export function EditProductModal({
  id,
  open,
  onOpenChange,
  product,
  title,
  description,
  trigger,
}: ProductModalProps) {
  const [, copyToClipboard] = useCopyToClipboard();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [newPlatform, setNewPlatform] = useState("");
  const queryClient = useQueryClient();
  console.log({product})

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.attributes.name,
      code: product?.attributes?.code,
      url: product?.attributes.url,
      distributionStrategy: product?.attributes.distributionStrategy,
      platforms: product?.attributes.platforms || [],
      metadata: product?.attributes.metadata
        ? JSON.stringify(product.attributes.metadata, null, 2)
        : undefined,
    },
  });

  const editMutation = useMutation({
    mutationFn: async (productData: Partial<ProductFormData>) => {
      if (!id) {
        return await apiClient.createProduct({
          ...productData,
          metadata: parseMetadata(productData.metadata || ""),
        });
      }
      return await apiClient.updateProduct(id, {
        ...productData,
        metadata: parseMetadata(productData.metadata || ""),
      });
    },
    onSuccess: async () => {
      toast.success("Product created successfully");
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      onOpenChange(false);
      form.reset({
        name: "",
        url: "",
        distributionStrategy: "LICENSED",
        platforms: [],
        metadata: "",
      });
    },
    onError: (error: any) => {
      console.log("Error creating product:", error);
      toast.error(error.message);
    },
  });

  const formData = form.watch();

  const handleSubmit = () => {
    const { metadata, ...rest } = formData;
    editMutation.mutate({
      ...rest,
      ...(metadata && { metadata }),
    });
  };
  const handleCopy = (text: string, field: string) => {
    copyToClipboard(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const isEditing = !!product && !!id;
  const modalTitle = title || (isEditing ? "Edit Product" : "Create Product");
  const modalDescription =
    description ||
    (isEditing
      ? "Update product information"
      : "Add a new product to your Keygen server");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button variant="outline">
            {" "}
            {isEditing ? "Edit" : "Add"} Product
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
          <DialogDescription>{modalDescription}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="My Awesome Product" {...field} />
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
                      <SelectTrigger>
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
                      {(Array.isArray(field.value) ? field.value : []).map(
                        (platform: string, idx: number) => (
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
                                  Array.isArray(field.value) ? field.value : []
                                ).filter((p: string) => p !== platform);
                                field.onChange(next);
                              }}
                              className="ml-1 inline-flex items-center"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        )
                      )}
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
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => handleSubmit()}
                disabled={editMutation.isPending}
              >
                {editMutation.isPending
                  ? isEditing
                    ? "Updating..."
                    : "Creating..."
                  : isEditing
                  ? "Update Product"
                  : "Create Product"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
