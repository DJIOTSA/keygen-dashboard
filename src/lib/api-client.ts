import { useAuthStore } from './auth-store';
import { KeygenApiError as KeygenApiErrorType, KeygenApiResponse, KeygenEntitlement, KeygenGroup, KeygenLicense, KeygenMachine, KeygenPolicy, KeygenProduct, KeygenToken, KeygenUser } from './types';

class KeygenApiError extends Error {
  constructor(
    message: string,
    public errors: KeygenApiErrorType['errors'],
    public status: number
  ) {
    super(message);
    this.name = 'KeygenApiError';
  }
}

class KeygenApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = `https://api.keygen.localhost/v1`;
    this.token = useAuthStore.getState().token;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/vnd.api+json',
      'Accept': 'application/vnd.api+json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (options.method === 'DELETE' && response.status === 204) {
      return {} as T;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new KeygenApiError(
        data.errors?.[0]?.detail || 'API request failed',
        data.errors || [],
        response.status
      );
    }

    return data;
  }

  // Authentication
  async authenticate(email: string, password: string) {
    const credentials = Buffer.from(`${email}:${password}`).toString('base64');
    
    return this.makeRequest<KeygenApiResponse<KeygenToken>>('/tokens', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
      },
      body: JSON.stringify({
        data: {
          type: 'tokens',
          attributes: {
            name: 'Dashboard Token',
          },
        },
      }),
    });
  }

  // Users
  async getUsers(page = 1, limit = 25) {
    return this.makeRequest<KeygenApiResponse<KeygenUser[]>>(`/users?page[number]=${page}&page[size]=${limit}`);
  }

  async getUser(id: string) {
    return this.makeRequest<KeygenApiResponse<KeygenUser>>(`/users/${id}`);
  }

  async createUser(userData: Partial<KeygenUser['attributes']>) {
    return this.makeRequest<KeygenApiResponse<KeygenUser>>('/users', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'users',
          attributes: userData,
        },
      }),
    });
  }

  async updateUser(id: string, userData: Partial<KeygenUser['attributes']>) {
    return this.makeRequest<KeygenApiResponse<KeygenUser>>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        data: {
          type: 'users',
          id,
          attributes: userData,
        },
      }),
    });
  }

  async deleteUser(id: string) {
    return this.makeRequest(`/users/${id}`, { method: 'DELETE' });
  }

  // Products
  async getProducts(page = 1, limit = 25) {
    return this.makeRequest<KeygenApiResponse<KeygenProduct[]>>(`/products?page[number]=${page}&page[size]=${limit}`);
  }

  async getProduct(id: string) {
    return this.makeRequest<KeygenApiResponse<KeygenProduct>>(`/products/${id}`);
  }

  async createProduct(productData: Partial<KeygenProduct['attributes']>) {
    console.log({productData, in: 'createProduct client api'})
    return this.makeRequest<KeygenApiResponse<KeygenProduct>>('/products', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'products',
          attributes: productData
        },
      }),
    });
  }

  async updateProduct(id: string, productData: Partial<KeygenProduct['attributes']>) {
    return this.makeRequest<KeygenApiResponse<KeygenProduct>>(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        data: {
          type: 'products',
          id,
          attributes: productData,
        },
      }),
    });
  }

  async deleteProduct(id: string) {
    return this.makeRequest(`/products/${id}`, { method: 'DELETE' });
  }

  // Licenses
  async getLicenses(page = 1, limit = 25) {
    return this.makeRequest<KeygenApiResponse<KeygenLicense[]>>(`/licenses?page[number]=${page}&page[size]=${limit}&include=user,policy,product`);
  }

  async getLicense(id: string) {
    return this.makeRequest<KeygenApiResponse<KeygenLicense>>(`/licenses/${id}?include=user,policy,product,machines`);
  }

  async createLicense(licenseData: Partial<KeygenLicense>) {
    return this.makeRequest<KeygenApiResponse<KeygenLicense>>('/licenses', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'licenses',
          attributes: licenseData.attributes,
          relationships: licenseData.relationships,
        },
      }),
    });
  }

  async updateLicense(id: string, licenseData: Partial<KeygenLicense>) {
    return this.makeRequest<KeygenApiResponse<KeygenLicense>>(`/licenses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        data: {
          type: 'licenses',
          id,
          attributes: licenseData.attributes,
          relationships: licenseData.relationships,
        },
      }),
    });
  }

  async deleteLicense(id: string) {
    return this.makeRequest(`/licenses/${id}`, { method: 'DELETE' });
  }

  // Machines
  async getMachines(page = 1, limit = 25) {
    return this.makeRequest<KeygenApiResponse<KeygenMachine[]>>(`/machines?page[number]=${page}&page[size]=${limit}&include=license,user`);
  }

  async getMachine(id: string) {
    return this.makeRequest<KeygenApiResponse<KeygenMachine>>(`/machines/${id}?include=license,user`);
  }

  async deleteMachine(id: string) {
    return this.makeRequest(`/machines/${id}`, { method: 'DELETE' });
  }

  // Policies
  async getPolicies(page = 1, limit = 25) {
    return this.makeRequest<KeygenApiResponse<KeygenPolicy[]>>(`/policies?page[number]=${page}&page[size]=${limit}&include=product`);
  }

  async getPolicy(id: string) {
    return this.makeRequest<KeygenApiResponse<KeygenPolicy>>(`/policies/${id}?include=product`);
  }

  async createPolicy(policyData: Partial<KeygenPolicy>) {
    return this.makeRequest<KeygenApiResponse<KeygenPolicy>>('/policies', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'policies',
          attributes: policyData.attributes,
          relationships: policyData.relationships,
        },
      }),
    });
  }

  async updatePolicy(id: string, policyData: Partial<KeygenPolicy>) {
    return this.makeRequest<KeygenApiResponse<KeygenPolicy>>(`/policies/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        data: {
          type: 'policies',
          id,
          attributes: {
            ...policyData.attributes,
            scheme: undefined,
            encrypted: undefined,
            usePool: undefined
          },
        },
      }),
    });
  }

  async deletePolicy(id: string) {
    return this.makeRequest(`/policies/${id}`, { method: 'DELETE' });
  }

  // Tokens
  async getTokens(page = 1, limit = 25) {
    return this.makeRequest<KeygenApiResponse<KeygenToken[]>>(`/tokens?page[number]=${page}&page[size]=${limit}`);
  }

  async createToken(tokenData: Omit<KeygenToken, 'id' | 'type'>) {
    return this.makeRequest<KeygenApiResponse<KeygenToken>>('/tokens', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'tokens',
          attributes: tokenData,
        },
      }),
    });
  }

  async deleteToken(id: string) {
    return this.makeRequest(`/tokens/${id}`, { method: 'DELETE' });
  }

  // Groups
  async getGroups(page = 1, limit = 25) {
    return this.makeRequest<KeygenApiResponse<KeygenGroup[]>>(`/groups?page[number]=${page}&page[size]=${limit}`);
  }

  async createGroup(groupData: Omit<KeygenGroup, 'id' | 'type'>) {
    return this.makeRequest<KeygenApiResponse<KeygenGroup>>('/groups', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'groups',
          attributes: groupData,
        },
      }),
    });
  }

  async updateGroup(id: string, groupData: Partial<KeygenGroup>) {
    return this.makeRequest<KeygenApiResponse<KeygenGroup>>(`/groups/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        data: {
          type: 'groups',
          id,
          attributes: groupData,
        },
      }),
    });
  }

  async deleteGroup(id: string) {
    return this.makeRequest(`/groups/${id}`, { method: 'DELETE' });
  }
  
  
  // Entitlements
  async getEntitlements(page = 1, limit = 25) {
    return this.makeRequest<KeygenApiResponse<KeygenEntitlement[]>>(`/entitlements?page[number]=${page}&page[size]=${limit}`);
  }

  async createEntitlement(entitlementData: Omit<KeygenEntitlement, 'id' | 'type'>) {
    return this.makeRequest<KeygenApiResponse<KeygenEntitlement>>('/entitlements', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'entitlements',
          attributes: entitlementData,
        },
      }),
    });
  }

  async updateEntitlement(id: string, entitlementData: Partial<KeygenEntitlement>) {
    return this.makeRequest<KeygenApiResponse<KeygenEntitlement>>(`/entitlements/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        data: {
          type: 'entitlements',
          id,
          attributes: entitlementData,
        },
      }),
    });
  }

  async deleteEntitlement(id: string) {
    return this.makeRequest(`/entitlements/${id}`, { method: 'DELETE' });
  }
}

export const apiClient = new KeygenApiClient();