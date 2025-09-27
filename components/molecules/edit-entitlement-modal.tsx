"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useCopyToClipboard } from "react-use"
import { z } from "zod"
import { Copy, Check } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
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
import type { KeygenEntitlement } from "@/lib/types"

const entitlementSchema = z.object({
  name: z.string().min(1, "Entitlement name is required"),
  code: z.string().min(1, "Entitlement code is required"),
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

type EntitlementFormData = z.infer<typeof entitlementSchema>

interface EntitlementModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
  entitlement?: KeygenEntitlement | null
  isLoading?: boolean
  title?: string
  description?: string
}

export function EditEntitlementModal({
  open,
  onOpenChange,
  onSubmit,
  entitlement,
  isLoading = false,
  title,
  description,
}: EntitlementModalProps) {
  const [, copyToClipboard] = useCopyToClipboard()
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const form = useForm<EntitlementFormData>({
    resolver: zodResolver(entitlementSchema),
    defaultValues: {
      name: entitlement?.attributes.name,
      code: entitlement?.attributes.code,
      metadata: entitlement?.attributes.metadata ? JSON.stringify(entitlement.attributes.metadata, null, 2) : undefined,
    },
  })

  const handleSubmit = (data: EntitlementFormData) => {
    const { metadata, ...rest } = data
    onSubmit({
      ...rest,
      ...(metadata && { metadata }),
    })
  }

  const handleCopy = (text: string, field: string) => {
    copyToClipboard(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const isEditing = !!entitlement
  const modalTitle = title || (isEditing ? "Edit Entitlement" : "Create Entitlement")
  const modalDescription =
    description || (isEditing ? "Update entitlement information" : "Add a new entitlement to your Keygen server")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
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
                  <FormLabel>Entitlement Name</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="Premium Features" {...field} />
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
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Entitlement Code</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="PREMIUM_FEATURES" {...field} />
                    </FormControl>
                    {field.value && (
                      <Button type="button" variant="outline" size="sm" onClick={() => handleCopy(field.value, "code")}>
                        {copiedField === "code" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    )}
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
                    ? "Update Entitlement"
                    : "Create Entitlement"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
