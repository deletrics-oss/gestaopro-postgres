# 🚀 Início Rápido - GestaoPro PostgreSQL

## Instalação Automática (Recomendado)

```bash
# 1. Extrair o projeto
unzip gestaopro-postgres.zip
cd gestaopro-postgres

# 2. Executar script de instalação
./install.sh

# 3. Iniciar o sistema
npm run dev
```

Pronto! Acesse http://localhost:5173

## Instalação Manual

### 1. Instalar PostgreSQL

```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Configurar Banco de Dados

```bash
sudo -u postgres psql -c "CREATE DATABASE gestaopro;"
sudo -u postgres psql -c "CREATE USER gestaopro_user WITH PASSWORD 'gestaopro123';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE gestaopro TO gestaopro_user;"
sudo cp setup_database.sql /tmp/
sudo -u postgres psql -f /tmp/setup_database.sql
```

### 3. Instalar Dependências

```bash
npm install
```

### 4. Iniciar Sistema

```bash
npm run dev
```

## 👤 Login Padrão

- **Email:** admin@gestaopro.com
- **Senha:** admin123

## 📍 URLs

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001/api

## ⚙️ Comandos Úteis

```bash
# Iniciar frontend e backend juntos
npm run dev

# Iniciar apenas backend
npm run server

# Build para produção
npm run build

# Verificar logs do PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

## 🔧 Solução de Problemas

### Erro de conexão com banco
```bash
sudo systemctl status postgresql
sudo systemctl restart postgresql
```

### Porta 3001 em uso
```bash
sudo lsof -i :3001
sudo kill -9 <PID>
```

### Reinstalar banco de dados
```bash
sudo -u postgres psql -c "DROP DATABASE gestaopro;"
./install.sh
```

## 📚 Documentação Completa

Consulte `README_INSTALACAO.md` para informações detalhadas.

## ⚠️ Segurança

**ANTES DE USAR EM PRODUÇÃO:**

1. Altere a senha do banco:
   ```bash
   sudo -u postgres psql
   ALTER USER gestaopro_user WITH PASSWORD 'nova_senha_forte';
   ```

2. Altere o JWT_SECRET no arquivo `.env`

3. Altere a senha do usuário admin no sistema

## 🆘 Precisa de Ajuda?

Verifique:
- Console do navegador (F12)
- Logs do servidor backend
- Logs do PostgreSQL
- Arquivo `README_INSTALACAO.md`
