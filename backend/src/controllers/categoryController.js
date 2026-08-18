// backend/src/controllers/categoryController.js
const pool = require("../db");

exports.getCategories = async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM categories ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Erreur getCategories:", err.message);
    res.status(500).json({
      message: "Erreur serveur lors du chargement des catégories.",
    });
  }
};

exports.createCategory = async (req, res) => {
  const name = String(req.body.name || "").trim();

  if (!name) {
    return res.status(400).json({
      message: "Le nom de la catégorie est obligatoire.",
    });
  }

  try {
    const existing = await pool.query(
      "SELECT 1 FROM categories WHERE LOWER(name) = LOWER($1)",
      [name]
    );
    if (existing.rowCount > 0) {
      return res.status(409).json({ message: "Cette catégorie existe déjà." });
    }

    const result = await pool.query(
      "INSERT INTO categories (name) VALUES ($1) RETURNING *",
      [name]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ message: "Cette catégorie existe déjà." });
    }
    console.error("Erreur createCategory:", err.message);
    res.status(500).json({
      message: "Erreur serveur lors de la création de la catégorie.",
    });
  }
};

exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const name = String(req.body.name || "").trim();

  if (!name) {
    return res.status(400).json({
      message: "Le nom de la catégorie est obligatoire.",
    });
  }

  try {
    const result = await pool.query(
      "UPDATE categories SET name = $1 WHERE id = $2 RETURNING *",
      [name, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Catégorie introuvable." });
    }

    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ message: "Cette catégorie existe déjà." });
    }
    console.error("Erreur updateCategory:", err.message);
    res.status(500).json({
      message: "Erreur serveur lors de la mise à jour de la catégorie.",
    });
  }
};

exports.deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const used = await pool.query(
      "SELECT 1 FROM products WHERE category_id = $1 LIMIT 1",
      [id]
    );

    if (used.rowCount > 0) {
      return res.status(409).json({
        message:
          "Impossible de supprimer : cette catégorie est utilisée par au moins un produit.",
      });
    }

    const result = await pool.query("DELETE FROM categories WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Catégorie introuvable." });
    }

    res.json({ message: "Catégorie supprimée avec succès." });
  } catch (err) {
    console.error("Erreur deleteCategory:", err.message);
    res.status(500).json({
      message: "Erreur serveur lors de la suppression de la catégorie.",
    });
  }
};
