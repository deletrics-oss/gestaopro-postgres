// Wrapper de compatibilidade para substituir Supabase por API REST
import { 
  auth, 
  customersApi, 
  suppliersApi, 
  employeesApi, 
  productsApi,
  materialsApi,
  salesApi,
  servicesApi,
  expensesApi,
  marketplaceOrdersApi,
  productionOrdersApi,
  machinesVehiclesApi,
  invoicesApi
} from './api-client';

// Objeto compatível com a interface do Supabase
export const supabase = {
  auth: {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      try {
        const data = await auth.login(email, password);
        return { data: { user: data.user, session: { access_token: data.token } }, error: null };
      } catch (error: any) {
        return { data: { user: null, session: null }, error: { message: error.response?.data?.error || 'Erro ao fazer login' } };
      }
    },

    signUp: async ({ email, password }: { email: string; password: string }) => {
      try {
        const data = await auth.register(email, password, email.split('@')[0]);
        return { data: { user: data.user, session: { access_token: data.token } }, error: null };
      } catch (error: any) {
        return { data: { user: null, session: null }, error: { message: error.response?.data?.error || 'Erro ao registrar' } };
      }
    },

    signOut: async () => {
      try {
        await auth.logout();
        return { error: null };
      } catch (error: any) {
        return { error: { message: error.response?.data?.error || 'Erro ao fazer logout' } };
      }
    },

    getSession: async () => {
      const user = auth.getUser();
      const token = localStorage.getItem('auth_token');
      if (user && token) {
        return { data: { session: { access_token: token, user } }, error: null };
      }
      return { data: { session: null }, error: null };
    },

    getUser: async () => {
      const user = auth.getUser();
      return { data: { user }, error: null };
    },

    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      // Simular listener de mudança de estado
      const checkAuth = () => {
        const user = auth.getUser();
        const token = localStorage.getItem('auth_token');
        if (user && token) {
          callback('SIGNED_IN', { access_token: token, user });
        } else {
          callback('SIGNED_OUT', null);
        }
      };
      
      checkAuth();
      
      return {
        data: { subscription: { unsubscribe: () => {} } }
      };
    }
  },

  from: (table: string) => {
    let api: any;
    
    switch (table) {
      case 'customers': api = customersApi; break;
      case 'suppliers': api = suppliersApi; break;
      case 'employees': api = employeesApi; break;
      case 'products': api = productsApi; break;
      case 'materials': api = materialsApi; break;
      case 'sales': api = salesApi; break;
      case 'services': api = servicesApi; break;
      case 'expenses': api = expensesApi; break;
      case 'marketplace_orders': api = marketplaceOrdersApi; break;
      case 'production_orders': api = productionOrdersApi; break;
      case 'machines_vehicles': api = machinesVehiclesApi; break;
      case 'invoices': api = invoicesApi; break;
      default: api = customersApi;
    }

    return {
      select: (columns = '*') => ({
        eq: (column: string, value: any) => ({
          single: async () => {
            try {
              const data = await api.getAll();
              const item = data.find((d: any) => d[column] === value);
              return { data: item || null, error: null };
            } catch (error: any) {
              return { data: null, error: { message: error.message } };
            }
          },
          then: async (resolve: any) => {
            try {
              const data = await api.getAll();
              const filtered = data.filter((d: any) => d[column] === value);
              resolve({ data: filtered, error: null });
            } catch (error: any) {
              resolve({ data: null, error: { message: error.message } });
            }
          }
        }),
        ilike: (column: string, pattern: any) => ({
          limit: (limitValue: number) => ({
            then: async (resolve: any) => {
              try {
                const data = await api.getAll();
                const searchPattern = pattern.replace(/%/g, '').toLowerCase();
                const filtered = data.filter((d: any) => {
                  const fieldValue = String(d[column] || '').toLowerCase();
                  return fieldValue.includes(searchPattern);
                }).slice(0, limitValue);
                resolve({ data: filtered, error: null });
              } catch (error: any) {
                resolve({ data: null, error: { message: error.message } });
              }
            }
          }),
          then: async (resolve: any) => {
            try {
              const data = await api.getAll();
              const searchPattern = pattern.replace(/%/g, '').toLowerCase();
              const filtered = data.filter((d: any) => {
                const fieldValue = String(d[column] || '').toLowerCase();
                return fieldValue.includes(searchPattern);
              });
              resolve({ data: filtered, error: null });
            } catch (error: any) {
              resolve({ data: null, error: { message: error.message } });
            }
          }
        }),
        gte: (column: string, value: any) => ({
          lte: (column2: string, value2: any) => ({
            order: (orderColumn: string, options?: any) => ({
              then: async (resolve: any) => {
                try {
                  const data = await api.getAll();
                  const filtered = data.filter((d: any) => d[column] >= value && d[column2] <= value2);
                  const sorted = [...filtered].sort((a: any, b: any) => {
                    if (options?.ascending) {
                      return a[orderColumn] > b[orderColumn] ? 1 : -1;
                    }
                    return a[orderColumn] < b[orderColumn] ? 1 : -1;
                  });
                  resolve({ data: sorted, error: null });
                } catch (error: any) {
                  resolve({ data: null, error: { message: error.message } });
                }
              }
            }),
            then: async (resolve: any) => {
              try {
                const data = await api.getAll();
                const filtered = data.filter((d: any) => d[column] >= value && d[column2] <= value2);
                resolve({ data: filtered, error: null });
              } catch (error: any) {
                resolve({ data: null, error: { message: error.message } });
              }
            }
          })
        }),
        order: (column: string, options?: any) => ({
          then: async (resolve: any) => {
            try {
              const data = await api.getAll();
              const sorted = [...data].sort((a: any, b: any) => {
                if (options?.ascending) {
                  return a[column] > b[column] ? 1 : -1;
                }
                return a[column] < b[column] ? 1 : -1;
              });
              resolve({ data: sorted, error: null });
            } catch (error: any) {
              resolve({ data: null, error: { message: error.message } });
            }
          }
        }),
        then: async (resolve: any) => {
          try {
            const data = await api.getAll();
            resolve({ data, error: null });
          } catch (error: any) {
            resolve({ data: null, error: { message: error.message } });
          }
        }
      }),

      insert: (data: any) => ({
        select: () => ({
          single: async () => {
            try {
              // Se for array, pega o primeiro item
              const payload = Array.isArray(data) ? data[0] : data;
              const result = await api.create(payload);
              return { data: result, error: null };
            } catch (error: any) {
              return { data: null, error: { message: error.message } };
            }
          },
          then: async (resolve: any) => {
            try {
              if (Array.isArray(data)) {
                // Se for array, cria todos em paralelo
                const results = await Promise.all(data.map(item => api.create(item)));
                resolve({ data: results, error: null });
              } else {
                const result = await api.create(data);
                resolve({ data: [result], error: null });
              }
            } catch (error: any) {
              resolve({ data: null, error: { message: error.message } });
            }
          }
        }),
        then: async (resolve: any) => {
          try {
            if (Array.isArray(data)) {
              const results = await Promise.all(data.map(item => api.create(item)));
              resolve({ data: results, error: null });
            } else {
              const result = await api.create(data);
              resolve({ data: result, error: null });
            }
          } catch (error: any) {
            resolve({ data: null, error: { message: error.message } });
          }
        }
      }),

      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          select: () => ({
            then: async (resolve: any) => {
              try {
                const result = await api.update(value, data);
                resolve({ data: [result], error: null });
              } catch (error: any) {
                resolve({ data: null, error: { message: error.message } });
              }
            }
          }),
          then: async (resolve: any) => {
            try {
              const result = await api.update(value, data);
              resolve({ data: result, error: null });
            } catch (error: any) {
              resolve({ data: null, error: { message: error.message } });
            }
          }
        })
      }),

      delete: () => ({
        eq: (column: string, value: any) => ({
          then: async (resolve: any) => {
            try {
              await api.delete(value);
              resolve({ data: null, error: null });
            } catch (error: any) {
              resolve({ data: null, error: { message: error.message } });
            }
          }
        }),
        in: (column: string, values: any[]) => ({
          then: async (resolve: any) => {
            try {
              await Promise.all(values.map(v => api.delete(v)));
              resolve({ data: null, error: null });
            } catch (error: any) {
              resolve({ data: null, error: { message: error.message } });
            }
          }
        })
      })
    };
  }
};
