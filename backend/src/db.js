// backend/src/db.js
const path = require("path");
const { Pool } = require("pg");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function addColumnIfMissing(table, column, definition) {
  await pool.query(`
    DO $$ BEGIN
      BEGIN
        ALTER TABLE ${table} ADD COLUMN ${column} ${definition};
      EXCEPTION WHEN duplicate_column THEN NULL;
      END;
    END $$;
  `);
}

async function initializeTables() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        fullname VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(200) NOT NULL,
        role VARCHAR(20) DEFAULT 'client'
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        description TEXT,
        price NUMERIC(10,2) NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        image VARCHAR(500),
        image_url VARCHAR(500),
        category_id INTEGER REFERENCES categories(id),
        active BOOLEAN DEFAULT true,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await addColumnIfMissing("products", "image_url", "VARCHAR(500)");
    await addColumnIfMissing("products", "is_active", "BOOLEAN DEFAULT true");
    await addColumnIfMissing("products", "created_at", "TIMESTAMP DEFAULT NOW()");

    await pool.query(`
      UPDATE products
      SET image_url = image
      WHERE image_url IS NULL AND image IS NOT NULL
    `);
    await pool.query(`
      UPDATE products
      SET image = image_url
      WHERE image IS NULL AND image_url IS NOT NULL
    `);
    await pool.query(`
      UPDATE products
      SET is_active = COALESCE(is_active, active, TRUE)
    `);
    await pool.query(`
      UPDATE products
      SET active = COALESCE(active, is_active, TRUE)
    `);
    await pool.query(`
      UPDATE products
      SET created_at = NOW()
      WHERE created_at IS NULL
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        total NUMERIC(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        customer_name VARCHAR(150),
        customer_email VARCHAR(150),
        customer_phone VARCHAR(50),
        customer_address TEXT,
        customer_city VARCHAR(100),
        customer_postal_code VARCHAR(20),
        customer_governorate VARCHAR(100),
        customer_cin VARCHAR(50),
        customer_birthdate DATE,
        customer_phone2 VARCHAR(50),
        customer_instructions TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await addColumnIfMissing("orders", "customer_name", "VARCHAR(150)");
    await addColumnIfMissing("orders", "customer_email", "VARCHAR(150)");
    await addColumnIfMissing("orders", "customer_phone", "VARCHAR(50)");
    await addColumnIfMissing("orders", "customer_address", "TEXT");
    await addColumnIfMissing("orders", "customer_city", "VARCHAR(100)");
    await addColumnIfMissing("orders", "customer_postal_code", "VARCHAR(20)");
    await addColumnIfMissing("orders", "customer_governorate", "VARCHAR(100)");
    await addColumnIfMissing("orders", "customer_cin", "VARCHAR(50)");
    await addColumnIfMissing("orders", "customer_birthdate", "DATE");
    await addColumnIfMissing("orders", "customer_phone2", "VARCHAR(50)");
    await addColumnIfMissing("orders", "customer_instructions", "TEXT");
    await addColumnIfMissing("orders", "created_at", "TIMESTAMP DEFAULT NOW()");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL,
        unit_price NUMERIC(10,2) NOT NULL
      );
    `);

    console.log("📦 Tables PostgreSQL vérifiées/créées avec succès.");
  } catch (err) {
    console.error("❌ Erreur lors de la création des tables :", err.message);
    throw err;
  }
}

pool.ready = pool
  .query("SELECT 1")
  .then(() => {
    console.log("✅ Connecté à PostgreSQL");
    return initializeTables();
  })
  .catch((err) => {
    console.error("❌ Erreur connexion PostgreSQL :", err.message);
    throw err;
  });

module.exports = pool;
