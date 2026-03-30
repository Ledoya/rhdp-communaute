import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

// ═══════════════════════════════════════════════════════
// ARTICLES
// ═══════════════════════════════════════════════════════
export function Articles() {
  const [articles, setArticles] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [category, setCategory] = useState("");

  const CATS = [
    { v:"",           l:"Tout" },
    { v:"general",    l:"Général" },
    { v:"politique",  l:"Politique" },
    { v:"evenement",  l:"Événement" },
    { v:"communique", l:"Communiqué" },
  ];

  useEffect(() => {
    setLoading(true);
    api.get(`/articles?limit=20${category ? "&category="+category : ""}`)
      .then(r => setArticles(r.data.articles || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <Layout>
      <div style={{ maxWidth:800, margin:"0 auto" }}>
        <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:"1.4rem", fontWeight:800, marginBottom:16 }}>
          📰 Actualités RHDP
        </h1>

        {/* Filtres */}
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20 }}>
          {CATS.map(c => (
            <button key={c.v} onClick={()=>setCategory(c.v)}
              style={{
                padding:"7px 14px", borderRadius:99, fontSize:"0.82rem", fontWeight:600,
                border:`1.5px solid ${category===c.v ? "var(--orange)" : "var(--border)"}`,
                background: category===c.v ? "rgba(244,121,32,0.12)" : "transparent",
                color: category===c.v ? "var(--orange)" : "var(--text2)",
                transition:"all 0.2s",
              }}>{c.l}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ display:"flex", justifyContent:"center", paddingTop:40 }}>
            <div className="spinner" style={{ width:32,height:32 }}/>
          </div>
        ) : articles.length === 0 ? (
          <div className="card" style={{ textAlign:"center", padding:"40px 20px", color:"var(--text2)" }}>
            Aucune actualité disponible.
          </div>
        ) : articles.map(a => (
          <Link key={a.id} to={`/actualites/${a.id}`}
            className="card"
            style={{ display:"block", marginBottom:12, transition:"border-color 0.2s" }}
            onMouseEnter={e=>e.currentTarget.style.borderColor="var(--orange)"}
            onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border)"}
          >
            {a.image_url && (
              <img src={a.image_url} alt={a.title}
                style={{ width:"100%", height:180, objectFit:"cover", borderRadius:8, marginBottom:12 }}/>
            )}
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
              <span className="badge badge-orange">{a.category}</span>
              <span style={{ color:"var(--text2)", fontSize:"0.78rem" }}>
                {new Date(a.created_at).toLocaleDateString("fr-FR")}
              </span>
            </div>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:"1.05rem", fontWeight:700, marginBottom:6 }}>
              {a.title}
            </h2>
            <p style={{ color:"var(--text2)", fontSize:"0.87rem", lineHeight:1.6 }}>
              {a.content.slice(0, 150)}...
            </p>
          </Link>
        ))}
      </div>
    </Layout>
  );
}

// ═══════════════════════════════════════════════════════
// ARTICLE DÉTAIL
// ═══════════════════════════════════════════════════════
export function ArticleDetail() {
  const { id }           = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/articles/${id}`)
      .then(r => setArticle(r.data.article))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Layout><div style={{ display:"flex", justifyContent:"center", paddingTop:60 }}><div className="spinner" style={{ width:32,height:32 }}/></div></Layout>;
  if (!article) return <Layout><p style={{ color:"var(--text2)", textAlign:"center" }}>Article introuvable.</p></Layout>;

  return (
    <Layout>
      <div style={{ maxWidth:700, margin:"0 auto" }}>
        <Link to="/actualites" style={{ color:"var(--orange)", fontSize:"0.85rem", fontWeight:600, display:"inline-flex", alignItems:"center", gap:6, marginBottom:16 }}>
          ← Retour
        </Link>
        <div className="card fade-up">
          {article.image_url && (
            <img src={article.image_url} alt={article.title}
              style={{ width:"100%", height:220, objectFit:"cover", borderRadius:8, marginBottom:16 }}/>
          )}
          <div style={{ display:"flex", gap:8, marginBottom:12 }}>
            <span className="badge badge-orange">{article.category}</span>
            <span style={{ color:"var(--text2)", fontSize:"0.78rem" }}>
              {new Date(article.created_at).toLocaleDateString("fr-FR")}
            </span>
          </div>
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:"1.4rem", fontWeight:800, lineHeight:1.3, marginBottom:16 }}>
            {article.title}
          </h1>
          <div style={{ color:"var(--text)", lineHeight:1.8, fontSize:"0.95rem", whiteSpace:"pre-wrap" }}>
            {article.content}
          </div>
        </div>
      </div>
    </Layout>
  );
}

// ═══════════════════════════════════════════════════════
// WHATSAPP / COMMUNAUTÉ
// ═══════════════════════════════════════════════════════
export function Whatsapp() {
  const [links,   setLinks]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/whatsapp")
      .then(r => setLinks(r.data.links || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div style={{ maxWidth:600, margin:"0 auto" }}>
        <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:"1.4rem", fontWeight:800, marginBottom:6 }}>
          💬 Communauté
        </h1>
        <p style={{ color:"var(--text2)", fontSize:"0.88rem", marginBottom:20 }}>
          Rejoignez nos groupes et chaînes WhatsApp officiels
        </p>

        {loading ? (
          <div style={{ display:"flex", justifyContent:"center", paddingTop:40 }}>
            <div className="spinner" style={{ width:32,height:32 }}/>
          </div>
        ) : links.length === 0 ? (
          <div className="card" style={{ textAlign:"center", padding:"40px 20px", color:"var(--text2)" }}>
            Aucun lien disponible pour le moment.
          </div>
        ) : links.map(l => (
          <a key={l.id} href={l.url} target="_blank" rel="noopener noreferrer"
            className="card"
            style={{ display:"flex", alignItems:"center", gap:14, marginBottom:12, transition:"all 0.2s" }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor="var(--green)"; e.currentTarget.style.transform="translateX(4px)"; }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.transform="none"; }}
          >
            <div style={{
              width:48, height:48, borderRadius:12, flexShrink:0,
              background:"rgba(0,154,68,0.12)", border:"1px solid rgba(0,154,68,0.2)",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.4rem",
            }}>{l.icon}</div>
            <div style={{ flex:1 }}>
              <p style={{ fontWeight:700, fontSize:"0.95rem" }}>{l.label}</p>
              <p style={{ color:"var(--text2)", fontSize:"0.8rem", marginTop:3 }}>{l.description}</p>
              <span className={`badge ${l.type==="chaine" ? "badge-orange" : "badge-green"}`} style={{ marginTop:6 }}>
                {l.type === "chaine" ? "Chaîne" : l.type === "groupe" ? "Groupe" : l.type}
              </span>
            </div>
            <span style={{ color:"var(--text2)", fontSize:"1.2rem" }}>›</span>
          </a>
        ))}
      </div>
    </Layout>
  );
}

// ═══════════════════════════════════════════════════════
// PROFIL
// ═══════════════════════════════════════════════════════
export function Profile() {
  const { user, updateUser } = useAuth();
  const [form,    setForm]    = useState({ ville:"", commune:"", quartier:"", phone:"" });
  const [pwForm,  setPwForm]  = useState({ old_password:"", new_password:"", confirm:"" });
  const [loading, setLoading] = useState(false);
  const [msg,     setMsg]     = useState({ type:"", text:"" });

  useEffect(() => {
    if (user) setForm({ ville:user.ville||"", commune:user.commune||"", quartier:user.quartier||"", phone:user.phone||"" });
  }, [user]);

  const saveProfile = async () => {
    setLoading(true);
    try {
      await api.put("/auth/profile", form);
      updateUser(form);
      setMsg({ type:"success", text:"Profil mis à jour !" });
    } catch {
      setMsg({ type:"error", text:"Erreur lors de la mise à jour." });
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (pwForm.new_password !== pwForm.confirm) {
      setMsg({ type:"error", text:"Les mots de passe ne correspondent pas." }); return;
    }
    setLoading(true);
    try {
      await api.put("/auth/change-password", { old_password:pwForm.old_password, new_password:pwForm.new_password });
      setPwForm({ old_password:"", new_password:"", confirm:"" });
      setMsg({ type:"success", text:"Mot de passe changé avec succès !" });
    } catch (err) {
      setMsg({ type:"error", text: err.response?.data?.message || "Erreur." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div style={{ maxWidth:600, margin:"0 auto" }}>
        <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:"1.4rem", fontWeight:800, marginBottom:20 }}>
          👤 Mon profil
        </h1>

        {msg.text && (
          <div style={{
            background: msg.type==="success" ? "rgba(0,154,68,0.1)" : "rgba(239,68,68,0.1)",
            border:`1px solid ${msg.type==="success" ? "rgba(0,154,68,0.3)" : "rgba(239,68,68,0.3)"}`,
            borderRadius:8, padding:"11px 14px", marginBottom:16,
            color: msg.type==="success" ? "#4ade80" : "#ef4444", fontSize:"0.88rem"
          }}>{msg.text}</div>
        )}

        {/* Infos fixes */}
        <div className="card fade-up" style={{ marginBottom:16 }}>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:"1rem", fontWeight:700, marginBottom:14 }}>
            Informations personnelles
          </h2>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {[
              ["Nom",        user?.nom],
              ["Prénoms",    user?.prenoms],
              ["Email",      user?.email],
              ["Statut",     user?.est_militant ? "Militant RHDP" : "Membre"],
            ].map(([label, value]) => (
              <div key={label} style={{
                background:"var(--bg3)", borderRadius:8, padding:"10px 12px",
                border:"1px solid var(--border)"
              }}>
                <p style={{ color:"var(--text2)", fontSize:"0.72rem", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em" }}>{label}</p>
                <p style={{ fontWeight:600, fontSize:"0.9rem", marginTop:3 }}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Infos modifiables */}
        <div className="card fade-up" style={{ marginBottom:16 }}>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:"1rem", fontWeight:700, marginBottom:14 }}>
            Modifier ma localisation
          </h2>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {[
              ["ville",    "Ville",    "Abidjan"],
              ["commune",  "Commune",  "Cocody"],
              ["quartier", "Quartier", "Angré"],
              ["phone",    "Téléphone WhatsApp", "+225 07 00 00 00"],
            ].map(([k, label, ph]) => (
              <div key={k} className="input-group">
                <label>{label}</label>
                <input className="input-field" placeholder={ph}
                  value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}/>
              </div>
            ))}
            <button className="btn-primary" onClick={saveProfile} disabled={loading}>
              {loading ? <><div className="spinner"/>Sauvegarde...</> : "💾 Sauvegarder"}
            </button>
          </div>
        </div>

        {/* Changement mot de passe */}
        <div className="card fade-up">
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:"1rem", fontWeight:700, marginBottom:14 }}>
            🔒 Changer mon mot de passe
          </h2>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {[
              ["old_password", "Ancien mot de passe"],
              ["new_password", "Nouveau mot de passe"],
              ["confirm",      "Confirmer le nouveau"],
            ].map(([k, label]) => (
              <div key={k} className="input-group">
                <label>{label}</label>
                <input type="password" className="input-field"
                  value={pwForm[k]} onChange={e=>setPwForm(f=>({...f,[k]:e.target.value}))}/>
              </div>
            ))}
            <button className="btn-primary" onClick={changePassword} disabled={loading}>
              {loading ? <><div className="spinner"/>Changement...</> : "🔒 Changer le mot de passe"}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Articles;