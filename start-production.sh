#!/bin/bash

# Script de Inicialização Completa do GestaoPro em Produção
# Execute após rodar install.sh e npm run build

set -e

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "========================================"
echo "  GestaoPro - Iniciar em Produção"
echo "========================================"
echo ""

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo "ERRO: Execute este script do diretório gestaopro-postgres"
    exit 1
fi

# 1. Verificar build
echo "1. Verificando build do frontend..."
if [ ! -d "dist" ]; then
    echo -e "${YELLOW}Build não encontrado. Executando npm run build...${NC}"
    npm run build
else
    echo -e "${GREEN}✓ Build encontrado${NC}"
fi
echo ""

# 2. Criar diretório de logs
echo "2. Criando diretório de logs..."
mkdir -p logs
echo -e "${GREEN}✓ Diretório logs/ criado${NC}"
echo ""

# 3. Verificar PM2
echo "3. Verificando PM2..."
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}PM2 não instalado. Instalando...${NC}"
    sudo npm install -g pm2
else
    echo -e "${GREEN}✓ PM2 já instalado${NC}"
fi
echo ""

# 4. Parar instância anterior se existir
echo "4. Verificando instâncias anteriores..."
if pm2 list | grep -q gestaopro; then
    echo -e "${YELLOW}Parando instância anterior...${NC}"
    pm2 stop gestaopro
    pm2 delete gestaopro
fi
echo -e "${GREEN}✓ Sem instâncias conflitantes${NC}"
echo ""

# 5. Iniciar aplicação
echo "5. Iniciando aplicação..."
pm2 start ecosystem.config.cjs
echo -e "${GREEN}✓ Aplicação iniciada${NC}"
echo ""

# 6. Aguardar inicialização
echo "6. Aguardando inicialização..."
sleep 3
echo ""

# 7. Verificar status
echo "7. Verificando status..."
pm2 status
echo ""

# 8. Testar API
echo "8. Testando API..."
sleep 2
API_RESPONSE=$(curl -s http://localhost:9099/api/health 2>/dev/null)
if echo "$API_RESPONSE" | grep -q "ok"; then
    echo -e "${GREEN}✓ API funcionando corretamente${NC}"
    echo "  Resposta: $API_RESPONSE"
else
    echo "⚠ API não respondeu como esperado"
    echo "  Verifique os logs: pm2 logs gestaopro"
fi
echo ""

# 9. Salvar configuração PM2
echo "9. Salvando configuração do PM2..."
pm2 save
echo -e "${GREEN}✓ Configuração salva${NC}"
echo ""

# 10. Configurar auto-start
echo "10. Configurando auto-start..."
echo ""
echo -e "${YELLOW}IMPORTANTE: Execute o comando abaixo para configurar inicialização automática:${NC}"
echo ""
pm2 startup
echo ""
echo "Copie e execute o comando 'sudo env PATH=...' que apareceu acima."
echo ""

# 11. Descobrir IP
echo "========================================"
echo "  SISTEMA INICIADO COM SUCESSO!"
echo "========================================"
echo ""

IP_PUBLIC=$(curl -s ifconfig.me 2>/dev/null)
if [ -n "$IP_PUBLIC" ]; then
    echo "🌐 Acesse o sistema em:"
    echo "   http://$IP_PUBLIC:9099"
else
    echo "🌐 Acesse o sistema em:"
    echo "   http://SEU_IP:9099"
fi
echo ""
echo "🔑 Credenciais padrão:"
echo "   Email: admin@gestaopro.com"
echo "   Senha: admin123"
echo ""
echo "⚠️  ALTERE A SENHA após o primeiro login!"
echo ""
echo "📋 Comandos úteis:"
echo "   pm2 status              - Ver status"
echo "   pm2 logs gestaopro      - Ver logs"
echo "   pm2 restart gestaopro   - Reiniciar"
echo "   pm2 monit               - Monitorar recursos"
echo ""
echo "✅ Para verificar o sistema completo:"
echo "   bash verificar-sistema.sh"
echo ""
