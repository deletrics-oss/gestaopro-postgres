import pg from 'pg';
const { Pool } = pg;

// Configuration matching server/index.js fallbacks
const config = {
    user: 'gestaopro_user',
    host: '72.60.246.250',
    database: 'gestaopro',
    password: 'gestaopro123',
    port: 5432,
};

const rootConfig = {
    ...config,
    user: 'postgres',
    password: 'postgres', // Default password, might need change
    database: 'postgres'
};

async function setup() {
    console.log('🚀 Starting database setup...');

    // 1. Create Database and User
    const rootPool = new Pool(rootConfig);
    try {
        console.log('🔌 Connecting to root database...');
        await rootPool.connect(); // Check connection

        // Create User
        try {
            await rootPool.query(`CREATE USER ${config.user} WITH PASSWORD '${config.password}';`);
            console.log(`✅ User ${config.user} created.`);
        } catch (err) {
            if (err.code === '42710') console.log(`ℹ️ User ${config.user} already exists.`);
            else console.error(`❌ Error creating user:`, err.message);
        }

        // Create Database
        try {
            await rootPool.query(`CREATE DATABASE ${config.database} OWNER ${config.user};`);
            console.log(`✅ Database ${config.database} created.`);
        } catch (err) {
            if (err.code === '42P04') console.log(`ℹ️ Database ${config.database} already exists.`);
            else console.error(`❌ Error creating database:`, err.message);
        }

        // Grant privileges
        await rootPool.query(`GRANT ALL PRIVILEGES ON DATABASE ${config.database} TO ${config.user};`);
        console.log('✅ Privileges granted.');

    } catch (err) {
        console.error('❌ Error connecting to root database:', err.message);
        console.log('⚠️ Assuming database might already exist or root access failed. Proceeding to schema creation...');
    } finally {
        await rootPool.end();
    }

    // 2. Create Tables
    const pool = new Pool(config);
    try {
        console.log(`🔌 Connecting to ${config.database}...`);
        await pool.connect();

        const tables = [
            `CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        cpf_cnpj VARCHAR(20),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(2),
        zip_code VARCHAR(20),
        birth_date DATE,
        notes TEXT,
        created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
            `CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        sku VARCHAR(50),
        description TEXT,
        category VARCHAR(100),
        unit_price DECIMAL(10, 2),
        cost_price DECIMAL(10, 2),
        stock_quantity INTEGER DEFAULT 0,
        minimum_stock INTEGER DEFAULT 5,
        location VARCHAR(100),
        supplier_id INTEGER,
        active BOOLEAN DEFAULT TRUE,
        created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
            `CREATE TABLE IF NOT EXISTS sales (
        id SERIAL PRIMARY KEY,
        product_id INTEGER,
        product_name VARCHAR(255),
        quantity INTEGER,
        unit_price DECIMAL(10, 2),
        total_revenue DECIMAL(10, 2),
        customer_id INTEGER,
        customer_name VARCHAR(255),
        cost_price DECIMAL(10, 2),
        total_cost DECIMAL(10, 2),
        profit DECIMAL(10, 2),
        sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        payment_method VARCHAR(50),
        notes TEXT,
        created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
            `CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        active BOOLEAN DEFAULT TRUE,
        created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
            `CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        token TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
            `CREATE TABLE IF NOT EXISTS expenses (
         id SERIAL PRIMARY KEY,
         description TEXT NOT NULL,
         category VARCHAR(100),
         value DECIMAL(10, 2) NOT NULL,
         expense_date DATE DEFAULT CURRENT_DATE,
         payment_method VARCHAR(50),
         supplier_id INTEGER,
         created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
         updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`
            // Add other tables as needed based on server/index.js
        ];

        for (const query of tables) {
            await pool.query(query);
        }
        console.log('✅ Tables created successfully.');

    } catch (err) {
        console.error('❌ Error setting up schema:', err);
    } finally {
        await pool.end();
    }
}

setup();
