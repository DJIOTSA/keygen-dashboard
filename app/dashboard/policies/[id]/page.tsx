"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Trash2, User } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import PolicyForm from "@/components/molecules/policy-form";
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
  Form
} from "@/components/ui/form";
import { apiClient } from "@/lib/api-client";
import { KeygenPolicy, PolicyFormData, policySchema } from "@/lib/types";
import { parseMetadata } from "@/lib/utils";
import { toast } from "sonner";


export default function PolicyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => await apiClient.getProducts(1, 100),
    staleTime: 5 * 1000,
  });

  const policyId = params.id as string;
  const isNew = policyId === "new";

  const { data: policy, isLoading } = useQuery({
    queryKey: ["policy", policyId],
    queryFn: async () => await apiClient.getPolicy(policyId),
    enabled: !isNew,
  });

  const defaultValues = useMemo(() => {
    if (isNew) {
      return {
        name: "",
        productId: undefined,
        duration: undefined,
        strict: true,
        floating: true,
        scheme: "ED25519_SIGN",
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
        encrypted: true,
        protected: true,
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
        authenticationStrategy: "LICENSE_KEY",
        machineLeasingStrategy: "PER_LICENSE",
        processLeasingStrategy: "PER_MACHINE",
        overageStrategy: "NO_OVERAGE",
        metadata: undefined,
      };
    }

    if (!policy) return undefined;

    const attributes = policy?.data.attributes;
    return {
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
    };
  }, [policy, isNew]);

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
      relationships: isNew
        ? {
            product: {
              data: {
                type: "products",
                id: data.productId,
              },
            },
          }
        : undefined,
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


  const form = useForm<PolicyFormData>({
    resolver: zodResolver(policySchema),
  });

  useEffect(()=>{
    if (!!defaultValues){
      form.reset(defaultValues)
    }
  }, [defaultValues])

  if (!defaultValues || isLoading || productsLoading) {
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
        {defaultValues && products && (
          <>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  {/* form */}
                  <PolicyForm defaultValues={defaultValues as PolicyFormData} form={form} products={products.data} isNew={isNew} />

                  {/* Actions */}
                  <div className="flex justify-end space-x-4 pt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/dashboard/policies")}
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
          </>
        )}
      </Card>

      {/* Delete Policy Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Policy</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this policy? This action cannot be
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
              {deleteMutation.isPending ? "Deleting..." : "Delete Policy"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
