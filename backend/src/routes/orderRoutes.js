// backend/src/routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const pool = require("../db");
const { authMiddleware, adminOnly } = require("../middlewares/authMiddleware");

const REQUIRED_SHIPPING = [
  ["firstName", "Prénom"],
  ["lastName", "Nom"],
  ["email", "Email"],
  ["phone", "Téléphone"],
  ["address", "Adresse"],
  ["city", "Ville"],
  ["postalCode", "Code postal"],
  ["governorate", "Gouvernorat"],
];

const ALLOWED_STATUS = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

router.post("/", authMiddleware, async (req, res) => {
  const client = await pool.connect();
  let started = false;

  try {
    const { items, shipping } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Aucun article dans la commande" });
    }

    const s = shipping || {};
    for (const [key, label] of REQUIRED_SHIPPING) {
      if (!String(s[key] || "").trim()) {
        return res.status(400).json({ message: `Champ obligatoire : ${label}` });
      }
    }

    const customerName = `${String(s.firstName).trim()} ${String(s.lastName).trim()}`.trim();

    await client.query("BEGIN");
    started = true;

    const ids = [...new Set(items.map((it) => Number(it.product_id)))];
    const resultProducts = await client.query(
      "SELECT id, price, stock, is_active FROM products WHERE id = ANY($1)",
      [ids]
    );
    const products = resultProducts.rows;

    let total = 0;

    for (const item of items) {
      const productId = Number(item.product_id);
      const p = products.find((pr) => pr.id === productId);
      if (!p) {
        const error = new Error("NOT_FOUND");
        error.status = 404;
        error.publicMessage = `Produit introuvable (id=${item.product_id})`;
        throw error;
      }

      if (p.is_active === false) {
        const error = new Error("INACTIVE");
        error.status = 409;
        error.publicMessage = `Le produit ${p.id} n'est plus disponible`;
        throw error;
      }

      const qty = Number(item.quantity);
      if (!Number.isInteger(qty) || qty <= 0) {
        const error = new Error("QTY");
        error.status = 400;
        error.publicMessage = `Quantité invalide pour le produit ${item.product_id}`;
        throw error;
      }

      const stockUpdate = await client.query(
        "UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1 RETURNING id",
        [qty, productId]
      );

      if (stockUpdate.rowCount === 0) {
        const error = new Error("STOCK");
        error.status = 409;
        error.publicMessage = `Stock insuffisant pour le produit ${p.id}`;
        throw error;
      }

      total += Number(p.price) * qty;
    }

    const orderRes = await client.query(
      `INSERT INTO orders
        (user_id, total, status,
         customer_name, customer_email, customer_phone, customer_address,
         customer_city, customer_postal_code, customer_governorate,
         customer_cin, customer_birthdate, customer_phone2, customer_instructions)
       VALUES
        ($1,$2,$3,
         $4,$5,$6,$7,
         $8,$9,$10,
         $11,$12,$13,$14)
       RETURNING *`,
      [
        req.user.id,
        total.toFixed(2),
        "pending",
        customerName,
        String(s.email).trim(),
        String(s.phone).trim(),
        String(s.address).trim(),
        String(s.city).trim(),
        String(s.postalCode).trim(),
        String(s.governorate).trim(),
        s.cin || null,
        s.birthDate ? s.birthDate : null,
        s.phone2 || null,
        s.instructions || null,
      ]
    );

    const order = orderRes.rows[0];

    for (const item of items) {
      const productId = Number(item.product_id);
      const p = products.find((pr) => pr.id === productId);
      const qty = Number(item.quantity);

      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
         VALUES ($1,$2,$3,$4)`,
        [order.id, productId, qty, Number(p.price)]
      );
    }

    await client.query("COMMIT");
    started = false;
    res.status(201).json({ message: "Commande créée", order });
  } catch (err) {
    if (started) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackErr) {
        console.error("rollback error:", rollbackErr.message);
      }
    }
    console.error("create order error:", err.message);
    const status = err.status || 500;
    const message =
      err.publicMessage ||
      (status === 500 ? "Erreur commande" : err.message);
    res.status(status).json({ message });
  } finally {
    client.release();
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        o.*,
        COALESCE(
          json_agg(
            json_build_object(
              'product_id', oi.product_id,
              'quantity', oi.quantity,
              'unit_price', oi.unit_price,
              'product_title', p.title
            )
            ORDER BY oi.id
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'::json
        ) AS items
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN products p ON p.id = oi.product_id
      WHERE o.user_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC
      `,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("orders/me error:", err.message);
    res.status(500).json({ message: "Erreur récupération commandes client" });
  }
});

router.get("/", authMiddleware, adminOnly, async (_req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        o.*,
        u.fullname,
        u.email,
        COALESCE(
          json_agg(
            json_build_object(
              'product_id', oi.product_id,
              'quantity', oi.quantity,
              'unit_price', oi.unit_price,
              'product_title', p.title
            )
            ORDER BY oi.id
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'::json
        ) AS items
      FROM orders o
      JOIN users u ON u.id = o.user_id
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN products p ON p.id = oi.product_id
      GROUP BY o.id, u.fullname, u.email
      ORDER BY o.created_at DESC
      `
    );

    res.json(result.rows);
  } catch (err) {
    console.error("admin orders error:", err.message);
    res.status(500).json({ message: "Erreur récupération commandes admin" });
  }
});

router.patch("/:id/status", authMiddleware, adminOnly, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!ALLOWED_STATUS.includes(status)) {
    return res.status(400).json({ message: "Statut invalide" });
  }

  try {
    const result = await pool.query(
      "UPDATE orders SET status=$1 WHERE id=$2 RETURNING *",
      [status, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Commande introuvable" });
    }

    res.json({ message: "Statut mis à jour", order: result.rows[0] });
  } catch (err) {
    console.error("update status error:", err.message);
    res.status(500).json({ message: "Erreur mise à jour statut" });
  }
});

module.exports = router;
