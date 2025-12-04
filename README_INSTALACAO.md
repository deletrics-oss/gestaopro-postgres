# GestaoPro - Versão PostgreSQL Local

Sistema de gestão empresarial completo adaptado para usar PostgreSQL local ao invés do Supabase.

## 📋 Pré-requisitos

- Ubuntu 20.04 ou superior
- Node.js 18+ e npm
- PostgreSQL 12+

## 🚀 Instalação no Ubuntu

### 1. Instalar PostgreSQL

```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Configurar Banco de Dados

```bash
# Criar banco de dados e usuário
sudo -u postgres psql -c "CREATE DATABASE gestaopro;"
sudo -u postgres psql -c "CREATE USER gestaopro_user WITH PASSWORD 'gestaopro123';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE gestaopro TO gestaopro_user;"

# Executar script de configuração das tabelas
sudo -u postgres psql -f setup_database.sql
```

### 3. Instalar Dependências do Node.js

```bash
cd gestaopro-postgres
npm install
```

### 4. Configurar Variáveis de Ambiente

O arquivo `.env` já está configurado com as credenciais padrão:

```env
VITE_API_URL=http://localhost:3001/api
DB_USER=gestaopro_user
DB_PASSWORD=gestaopro123
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gestaopro
JWT_SECRET=gestaopro-secret-key-change-in-production
```

**IMPORTANTE:** Altere a senha do banco e o JWT_SECRET em produção!

### 5. Iniciar o Sistema

```bash
# Opção 1: Iniciar frontend e backend juntos
npm run dev

# Opção 2: Iniciar separadamente
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run dev
```

O sistema estará disponível em:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001/api

## 👤 Credenciais Padrão

- **Email:** admin@gestaopro.com
- **Senha:** admin123

## 📁 Estrutura do Projeto

```
gestaopro-postgres/
├── server/              # Backend Express + PostgreSQL
│   └── index.js        # API REST
├── src/                # Frontend React
│   ├── components/     # Componentes React
│   ├── pages/          # Páginas da aplicação
│   ├── lib/            # Bibliotecas e utilitários
│   │   ├── api-client.ts    # Cliente da API REST
│   │   └── supabase.ts      # Wrapper de compatibilidade
│   └── ...
├── setup_database.sql  # Script de criação das tabelas
├── .env               # Variáveis de ambiente
└── package.json       # Dependências do projeto
```

## 🔧 Principais Mudanças do Supabase para PostgreSQL

### 1. Autenticação
- **Antes:** Supabase Auth
- **Agora:** JWT com bcrypt para hash de senhas

### 2. Banco de Dados
- **Antes:** Supabase (PostgreSQL hospedado)
- **Agora:** PostgreSQL local

### 3. API
- **Antes:** Supabase Client SDK
- **Agora:** API REST com Express

### 4. Sessões
- **Antes:** Gerenciadas pelo Supabase
- **Agora:** Tabela `sessions` no PostgreSQL

## 📊 Tabelas do Banco de Dados

O sistema possui as seguintes tabelas:

- `customers` - Clientes
- `suppliers` - Fornecedores
- `employees` - Funcionários
- `products` - Produtos
- `materials` - Matérias-primas
- `sales` - Vendas
- `services` - Serviços
- `expenses` - Despesas
- `marketplace_orders` - Pedidos de marketplace
- `production_orders` - Ordens de produção
- `machines_vehicles` - Máquinas e veículos
- `invoices` - Notas fiscais
- `users` - Usuários do sistema
- `sessions` - Sessões de login

## 🔐 Segurança

### Alterar Senha do Banco de Dados

```bash
sudo -u postgres psql
ALTER USER gestaopro_user WITH PASSWORD 'nova_senha_segura';
\q
```

Depois atualize o arquivo `.env`:
```env
DB_PASSWORD=nova_senha_segura
```

### Alterar JWT Secret

Edite o arquivo `.env`:
```env
JWT_SECRET=sua-chave-secreta-muito-segura-aqui
```

## 🛠️ Comandos Úteis

### Verificar Status do PostgreSQL
```bash
sudo systemctl status postgresql
```

### Acessar o Banco de Dados
```bash
sudo -u postgres psql -d gestaopro
```

### Ver Logs do Backend
```bash
npm run server
```

### Build para Produção
```bash
npm run build
```

## 🐛 Solução de Problemas

### Erro de Conexão com o Banco
1. Verifique se o PostgreSQL está rodando:
   ```bash
   sudo systemctl status postgresql
   ```

2. Teste a conexão:
   ```bash
   psql -U gestaopro_user -d gestaopro -h localhost
   ```

### Porta 3001 já em uso
```bash
# Encontrar processo usando a porta
sudo lsof -i :3001

# Matar o processo
sudo kill -9 <PID>
```

### Erro de Permissão no PostgreSQL
```bash
sudo -u postgres psql -d gestaopro
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO gestaopro_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO gestaopro_user;
```

## 📝 Diferenças de Código

O código do frontend foi mantido praticamente idêntico ao original. A principal mudança é que o arquivo `src/lib/supabase.ts` agora é um **wrapper de compatibilidade** que traduz as chamadas do Supabase para a API REST local.

Isso significa que o código existente continua funcionando sem grandes modificações!

## 🔄 Migração de Dados

Se você tem dados no Supabase e quer migrar para o PostgreSQL local:

1. Exporte os dados do Supabase (CSV ou SQL)
2. Importe para o PostgreSQL local usando:
   ```bash
   psql -U gestaopro_user -d gestaopro -f dados_exportados.sql
   ```

## 📞 Suporte

Para problemas ou dúvidas, verifique:
- Logs do backend (terminal onde rodou `npm run server`)
- Console do navegador (F12)
- Logs do PostgreSQL: `/var/log/postgresql/`

## 📄 Licença

Este é um clone adaptado do sistema GestaoPro original, modificado para usar PostgreSQL local.
