"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Check, Copy } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useCopyToClipboard } from "react-use"
import { z } from "zod"

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
import type { KeygenUser } from "@/lib/types"

const userSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email("Please enter a valid email address"),
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

type UserFormData = z.infer<typeof userSchema>

interface UserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
  user?: KeygenUser | null
  isLoading?: boolean
  title?: string
  description?: string
}

export function EditUserModal({
  open,
  onOpenChange,
  onSubmit,
  user,
  isLoading = false,
  title,
  description,
}: UserModalProps) {
  const [, copyToClipboard] = useCopyToClipboard()
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: user?.attributes.firstName || "",
      lastName: user?.attributes.lastName || "",
      email: user?.attributes.email || "",
      metadata: user?.attributes.metadata ? JSON.stringify(user.attributes.metadata, null, 2) : "",
    },
  })

  const handleSubmit = (data: UserFormData) => {
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

  const isEditing = !!user
  const modalTitle = title || (isEditing ? "Edit User" : "Create User")
  const modalDescription =
    description || (isEditing ? "Update user information" : "Add a new user to your Keygen server")

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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="user@example.com" {...field} />
                    </FormControl>
                    {field.value && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(field.value, "email")}
                      >
                        {copiedField === "email" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    )}
                  </div>
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
                {isLoading ? (isEditing ? "Updating..." : "Creating...") : isEditing ? "Update User" : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
