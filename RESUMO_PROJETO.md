# 📦 GestaoPro - Versão PostgreSQL Local

## 🎯 Objetivo

Clone do sistema GestaoPro original adaptado para usar **PostgreSQL local** ao invés do **Supabase**, permitindo instalação completa em servidores Ubuntu sem dependências de serviços cloud.

## ✨ Características

- ✅ **100% funcional** - Todas as funcionalidades do original mantidas
- ✅ **Compatível** - Código frontend praticamente inalterado
- ✅ **Self-hosted** - Roda completamente local
- ✅ **Gratuito** - Sem custos de hospedagem cloud
- ✅ **Privado** - Dados ficam no seu servidor
- ✅ **Fácil instalação** - Script automático incluído

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────┐
│         Frontend (React + Vite)         │
│  - React 18                             │
│  - TypeScript                           │
│  - Tailwind CSS                         │
│  - Shadcn/ui                            │
└──────────────┬──────────────────────────┘
               │ HTTP/REST
               ↓
┌─────────────────────────────────────────┐
│      Backend API (Express + Node.js)    │
│  - Autenticação JWT                     │
│  - CRUD genérico                        │
│  - Middleware de segurança              │
└──────────────┬──────────────────────────┘
               │ SQL
               ↓
┌─────────────────────────────────────────┐
│       PostgreSQL 14+ (Local)            │
│  - 14 tabelas                           │
│  - Índices otimizados                   │
│  - Relacionamentos FK                   │
└─────────────────────────────────────────┘
```

## 📋 Funcionalidades

### Gestão Completa
- 👥 **Clientes** - Cadastro e gerenciamento
- 🏭 **Fornecedores** - Controle de fornecedores
- 👷 **Funcionários** - Gestão de RH
- 📦 **Produtos** - Catálogo de produtos
- 🔧 **Materiais** - Matérias-primas
- 💰 **Vendas** - Registro de vendas
- 🛠️ **Serviços** - Ordens de serviço
- 💸 **Despesas** - Controle financeiro
- 🏪 **Marketplace** - Pedidos de marketplace
- ⚙️ **Produção** - Ordens de produção
- 🚗 **Máquinas/Veículos** - Controle de ativos
- 📄 **Notas Fiscais** - Gestão fiscal

### Recursos Adicionais
- 📊 Dashboard com métricas
- 📈 Relatórios
- 🔍 Busca e filtros
- 📱 Interface responsiva
- 🌓 Modo claro/escuro
- 🔐 Sistema de autenticação
- 👤 Gerenciamento de usuários

## 🗂️ Estrutura de Arquivos

```
gestaopro-postgres/
├── 📁 server/                  # Backend
│   └── index.js               # API REST Express
├── 📁 src/                     # Frontend
│   ├── components/            # Componentes React
│   ├── pages/                 # Páginas
│   ├── lib/                   # Bibliotecas
│   │   ├── api-client.ts     # Cliente HTTP
│   │   ├── supabase.ts       # Wrapper compatibilidade
│   │   └── supabase-compat.ts # Compatibilidade Supabase
│   └── ...
├── 📄 setup_database.sql      # Script criação tabelas
├── 📄 install.sh              # Instalação automática
├── 📄 package.json            # Dependências
├── 📄 .env                    # Configurações
├── 📄 README_INSTALACAO.md    # Guia completo
├── 📄 INICIO_RAPIDO.md        # Início rápido
├── 📄 DIFERENCAS_SUPABASE.md  # Comparação versões
└── 📄 RESUMO_PROJETO.md       # Este arquivo
```

## 🚀 Instalação Rápida

```bash
# 1. Extrair projeto
tar -xzf gestaopro-postgres.tar.gz
cd gestaopro-postgres

# 2. Executar instalação
./install.sh

# 3. Iniciar sistema
npm run dev
```

Acesse: http://localhost:5173

## 👤 Credenciais Padrão

```
Email: admin@gestaopro.com
Senha: admin123
```

## 📊 Banco de Dados

### Tabelas Principais
- `customers` - Clientes
- `suppliers` - Fornecedores
- `employees` - Funcionários
- `products` - Produtos
- `materials` - Materiais
- `sales` - Vendas
- `services` - Serviços
- `expenses` - Despesas
- `marketplace_orders` - Pedidos marketplace
- `production_orders` - Ordens produção
- `machines_vehicles` - Máquinas/veículos
- `invoices` - Notas fiscais

### Tabelas de Sistema
- `users` - Usuários do sistema
- `sessions` - Sessões de login

## 🔐 Segurança

### Implementado
- ✅ Autenticação JWT
- ✅ Hash de senhas (bcrypt)
- ✅ Middleware de autenticação
- ✅ Prepared statements (SQL injection)
- ✅ CORS configurado
- ✅ Sessões com expiração

### Recomendado para Produção
- ⚠️ Alterar JWT_SECRET
- ⚠️ Alterar senha do banco
- ⚠️ Configurar HTTPS/SSL
- ⚠️ Implementar rate limiting
- ⚠️ Configurar firewall
- ⚠️ Backup automático

## 🛠️ Tecnologias

### Frontend
- React 18.3
- TypeScript 5.8
- Vite 5.4
- Tailwind CSS 3.4
- Shadcn/ui
- React Query
- React Router
- Axios

### Backend
- Node.js 22
- Express 4.19
- PostgreSQL 14+
- JWT (jsonwebtoken)
- bcryptjs
- pg (node-postgres)

## 📦 Dependências Principais

```json
{
  "dependencies": {
    "express": "^4.19.0",
    "pg": "^8.11.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "axios": "^1.7.0",
    "cors": "^2.8.5",
    "react": "^18.3.1",
    "react-router-dom": "^6.30.1"
  }
}
```

## 🔄 Diferenças do Original

| Aspecto | Original | PostgreSQL |
|---------|----------|------------|
| Banco | Supabase Cloud | PostgreSQL Local |
| Auth | Supabase Auth | JWT + bcrypt |
| API | Supabase SDK | Express REST |
| Custo | Pago | Gratuito |
| Hospedagem | Cloud | Self-hosted |

## 📝 Comandos Úteis

```bash
# Desenvolvimento
npm run dev          # Frontend + Backend
npm run server       # Apenas backend
npm run build        # Build produção

# Banco de dados
sudo systemctl status postgresql    # Status
sudo -u postgres psql -d gestaopro  # Conectar

# Logs
tail -f server.log                  # Backend
sudo tail -f /var/log/postgresql/*  # PostgreSQL
```

## 🐛 Solução de Problemas

### Erro de conexão
```bash
sudo systemctl restart postgresql
```

### Porta em uso
```bash
sudo lsof -i :3001
sudo kill -9 <PID>
```

### Reinstalar banco
```bash
sudo -u postgres psql -c "DROP DATABASE gestaopro;"
./install.sh
```

## 📚 Documentação

- `README_INSTALACAO.md` - Guia completo de instalação
- `INICIO_RAPIDO.md` - Início rápido
- `DIFERENCAS_SUPABASE.md` - Comparação com original

## 🎯 Casos de Uso

### Ideal para:
- ✅ Pequenas e médias empresas
- ✅ Instalação on-premise
- ✅ Ambientes sem internet
- ✅ Dados sensíveis/privados
- ✅ Controle total da infraestrutura

### Não recomendado para:
- ❌ Aplicações multi-tenant cloud
- ❌ Escalabilidade automática
- ❌ Sem equipe técnica

## 🔮 Roadmap Futuro

- [ ] Docker/Docker Compose
- [ ] Backup automático
- [ ] API de relatórios avançados
- [ ] Suporte a múltiplas empresas
- [ ] App mobile
- [ ] Integração com ERPs

## 📄 Licença

Clone adaptado do GestaoPro original para uso com PostgreSQL local.

## 🤝 Contribuições

Este é um projeto de adaptação. Para melhorias:
1. Teste as mudanças
2. Documente alterações
3. Mantenha compatibilidade

## 📞 Suporte

Para problemas:
1. Verifique logs do backend
2. Verifique logs do PostgreSQL
3. Consulte documentação
4. Verifique console do navegador

## ✅ Status do Projeto

- [x] Banco de dados configurado
- [x] API REST implementada
- [x] Autenticação funcionando
- [x] Frontend adaptado
- [x] Wrapper de compatibilidade
- [x] Documentação completa
- [x] Script de instalação
- [x] Testes básicos

**Status:** ✅ Pronto para uso!

---

**Versão:** 1.0.0  
**Data:** Novembro 2025  
**Compatível com:** Ubuntu 20.04+, PostgreSQL 14+, Node.js 18+
