// backend/src/controllers/userController.js
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function publicUser(user) {
  return {
    id: user.id,
    fullname: user.fullname,
    email: user.email,
    role: user.role,
  };
}

exports.register = async (req, res) => {
  try {
    const fullname = String(req.body.fullname || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!fullname || !email || !password) {
      return res.status(400).json({
        message: "Nom, email et mot de passe sont obligatoires",
      });
    }

    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ message: "Email invalide" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Le mot de passe doit contenir au moins 6 caractères",
      });
    }

    const userExists = await pool.query(
      "SELECT id FROM users WHERE LOWER(email)=LOWER($1)",
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(409).json({ message: "Email déjà utilisé" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      `INSERT INTO users (fullname, email, password)
       VALUES ($1,$2,$3)
       RETURNING id, fullname, email, role`,
      [fullname, email, hashed]
    );

    res.status(201).json({
      message: "Compte créé avec succès",
      user: publicUser(newUser.rows[0]),
    });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ message: "Email déjà utilisé" });
    }
    console.error("Erreur register:", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.login = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe sont obligatoires" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET manquant");
      return res.status(500).json({ message: "Erreur serveur" });
    }

    const result = await pool.query(
      "SELECT * FROM users WHERE LOWER(email)=LOWER($1)",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Connexion réussie",
      token,
      user: publicUser(user),
    });
  } catch (err) {
    console.error("Erreur login:", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
