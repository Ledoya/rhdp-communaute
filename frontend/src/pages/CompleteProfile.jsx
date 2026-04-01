import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const MOTIVATIONS = [
  { v: "influencer",   l: "🎯 Influencer l'avenir" },
  { v: "opportunites", l: "🚀 Opportunités"         },
  { v: "engagement",   l: "💪 Engagement"           },
  { v: "communaute",   l: "🤝 Communauté"           },
];

const CENTRES = [
  { v: "entrepreneuriat", l: "💼 Entrepreneuriat"    },
  { v: "politique",       l: "🏛️ Politique"          },
  { v: "culture",         l: "🎵 Culture / Musique"  },
  { v: "sport",           l: "⚽ Sport"              },
  { v: "digital",         l: "💻 Digital / Innovation"},
];

const TALENTS = [
  "Communication",
  "Organisation",
  "Design",
  "Prise de parole",
  "Autre",
];

const STEPS = ["Motivation", "Intérêts", "Talents", "Expression"];

export default function CompleteProfile() {
  const navigate     = useNavigate();
  const { updateUser } = useAuth();

  const [step,    setStep]    = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});

  const [form, setForm] = useState({
    motivations:     [],
    centres_interet: [],
    talents:         [],
    talent_autre:    "",
    idee_pays:       "",
    ce_qui_enerve:   "",
  });

  const toggleItem = (key, value) => {
    setForm(f => ({
      ...f,
      [key]: f[key].includes(value)
        ? f[key].filter(v => v !== value)
        : [...f[key], value],
    }));
    setErrors(e => ({ ...e, [key]: "" }));
  };

  const validate = () => {
    const e = {};
    if (step === 0 && !form.motivations.length)
      e.motivations = "Choisissez au moins une motivation.";
    if (step === 1 && !form.centres_interet.length)
      e.centres_interet = "Choisissez au moins un centre d'intérêt.";
    if (step === 2 && !form.talents.length)
      e.talents = "Choisissez au moins un talent.";
    if (step === 2 && form.talents.includes("Autre") && !form.talent_autre.trim())
      e.talent_autre = "Précisez votre talent.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate()) setStep(s => s + 1); };
  const prev = () => setStep(s => s - 1);

  const submit = async () => {
    setLoading(true);
    try {
      await api.put("/auth/complete-profile", {
        motivations:     form.motivations,
        centres_interet: form.centres_interet,
        talents:         form.talents,
        talent_autre:    form.talent_autre,
        idee_pays:       form.idee_pays,
        ce_qui_enerve:   form.ce_qui_enerve,
      });
      updateUser({ profil_complete: true });
      navigate("/dashboard");
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || "Erreur serveur." });
    } finally {
      setLoading(false);
    }
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  // ── Composants locaux ──────────────────────────────────────────────────
  const ChoiceBtn = ({ selected, onClick, children }) => (
    <button onClick={onClick} style={{
      padding: "12px 16px",
      borderRadius: 10,
      fontSize: "0.9rem",
      fontWeight: 600,
      border: `1.5px solid ${selected ? "var(--orange)" : "var(--border)"}`,
      background: selected ? "rgba(244,121,32,0.12)" : "var(--bg3)",
      color: selected ? "var(--orange)" : "var(--text2)",
      transition: "all 0.2s",
      textAlign: "left",
      cursor: "pointer",
      width: "100%",
    }}>
      {selected && <span style={{ marginRight: 8 }}>✓</span>}
      {children}
    </button>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #0d0d0d, #1a1a1a)",
        padding: "24px", textAlign: "center",
        borderBottom: "1px solid var(--border)",
      }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 10 }}>
          {["#F47920", "rgba(255,255,255,0.15)", "#009A44"].map((c, i) =>
            <div key={i} style={{ width: 24, height: 4, borderRadius: 99, background: c }}/>
          )}
        </div>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.3rem", fontWeight: 800, color: "white" }}>
          Complète ton profil 🎯
        </h1>
        <p style={{ color: "var(--text2)", fontSize: "0.85rem", marginTop: 4 }}>
          Aide-nous à mieux te connaître — 4 questions rapides
        </p>
      </div>

      {/* Progress */}
      <div style={{ background: "var(--bg2)", padding: "14px 24px" }}>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: "0.78rem", color: "var(--text2)", fontWeight: 600 }}>
              {STEPS[step]} — {step + 1}/{STEPS.length}
            </span>
            <span style={{ fontSize: "0.78rem", color: "var(--orange)", fontWeight: 700 }}>
              {Math.round(progress)}%
            </span>
          </div>
          <div style={{ height: 4, background: "#2a2a2a", borderRadius: 99, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 99,
              background: "linear-gradient(90deg, var(--orange), var(--orange-light))",
              width: `${progress}%`, transition: "width 0.4s ease",
            }}/>
          </div>
          {/* Étapes dots */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{
                  width: i <= step ? 28 : 10, height: 10, borderRadius: 99,
                  background: i < step ? "#009A44" : i === step ? "var(--orange)" : "#333",
                  transition: "all 0.3s",
                }}/>
                <span style={{ fontSize: "0.68rem", color: i === step ? "var(--orange)" : "var(--text2)" }}>
                  {s}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div style={{ flex: 1, padding: "24px 16px 48px", maxWidth: 560, margin: "0 auto", width: "100%" }}>

        {errors.submit && (
          <div style={{
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 8, padding: "11px 14px", marginBottom: 16,
            color: "#ef4444", fontSize: "0.88rem",
          }}>{errors.submit}</div>
        )}

        <div className="card fade-up" style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* ÉTAPE 0 — Motivations */}
          {step === 0 && <>
            <div>
              <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.1rem", fontWeight: 700, marginBottom: 6 }}>
                Pourquoi veux-tu rejoindre la GI-RHDP ?
              </h2>
              <p style={{ color: "var(--text2)", fontSize: "0.85rem", marginBottom: 16 }}>
                Plusieurs choix possibles
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {MOTIVATIONS.map(m => (
                  <ChoiceBtn
                    key={m.v}
                    selected={form.motivations.includes(m.v)}
                    onClick={() => toggleItem("motivations", m.v)}
                  >{m.l}</ChoiceBtn>
                ))}
              </div>
              {errors.motivations && <p style={{ color: "#ef4444", fontSize: "0.78rem", marginTop: 8 }}>{errors.motivations}</p>}
            </div>
          </>}

          {/* ÉTAPE 1 — Centres d'intérêt */}
          {step === 1 && <>
            <div>
              <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.1rem", fontWeight: 700, marginBottom: 6 }}>
                Tes centres d'intérêt
              </h2>
              <p style={{ color: "var(--text2)", fontSize: "0.85rem", marginBottom: 16 }}>
                Plusieurs choix possibles
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {CENTRES.map(c => (
                  <ChoiceBtn
                    key={c.v}
                    selected={form.centres_interet.includes(c.v)}
                    onClick={() => toggleItem("centres_interet", c.v)}
                  >{c.l}</ChoiceBtn>
                ))}
              </div>
              {errors.centres_interet && <p style={{ color: "#ef4444", fontSize: "0.78rem", marginTop: 8 }}>{errors.centres_interet}</p>}
            </div>
          </>}

          {/* ÉTAPE 2 — Talents */}
          {step === 2 && <>
            <div>
              <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.1rem", fontWeight: 700, marginBottom: 6 }}>
                Tes talents & compétences
              </h2>
              <p style={{ color: "var(--text2)", fontSize: "0.85rem", marginBottom: 16 }}>
                Plusieurs choix possibles
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {TALENTS.map(t => (
                  <ChoiceBtn
                    key={t}
                    selected={form.talents.includes(t)}
                    onClick={() => toggleItem("talents", t)}
                  >{t}</ChoiceBtn>
                ))}
              </div>
              {errors.talents && <p style={{ color: "#ef4444", fontSize: "0.78rem", marginTop: 8 }}>{errors.talents}</p>}

              {/* Champ libre si "Autre" sélectionné */}
              {form.talents.includes("Autre") && (
                <div className="input-group" style={{ marginTop: 14 }}>
                  <label>Précisez votre talent <span>*</span></label>
                  <input
                    className={`input-field ${errors.talent_autre ? "error" : ""}`}
                    placeholder="Ex : Photographie, Vidéo, Cuisine..."
                    value={form.talent_autre}
                    onChange={e => setForm(f => ({ ...f, talent_autre: e.target.value }))}
                  />
                  {errors.talent_autre && <span className="error-text">{errors.talent_autre}</span>}
                </div>
              )}
            </div>
          </>}

          {/* ÉTAPE 3 — Expression libre */}
          {step === 3 && <>
            <div>
              <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>
                Exprime-toi librement ✍️
              </h2>

              <div className="input-group" style={{ marginBottom: 16 }}>
                <label>💡 Une idée pour améliorer ton pays ?</label>
                <textarea
                  className="input-field"
                  placeholder="Partage ta vision, ton idée..."
                  rows={4}
                  value={form.idee_pays}
                  onChange={e => setForm(f => ({ ...f, idee_pays: e.target.value }))}
                  style={{ resize: "vertical" }}
                />
              </div>

              <div className="input-group">
                <label>😤 Ce qui t'énerve le plus aujourd'hui ?</label>
                <textarea
                  className="input-field"
                  placeholder="Sois honnête, c'est confidentiel..."
                  rows={4}
                  value={form.ce_qui_enerve}
                  onChange={e => setForm(f => ({ ...f, ce_qui_enerve: e.target.value }))}
                  style={{ resize: "vertical" }}
                />
              </div>

              <div style={{
                background: "rgba(0,154,68,0.08)", border: "1px solid rgba(0,154,68,0.2)",
                borderRadius: 8, padding: "12px 14px", marginTop: 14,
                fontSize: "0.82rem", color: "#4ade80",
              }}>
                🔒 Tes réponses sont confidentielles et ne seront utilisées que pour améliorer la communauté.
              </div>
            </div>
          </>}

        </div>

        {/* Navigation */}
        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          {step > 0 && (
            <button className="btn-secondary" onClick={prev} style={{ flex: 1 }}>
              ← Retour
            </button>
          )}
          <button
            className="btn-primary"
            style={{ flex: 2 }}
            onClick={step < STEPS.length - 1 ? next : submit}
            disabled={loading}
          >
            {loading
              ? <><div className="spinner"/>Enregistrement...</>
              : step < STEPS.length - 1
                ? "Continuer →"
                : "✅ Terminer mon profil"
            }
          </button>
        </div>

        {/* Skip */}
        {step === STEPS.length - 1 && (
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              display: "block", width: "100%", marginTop: 12,
              background: "transparent", border: "none",
              color: "var(--text2)", fontSize: "0.82rem",
              cursor: "pointer", textDecoration: "underline",
            }}
          >
            Passer pour l'instant
          </button>
        )}
      </div>
    </div>
  );
}