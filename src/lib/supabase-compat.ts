/**
 * Wrapper de compatibilidade para substituir o Supabase Client
 * Traduz chamadas do Supabase para a API REST local
 */

import apiClient, { auth, createCrudApi } from './api-client';

// Simula a estrutura do Supabase Client
export const supabase = {
  auth: {
    signIn: async ({ email, password }: { email: string; password: string }) => {
      try {
        const data = await auth.login(email, password);
        return { data, error: null };
      } catch (error: any) {
        return { data: null, error: error.response?.data || error };
      }
    },

    signUp: async ({ email, password, options }: { email: string; password: string; options?: any }) => {
      try {
        const name = options?.data?.name || '';
        const data = await auth.register(email, password, name);
        return { data, error: null };
      } catch (error: any) {
        return { data: null, error: error.response?.data || error };
      }
    },

    signOut: async () => {
      try {
        await auth.logout();
        return { error: null };
      } catch (error: any) {
        return { error: error.response?.data || error };
      }
    },

    getUser: async () => {
      const user = auth.getUser();
      return { data: { user }, error: null };
    },

    getSession: async () => {
      const user = auth.getUser();
      const token = localStorage.getItem('auth_token');
      if (user && token) {
        return { data: { session: { user, access_token: token } }, error: null };
      }
      return { data: { session: null }, error: null };
    },

    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      // Implementação simplificada
      const user = auth.getUser();
      if (user) {
        callback('SIGNED_IN', { user });
      } else {
        callback('SIGNED_OUT', null);
      }
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
  },

  from: (tableName: string) => {
    const api = createCrudApi(tableName);

    return {
      select: (columns = '*') => ({
        eq: (column: string, value: any) => ({
          single: async () => {
            try {
              const data = await api.getAll();
              const filtered = data.filter((item: any) => item[column] === value);
              return { data: filtered[0] || null, error: null };
            } catch (error: any) {
              return { data: null, error: error.response?.data || error };
            }
          },
          then: async (resolve: any) => {
            try {
              const data = await api.getAll();
              const filtered = data.filter((item: any) => item[column] === value);
              resolve({ data: filtered, error: null });
            } catch (error: any) {
              resolve({ data: null, error: error.response?.data || error });
            }
          },
        }),
        order: (column: string, options?: any) => ({
          then: async (resolve: any) => {
            try {
              let data = await api.getAll();
              const ascending = options?.ascending !== false;
              data = data.sort((a: any, b: any) => {
                if (ascending) {
                  return a[column] > b[column] ? 1 : -1;
                } else {
                  return a[column] < b[column] ? 1 : -1;
                }
              });
              resolve({ data, error: null });
            } catch (error: any) {
              resolve({ data: null, error: error.response?.data || error });
            }
          },
        }),
        then: async (resolve: any) => {
          try {
            const data = await api.getAll();
            resolve({ data, error: null });
          } catch (error: any) {
            resolve({ data: null, error: error.response?.data || error });
          }
        },
      }),

      insert: (values: any) => ({
        select: () => ({
          then: async (resolve: any) => {
            try {
              const data = await api.create(values);
              resolve({ data: [data], error: null });
            } catch (error: any) {
              resolve({ data: null, error: error.response?.data || error });
            }
          },
        }),
        then: async (resolve: any) => {
          try {
            const data = await api.create(values);
            resolve({ data, error: null });
          } catch (error: any) {
            resolve({ data: null, error: error.response?.data || error });
          }
        },
      }),

      update: (values: any) => ({
        eq: (column: string, value: any) => ({
          select: () => ({
            then: async (resolve: any) => {
              try {
                // Para update, precisamos do ID
                const data = await api.update(value, values);
                resolve({ data: [data], error: null });
              } catch (error: any) {
                resolve({ data: null, error: error.response?.data || error });
              }
            },
          }),
          then: async (resolve: any) => {
            try {
              const data = await api.update(value, values);
              resolve({ data, error: null });
            } catch (error: any) {
              resolve({ data: null, error: error.response?.data || error });
            }
          },
        }),
      }),

      delete: () => ({
        eq: (column: string, value: any) => ({
          then: async (resolve: any) => {
            try {
              await api.delete(value);
              resolve({ data: null, error: null });
            } catch (error: any) {
              resolve({ data: null, error: error.response?.data || error });
            }
          },
        }),
      }),
    };
  },

  // Função para queries customizadas
  rpc: async (functionName: string, params?: any) => {
    try {
      const response = await apiClient.post(`/rpc/${functionName}`, params);
      return { data: response.data, error: null };
    } catch (error: any) {
      return { data: null, error: error.response?.data || error };
    }
  },
};

export default supabase;
