// backend/src/controllers/orderController.js
// Unused legacy controller. Canonical order flow lives in routes/orderRoutes.js
// (transactional POST /api/orders). Kept for reference; not mounted.
const pool = require("../db");

// =========================
// CREATE ORDER (client)
// POST /orders
// =========================
exports.createOrder = async (req, res) => {
  try {
    // si tu utilises authMiddleware -> req.user existe
    const userId = req.user?.id || req.body.user_id || null;

    const { items, shipping, total } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Panier vide." });
    }
    if (!shipping) {
      return res.status(400).json({ message: "Infos livraison manquantes." });
    }
    if (total == null) {
      return res.status(400).json({ message: "Total manquant." });
    }

    // champs obligatoires shipping
    const required = [
      ["firstName", "Prénom"],
      ["lastName", "Nom"],
      ["email", "Email"],
      ["phone", "Téléphone"],
      ["address", "Adresse"],
      ["city", "Ville"],
      ["postalCode", "Code postal"],
      ["governorate", "Gouvernorat"],
    ];
    for (const [key, label] of required) {
      if (!String(shipping[key] || "").trim()) {
        return res.status(400).json({ message: `Champ obligatoire : ${label}` });
      }
    }

    // 1) insert order
    const orderRes = await pool.query(
      `
      INSERT INTO orders (
        user_id, total, status,
        customer_firstname, customer_lastname, customer_email, customer_phone,
        customer_cin, customer_birthdate,
        customer_address, customer_city, customer_postal_code, customer_governorate,
        customer_phone2, customer_instructions
      )
      VALUES (
        $1, $2, 'pending',
        $3, $4, $5, $6,
        $7, $8,
        $9, $10, $11, $12,
        $13, $14
      )
      RETURNING *
      `,
      [
        userId,
        total,

        shipping.firstName,
        shipping.lastName,
        shipping.email,
        shipping.phone,

        shipping.cin || null,
        shipping.birthDate || null,

        shipping.address,
        shipping.city,
        shipping.postalCode,
        shipping.governorate,

        shipping.phone2 || null,
        shipping.instructions || null,
      ]
    );

    const order = orderRes.rows[0];

    // 2) insert items
    for (const it of items) {
      const productId = it.product_id;
      const quantity = Number(it.quantity);
      const unitPrice = Number(it.unit_price ?? it.price);

      if (!productId || !Number.isFinite(quantity) || quantity <= 0) {
        return res.status(400).json({ message: "Item invalide (product_id/quantity)." });
      }
      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        return res.status(400).json({ message: "Prix item invalide." });
      }

      await pool.query(
        `
        INSERT INTO order_items (order_id, product_id, quantity, unit_price)
        VALUES ($1, $2, $3, $4)
        `,
        [order.id, productId, quantity, unitPrice]
      );

      // (optionnel) décrémenter stock
      await pool.query(
        `UPDATE products SET stock = GREATEST(stock - $1, 0) WHERE id = $2`,
        [quantity, productId]
      );
    }

    // 3) return order with items
    const itemsRes = await pool.query(
      `
      SELECT oi.*, p.title AS product_title
      FROM order_items oi
      LEFT JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = $1
      `,
      [order.id]
    );

    res.status(201).json({
      ...order,
      items: itemsRes.rows,
      shipping: {
        firstName: order.customer_firstname,
        lastName: order.customer_lastname,
        email: order.customer_email,
        phone: order.customer_phone,
        cin: order.customer_cin,
        birthDate: order.customer_birthdate,
        address: order.customer_address,
        city: order.customer_city,
        postalCode: order.customer_postal_code,
        governorate: order.customer_governorate,
        phone2: order.customer_phone2,
        instructions: order.customer_instructions,
      },
    });
  } catch (err) {
    console.error("Erreur createOrder:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// =========================
// GET ALL ORDERS (admin)
// GET /orders
// =========================
exports.getOrders = async (req, res) => {
  try {
    // si tu veux limiter aux admins:
    // if (req.user?.role !== "admin") return res.status(403).json({ message: "Accès refusé" });

    const ordersRes = await pool.query(
      `SELECT * FROM orders ORDER BY created_at DESC`
    );

    const orders = ordersRes.rows;
    const ids = orders.map((o) => o.id);

    let itemsMap = {};
    if (ids.length > 0) {
      const itemsRes = await pool.query(
        `
        SELECT oi.*, p.title AS product_title
        FROM order_items oi
        LEFT JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id = ANY($1::int[])
        ORDER BY oi.id ASC
        `,
        [ids]
      );

      itemsMap = itemsRes.rows.reduce((acc, row) => {
        if (!acc[row.order_id]) acc[row.order_id] = [];
        acc[row.order_id].push(row);
        return acc;
      }, {});
    }

    const out = orders.map((o) => ({
      ...o,
      items: itemsMap[o.id] || [],
      shipping: {
        firstName: o.customer_firstname,
        lastName: o.customer_lastname,
        email: o.customer_email,
        phone: o.customer_phone,
        cin: o.customer_cin,
        birthDate: o.customer_birthdate,
        address: o.customer_address,
        city: o.customer_city,
        postalCode: o.customer_postal_code,
        governorate: o.customer_governorate,
        phone2: o.customer_phone2,
        instructions: o.customer_instructions,
      },
    }));

    res.json(out);
  } catch (err) {
    console.error("Erreur getOrders:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// =========================
// UPDATE STATUS (admin)
// PATCH /orders/:id/status
// =========================
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Statut invalide." });
    }

    const result = await pool.query(
      `UPDATE orders SET status=$1 WHERE id=$2 RETURNING *`,
      [status, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Commande introuvable" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erreur updateOrderStatus:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
