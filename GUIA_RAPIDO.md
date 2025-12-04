# 🚀 Guia Rápido - GestaoPro PostgreSQL

## Instalação em 5 Passos

### 1️⃣ Instalar PostgreSQL
```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2️⃣ Extrair o Projeto
```bash
tar -xzf gestaopro-postgres.tar.gz
cd gestaopro-postgres
```

### 3️⃣ Configurar Banco de Dados
```bash
# Criar banco e usuário
sudo -u postgres psql -c "CREATE DATABASE gestaopro;"
sudo -u postgres psql -c "CREATE USER gestaopro_user WITH PASSWORD 'gestaopro123';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE gestaopro TO gestaopro_user;"

# Criar tabelas
sudo cp setup_database.sql /tmp/
sudo -u postgres psql -f /tmp/setup_database.sql
```

### 4️⃣ Instalar Dependências
```bash
npm install
```

### 5️⃣ Iniciar Sistema
```bash
./start.sh
```

## 🎯 Acesso

- **URL:** http://localhost:5173
- **Email:** admin@gestaopro.com
- **Senha:** admin123

## ⚡ Comandos Úteis

### Iniciar sistema
```bash
./start.sh
```

### Iniciar apenas backend
```bash
node server/index.js
```

### Iniciar apenas frontend
```bash
npm run dev
```

### Verificar PostgreSQL
```bash
sudo systemctl status postgresql
```

### Acessar banco de dados
```bash
sudo -u postgres psql -d gestaopro
```

### Ver logs do servidor
```bash
tail -f /tmp/server.log
```

## 🔧 Solução de Problemas

### Erro de conexão com banco
```bash
sudo systemctl restart postgresql
```

### Porta 3001 ocupada
```bash
sudo lsof -i :3001
sudo kill -9 <PID>
```

### Resetar senha admin
```bash
sudo -u postgres psql -d gestaopro
UPDATE users SET password_hash = '$2a$10$UIgzXgxLMmhz5cRbbpIZ2.XQM34birHHPizkY30FYTJLjmL.7mrwm' WHERE email = 'admin@gestaopro.com';
\q
```

## 📚 Documentação Completa

- `README_INSTALACAO.md` - Guia completo de instalação
- `VERIFICACAO.md` - Status da adaptação e testes
- `setup_database.sql` - Script de criação do banco

## ✅ Checklist Pós-Instalação

- [ ] PostgreSQL instalado e rodando
- [ ] Banco `gestaopro` criado
- [ ] Tabelas criadas com sucesso
- [ ] Dependências npm instaladas
- [ ] Sistema iniciado sem erros
- [ ] Login funcionando
- [ ] Alterar senha padrão (produção)
- [ ] Alterar JWT_SECRET (produção)

## 🎉 Pronto!

Seu sistema GestaoPro com PostgreSQL local está funcionando!

Para mais detalhes, consulte `README_INSTALACAO.md`
