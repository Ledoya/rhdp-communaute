require("dotenv").config();
const express    = require("express");
const cors       = require("cors");
const helmet     = require("helmet");
const rateLimit  = require("express-rate-limit");

const authRoutes          = require("./src/routes/auth");
const adminRoutes         = require("./src/routes/admin");
const articlesRoutes      = require("./src/routes/articles");
const { notifRouter: notificationsRoutes, whatsappRouter: whatsappRoutes } = require("./src/routes/notifs_whatsapp");

const app = express();

// ─── SÉCURITÉ ─────────────────────────────────────────────────────────────
app.use(helmet());

app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",
      "https://rhdp-communaute.vercel.app",
      process.env.FRONTEND_URL,
    ].filter(Boolean);

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`❌ Origine CORS bloquée: ${origin}`);
      callback(new Error("CORS non autorisé"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

// ─── RATE LIMITING ────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max:      500,
  message:  { success: false, message: "Trop de requêtes, réessayez dans 15 minutes." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      20,
  message:  { success: false, message: "Trop de tentatives de connexion, réessayez dans 15 minutes." },
});

app.use(globalLimiter);
app.use("/api/auth",  authLimiter);
app.use("/api/admin/auth", authLimiter);

// ─── ROUTES ───────────────────────────────────────────────────────────────
app.use("/api/auth",          authRoutes);
app.use("/api/admin",         adminRoutes);
app.use("/api/articles",      articlesRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/whatsapp",      whatsappRoutes);

// ─── SANTÉ ────────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "API RHDP Génération Impact opérationnelle",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// ─── ROUTE INCONNUE ───────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route introuvable." });
});

// ─── ERREURS GLOBALES ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Erreur serveur :", err.message);
  res.status(500).json({ success: false, message: "Erreur interne du serveur." });
});

// ─── DÉMARRAGE ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Serveur RHDP démarré sur le port ${PORT}`);
  console.log(`🌍 Environnement : ${process.env.NODE_ENV || "development"}`);
});