# ✅ CHECKLIST DE INSTALAÇÃO - GestaoPro na VPS

Use este checklist para acompanhar o progresso da instalação.

## 📦 PRÉ-REQUISITOS

- [ ] VPS Linux Ubuntu 20.04+ disponível
- [ ] Acesso SSH funcionando (usuário + senha ou chave)
- [ ] IP público da VPS anotado: ________________
- [ ] Projeto no Windows: `C:\Users\Suporte\Documents\GitHub\gestaoproBANCODEDADOS\gestaopro-postgres`

---

## 🚀 FASE 1: TRANSFERÊNCIA

- [ ] Conectado via SSH: `ssh usuario@IP_VPS`
- [ ] Projeto transferido via SCP/SFTP/FileZilla
- [ ] Verificado: `ls -la ~/gestaopro-postgres`
- [ ] Arquivos importantes presentes:
  - [ ] `install.sh`
  - [ ] `start-production.sh`
  - [ ] `verificar-sistema.sh`
  - [ ] `server/index.js`
  - [ ] `package.json`
  - [ ] `setup_database.sql`

**Comando usado:**
```bash
scp -r gestaopro-postgres usuario@IP_VPS:~/
```

---

## 🗄️ FASE 2: INSTALAÇÃO DO BANCO DE DADOS

- [ ] Entrou no diretório: `cd ~/gestaopro-postgres`
- [ ] Tornou script executável: `chmod +x install.sh`
- [ ] Executou instalação: `./install.sh`
- [ ] PostgreSQL instalado e rodando
- [ ] Banco `gestaopro` criado
- [ ] Usuário `gestaopro_user` criado
- [ ] 14 tabelas criadas
- [ ] Usuário admin criado no banco

**Verificação:**
```bash
sudo systemctl status postgresql
sudo -u postgres psql -d gestaopro -c "\dt"
```

---

## 📦 FASE 3: NODE.JS E DEPENDÊNCIAS

- [ ] Node.js 18+ instalado
- [ ] npm instalado
- [ ] Dependências instaladas: `npm install`
- [ ] Sem erros na instalação

**Verificação:**
```bash
node --version
npm --version
ls -la node_modules/
```

---

## 🏗️ FASE 4: BUILD DO FRONTEND

- [ ] Build executado: `npm run build`
- [ ] Pasta `dist/` criada
- [ ] Arquivos em `dist/assets/`
- [ ] Arquivo `dist/index.html` existe

**Verificação:**
```bash
ls -la dist/
du -sh dist/
```

---

## 🔄 FASE 5: PM2 E INICIALIZAÇÃO

- [ ] PM2 instalado: `sudo npm install -g pm2`
- [ ] Pasta de logs criada: `mkdir -p logs`
- [ ] Script executável: `chmod +x start-production.sh`
- [ ] Aplicação iniciada: `pm2 start ecosystem.config.cjs`
- [ ] Status "online" no `pm2 status`
- [ ] Processos salvos: `pm2 save`
- [ ] Auto-start configurado: `pm2 startup` + comando executado

**Verificação:**
```bash
pm2 --version
pm2 status
pm2 logs gestaopro --lines 10
```

---

## 🔥 FASE 6: FIREWALL E REDE

- [ ] UFW instalado
- [ ] Porta SSH liberada: `sudo ufw allow 22/tcp`
- [ ] Porta 9099 liberada: `sudo ufw allow 9099/tcp`
- [ ] Firewall ativado: `sudo ufw enable`
- [ ] Regras verificadas: `sudo ufw status`

**Verificação:**
```bash
sudo ufw status verbose
```

---

## 🧪 FASE 7: TESTES

- [ ] API responde localmente: `curl http://localhost:9099/api/health`
- [ ] IP público descoberto: `curl ifconfig.me`
- [ ] Sistema acessível no navegador: `http://IP:9099`
- [ ] Tela de login aparece
- [ ] Login funciona (admin@gestaopro.com / admin123)
- [ ] Dashboard carrega
- [ ] Menu lateral funciona

**IP Público:** ________________

**URL de Acesso:** http://________________:9099

---

## 🛡️ FASE 8: SEGURANÇA

- [ ] Senha do admin alterada (via sistema web)
- [ ] Senha do banco alterada
  ```bash
  sudo -u postgres psql
  ALTER USER gestaopro_user WITH PASSWORD 'NOVA_SENHA';
  \q
  nano ~/gestaopro-postgres/server/index.js  # linha ~21
  pm2 restart gestaopro
  ```
- [ ] JWT_SECRET alterado
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  nano ~/gestaopro-postgres/server/index.js  # linha ~34
  pm2 restart gestaopro
  ```
- [ ] Backup automático configurado
  ```bash
  nano ~/backup-gestaopro.sh
  chmod +x ~/backup-gestaopro.sh
  crontab -e  # adicionar: 0 2 * * * $HOME/backup-gestaopro.sh
  ```

**Nova Senha do Banco:** ________________ (guarde em local seguro!)

**Novo JWT_SECRET:** ________________ (guarde em local seguro!)

---

## ✅ FASE 9: VERIFICAÇÃO FINAL

- [ ] Script de verificação executado: `bash verificar-sistema.sh`
- [ ] Todos os checks passaram (ou maioria)
- [ ] Sistema sobrevive a `pm2 restart gestaopro`
- [ ] Sistema sobrevive a `sudo reboot` (reconectar e verificar)

**Resultado da Verificação:** ___/10 checks OK

---

## 📝 FASE 10: DOCUMENTAÇÃO

- [ ] Credenciais documentadas em local seguro
- [ ] IP e URL anotados
- [ ] Comandos úteis revisados
- [ ] Equipe informada sobre novo sistema

---

## 🎯 FUNCIONALIDADES TESTADAS

Teste cada módulo no sistema:

- [ ] Dashboard carrega com estatísticas
- [ ] **Clientes:** Criar, editar, listar, deletar
- [ ] **Fornecedores:** CRUD funciona
- [ ] **Funcionários:** CRUD funciona
- [ ] **Produtos:** CRUD funciona
- [ ] **Vendas:** Criar venda
- [ ] **Serviços:** CRUD funciona
- [ ] **Configurações:** Acessível

---

## 📋 INFORMAÇÕES DO SISTEMA INSTALADO

Preencha após instalação bem-sucedida:

**SERVIDOR**
- IP Público: ________________
- Sistema: Ubuntu ___.___ LTS
- Usuário SSH: ________________

**ACESSO**
- URL: http://________________:9099
- Email Admin: admin@gestaopro.com
- Senha Admin: ________________ (alterada)

**BANCO DE DADOS**
- Host: localhost
- Porta: 5432
- Database: gestaopro
- Usuário: gestaopro_user
- Senha: ________________ (alterada)

**SEGURANÇA**
- JWT_SECRET: ________________ (alterado)
- Backup: Diário às 2h AM em ~/backups/
- Firewall: UFW ativo

**COMANDOS RÁPIDOS**
```bash
pm2 status
pm2 logs gestaopro
pm2 restart gestaopro
bash ~/gestaopro-postgres/verificar-sistema.sh
```

---

## ✅ CONCLUSÃO

- [ ] Sistema 100% operacional
- [ ] Backup testado
- [ ] Documentação completa
- [ ] Equipe treinada

**Data de Instalação:** ___/___/______

**Responsável:** ________________

**Observações:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

---

## 📞 SUPORTE

**Em caso de problemas:**

1. Verificar logs: `pm2 logs gestaopro --err`
2. Ver status: `pm2 status`
3. Consultar: `GUIA_RAPIDO_VPS.md`
4. Executar: `bash verificar-sistema.sh`

**Documentação Completa:**
- GUIA_RAPIDO_VPS.md
- INSTALACAO_SERVIDOR.md
- IMPLANTACAO_PERMANENTE.md

---

✅ **SISTEMA PRONTO PARA PRODUÇÃO!**
