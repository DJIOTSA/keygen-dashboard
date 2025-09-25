"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useCopyToClipboard } from "react-use"
import { z } from "zod"
import { Copy, Check, Calendar, Plus, X } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { KeygenToken } from "@/lib/types"
import { cn } from "@/lib/utils"

const tokenSchema = z.object({
  name: z.string().optional(),
  expiry: z.date().optional(),
  permissions: z.array(z.string()).min(1, "At least one permission is required"),
})

type TokenFormData = z.infer<typeof tokenSchema>

interface TokenModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
  token?: KeygenToken | null
  isLoading?: boolean
  title?: string
  description?: string
}

const COMMON_PERMISSIONS = [
  "token.read",
  "token.create",
  "token.update",
  "token.delete",
  "user.read",
  "user.create",
  "user.update",
  "user.delete",
  "product.read",
  "product.create",
  "product.update",
  "product.delete",
  "policy.read",
  "policy.create",
  "policy.update",
  "policy.delete",
  "license.read",
  "license.create",
  "license.update",
  "license.delete",
  "machine.read",
  "machine.delete",
  "entitlement.read",
  "entitlement.create",
  "entitlement.delete",
]

export function EditTokenModal({
  open,
  onOpenChange,
  onSubmit,
  token,
  isLoading = false,
  title,
  description,
}: TokenModalProps) {
  const [, copyToClipboard] = useCopyToClipboard()
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [newPermission, setNewPermission] = useState("")

  const form = useForm<TokenFormData>({
    resolver: zodResolver(tokenSchema),
    defaultValues: {
      name: token?.attributes.name || "",
      expiry: token?.attributes.expiry ? new Date(token.attributes.expiry) : undefined,
      permissions: token?.attributes.permissions || [],
    },
  })

  const handleSubmit = (data: TokenFormData) => {
    const { expiry, ...rest } = data
    onSubmit({
      ...rest,
      ...(expiry && { expiry: expiry.toISOString() }),
    })
  }

  const handleCopy = (text: string, field: string) => {
    copyToClipboard(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const addPermission = (permission: string) => {
    const currentPermissions = form.getValues("permissions")
    if (!currentPermissions.includes(permission)) {
      form.setValue("permissions", [...currentPermissions, permission])
    }
    setNewPermission("")
  }

  const removePermission = (permission: string) => {
    const currentPermissions = form.getValues("permissions")
    form.setValue(
      "permissions",
      currentPermissions.filter((p) => p !== permission),
    )
  }

  const isEditing = !!token
  const modalTitle = title || (isEditing ? "Edit Token" : "Create Token")
  const modalDescription =
    description || (isEditing ? "Update token information" : "Add a new token to your Keygen server")

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
                  <FormLabel>Token Name (Optional)</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="My Token" {...field} />
                    </FormControl>
                    {field.value && (
                      <Button type="button" variant="outline" size="sm" onClick={() => handleCopy(field.value, "name")}>
                        {copiedField === "name" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            <FormField
              control={form.control}
              name="permissions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Permissions</FormLabel>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {field.value.map((permission) => (
                        <Badge key={permission} variant="secondary" className="flex items-center gap-1">
                          {permission}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => removePermission(permission)} />
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add permission"
                        value={newPermission}
                        onChange={(e) => setNewPermission(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            if (newPermission.trim()) {
                              addPermission(newPermission.trim())
                            }
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (newPermission.trim()) {
                            addPermission(newPermission.trim())
                          }
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {COMMON_PERMISSIONS.filter((p) => !field.value.includes(p)).map((permission) => (
                        <Button
                          key={permission}
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => addPermission(permission)}
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
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (isEditing ? "Updating..." : "Creating...") : isEditing ? "Update Token" : "Create Token"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
