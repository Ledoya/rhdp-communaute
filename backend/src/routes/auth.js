const express  = require("express");
const bcrypt   = require("bcryptjs");
const jwt      = require("jsonwebtoken");
const supabase = require("../config/db");
const authMw   = require("../middleware/auth");

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────
// POST /api/auth/register — Inscription membre
// ─────────────────────────────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const {
      nom, prenoms, date_naissance, lieu_naissance,
      ville, commune, quartier, phone, email, password,
      est_etudiant,
      filiere, niveau, etablissement,
      situation,
      est_militant, matricule_militant,
    } = req.body;

    if (!nom || !prenoms || !date_naissance || !lieu_naissance ||
        !ville || !commune || !quartier || !phone || !email || !password) {
      return res.status(400).json({ success: false, message: "Tous les champs obligatoires doivent être remplis." });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Le mot de passe doit contenir au moins 6 caractères." });
    }

    if (est_etudiant === true || est_etudiant === "true") {
      if (!filiere || !niveau || !etablissement) {
        return res.status(400).json({ success: false, message: "Filière, niveau et établissement sont requis pour les étudiants." });
      }
    } else {
      if (!situation) {
        return res.status(400).json({ success: false, message: "Veuillez préciser votre situation professionnelle." });
      }
    }

    if ((est_militant === true || est_militant === "true") && !matricule_militant) {
      return res.status(400).json({ success: false, message: "Le matricule militant est requis." });
    }

    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();

    if (existing) {
      return res.status(409).json({ success: false, message: "Cette adresse email est déjà utilisée." });
    }

    const password_hash = await bcrypt.hash(password, 12);

    const { data: user, error } = await supabase
      .from("users")
      .insert({
        nom: nom.trim(),
        prenoms: prenoms.trim(),
        date_naissance,
        lieu_naissance: lieu_naissance.trim(),
        ville: ville.trim(),
        commune: commune.trim(),
        quartier: quartier.trim(),
        phone: phone.trim(),
        email: email.toLowerCase().trim(),
        password_hash,
        est_etudiant: est_etudiant || false,
        filiere: filiere || null,
        niveau: niveau || null,
        etablissement: etablissement || null,
        situation: situation || null,
        est_militant: est_militant || false,
        matricule_militant: matricule_militant || null,
      })
      .select("id, nom, prenoms, email, est_militant, created_at")
      .single();

    if (error) throw error;

    const token = jwt.sign(
      { id: user.id, email: user.email, nom: user.nom },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );

    const { data: links } = await supabase
      .from("whatsapp_links")
      .select("label, description, url, type, icon")
      .eq("is_active", true)
      .order("ordre", { ascending: true });

    return res.status(201).json({
      success: true,
      message: "Inscription réussie ! Bienvenue dans la Communauté Génération Impact.",
      token,
      user: {
        id:           user.id,
        nom:          user.nom,
        prenoms:      user.prenoms,
        email:        user.email,
        est_militant: user.est_militant,
      },
      whatsapp_links: links || [],
    });

  } catch (err) {
    console.error("Erreur inscription :", err.message);
    return res.status(500).json({ success: false, message: "Erreur lors de l'inscription." });
  }
});

// ─────────────────────────────────────────────────────────────────────────
// POST /api/auth/login — Connexion membre
// ─────────────────────────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email et mot de passe requis." });
    }

    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .eq("is_active", true)
      .single();

    if (!user) {
      return res.status(401).json({ success: false, message: "Email ou mot de passe incorrect." });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Email ou mot de passe incorrect." });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, nom: user.nom },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );

    return res.json({
      success: true,
      message: "Connexion réussie.",
      token,
      user: {
        id:           user.id,
        nom:          user.nom,
        prenoms:      user.prenoms,
        email:        user.email,
        ville:        user.ville,
        commune:      user.commune,
        est_militant: user.est_militant,
        avatar_url:   user.avatar_url,
      },
    });

  } catch (err) {
    console.error("Erreur login :", err.message);
    return res.status(500).json({ success: false, message: "Erreur lors de la connexion." });
  }
});

// ─────────────────────────────────────────────────────────────────────────
// GET /api/auth/me — Profil du membre connecté
// ─────────────────────────────────────────────────────────────────────────
router.get("/me", authMw, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("id, nom, prenoms, email, date_naissance, lieu_naissance, ville, commune, quartier, phone, est_etudiant, filiere, niveau, etablissement, situation, est_militant, matricule_militant, avatar_url, is_active, created_at")
      .eq("id", req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ success: false, message: "Utilisateur introuvable." });
    }

    return res.json({ success: true, user });

  } catch (err) {
    console.error("Erreur profil :", err.message);
    return res.status(500).json({ success: false, message: "Erreur lors de la récupération du profil." });
  }
});

// ─────────────────────────────────────────────────────────────────────────
// PUT /api/auth/profile — Modifier son profil
// ─────────────────────────────────────────────────────────────────────────
router.put("/profile", authMw, async (req, res) => {
  try {
    const { ville, commune, quartier, phone, avatar_url } = req.body;

    const { error } = await supabase
      .from("users")
      .update({ ville, commune, quartier, phone, avatar_url })
      .eq("id", req.user.id);

    if (error) throw error;

    return res.json({ success: true, message: "Profil mis à jour avec succès." });

  } catch (err) {
    console.error("Erreur mise à jour profil :", err.message);
    return res.status(500).json({ success: false, message: "Erreur lors de la mise à jour." });
  }
});

// ─────────────────────────────────────────────────────────────────────────
// PUT /api/auth/change-password — Changer mot de passe
// ─────────────────────────────────────────────────────────────────────────
router.put("/change-password", authMw, async (req, res) => {
  try {
    const { old_password, new_password } = req.body;

    if (!old_password || !new_password) {
      return res.status(400).json({ success: false, message: "Ancien et nouveau mot de passe requis." });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ success: false, message: "Le nouveau mot de passe doit contenir au moins 6 caractères." });
    }

    const { data: user } = await supabase
      .from("users")
      .select("password_hash")
      .eq("id", req.user.id)
      .single();

    const isMatch = await bcrypt.compare(old_password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Ancien mot de passe incorrect." });
    }

    const newHash = await bcrypt.hash(new_password, 12);

    const { error } = await supabase
      .from("users")
      .update({ password_hash: newHash })
      .eq("id", req.user.id);

    if (error) throw error;

    return res.json({ success: true, message: "Mot de passe changé avec succès." });

  } catch (err) {
    console.error("Erreur changement mot de passe :", err.message);
    return res.status(500).json({ success: false, message: "Erreur lors du changement de mot de passe." });
  }
});

// ─────────────────────────────────────────────────────────────────────────
// PUT /api/auth/complete-profile — Compléter le profil après inscription
// ─────────────────────────────────────────────────────────────────────────
router.put("/complete-profile", authMw, async (req, res) => {
  try {
    const {
      motivations,
      centres_interet,
      talents,
      talent_autre,
      idee_pays,
      ce_qui_enerve,
    } = req.body;

    if (!motivations?.length || !centres_interet?.length || !talents?.length) {
      return res.status(400).json({
        success: false,
        message: "Motivations, centres d'intérêt et talents sont requis.",
      });
    }

    await pool.query(
      `UPDATE users SET
        motivations      = $1,
        centres_interet  = $2,
        talents          = $3,
        talent_autre     = $4,
        idee_pays        = $5,
        ce_qui_enerve    = $6,
        profil_complete  = true
       WHERE id = $7`,
      [
        motivations,
        centres_interet,
        talents,
        talent_autre || null,
        idee_pays    || null,
        ce_qui_enerve || null,
        req.user.id,
      ]
    );

    return res.json({
      success: true,
      message: "Profil complété avec succès !",
    });

  } catch (err) {
    console.error("Erreur complete-profile :", err.message);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

module.exports = router;
