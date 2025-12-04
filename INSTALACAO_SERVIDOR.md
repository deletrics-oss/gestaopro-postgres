# 📦 Instalação do GestaoPro no Seu Servidor Ubuntu

## 🎯 Guia Completo de Instalação - Porta 9099

Este guia irá instalar o sistema GestaoPro PostgreSQL no seu servidor Ubuntu, rodando na **porta 9099**.

---

## 📋 Pré-requisitos

- Ubuntu 20.04 ou superior
- Acesso root ou sudo
- Conexão com internet
- Pelo menos 2GB de RAM
- 5GB de espaço em disco

---

## 🚀 Instalação Rápida (Recomendado)

### 1. Fazer Upload do Arquivo

Faça upload do arquivo `gestaopro-postgres.zip` para o seu servidor:

```bash
# Opção 1: Via SCP (do seu computador)
scp gestaopro-postgres.zip usuario@seu-servidor:/home/usuario/

# Opção 2: Via wget (se tiver URL)
wget URL_DO_ARQUIVO -O gestaopro-postgres.zip
```

### 2. Extrair o Arquivo

```bash
cd ~
unzip gestaopro-postgres.zip
cd gestaopro-postgres
```

### 3. Executar Script de Instalação

```bash
chmod +x install.sh
./install.sh
```

O script irá:
- ✅ Instalar PostgreSQL
- ✅ Criar banco de dados
- ✅ Instalar Node.js (se necessário)
- ✅ Instalar dependências
- ✅ Configurar tudo automaticamente

### 4. Iniciar o Sistema

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar aplicação
pm2 start ecosystem.config.cjs

# Salvar configuração
pm2 save

# Configurar para iniciar no boot
pm2 startup
# Execute o comando que o PM2 mostrar
```

### 5. Acessar o Sistema

Abra no navegador:
```
http://SEU_IP:9099
```

**Credenciais:**
- Email: admin@gestaopro.com
- Senha: admin123

---

## 📝 Instalação Manual Passo a Passo

### Passo 1: Atualizar Sistema

```bash
sudo apt update
sudo apt upgrade -y
```

### Passo 2: Instalar PostgreSQL

```bash
# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Iniciar serviço
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verificar status
sudo systemctl status postgresql
```

### Passo 3: Configurar Banco de Dados

```bash
# Criar banco de dados
sudo -u postgres psql -c "CREATE DATABASE gestaopro;"

# Criar usuário
sudo -u postgres psql -c "CREATE USER gestaopro_user WITH PASSWORD 'gestaopro123';"

# Dar permissões
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE gestaopro TO gestaopro_user;"

# Executar script de criação das tabelas
sudo cp setup_database.sql /tmp/
sudo -u postgres psql -f /tmp/setup_database.sql
```

### Passo 4: Instalar Node.js

```bash
# Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalação
node --version
npm --version
```

### Passo 5: Instalar Dependências do Projeto

```bash
cd ~/gestaopro-postgres
npm install
```

### Passo 6: Fazer Build do Frontend

```bash
npm run build
```

### Passo 7: Instalar PM2

```bash
sudo npm install -g pm2
```

### Passo 8: Iniciar Aplicação

```bash
# Iniciar com PM2
pm2 start ecosystem.config.cjs

# Verificar status
pm2 status

# Ver logs
pm2 logs gestaopro
```

### Passo 9: Configurar Auto-start

```bash
# Salvar configuração atual
pm2 save

# Configurar para iniciar no boot
pm2 startup

# Execute o comando que aparecer (exemplo):
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u usuario --hp /home/usuario
```

### Passo 10: Configurar Firewall

```bash
# Permitir porta 9099
sudo ufw allow 9099/tcp

# Permitir SSH (se ainda não estiver)
sudo ufw allow 22/tcp

# Habilitar firewall
sudo ufw enable

# Verificar status
sudo ufw status
```

---

## 🌐 Acessar o Sistema

### URL Local (no servidor)
```
http://localhost:9099
```

### URL Externa (de outro computador)
```
http://SEU_IP_PUBLICO:9099
```

Para descobrir seu IP público:
```bash
curl ifconfig.me
```

---

## 🔐 Configurações de Segurança

### 1. Alterar Senha do Banco de Dados

```bash
# Conectar ao PostgreSQL
sudo -u postgres psql

# Alterar senha
ALTER USER gestaopro_user WITH PASSWORD 'SUA_NOVA_SENHA_FORTE';
\q
```

Depois, edite o arquivo `server/index.js` e atualize a senha na configuração do pool.

### 2. Alterar JWT Secret

Edite o arquivo `server/index.js`:

```javascript
// Linha ~48
const JWT_SECRET = 'SUA_CHAVE_SECRETA_MUITO_FORTE_AQUI';
```

### 3. Alterar Senha do Admin

Após fazer login, vá em Configurações > Usuários e altere a senha do admin.

---

## 🛠️ Comandos de Gerenciamento

### PM2

```bash
# Ver status
pm2 status

# Ver logs em tempo real
pm2 logs gestaopro

# Reiniciar
pm2 restart gestaopro

# Parar
pm2 stop gestaopro

# Iniciar
pm2 start gestaopro

# Monitorar
pm2 monit

# Informações detalhadas
pm2 show gestaopro
```

### PostgreSQL

```bash
# Status do serviço
sudo systemctl status postgresql

# Reiniciar
sudo systemctl restart postgresql

# Conectar ao banco
sudo -u postgres psql -d gestaopro

# Backup
pg_dump -U gestaopro_user gestaopro > backup.sql

# Restaurar
psql -U gestaopro_user gestaopro < backup.sql
```

### Sistema

```bash
# Ver processos na porta 9099
sudo lsof -i :9099

# Ver uso de recursos
htop

# Ver logs do sistema
journalctl -xe
```

---

## 📊 Verificar Instalação

### 1. Testar API

```bash
curl http://localhost:9099/api/health
```

Resposta esperada:
```json
{"status":"ok","message":"GestaoPro API está funcionando"}
```

### 2. Testar Frontend

```bash
curl http://localhost:9099/ | head -20
```

Deve retornar HTML da página.

### 3. Testar Login

```bash
curl -X POST http://localhost:9099/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gestaopro.com","password":"admin123"}'
```

Deve retornar token JWT.

---

## 🔄 Atualizar o Sistema

### 1. Parar Aplicação

```bash
pm2 stop gestaopro
```

### 2. Fazer Backup

```bash
# Backup do banco
pg_dump -U gestaopro_user gestaopro > backup_$(date +%Y%m%d).sql

# Backup dos arquivos
cd ~
tar -czf gestaopro-backup-$(date +%Y%m%d).tar.gz gestaopro-postgres/
```

### 3. Atualizar Código

```bash
cd ~/gestaopro-postgres
# Fazer suas alterações
```

### 4. Rebuild (se alterou frontend)

```bash
npm run build
```

### 5. Reiniciar

```bash
pm2 restart gestaopro
```

---

## 🐛 Solução de Problemas

### Erro: Porta 9099 já em uso

```bash
# Encontrar processo
sudo lsof -i :9099

# Matar processo
sudo kill -9 PID

# Ou parar PM2
pm2 stop gestaopro
```

### Erro: Não consegue conectar ao banco

```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Reiniciar PostgreSQL
sudo systemctl restart postgresql

# Testar conexão
psql -U gestaopro_user -d gestaopro -h localhost
```

### Erro: Página não carrega

```bash
# Verificar logs
pm2 logs gestaopro

# Verificar se build foi feito
ls -la dist/

# Refazer build
npm run build
pm2 restart gestaopro
```

### Erro: "Cannot find module"

```bash
# Reinstalar dependências
cd ~/gestaopro-postgres
rm -rf node_modules
npm install
pm2 restart gestaopro
```

---

## 🌐 Configurar Domínio (Opcional)

### Com Nginx como Proxy Reverso

#### 1. Instalar Nginx

```bash
sudo apt install -y nginx
```

#### 2. Criar Configuração

```bash
sudo nano /etc/nginx/sites-available/gestaopro
```

Conteúdo:
```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:9099;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### 3. Ativar Configuração

```bash
sudo ln -s /etc/nginx/sites-available/gestaopro /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 4. Configurar SSL (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com
```

---

## 💾 Backup Automático

### Criar Script de Backup

```bash
nano ~/backup-gestaopro.sh
```

Conteúdo:
```bash
#!/bin/bash
BACKUP_DIR="/home/usuario/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup do banco
pg_dump -U gestaopro_user gestaopro | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Manter apenas últimos 7 dias
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete

echo "Backup concluído: $DATE"
```

Tornar executável:
```bash
chmod +x ~/backup-gestaopro.sh
```

### Agendar com Cron

```bash
crontab -e
```

Adicionar linha (backup diário às 2h):
```
0 2 * * * /home/usuario/backup-gestaopro.sh >> /home/usuario/backup.log 2>&1
```

---

## 📊 Monitoramento

### Logs em Tempo Real

```bash
# Logs da aplicação
pm2 logs gestaopro --lines 100

# Logs do PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-*-main.log

# Logs do Nginx (se usar)
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Uso de Recursos

```bash
# CPU e Memória
pm2 monit

# Disco
df -h

# Conexões de rede
sudo netstat -tulpn | grep 9099
```

---

## ✅ Checklist Pós-Instalação

- [ ] Sistema acessível em http://SEU_IP:9099
- [ ] Login funcionando
- [ ] Senha do admin alterada
- [ ] Senha do banco alterada
- [ ] JWT_SECRET alterado
- [ ] Firewall configurado
- [ ] PM2 configurado para auto-start
- [ ] Backup automático configurado
- [ ] Domínio configurado (opcional)
- [ ] SSL configurado (opcional)

---

## 📞 Informações Técnicas

### Portas Utilizadas
- **9099** - Aplicação (frontend + backend)
- **5432** - PostgreSQL (apenas localhost)

### Arquivos Importantes
- `/home/usuario/gestaopro-postgres/` - Aplicação
- `/home/usuario/gestaopro-postgres/logs/` - Logs
- `/home/usuario/gestaopro-postgres/.env` - Configurações
- `/var/lib/postgresql/` - Dados do PostgreSQL

### Processos
- **gestaopro** - Aplicação principal (PM2)
- **postgresql** - Banco de dados

---

## 🎯 Próximos Passos

1. ✅ Acesse o sistema e faça login
2. ✅ Altere a senha do admin
3. ✅ Configure backup automático
4. ✅ Configure domínio (se tiver)
5. ✅ Configure SSL/HTTPS
6. ✅ Comece a usar!

---

## 📄 Credenciais Padrão

```
URL: http://SEU_IP:9099
Email: admin@gestaopro.com
Senha: admin123
```

**⚠️ ALTERE A SENHA APÓS O PRIMEIRO LOGIN!**

---

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs: `pm2 logs gestaopro`
2. Verifique o PostgreSQL: `sudo systemctl status postgresql`
3. Consulte a seção "Solução de Problemas"
4. Verifique os arquivos de documentação incluídos

---

**Versão:** 1.0.0  
**Porta:** 9099  
**Banco:** PostgreSQL Local  
**Gerenciador:** PM2
