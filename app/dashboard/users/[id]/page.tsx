"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Trash2, User } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

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

const userSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email("Please enter a valid email address"),
  // permissions: z.array(z.string()),
  role: z.enum([
    "user",
    "support-agent",
    "sales-agent",
    "developer",
    "read-only",
    "readonly",
    "admin",
  ]),
  metadata: z.string().optional(),
  password: z.string().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

export default function UserDetailPage() {
  // const [newPermission, setNewPermission] = useState("");
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const userId = params.id as string;
  const isNew = userId === "new";

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      // permissions: [],
      role: "user",
      metadata: "",
      password: undefined,
    },
  });

  const { data: user, isLoading } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => apiClient.getUser(userId),
    enabled: !isNew,
  });

  useEffect(() => {
    if (user && !isNew) {
      form.reset({
        firstName: user.data.attributes.firstName || "",
        lastName: user.data.attributes.lastName || "",
        email: user.data.attributes.email,
        // permissions: user.data.attributes.permissions || [],
        role: user.data.attributes.role || "user",
        metadata: user.data.attributes.metadata
          ? JSON.stringify(user.data.attributes.metadata, null, 2)
          : "",
        password: user.data.attributes?.password || undefined,
      });
    }
  }, [user, form, isNew]);

  const createMutation = useMutation({
    mutationFn: async (userData: UserFormData) =>
      await apiClient.createUser({
        ...userData,
        metadata: parseMetadata(userData.metadata || ""),
      } as any),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User created successfully");
      router.push("/dashboard/users");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (userData: UserFormData) =>
      await apiClient.updateUser(userId, {
        ...userData,
        metadata: parseMetadata(userData.metadata || ""),
      } as any),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      await queryClient.invalidateQueries({ queryKey: ["user", userId] });
      toast.success("User updated successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => await apiClient.deleteUser(userId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted successfully");
      router.push("/dashboard/users");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = async (data: UserFormData) => {
    if (isNew) {
      await createMutation.mutateAsync({...data, password: data.password?.length ? data.password : undefined});
    } else {
      await updateMutation.mutateAsync({...data, password: data.password?.length ? data.password : undefined});
    }
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync();
    setIsDeleteDialogOpen(false);
  };

  if (isLoading && !isNew) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading user...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/users")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isNew ? "Create User" : "Edit User"}
            </h1>
            <p className="text-muted-foreground">
              {isNew
                ? "Add a new user to your system"
                : "Update user information and settings"}
            </p>
          </div>
        </div>
        {!isNew && (
          <Button
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete User
          </Button>
        )}
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>User Information</span>
          </CardTitle>
          <CardDescription>
            {isNew
              ? "Enter the details for the new user"
              : "Update the user information below"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Email + Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="user@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Role */}
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="support-agent">
                            Support Agent
                          </SelectItem>
                          <SelectItem value="sales-agent">
                            Sales Agent
                          </SelectItem>
                          <SelectItem value="developer">Developer</SelectItem>
                          <SelectItem value="read-only">Read Only</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Metadata */}
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
              {/* this is not available for CE but when running in EE */}
              {/* <FormField
                control={form.control}
                name="permissions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Permissions</FormLabel>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(field.value) ? field.value : []).map(
                          (permission: string, idx: number) => (
                            <Badge
                              key={`${permission}-${idx}`}
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              <span>{permission}</span>
                              <button
                                type="button"
                                aria-label={`Remove ${permission}`}
                                onMouseDown={(e) => {
                                  e.preventDefault(); // prevent blur/focus race
                                  const next = (
                                    Array.isArray(field.value)
                                      ? field.value
                                      : []
                                  ).filter((p: string) => p !== permission);
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

                      <div className="flex gap-2">
                        <Input
                          placeholder="Add platform"
                          value={newPermission}
                          onChange={(e) => setNewPermission(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const v = newPermission.trim();
                              if (!v) return;
                              const curr = Array.isArray(field.value)
                                ? field.value
                                : [];
                              if (!curr.includes(v)) {
                                field.onChange([...curr, v]);
                              }
                              setNewPermission("");
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const v = newPermission.trim();
                            if (!v) return;
                            const curr = Array.isArray(field.value)
                              ? field.value
                              : [];
                            if (!curr.includes(v)) {
                              field.onChange([...curr, v]);
                            }
                            setNewPermission("");
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {permissions.filter(
                          (p) =>
                            !(
                              Array.isArray(field.value) ? field.value : []
                            ).includes(p)
                        ).map((permission) => (
                          <Button
                            key={permission}
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const curr = Array.isArray(field.value)
                                ? field.value
                                : [];
                              if (!curr.includes(permission)) {
                                field.onChange([...curr, permission]);
                              }
                            }}
                            className="h-6 px-2 text-xs"
                          >
                            + {permission}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}

              {/* Actions */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard/users")}
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
                    ? "Create User"
                    : "Update User"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be
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
              {deleteMutation.isPending ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
