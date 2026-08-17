// backend/src/server.js
require("dotenv").config();
const app = require("./app");

app.use("/orders", require("./routes/orderRoutes"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Serveur backend démarré sur le port ${PORT}`);
});
