require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on("connect", () => {
  console.log("✅ Connexion PostgreSQL établie");
});

pool.on("error", (err) => {
  console.error("❌ Erreur PostgreSQL :", err.message);
});

module.exports = pool;