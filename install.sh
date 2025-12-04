#!/bin/bash

# Script de instalação automática do GestaoPro PostgreSQL
# Para Ubuntu 20.04+

set -e

echo "======================================"
echo "  GestaoPro - Instalação PostgreSQL  "
echo "======================================"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para mensagens
info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[AVISO]${NC} $1"
}

error() {
    echo -e "${RED}[ERRO]${NC} $1"
    exit 1
}

# Verificar se está rodando no Ubuntu
if ! grep -q "Ubuntu" /etc/os-release; then
    warn "Este script foi testado apenas no Ubuntu. Pode não funcionar em outras distribuições."
    read -p "Deseja continuar mesmo assim? (s/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        exit 1
    fi
fi

# Verificar se está rodando como root
if [ "$EUID" -eq 0 ]; then 
    error "Por favor, NÃO execute este script como root. Use seu usuário normal."
fi

# 1. Atualizar sistema
info "Atualizando sistema..."
sudo apt update

# 2. Instalar PostgreSQL
if ! command -v psql &> /dev/null; then
    info "Instalando PostgreSQL..."
    sudo apt install -y postgresql postgresql-contrib
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    info "PostgreSQL instalado com sucesso!"
else
    info "PostgreSQL já está instalado."
fi

# 3. Instalar Node.js se necessário
if ! command -v node &> /dev/null; then
    info "Instalando Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
    info "Node.js instalado com sucesso!"
else
    info "Node.js já está instalado ($(node --version))."
fi

# 4. Configurar banco de dados
info "Configurando banco de dados PostgreSQL..."

# Verificar se o banco já existe
if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw gestaopro; then
    warn "Banco de dados 'gestaopro' já existe!"
    read -p "Deseja recriar o banco? Isso apagará todos os dados! (s/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        info "Removendo banco existente..."
        sudo -u postgres psql -c "DROP DATABASE gestaopro;"
        sudo -u postgres psql -c "DROP USER IF EXISTS gestaopro_user;"
    else
        info "Mantendo banco existente."
        skip_db=true
    fi
fi

if [ "$skip_db" != "true" ]; then
    info "Criando banco de dados e usuário..."
    sudo -u postgres psql -c "CREATE DATABASE gestaopro;" || true
    sudo -u postgres psql -c "CREATE USER gestaopro_user WITH PASSWORD 'gestaopro123';" || true
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE gestaopro TO gestaopro_user;" || true
    
    info "Executando script de configuração das tabelas..."
    sudo cp setup_database.sql /tmp/
    sudo -u postgres psql -f /tmp/setup_database.sql
    sudo rm /tmp/setup_database.sql
    
    info "Banco de dados configurado com sucesso!"
fi

# 5. Instalar dependências do Node.js
info "Instalando dependências do projeto..."
npm install

# 6. Verificar arquivo .env
if [ ! -f .env ]; then
    warn "Arquivo .env não encontrado. Criando arquivo padrão..."
    cat > .env << 'EOF'
VITE_API_URL=http://localhost:3001/api
DB_USER=gestaopro_user
DB_PASSWORD=gestaopro123
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gestaopro
JWT_SECRET=gestaopro-secret-key-change-in-production
EOF
    info "Arquivo .env criado!"
fi

# 7. Finalização
echo ""
echo "======================================"
echo -e "${GREEN}✓ Instalação concluída com sucesso!${NC}"
echo "======================================"
echo ""
echo "Para iniciar o sistema:"
echo "  npm run dev"
echo ""
echo "O sistema estará disponível em:"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:3001/api"
echo ""
echo "Credenciais padrão:"
echo "  Email: admin@gestaopro.com"
echo "  Senha: admin123"
echo ""
echo -e "${YELLOW}IMPORTANTE:${NC} Em produção, altere:"
echo "  - Senha do banco de dados"
echo "  - JWT_SECRET no arquivo .env"
echo "  - Senha do usuário admin"
echo ""
