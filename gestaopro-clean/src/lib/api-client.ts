import axios from 'axios';

const API_URL = '/api';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para adicionar token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
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

// Auth
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

// CRUD genérico
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

// APIs específicas
export const customersApi = createCrudApi('customers');
export const productsApi = createCrudApi('products');
export const salesApi = createCrudApi('sales');
export const expensesApi = createCrudApi('expenses');

export { apiClient };
export default apiClient;
