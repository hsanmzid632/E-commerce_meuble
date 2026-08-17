// backend/src/controllers/userController.js
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { fullname, email, password } = req.body;

    const userExists = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "Email déjà utilisé" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      "INSERT INTO users (fullname, email, password) VALUES ($1,$2,$3) RETURNING *",
      [fullname, email, hashed]
    );

    res.json({ message: "Compte créé avec succès", user: newUser.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// backend/src/controllers/userController.js
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Email introuvable" });
    }

    const user = result.rows[0];

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(400).json({ message: "Mot de passe incorrect" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET || "supersecret123",
      { expiresIn: "7d" }
    );

    // On renvoie les infos utiles pour le frontend
    res.json({
      message: "Connexion réussie",
      token,
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
