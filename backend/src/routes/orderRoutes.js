// backend/src/routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const pool = require("../db");
const { authMiddleware, adminOnly } = require("../middlewares/authMiddleware");

// ---------------------------------------------------
// POST /api/orders  → créer une commande (client)
// body: { items: [...], shipping: {...} }
// ---------------------------------------------------
router.post("/", authMiddleware, async (req, res) => {
  const client = await pool.connect();

  try {
    const { items, shipping } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Aucun article dans la commande" });
    }

    // ✅ shipping (infos client) - sécurisé
    const s = shipping || {};
    const customerName =
      (s.firstName || s.lastName)
        ? `${s.firstName || ""} ${s.lastName || ""}`.trim()
        : (s.name || null);

    await client.query("BEGIN");

    // 🔎 récupérer produits
    const ids = items.map((it) => it.product_id);
    const resultProducts = await client.query(
      "SELECT id, price, stock FROM products WHERE id = ANY($1)",
      [ids]
    );
    const products = resultProducts.rows;

    let total = 0;

    for (const item of items) {
      const p = products.find((pr) => pr.id === item.product_id);
      if (!p) throw new Error(`Produit introuvable (id=${item.product_id})`);

      const qty = Number(item.quantity);
      if (!Number.isFinite(qty) || qty <= 0) {
        throw new Error(`Quantité invalide pour le produit ${item.product_id}`);
      }

      if (qty > Number(p.stock)) {
        throw new Error(`Stock insuffisant pour le produit ${p.id}`);
      }

      total += Number(p.price) * qty;

      await client.query(
        "UPDATE products SET stock = stock - $1 WHERE id = $2",
        [qty, item.product_id]
      );
    }

    // ✅ enregistrer commande
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
        s.email || null,
        s.phone || null,
        s.address || null,
        s.city || null,
        s.postalCode || null,
        s.governorate || null,
        s.cin || null,
        s.birthDate ? s.birthDate : null, // ✅ null si vide
        s.phone2 || null,
        s.instructions || null,
      ]
    );

    const order = orderRes.rows[0];

    // ✅ items
    for (const item of items) {
      const p = products.find((pr) => pr.id === item.product_id);
      const qty = Number(item.quantity);

      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
         VALUES ($1,$2,$3,$4)`,
        [order.id, item.product_id, qty, Number(p.price)]
      );
    }

    await client.query("COMMIT");
    res.status(201).json({ message: "Commande créée", order });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("create order error:", err);
    res.status(400).json({ message: err.message || "Erreur commande" });
  } finally {
    client.release();
  }
});

// ---------------------------------------------------
// GET /api/orders/me  → commandes du client connecté
// ---------------------------------------------------
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
    console.error("orders/me error:", err);
    res.status(500).json({ message: "Erreur récupération commandes client" });
  }
});

// ---------------------------------------------------
// GET /api/orders  → liste complète (admin)
// ---------------------------------------------------
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
    console.error("admin orders error:", err);
    res.status(500).json({ message: "Erreur récupération commandes admin" });
  }
});

// ---------------------------------------------------
// PATCH /api/orders/:id/status  → changer le statut (admin)
// ---------------------------------------------------
router.patch("/:id/status", authMiddleware, adminOnly, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowed = ["pending", "processing", "shipped", "delivered", "cancelled"];
  if (!allowed.includes(status)) {
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
    console.error("update status error:", err);
    res.status(500).json({ message: "Erreur mise à jour statut" });
  }
});

module.exports = router;
