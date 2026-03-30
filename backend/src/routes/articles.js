const express  = require("express");
const supabase = require("../config/db");
const authMw   = require("../middleware/auth");
const adminMw  = require("../middleware/adminAuth");

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────
// GET /api/articles — Articles publiés (membres connectés)
// ─────────────────────────────────────────────────────────────────────────
router.get("/", authMw, async (req, res) => {
  try {
    const { page = 1, limit = 10, category = "" } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from("articles")
      .select("id, title, content, image_url, category, created_at", { count: "exact" })
      .eq("is_published", true);

    if (category) {
      query = query.eq("category", category);
    }

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (error) throw error;

    return res.json({
      success:    true,
      articles:   data,
      total:      count || 0,
      page:       parseInt(page),
      totalPages: Math.ceil((count || 0) / limit),
    });

  } catch (err) {
    console.error("Erreur articles :", err.message);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

// ─────────────────────────────────────────────────────────────────────────
// GET /api/articles/admin/all — Tous les articles (admin)
// ─────────────────────────────────────────────────────────────────────────
router.get("/admin/all", adminMw, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.json({ success: true, articles: data });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

// ─────────────────────────────────────────────────────────────────────────
// GET /api/articles/:id — Détail d'un article
// ─────────────────────────────────────────────────────────────────────────
router.get("/:id", authMw, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("id", req.params.id)
      .eq("is_published", true)
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, message: "Article introuvable." });
    }

    return res.json({ success: true, article: data });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

// ─────────────────────────────────────────────────────────────────────────
// POST /api/articles — Créer un article (admin)
// ─────────────────────────────────────────────────────────────────────────
router.post("/", adminMw, async (req, res) => {
  try {
    const { title, content, image_url, category = "general", is_published = false } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: "Titre et contenu requis." });
    }

    const { data, error } = await supabase
      .from("articles")
      .insert({ title, content, image_url: image_url || null, category, is_published, admin_id: req.admin.id })
      .select("id, title, created_at")
      .single();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: is_published ? "Article publié avec succès." : "Article sauvegardé en brouillon.",
      article: data,
    });

  } catch (err) {
    console.error("Erreur création article :", err.message);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

// ─────────────────────────────────────────────────────────────────────────
// PUT /api/articles/:id — Modifier un article (admin)
// ─────────────────────────────────────────────────────────────────────────
router.put("/:id", adminMw, async (req, res) => {
  try {
    const { title, content, image_url, category, is_published } = req.body;

    const { error } = await supabase
      .from("articles")
      .update({ title, content, image_url, category, is_published })
      .eq("id", req.params.id);

    if (error) throw error;

    return res.json({ success: true, message: "Article mis à jour." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

// ─────────────────────────────────────────────────────────────────────────
// DELETE /api/articles/:id — Supprimer (admin)
// ─────────────────────────────────────────────────────────────────────────
router.delete("/:id", adminMw, async (req, res) => {
  try {
    const { error } = await supabase
      .from("articles")
      .delete()
      .eq("id", req.params.id);

    if (error) throw error;

    return res.json({ success: true, message: "Article supprimé." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

module.exports = router;
