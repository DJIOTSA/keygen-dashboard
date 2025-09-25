export interface KeygenUser {
    id: string;
    type: 'users';
    attributes: {
      firstName?: string;
      lastName?: string;
      email: string;
      created: string;
      updated: string;
      banned?: boolean;
      protected?: boolean;
      metadata?: Record<string, unknown>;
    };
  }
  
  export interface KeygenProduct {
    id: string;
    type: 'products';
    attributes: {
      name: string;
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
      strict: boolean;
      floating: boolean;
      requireHeartbeat: boolean;
      requireCheckIn: boolean;
      checkInInterval?: string;
      checkInIntervalCount?: number;
      usePool: boolean;
      maxMachines?: number;
      maxProcesses?: number;
      maxCores?: number;
      maxUses?: number;
      encrypted: boolean;
      protected: boolean;
      scheme: string;
      created: string;
      updated: string;
      metadata?: Record<string, unknown>;
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