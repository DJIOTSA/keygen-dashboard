"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Check, Copy, Edit } from "lucide-react"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"
import type { KeygenPolicy, KeygenProduct } from "@/lib/types"

const policySchema = z.object({
  name: z.string().min(1, "Policy name is required"),
  duration: z.number().optional(),
  strict: z.boolean(),
  floating: z.boolean(),
  requireHeartbeat: z.boolean(),
  requireCheckIn: z.boolean(),
  checkInInterval: z.string().optional(),
  checkInIntervalCount: z.number().optional(),
  usePool: z.boolean(),
  maxMachines: z.number().optional(),
  maxProcesses: z.number().optional(),
  maxCores: z.number().optional(),
  maxUses: z.number().optional(),
  encrypted: z.boolean(),
  protected: z.boolean(),
  scheme: z.string().min(1, "Scheme is required"),
  productId: z.string().min(1, "Product is required"),
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

type PayloadResponse = {
  meta: string,
  error?: Array<{ 
    title: string,
    detail: string,
    source: {
      pointer: string
    }
  }>,
  data?: KeygenPolicy
}

type PolicyFormData = z.infer<typeof policySchema>

interface PolicyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  // onSubmit?: (data: any) => void
  policy?: KeygenPolicy | null
  products: KeygenProduct[]
  isLoading?: boolean
  title?: string
  description?: string
}

const SCHEMES = ["ED25519_SIGN", "RSA_2048_PKCS1_SIGN", "RSA_2048_PKCS1_PSS_SIGN", "RSA_2048_JWT_RS256"]

const CHECK_IN_INTERVALS = ["day", "week", "month", "year"]

export function EditPolicyModal({
  open,
  onOpenChange,
  // onSubmit,
  policy,
  products,
  isLoading = false,
  title,
  description,
}: PolicyModalProps) {
  const [, copyToClipboard] = useCopyToClipboard()
  const [copiedField, setCopiedField] = useState<string | null>(null)


  const form = useForm<PolicyFormData>({
    resolver: zodResolver(policySchema),
    defaultValues: {
      name: policy?.attributes.name || "",
      duration: policy?.attributes.duration || undefined,
      strict: policy?.attributes.strict || false,
      floating: policy?.attributes.floating || false,
      requireHeartbeat: policy?.attributes.requireHeartbeat || false,
      requireCheckIn: policy?.attributes.requireCheckIn || false,
      checkInInterval: policy?.attributes.checkInInterval || "",
      checkInIntervalCount: policy?.attributes.checkInIntervalCount || undefined,
      usePool: policy?.attributes.usePool || false,
      maxMachines: policy?.attributes.maxMachines || undefined,
      maxProcesses: policy?.attributes.maxProcesses || undefined,
      maxCores: policy?.attributes.maxCores || undefined,
      maxUses: policy?.attributes.maxUses || undefined,
      encrypted: policy?.attributes.encrypted || false,
      protected: policy?.attributes.protected || false,
      scheme: policy?.attributes.scheme || "",
      productId: policy?.relationships?.product?.data?.id || "",
      metadata: policy?.attributes.metadata ? JSON.stringify(policy.attributes.metadata, null, 2) : "",
    },
  })

  const editPolicy = async (data: PolicyFormData) => {
    const response = await apiClient.updatePolicy(policy!.id!, data) as PayloadResponse
    console.log(response)
    onOpenChange(false)
    if(response.data) {
      toast({
        title: "Policy updated",
        description: "The policy has been updated successfully.",
      })
    }
    if(response.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: response.error[0].detail,
      })
    }

  }

  const handleSubmit = (data: PolicyFormData) => {
    const { metadata, productId, ...rest } = data
    console.log({rest, metadata, productId})
    // onSubmit?.({
    //   attributes: {
    //     ...rest,
    //     ...(metadata && { metadata }),
    //   },
    //   relationships: {
    //     product: {
    //       data: { id: productId, type: "products" },
    //     },
    //   },
    // })
    editPolicy(data)
  }

  const handleCopy = (text: string, field: string) => {
    copyToClipboard(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const isEditing = !!policy
  const modalTitle = title || (isEditing ? "Edit Policy" : "Create Policy")
  const modalDescription =
    description || (isEditing ? "Update policy information" : "Add a new policy to your Keygen server")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <div className="flex items-center gap-2">
          <Edit className="h-4 w-4" />
          <Button variant="none">Edit</Button>
        </div>
      </DialogTrigger>
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
                  <FormLabel>Policy Name</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="My Policy" {...field} />
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
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products?.map((product) => (
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
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (seconds)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="86400"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number.parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxMachines"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Machines</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number.parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="maxUses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Uses</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Unlimited"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number.parseInt(e.target.value) : undefined)}
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
                        type="number"
                        placeholder="Unlimited"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number.parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="strict"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Strict</FormLabel>
                      <div className="text-sm text-muted-foreground">Enforce strict license validation</div>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="floating"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Floating</FormLabel>
                      <div className="text-sm text-muted-foreground">Allow floating licenses</div>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="encrypted"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Encrypted</FormLabel>
                      <div className="text-sm text-muted-foreground">Encrypt license keys</div>
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
                    ? "Update Policy"
                    : "Create Policy"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
