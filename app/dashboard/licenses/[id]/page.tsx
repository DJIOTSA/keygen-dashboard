"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Copy, Key, Loader, Save, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react"; // Import useEffect
import { useForm } from "react-hook-form";
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
import {
  KeygenGroup,
  KeygenLicense,
  KeygenPolicy,
  KeygenProduct,
  KeygenUser,
} from "@/lib/types";
import { parseMetadata } from "@/lib/utils";
import { toast } from "sonner";

const licenseSchema = z.object({
  name: z.string().min(1, "License name is required"),
  user: z.string().optional(),
  policy: z.string(),
  expiry: z.string().min(1, "Expiry date is required"),
  group: z.string().optional(),
  product: z.string().optional(),
  metadata: z.string().optional(),
});

type LicenseFormData = z.infer<typeof licenseSchema>;

export default function LicenseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const licenseId = params.id as string;
  const isNew = licenseId === "new";

  const {
    data: license,
    isLoading: isLicenseLoading,
    isFetched: isLicenseFetched,
  } = useQuery({
    queryKey: ["license", licenseId],
    queryFn: async () => await apiClient.getLicense(licenseId),
    enabled: !isNew,
  });

  const { data: policies, isLoading: policiesLoading } = useQuery({
    queryKey: ["policies"],
    queryFn: async () => await apiClient.getPolicies(1, 100),
    staleTime: 1000,
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => await apiClient.getUsers(1, 100),
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => await apiClient.getProducts(1, 100),
  });

  const { data: groups, isLoading: groupsLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => await apiClient.getGroups(1, 100),
  });

  const createMutation = useMutation({
    mutationFn: async (licenseData: Partial<KeygenLicense>) =>
      await apiClient.createLicense({
        attributes: licenseData.attributes,
        relationships: licenseData.relationships,
      }),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["licenses"] });
      toast.success("License created successfully");
      router.push(`/dashboard/licenses/${data.data.id}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create license");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (licenseData: Partial<KeygenLicense>) =>
      await apiClient.updateLicense(licenseId, {
        attributes: licenseData.attributes,
        relationships: licenseData.relationships,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["licenses"] });
      await queryClient.invalidateQueries({ queryKey: ["license", licenseId] });
      toast.success("License updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update license");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiClient.deleteLicense(licenseId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["licenses"] });
      toast.success("License deleted successfully");
      router.push("/dashboard/licenses");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete license");
    },
  });

  // Function to create relationships object
  const getRelationships = (data: LicenseFormData) => ({
    ...(data.user && {
      owner: {
        data: { type: "users", id: data.user },
      },
    }),
    ...(data.policy && {
      policy: {
        data: { type: "policies", id: data.policy },
      },
    }),
    ...(data.product && {
      product: {
        data: { type: "products", id: data.product },
      },
    }),
    ...(data.group && {
      group: {
        data: { type: "groups", id: data.group },
      },
    }),
  });

  const onSubmit = async (data: LicenseFormData) => {
    const formattedExpiry = new Date(data.expiry).toISOString();

    const licenseData = {
      attributes: {
        name: data.name,
        expiry: formattedExpiry,
        metadata: parseMetadata(data.metadata || ""),
      },
      relationships: isNew ? getRelationships(data) : undefined,
    };

    if (isNew) {
      await createMutation.mutateAsync(licenseData as Partial<KeygenLicense>);
    } else {
      await updateMutation.mutateAsync(licenseData as Partial<KeygenLicense>);
    }
  };

  // Memoized default values
  const defaultValues = useMemo<Partial<LicenseFormData>>(() => {
    if (isNew || !license?.data) {
      return {
        name: "",
        user: undefined,
        policy: undefined,
        expiry: "",
        group: undefined,
        product: undefined,
      };
    }

    if (!license) return undefined;

    const expiry = license.data.attributes.expiry
      ? new Date(license.data.attributes.expiry).toISOString().slice(0, 16)
      : "";
console.log({license})
    return {
      name: license.data.attributes.name ?? "",
      user: license.data.relationships?.owner?.data?.id,
      policy: license.data.relationships?.policy?.data?.id,
      expiry,
      group: license.data.relationships?.group?.data?.id,
      product: license.data.relationships?.product?.data?.id,
      metadata: license.data.attributes.metadata
        ? JSON.stringify(license.data.attributes.metadata)
        : undefined,
    };
  }, [isNew, license]);

  const form = useForm<LicenseFormData>({
    resolver: zodResolver(licenseSchema),
    mode: "onBlur",
    defaultValues,
  });

  useEffect(() => {
    if (
      !isNew &&
      isLicenseFetched &&
      license?.data &&
      !form.formState.isDirty
    ) {
      form.reset(defaultValues);
    } else if (isNew && !form.formState.isDirty) {
      form.reset(defaultValues);
    }
  }, [form, isNew, isLicenseFetched, license?.data, defaultValues]);

  const handleDelete = () => {
    deleteMutation.mutate();
    setIsDeleteDialogOpen(false);
  };

  const copyLicenseKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast("License key copied to clipboard");
  };

  const allLoading =
    isLicenseLoading ||
    policiesLoading ||
    usersLoading ||
    productsLoading ||
    groupsLoading;

  if (allLoading || !defaultValues) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
          <p>Loading license details...</p>
        </div>
      </div>
    );
  }

  if (!isNew && !license?.data) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-lg text-red-500 mb-4">License not found.</p>
        <Button onClick={() => router.push("/dashboard/licenses")}>
          Go to Licenses
        </Button>
      </div>
    );
  }

  console.log({ defaultValues });
  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard/licenses")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Licenses
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {isNew ? "Create License" : "Edit License"}
              </h1>
              <p className="text-muted-foreground">
                {isNew
                  ? "Generate a new license"
                  : "Update license information and settings"}
              </p>
            </div>
          </div>
          {!isNew && (
            <Button
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete License
            </Button>
          )}
        </div>

        {!isNew && license && (
          <Card>
            <CardHeader>
              <CardTitle>License Key</CardTitle>
              <CardDescription>
                This is the generated license key for this license
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm font-mono">
                  {/* It's safer to only show the key if it exists */}
                  {license.data.attributes.key
                    ? "*********************************************************************************"
                    : "Not available"}
                </code>
                {license.data.attributes.key && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyLicenseKey(license.data.attributes.key!)} // Assert non-null
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="mt-4 flex items-center space-x-4">
                <Badge
                  variant={
                    license.data.attributes.status === "active"
                      ? "default"
                      : "destructive"
                  }
                >
                  {license.data.attributes.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Uses: {license.data.attributes.uses}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="h-5 w-5" />
              <span>License Information</span>
            </CardTitle>
            <CardDescription>
              {isNew
                ? "Configure the new license settings"
                : "Update the license information below"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Premium License" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="expiry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Date</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* USER SELECT */}
                  <FormField
                    control={form.control}
                    name="user"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assign to User</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(
                              value === "NO_USER" ? undefined : value
                            )
                          }
                          defaultValue={defaultValues.user || "NO_USER"}
                        >
                          <FormControl>
                            {/* Re-evaluate if this should be disabled for editing */}
                            <SelectTrigger disabled={!isNew} className="w-full">
                              <SelectValue placeholder="Select a user" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NO_USER">
                              No user assigned
                            </SelectItem>
                            {users?.data.map((user: KeygenUser) => (
                              <SelectItem
                                className=""
                                key={user.id}
                                value={user.id}
                              >
                                <div className="flex items-center space-x-2">
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {user.attributes?.firstName}{" "}
                                      {user.attributes?.lastName}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {user.attributes?.email}
                                    </span>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* POLICY SELECT */}
                  <FormField
                    control={form.control}
                    name="policy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Policy</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(
                              value === "NO_POLICY" ? undefined : value
                            )
                          }
                          value={field.value || "NO_POLICY"} // Control the value for Select
                        >
                          <FormControl>
                            {/* Re-evaluate if this should be disabled for editing */}
                            <SelectTrigger disabled={!isNew} className="w-full">
                              <SelectValue placeholder="Select a policy" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NO_POLICY">
                              No policy assigned
                            </SelectItem>
                            {policies?.data.map((policy: KeygenPolicy) => (
                              <SelectItem key={policy.id} value={policy.id}>
                                {policy.attributes.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* GROUP SELECT */}
                  <FormField
                    control={form.control}
                    name="group"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assign to Group (Optional)</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(
                              value === "NO_GROUP" ? undefined : value
                            )
                          }
                          value={field.value || "NO_GROUP"} // Control the value for Select
                        >
                          <FormControl>
                            {/* Re-evaluate if this should be disabled for editing */}
                            <SelectTrigger disabled={!isNew} className="w-full">
                              <SelectValue placeholder="Select a group" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NO_GROUP">
                              No group assigned
                            </SelectItem>
                            {groups?.data.map((group: KeygenGroup) => (
                              <SelectItem
                                className=""
                                key={group.id}
                                value={group.id}
                              >
                                {group.attributes.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* PRODUCT SELECT */}
                  <FormField
                    control={form.control}
                    name="product"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product (Optional)</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(
                              value === "NO_PRODUCT" ? undefined : value
                            )
                          }
                          value={field.value || "NO_PRODUCT"} // Control the value for Select
                        >
                          <FormControl>
                            {/* Re-evaluate if this should be disabled for editing */}
                            <SelectTrigger disabled={!isNew} className="w-full">
                              <SelectValue placeholder="Select a product" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NO_PRODUCT">
                              No product assigned
                            </SelectItem>
                            {products?.data.map((product: KeygenProduct) => (
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
                    name="metadata"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Metadata</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='e.g. { "key":"value" }'
                            rows={4}
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
                    onClick={() => router.push("/dashboard/licenses")}
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
                      ? "Create License"
                      : "Update License"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Delete License Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete License</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this license? This action cannot
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
                {deleteMutation.isPending ? "Deleting..." : "Delete License"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
