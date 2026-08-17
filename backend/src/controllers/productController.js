// backend/src/controllers/productController.js
const pool = require("../db");

// ================== CREATE ==================
exports.createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      stock,
      image_url,
      category_id,
      is_active,
    } = req.body;

    if (!title || price == null) {
      return res
        .status(400)
        .json({ message: "Titre et prix sont obligatoires" });
    }

    const result = await pool.query(
      `INSERT INTO products 
       (title, description, price, stock, image_url, category_id, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [
        title,
        description || "",
        price,
        stock || 0,
        image_url || null,
        category_id || null,
        is_active ?? true,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erreur createProduct:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ================== READ (LIST) ==================
exports.getProducts = async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.is_active = TRUE
       ORDER BY p.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Erreur getProducts:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ================== READ (ONE) ==================
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT p.*, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Produit introuvable" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erreur getProductById:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ================== UPDATE ==================
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      price,
      stock,
      image_url,
      category_id,
      is_active,
    } = req.body;

    const result = await pool.query(
      `UPDATE products 
       SET title=$1,
           description=$2,
           price=$3,
           stock=$4,
           image_url=$5,
           category_id=$6,
           is_active=$7
       WHERE id=$8
       RETURNING *`,
      [
        title,
        description ?? "",
        price,
        stock ?? 0,
        image_url ?? null,
        category_id ?? null,
        is_active ?? true,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Produit introuvable" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erreur updateProduct:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ================== DELETE (SOFT DELETE) ==================
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "UPDATE products SET is_active = FALSE WHERE id=$1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Produit introuvable" });
    }

    res.json({ message: "Produit désactivé avec succès" });
  } catch (err) {
    console.error("Erreur deleteProduct:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
