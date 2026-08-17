// backend/src/routes/productRoutes.js
const express = require("express");
const router = express.Router();

const productController = require("../controllers/productController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

// ====== Routes publiques ======
router.get("/", productController.getProducts);
router.get("/:id", productController.getProductById);

// ====== Routes admin (protégées) ======
router.post("/", authMiddleware, isAdmin, productController.createProduct);
router.put("/:id", authMiddleware, isAdmin, productController.updateProduct);

// ❌ Ancien delete : suppression physique
// router.delete("/:id", authMiddleware, isAdmin, productController.deleteProduct);

// ✅ Nouveau delete : suppression logique (désactivation)
router.delete("/:id", authMiddleware, isAdmin, productController.deleteProduct);

module.exports = router;
