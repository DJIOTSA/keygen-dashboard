"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Copy, Key, Loader, Save, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
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
import { apiClient } from "@/lib/api-client";
import {
  KeygenEntitlement,
  KeygenGroup,
  KeygenLicense,
  KeygenPolicy,
  KeygenUser,
} from "@/lib/types";
import { toast } from "sonner";

const licenseSchema = z.object({
  name: z.string(),
  user: z.string({
    message: "User is required",
  }),
  policy: z.string({
    message: "Policy is required",
  }),
  expiry: z.string({
    message: "Expiry date is required",
  }),
  group: z.string().optional(),
  entitlement: z.string().optional(),
});

type LicenseFormData = z.infer<typeof licenseSchema>;

export default function LicenseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const licenseId = params.id as string;
  const isNew = licenseId === "new";

  const { data: license, isLoading } = useQuery({
    queryKey: ["license", licenseId],
    queryFn: () => apiClient.getLicense(licenseId),
    enabled: !isNew,
  });

  const { data: policies, isLoading: policiesLoading } = useQuery({
    queryKey: ["policies"],
    queryFn: () => apiClient.getPolicies(1, 0),
    enabled: !isNew,
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => apiClient.getUsers(1, 0),
    enabled: !isNew,
  });

  const { data: entitlements, isLoading: entitlementsLoading } = useQuery({
    queryKey: ["entitlements"],
    queryFn: () => apiClient.getEntitlements(1, 0),
    enabled: !isNew,
  });

  const { data: groups, isLoading: groupsLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: () => apiClient.getGroups(1, 0),
    enabled: !isNew,
  });

  const form = useForm<LicenseFormData>({
    resolver: zodResolver(licenseSchema),
    defaultValues: license?.data.attributes || {},
  });

  const createMutation = useMutation({
    mutationFn: async (licenseData: Partial<KeygenLicense>) =>
      await apiClient.createLicense(licenseData),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["licenses"] });
      toast.success("License created successfully");
      router.push("/dashboard/licenses");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (licenseData: Partial<KeygenLicense>) =>
      await apiClient.updateLicense(licenseId, licenseData),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["licenses"] });
      await queryClient.invalidateQueries({ queryKey: ["license", licenseId] });
      toast.success("License updated successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiClient.deleteLicense(licenseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["licenses"] });
      toast.success("License deleted successfully");
      router.push("/dashboard/licenses");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = async (data: LicenseFormData) => {
    const licenseData = {
      attributes: {
        name: data.name,
        expiry: data.expiry,
      },
      relationships: {
        ...(data.user && {
          user: {
            data: { type: "users", id: data.user },
          },
        }),
        ...(data.policy && {
          policy: {
            data: { type: "policies", id: data.policy },
          },
        }),
        ...(data.entitlement && {
          entitlement: {
            data: { type: "entitlements", id: data.entitlement },
          },
        }),
        ...(data.group && {
          group: {
            data: { type: "groups", id: data.group },
          },
        }),
      },
    };

    if (isNew) {
      await createMutation.mutateAsync(licenseData as Partial<KeygenLicense>);
    } else {
      await updateMutation.mutateAsync(licenseData as Partial<KeygenLicense>);
    }
  };

  const handleDelete = () => {
    deleteMutation.mutate();
    setIsDeleteDialogOpen(false);
  };

  const copyLicenseKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast("License key copied to clipboard");
  };

  if (
    isLoading ||
    policiesLoading ||
    usersLoading ||
    entitlementsLoading ||
    groupsLoading
  ) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader className="animate-spin h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
            <p>Loading license...</p>
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
                  {license.data.attributes.key}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyLicenseKey(license.data.attributes.key)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
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
                          value={field.value || undefined}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
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
                          value={field.value || undefined}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
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
                          value={field.value || undefined}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
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

                  <FormField
                    control={form.control}
                    name="entitlement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Entitlement (Optional)</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(
                              value === "NO_ENTITLEMENT" ? undefined : value
                            )
                          }
                          value={field.value || undefined}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select an entitlement" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NO_ENTITLEMENT">
                              No entitlement assigned
                            </SelectItem>
                            {entitlements?.data.map(
                              (entitlement: KeygenEntitlement) => (
                                <SelectItem
                                  key={entitlement.id}
                                  value={entitlement.id}
                                >
                                  {entitlement.attributes.name}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
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
