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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/lib/api-client";
import { KeygenPolicy, KeygenProduct } from "@/lib/types";
import { parseMetadata } from "@/lib/utils";
import { toast } from "sonner";

// Helper for optional numeric fields
const optionalNumber = z.coerce
  .number()
  .min(0, "Must be a positive number")
  .optional()
  .nullable();

const policySchema = z.object({
  name: z.string().min(1, "Name is required"),
  productId: z.string().optional(),
  duration: optionalNumber,
  strict: z.boolean().optional(),
  floating: z.boolean().optional(),
  scheme: z
    .enum([
      "ED25519_SIGN",
      "RSA_2048_PKCS1_SIGN",
      "RSA_2048_PSS_SIGN",
      "ECDSA_P256_SIGN",
      "RSA_2048_PKCS1_PSS_SIGN_V2",
      "RSA_2048_PKCS1_SIGN_V2",
      "RSA_2048_JWT_RS256",
      "RSA_2048_PKCS1_ENCRYPT",
    ])
    .optional()
    .nullable(),
  requireProductScope: z.boolean().optional(),
  requirePolicyScope: z.boolean().optional(),
  requireMachineScope: z.boolean().optional(),
  requireFingerprintScope: z.boolean().optional(),
  requireComponentsScope: z.boolean().optional(),
  requireUserScope: z.boolean().optional(),
  requireChecksumScope: z.boolean().optional(),
  requireVersionScope: z.boolean().optional(),
  requireCheckIn: z.boolean().optional(),
  checkInInterval: optionalNumber,
  checkInIntervalCount: optionalNumber,
  usePool: z.boolean().optional(),
  maxMachines: optionalNumber,
  maxProcesses: optionalNumber,
  maxUsers: optionalNumber,
  maxCores: optionalNumber,
  maxMemory: optionalNumber,
  maxDisk: optionalNumber,
  maxUses: optionalNumber,
  encrypted: z.boolean().optional(),
  protected: z.boolean().optional(),
  requireHeartbeat: z.boolean().optional(),
  heartbeatDuration: optionalNumber,
  heartbeatCullStrategy: z
    .enum(["DEACTIVATE_DEAD", "DELETE_DEAD", "DO_NOTHING"])
    .optional()
    .nullable(),
  heartbeatResurrectionStrategy: z
    .enum(["NO_REVIVE", "REVIVE_ON_PING"])
    .optional()
    .nullable(),
  heartbeatBasis: z
    .enum(["FROM_CREATION", "FROM_FIRST_PING"])
    .optional()
    .nullable(),
  machineUniquenessStrategy: z
    .enum(["UNIQUE_PER_LICENSE", "UNIQUE_PER_POLICY", "UNIQUE_PER_ACCOUNT"])
    .optional()
    .nullable(),
  machineMatchingStrategy: z
    .enum(["MATCH_ALL", "MATCH_ANY"])
    .optional()
    .nullable(),
  componentUniquenessStrategy: z
    .enum(["UNIQUE_PER_MACHINE", "UNIQUE_PER_LICENSE", "UNIQUE_PER_POLICY"])
    .optional()
    .nullable(),
  componentMatchingStrategy: z
    .enum(["MATCH_ALL", "MATCH_ANY"])
    .optional()
    .nullable(),
  expirationStrategy: z
    .enum(["RESTRICT_ACCESS", "REVOKE_ACCESS"])
    .optional()
    .nullable(),
  expirationBasis: z
    .enum(["FROM_CREATION", "FROM_ACTIVATION", "FROM_FIRST_CHECK_IN"])
    .optional()
    .nullable(),
  renewalBasis: z.enum(["FROM_EXPIRY", "FROM_RENEWAL"]).optional().nullable(),
  transferStrategy: z
    .enum(["KEEP_EXPIRY", "RESET_EXPIRY"])
    .optional()
    .nullable(),
  authenticationStrategy: z
    .enum(["TOKEN", "LICENSE_KEY"])
    .optional()
    .nullable(),
  machineLeasingStrategy: z
    .enum(["PER_LICENSE", "PER_POLICY"])
    .optional()
    .nullable(),
  processLeasingStrategy: z
    .enum(["PER_MACHINE", "PER_LICENSE", "PER_POLICY"])
    .optional()
    .nullable(),
  overageStrategy: z
    .enum(["NO_OVERAGE", "ALLOW_OVERAGE"])
    .optional()
    .nullable(),
  metadata: z.string().optional(),
});

type PolicyFormData = z.infer<typeof policySchema>;

export default function PolicyDetailPage() {
  // const [newPermission, setNewPermission] = useState("");
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => apiClient.getProducts(1, 100),
  });

  const policyId = params.id as string;
  const isNew = policyId === "new";

  const form = useForm<PolicyFormData>({
    resolver: zodResolver(policySchema),
    defaultValues: {
      name: "",
      productId: undefined,
      duration: undefined,
      strict: false,
      floating: false,
      scheme: "ED25519_SIGN", // Defaulting to a common scheme
      requireProductScope: false,
      requirePolicyScope: false,
      requireMachineScope: false,
      requireFingerprintScope: false,
      requireComponentsScope: false,
      requireUserScope: false,
      requireChecksumScope: false,
      requireVersionScope: false,
      requireCheckIn: false,
      checkInInterval: undefined,
      checkInIntervalCount: undefined,
      usePool: false,
      maxMachines: undefined,
      maxProcesses: undefined,
      maxUsers: undefined,
      maxCores: undefined,
      maxMemory: undefined,
      maxDisk: undefined,
      maxUses: undefined,
      encrypted: false,
      protected: false,
      requireHeartbeat: false,
      heartbeatDuration: undefined,
      heartbeatCullStrategy: "DEACTIVATE_DEAD",
      heartbeatResurrectionStrategy: "NO_REVIVE",
      heartbeatBasis: "FROM_FIRST_PING",
      machineUniquenessStrategy: "UNIQUE_PER_LICENSE",
      machineMatchingStrategy: "MATCH_ALL",
      componentUniquenessStrategy: "UNIQUE_PER_MACHINE",
      componentMatchingStrategy: "MATCH_ALL",
      expirationStrategy: "RESTRICT_ACCESS",
      expirationBasis: "FROM_CREATION",
      renewalBasis: "FROM_EXPIRY",
      transferStrategy: "KEEP_EXPIRY",
      authenticationStrategy: "TOKEN",
      machineLeasingStrategy: "PER_LICENSE",
      processLeasingStrategy: "PER_MACHINE",
      overageStrategy: "NO_OVERAGE",
      metadata: undefined,
    },
  });

  const { data: policy, isLoading } = useQuery({
    queryKey: ["policy", policyId],
    queryFn: () => apiClient.getPolicy(policyId),
    enabled: !isNew,
  });

  useEffect(() => {
    if (policy && !isNew && !form.formState.isDirty) {
      const attributes = policy.data.attributes;
      form.reset({
        name: attributes.name,
        productId: policy.data.relationships?.product?.data.id,
        duration: attributes.duration,
        strict: attributes.strict,
        floating: attributes.floating,
        scheme: attributes.scheme,
        requireProductScope: attributes.requireProductScope,
        requirePolicyScope: attributes.requirePolicyScope,
        requireMachineScope: attributes.requireMachineScope,
        requireFingerprintScope: attributes.requireFingerprintScope,
        requireComponentsScope: attributes.requireComponentsScope,
        requireUserScope: attributes.requireUserScope,
        requireChecksumScope: attributes.requireChecksumScope,
        requireVersionScope: attributes.requireVersionScope,
        requireCheckIn: attributes.requireCheckIn,
        checkInInterval: attributes.checkInInterval,
        checkInIntervalCount: attributes.checkInIntervalCount,
        usePool: attributes.usePool,
        maxMachines: attributes.maxMachines,
        maxProcesses: attributes.maxProcesses,
        maxUsers: attributes.maxUsers,
        maxCores: attributes.maxCores,
        maxMemory: attributes.maxMemory,
        maxDisk: attributes.maxDisk,
        maxUses: attributes.maxUses,
        encrypted: attributes.encrypted,
        protected: attributes.protected,
        requireHeartbeat: attributes.requireHeartbeat,
        heartbeatDuration: attributes.heartbeatDuration,
        heartbeatCullStrategy: attributes.heartbeatCullStrategy,
        heartbeatResurrectionStrategy: attributes.heartbeatResurrectionStrategy,
        heartbeatBasis: attributes.heartbeatBasis,
        machineUniquenessStrategy: attributes.machineUniquenessStrategy,
        machineMatchingStrategy: attributes.machineMatchingStrategy,
        componentUniquenessStrategy: attributes.componentUniquenessStrategy,
        componentMatchingStrategy: attributes.componentMatchingStrategy,
        expirationStrategy: attributes.expirationStrategy,
        expirationBasis: attributes.expirationBasis,
        renewalBasis: attributes.renewalBasis,
        transferStrategy: attributes.transferStrategy,
        authenticationStrategy: attributes.authenticationStrategy,
        machineLeasingStrategy: attributes.machineLeasingStrategy,
        processLeasingStrategy: attributes.processLeasingStrategy,
        overageStrategy: attributes.overageStrategy,
        metadata: attributes.metadata
          ? JSON.stringify(attributes.metadata, null, 2)
          : undefined,
      });
    }
  }, [policy, form, isNew]);

  const createMutation = useMutation({
    mutationFn: async (policyData: Partial<KeygenPolicy>) =>
      await apiClient.createPolicy({
        ...policyData,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["policies"] });
      toast.success("Policy created successfully");
      router.push("/dashboard/policies");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (policyData: Partial<KeygenPolicy>) =>
      await apiClient.updatePolicy(policyId, {
        ...policyData,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["policies"] });
      await queryClient.invalidateQueries({ queryKey: ["policy", policyId] });
      toast.success("Policy updated successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => await apiClient.deletePolicy(policyId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["policies"] });
      toast.success("Policy deleted successfully");
      router.push("/dashboard/policies");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = async (data: PolicyFormData) => {
    const policyPayload = {
      attributes: {
        name: data.name,
        duration: data.duration,
        strict: data.strict,
        floating: data.floating,
        scheme: data.scheme,
        requireProductScope: data.requireProductScope,
        requirePolicyScope: data.requirePolicyScope,
        requireMachineScope: data.requireMachineScope,
        requireFingerprintScope: data.requireFingerprintScope,
        requireComponentsScope: data.requireComponentsScope,
        requireUserScope: data.requireUserScope,
        requireChecksumScope: data.requireChecksumScope,
        requireVersionScope: data.requireVersionScope,
        requireCheckIn: data.requireCheckIn,
        checkInInterval: data.checkInInterval,
        checkInIntervalCount: data.checkInIntervalCount,
        usePool: data.usePool,
        maxMachines: data.maxMachines,
        maxProcesses: data.maxProcesses,
        maxUsers: data.maxUsers,
        maxCores: data.maxCores,
        maxMemory: data.maxMemory,
        maxDisk: data.maxDisk,
        maxUses: data.maxUses,
        encrypted: data.encrypted,
        protected: data.protected,
        requireHeartbeat: data.requireHeartbeat,
        heartbeatDuration: data.heartbeatDuration,
        heartbeatCullStrategy: data.heartbeatCullStrategy,
        heartbeatResurrectionStrategy: data.heartbeatResurrectionStrategy,
        heartbeatBasis: data.heartbeatBasis,
        machineUniquenessStrategy: data.machineUniquenessStrategy,
        machineMatchingStrategy: data.machineMatchingStrategy,
        componentUniquenessStrategy: data.componentUniquenessStrategy,
        componentMatchingStrategy: data.componentMatchingStrategy,
        expirationStrategy: data.expirationStrategy,
        expirationBasis: data.expirationBasis,
        renewalBasis: data.renewalBasis,
        transferStrategy: data.transferStrategy,
        authenticationStrategy: data.authenticationStrategy,
        machineLeasingStrategy: data.machineLeasingStrategy,
        processLeasingStrategy: data.processLeasingStrategy,
        overageStrategy: data.overageStrategy,
        metadata: parseMetadata(data.metadata || ""),
      },
      relationships: !isNew
        ? undefined
        : {
            product: {
              data: {
                type: "products",
                id: data.productId,
              },
            },
          },
    };

    if (isNew) {
      await createMutation.mutateAsync(policyPayload as Partial<KeygenPolicy>);
    } else {
      await updateMutation.mutateAsync(policyPayload as Partial<KeygenPolicy>);
    }
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync();
    setIsDeleteDialogOpen(false);
  };

  if ((isLoading || !policy) && !isNew) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading policy...</p>
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
            onClick={() => router.push("/dashboard/policies")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Policies
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isNew ? "Create Policy" : "Edit Policy"}
            </h1>
            <p className="text-muted-foreground">
              {isNew
                ? "Add a new policy to your system"
                : "Update policy information and settings"}
            </p>
          </div>
        </div>
        {!isNew && (
          <Button
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Policy
          </Button>
        )}
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Policy Information</span>
          </CardTitle>
          <CardDescription>
            {isNew
              ? "Enter the details for the new policy"
              : "Update the policy information below"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Policy name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Product */}
                <FormField
                  control={form.control}
                  name="productId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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

                {/* Scheme */}
                <FormField
                  control={form.control}
                  name="scheme"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Encryption Scheme</FormLabel>
                      <Select
                        value={field.value || undefined}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="">
                            <SelectValue placeholder="Select scheme" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ED25519_SIGN">
                            ED25519 Sign
                          </SelectItem>
                          <SelectItem value="ECDSA_P256_SIGN">
                            ECDSA P256 Sign
                          </SelectItem>
                          <SelectItem value="RSA_2048_PKCS1_PSS_SIGN_V2">
                            RSA 2048 PKCS1 PSS Sign V2
                          </SelectItem>
                          <SelectItem value="RSA_2048_PKCS1_SIGN_V2">
                            RSA 2048 PKCS1 Sign V2
                          </SelectItem>
                          <SelectItem value="RSA_2048_PKCS1_ENCRYPT">
                            RSA 2048 PKCS1 Encrypt
                          </SelectItem>
                          <SelectItem value="RSA_2048_JWT_RS256">
                            RSA 2048 JWT RS256
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="w-fit" />
                    </FormItem>
                  )}
                />

                {/* Duration */}
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (seconds)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Duration in seconds"
                          type="number"
                          min={0}
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Max Machines */}
                <FormField
                  control={form.control}
                  name="maxMachines"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Machines</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Max machines"
                          type="number"
                          min={0}
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Max Processes */}
                <FormField
                  control={form.control}
                  name="maxProcesses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Processes</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Max processes"
                          type="number"
                          min={0}
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Max Users */}
                <FormField
                  control={form.control}
                  name="maxUsers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Users</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Max users"
                          type="number"
                          min={0}
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Max Cores */}
                <FormField
                  control={form.control}
                  name="maxCores"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Cores</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Max cores"
                          type="number"
                          min={0}
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Max Memory */}
                <FormField
                  control={form.control}
                  name="maxMemory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Memory (MB)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Max memory in MB"
                          type="number"
                          min={0}
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Max Disk */}
                <FormField
                  control={form.control}
                  name="maxDisk"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Disk (GB)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Max disk in GB"
                          type="number"
                          min={0}
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Max Uses */}
                <FormField
                  control={form.control}
                  name="maxUses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Uses</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Max uses"
                          type="number"
                          min={0}
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Check-in Interval */}
                <FormField
                  control={form.control}
                  name="checkInInterval"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check-in Interval (seconds)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Interval in seconds"
                          type="number"
                          min={0}
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Check-in Interval Count */}
                <FormField
                  control={form.control}
                  name="checkInIntervalCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Check-in Interval Count</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Interval count"
                          type="number"
                          min={0}
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Heartbeat Duration */}
                <FormField
                  control={form.control}
                  name="heartbeatDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Heartbeat Duration (seconds)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Duration in seconds"
                          type="number"
                          min={0}
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Heartbeat Cull Strategy */}
                <FormField
                  control={form.control}
                  name="heartbeatCullStrategy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Heartbeat Cull Strategy</FormLabel>
                      <Select
                        value={field.value || undefined}
                        onValueChange={(value) =>
                          field.onChange(value === "none" ? null : value)
                        }
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select strategy" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="DEACTIVATE_DEAD">
                            Deactivate Dead
                          </SelectItem>
                          <SelectItem value="DELETE_DEAD">
                            Delete Dead
                          </SelectItem>
                          <SelectItem value="DO_NOTHING">Do Nothing</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Heartbeat Resurrection Strategy */}
                <FormField
                  control={form.control}
                  name="heartbeatResurrectionStrategy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Heartbeat Resurrection Strategy</FormLabel>
                      <Select
                        value={field.value || undefined}
                        onValueChange={(value) =>
                          field.onChange(value === "none" ? null : value)
                        }
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select strategy" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="NO_REVIVE">No Revive</SelectItem>
                          <SelectItem value="REVIVE_ON_PING">
                            Revive on Ping
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Heartbeat Basis */}
                <FormField
                  control={form.control}
                  name="heartbeatBasis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Heartbeat Basis</FormLabel>
                      <Select
                        value={field.value || undefined}
                        onValueChange={(value) =>
                          field.onChange(value === "none" ? null : value)
                        }
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select basis" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="FROM_CREATION">
                            From Creation
                          </SelectItem>
                          <SelectItem value="FROM_FIRST_PING">
                            From First Ping
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Machine Uniqueness Strategy */}
                <FormField
                  control={form.control}
                  name="machineUniquenessStrategy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Machine Uniqueness Strategy</FormLabel>
                      <Select
                        value={field.value || undefined}
                        onValueChange={(value) =>
                          field.onChange(value === "none" ? null : value)
                        }
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select strategy" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="UNIQUE_PER_LICENSE">
                            Unique Per License
                          </SelectItem>
                          <SelectItem value="UNIQUE_PER_POLICY">
                            Unique Per Policy
                          </SelectItem>
                          <SelectItem value="UNIQUE_PER_ACCOUNT">
                            Unique Per Account
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Machine Matching Strategy */}
                <FormField
                  control={form.control}
                  name="machineMatchingStrategy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Machine Matching Strategy</FormLabel>
                      <Select
                        value={field.value || undefined}
                        onValueChange={(value) =>
                          field.onChange(value === "none" ? null : value)
                        }
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select strategy" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="MATCH_ALL">Match All</SelectItem>
                          <SelectItem value="MATCH_ANY">Match Any</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Component Uniqueness Strategy */}
                <FormField
                  control={form.control}
                  name="componentUniquenessStrategy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Component Uniqueness Strategy</FormLabel>
                      <Select
                        value={field.value || undefined}
                        onValueChange={(value) =>
                          field.onChange(value === "none" ? null : value)
                        }
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select strategy" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="UNIQUE_PER_MACHINE">
                            Unique Per Machine
                          </SelectItem>
                          <SelectItem value="UNIQUE_PER_LICENSE">
                            Unique Per License
                          </SelectItem>
                          <SelectItem value="UNIQUE_PER_POLICY">
                            Unique Per Policy
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Component Matching Strategy */}
                <FormField
                  control={form.control}
                  name="componentMatchingStrategy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Component Matching Strategy</FormLabel>
                      <Select
                        value={field.value || undefined}
                        onValueChange={(value) =>
                          field.onChange(value === "none" ? null : value)
                        }
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select strategy" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="MATCH_ALL">Match All</SelectItem>
                          <SelectItem value="MATCH_ANY">Match Any</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Expiration Strategy */}
                <FormField
                  control={form.control}
                  name="expirationStrategy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiration Strategy</FormLabel>
                      <Select
                        value={field.value || undefined}
                        onValueChange={(value) =>
                          field.onChange(value === "none" ? null : value)
                        }
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select strategy" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="RESTRICT_ACCESS">
                            Restrict Access
                          </SelectItem>
                          <SelectItem value="REVOKE_ACCESS">
                            Revoke Access
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Expiration Basis */}
                <FormField
                  control={form.control}
                  name="expirationBasis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiration Basis</FormLabel>
                      <Select
                        value={field.value || undefined}
                        onValueChange={(value) =>
                          field.onChange(value === "none" ? null : value)
                        }
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select basis" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="FROM_CREATION">
                            From Creation
                          </SelectItem>
                          <SelectItem value="FROM_ACTIVATION">
                            From Activation
                          </SelectItem>
                          <SelectItem value="FROM_FIRST_CHECK_IN">
                            From First Check-in
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Renewal Basis */}
                <FormField
                  control={form.control}
                  name="renewalBasis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Renewal Basis</FormLabel>
                      <Select
                        value={field.value || undefined}
                        onValueChange={(value) =>
                          field.onChange(value === "none" ? null : value)
                        }
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select basis" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="FROM_EXPIRY">
                            From Expiry
                          </SelectItem>
                          <SelectItem value="FROM_RENEWAL">
                            From Renewal
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Transfer Strategy */}
                <FormField
                  control={form.control}
                  name="transferStrategy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transfer Strategy</FormLabel>
                      <Select
                        value={field.value || undefined}
                        onValueChange={(value) =>
                          field.onChange(value === "none" ? null : value)
                        }
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select strategy" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="KEEP_EXPIRY">
                            Keep Expiry
                          </SelectItem>
                          <SelectItem value="RESET_EXPIRY">
                            Reset Expiry
                          </SelectItem>
                        </SelectContent>
                      </Select>
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

                <div className="flex gap-6">
                <FormField
                  control={form.control}
                  name="strict"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Strict</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="floating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Floating</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requireHeartbeat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Require Heartbeat</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                </div>
              </div>

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
                    ? "Create Policy"
                    : "Update Policy"}
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
