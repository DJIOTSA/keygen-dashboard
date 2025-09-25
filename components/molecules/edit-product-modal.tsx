/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Check, Copy, Plus, X } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useCopyToClipboard } from "react-use"
import { z } from "zod"

import { Badge } from "@/components/ui/badge"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { KeygenProduct } from "@/lib/types"

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  url: z.string().url().optional().or(z.literal("")),
  distributionStrategy: z.string().min(1, "Distribution strategy is required").optional(),
  platforms: z.array(z.string()).optional(),
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

type ProductFormData = z.infer<typeof productSchema>

interface ProductModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
  product?: KeygenProduct | null
  isLoading?: boolean
  title?: string
  description?: string
}

const DISTRIBUTION_STRATEGIES = ["LICENSED", "OPEN", "CLOSED"]

const COMMON_PLATFORMS = ["windows", "macos", "linux", "ios", "android", "web"]

export function EditProductModal({
  open,
  onOpenChange,
  onSubmit,
  product,
  isLoading = false,
  title,
  description,
}: ProductModalProps) {
  const [, copyToClipboard] = useCopyToClipboard()
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [newPlatform, setNewPlatform] = useState("")

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.attributes.name,
      url: product?.attributes.url,
      distributionStrategy: product?.attributes.distributionStrategy,
      platforms: product?.attributes.platforms || [],
      metadata: product?.attributes.metadata ? JSON.stringify(product.attributes.metadata, null, 2) : undefined,
    },
  })

  const formData = form.watch()

  const handleSubmit = () => {
    const { metadata, ...rest } = formData
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

  const addPlatform = (platform: string) => {
    const currentPlatforms = form.getValues("platforms")
    if (currentPlatforms?.includes(platform)) {
      form.setValue("platforms", [...currentPlatforms, platform])
    }
    setNewPlatform("")
  }

  const removePlatform = (platform: string) => {
    const currentPlatforms = form.getValues("platforms")
    form.setValue(
      "platforms",
      currentPlatforms?.filter((p) => p !== platform),
    )
  }

  const isEditing = !!product
  const modalTitle = title || (isEditing ? "Edit Product" : "Create Product")
  const modalDescription =
    description || (isEditing ? "Update product information" : "Add a new product to your Keygen server")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
          <DialogDescription>{modalDescription}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="My Awesome Product" {...field} />
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
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="distributionStrategy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Distribution Strategy</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select distribution strategy" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DISTRIBUTION_STRATEGIES.map((strategy) => (
                        <SelectItem key={strategy} value={strategy}>
                          {strategy}
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
              name="platforms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Platforms</FormLabel>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {field.value.map((platform) => (
                        <Badge key={platform} variant="secondary" className="flex items-center gap-1">
                          {platform}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => removePlatform(platform)} />
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add platform"
                        value={newPlatform}
                        onChange={(e) => setNewPlatform(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            if (newPlatform.trim()) {
                              addPlatform(newPlatform.trim())
                            }
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (newPlatform.trim()) {
                            addPlatform(newPlatform.trim())
                          }
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {COMMON_PLATFORMS.filter((p) => !field.value.includes(p)).map((platform) => (
                        <Button
                          key={platform}
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => addPlatform(platform)}
                          className="h-6 px-2 text-xs"
                        >
                          + {platform}
                        </Button>
                      ))}
                    </div>
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
              <Button type="button" onClick={handleSubmit} disabled={isLoading}>
                {isLoading
                  ? isEditing
                    ? "Updating..."
                    : "Creating..."
                  : isEditing
                    ? "Update Product"
                    : "Create Product"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
