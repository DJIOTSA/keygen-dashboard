import { KeygenApiError as KeygenApiErrorType, KeygenApiResponse, KeygenEntitlement, KeygenLicense, KeygenMachine, KeygenPolicy, KeygenProduct, KeygenToken, KeygenUser } from './types';

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
    this.baseUrl = `https://${process.env.NEXT_PUBLIC_KEYGEN_HOST}/v1`;
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

  async createUser(userData: Omit<KeygenUser, 'id' | 'type'>) {
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

  async updateUser(id: string, userData: Omit<KeygenUser, 'id' | 'type'>) {
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

  async createProduct(productData: Omit<KeygenProduct, 'id' | 'type'>) {
    return this.makeRequest<KeygenApiResponse<KeygenProduct>>('/products', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'products',
          attributes: productData,
        },
      }),
    });
  }

  async updateProduct(id: string, productData: Omit<KeygenProduct, 'id' | 'type'>) {
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

  async createLicense(licenseData: Omit<KeygenLicense, 'id' | 'type'>) {
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

  async updateLicense(id: string, licenseData: Omit<KeygenLicense, 'id' | 'type'>) {
    return this.makeRequest<KeygenApiResponse<KeygenLicense>>(`/licenses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        data: {
          type: 'licenses',
          id,
          attributes: licenseData,
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

  async createPolicy(policyData: Omit<KeygenPolicy, 'id' | 'type'>) {
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

  async updatePolicy(id: string, policyData: Omit<KeygenPolicy, 'id' | 'type'>) {
    return this.makeRequest<KeygenApiResponse<KeygenPolicy>>(`/policies/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        data: {
          type: 'policies',
          id,
          attributes: policyData,
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

  async deleteEntitlement(id: string) {
    return this.makeRequest(`/entitlements/${id}`, { method: 'DELETE' });
  }
}

export const apiClient = new KeygenApiClient();