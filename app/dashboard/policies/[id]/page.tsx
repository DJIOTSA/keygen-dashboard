"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useCopyToClipboard } from "react-use";

import { Button } from "@/components/ui/button";
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
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api-client";
import type { KeygenPolicy } from "@/lib/types";
import { parseMetadata } from "@/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { z } from "zod";

const policySchema = z.object({
  name: z.string().min(1, "Policy name is required"),
  duration: z
    .number({ min: 86400, message: "Duration must be at least 1 day" })
    .nullable(),
  strict: z.boolean().optional(),
  floating: z.boolean().optional(),
  requireHeartbeat: z.boolean().optional(),
  requireCheckIn: z.boolean().optional(),
  checkInInterval: z.string().nullable(),
  checkInIntervalCount: z.number().nullable(),
  requireProductScope: z.boolean().optional(),
  usePool: z.boolean().nullable(),
  maxMachines: z.number().nullable(),
  maxProcesses: z.number().nullable(),
  maxCores: z.number().nullable(),
  maxUses: z.number().nullable(),
  encrypted: z.boolean().optional(),
  protected: z.boolean().optional(),
  scheme: z.string(),
  productId: z.string().min(1, "Product is required"),
  metadata: z.string().nullable(),
});

type PayloadResponse = {
  meta: string;
  error?: Array<{
    title: string;
    detail: string;
    source: {
      pointer: string;
    };
  }>;
  data?: KeygenPolicy;
};

type PolicyFormData = z.infer<typeof policySchema>;

type Payload = {
  attributes: Omit<PolicyFormData, "productId">;
  relationships: {
    product: {
      data: { id: string; type: "products" };
    };
  };
  type: string;
};

const SCHEMES = [
  "ED25519_SIGN",
  "RSA_2048_PKCS1_SIGN",
  "RSA_2048_PKCS1_PSS_SIGN",
  "RSA_2048_JWT_RS256",
];

const CHECK_IN_INTERVALS = ["day", "week", "month", "year"];

export default function EditPolicy() {
  const [, copyToClipboard] = useCopyToClipboard();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => apiClient.getProducts(1, 100),
  });

  const { data: policy, isLoading: policyLoading } = useQuery({
    queryKey: ["policy", params.id],
    queryFn: () => apiClient.getPolicy(params.id),
    enabled: !!params.id,
  });
  const isEditing = !!params.id && params.id !== "new" && !policyLoading;

  console.log({ paramsId: params.id, policy, products });

  const form = useForm<PolicyFormData>({
    resolver: zodResolver(policySchema),
    defaultValues: isEditing
      ? {
          name: policy?.data?.attributes.name || "",
          duration: policy?.data?.attributes.duration || 86400,
          strict: policy?.data?.attributes.strict || false,
          floating: policy?.data?.attributes.floating || false,
          requireHeartbeat: policy?.data?.attributes.requireHeartbeat || false,
          requireCheckIn: policy?.data?.attributes.requireCheckIn || false,
          checkInInterval: policy?.data?.attributes.checkInInterval || null,
          checkInIntervalCount:
            policy?.data?.attributes.checkInIntervalCount || null,
          usePool: policy?.data?.attributes.usePool || false,
          maxMachines: policy?.data?.attributes.maxMachines || null,
          maxProcesses: policy?.data?.attributes.maxProcesses || null,
          maxCores: policy?.data?.attributes.maxCores || null,
          maxUses: policy?.data?.attributes.maxUses || null,
          encrypted: policy?.data?.attributes.encrypted || false,
          protected: policy?.data?.attributes.protected || false,
          scheme: policy?.data?.attributes.scheme || "",
          productId: policy?.data?.relationships?.product?.data?.id || "",
          metadata: policy?.data?.attributes.metadata
            ? JSON.stringify(policy?.data?.attributes.metadata, null, 2)
            : "",
        }
      : {
          name: "",
          duration: 86400,
          strict: false,
          floating: false,
          requireHeartbeat: false,
          requireCheckIn: false,
          checkInInterval: null,
          checkInIntervalCount: null,
          usePool: false,
          maxMachines: null,
          maxProcesses: null,
          maxCores: null,
          maxUses: null,
          encrypted: false,
          protected: false,
          scheme: "",
          productId: "",
          metadata: "",
        },
  });
  console.log({ errorform: form.formState.errors });

  const mutation = useMutation<PayloadResponse, Error, Payload>({
    mutationFn: async (payload) => {
      const response = isEditing
        ? await apiClient.updatePolicy(policy?.data?.id as string, payload)
        : await apiClient.createPolicy(payload);
      if (response.error) {
        throw new Error(response.error[0]?.detail || "An error occurred");
      }
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: isEditing
          ? "Policy updated successfully."
          : "Policy created successfully.",
      });
      router.back();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const handleSubmit = (data: PolicyFormData) => {
    const { productId, ...attributes } = data;
    console.log({ data });

    const payload = !isEditing
      ? {
          attributes: {
            ...attributes,
            metadata: parseMetadata(data.metadata),
          },
          relationships: {
            product: {
              data: { id: productId, type: "products" },
            },
          },
        }
      : {
          type: "policies",
          attributes:{
            ...attributes
          },
          relationships: {
            product: {
              data: { id: productId, type: "products" },
            },
          },
        };

    mutation.mutate(payload);
  };

  const handleCopy = (text: string, field: string) => {
    copyToClipboard(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (policyLoading || productsLoading) return <Spinner />;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Policy Name</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input placeholder="My Policy" {...field} />
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
          name="productId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {products?.data.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.attributes.name}
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
          name="scheme"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Scheme</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select scheme" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SCHEMES.map((scheme) => (
                    <SelectItem key={scheme} value={scheme}>
                      {scheme}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (seconds)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="86400"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value
                          ? Number.parseInt(e.target.value)
                          : undefined
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="maxMachines"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Machines</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="1"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value
                          ? Number.parseInt(e.target.value)
                          : undefined
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="maxUses"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Uses</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Unlimited"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value
                          ? Number.parseInt(e.target.value)
                          : undefined
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="maxCores"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Cores</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Unlimited"
                    {...field}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value
                          ? Number.parseInt(e.target.value)
                          : undefined
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="strict"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Strict</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Enforce strict license validation
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="floating"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Floating</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Allow floating licenses
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="encrypted"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Encrypted</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Encrypt license keys
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
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
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit">
            {mutation.isPending
              ? isEditing
                ? "Updating..."
                : "Creating..."
              : isEditing
              ? "Update Policy"
              : "Create Policy"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
