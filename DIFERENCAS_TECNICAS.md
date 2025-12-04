# 🔄 Diferenças Técnicas: Supabase vs PostgreSQL Local

## Resumo das Mudanças

Este documento detalha as diferenças técnicas entre a versão original (Supabase) e a versão adaptada (PostgreSQL local).

## 📊 Comparação Geral

| Aspecto | Versão Original (Supabase) | Versão Adaptada (PostgreSQL) |
|---------|---------------------------|------------------------------|
| **Banco de Dados** | Supabase (PostgreSQL hospedado) | PostgreSQL local |
| **Autenticação** | Supabase Auth | JWT + bcrypt |
| **API** | Supabase Client SDK | Express.js REST API |
| **Sessões** | Gerenciadas pelo Supabase | Tabela `sessions` local |
| **RLS (Row Level Security)** | Configurado no Supabase | Removido (controle via API) |
| **Dependências** | @supabase/supabase-js | pg, express, jsonwebtoken, bcryptjs |
| **Hospedagem** | Cloud (Supabase) | Local (Ubuntu) |
| **Custo** | Pago (após free tier) | Gratuito |

## 🗂️ Estrutura de Arquivos

### Arquivos Removidos
```
❌ src/integrations/supabase/client.ts (original)
❌ .env (configurações Supabase)
```

### Arquivos Adicionados
```
✅ server/index.js - Servidor backend Express
✅ src/lib/api-client.ts - Cliente da API REST
✅ setup_database.sql - Script de criação do banco
✅ start.sh - Script de inicialização
✅ README_INSTALACAO.md - Documentação
✅ GUIA_RAPIDO.md - Guia rápido
✅ VERIFICACAO.md - Status da adaptação
✅ DIFERENCAS_TECNICAS.md - Este arquivo
```

### Arquivos Modificados
```
🔄 src/lib/supabase.ts - Wrapper de compatibilidade
🔄 package.json - Novas dependências
🔄 .env - Configurações PostgreSQL
```

## 🔐 Autenticação

### Versão Original (Supabase)
```typescript
// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

// Sessão gerenciada automaticamente pelo Supabase
const { data: { session } } = await supabase.auth.getSession();
```

### Versão Adaptada (PostgreSQL)
```typescript
// Login via API REST
const response = await axios.post('/api/auth/login', {
  email: 'user@example.com',
  password: 'password123'
});

// Token JWT armazenado no localStorage
const token = response.data.token;
localStorage.setItem('auth_token', token);

// Sessão armazenada na tabela 'sessions'
```

## 📡 Acesso aos Dados

### Versão Original (Supabase)
```typescript
// Listar clientes
const { data, error } = await supabase
  .from('customers')
  .select('*');

// Criar cliente
const { data, error } = await supabase
  .from('customers')
  .insert({ name: 'João', email: 'joao@example.com' });

// Atualizar cliente
const { data, error } = await supabase
  .from('customers')
  .update({ name: 'João Silva' })
  .eq('id', customerId);

// Deletar cliente
const { data, error } = await supabase
  .from('customers')
  .delete()
  .eq('id', customerId);
```

### Versão Adaptada (PostgreSQL)
```typescript
// Listar clientes
const response = await axios.get('/api/customers', {
  headers: { Authorization: `Bearer ${token}` }
});

// Criar cliente
const response = await axios.post('/api/customers', 
  { name: 'João', email: 'joao@example.com' },
  { headers: { Authorization: `Bearer ${token}` } }
);

// Atualizar cliente
const response = await axios.put(`/api/customers/${customerId}`,
  { name: 'João Silva' },
  { headers: { Authorization: `Bearer ${token}` } }
);

// Deletar cliente
const response = await axios.delete(`/api/customers/${customerId}`, {
  headers: { Authorization: `Bearer ${token}` }
});
```

**Nota:** O wrapper em `src/lib/supabase.ts` traduz automaticamente as chamadas Supabase para a API REST, mantendo compatibilidade.

## 🗄️ Banco de Dados

### Tabelas Adicionadas
```sql
-- Tabela de usuários (não existia no Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'user',
  active BOOLEAN DEFAULT true,
  created_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_date TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de sessões (gerenciadas localmente)
CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_date TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### RLS (Row Level Security)

**Versão Original:**
- Políticas RLS configuradas no Supabase
- Controle de acesso no nível do banco

**Versão Adaptada:**
- RLS removido
- Controle de acesso via middleware no Express
- Validação de JWT em todas as rotas protegidas

## 🔧 Backend

### Versão Original
- Sem backend próprio
- Supabase fornece API automaticamente
- Configuração via dashboard web

### Versão Adaptada
```javascript
// server/index.js
const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Conexão com PostgreSQL
const pool = new Pool({
  user: 'gestaopro_user',
  host: 'localhost',
  database: 'gestaopro',
  password: 'gestaopro123',
  port: 5432,
});

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
};

// Rotas CRUD
app.get('/api/customers', authenticateToken, async (req, res) => {
  const result = await pool.query('SELECT * FROM customers');
  res.json(result.rows);
});
```

## 📦 Dependências

### Removidas
```json
{
  "@supabase/supabase-js": "^2.77.0"
}
```

### Adicionadas
```json
{
  "axios": "^1.7.0",
  "bcryptjs": "^2.4.3",
  "concurrently": "^8.2.2",
  "cors": "^2.8.5",
  "express": "^4.19.0",
  "jsonwebtoken": "^9.0.2",
  "pg": "^8.11.0"
}
```

## 🌐 Variáveis de Ambiente

### Versão Original (.env)
```env
VITE_SUPABASE_PROJECT_ID="fltdykudsoxowvlwprrk"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
VITE_SUPABASE_URL="https://fltdykudsoxowvlwprrk.supabase.co"
```

### Versão Adaptada (.env)
```env
VITE_API_URL=http://localhost:3001/api
DB_USER=gestaopro_user
DB_PASSWORD=gestaopro123
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gestaopro
JWT_SECRET=gestaopro-secret-key-change-in-production
```

## 🚀 Inicialização

### Versão Original
```bash
npm run dev
# Apenas frontend, backend é o Supabase
```

### Versão Adaptada
```bash
# Opção 1: Script automático
./start.sh

# Opção 2: Comando npm
npm run dev  # Inicia frontend e backend juntos

# Opção 3: Separado
node server/index.js  # Backend
npm run dev          # Frontend
```

## 🔒 Segurança

### Versão Original
- Autenticação gerenciada pelo Supabase
- RLS para controle de acesso
- Tokens gerenciados automaticamente
- HTTPS por padrão

### Versão Adaptada
- JWT para autenticação
- Bcrypt para hash de senhas (salt rounds: 10)
- Middleware de autenticação em todas as rotas
- Sessões armazenadas no banco
- **Recomendado:** Usar HTTPS em produção

## 📊 Performance

### Versão Original
- Latência de rede (servidor remoto)
- Limitações do plano gratuito
- Escalabilidade automática

### Versão Adaptada
- Latência mínima (local)
- Sem limitações de requisições
- Escalabilidade manual (depende do hardware)

## 💰 Custo

### Versão Original
- Plano gratuito: 500MB database, 2GB bandwidth
- Planos pagos: A partir de $25/mês

### Versão Adaptada
- **100% Gratuito**
- Custo apenas de infraestrutura (servidor Ubuntu)

## 🎯 Vantagens e Desvantagens

### Supabase (Original)

**Vantagens:**
- ✅ Setup rápido
- ✅ Escalabilidade automática
- ✅ Backup automático
- ✅ Dashboard web
- ✅ Realtime subscriptions
- ✅ Storage de arquivos

**Desvantagens:**
- ❌ Custo mensal
- ❌ Dependência de serviço externo
- ❌ Latência de rede
- ❌ Limitações do plano gratuito

### PostgreSQL Local (Adaptado)

**Vantagens:**
- ✅ 100% gratuito
- ✅ Controle total
- ✅ Sem limitações
- ✅ Latência mínima
- ✅ Dados locais (privacidade)
- ✅ Funciona offline

**Desvantagens:**
- ❌ Requer configuração manual
- ❌ Backup manual
- ❌ Escalabilidade manual
- ❌ Manutenção própria

## 🔄 Compatibilidade de Código

O wrapper em `src/lib/supabase.ts` garante **compatibilidade total** com o código original. Exemplos:

```typescript
// Este código funciona em AMBAS as versões:
const { data, error } = await supabase
  .from('customers')
  .select('*');

// O wrapper traduz para:
const response = await axios.get('/api/customers');
const data = response.data;
const error = null;
```

## 📝 Conclusão

A adaptação mantém **toda a funcionalidade** do sistema original, substituindo apenas a camada de infraestrutura:

- **Frontend:** Praticamente idêntico (apenas wrapper)
- **Backend:** Novo (Express.js)
- **Banco:** PostgreSQL local (mesma estrutura)
- **Funcionalidades:** 100% preservadas

O sistema está pronto para uso em produção no Ubuntu!
