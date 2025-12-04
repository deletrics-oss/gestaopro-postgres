# 🚀 DEPLOY DO GESTAOPRO NA VPS LINUX

## 📦 O QUE FOI PREPARADO

Este projeto está **100% pronto** para ser implantado na sua VPS Linux. Todos os scripts e documentação necessários foram criados.

---

## ⚡ INSTALAÇÃO RÁPIDA (3 Passos)

### **Passo 1: Transferir para VPS**

**Do Windows (PowerShell):**
```powershell
cd C:\Users\Suporte\Documents\GitHub\gestaoproBANCODEDADOS
scp -r gestaopro-postgres usuario@IP_VPS:~/
```

**Ou use WinSCP/FileZilla** e transfira a pasta `gestaopro-postgres` inteira.

---

### **Passo 2: Instalar (Na VPS via SSH)**

```bash
# Conectar na VPS
ssh usuario@IP_VPS

# Entrar na pasta
cd ~/gestaopro-postgres

# Tornar scripts executáveis
chmod +x install.sh start-production.sh verificar-sistema.sh

# Executar instalação (instala PostgreSQL, Node.js, cria banco)
./install.sh

# Build do frontend
npm run build

# Iniciar em produção (instala PM2 e configura tudo)
./start-production.sh
```

---

### **Passo 3: Configurar Firewall**

```bash
sudo ufw allow 22/tcp
sudo ufw allow 9099/tcp
sudo ufw enable
```

---

## ✅ PRONTO!

Acesse no navegador:
```
http://SEU_IP:9099
```

**Credenciais:**
- Email: `admin@gestaopro.com`
- Senha: `admin123`

⚠️ **ALTERE A SENHA IMEDIATAMENTE!**

---

## 📁 ARQUIVOS CRIADOS PARA VOCÊ

### **Scripts de Instalação**
- ✅ `install.sh` - Instala PostgreSQL, Node.js, cria banco de dados
- ✅ `start-production.sh` - Inicia aplicação com PM2 em produção
- ✅ `verificar-sistema.sh` - Verifica se tudo está funcionando

### **Documentação Completa**
- ✅ `GUIA_RAPIDO_VPS.md` - Guia rápido de 1 página
- ✅ `CHECKLIST_INSTALACAO.md` - Checklist passo a passo para preencher
- ✅ `INSTALACAO_SERVIDOR.md` - Guia detalhado completo
- ✅ `IMPLANTACAO_PERMANENTE.md` - Configuração permanente e monitoramento

### **Arquivos de Configuração**
- ✅ `ecosystem.config.cjs` - Configuração do PM2 (já otimizada)
- ✅ `setup_database.sql` - Script de criação do banco de dados
- ✅ `server/index.js` - Backend Express (já configurado)

---

## 🔍 VERIFICAR SE ESTÁ TUDO FUNCIONANDO

Após a instalação, execute:

```bash
cd ~/gestaopro-postgres
bash verificar-sistema.sh
```

Isso vai checar:
- ✅ PostgreSQL rodando
- ✅ Banco de dados criado com 14 tabelas
- ✅ Node.js e PM2 instalados
- ✅ Aplicação online
- ✅ API respondendo
- ✅ Firewall configurado
- ✅ Auto-start ativo

---

## 🛠️ COMANDOS ÚTEIS

### Gerenciar Aplicação
```bash
pm2 status                 # Ver status
pm2 logs gestaopro         # Ver logs em tempo real
pm2 restart gestaopro      # Reiniciar
pm2 stop gestaopro         # Parar
pm2 monit                  # Monitorar recursos
```

### Gerenciar Banco de Dados
```bash
# Conectar ao banco
sudo -u postgres psql -d gestaopro

# Backup manual
pg_dump -U gestaopro_user -h localhost gestaopro | gzip > backup_$(date +%Y%m%d).sql.gz

# Ver tamanho do banco
sudo -u postgres psql -d gestaopro -c "SELECT pg_size_pretty(pg_database_size('gestaopro'));"
```

### Ver Logs
```bash
pm2 logs gestaopro --lines 50         # Últimas 50 linhas
pm2 logs gestaopro --err              # Apenas erros
tail -f ~/gestaopro-postgres/logs/error.log
```

---

## 🛡️ SEGURANÇA PÓS-INSTALAÇÃO

### 1. Alterar Senha do Admin
1. Acessar sistema no navegador
2. Login com credenciais padrão
3. Ir em **Configurações > Usuários**
4. Alterar senha do admin

### 2. Alterar Senha do Banco de Dados
```bash
# Gerar senha forte
openssl rand -base64 32

# Alterar no PostgreSQL
sudo -u postgres psql
ALTER USER gestaopro_user WITH PASSWORD 'SUA_SENHA_FORTE_AQUI';
\q

# Atualizar no código
nano ~/gestaopro-postgres/server/index.js
# Linha ~21: password: 'gestaopro123' → password: 'SUA_SENHA_FORTE_AQUI'

# Reiniciar
pm2 restart gestaopro
```

### 3. Alterar JWT Secret
```bash
# Gerar secret seguro
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Atualizar no código
nano ~/gestaopro-postgres/server/index.js
# Linha ~34: const JWT_SECRET = 'gestaopro-secret...' → const JWT_SECRET = 'SEU_SECRET_AQUI'

# Reiniciar
pm2 restart gestaopro
```

### 4. Configurar Backup Automático
```bash
# Criar script
nano ~/backup-gestaopro.sh
```

Cole:
```bash
#!/bin/bash
BACKUP_DIR="$HOME/backups"
mkdir -p $BACKUP_DIR
export PGPASSWORD='gestaopro123'
pg_dump -U gestaopro_user -h localhost gestaopro | gzip > $BACKUP_DIR/gestaopro_$(date +%Y%m%d_%H%M%S).sql.gz
find $BACKUP_DIR -name "gestaopro_*.sql.gz" -mtime +7 -delete
echo "$(date): Backup concluído" >> $BACKUP_DIR/backup.log
```

Ativar:
```bash
chmod +x ~/backup-gestaopro.sh
crontab -e
# Adicionar: 0 2 * * * $HOME/backup-gestaopro.sh
```

---

## 🚨 SOLUÇÃO DE PROBLEMAS

### Aplicação não inicia
```bash
pm2 logs gestaopro --err --lines 50
pm2 delete gestaopro
pm2 start ~/gestaopro-postgres/ecosystem.config.cjs
```

### Erro de conexão com banco
```bash
sudo systemctl status postgresql
sudo systemctl restart postgresql
psql -U gestaopro_user -h localhost -d gestaopro
```

### Página não carrega
```bash
cd ~/gestaopro-postgres
npm run build
pm2 restart gestaopro
```

### Sistema não acessível externamente
```bash
sudo ufw status
sudo ufw allow 9099/tcp
curl ifconfig.me  # Ver seu IP público
```

---

## 📋 CHECKLIST COMPLETO

Use o arquivo `CHECKLIST_INSTALACAO.md` para acompanhar passo a passo toda a instalação.

---

## 📚 DOCUMENTAÇÃO COMPLETA

- **GUIA_RAPIDO_VPS.md** - Referência rápida de 1 página
- **CHECKLIST_INSTALACAO.md** - Checklist interativo
- **INSTALACAO_SERVIDOR.md** - Guia passo a passo detalhado
- **IMPLANTACAO_PERMANENTE.md** - Configuração permanente
- **RESUMO_PROJETO.md** - Visão geral do sistema
- **DIFERENCAS_TECNICAS.md** - Diferenças Supabase vs PostgreSQL

---

## 🎯 RESUMO DA ARQUITETURA

```
┌─────────────────────────────────────┐
│     Navegador (Cliente)             │
└──────────────┬──────────────────────┘
               │ HTTP
               ↓
┌─────────────────────────────────────┐
│   VPS Linux - Porta 9099            │
│   ┌─────────────────────────────┐   │
│   │  PM2 (Process Manager)      │   │
│   │  ├─ Auto-restart            │   │
│   │  └─ Logs                    │   │
│   └──────────┬──────────────────┘   │
│              ↓                       │
│   ┌─────────────────────────────┐   │
│   │  Express.js Backend         │   │
│   │  ├─ API REST (/api/*)       │   │
│   │  └─ Serve Frontend (dist/)  │   │
│   └──────────┬──────────────────┘   │
│              ↓                       │
│   ┌─────────────────────────────┐   │
│   │  PostgreSQL (localhost)     │   │
│   │  └─ 14 tabelas              │   │
│   └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

## ✅ SISTEMA INCLUI

### Módulos Completos
- 👥 **Clientes** - Cadastro e gestão
- 🏭 **Fornecedores** - Controle
- 👷 **Funcionários** - RH
- 📦 **Produtos** - Catálogo
- 🔧 **Materiais** - Matéria-prima
- 💰 **Vendas** - PDV
- 🛠️ **Serviços** - Ordens de serviço
- 💸 **Despesas** - Financeiro
- 🏪 **Marketplace** - Pedidos online
- ⚙️ **Produção** - Ordens de produção
- 🚗 **Máquinas/Veículos** - Ativos
- 📄 **Notas Fiscais** - Gestão fiscal

### Recursos
- 📊 Dashboard com métricas
- 📈 Relatórios
- 🔍 Busca e filtros
- 📱 Responsivo
- 🌓 Tema claro/escuro
- 🔐 Autenticação JWT
- 👤 Multi-usuário

---

## 💡 PRÓXIMOS PASSOS OPCIONAIS

### Melhorias Recomendadas

1. **Domínio Próprio**
   - Registrar domínio
   - Apontar DNS para IP da VPS
   - Instalar Nginx como proxy
   - Configurar SSL com Let's Encrypt

2. **Monitoramento Avançado**
   - PM2 Plus (monitor online)
   - Alertas por email
   - Logs centralizados

3. **Performance**
   - Redis para cache
   - CDN para assets
   - Múltiplas instâncias PM2

---

## 📞 SUPORTE

**Em caso de dúvidas:**

1. Consulte a documentação (arquivos .md)
2. Execute `bash verificar-sistema.sh`
3. Veja os logs: `pm2 logs gestaopro`

**Informações do Sistema:**
- Porta: 9099
- Banco: PostgreSQL local (porta 5432)
- Gerenciador: PM2
- Ambiente: Node.js 18+

---

## ✨ CONCLUSÃO

Você tem em mãos um **sistema completo de gestão empresarial** pronto para deploy!

**Basta seguir os 3 passos acima e seu sistema estará rodando em produção! 🚀**

---

**Versão:** 1.0.0  
**Data:** 2025-11-28  
**Compatível:** Ubuntu 20.04+, PostgreSQL 14+, Node.js 18+
