# 🚀 GUIA RÁPIDO - Instalação na VPS Linux

## ⚡ INSTALAÇÃO EM 5 COMANDOS

### 1. Transferir Projeto (Do Windows)
```powershell
cd C:\Users\Suporte\Documents\GitHub\gestaoproBANCODEDADOS
scp -r gestaopro-postgres seu_usuario@IP_VPS:~/
```

### 2. Instalar Tudo Automaticamente (Na VPS via SSH)
```bash
cd ~/gestaopro-postgres
chmod +x install.sh start-production.sh
./install.sh
```

### 3. Build e Iniciar
```bash
npm run build
sudo npm install -g pm2
mkdir -p logs
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

### 4. Configurar Firewall
```bash
sudo ufw allow 22/tcp
sudo ufw allow 9099/tcp
sudo ufw enable
```

### 5. Acessar
```
http://SEU_IP:9099
Email: admin@gestaopro.com
Senha: admin123
```

## 🔍 VERIFICAÇÃO RÁPIDA
```bash
pm2 status
curl http://localhost:9099/api/health
curl ifconfig.me
```

## 🛠️ COMANDOS ÚTEIS
```bash
pm2 logs gestaopro          # Ver logs
pm2 restart gestaopro       # Reiniciar
pm2 monit                   # Monitorar
```

## 🚨 SE DER PROBLEMA
```bash
pm2 logs gestaopro --err
sudo systemctl status postgresql
pm2 delete gestaopro && pm2 start ecosystem.config.cjs
```

✅ **PRONTO!** Sistema rodando permanentemente!
