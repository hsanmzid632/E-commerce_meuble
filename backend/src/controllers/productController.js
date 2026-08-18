// backend/src/controllers/productController.js
const pool = require("../db");

function parseProductPayload(body) {
  const title = String(body.title || "").trim();
  const description = body.description == null ? "" : String(body.description);
  const price = Number(body.price);
  const stock = body.stock == null || body.stock === "" ? 0 : Number(body.stock);
  const imageUrl = body.image_url ? String(body.image_url).trim() : null;
  const categoryId =
    body.category_id === "" || body.category_id == null
      ? null
      : Number(body.category_id);
  const isActive = body.is_active ?? true;

  if (!title || !Number.isFinite(price)) {
    return { error: "Titre et prix sont obligatoires" };
  }
  if (price < 0) {
    return { error: "Le prix ne peut pas être négatif" };
  }
  if (!Number.isFinite(stock) || stock < 0 || !Number.isInteger(stock)) {
    return { error: "Le stock doit être un entier positif ou nul" };
  }
  if (categoryId != null && (!Number.isInteger(categoryId) || categoryId <= 0)) {
    return { error: "Catégorie invalide" };
  }

  return {
    title,
    description,
    price,
    stock,
    imageUrl,
    categoryId,
    isActive: Boolean(isActive),
  };
}

exports.createProduct = async (req, res) => {
  try {
    const parsed = parseProductPayload(req.body);
    if (parsed.error) {
      return res.status(400).json({ message: parsed.error });
    }

    const result = await pool.query(
      `INSERT INTO products
       (title, description, price, stock, image, image_url, category_id, active, is_active)
       VALUES ($1,$2,$3,$4,$5,$5,$6,$7,$7)
       RETURNING *`,
      [
        parsed.title,
        parsed.description,
        parsed.price,
        parsed.stock,
        parsed.imageUrl,
        parsed.categoryId,
        parsed.isActive,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23503") {
      return res.status(400).json({ message: "Catégorie introuvable" });
    }
    console.error("Erreur createProduct:", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const includeInactive = req.user?.role === "admin";
    const result = await pool.query(
      `SELECT p.*, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ${includeInactive ? "" : "WHERE p.is_active = TRUE"}
       ORDER BY p.created_at DESC NULLS LAST, p.id DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Erreur getProducts:", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!/^\d+$/.test(String(id))) {
      return res.status(400).json({ message: "Identifiant invalide" });
    }

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
    console.error("Erreur getProductById:", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!/^\d+$/.test(String(id))) {
      return res.status(400).json({ message: "Identifiant invalide" });
    }
    const parsed = parseProductPayload(req.body);
    if (parsed.error) {
      return res.status(400).json({ message: parsed.error });
    }

    const result = await pool.query(
      `UPDATE products
       SET title=$1,
           description=$2,
           price=$3,
           stock=$4,
           image=$5,
           image_url=$5,
           category_id=$6,
           active=$7,
           is_active=$7
       WHERE id=$8
       RETURNING *`,
      [
        parsed.title,
        parsed.description,
        parsed.price,
        parsed.stock,
        parsed.imageUrl,
        parsed.categoryId,
        parsed.isActive,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Produit introuvable" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === "23503") {
      return res.status(400).json({ message: "Catégorie introuvable" });
    }
    console.error("Erreur updateProduct:", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!/^\d+$/.test(String(id))) {
      return res.status(400).json({ message: "Identifiant invalide" });
    }

    const result = await pool.query(
      "UPDATE products SET is_active = FALSE, active = FALSE WHERE id=$1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Produit introuvable" });
    }

    res.json({ message: "Produit désactivé avec succès" });
  } catch (err) {
    console.error("Erreur deleteProduct:", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
