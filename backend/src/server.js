// backend/src/server.js
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const app = require("./app");
const pool = require("./db");

const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET manquant dans les variables d'environnement");
  process.exit(1);
}

pool.ready
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Serveur backend démarré sur le port ${PORT}`);
    });
  })
  .catch(() => {
    console.error("❌ Impossible de démarrer : base de données indisponible");
    process.exit(1);
  });
