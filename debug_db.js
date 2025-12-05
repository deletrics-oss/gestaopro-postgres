import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  user: 'gestaopro_user',
  host: '72.60.246.250',
  database: 'gestaopro',
  password: 'gestaopro123',
  port: 5432,
});

async function debug() {
  try {
    console.log('🔌 Connecting to database...');
    const client = await pool.connect();
    console.log('✅ Connected!');
    client.release();

    // List tables
    console.log('\n📊 Listing tables:');
    const tablesRes = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    tablesRes.rows.forEach(row => console.log(` - ${row.table_name}`));

    // Describe customers table
    console.log('\n📋 Describing customers table:');
    const columnsRes = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'customers'
      ORDER BY ordinal_position;
    `);
    console.table(columnsRes.rows);

    // Try to insert a test customer
    console.log('\n📝 Testing insertion into customers...');
    const insertQuery = `
      INSERT INTO customers (name, email, phone, created_date, updated_date)
      VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING *;
    `;
    const insertValues = ['Test Customer', 'test@example.com', '123456789'];
    const insertRes = await pool.query(insertQuery, insertValues);
    console.log('✅ Inserted customer:', insertRes.rows[0]);

    // Clean up test customer
    console.log('\n🧹 Cleaning up test customer...');
    await pool.query('DELETE FROM customers WHERE id = $1', [insertRes.rows[0].id]);
    console.log('✅ Cleaned up.');

  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await pool.end();
  }
}

debug();
