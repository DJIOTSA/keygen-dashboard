"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useCopyToClipboard } from "react-use"
import { z } from "zod"
import { Copy, Check, Calendar } from "lucide-react"
import { useState } from "react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { KeygenLicense, KeygenUser, KeygenPolicy } from "@/lib/types"
import { cn } from "@/lib/utils"

const licenseSchema = z.object({
  name: z.string().optional(),
  key: z.string().optional(),
  expiry: z.date().optional(),
  status: z.enum(["active", "inactive", "expired", "suspended"]),
  protected: z.boolean(),
  suspended: z.boolean(),
  scheme: z.string().min(1, "Scheme is required"),
  userId: z.string().optional(),
  policyId: z.string().min(1, "Policy is required"),
  metadata: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return undefined
      try {
        return JSON.parse(val)
      } catch {
        throw new Error("Invalid JSON format")
      }
    }),
})

type LicenseFormData = z.infer<typeof licenseSchema>

interface LicenseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
  license?: KeygenLicense | null
  users: KeygenUser[]
  policies: KeygenPolicy[]
  isLoading?: boolean
  title?: string
  description?: string
}

const SCHEMES = ["ED25519_SIGN", "RSA_2048_PKCS1_SIGN", "RSA_2048_PKCS1_PSS_SIGN", "RSA_2048_JWT_RS256"]

const STATUSES = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "expired", label: "Expired" },
  { value: "suspended", label: "Suspended" },
]

export function EditLicenseModal({
  open,
  onOpenChange,
  onSubmit,
  license,
  users,
  policies,
  isLoading = false,
  title,
  description,
}: LicenseModalProps) {
  const [, copyToClipboard] = useCopyToClipboard()
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const form = useForm<LicenseFormData>({
    resolver: zodResolver(licenseSchema),
    defaultValues: {
      name: license?.attributes.name || "",
      key: license?.attributes.key || "",
      expiry: license?.attributes.expiry ? new Date(license.attributes.expiry) : undefined,
      status: license?.attributes.status || "active",
      protected: license?.attributes.protected || false,
      suspended: license?.attributes.suspended || false,
      scheme: license?.attributes.scheme || SCHEMES[0],
      userId: license?.relationships?.user?.data?.id || "",
      policyId: license?.relationships?.policy?.data?.id || (policies.length > 0 ? policies[0].id : ""),
      metadata: license?.attributes.metadata ? JSON.stringify(license.attributes.metadata, null, 2) : "",
    },
  })

  const handleSubmit = (data: LicenseFormData) => {
    const { metadata, userId, policyId, expiry, ...rest } = data
    onSubmit({
      attributes: {
        ...rest,
        ...(expiry && { expiry: expiry.toISOString() }),
        ...(metadata && { metadata }),
      },
      relationships: {
        policy: {
          data: { id: policyId, type: "policies" },
        },
        ...(userId && {
          user: {
            data: { id: userId, type: "users" },
          },
        }),
      },
    })
  }

  const handleCopy = (text: string, field: string) => {
    copyToClipboard(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const isEditing = !!license
  const modalTitle = title || (isEditing ? "Edit License" : "Create License")
  const modalDescription =
    description || (isEditing ? "Update license information" : "Add a new license to your Keygen server")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
          <DialogDescription>{modalDescription}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>License Name (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="My License" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>License Key (Optional - auto-generated if empty)</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="Auto-generated" {...field} />
                    </FormControl>
                    {field.value && (
                      <Button type="button" variant="outline" size="sm" onClick={() => handleCopy(field.value, "key")}>
                        {copiedField === "key" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="policyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Policy</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select policy" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {policies.map((policy) => (
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
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select user" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.attributes.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STATUSES.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
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
            </div>
            <FormField
              control={form.control}
              name="expiry"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Expiry Date (Optional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <Calendar className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="protected"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Protected</FormLabel>
                      <div className="text-sm text-muted-foreground">Protect license from deletion</div>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="suspended"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Suspended</FormLabel>
                      <div className="text-sm text-muted-foreground">Suspend license usage</div>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
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
                    <Textarea placeholder='{"key": "value"}' className="font-mono text-sm" rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? isEditing
                    ? "Updating..."
                    : "Creating..."
                  : isEditing
                    ? "Update License"
                    : "Create License"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
