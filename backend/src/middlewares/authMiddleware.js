// backend/src/middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");

// Vérifie si l'utilisateur est connecté (JWT obligatoire)
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  // Format attendu : "Bearer token"
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Non autorisé (token manquant)" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // { id, email, role, iat, exp }
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Erreur JWT:", err);
    return res
      .status(401)
      .json({ message: "Token invalide ou expiré" });
  }
}

// Vérifie que l'utilisateur est admin
function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Accès réservé à l'administrateur" });
  }
  next();
}

// On exporte sous les bons noms
module.exports = {
  authMiddleware,
  adminOnly,
  // alias pour compat éventuelle
  isAdmin: adminOnly,
};
