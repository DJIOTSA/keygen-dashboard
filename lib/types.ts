import z from "zod";

export interface KeygenUser {
    id: string;
    type: 'users';
    attributes: {
      fullName?: string;
      firstName?: string;
      lastName?: string;
      email: string;
      created: string;
      updated: string;
      status: 'ACTIVE' | 'INACTIVE' | 'BANNED';
      role: 'user' | 'admin' | 'support-agent' | 'sales-agent' | 'developer' | 'read-only' | 'admin';
      protected?: boolean;
      password?: string;
      metadata?: Record<string, unknown>;
      permissions?: string[];
    };
  }
  export interface KeygenGroup {
    id: string;
    type: 'groups';
    attributes: {
      name: string;
      code?: string;
      created: string;
      updated: string;
      metadata?: Record<string, unknown>;
    };
    relationships?: {
      users?: { data: Array<{ id: string; type: 'users' }> };
      licenses?: { data: Array<{ id: string; type: 'licenses' }> };
      machines?: { data: Array<{ id: string; type: 'machines' }> };
      policies?: { data: Array<{ id: string; type: 'policies' }> };
      products?: { data: Array<{ id: string; type: 'products' }> };
    };
  }
  
  export interface KeygenProduct {
    id: string;
    type: 'products';
    attributes: {
      name: string;
      code?: string;
      url?: string;
      distributionStrategy: string;
      platforms: string[];
      created: string;
      updated: string;
      metadata?: Record<string, unknown>;
    };
  }
  
  export interface KeygenLicense {
    id: string;
    type: 'licenses';
    attributes: {
      name?: string;
      key: string;
      expiry?: string;
      status: 'active' | 'inactive' | 'expired' | 'suspended';
      uses: number;
      protected: boolean;
      suspended: boolean;
      scheme: string;
      created: string;
      updated: string;
      metadata?: Record<string, unknown>;
    };
    relationships?: {
      user?: { data: { id: string; type: 'users' } };
      owner?: { data: { id: string; type: 'users' } };
      group?: { data: { id: string; type: 'groups' } };
      policy?: { data: { id: string; type: 'policies' } };
      product?: { data: { id: string; type: 'products' } };
    };
  }
  
  export interface KeygenMachine {
    id: string;
    type: 'machines';
    attributes: {
      name?: string;
      fingerprint: string;
      ip: string;
      hostname: string;
      platform: string;
      cores: number;
      created: string;
      updated: string;
      lastValidated?: string;
      lastHeartbeat?: string;
      metadata?: Record<string, unknown>;
    };
    relationships?: {
      license?: { data: { id: string; type: 'licenses' } };
      user?: { data: { id: string; type: 'users' } };
    };
  }
  
  export interface KeygenPolicy {
    id: string;
    type: 'policies';
    attributes: {
      name: string;
      duration?: number;
  
      strict?: boolean;
      floating?: boolean;
      scheme?: "ED25519_SIGN" | "RSA_2048_PKCS1_SIGN" | "RSA_2048_PSS_SIGN" | "ECDSA_P256_SIGN" | "RSA_2048_PKCS1_PSS_SIGN_V2" | "RSA_2048_PKCS1_SIGN_V2" | "RSA_2048_JWT_RS256" | "RSA_2048_PKCS1_ENCRYPT";
      // Scope requirements
      requireProductScope?: boolean;
      requirePolicyScope?: boolean;
      requireMachineScope?: boolean;
      requireFingerprintScope?: boolean;
      requireComponentsScope?: boolean;
      requireUserScope?: boolean;
      requireChecksumScope?: boolean;
      requireVersionScope?: boolean;
  
      // Check-in & heartbeat
      requireCheckIn?: boolean;
      checkInInterval?: number;
      checkInIntervalCount?: number;
      requireHeartbeat?: boolean;
      heartbeatDuration?: number;
      heartbeatCullStrategy?: 'DEACTIVATE_DEAD' | 'DELETE_DEAD' | 'DO_NOTHING' | null;
      heartbeatResurrectionStrategy?: 'NO_REVIVE' | 'REVIVE_ON_PING' | null;
      heartbeatBasis?: 'FROM_CREATION' | 'FROM_FIRST_PING' | null;
  
      // Limits
      usePool?: boolean;
      maxMachines?: number;
      maxProcesses?: number;
      maxUsers?: number;
      maxCores?: number;
      maxMemory?: number;
      maxDisk?: number;
      maxUses?: number;
  
      // Machine strategies
      machineUniquenessStrategy?: 'UNIQUE_PER_LICENSE' | 'UNIQUE_PER_POLICY' | 'UNIQUE_PER_ACCOUNT' | null;
      machineMatchingStrategy?: 'MATCH_ALL' | 'MATCH_ANY' | null;
  
      // Component strategies
      componentUniquenessStrategy?: 'UNIQUE_PER_MACHINE' | 'UNIQUE_PER_LICENSE' | 'UNIQUE_PER_POLICY' | null;
      componentMatchingStrategy?: 'MATCH_ALL' | 'MATCH_ANY' | null;
  
      // Expiration & renewal
      expirationStrategy?: 'RESTRICT_ACCESS' | 'REVOKE_ACCESS' | null;
      expirationBasis?: 'FROM_CREATION' | 'FROM_ACTIVATION' | 'FROM_FIRST_CHECK_IN' | null;
      renewalBasis?: 'FROM_EXPIRY' | 'FROM_RENEWAL' | null;
  
      // Transfer
      transferStrategy?: 'KEEP_EXPIRY' | 'RESET_EXPIRY' | null;
  
      // Auth
      authenticationStrategy?: 'TOKEN' | 'LICENSE_KEY' | null;
  
      // Leasing
      machineLeasingStrategy?: 'PER_LICENSE' | 'PER_POLICY' | null;
      processLeasingStrategy?: 'PER_MACHINE' | 'PER_LICENSE' | 'PER_POLICY' | null;
  
      // Overage
      overageStrategy?: 'NO_OVERAGE' | 'ALLOW_OVERAGE' | null;
  
      // Metadata
      metadata?: Record<string, unknown>;
  
      // System properties
      encrypted?: boolean;
      protected?: boolean;
  
      // Audit timestamps
      created: string;
      updated: string;
    };
    relationships?: {
      product?: { data: { id: string; type: 'products' } };
    };
  }
  
  export interface KeygenToken {
    id: string;
    type: 'tokens';
    attributes: {
      token: string;
      kind: 'activation-token' | 'product-token' | 'user-token' | 'support-token' | 'sales-token' | 'developer-token' | 'admin-token';
      permissions: string[];
      created: string;
      updated: string;
      expiry?: string;
    };
    relationships?: {
      account: {
        links: {
          related: string;
        },
        data: {
          type: "accounts",
          id: string;
        }
      },
      bearer: {
        links: {
          related: string;
        },
        data: {
          type: "users",
          id: string;
        }
      }
    };
  }
  
  export interface KeygenEntitlement {
    id: string;
    type: 'entitlements';
    attributes: {
      name: string;
      code: string;
      created: string;
      updated: string;
      metadata?: Record<string, unknown>;
    };
  }
  
  export interface KeygenApiResponse<T> {
    data: T;
    meta?: {
      pages?: {
        current: number;
        count: number;
        first: string;
        last: string;
        next?: string;
        prev?: string;
      };
    };
  }
  
  export interface KeygenApiError {
    errors: Array<{
      title: string;
      detail: string;
      code: string;
      source?: {
        pointer?: string;
        parameter?: string;
      };
    }>;
  }

  export const optionalNumber = z.coerce
    .number()
    .min(0, "Must be a positive number")
    .optional()
    .nullable();

  export const policySchema = z.object({
    name: z.string().min(1, "Name is required"),
    productId: z.string().optional(),
    duration: optionalNumber,
    strict: z.boolean().optional(),
    floating: z.boolean().optional(),
    scheme: z.enum([
      "ED25519_SIGN",
      "RSA_2048_PKCS1_SIGN",
      "RSA_2048_PSS_SIGN",
      "ECDSA_P256_SIGN",
      "RSA_2048_PKCS1_PSS_SIGN_V2",
      "RSA_2048_PKCS1_SIGN_V2",
      "RSA_2048_JWT_RS256",
      "RSA_2048_PKCS1_ENCRYPT",
    ]),
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
  
  export type PolicyFormData = z.infer<typeof policySchema>;