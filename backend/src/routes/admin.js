const express  = require("express");
const bcrypt   = require("bcryptjs");
const jwt      = require("jsonwebtoken");
const supabase = require("../config/db");
const adminMw  = require("../middleware/adminAuth");

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────
// POST /api/admin/auth/login — Connexion admin
// ─────────────────────────────────────────────────────────────────────────
router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email et mot de passe requis." });
    }

    const { data: admin } = await supabase
      .from("admins")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .eq("is_active", true)
      .single();

    if (!admin) {
      return res.status(401).json({ success: false, message: "Identifiants incorrects." });
    }

    const isMatch = await bcrypt.compare(password, admin.password_hash);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Identifiants incorrects." });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role, isAdmin: true },
      process.env.JWT_ADMIN_SECRET,
      { expiresIn: process.env.JWT_ADMIN_EXPIRE || "12h" }
    );

    return res.json({
      success: true,
      message: "Connexion admin réussie.",
      token,
      admin: { id: admin.id, fullname: admin.fullname, email: admin.email, role: admin.role },
    });

  } catch (err) {
    console.error("Erreur login admin :", err.message);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

// ─────────────────────────────────────────────────────────────────────────
// GET /api/admin/stats — Statistiques
// ─────────────────────────────────────────────────────────────────────────
router.get("/stats", adminMw, async (req, res) => {
  try {
    const since7days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [
      { count: total },
      { count: militants },
      { count: etudiants },
      { count: nouveaux },
      { data: villeData },
      { data: communeData },
    ] = await Promise.all([
      supabase.from("users").select("*", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("users").select("*", { count: "exact", head: true }).eq("est_militant", true),
      supabase.from("users").select("*", { count: "exact", head: true }).eq("est_etudiant", true),
      supabase.from("users").select("*", { count: "exact", head: true }).gte("created_at", since7days),
      supabase.from("users").select("ville").eq("is_active", true),
      supabase.from("users").select("commune").eq("is_active", true),
    ]);

    const groupBy = (arr, key) =>
      Object.entries(arr.reduce((acc, row) => {
        const v = row[key] || "Inconnu";
        acc[v] = (acc[v] || 0) + 1;
        return acc;
      }, {}))
        .map(([k, total]) => ({ [key]: k, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);

    return res.json({
      success: true,
      stats: {
        total_membres:   total || 0,
        total_militants: militants || 0,
        total_etudiants: etudiants || 0,
        nouveaux_7jours: nouveaux || 0,
        par_ville:       groupBy(villeData || [], "ville"),
        par_commune:     groupBy(communeData || [], "commune"),
      },
    });

  } catch (err) {
    console.error("Erreur stats :", err.message);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

// ─────────────────────────────────────────────────────────────────────────
// GET /api/admin/members — Liste des membres
// ─────────────────────────────────────────────────────────────────────────
router.get("/members", adminMw, async (req, res) => {
  try {
    const { page = 1, limit = 50, search = "", commune = "", est_militant = "" } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from("users")
      .select(
        "id, nom, prenoms, email, phone, ville, commune, quartier, est_etudiant, situation, est_militant, matricule_militant, is_active, created_at",
        { count: "exact" }
      );

    if (search) {
      query = query.or(`nom.ilike.%${search}%,prenoms.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    }
    if (commune) {
      query = query.eq("commune", commune);
    }
    if (est_militant !== "") {
      query = query.eq("est_militant", est_militant === "true");
    }

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (error) throw error;

    return res.json({
      success:    true,
      members:    data,
      total:      count || 0,
      page:       parseInt(page),
      totalPages: Math.ceil((count || 0) / limit),
    });

  } catch (err) {
    console.error("Erreur membres :", err.message);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

// ─────────────────────────────────────────────────────────────────────────
// GET /api/admin/members/export — Export CSV
// ─────────────────────────────────────────────────────────────────────────
router.get("/members/export", adminMw, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("nom, prenoms, email, phone, date_naissance, lieu_naissance, ville, commune, quartier, est_etudiant, filiere, niveau, etablissement, situation, est_militant, matricule_militant, created_at")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const headers = [
      "Nom","Prénoms","Email","Téléphone","Date naissance","Lieu naissance",
      "Ville","Commune","Quartier",
      "Étudiant","Filière","Niveau","Établissement",
      "Situation","Militant","Matricule militant","Inscrit le",
    ];

    const rows = data.map(u => [
      u.nom, u.prenoms, u.email, u.phone,
      u.date_naissance, u.lieu_naissance,
      u.ville, u.commune, u.quartier,
      u.est_etudiant ? "Oui" : "Non",
      u.filiere || "", u.niveau || "", u.etablissement || "",
      u.situation || "",
      u.est_militant ? "Oui" : "Non",
      u.matricule_militant || "",
      new Date(u.created_at).toLocaleDateString("fr-FR"),
    ]);

    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="membres_rhdp_${new Date().toISOString().slice(0,10)}.csv"`);
    return res.send("\uFEFF" + csv);

  } catch (err) {
    console.error("Erreur export :", err.message);
    return res.status(500).json({ success: false, message: "Erreur lors de l'export." });
  }
});

// ─────────────────────────────────────────────────────────────────────────
// PUT /api/admin/members/:id/toggle — Activer/désactiver un membre
// ─────────────────────────────────────────────────────────────────────────
router.put("/members/:id/toggle", adminMw, async (req, res) => {
  try {
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("is_active")
      .eq("id", req.params.id)
      .single();

    if (fetchError || !user) throw fetchError || new Error("Utilisateur introuvable.");

    const { error } = await supabase
      .from("users")
      .update({ is_active: !user.is_active })
      .eq("id", req.params.id);

    if (error) throw error;

    const state = !user.is_active ? "activé" : "désactivé";
    return res.json({ success: true, message: `Membre ${state} avec succès.` });

  } catch (err) {
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

// ─────────────────────────────────────────────────────────────────────────
// POST /api/admin/create — Créer un nouvel admin (super_admin seulement)
// ─────────────────────────────────────────────────────────────────────────
router.post("/create", adminMw, async (req, res) => {
  try {
    if (req.admin.role !== "super_admin") {
      return res.status(403).json({ success: false, message: "Seul le super admin peut créer des admins." });
    }

    const { fullname, email, password, role = "admin" } = req.body;

    if (!fullname || !email || !password) {
      return res.status(400).json({ success: false, message: "Tous les champs sont requis." });
    }

    const { data: existing } = await supabase
      .from("admins")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();

    if (existing) {
      return res.status(409).json({ success: false, message: "Cet email est déjà utilisé." });
    }

    const password_hash = await bcrypt.hash(password, 12);

    const { error } = await supabase
      .from("admins")
      .insert({ fullname, email: email.toLowerCase(), password_hash, role });

    if (error) throw error;

    return res.status(201).json({ success: true, message: "Administrateur créé avec succès." });

  } catch (err) {
    console.error("Erreur création admin :", err.message);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

module.exports = router;
