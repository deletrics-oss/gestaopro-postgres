#!/bin/bash

# Script de Verificação do Sistema GestaoPro
# Execute: bash verificar-sistema.sh

echo "========================================"
echo "  VERIFICAÇÃO DO SISTEMA GESTAOPRO"
echo "========================================"
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

check_ok() {
    echo -e "${GREEN}✓${NC} $1"
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

echo "1. Verificando PostgreSQL..."
if systemctl is-active --quiet postgresql; then
    check_ok "PostgreSQL está rodando"
    VERSION=$(psql --version | awk '{print $3}')
    echo "   Versão: $VERSION"
else
    check_fail "PostgreSQL NÃO está rodando"
    echo "   Solução: sudo systemctl start postgresql"
fi
echo ""

echo "2. Verificando Banco de Dados..."
if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw gestaopro; then
    check_ok "Banco 'gestaopro' existe"
    
    # Contar tabelas
    TABLE_COUNT=$(sudo -u postgres psql -d gestaopro -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
    if [ "$TABLE_COUNT" -eq 14 ]; then
        check_ok "14 tabelas criadas corretamente"
    else
        check_warn "Encontradas $TABLE_COUNT tabelas (esperado: 14)"
    fi
    
    # Verificar usuário admin
    ADMIN_COUNT=$(sudo -u postgres psql -d gestaopro -t -c "SELECT COUNT(*) FROM users WHERE email = 'admin@gestaopro.com';")
    if [ "$ADMIN_COUNT" -eq 1 ]; then
        check_ok "Usuário admin existe"
    else
        check_fail "Usuário admin NÃO encontrado"
    fi
else
    check_fail "Banco 'gestaopro' NÃO existe"
    echo "   Solução: ./install.sh"
fi
echo ""

echo "3. Verificando Node.js..."
if command -v node &> /dev/null; then
    check_ok "Node.js instalado"
    NODE_VERSION=$(node --version)
    echo "   Versão: $NODE_VERSION"
else
    check_fail "Node.js NÃO instalado"
    echo "   Solução: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt install -y nodejs"
fi
echo ""

echo "4. Verificando PM2..."
if command -v pm2 &> /dev/null; then
    check_ok "PM2 instalado"
    PM2_VERSION=$(pm2 --version)
    echo "   Versão: $PM2_VERSION"
else
    check_fail "PM2 NÃO instalado"
    echo "   Solução: sudo npm install -g pm2"
fi
echo ""

echo "5. Verificando Aplicação..."
if pm2 list | grep -q gestaopro; then
    STATUS=$(pm2 jlist | grep -A 10 gestaopro | grep status | cut -d '"' -f 4)
    if [ "$STATUS" == "online" ]; then
        check_ok "Aplicação GestaoPro rodando (status: online)"
    else
        check_warn "Aplicação existe mas status: $STATUS"
        echo "   Solução: pm2 restart gestaopro"
    fi
else
    check_fail "Aplicação GestaoPro NÃO está no PM2"
    echo "   Solução: cd ~/gestaopro-postgres && pm2 start ecosystem.config.cjs"
fi
echo ""

echo "6. Verificando Build do Frontend..."
if [ -d "$HOME/gestaopro-postgres/dist" ]; then
    check_ok "Build do frontend existe (pasta dist/)"
    SIZE=$(du -sh ~/gestaopro-postgres/dist 2>/dev/null | cut -f1)
    echo "   Tamanho: $SIZE"
else
    check_fail "Build do frontend NÃO existe"
    echo "   Solução: cd ~/gestaopro-postgres && npm run build"
fi
echo ""

echo "7. Testando API..."
API_RESPONSE=$(curl -s http://localhost:9099/api/health 2>/dev/null)
if echo "$API_RESPONSE" | grep -q "ok"; then
    check_ok "API respondendo corretamente"
    echo "   Resposta: $API_RESPONSE"
else
    check_fail "API NÃO está respondendo"
    echo "   Solução: pm2 logs gestaopro --err"
fi
echo ""

echo "8. Verificando Firewall..."
if command -v ufw &> /dev/null; then
    if sudo ufw status | grep -q "Status: active"; then
        check_ok "Firewall UFW está ativo"
        if sudo ufw status | grep -q "9099"; then
            check_ok "Porta 9099 liberada"
        else
            check_warn "Porta 9099 NÃO liberada"
            echo "   Solução: sudo ufw allow 9099/tcp"
        fi
    else
        check_warn "Firewall UFW está inativo"
    fi
else
    check_warn "UFW não instalado"
fi
echo ""

echo "9. Verificando Auto-start..."
if systemctl list-units --type=service | grep -q pm2; then
    check_ok "PM2 configurado para auto-start"
else
    check_warn "PM2 auto-start NÃO configurado"
    echo "   Solução: pm2 startup (e executar o comando mostrado)"
fi
echo ""

echo "10. Descobrindo IP Público..."
IP_PUBLIC=$(curl -s ifconfig.me 2>/dev/null)
if [ -n "$IP_PUBLIC" ]; then
    check_ok "IP Público: $IP_PUBLIC"
    echo ""
    echo "   🌐 URL de Acesso: http://$IP_PUBLIC:9099"
else
    check_warn "Não foi possível obter IP público"
fi
echo ""

echo "========================================"
echo "  RESUMO"
echo "========================================"
echo ""

# Contar checks OK
CHECKS_OK=0
CHECKS_TOTAL=10

# Recontagem simplificada
systemctl is-active --quiet postgresql && ((CHECKS_OK++))
sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw gestaopro && ((CHECKS_OK++))
command -v node &> /dev/null && ((CHECKS_OK++))
command -v pm2 &> /dev/null && ((CHECKS_OK++))
pm2 list | grep -q gestaopro && ((CHECKS_OK++))
[ -d "$HOME/gestaopro-postgres/dist" ] && ((CHECKS_OK++))
curl -s http://localhost:9099/api/health 2>/dev/null | grep -q "ok" && ((CHECKS_OK++))
sudo ufw status 2>/dev/null | grep -q "9099" && ((CHECKS_OK++))
systemctl list-units --type=service 2>/dev/null | grep -q pm2 && ((CHECKS_OK++))
[ -n "$(curl -s ifconfig.me 2>/dev/null)" ] && ((CHECKS_OK++))

if [ $CHECKS_OK -eq $CHECKS_TOTAL ]; then
    echo -e "${GREEN}✓ SISTEMA 100% OPERACIONAL!${NC}"
    echo ""
    echo "Credenciais padrão:"
    echo "  Email: admin@gestaopro.com"
    echo "  Senha: admin123"
    echo ""
    echo "⚠️  ALTERE A SENHA após o primeiro login!"
elif [ $CHECKS_OK -ge 7 ]; then
    echo -e "${YELLOW}⚠ SISTEMA PARCIALMENTE OPERACIONAL${NC}"
    echo "  Aprovação: $CHECKS_OK/$CHECKS_TOTAL checks"
    echo ""
    echo "Revise os itens marcados com ✗ ou ⚠ acima."
else
    echo -e "${RED}✗ SISTEMA COM PROBLEMAS${NC}"
    echo "  Aprovação: $CHECKS_OK/$CHECKS_TOTAL checks"
    echo ""
    echo "Execute os comandos de solução indicados acima."
fi

echo ""
echo "Para mais ajuda, consulte:"
echo "  - GUIA_RAPIDO_VPS.md"
echo "  - INSTALACAO_SERVIDOR.md"
echo ""
