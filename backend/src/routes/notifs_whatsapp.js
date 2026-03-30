const express  = require("express");
const supabase = require("../config/db");
const authMw   = require("../middleware/auth");
const adminMw  = require("../middleware/adminAuth");

const notifRouter    = express.Router();
const whatsappRouter = express.Router();

// ═════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ═════════════════════════════════════════════════════════════════════════

// GET /api/notifications — Notifications du membre connecté
notifRouter.get("/", authMw, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .or(`is_global.eq.true,user_id.eq.${req.user.id}`)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;

    return res.json({ success: true, notifications: data });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

// PUT /api/notifications/:id/read — Marquer comme lu
notifRouter.put("/:id/read", authMw, async (req, res) => {
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", req.params.id)
      .eq("user_id", req.user.id);

    if (error) throw error;

    return res.json({ success: true, message: "Notification marquée comme lue." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

// POST /api/notifications — Envoyer une notification (admin)
notifRouter.post("/", adminMw, async (req, res) => {
  try {
    const { title, message, type = "info", is_global = true, user_id = null } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: "Titre et message requis." });
    }

    const { error } = await supabase
      .from("notifications")
      .insert({ title, message, type, is_global, user_id });

    if (error) throw error;

    return res.status(201).json({ success: true, message: "Notification envoyée." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

// ═════════════════════════════════════════════════════════════════════════
// LIENS WHATSAPP
// ═════════════════════════════════════════════════════════════════════════

// GET /api/whatsapp — Liens actifs (membres connectés)
whatsappRouter.get("/", authMw, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("whatsapp_links")
      .select("*")
      .eq("is_active", true)
      .order("ordre", { ascending: true });

    if (error) throw error;

    return res.json({ success: true, links: data });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

// GET /api/whatsapp/all — Tous les liens (admin)
whatsappRouter.get("/all", adminMw, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("whatsapp_links")
      .select("*")
      .order("ordre", { ascending: true });

    if (error) throw error;

    return res.json({ success: true, links: data });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

// POST /api/whatsapp — Ajouter un lien (admin)
whatsappRouter.post("/", adminMw, async (req, res) => {
  try {
    const { label, description, url, type = "groupe", icon = "💬", ordre = 0 } = req.body;

    if (!label || !url) {
      return res.status(400).json({ success: false, message: "Label et URL requis." });
    }

    const { error } = await supabase
      .from("whatsapp_links")
      .insert({ label, description: description || null, url, type, icon, ordre });

    if (error) throw error;

    return res.status(201).json({ success: true, message: "Lien ajouté avec succès." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

// PUT /api/whatsapp/:id — Modifier un lien (admin)
whatsappRouter.put("/:id", adminMw, async (req, res) => {
  try {
    const { label, description, url, type, icon, is_active, ordre } = req.body;

    const { error } = await supabase
      .from("whatsapp_links")
      .update({ label, description, url, type, icon, is_active, ordre })
      .eq("id", req.params.id);

    if (error) throw error;

    return res.json({ success: true, message: "Lien mis à jour." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

// DELETE /api/whatsapp/:id — Supprimer un lien (admin)
whatsappRouter.delete("/:id", adminMw, async (req, res) => {
  try {
    const { error } = await supabase
      .from("whatsapp_links")
      .delete()
      .eq("id", req.params.id);

    if (error) throw error;

    return res.json({ success: true, message: "Lien supprimé." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

module.exports = { notifRouter, whatsappRouter };
