#!/bin/bash

################################################################################
# Script de Instalação do GestaoPro PostgreSQL - Modo Root
# Porta: 9099
# Sistema: Ubuntu 20.04+
################################################################################

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
clear
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║          GestaoPro PostgreSQL - Instalação Root           ║"
echo "║                     Porta: 9099                            ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Funções de mensagem
info() {
    echo -e "${GREEN}[✓]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[!]${NC} $1"
}

error() {
    echo -e "${RED}[✗]${NC} $1"
    exit 1
}

step() {
    echo -e "${BLUE}[→]${NC} $1"
}

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then 
    error "Este script DEVE ser executado como root. Use: sudo ./install-root.sh"
fi

# Verificar se está no Ubuntu
if ! grep -q "Ubuntu" /etc/os-release; then
    warn "Este script foi testado apenas no Ubuntu."
    read -p "Deseja continuar? (s/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        exit 1
    fi
fi

# Obter diretório atual
INSTALL_DIR=$(pwd)
info "Diretório de instalação: $INSTALL_DIR"
echo ""

################################################################################
# PASSO 1: Atualizar Sistema
################################################################################
step "Passo 1/10: Atualizando sistema..."
apt update -qq
info "Sistema atualizado!"
echo ""

################################################################################
# PASSO 2: Instalar PostgreSQL
################################################################################
step "Passo 2/10: Instalando PostgreSQL..."
if ! command -v psql &> /dev/null; then
    DEBIAN_FRONTEND=noninteractive apt install -y postgresql postgresql-contrib > /dev/null 2>&1
    systemctl start postgresql
    systemctl enable postgresql
    info "PostgreSQL instalado e iniciado!"
else
    info "PostgreSQL já está instalado."
fi
echo ""

################################################################################
# PASSO 3: Instalar Node.js
################################################################################
step "Passo 3/10: Instalando Node.js 18..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - > /dev/null 2>&1
    apt install -y nodejs > /dev/null 2>&1
    info "Node.js $(node --version) instalado!"
else
    info "Node.js $(node --version) já está instalado."
fi
echo ""

################################################################################
# PASSO 4: Configurar Banco de Dados
################################################################################
step "Passo 4/10: Configurando banco de dados..."

# Verificar se banco já existe
if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw gestaopro; then
    warn "Banco de dados 'gestaopro' já existe!"
    read -p "Deseja recriar? Isso apagará todos os dados! (s/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        info "Removendo banco existente..."
        sudo -u postgres psql -c "DROP DATABASE IF EXISTS gestaopro;" > /dev/null 2>&1
        sudo -u postgres psql -c "DROP USER IF EXISTS gestaopro_user;" > /dev/null 2>&1
        SKIP_DB=false
    else
        info "Mantendo banco existente."
        SKIP_DB=true
    fi
else
    SKIP_DB=false
fi

if [ "$SKIP_DB" = false ]; then
    # Criar banco e usuário
    sudo -u postgres psql -c "CREATE DATABASE gestaopro;" > /dev/null 2>&1 || true
    sudo -u postgres psql -c "CREATE USER gestaopro_user WITH PASSWORD 'gestaopro123';" > /dev/null 2>&1 || true
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE gestaopro TO gestaopro_user;" > /dev/null 2>&1 || true
    
    # Executar script de criação das tabelas
    if [ -f "$INSTALL_DIR/setup_database.sql" ]; then
        cp "$INSTALL_DIR/setup_database.sql" /tmp/
        sudo -u postgres psql -f /tmp/setup_database.sql > /dev/null 2>&1
        rm /tmp/setup_database.sql
        info "Banco de dados criado com 14 tabelas!"
    else
        warn "Arquivo setup_database.sql não encontrado. Pulando criação de tabelas."
    fi
else
    info "Usando banco existente."
fi
echo ""

################################################################################
# PASSO 5: Instalar Dependências do Projeto
################################################################################
step "Passo 5/10: Instalando dependências do Node.js..."
cd "$INSTALL_DIR"
npm install --quiet > /dev/null 2>&1
info "Dependências instaladas!"
echo ""

################################################################################
# PASSO 6: Fazer Build do Frontend
################################################################################
step "Passo 6/10: Compilando frontend (build de produção)..."
npm run build > /dev/null 2>&1
info "Frontend compilado!"
echo ""

################################################################################
# PASSO 7: Instalar PM2
################################################################################
step "Passo 7/10: Instalando PM2 (Process Manager)..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2 --quiet > /dev/null 2>&1
    info "PM2 instalado!"
else
    info "PM2 já está instalado."
fi
echo ""

################################################################################
# PASSO 8: Configurar Firewall
################################################################################
step "Passo 8/10: Configurando firewall..."
if command -v ufw &> /dev/null; then
    # Permitir SSH primeiro (segurança)
    ufw allow 22/tcp > /dev/null 2>&1 || true
    # Permitir porta 9099
    ufw allow 9099/tcp > /dev/null 2>&1 || true
    # Habilitar firewall (se ainda não estiver)
    echo "y" | ufw enable > /dev/null 2>&1 || true
    info "Firewall configurado (porta 9099 liberada)!"
else
    warn "UFW não encontrado. Configure o firewall manualmente."
fi
echo ""

################################################################################
# PASSO 9: Iniciar Aplicação com PM2
################################################################################
step "Passo 9/10: Iniciando aplicação com PM2..."

# Parar se já estiver rodando
pm2 stop gestaopro > /dev/null 2>&1 || true
pm2 delete gestaopro > /dev/null 2>&1 || true

# Iniciar aplicação
cd "$INSTALL_DIR"
pm2 start ecosystem.config.cjs > /dev/null 2>&1
pm2 save > /dev/null 2>&1

info "Aplicação iniciada!"
echo ""

################################################################################
# PASSO 10: Configurar Auto-start
################################################################################
step "Passo 10/10: Configurando auto-start no boot..."

# Detectar usuário que executou sudo (se aplicável)
if [ -n "$SUDO_USER" ]; then
    REAL_USER=$SUDO_USER
else
    REAL_USER="root"
fi

# Configurar PM2 startup
pm2 startup systemd -u $REAL_USER --hp /root > /dev/null 2>&1 || true
pm2 save > /dev/null 2>&1

info "Auto-start configurado!"
echo ""

################################################################################
# FINALIZAÇÃO
################################################################################
echo -e "${GREEN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║          ✓ Instalação Concluída com Sucesso!              ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Obter IP do servidor
SERVER_IP=$(hostname -I | awk '{print $1}')

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🌐 URLs de Acesso:${NC}"
echo ""
echo "   Local:    http://localhost:9099"
echo "   Rede:     http://$SERVER_IP:9099"
echo ""
echo -e "${GREEN}👤 Credenciais Padrão:${NC}"
echo ""
echo "   Email:    admin@gestaopro.com"
echo "   Senha:    admin123"
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Status do PM2
echo -e "${GREEN}📊 Status da Aplicação:${NC}"
echo ""
pm2 status
echo ""

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🛠️  Comandos Úteis:${NC}"
echo ""
echo "   Ver logs:        pm2 logs gestaopro"
echo "   Reiniciar:       pm2 restart gestaopro"
echo "   Parar:           pm2 stop gestaopro"
echo "   Status:          pm2 status"
echo "   Monitorar:       pm2 monit"
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}⚠️  IMPORTANTE - Segurança:${NC}"
echo ""
echo "   1. Altere a senha do admin no sistema"
echo "   2. Altere a senha do banco de dados"
echo "   3. Altere o JWT_SECRET no código"
echo ""

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Testar se está respondendo
echo -e "${GREEN}🔍 Testando aplicação...${NC}"
sleep 3
if curl -s http://localhost:9099/api/health > /dev/null 2>&1; then
    info "✓ API está respondendo!"
else
    warn "⚠ API não está respondendo ainda. Aguarde alguns segundos."
fi
echo ""

echo -e "${GREEN}✓ Sistema instalado e rodando na porta 9099!${NC}"
echo -e "${GREEN}✓ A aplicação iniciará automaticamente após reboot.${NC}"
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Informações adicionais
echo "📚 Documentação:"
echo "   - INSTALACAO_SERVIDOR.md"
echo "   - README_INSTALACAO.md"
echo ""

echo "💾 Backup do banco:"
echo "   pg_dump -U gestaopro_user gestaopro > backup.sql"
echo ""

echo -e "${GREEN}Instalação concluída! Acesse: http://$SERVER_IP:9099${NC}"
echo ""
