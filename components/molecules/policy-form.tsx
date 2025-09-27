"use client";

import {
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
import { KeygenProduct, PolicyFormData } from "@/lib/types";
import { UseFormReturn } from "react-hook-form";
interface Props {
  defaultValues: PolicyFormData;
  form: UseFormReturn<PolicyFormData>;
  products: KeygenProduct[] | undefined;
  isNew: boolean;
}

function PolicyForm({ defaultValues, form, products, isNew }: Props) {
  return (
    <>
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Policy name"
                    onChange={field.onChange}
                    defaultValue={defaultValues.name}
                  />
                </FormControl>
                <FormMessage />
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
                    onChange={field.onChange}
                    defaultValue={defaultValues.duration || undefined}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Product - Disabled during updates */}
          <FormField
            control={form.control}
            name="productId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product *</FormLabel>
                <Select
                  defaultValue={defaultValues.productId}
                  onValueChange={field.onChange}
                  disabled={!isNew}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {products?.map((product: KeygenProduct) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.attributes.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!isNew && (
                  <p className="text-sm text-muted-foreground">
                    Product cannot be changed after creation
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Scheme - Disabled during updates */}
          <FormField
            control={form.control}
            name="scheme"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Encryption Scheme *</FormLabel>
                <Select
                  defaultValue={defaultValues.scheme}
                  onValueChange={field.onChange}
                  disabled={!isNew}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select scheme" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ED25519_SIGN">ED25519 Sign</SelectItem>
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
                {!isNew && (
                  <p className="text-sm text-muted-foreground">
                    Encryption scheme cannot be changed after creation
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Basic Switches */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="strict"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Strict</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Enable strict validation
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value || defaultValues.strict}
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
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Floating</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Allow floating licenses
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value || defaultValues.floating}
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
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Encrypted</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Encrypt license keys
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value || defaultValues.encrypted}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="protected"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Protected</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Enable additional protection
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value || defaultValues.protected}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="usePool"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Use Pool</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Enable license pooling
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value || defaultValues.usePool}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Scope Requirements */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Scope Requirements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="requireProductScope"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm">Product Scope</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value || defaultValues.requireProductScope}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="requirePolicyScope"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm">Policy Scope</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value || defaultValues.requirePolicyScope}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="requireMachineScope"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm">Machine Scope</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value || defaultValues.requireMachineScope}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="requireFingerprintScope"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm">Fingerprint Scope</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={
                      field.value || defaultValues.requireFingerprintScope
                    }
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="requireComponentsScope"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm">Components Scope</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={
                      field.value || defaultValues.requireComponentsScope
                    }
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="requireUserScope"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm">User Scope</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value || defaultValues.requireUserScope}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="requireChecksumScope"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm">Checksum Scope</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value || defaultValues.requireChecksumScope}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="requireVersionScope"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm">Version Scope</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value || defaultValues.requireVersionScope}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Limits */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Resource Limits</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    onChange={field.onChange}
                    defaultValue={defaultValues.maxMachines || undefined}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                    onChange={field.onChange}
                    defaultValue={defaultValues.maxProcesses || undefined}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                    onChange={field.onChange}
                    defaultValue={defaultValues.maxUsers || undefined}
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
                    placeholder="Max cores"
                    type="number"
                    min={0}
                    onChange={field.onChange}
                    defaultValue={defaultValues.maxCores || undefined}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                    onChange={field.onChange}
                    defaultValue={defaultValues.maxMemory || undefined}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                    onChange={field.onChange}
                    defaultValue={defaultValues.maxDisk || undefined}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                    onChange={field.onChange}
                    defaultValue={defaultValues.maxUses || undefined}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Check-in Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Check-in Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="requireCheckIn"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Require Check-in</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Require periodic check-ins
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
            name="checkInInterval"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Check-in Interval (seconds)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Interval in seconds"
                    type="number"
                    min={0}
                    onChange={field.onChange}
                    defaultValue={defaultValues.checkInInterval || undefined}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                    onChange={field.onChange}
                    defaultValue={defaultValues.checkInIntervalCount || undefined}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Heartbeat Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Heartbeat Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="requireHeartbeat"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Require Heartbeat</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Require periodic heartbeats
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
            name="heartbeatDuration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Heartbeat Duration (seconds)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Duration in seconds"
                    type="number"
                    min={0}
                    onChange={field.onChange}
                    defaultValue={defaultValues.heartbeatDuration || undefined}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="heartbeatCullStrategy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Heartbeat Cull Strategy</FormLabel>
                <Select
                  defaultValue={defaultValues.heartbeatCullStrategy || undefined}
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
                    <SelectItem value="DELETE_DEAD">Delete Dead</SelectItem>
                    <SelectItem value="DO_NOTHING">Do Nothing</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="heartbeatResurrectionStrategy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Heartbeat Resurrection Strategy</FormLabel>
                <Select
                  defaultValue={defaultValues.heartbeatResurrectionStrategy || undefined}
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

          <FormField
            control={form.control}
            name="heartbeatBasis"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Heartbeat Basis</FormLabel>
                <Select
                  defaultValue={defaultValues.heartbeatBasis || undefined}
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
                    <SelectItem value="FROM_CREATION">From Creation</SelectItem>
                    <SelectItem value="FROM_FIRST_PING">
                      From First Ping
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Strategy Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Strategy Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="machineUniquenessStrategy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Machine Uniqueness Strategy</FormLabel>
                <Select
                  defaultValue={defaultValues.machineUniquenessStrategy || undefined}
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

          <FormField
            control={form.control}
            name="machineMatchingStrategy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Machine Matching Strategy</FormLabel>
                <Select
                  defaultValue={defaultValues.machineMatchingStrategy || undefined}
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

          <FormField
            control={form.control}
            name="componentUniquenessStrategy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Component Uniqueness Strategy</FormLabel>
                <Select
                  defaultValue={defaultValues.componentUniquenessStrategy || undefined}
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

          <FormField
            control={form.control}
            name="componentMatchingStrategy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Component Matching Strategy</FormLabel>
                <Select
                  defaultValue={defaultValues.componentMatchingStrategy || undefined}
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

          <FormField
            control={form.control}
            name="expirationStrategy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expiration Strategy</FormLabel>
                <Select
                  defaultValue={defaultValues.expirationStrategy || undefined}
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
                    <SelectItem value="REVOKE_ACCESS">Revoke Access</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expirationBasis"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expiration Basis</FormLabel>
                <Select
                  defaultValue={defaultValues.expirationBasis || undefined}
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
                    <SelectItem value="FROM_CREATION">From Creation</SelectItem>
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

          <FormField
            control={form.control}
            name="renewalBasis"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Renewal Basis</FormLabel>
                <Select
                  defaultValue={defaultValues.renewalBasis || undefined}
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
                    <SelectItem value="FROM_EXPIRY">From Expiry</SelectItem>
                    <SelectItem value="FROM_RENEWAL">From Renewal</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="transferStrategy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transfer Strategy</FormLabel>
                <Select
                  defaultValue={defaultValues.transferStrategy || undefined}
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
                    <SelectItem value="KEEP_EXPIRY">Keep Expiry</SelectItem>
                    <SelectItem value="RESET_EXPIRY">Reset Expiry</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="authenticationStrategy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Authentication Strategy</FormLabel>
                <Select
                  defaultValue={defaultValues.authenticationStrategy || undefined}
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
                    <SelectItem value="TOKEN">Token</SelectItem>
                    <SelectItem value="LICENSE_KEY">License Key</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="machineLeasingStrategy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Machine Leasing Strategy</FormLabel>
                <Select
                  defaultValue={defaultValues.machineLeasingStrategy || undefined}
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
                    <SelectItem value="PER_LICENSE">Per License</SelectItem>
                    <SelectItem value="PER_POLICY">Per Policy</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="processLeasingStrategy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Process Leasing Strategy</FormLabel>
                <Select
                  defaultValue={defaultValues.processLeasingStrategy || undefined}
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
                    <SelectItem value="PER_MACHINE">Per Machine</SelectItem>
                    <SelectItem value="PER_LICENSE">Per License</SelectItem>
                    <SelectItem value="PER_POLICY">Per Policy</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="overageStrategy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Overage Strategy</FormLabel>
                <Select
                  defaultValue={defaultValues.overageStrategy || undefined}
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
                    <SelectItem value="NO_OVERAGE">No Overage</SelectItem>
                    <SelectItem value="ALLOW_OVERAGE">Allow Overage</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Metadata */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Metadata</h3>
        <FormField
          control={form.control}
          name="metadata"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Metadata (JSON)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='e.g. { "key": "value", "environment": "production" }'
                  rows={6}
                  className="font-mono text-sm"
                  onChange={field.onChange}
                />
              </FormControl>
              <div className="text-sm text-muted-foreground">
                Enter valid JSON for additional metadata
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}

export default PolicyForm;
