# Diferenças entre GestaoPro Original (Supabase) e Versão PostgreSQL

## 📊 Resumo das Mudanças

| Aspecto | Original (Supabase) | Nova Versão (PostgreSQL) |
|---------|---------------------|--------------------------|
| **Banco de Dados** | Supabase (PostgreSQL hospedado) | PostgreSQL local |
| **Autenticação** | Supabase Auth | JWT + bcrypt |
| **API** | Supabase Client SDK | API REST (Express) |
| **Hospedagem** | Cloud (Supabase) | Local/Self-hosted |
| **Custo** | Pago (após limite gratuito) | Gratuito |
| **Dependências** | @supabase/supabase-js | pg, express, jsonwebtoken, bcryptjs |

## 🔄 Arquitetura

### Original (Supabase)
```
Frontend (React) 
    ↓
Supabase Client SDK
    ↓
Supabase Cloud
    ↓
PostgreSQL (hospedado)
```

### Nova Versão (PostgreSQL Local)
```
Frontend (React)
    ↓
API REST (Express)
    ↓
PostgreSQL (local)
```

## 📝 Mudanças no Código

### 1. Autenticação

**Antes (Supabase):**
```typescript
import { supabase } from '@/integrations/supabase/client';

const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});
```

**Agora (PostgreSQL):**
```typescript
import { supabase } from '@/lib/supabase';

const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});
```

> **Nota:** A interface permanece a mesma! O arquivo `src/lib/supabase.ts` é um wrapper de compatibilidade.

### 2. Consultas ao Banco

**Antes (Supabase):**
```typescript
const { data, error } = await supabase
  .from('customers')
  .select('*')
  .order('created_date', { ascending: false });
```

**Agora (PostgreSQL):**
```typescript
// Mesma sintaxe! O wrapper traduz para chamadas REST
const { data, error } = await supabase
  .from('customers')
  .select('*')
  .order('created_date', { ascending: false });
```

### 3. Inserção de Dados

**Antes (Supabase):**
```typescript
const { data, error } = await supabase
  .from('products')
  .insert({ name: 'Produto X', price: 100 })
  .select()
  .single();
```

**Agora (PostgreSQL):**
```typescript
// Mesma sintaxe!
const { data, error } = await supabase
  .from('products')
  .insert({ name: 'Produto X', price: 100 })
  .select()
  .single();
```

## 🆕 Novos Arquivos

### Backend (server/)
- `server/index.js` - API REST com Express
  - Rotas de autenticação
  - CRUD genérico para todas as tabelas
  - Middleware de autenticação JWT

### Frontend (src/lib/)
- `src/lib/api-client.ts` - Cliente HTTP com axios
- `src/lib/supabase-compat.ts` - Wrapper de compatibilidade

### Configuração
- `setup_database.sql` - Script de criação das tabelas
- `install.sh` - Script de instalação automática
- `.env` - Variáveis de ambiente (API local)

## 🗑️ Arquivos Removidos

- `src/integrations/supabase/client.ts` - Substituído pelo wrapper
- Dependência `@supabase/supabase-js` - Removida do package.json

## 🔐 Segurança

### Supabase (Original)
- Row Level Security (RLS)
- Autenticação gerenciada pelo Supabase
- Tokens JWT gerenciados automaticamente
- HTTPS obrigatório

### PostgreSQL Local (Nova Versão)
- Autenticação JWT manual
- Senhas com hash bcrypt
- Middleware de autenticação em todas as rotas
- Sessões armazenadas no banco
- **Requer configuração de HTTPS em produção**

## 📊 Tabelas do Banco

### Tabelas Mantidas (do original)
- customers
- suppliers
- employees
- products
- materials
- sales
- services
- expenses
- marketplace_orders
- production_orders
- machines_vehicles
- invoices

### Tabelas Novas
- **users** - Usuários do sistema (antes gerenciado pelo Supabase Auth)
- **sessions** - Sessões de login (antes gerenciado pelo Supabase)

## 🔧 Configuração

### Supabase (Original)
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...
```

### PostgreSQL Local (Nova Versão)
```env
VITE_API_URL=http://localhost:3001/api
DB_USER=gestaopro_user
DB_PASSWORD=gestaopro123
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gestaopro
JWT_SECRET=gestaopro-secret-key-change-in-production
```

## ⚡ Performance

### Vantagens do PostgreSQL Local
- ✅ Latência menor (sem chamadas para cloud)
- ✅ Sem limites de requisições
- ✅ Controle total sobre otimizações
- ✅ Sem custos de hospedagem

### Vantagens do Supabase
- ✅ Backup automático
- ✅ Escalabilidade automática
- ✅ Segurança gerenciada
- ✅ Sem necessidade de servidor próprio

## 🚀 Deploy

### Supabase (Original)
1. Build do frontend: `npm run build`
2. Deploy em Vercel/Netlify
3. Configurar variáveis de ambiente

### PostgreSQL Local (Nova Versão)
1. Instalar PostgreSQL no servidor
2. Executar `install.sh`
3. Build do frontend: `npm run build`
4. Configurar processo manager (PM2, systemd)
5. Configurar Nginx/Apache como proxy reverso
6. Configurar SSL/HTTPS

## 📦 Migração de Dados

Para migrar dados do Supabase para PostgreSQL local:

```bash
# 1. Exportar dados do Supabase
# No dashboard do Supabase, exportar cada tabela como CSV

# 2. Importar no PostgreSQL
psql -U gestaopro_user -d gestaopro
\copy customers FROM 'customers.csv' CSV HEADER;
\copy products FROM 'products.csv' CSV HEADER;
# ... repetir para cada tabela
```

## 🎯 Quando Usar Cada Versão?

### Use Supabase (Original) se:
- ❌ Não quer gerenciar servidor
- ❌ Precisa de backup automático
- ❌ Quer escalabilidade automática
- ❌ Prefere pagar por conveniência

### Use PostgreSQL Local se:
- ✅ Quer controle total
- ✅ Quer evitar custos recorrentes
- ✅ Tem infraestrutura própria
- ✅ Precisa de dados on-premise
- ✅ Quer maior privacidade

## 📞 Compatibilidade

A versão PostgreSQL foi projetada para ser **100% compatível** com o código original. Graças ao wrapper de compatibilidade, a maioria do código frontend **não precisa ser alterado**.

Isso significa que você pode:
- Migrar facilmente entre as versões
- Usar o mesmo código em ambientes diferentes
- Manter a mesma experiência de desenvolvimento
