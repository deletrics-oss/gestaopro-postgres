# 🚀 Guia Rápido de Implantação na VPS Linux

## ⚡ Início Rápido (5 Passos Principais)

### Passo 1: Conectar à VPS via SSH
```bash
ssh seu_usuario@IP_DA_VPS
```

### Passo 2: Transferir Projeto
**Do Windows (PowerShell):**
```powershell
cd C:\Users\Suporte\Documents\GitHub\gestaoproBANCODEDADOS
scp -r gestaopro-postgres seu_usuario@IP_DA_VPS:~/
```

**Ou use WinSCP/FileZilla para transferir a pasta completa**

### Passo 3: Executar Instalação Automática
```bash
cd ~/gestaopro-postgres
chmod +x install.sh
./install.sh
```

### Passo 4: Build e Iniciar
```bash
# Build do frontend
npm run build

# Instalar PM2
sudo npm install -g pm2

# Criar diretório de logs
mkdir -p logs

# Iniciar aplicação
pm2 start ecosystem.config.cjs

# Configurar auto-start
pm2 save
pm2 startup
# IMPORTANTE: COPIE E EXECUTE o comando que aparecer
```

### Passo 5: Configurar Firewall
```bash
sudo ufw allow 22/tcp
sudo ufw allow 9099/tcp
sudo ufw enable
```

## ✅ Verificação Rápida

```bash
# 1. Verificar PostgreSQL
sudo systemctl status postgresql

# 2. Verificar PM2
pm2 status

# 3. Testar API
curl http://localhost:9099/api/health

# 4. Ver logs
pm2 logs gestaopro --lines 20

# 5. Descobrir IP público
curl ifconfig.me
```

## 🌐 Acessar Sistema

**URL:** `http://SEU_IP:9099`

**Credenciais Padrão:**
- Email: `admin@gestaopro.com`
- Senha: `admin123`

⚠️ **ALTERE A SENHA IMEDIATAMENTE APÓS LOGIN!**

---

## 🔧 Comandos Úteis Diários

### Gerenciamento da Aplicação
```bash
pm2 status                    # Ver status
pm2 logs gestaopro            # Ver logs em tempo real
pm2 restart gestaopro         # Reiniciar
pm2 stop gestaopro            # Parar
pm2 start gestaopro           # Iniciar
pm2 monit                     # Monitorar recursos
pm2 flush                     # Limpar logs
```

### Gerenciamento do Banco de Dados
```bash
# Conectar ao banco
sudo -u postgres psql -d gestaopro

# Backup manual
pg_dump -U gestaopro_user -h localhost gestaopro | gzip > backup_$(date +%Y%m%d).sql.gz

# Ver tamanho do banco
sudo -u postgres psql -d gestaopro -c "SELECT pg_size_pretty(pg_database_size('gestaopro'));"

# Listar tabelas
sudo -u postgres psql -d gestaopro -c "\dt"
```

### Logs e Diagnóstico
```bash
# Ver últimas 50 linhas de logs
pm2 logs gestaopro --lines 50

# Ver apenas erros
pm2 logs gestaopro --err

# Logs do PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-*-main.log

# Verificar porta em uso
sudo lsof -i :9099

# Uso de recursos
htop
free -h
df -h
```

---

## 🛡️ Segurança Pós-Instalação (IMPORTANTE!)

### 1. Alterar Senha do Admin

1. Acessar sistema via navegador: `http://IP_DA_VPS:9099`
2. Fazer login com credenciais padrão
3. Ir em **Configurações** > **Usuários**
4. Localizar usuário admin
5. Alterar senha para algo forte

### 2. Alterar Senha do Banco de Dados

```bash
# Conectar ao PostgreSQL
sudo -u postgres psql

# Alterar senha (substitua SENHA_FORTE por senha segura)
ALTER USER gestaopro_user WITH PASSWORD 'SENHA_FORTE_AQUI';
\q

# Atualizar senha no código
nano ~/gestaopro-postgres/server/index.js
# Encontrar linha ~21: password: 'gestaopro123',
# Alterar para: password: 'SENHA_FORTE_AQUI',

# Reiniciar aplicação
pm2 restart gestaopro
```

### 3. Alterar JWT Secret

```bash
# Gerar novo secret seguro
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Copiar a string gerada e atualizar no código
nano ~/gestaopro-postgres/server/index.js
# Encontrar linha ~34: const JWT_SECRET = 'gestaopro-secret-key-change-in-production';
# Substituir pela string gerada

# Reiniciar aplicação
pm2 restart gestaopro
```

### 4. Configurar Backup Automático

```bash
# Criar script de backup
nano ~/backup-gestaopro.sh
```

Cole este conteúdo:
```bash
#!/bin/bash
BACKUP_DIR="$HOME/backups"
mkdir -p $BACKUP_DIR
export PGPASSWORD='gestaopro123'
pg_dump -U gestaopro_user -h localhost gestaopro | gzip > $BACKUP_DIR/gestaopro_$(date +%Y%m%d_%H%M%S).sql.gz
find $BACKUP_DIR -name "gestaopro_*.sql.gz" -mtime +7 -delete
echo "$(date): Backup concluído" >> $BACKUP_DIR/backup.log
```

Tornar executável e agendar:
```bash
chmod +x ~/backup-gestaopro.sh

# Testar script
~/backup-gestaopro.sh

# Verificar backup
ls -lh ~/backups/

# Agendar backup diário às 2h da manhã
crontab -e
# Adicionar esta linha:
0 2 * * * $HOME/backup-gestaopro.sh
```

---

## 🚨 Solução de Problemas Comuns

### ❌ Aplicação não inicia (PM2 mostra "errored")
```bash
# Ver erros
pm2 logs gestaopro --err --lines 50

# Verificar se porta está em uso
sudo lsof -i :9099

# Se estiver em uso, matar processo
sudo kill -9 PID

# Reiniciar do zero
pm2 delete gestaopro
cd ~/gestaopro-postgres
pm2 start ecosystem.config.cjs
```

### ❌ Erro de conexão com banco de dados
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Se não estiver, iniciar
sudo systemctl start postgresql

# Testar conexão manualmente
psql -U gestaopro_user -h localhost -d gestaopro
# Se pedir senha: gestaopro123

# Se falhar, resetar senha
sudo -u postgres psql
ALTER USER gestaopro_user WITH PASSWORD 'gestaopro123';
\q

# Reiniciar aplicação
pm2 restart gestaopro
```

### ❌ Página não carrega (404 ou tela branca)
```bash
# Verificar se build existe
ls -la ~/gestaopro-postgres/dist/

# Se não existir, fazer build
cd ~/gestaopro-postgres
npm run build

# Verificar logs
pm2 logs gestaopro --lines 30

# Reiniciar aplicação
pm2 restart gestaopro
```

### ❌ Erro "Cannot find module"
```bash
# Reinstalar dependências
cd ~/gestaopro-postgres
rm -rf node_modules package-lock.json
npm install

# Rebuild frontend
npm run build

# Reiniciar
pm2 restart gestaopro
```

### ❌ Sistema não acessível externamente (porta bloqueada)
```bash
# Verificar firewall
sudo ufw status

# Se porta 9099 não estiver liberada
sudo ufw allow 9099/tcp
sudo ufw reload

# Verificar se aplicação está rodando
pm2 status
curl http://localhost:9099/api/health

# Descobrir IP público
curl ifconfig.me
```

### ❌ Aplicação fica reiniciando constantemente
```bash
# Ver logs de erro
pm2 logs gestaopro --err

# Verificar memória
free -h

# Se pouca memória, criar swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Aumentar limite de memória
nano ~/gestaopro-postgres/ecosystem.config.cjs
# Alterar: max_memory_restart: '2G'

# Reiniciar
pm2 delete gestaopro
pm2 start ecosystem.config.cjs
pm2 save
```

---

## 📋 Checklist de Instalação Completa

### Pré-Instalação
- [ ] VPS Linux Ubuntu 20.04+ disponível
- [ ] Acesso SSH funcionando
- [ ] Projeto transferido para VPS

### Instalação
- [ ] PostgreSQL instalado e rodando
- [ ] Banco de dados `gestaopro` criado
- [ ] 14 tabelas criadas no banco
- [ ] Usuário admin criado no banco
- [ ] Node.js 18+ instalado
- [ ] Dependências instaladas (`npm install`)
- [ ] Frontend compilado (`npm run build`)
- [ ] Pasta `dist/` criada com arquivos

### PM2 e Execução
- [ ] PM2 instalado globalmente
- [ ] Aplicação iniciada com PM2
- [ ] Status "online" no `pm2 status`
- [ ] Auto-start configurado (`pm2 startup` executado)
- [ ] Processos salvos (`pm2 save`)

### Rede e Acesso
- [ ] Firewall configurado (UFW)
- [ ] Porta 9099 liberada
- [ ] API responde: `curl http://localhost:9099/api/health`
- [ ] Sistema acessível via IP:9099
- [ ] Login funciona no navegador

### Segurança
- [ ] Senha do admin alterada
- [ ] Senha do banco alterada
- [ ] JWT_SECRET alterado
- [ ] Backup automático configurado
- [ ] Teste de backup realizado

### Verificação Final
- [ ] Sistema sobrevive a `pm2 restart gestaopro`
- [ ] Sistema sobrevive a `sudo reboot` (reinicializa automaticamente)
- [ ] Todas as páginas carregam corretamente
- [ ] CRUD de clientes funciona
- [ ] CRUD de produtos funciona

---

## 📞 Comandos de Verificação Rápida

Execute este bloco para verificar tudo de uma vez:

```bash
echo "=== VERIFICAÇÃO DO SISTEMA GESTAOPRO ==="
echo ""
echo "1. PostgreSQL:"
sudo systemctl status postgresql | grep Active
echo ""
echo "2. Banco de dados:"
sudo -u postgres psql -lqt | grep gestaopro
echo ""
echo "3. Tabelas (deve ser 14):"
sudo -u postgres psql -d gestaopro -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"
echo ""
echo "4. Node.js:"
node --version
echo ""
echo "5. PM2:"
pm2 --version
echo ""
echo "6. Aplicação:"
pm2 status | grep gestaopro
echo ""
echo "7. API Health:"
curl -s http://localhost:9099/api/health
echo ""
echo "8. IP Público:"
curl -s ifconfig.me
echo ""
echo "=== FIM DA VERIFICAÇÃO ==="
```

---

## 🎯 Acesso Rápido aos Arquivos Importantes

```bash
# Código do servidor backend
nano ~/gestaopro-postgres/server/index.js

# Configuração do PM2
nano ~/gestaopro-postgres/ecosystem.config.cjs

# Script de setup do banco
nano ~/gestaopro-postgres/setup_database.sql

# Logs da aplicação
tail -f ~/gestaopro-postgres/logs/error.log
tail -f ~/gestaopro-postgres/logs/out.log

# Ver todas as variáveis de ambiente
cat ~/gestaopro-postgres/.env
```

---

## 📚 Documentação Adicional

- **Plano Completo:** `PLANO_IMPLANTACAO_COMPLETO.md`
- **Instalação Servidor:** `INSTALACAO_SERVIDOR.md`
- **Implantação Permanente:** `IMPLANTACAO_PERMANENTE.md`
- **Diferenças Técnicas:** `DIFERENCAS_TECNICAS.md`
- **Resumo do Projeto:** `RESUMO_PROJETO.md`

---

## ✅ Sistema Funcionando Corretamente Quando:

1. ✅ `pm2 status` mostra **gestaopro** com status **online**
2. ✅ `curl http://localhost:9099/api/health` retorna `{"status":"ok",...}`
3. ✅ Navegador acessa `http://IP_DA_VPS:9099` e mostra tela de login
4. ✅ Login funciona com credenciais
5. ✅ Dashboard carrega com dados
6. ✅ Após `sudo reboot`, sistema volta online automaticamente

---

**Versão do Guia:** 1.0.0  
**Data:** 2025-11-28  
**Compatível com:** Ubuntu 20.04+, PostgreSQL 14+, Node.js 18+
