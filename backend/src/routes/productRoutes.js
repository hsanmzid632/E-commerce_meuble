// backend/src/routes/productRoutes.js
const express = require("express");
const router = express.Router();

const productController = require("../controllers/productController");
const {
  authMiddleware,
  isAdmin,
  optionalAuth,
} = require("../middlewares/authMiddleware");

router.get("/", optionalAuth, productController.getProducts);
router.get("/:id", productController.getProductById);

router.post("/", authMiddleware, isAdmin, productController.createProduct);
router.put("/:id", authMiddleware, isAdmin, productController.updateProduct);
router.delete("/:id", authMiddleware, isAdmin, productController.deleteProduct);

module.exports = router;
