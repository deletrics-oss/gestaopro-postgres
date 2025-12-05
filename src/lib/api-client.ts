import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Configuração do axios
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token em todas as requisições
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autenticação
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// ========== AUTENTICAÇÃO ==========

export const auth = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  register: async (email: string, password: string, name: string) => {
    const response = await apiClient.post('/auth/register', { email, password, name });
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  },

  getUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('auth_token');
  },
};

// ========== CRUD GENÉRICO ==========

export const createCrudApi = <T = any>(tableName: string) => ({
  getAll: async (): Promise<T[]> => {
    const response = await apiClient.get(`/${tableName}`);
    return response.data;
  },

  getById: async (id: string): Promise<T> => {
    const response = await apiClient.get(`/${tableName}/${id}`);
    return response.data;
  },

  create: async (data: Partial<T>): Promise<T> => {
    const response = await apiClient.post(`/${tableName}`, data);
    return response.data;
  },

  update: async (id: string, data: Partial<T>): Promise<T> => {
    const response = await apiClient.put(`/${tableName}/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/${tableName}/${id}`);
  },
});

// ========== APIs ESPECÍFICAS ==========

export const customersApi = createCrudApi('customers');
export const suppliersApi = createCrudApi('suppliers');
export const employeesApi = createCrudApi('employees');
export const productsApi = createCrudApi('products');
export const materialsApi = createCrudApi('materials');
export const salesApi = createCrudApi('sales');
export const servicesApi = createCrudApi('services');
export const expensesApi = createCrudApi('expenses');
export const marketplaceOrdersApi = createCrudApi('marketplace_orders');
export const productionOrdersApi = createCrudApi('production_orders');
export const machinesVehiclesApi = createCrudApi('machines_vehicles');
export const invoicesApi = createCrudApi('invoices');

// ========== DASHBOARD ==========

export const dashboardApi = {
  getStats: async () => {
    const response = await apiClient.get('/dashboard/stats');
    return response.data;
  },
};

// ========== HEALTH CHECK ==========

export const healthApi = {
  check: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },
};

export { apiClient };
export default apiClient;
