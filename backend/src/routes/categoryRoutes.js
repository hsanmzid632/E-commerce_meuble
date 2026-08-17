// backend/src/routes/categoryRoutes.js
const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");

// Public : liste des catégories
router.get("/", categoryController.getCategories);

// Admin uniquement
router.post("/", authMiddleware, isAdmin, categoryController.createCategory);
router.put("/:id", authMiddleware, isAdmin, categoryController.updateCategory);
router.delete("/:id", authMiddleware, isAdmin, categoryController.deleteCategory);

module.exports = router;
