import { useState, useEffect, createContext, useContext } from "react";

// ─── API ──────────────────────────────────────────────────────────────────
const API = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("rhdp_admin_token");
  const res = await fetch(API + path, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erreur serveur");
  return data;
}

// ─── AUTH CONTEXT ─────────────────────────────────────────────────────────
const AdminContext = createContext(null);
const useAdmin = () => useContext(AdminContext);

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'DM Sans',sans-serif;background:#0a0a0a;color:#f0f0f0;min-height:100vh}
    ::-webkit-scrollbar{width:5px}
    ::-webkit-scrollbar-track{background:#0a0a0a}
    ::-webkit-scrollbar-thumb{background:#F47920;border-radius:99px}
    @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    @keyframes spin{to{transform:rotate(360deg)}}
    .fade-up{animation:fadeUp 0.4s ease both}
    .spinner{width:18px;height:18px;border:2.5px solid rgba(255,255,255,0.2);border-top-color:white;border-radius:50%;animation:spin 0.7s linear infinite;display:inline-block}
    input,select,textarea{font-family:'DM Sans',sans-serif;outline:none}
    button{cursor:pointer;font-family:'DM Sans',sans-serif}
    a{text-decoration:none;color:inherit}
    table{border-collapse:collapse;width:100%}
    th,td{text-align:left;padding:10px 12px;font-size:0.83rem}
    thead tr{background:linear-gradient(90deg,#D4610A,#F47920);color:white}
    tbody tr:hover{background:rgba(244,121,32,0.05)}
    tbody tr{border-bottom:1px solid rgba(255,255,255,0.05)}
  `}</style>
);

// ─── COMPOSANTS UI ────────────────────────────────────────────────────────
const Card = ({ children, style = {} }) => (
  <div style={{
    background:"#141414", border:"1px solid rgba(255,255,255,0.07)",
    borderRadius:14, padding:22, ...style
  }}>{children}</div>
);

const Input = ({ label, error, ...props }) => (
  <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
    {label && <label style={{ fontSize:"0.75rem", fontWeight:600, color:"#888", textTransform:"uppercase", letterSpacing:"0.05em" }}>{label}</label>}
    <input {...props} style={{
      padding:"11px 13px", background:"#1e1e1e",
      border:`1.5px solid ${error ? "#ef4444" : "rgba(255,255,255,0.08)"}`,
      borderRadius:8, color:"#f0f0f0", fontSize:"0.92rem", width:"100%",
      transition:"border-color 0.2s",
      ...props.style
    }}
      onFocus={e => e.target.style.borderColor="#F47920"}
      onBlur={e => e.target.style.borderColor = error ? "#ef4444" : "rgba(255,255,255,0.08)"}
    />
    {error && <span style={{ fontSize:"0.74rem", color:"#ef4444" }}>{error}</span>}
  </div>
);

const Btn = ({ children, variant="primary", loading, style={}, ...props }) => (
  <button {...props} disabled={loading || props.disabled} style={{
    display:"inline-flex", alignItems:"center", justifyContent:"center", gap:8,
    padding:"11px 20px", borderRadius:8, fontWeight:600, fontSize:"0.9rem",
    border:"none", transition:"all 0.2s",
    background: variant==="primary" ? "linear-gradient(135deg,#F47920,#D4610A)"
              : variant==="green"   ? "#009A44"
              : variant==="danger"  ? "rgba(239,68,68,0.15)"
              : "rgba(255,255,255,0.06)",
    color: variant==="danger" ? "#ef4444" : "white",
    opacity: (loading||props.disabled) ? 0.6 : 1,
    cursor: (loading||props.disabled) ? "not-allowed" : "pointer",
    boxShadow: variant==="primary" ? "0 4px 18px rgba(244,121,32,0.25)" : "none",
    ...style
  }}>
    {loading && <div className="spinner"/>}
    {children}
  </button>
);

const Badge = ({ children, color="orange" }) => {
  const colors = {
    orange:{ bg:"rgba(244,121,32,0.15)", text:"#F47920" },
    green: { bg:"rgba(0,154,68,0.15)",   text:"#4ade80" },
    gray:  { bg:"rgba(255,255,255,0.07)",text:"#888"    },
    red:   { bg:"rgba(239,68,68,0.15)",  text:"#ef4444" },
  };
  const c = colors[color] || colors.gray;
  return (
    <span style={{
      display:"inline-block", padding:"2px 9px", borderRadius:99,
      fontSize:"0.7rem", fontWeight:700, letterSpacing:"0.06em",
      textTransform:"uppercase", background:c.bg, color:c.text,
    }}>{children}</span>
  );
};

// ─── LOGIN ────────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [form,    setForm]    = useState({ email:"", password:"" });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const submit = async (e) => {
    e?.preventDefault();
    if (!form.email || !form.password) { setError("Remplissez tous les champs."); return; }
    setLoading(true); setError("");
    try {
      const data = await apiFetch("/admin/auth/login", {
        method:"POST", body: JSON.stringify(form),
      });
      localStorage.setItem("rhdp_admin_token", data.token);
      localStorage.setItem("rhdp_admin",       JSON.stringify(data.admin));
      onLogin(data.admin);
    } catch(err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ width:"100%", maxWidth:400 }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ display:"flex", justifyContent:"center", gap:6, marginBottom:14 }}>
            {["#F47920","rgba(255,255,255,0.15)","#009A44"].map((c,i) =>
              <div key={i} style={{ width:28,height:5,borderRadius:99,background:c }}/>
            )}
          </div>
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:"1.5rem", fontWeight:800 }}>
            Espace <span style={{ color:"#F47920" }}>Admin</span>
          </h1>
          <p style={{ color:"#888", fontSize:"0.85rem", marginTop:6 }}>
            Génération Impact RHDP
          </p>
        </div>

        <Card>
          {error && (
            <div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:8, padding:"10px 14px", marginBottom:16, color:"#ef4444", fontSize:"0.85rem" }}>
              {error}
            </div>
          )}
          <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <Input label="Email administrateur" type="email" placeholder="admin@rhdp-gi.ci"
              value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/>
            <Input label="Mot de passe" type="password" placeholder="••••••••"
              value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))}/>
            <Btn loading={loading} style={{ marginTop:6, width:"100%" }}>
              {!loading && "Accéder au tableau de bord →"}
            </Btn>
          </form>
        </Card>
      </div>
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────
const NAV = [
  { id:"dashboard",     icon:"📊", label:"Tableau de bord" },
  { id:"members",       icon:"👥", label:"Membres"         },
  { id:"articles",      icon:"📰", label:"Actualités"      },
  { id:"notifications", icon:"🔔", label:"Notifications"   },
  { id:"whatsapp",      icon:"💬", label:"Liens WhatsApp"  },
  { id:"admins",        icon:"🔐", label:"Administrateurs" },
];

function Sidebar({ page, setPage, admin, onLogout }) {
  return (
    <aside style={{
      width:220, background:"#0e0e0e", borderRight:"1px solid rgba(255,255,255,0.06)",
      display:"flex", flexDirection:"column", position:"fixed", inset:"0 auto 0 0", zIndex:100,
    }}>
      <div style={{ padding:"18px 14px 14px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display:"flex", gap:4, marginBottom:10 }}>
          {["#F47920","rgba(255,255,255,0.12)","#009A44"].map((c,i)=>
            <div key={i} style={{ width:16,height:3,borderRadius:99,background:c }}/>
          )}
        </div>
        <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"0.9rem" }}>Admin Panel</p>
        <p style={{ color:"#F47920", fontSize:"0.7rem", fontWeight:700, letterSpacing:"0.08em" }}>RHDP · GI</p>
      </div>

      <div style={{ padding:"10px 8px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"8px" }}>
          <div style={{
            width:34,height:34,borderRadius:"50%",
            background:"linear-gradient(135deg,#F47920,#D4610A)",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontWeight:700,fontSize:"0.9rem",color:"white",flexShrink:0
          }}>{admin?.fullname?.[0]?.toUpperCase()}</div>
          <div>
            <p style={{ fontWeight:600, fontSize:"0.82rem" }}>{admin?.fullname}</p>
            <Badge color={admin?.role==="super_admin"?"orange":"gray"}>
              {admin?.role==="super_admin"?"Super Admin":"Admin"}
            </Badge>
          </div>
        </div>
      </div>

      <nav style={{ flex:1, padding:"8px" }}>
        {NAV.map(n => (
          <button key={n.id} onClick={()=>setPage(n.id)}
            style={{
              width:"100%", display:"flex", alignItems:"center", gap:10,
              padding:"10px 12px", borderRadius:8, marginBottom:2,
              background: page===n.id ? "rgba(244,121,32,0.12)" : "transparent",
              border:`1px solid ${page===n.id ? "rgba(244,121,32,0.25)" : "transparent"}`,
              color: page===n.id ? "#F47920" : "#888",
              fontWeight: page===n.id ? 600 : 400,
              fontSize:"0.87rem", transition:"all 0.2s", textAlign:"left",
            }}
          >
            <span>{n.icon}</span>{n.label}
          </button>
        ))}
      </nav>

      <div style={{ padding:"10px 8px", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
        <button onClick={onLogout}
          style={{
            width:"100%", padding:"9px 12px", borderRadius:8,
            background:"transparent", border:"1px solid rgba(255,255,255,0.07)",
            color:"#666", fontSize:"0.85rem", display:"flex", alignItems:"center", gap:8,
            transition:"all 0.2s",
          }}
          onMouseEnter={e=>{ e.currentTarget.style.borderColor="#ef4444"; e.currentTarget.style.color="#ef4444"; }}
          onMouseLeave={e=>{ e.currentTarget.style.borderColor="rgba(255,255,255,0.07)"; e.currentTarget.style.color="#666"; }}
        >🚪 Déconnexion</button>
      </div>
    </aside>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────
function DashboardPage() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/admin/stats")
      .then(d => setStats(d.stats))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display:"flex", justifyContent:"center", paddingTop:60 }}><div className="spinner" style={{ width:32,height:32 }}/></div>;

  const statCards = [
    { label:"Total membres",     value:stats?.total_membres,   icon:"👥", color:"#F47920" },
    { label:"Militants RHDP",    value:stats?.total_militants, icon:"🏅", color:"#009A44" },
    { label:"Étudiants",         value:stats?.total_etudiants, icon:"🎓", color:"#3b82f6" },
    { label:"Nouveaux (7 jours)",value:stats?.nouveaux_7jours, icon:"🆕", color:"#a855f7" },
  ];

  return (
    <div className="fade-up">
      <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:"1.4rem", fontWeight:800, marginBottom:20 }}>
        📊 Tableau de bord
      </h1>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:14, marginBottom:24 }}>
        {statCards.map((s,i) => (
          <Card key={i}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div>
                <p style={{ color:"#888", fontSize:"0.78rem", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:6 }}>
                  {s.label}
                </p>
                <p style={{ fontFamily:"'Syne',sans-serif", fontSize:"2rem", fontWeight:800, color:s.color }}>
                  {s.value ?? 0}
                </p>
              </div>
              <span style={{ fontSize:"2rem", opacity:0.6 }}>{s.icon}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Par ville */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <Card>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:"0.95rem", fontWeight:700, marginBottom:14 }}>
            🏙️ Par ville
          </h2>
          {(stats?.par_ville || []).map((v,i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ fontSize:"0.88rem" }}>{v.ville}</span>
              <Badge color="orange">{v.total}</Badge>
            </div>
          ))}
        </Card>
        <Card>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:"0.95rem", fontWeight:700, marginBottom:14 }}>
            🏘️ Par commune
          </h2>
          {(stats?.par_commune || []).map((c,i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ fontSize:"0.88rem" }}>{c.commune}</span>
              <Badge color="green">{c.total}</Badge>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ─── MEMBRES ──────────────────────────────────────────────────────────────
function MembersPage() {
  const [members,  setMembers]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);
  const [pages,    setPages]    = useState(1);

  const load = (p=1, q=search) => {
    setLoading(true);
    apiFetch(`/admin/members?page=${p}&limit=20&search=${q}`)
      .then(d => { setMembers(d.members); setTotal(d.total); setPages(d.totalPages); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const exportCSV = () => window.open(API+"/admin/members/export?token="+localStorage.getItem("rhdp_admin_token"), "_blank");

  const toggle = async (id) => {
    await apiFetch(`/admin/members/${id}/toggle`, { method:"PUT" });
    load(page);
  };

  return (
    <div className="fade-up">
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:12 }}>
        <div>
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:"1.4rem", fontWeight:800 }}>👥 Membres</h1>
          <p style={{ color:"#888", fontSize:"0.83rem", marginTop:4 }}>{total} membres au total</p>
        </div>
        <Btn variant="green" onClick={exportCSV}>⬇ Exporter CSV</Btn>
      </div>

      <Card style={{ marginBottom:16 }}>
        <div style={{ display:"flex", gap:10 }}>
          <input placeholder="🔍 Rechercher par nom, email, téléphone..."
            value={search} onChange={e=>setSearch(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&load(1,search)}
            style={{
              flex:1, padding:"10px 13px", background:"#1e1e1e",
              border:"1px solid rgba(255,255,255,0.08)", borderRadius:8,
              color:"#f0f0f0", fontSize:"0.9rem",
            }}/>
          <Btn onClick={()=>load(1,search)}>Chercher</Btn>
          <Btn variant="secondary" onClick={()=>{ setSearch(""); load(1,""); }}>Reset</Btn>
        </div>
      </Card>

      <Card style={{ overflowX:"auto" }}>
        {loading ? (
          <div style={{ display:"flex", justifyContent:"center", padding:40 }}>
            <div className="spinner" style={{ width:28,height:28 }}/>
          </div>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Nom & Prénoms</th><th>Email</th><th>Téléphone</th>
                  <th>Ville</th><th>Commune</th><th>Situation</th>
                  <th>Militant</th><th>Inscrit le</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {members.length === 0 ? (
                  <tr><td colSpan={10} style={{ textAlign:"center", padding:30, color:"#666" }}>Aucun membre trouvé</td></tr>
                ) : members.map((m,i) => (
                  <tr key={m.id}>
                    <td style={{ color:"#666" }}>{(page-1)*20+i+1}</td>
                    <td><strong>{m.nom} {m.prenoms}</strong></td>
                    <td style={{ color:"#888" }}>{m.email}</td>
                    <td>{m.phone}</td>
                    <td>{m.ville}</td>
                    <td>{m.commune}</td>
                    <td>
                      <Badge color={m.est_etudiant?"green":"gray"}>
                        {m.est_etudiant ? "Étudiant" : m.situation || "—"}
                      </Badge>
                    </td>
                    <td><Badge color={m.est_militant?"orange":"gray"}>{m.est_militant?"Oui":"Non"}</Badge></td>
                    <td style={{ color:"#666", fontSize:"0.78rem" }}>
                      {new Date(m.created_at).toLocaleDateString("fr-FR")}
                    </td>
                    <td>
                      <button onClick={()=>toggle(m.id)} style={{
                        padding:"4px 10px", borderRadius:6, fontSize:"0.75rem", fontWeight:600,
                        border:"none", cursor:"pointer",
                        background: m.is_active?"rgba(239,68,68,0.12)":"rgba(0,154,68,0.12)",
                        color: m.is_active?"#ef4444":"#4ade80",
                      }}>{m.is_active?"Désactiver":"Activer"}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {pages > 1 && (
              <div style={{ display:"flex", justifyContent:"center", gap:8, marginTop:16 }}>
                <Btn variant="secondary" onClick={()=>{ setPage(p=>p-1); load(page-1); }} disabled={page===1}>←</Btn>
                <span style={{ display:"flex", alignItems:"center", color:"#888", fontSize:"0.85rem" }}>
                  Page {page} / {pages}
                </span>
                <Btn variant="secondary" onClick={()=>{ setPage(p=>p+1); load(page+1); }} disabled={page===pages}>→</Btn>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

// ─── ARTICLES ─────────────────────────────────────────────────────────────
function ArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [form,     setForm]     = useState({ title:"", content:"", category:"general", image_url:"", is_published:false });
  const [editing,  setEditing]  = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    setLoading(true);
    apiFetch("/articles/admin/all")
      .then(d => setArticles(d.articles))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.title || !form.content) return;
    setSaving(true);
    try {
      if (editing) {
        await apiFetch(`/articles/${editing}`, { method:"PUT", body:JSON.stringify(form) });
      } else {
        await apiFetch("/articles", { method:"POST", body:JSON.stringify(form) });
      }
      setForm({ title:"", content:"", category:"general", image_url:"", is_published:false });
      setEditing(null); setShowForm(false); load();
    } catch(err) { alert(err.message); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!confirm("Supprimer cet article ?")) return;
    await apiFetch(`/articles/${id}`, { method:"DELETE" });
    load();
  };

  const edit = (a) => {
    setForm({ title:a.title, content:a.content, category:a.category, image_url:a.image_url||"", is_published:a.is_published });
    setEditing(a.id); setShowForm(true);
  };

  return (
    <div className="fade-up">
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:"1.4rem", fontWeight:800 }}>📰 Actualités</h1>
        <Btn onClick={()=>{ setShowForm(s=>!s); setEditing(null); setForm({ title:"", content:"", category:"general", image_url:"", is_published:false }); }}>
          {showForm ? "✕ Annuler" : "+ Nouvel article"}
        </Btn>
      </div>

      {showForm && (
        <Card style={{ marginBottom:20 }}>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:"1rem", fontWeight:700, marginBottom:14 }}>
            {editing ? "Modifier l'article" : "Créer un article"}
          </h2>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <Input label="Titre" placeholder="Titre de l'article" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}/>
            <Input label="Image URL (optionnel)" placeholder="https://..." value={form.image_url} onChange={e=>setForm(f=>({...f,image_url:e.target.value}))}/>
            <div style={{ display:"flex", gap:12 }}>
              <div style={{ flex:1, display:"flex", flexDirection:"column", gap:5 }}>
                <label style={{ fontSize:"0.75rem", fontWeight:600, color:"#888", textTransform:"uppercase", letterSpacing:"0.05em" }}>Catégorie</label>
                <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}
                  style={{ padding:"11px 13px", background:"#1e1e1e", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, color:"#f0f0f0", fontSize:"0.92rem" }}>
                  {["general","politique","evenement","communique"].map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ display:"flex", alignItems:"flex-end", paddingBottom:2 }}>
                <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
                  <input type="checkbox" checked={form.is_published}
                    onChange={e=>setForm(f=>({...f,is_published:e.target.checked}))}
                    style={{ width:16,height:16,accentColor:"#F47920" }}/>
                  <span style={{ fontSize:"0.88rem", color:"#ccc" }}>Publier maintenant</span>
                </label>
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
              <label style={{ fontSize:"0.75rem", fontWeight:600, color:"#888", textTransform:"uppercase", letterSpacing:"0.05em" }}>Contenu</label>
              <textarea value={form.content} onChange={e=>setForm(f=>({...f,content:e.target.value}))}
                rows={8} placeholder="Contenu de l'article..."
                style={{ padding:"11px 13px", background:"#1e1e1e", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, color:"#f0f0f0", fontSize:"0.92rem", resize:"vertical" }}/>
            </div>
            <Btn loading={saving} onClick={save} style={{ alignSelf:"flex-start" }}>
              {!saving && (editing ? "💾 Modifier" : "✅ Publier")}
            </Btn>
          </div>
        </Card>
      )}

      <Card style={{ overflowX:"auto" }}>
        {loading ? <div style={{ display:"flex", justifyContent:"center", padding:40 }}><div className="spinner" style={{ width:28,height:28 }}/></div>
        : <table>
            <thead><tr><th>Titre</th><th>Catégorie</th><th>Statut</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {articles.map(a => (
                <tr key={a.id}>
                  <td style={{ maxWidth:280 }}><strong>{a.title}</strong></td>
                  <td><Badge color="gray">{a.category}</Badge></td>
                  <td><Badge color={a.is_published?"green":"gray"}>{a.is_published?"Publié":"Brouillon"}</Badge></td>
                  <td style={{ color:"#666", fontSize:"0.78rem" }}>{new Date(a.created_at).toLocaleDateString("fr-FR")}</td>
                  <td>
                    <div style={{ display:"flex", gap:6 }}>
                      <button onClick={()=>edit(a)} style={{ padding:"4px 10px", borderRadius:6, fontSize:"0.75rem", fontWeight:600, border:"none", background:"rgba(59,130,246,0.12)", color:"#60a5fa", cursor:"pointer" }}>Modifier</button>
                      <button onClick={()=>del(a.id)} style={{ padding:"4px 10px", borderRadius:6, fontSize:"0.75rem", fontWeight:600, border:"none", background:"rgba(239,68,68,0.12)", color:"#ef4444", cursor:"pointer" }}>Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      </Card>
    </div>
  );
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────
function NotificationsPage() {
  const [form,    setForm]    = useState({ title:"", message:"", type:"info", is_global:true });
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState("");

  const send = async () => {
    if (!form.title || !form.message) return;
    setSaving(true);
    try {
      await apiFetch("/notifications", { method:"POST", body:JSON.stringify(form) });
      setSuccess("Notification envoyée avec succès !");
      setForm({ title:"", message:"", type:"info", is_global:true });
      setTimeout(()=>setSuccess(""), 3000);
    } catch(err) { alert(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="fade-up">
      <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:"1.4rem", fontWeight:800, marginBottom:20 }}>
        🔔 Envoyer une notification
      </h1>
      <Card style={{ maxWidth:580 }}>
        {success && (
          <div style={{ background:"rgba(0,154,68,0.1)", border:"1px solid rgba(0,154,68,0.25)", borderRadius:8, padding:"10px 14px", marginBottom:16, color:"#4ade80", fontSize:"0.87rem" }}>
            {success}
          </div>
        )}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <Input label="Titre" placeholder="Titre de la notification" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}/>
          <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
            <label style={{ fontSize:"0.75rem", fontWeight:600, color:"#888", textTransform:"uppercase", letterSpacing:"0.05em" }}>Message</label>
            <textarea value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))}
              rows={4} placeholder="Contenu de la notification..."
              style={{ padding:"11px 13px", background:"#1e1e1e", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, color:"#f0f0f0", fontSize:"0.92rem", resize:"vertical" }}/>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
              <label style={{ fontSize:"0.75rem", fontWeight:600, color:"#888", textTransform:"uppercase", letterSpacing:"0.05em" }}>Type</label>
              <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}
                style={{ padding:"11px 13px", background:"#1e1e1e", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, color:"#f0f0f0", fontSize:"0.92rem" }}>
                {["info","alerte","evenement"].map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ display:"flex", alignItems:"flex-end", paddingBottom:2 }}>
              <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
                <input type="checkbox" checked={form.is_global}
                  onChange={e=>setForm(f=>({...f,is_global:e.target.checked}))}
                  style={{ width:16,height:16,accentColor:"#F47920" }}/>
                <span style={{ fontSize:"0.88rem", color:"#ccc" }}>Envoyer à tous</span>
              </label>
            </div>
          </div>
          <Btn loading={saving} onClick={send} style={{ alignSelf:"flex-start" }}>
            {!saving && "🔔 Envoyer la notification"}
          </Btn>
        </div>
      </Card>
    </div>
  );
}

// ─── LIENS WHATSAPP ───────────────────────────────────────────────────────
function WhatsappPage() {
  const [links,   setLinks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [form,    setForm]    = useState({ label:"", description:"", url:"", type:"groupe", icon:"💬", ordre:0 });
  const [saving,  setSaving]  = useState(false);
  const [editing, setEditing] = useState(null);

  const load = () => {
    apiFetch("/whatsapp/all")
      .then(d=>setLinks(d.links))
      .catch(console.error)
      .finally(()=>setLoading(false));
  };

  useEffect(()=>{ load(); },[]);

  const save = async () => {
    if (!form.label || !form.url) return;
    setSaving(true);
    try {
      if (editing) {
        await apiFetch(`/whatsapp/${editing}`, { method:"PUT", body:JSON.stringify(form) });
      } else {
        await apiFetch("/whatsapp", { method:"POST", body:JSON.stringify(form) });
      }
      setForm({ label:"", description:"", url:"", type:"groupe", icon:"💬", ordre:0 });
      setEditing(null); load();
    } catch(err) { alert(err.message); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!confirm("Supprimer ce lien ?")) return;
    await apiFetch(`/whatsapp/${id}`, { method:"DELETE" });
    load();
  };

  return (
    <div className="fade-up">
      <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:"1.4rem", fontWeight:800, marginBottom:20 }}>
        💬 Liens WhatsApp
      </h1>

      <Card style={{ marginBottom:20 }}>
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:"1rem", fontWeight:700, marginBottom:14 }}>
          {editing ? "Modifier le lien" : "Ajouter un lien"}
        </h2>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <Input label="Nom du lien" placeholder="Groupe Principal" value={form.label} onChange={e=>setForm(f=>({...f,label:e.target.value}))}/>
          <Input label="Description" placeholder="Description courte" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/>
          <Input label="URL du lien" placeholder="https://chat.whatsapp.com/..." value={form.url} onChange={e=>setForm(f=>({...f,url:e.target.value}))} style={{ gridColumn:"1/-1" }}/>
          <div style={{ display:"flex", gap:12 }}>
            <Input label="Icône" value={form.icon} onChange={e=>setForm(f=>({...f,icon:e.target.value}))} style={{ width:80 }}/>
            <div style={{ flex:1, display:"flex", flexDirection:"column", gap:5 }}>
              <label style={{ fontSize:"0.75rem", fontWeight:600, color:"#888", textTransform:"uppercase", letterSpacing:"0.05em" }}>Type</label>
              <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}
                style={{ padding:"11px 13px", background:"#1e1e1e", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, color:"#f0f0f0", fontSize:"0.92rem" }}>
                {["groupe","chaine","autre"].map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <Input label="Ordre d'affichage" type="number" value={form.ordre} onChange={e=>setForm(f=>({...f,ordre:parseInt(e.target.value)}))}/>
        </div>
        <div style={{ display:"flex", gap:8, marginTop:14 }}>
          <Btn loading={saving} onClick={save}>{!saving&&(editing?"💾 Modifier":"➕ Ajouter")}</Btn>
          {editing && <Btn variant="secondary" onClick={()=>{ setEditing(null); setForm({ label:"", description:"", url:"", type:"groupe", icon:"💬", ordre:0 }); }}>Annuler</Btn>}
        </div>
      </Card>

      <Card>
        {loading ? <div style={{ display:"flex", justifyContent:"center", padding:30 }}><div className="spinner" style={{ width:24,height:24 }}/></div>
        : links.map(l => (
          <div key={l.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
            <span style={{ fontSize:"1.4rem" }}>{l.icon}</span>
            <div style={{ flex:1 }}>
              <p style={{ fontWeight:600, fontSize:"0.9rem" }}>{l.label}</p>
              <p style={{ color:"#666", fontSize:"0.78rem" }}>{l.url.slice(0,50)}...</p>
            </div>
            <Badge color={l.is_active?"green":"gray"}>{l.is_active?"Actif":"Inactif"}</Badge>
            <div style={{ display:"flex", gap:6 }}>
              <button onClick={()=>{ setEditing(l.id); setForm({ label:l.label, description:l.description||"", url:l.url, type:l.type, icon:l.icon, ordre:l.ordre, is_active:l.is_active }); }}
                style={{ padding:"4px 10px", borderRadius:6, fontSize:"0.75rem", fontWeight:600, border:"none", background:"rgba(59,130,246,0.12)", color:"#60a5fa", cursor:"pointer" }}>Modifier</button>
              <button onClick={()=>del(l.id)}
                style={{ padding:"4px 10px", borderRadius:6, fontSize:"0.75rem", fontWeight:600, border:"none", background:"rgba(239,68,68,0.12)", color:"#ef4444", cursor:"pointer" }}>Supprimer</button>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ─── ADMINS ───────────────────────────────────────────────────────────────
function AdminsPage() {
  const { admin }  = useAdmin();
  const [form,    setForm]    = useState({ fullname:"", email:"", password:"", role:"admin" });
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState("");
  const [error,   setError]   = useState("");

  if (admin?.role !== "super_admin") {
    return (
      <div className="fade-up">
        <Card style={{ textAlign:"center", padding:40 }}>
          <p style={{ fontSize:"2rem", marginBottom:12 }}>🔒</p>
          <p style={{ color:"#888" }}>Seul le Super Admin peut accéder à cette section.</p>
        </Card>
      </div>
    );
  }

  const create = async () => {
    if (!form.fullname || !form.email || !form.password) { setError("Tous les champs sont requis."); return; }
    setSaving(true); setError("");
    try {
      await apiFetch("/admin/create", { method:"POST", body:JSON.stringify(form) });
      setSuccess("Administrateur créé avec succès !");
      setForm({ fullname:"", email:"", password:"", role:"admin" });
      setTimeout(()=>setSuccess(""), 3000);
    } catch(err) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="fade-up">
      <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:"1.4rem", fontWeight:800, marginBottom:20 }}>
        🔐 Gérer les administrateurs
      </h1>
      <Card style={{ maxWidth:500 }}>
        {success && <div style={{ background:"rgba(0,154,68,0.1)", border:"1px solid rgba(0,154,68,0.25)", borderRadius:8, padding:"10px 14px", marginBottom:16, color:"#4ade80", fontSize:"0.87rem" }}>{success}</div>}
        {error   && <div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:8, padding:"10px 14px", marginBottom:16, color:"#ef4444", fontSize:"0.87rem" }}>{error}</div>}
        <div style={{ display:"flex", flexDirection:"column", gap:13 }}>
          <Input label="Nom complet" placeholder="Prénom Nom" value={form.fullname} onChange={e=>setForm(f=>({...f,fullname:e.target.value}))}/>
          <Input label="Email" type="email" placeholder="admin@rhdp-gi.ci" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/>
          <Input label="Mot de passe" type="password" placeholder="Minimum 6 caractères" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))}/>
          <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
            <label style={{ fontSize:"0.75rem", fontWeight:600, color:"#888", textTransform:"uppercase", letterSpacing:"0.05em" }}>Rôle</label>
            <select value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))}
              style={{ padding:"11px 13px", background:"#1e1e1e", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, color:"#f0f0f0", fontSize:"0.92rem" }}>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          <Btn loading={saving} onClick={create}>{!saving&&"➕ Créer l'administrateur"}</Btn>
        </div>
      </Card>
    </div>
  );
}

// ─── APP PRINCIPALE ───────────────────────────────────────────────────────
export default function AdminApp() {
  const [admin,  setAdmin]  = useState(() => {
    try { return JSON.parse(localStorage.getItem("rhdp_admin")); } catch { return null; }
  });
  const [page, setPage] = useState("dashboard");

  const logout = () => {
    localStorage.removeItem("rhdp_admin_token");
    localStorage.removeItem("rhdp_admin");
    setAdmin(null);
  };

  const PAGES = {
    dashboard:     <DashboardPage/>,
    members:       <MembersPage/>,
    articles:      <ArticlesPage/>,
    notifications: <NotificationsPage/>,
    whatsapp:      <WhatsappPage/>,
    admins:        <AdminsPage/>,
  };

  return (
    <AdminContext.Provider value={{ admin }}>
      <GlobalStyles/>
      {!admin ? (
        <LoginPage onLogin={setAdmin}/>
      ) : (
        <div style={{ display:"flex", minHeight:"100vh" }}>
          <Sidebar page={page} setPage={setPage} admin={admin} onLogout={logout}/>
          <main style={{ marginLeft:220, flex:1, padding:"28px 24px", minWidth:0 }}>
            {PAGES[page]}
          </main>
        </div>
      )}
    </AdminContext.Provider>
  );
}