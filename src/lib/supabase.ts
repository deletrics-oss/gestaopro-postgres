import { apiClient, auth } from './api-client';

// Mapeamento de tabelas para APIs
const tableToApi = {
  customers: 'customers',
  products: 'products',
  sales: 'sales',
  expenses: 'expenses',
  suppliers: 'suppliers',
  employees: 'employees',
  services: 'services',
  materials: 'materials',
  machines_vehicles: 'machines_vehicles',
  production_orders: 'production_orders',
  marketplace_orders: 'marketplace_orders',
  invoices: 'invoices',
  cash_movements: 'cash_movements',
};

class SupabaseQueryBuilder {
  constructor(private tableName: string) { }

  select(columns: string = '*') {
    return {
      order: (column: string, options?: any) => this.execute(),
      execute: () => this.execute(),
      then: (resolve: Function) => this.execute().then(resolve),
    };
  }

  async execute() {
    try {
      const data = await apiClient.get(`/${this.tableName}`);
      return { data: data.data, error: null };
    } catch (error: any) {
      return { data: null, error: error.response?.data || error };
    }
  }

  async insert(records: any[]) {
    try {
      const data = await apiClient.post(`/${this.tableName}`, records[0]);
      return { data: data.data, error: null };
    } catch (error: any) {
      return { data: null, error: error.response?.data || error };
    }
  }

  update(data: any) {
    return {
      eq: (column: string, value: any) => this.updateExecute(value, data),
    };
  }

  async updateExecute(id: string, data: any) {
    try {
      const result = await apiClient.put(`/${this.tableName}/${id}`, data);
      return { data: result.data, error: null };
    } catch (error: any) {
      return { data: null, error: error.response?.data || error };
    }
  }

  delete() {
    return {
      eq: (column: string, value: any) => this.deleteExecute(value),
      in: (column: string, values: any[]) => this.deleteMultipleExecute(values),
    };
  }

  async deleteExecute(id: string) {
    try {
      await apiClient.delete(`/${this.tableName}/${id}`);
      return { data: null, error: null };
    } catch (error: any) {
      return { data: null, error: error.response?.data || error };
    }
  }

  async deleteMultipleExecute(ids: string[]) {
    try {
      await Promise.all(ids.map(id => apiClient.delete(`/${this.tableName}/${id}`)));
      return { data: null, error: null };
    } catch (error: any) {
      return { data: null, error: error.response?.data || error };
    }
  }
}

// Adaptador principal do Supabase
export const supabase = {
  from: (tableName: string) => {
    return new SupabaseQueryBuilder(tableName);
  },

  // Auth compatível (se necessário no futuro)
  auth: {
    getSession: async () => {
      const user = auth.getUser();
      const token = localStorage.getItem('auth_token');
      return {
        data: {
          session: token ? { access_token: token, user } : null
        },
        error: null
      };
    },
    getUser: async () => {
      const user = auth.getUser();
      return { data: { user }, error: null };
    },
    signIn: async () => ({ data: null, error: null }),
    signOut: async () => {
      await auth.logout();
      return { error: null };
    },
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      // Execute callback immediately with current state
      const user = auth.getUser();
      const token = localStorage.getItem('auth_token');
      const session = token ? { access_token: token, user } : null;

      callback(session ? 'SIGNED_IN' : 'SIGNED_OUT', session);

      return {
        data: {
          subscription: {
            unsubscribe: () => { },
          },
        },
      };
    },
  },
};
