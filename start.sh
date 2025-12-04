#!/bin/bash

echo "🚀 Iniciando GestaoPro com PostgreSQL..."
echo ""

# Verificar se PostgreSQL está rodando
if ! sudo systemctl is-active --quiet postgresql; then
    echo "📦 Iniciando PostgreSQL..."
    sudo systemctl start postgresql
    sleep 2
fi

# Verificar se o banco existe
if ! sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw gestaopro; then
    echo "⚠️  Banco de dados 'gestaopro' não encontrado!"
    echo "Execute primeiro: sudo -u postgres psql -f setup_database.sql"
    exit 1
fi

echo "✅ PostgreSQL está rodando"
echo ""

# Verificar se dependências estão instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
    echo ""
fi

echo "🔧 Iniciando servidor backend na porta 3001..."
node server/index.js &
BACKEND_PID=$!
sleep 3

# Verificar se backend iniciou
if ! curl -s http://localhost:3001/api/health > /dev/null; then
    echo "❌ Erro ao iniciar backend!"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo "✅ Backend rodando em http://localhost:3001/api"
echo ""

echo "🎨 Iniciando frontend na porta 5173..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Sistema GestaoPro"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:3001/api"
echo ""
echo "  Credenciais padrão:"
echo "  Email: admin@gestaopro.com"
echo "  Senha: admin123"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npm run dev
