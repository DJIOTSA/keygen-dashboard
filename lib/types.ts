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
      scheme?: 'ED25519_SIGN' | 'RSA_2048_PKCS1_SIGN' | 'RSA_2048_PSS_SIGN' | null;
  
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
      name?: string;
      created: string;
      updated: string;
      expiry?: string;
      permissions: string[];
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