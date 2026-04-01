import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const STEPS = ["Identité", "Localisation", "Situation", "Compte"];

const PHONE_CODES = [
  { code: "+225", flag: "🇨🇮" }, { code: "+33",  flag: "🇫🇷" },
  { code: "+1",   flag: "🇺🇸" }, { code: "+44",  flag: "🇬🇧" },
  { code: "+221", flag: "🇸🇳" }, { code: "+226", flag: "🇧🇫" },
  { code: "+223", flag: "🇲🇱" }, { code: "+229", flag: "🇧🇯" },
];

export default function Register() {
  const navigate  = useNavigate();
  const { login } = useAuth();

  const [step, setStep]       = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});
  const [apiError, setApiError] = useState("");

  const [form, setForm] = useState({
    nom: "", prenoms: "", date_naissance: "", lieu_naissance: "",
    ville: "", commune: "", quartier: "",
    phoneCode: "+225", phone: "",
    est_etudiant: null,
    filiere: "", niveau: "", etablissement: "",
    situation: "",
    est_militant: null, matricule_militant: "",
    email: "", password: "", confirm_password: "",
  });

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: "" }));
    setApiError("");
  };

  const validate = () => {
    const e = {};
    if (step === 0) {
      if (!form.nom.trim())             e.nom             = "Nom requis.";
      if (!form.prenoms.trim())         e.prenoms         = "Prénoms requis.";
      if (!form.date_naissance)         e.date_naissance  = "Date de naissance requise.";
      if (!form.lieu_naissance.trim())  e.lieu_naissance  = "Lieu de naissance requis.";
    }
    if (step === 1) {
      if (!form.ville.trim())    e.ville    = "Ville requise.";
      if (!form.commune.trim())  e.commune  = "Commune requise.";
      if (!form.quartier.trim()) e.quartier = "Quartier requis.";
      if (!form.phone.trim() || !/^\d{8,}$/.test(form.phone.replace(/\s/g,"")))
        e.phone = "Numéro invalide (min. 8 chiffres).";
    }
    if (step === 2) {
      if (form.est_etudiant === null) e.est_etudiant = "Veuillez répondre à cette question.";
      if (form.est_etudiant === true) {
        if (!form.filiere.trim())       e.filiere       = "Filière requise.";
        if (!form.niveau.trim())        e.niveau        = "Niveau requis.";
        if (!form.etablissement.trim()) e.etablissement = "Établissement requis.";
      }
      if (form.est_etudiant === false && !form.situation)
        e.situation = "Veuillez préciser votre situation.";
      if (form.est_militant === null) e.est_militant = "Veuillez répondre à cette question.";
      if (form.est_militant === true && !form.matricule_militant.trim())
        e.matricule_militant = "Matricule militant requis.";
    }
    if (step === 3) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email invalide.";
      if (form.password.length < 6)   e.password         = "Minimum 6 caractères.";
      if (form.password !== form.confirm_password) e.confirm_password = "Les mots de passe ne correspondent pas.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate()) setStep(s => s + 1); };
  const prev = () => setStep(s => s - 1);

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    setApiError("");
    try {
      const payload = {
        nom: form.nom, prenoms: form.prenoms,
        date_naissance: form.date_naissance,
        lieu_naissance: form.lieu_naissance,
        ville: form.ville, commune: form.commune, quartier: form.quartier,
        phone: form.phoneCode + " " + form.phone,
        email: form.email, password: form.password,
        est_etudiant: form.est_etudiant,
        filiere: form.filiere || null,
        niveau: form.niveau || null,
        etablissement: form.etablissement || null,
        situation: form.situation || null,
        est_militant: form.est_militant,
        matricule_militant: form.matricule_militant || null,
      };
      const { data } = await api.post("/auth/register", payload);
      login(data.token, data.user);
      navigate("/complete-profile");
    } catch (err) {
      setApiError(err.response?.data?.message || "Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", flexDirection:"column" }}>

      {/* Header */}
      <div style={{
        background:"linear-gradient(135deg, #0d0d0d, #1a1a1a)",
        padding:"24px", textAlign:"center", borderBottom:"1px solid var(--border)"
      }}>
        <div style={{ display:"flex", justifyContent:"center", gap:6, marginBottom:12 }}>
          {["#F47920","rgba(255,255,255,0.2)","#009A44"].map((c,i) =>
            <div key={i} style={{ width:24, height:4, borderRadius:99, background:c }}/>
          )}
        </div>
        <h1 style={{
          fontFamily:"'Syne',sans-serif", fontSize:"1.4rem", fontWeight:800, color:"white"
        }}>Génération Impact <span style={{ color:"var(--orange)" }}>RHDP</span></h1>
        <p style={{ color:"var(--text2)", fontSize:"0.85rem", marginTop:4 }}>
          Créez votre compte membre
        </p>
      </div>

      {/* Progress */}
      <div style={{ background:"var(--bg2)", padding:"16px 24px" }}>
        <div style={{ maxWidth:480, margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <span style={{ fontSize:"0.78rem", color:"var(--text2)", fontWeight:600 }}>
              Étape {step+1}/{STEPS.length} — {STEPS[step]}
            </span>
            <span style={{ fontSize:"0.78rem", color:"var(--orange)", fontWeight:700 }}>
              {Math.round(progress)}%
            </span>
          </div>
          <div style={{ height:4, background:"#2a2a2a", borderRadius:99, overflow:"hidden" }}>
            <div style={{
              height:"100%", borderRadius:99,
              background:"linear-gradient(90deg, var(--orange), var(--orange-light))",
              width:`${progress}%`, transition:"width 0.4s ease"
            }}/>
          </div>
        </div>
      </div>

      {/* Form */}
      <div style={{ flex:1, padding:"24px 16px 48px", maxWidth:520, margin:"0 auto", width:"100%" }}>

        {apiError && (
          <div style={{
            background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)",
            borderRadius:8, padding:"12px 16px", marginBottom:16,
            color:"#ef4444", fontSize:"0.88rem"
          }}>{apiError}</div>
        )}

        <div className="card fade-up" style={{ display:"flex", flexDirection:"column", gap:16 }}>

          {/* ÉTAPE 0 — Identité */}
          {step === 0 && <>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <div className="input-group">
                <label>Nom <span>*</span></label>
                <input className={`input-field ${errors.nom?"error":""}`}
                  placeholder="KONÉ" value={form.nom} onChange={e=>set("nom",e.target.value)}/>
                {errors.nom && <span className="error-text">{errors.nom}</span>}
              </div>
              <div className="input-group">
                <label>Prénoms <span>*</span></label>
                <input className={`input-field ${errors.prenoms?"error":""}`}
                  placeholder="Amadou" value={form.prenoms} onChange={e=>set("prenoms",e.target.value)}/>
                {errors.prenoms && <span className="error-text">{errors.prenoms}</span>}
              </div>
            </div>
            <div className="input-group">
              <label>Date de naissance <span>*</span></label>
              <input type="date" className={`input-field ${errors.date_naissance?"error":""}`}
                value={form.date_naissance} onChange={e=>set("date_naissance",e.target.value)}/>
              {errors.date_naissance && <span className="error-text">{errors.date_naissance}</span>}
            </div>
            <div className="input-group">
              <label>Lieu de naissance <span>*</span></label>
              <input className={`input-field ${errors.lieu_naissance?"error":""}`}
                placeholder="Ex : Abidjan, Bouaké..." value={form.lieu_naissance}
                onChange={e=>set("lieu_naissance",e.target.value)}/>
              {errors.lieu_naissance && <span className="error-text">{errors.lieu_naissance}</span>}
            </div>
          </>}

          {/* ÉTAPE 1 — Localisation */}
          {step === 1 && <>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <div className="input-group">
                <label>Ville <span>*</span></label>
                <input className={`input-field ${errors.ville?"error":""}`}
                  placeholder="Abidjan" value={form.ville} onChange={e=>set("ville",e.target.value)}/>
                {errors.ville && <span className="error-text">{errors.ville}</span>}
              </div>
              <div className="input-group">
                <label>Commune <span>*</span></label>
                <input className={`input-field ${errors.commune?"error":""}`}
                  placeholder="Cocody" value={form.commune} onChange={e=>set("commune",e.target.value)}/>
                {errors.commune && <span className="error-text">{errors.commune}</span>}
              </div>
            </div>
            <div className="input-group">
              <label>Quartier <span>*</span></label>
              <input className={`input-field ${errors.quartier?"error":""}`}
                placeholder="Angré, Biétry..." value={form.quartier}
                onChange={e=>set("quartier",e.target.value)}/>
              {errors.quartier && <span className="error-text">{errors.quartier}</span>}
            </div>
            <div className="input-group">
              <label>Numéro WhatsApp <span>*</span></label>
              <div style={{ display:"flex", gap:8 }}>
                <select className="input-field" style={{ width:100, flexShrink:0 }}
                  value={form.phoneCode} onChange={e=>set("phoneCode",e.target.value)}>
                  {PHONE_CODES.map(c =>
                    <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                  )}
                </select>
                <input className={`input-field ${errors.phone?"error":""}`}
                  type="tel" placeholder="07 00 00 00 00"
                  value={form.phone} onChange={e=>set("phone",e.target.value)}/>
              </div>
              {errors.phone && <span className="error-text">{errors.phone}</span>}
            </div>
          </>}

          {/* ÉTAPE 2 — Situation */}
          {step === 2 && <>
            {/* Étudiant ? */}
            <div className="input-group">
              <label>Êtes-vous étudiant(e) ? <span>*</span></label>
              <div style={{ display:"flex", gap:10, marginTop:4 }}>
                {[{v:true,l:"Oui"},{v:false,l:"Non"}].map(({v,l}) => (
                  <button key={l} onClick={()=>set("est_etudiant",v)}
                    style={{
                      flex:1, padding:"11px",
                      borderRadius:8, fontSize:"0.9rem", fontWeight:600,
                      border:`1.5px solid ${form.est_etudiant===v ? "var(--orange)" : "var(--border)"}`,
                      background: form.est_etudiant===v ? "rgba(244,121,32,0.12)" : "var(--bg3)",
                      color: form.est_etudiant===v ? "var(--orange)" : "var(--text2)",
                      transition:"all 0.2s",
                    }}>{l}</button>
                ))}
              </div>
              {errors.est_etudiant && <span className="error-text">{errors.est_etudiant}</span>}
            </div>

            {/* Si étudiant */}
            {form.est_etudiant === true && <>
              <div className="input-group">
                <label>Filière <span>*</span></label>
                <input className={`input-field ${errors.filiere?"error":""}`}
                  placeholder="Ex : Informatique, Droit..." value={form.filiere}
                  onChange={e=>set("filiere",e.target.value)}/>
                {errors.filiere && <span className="error-text">{errors.filiere}</span>}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <div className="input-group">
                  <label>Niveau <span>*</span></label>
                  <select className={`input-field ${errors.niveau?"error":""}`}
                    value={form.niveau} onChange={e=>set("niveau",e.target.value)}>
                    <option value="">-- Choisir --</option>
                    {["Licence 1","Licence 2","Licence 3","Master 1","Master 2","Doctorat","BTS","DUT","Autre"].map(n =>
                      <option key={n} value={n}>{n}</option>
                    )}
                  </select>
                  {errors.niveau && <span className="error-text">{errors.niveau}</span>}
                </div>
                <div className="input-group">
                  <label>Établissement <span>*</span></label>
                  <input className={`input-field ${errors.etablissement?"error":""}`}
                    placeholder="Ex : UFHB, INP-HB..." value={form.etablissement}
                    onChange={e=>set("etablissement",e.target.value)}/>
                  {errors.etablissement && <span className="error-text">{errors.etablissement}</span>}
                </div>
              </div>
            </>}

            {/* Si non étudiant */}
            {form.est_etudiant === false && (
              <div className="input-group">
                <label>Situation professionnelle <span>*</span></label>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  {[
                    {v:"travailleur", l:"Travailleur"},
                    {v:"eleve",       l:"Élève"},
                    {v:"sans_emploi", l:"Sans emploi"},
                    {v:"autre",       l:"Autre"},
                  ].map(({v,l}) => (
                    <button key={v} onClick={()=>set("situation",v)}
                      style={{
                        padding:"10px", borderRadius:8, fontSize:"0.88rem", fontWeight:600,
                        border:`1.5px solid ${form.situation===v ? "var(--orange)" : "var(--border)"}`,
                        background: form.situation===v ? "rgba(244,121,32,0.12)" : "var(--bg3)",
                        color: form.situation===v ? "var(--orange)" : "var(--text2)",
                        transition:"all 0.2s",
                      }}>{l}</button>
                  ))}
                </div>
                {errors.situation && <span className="error-text">{errors.situation}</span>}
              </div>
            )}

            {/* Militant ? */}
            <div className="input-group" style={{ marginTop:4 }}>
              <label>Êtes-vous déjà militant du RHDP ? <span>*</span></label>
              <div style={{ display:"flex", gap:10, marginTop:4 }}>
                {[{v:true,l:"Oui, je suis militant"},{v:false,l:"Non, je rejoins"}].map(({v,l}) => (
                  <button key={l} onClick={()=>set("est_militant",v)}
                    style={{
                      flex:1, padding:"11px",
                      borderRadius:8, fontSize:"0.85rem", fontWeight:600,
                      border:`1.5px solid ${form.est_militant===v ? "var(--green)" : "var(--border)"}`,
                      background: form.est_militant===v ? "rgba(0,154,68,0.12)" : "var(--bg3)",
                      color: form.est_militant===v ? "var(--green)" : "var(--text2)",
                      transition:"all 0.2s",
                    }}>{l}</button>
                ))}
              </div>
              {errors.est_militant && <span className="error-text">{errors.est_militant}</span>}
            </div>

            {form.est_militant === true && (
              <div className="input-group">
                <label>Matricule militant <span>*</span></label>
                <input className={`input-field ${errors.matricule_militant?"error":""}`}
                  placeholder="Ex : RHDP-2024-00123"
                  value={form.matricule_militant}
                  onChange={e=>set("matricule_militant",e.target.value)}/>
                {errors.matricule_militant && <span className="error-text">{errors.matricule_militant}</span>}
              </div>
            )}
          </>}

          {/* ÉTAPE 3 — Compte */}
          {step === 3 && <>
            <div className="input-group">
              <label>Adresse e-mail <span>*</span></label>
              <input type="email" className={`input-field ${errors.email?"error":""}`}
                placeholder="exemple@gmail.com" value={form.email}
                onChange={e=>set("email",e.target.value)}/>
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>
            <div className="input-group">
              <label>Mot de passe <span>*</span></label>
              <input type="password" className={`input-field ${errors.password?"error":""}`}
                placeholder="Minimum 6 caractères" value={form.password}
                onChange={e=>set("password",e.target.value)}/>
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>
            <div className="input-group">
              <label>Confirmer le mot de passe <span>*</span></label>
              <input type="password" className={`input-field ${errors.confirm_password?"error":""}`}
                placeholder="Répétez le mot de passe" value={form.confirm_password}
                onChange={e=>set("confirm_password",e.target.value)}/>
              {errors.confirm_password && <span className="error-text">{errors.confirm_password}</span>}
            </div>
            <div style={{
              background:"rgba(0,154,68,0.08)", border:"1px solid rgba(0,154,68,0.2)",
              borderRadius:8, padding:"12px 14px", fontSize:"0.82rem", color:"#4ade80"
            }}>
              ✅ Après votre inscription, vous recevrez vos liens d'accès aux groupes et à la chaîne WhatsApp officielle.
            </div>
          </>}

        </div>

        {/* Navigation */}
        <div style={{ display:"flex", gap:12, marginTop:16 }}>
          {step > 0 && (
            <button className="btn-secondary" onClick={prev} style={{ flex:1 }}>
              ← Retour
            </button>
          )}
          <button
            className="btn-primary"
            style={{ flex:2 }}
            onClick={step < STEPS.length-1 ? next : submit}
            disabled={loading}
          >
            {loading ? <><div className="spinner"/>Inscription...</> :
              step < STEPS.length-1 ? "Continuer →" : "✅ Créer mon compte"}
          </button>
        </div>

        <p style={{ textAlign:"center", marginTop:20, color:"var(--text2)", fontSize:"0.85rem" }}>
          Déjà membre ?{" "}
          <Link to="/login" style={{ color:"var(--orange)", fontWeight:600 }}>
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}