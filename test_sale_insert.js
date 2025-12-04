import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  user: 'gestaopro_user',
  host: 'localhost',
  database: 'gestaopro',
  password: 'gestaopro123',
  port: 5432,
});

const testSale = async () => {
  try {
    console.log('Iniciando teste de inserção em sales...');
    
    // 1. Buscar um produto existente
    const productRes = await pool.query('SELECT id, name FROM products LIMIT 1');
    if (productRes.rows.length === 0) {
      console.error('❌ Nenhum produto encontrado para vincular a venda.');
      return;
    }
    const product = productRes.rows[0];
    console.log(`Produto selecionado: ${product.name} (${product.id})`);

    // 2. Buscar um cliente existente
    const customerRes = await pool.query('SELECT id, name FROM customers LIMIT 1');
    let customer = null;
    if (customerRes.rows.length > 0) {
      customer = customerRes.rows[0];
      console.log(`Cliente selecionado: ${customer.name} (${customer.id})`);
    } else {
      console.log('Nenhum cliente encontrado, prosseguindo sem cliente.');
    }

    // 3. Inserir venda
    const query = `
      INSERT INTO sales (
        product_id, product_name, quantity, unit_price, total_revenue, 
        customer_id, customer_name, cost_price, total_cost, profit, 
        sale_date, payment_method, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *;
    `;

    const values = [
      product.id,
      product.name,
      1,
      100.00,
      100.00,
      customer ? customer.id : null,
      customer ? customer.name : 'Cliente Balcão',
      50.00,
      50.00,
      50.00,
      new Date(),
      'Dinheiro',
      'Venda de Teste Manual'
    ];

    const res = await pool.query(query, values);
    console.log('✅ Venda inserida com sucesso:', res.rows[0]);

  } catch (err) {
    console.error('❌ Erro ao inserir venda:', err);
  } finally {
    await pool.end();
  }
};

testSale();