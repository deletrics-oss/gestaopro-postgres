import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;
const app = express();
const PORT = process.env.PORT || 9099;

// Configuração do banco de dados
const pool = new Pool({
  user: process.env.DB_USER || 'gestaopro_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'gestaopro',
  password: process.env.DB_PASSWORD || 'gestaopro123',
  port: process.env.DB_PORT || 5432,
});

// Teste de conexão
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Erro ao conectar ao banco:', err.stack);
  } else {
    console.log('✅ Conectado ao PostgreSQL com sucesso!');
    release();
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos do frontend (produção)
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Secret para JWT
const JWT_SECRET = process.env.JWT_SECRET || 'gestaopro-secret-key-change-in-production';

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// ========== ROTAS DE AUTENTICAÇÃO ==========

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND active = true',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Criar sessão
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await pool.query(
      'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, token, expiresAt]
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// ========== ROTAS GENÉRICAS PARA CRUD ==========

// Mapeamento de colunas válidas para cada tabela
const tableColumns = {
  customers: ['name', 'email', 'phone', 'cpf_cnpj', 'address', 'city', 'state', 'zip_code', 'birth_date', 'notes', 'created_date', 'updated_date'],
  suppliers: ['name', 'contact_person', 'email', 'phone', 'cnpj', 'address', 'city', 'state', 'zip_code', 'notes', 'created_date', 'updated_date'],
  employees: ['name', 'role', 'email', 'phone', 'cpf', 'hire_date', 'salary', 'birth_date', 'address', 'city', 'state', 'zip_code', 'active', 'created_date', 'updated_date'],
  products: ['name', 'sku', 'description', 'category', 'unit_price', 'cost_price', 'stock_quantity', 'minimum_stock', 'location', 'supplier_id', 'active', 'created_date', 'updated_date'],
  materials: ['material_name', 'description', 'unit', 'quantity', 'minimum_quantity', 'unit_price', 'supplier_id', 'location', 'created_date', 'updated_date'],
  sales: ['product_id', 'product_name', 'quantity', 'unit_price', 'total_revenue', 'customer_id', 'customer_name', 'cost_price', 'total_cost', 'profit', 'sale_date', 'payment_method', 'notes', 'created_date', 'updated_date'],
  services: ['service_type', 'customer_id', 'customer_name', 'service_date', 'value', 'status', 'description', 'created_date', 'updated_date'],
  expenses: ['description', 'category', 'value', 'expense_date', 'payment_method', 'supplier_id', 'created_date', 'updated_date'],
  marketplace_orders: ['order_number', 'customer_name', 'items', 'status', 'integration', 'completed_by', 'created_date', 'updated_date'],
  production_orders: ['order_number', 'product_id', 'product_name', 'quantity', 'status', 'priority', 'start_date', 'end_date', 'employee_id', 'employee_name', 'notes', 'created_date', 'updated_date'],
  machines_vehicles: ['name', 'type', 'identification', 'purchase_date', 'last_maintenance', 'next_maintenance', 'status', 'notes', 'created_date', 'updated_date'],
  invoices: ['invoice_number', 'type', 'supplier_name', 'supplier_id', 'customer_id', 'customer_name', 'issue_date', 'due_date', 'value', 'status', 'notes', 'created_date', 'updated_date'],
  users: ['name', 'email', 'password', 'created_date', 'updated_date'],
  cash_movements: ['type', 'description', 'value', 'movement_date', 'payment_method', 'category', 'notes', 'created_date', 'updated_date']
};

// Função auxiliar para sanitizar valores
const sanitizeValue = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  return value;
};

// Filtrar apenas colunas válidas para a tabela
const filterValidColumns = (data, tableName) => {
  const validColumns = tableColumns[tableName] || [];
  const filtered = {};

  for (const [key, value] of Object.entries(data)) {
    if (validColumns.includes(key) && value !== undefined && value !== null && value !== '' && key !== 'id') {
      filtered[key] = value;
    }
  }

  return filtered;
};

// Criar registro (POST) - VERSÃO CORRIGIDA
const createRecord = (tableName) => async (req, res) => {
  try {
    const data = req.body;

    // Filtrar apenas colunas válidas
    const filteredData = filterValidColumns(data, tableName);

    const keys = Object.keys(filteredData);
    const values = Object.values(filteredData);

    if (keys.length === 0) {
      return res.status(400).json({ error: 'Nenhum dado válido fornecido' });
    }

    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    const columns = keys.join(', ');

    const query = `
      INSERT INTO ${tableName} (${columns})
      VALUES (${placeholders})
      RETURNING *
    `;

    console.log(`✅ SQL para ${tableName}:`, query);
    console.log(`✅ Colunas:`, keys);
    console.log(`✅ Valores:`, values);

    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(`❌ Erro ao criar ${tableName}:`, error.message);
    console.log(`❌ ERRO DETALHADO ao criar ${tableName}:`, { message: error.message, stack: error.stack, code: error.code });
    res.status(500).json({ error: `Erro ao criar registro em ${tableName}`, details: error.message });
  }
};

// Listar registros (GET)
const listRecords = (tableName) => async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM ${tableName} ORDER BY created_date DESC`);
    res.json(result.rows);
  } catch (error) {
    console.error(`Erro ao listar ${tableName}:`, error);
    res.status(500).json({ error: `Erro ao listar ${tableName}` });
  }
};

// Buscar por ID (GET)
const getRecord = (tableName) => async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`SELECT * FROM ${tableName} WHERE id = $1`, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Registro não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(`Erro ao buscar ${tableName}:`, error);
    res.status(500).json({ error: `Erro ao buscar ${tableName}` });
  }
};

// Atualizar registro (PUT)
const updateRecord = (tableName) => async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // Filtrar apenas colunas válidas
    const filteredData = filterValidColumns(data, tableName);

    const keys = Object.keys(filteredData);
    const values = Object.values(filteredData);

    if (keys.length === 0) {
      return res.status(400).json({ error: 'Nenhum dado válido para atualizar' });
    }

    const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
    values.push(id);

    const query = `
      UPDATE ${tableName}
      SET ${setClause}, updated_date = NOW()
      WHERE id = $${values.length}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Registro não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(`Erro ao atualizar ${tableName}:`, error);
    res.status(500).json({ error: `Erro ao atualizar ${tableName}` });
  }
};

// Deletar registro (DELETE)
const deleteRecord = (tableName) => async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`DELETE FROM ${tableName} WHERE id = $1 RETURNING *`, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Registro não encontrado' });
    }

    res.json({ message: 'Registro deletado com sucesso', data: result.rows[0] });
  } catch (error) {
    console.error(`Erro ao deletar ${tableName}:`, error);
    res.status(500).json({ error: `Erro ao deletar ${tableName}` });
  }
};

// ========== ROTAS PARA CADA TABELA ==========

const tables = [
  'customers', 'suppliers', 'employees', 'products', 'materials',
  'sales', 'services', 'expenses', 'marketplace_orders',
  'production_orders', 'machines_vehicles', 'invoices', 'users'
];

tables.forEach(table => {
  app.get(`/api/${table}`, authenticateToken, listRecords(table));
  app.get(`/api/${table}/:id`, authenticateToken, getRecord(table));
  app.post(`/api/${table}`, authenticateToken, createRecord(table));
  app.put(`/api/${table}/:id`, authenticateToken, updateRecord(table));
  app.delete(`/api/${table}/:id`, authenticateToken, deleteRecord(table));
});

// ========== ROTA DE DASHBOARD ==========

app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM customers) as total_customers,
        (SELECT COUNT(*) FROM products) as total_products,
        (SELECT COALESCE(SUM(total_revenue), 0) FROM sales WHERE sale_date >= CURRENT_DATE - INTERVAL '30 days') as monthly_sales,
        (SELECT COALESCE(SUM(value), 0) FROM expenses WHERE expense_date >= CURRENT_DATE - INTERVAL '30 days') as monthly_expenses
    `);

    res.json(stats.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

// ========== ROTA DE HEALTH CHECK ==========

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'GestaoPro API está funcionando' });
});

// ========== SERVIR FRONTEND (deve ser a última rota) ==========

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// ========== INICIAR SERVIDOR ==========

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 API disponível em http://localhost:${PORT}/api`);
  console.log(`🌐 Frontend disponível em http://localhost:${PORT}`);
});
