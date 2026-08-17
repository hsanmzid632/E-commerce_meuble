// backend/src/db.js
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Connexion
pool.connect()
  .then(() => console.log("✅ Connecté à PostgreSQL"))
  .catch((err) => console.error("❌ Erreur connexion PostgreSQL :", err));

/* -----------------------------------------
   Création automatique des tables si absentes
------------------------------------------ */
async function initializeTables() {
  try {
    // Table users
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        fullname VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(200) NOT NULL,
        role VARCHAR(20) DEFAULT 'client'
      );
    `);

    // Table categories
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL
      );
    `);

    // Table products
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        description TEXT,
        price NUMERIC(10,2) NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        image VARCHAR(500),
        category_id INTEGER REFERENCES categories(id),
        active BOOLEAN DEFAULT true
      );
    `);

        // Table orders
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
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);


        await pool.query(`
      DO $$ BEGIN
        BEGIN
          ALTER TABLE orders ADD COLUMN customer_name VARCHAR(150);
        EXCEPTION WHEN duplicate_column THEN NULL; END;
        BEGIN
          ALTER TABLE orders ADD COLUMN customer_email VARCHAR(150);
        EXCEPTION WHEN duplicate_column THEN NULL; END;
        BEGIN
          ALTER TABLE orders ADD COLUMN customer_phone VARCHAR(50);
        EXCEPTION WHEN duplicate_column THEN NULL; END;
        BEGIN
          ALTER TABLE orders ADD COLUMN customer_address TEXT;
        EXCEPTION WHEN duplicate_column THEN NULL; END;
      END $$;
    `);



    // Table order_items
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
    console.error("❌ Erreur lors de la création des tables :", err);
  }
}

// Exécuter la création des tables
initializeTables();

module.exports = pool;
