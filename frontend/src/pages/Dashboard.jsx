// ═══════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export function Dashboard() {
  const { user }   = useAuth();
  const [articles, setArticles]   = useState([]);
  const [notifs,   setNotifs]     = useState([]);
  const [links,    setLinks]      = useState([]);
  const [loading,  setLoading]    = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/articles?limit=3"),
      api.get("/notifications"),
      api.get("/whatsapp"),
    ]).then(([a, n, w]) => {
      setArticles(a.data.articles || []);
      setNotifs(n.data.notifications || []);
      setLinks(w.data.links || []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const unread = notifs.filter(n => !n.is_read).length;

  if (loading) return (
    <Layout>
      <div style={{ display:"flex", justifyContent:"center", paddingTop:60 }}>
        <div className="spinner" style={{ width:36,height:36 }}/>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div style={{ maxWidth:800, margin:"0 auto" }}>

        {/* Bienvenue */}
        <div className="card fade-up" style={{
          background:"linear-gradient(135deg, rgba(244,121,32,0.12), rgba(0,154,68,0.08))",
          border:"1px solid rgba(244,121,32,0.2)", marginBottom:20,
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{
              width:54, height:54, borderRadius:"50%",
              background:"linear-gradient(135deg, var(--orange), var(--orange-dark))",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontWeight:800, color:"white", fontSize:"1.3rem", flexShrink:0,
            }}>{user?.nom?.[0]?.toUpperCase()}</div>
            <div>
              <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:"1.2rem", fontWeight:800 }}>
                Bonjour, {user?.prenoms} 👋
              </h1>
              <p style={{ color:"var(--text2)", fontSize:"0.85rem", marginTop:2 }}>
                Bienvenue dans la Communauté Génération Impact RHDP
              </p>
            </div>
            <span className={`badge ${user?.est_militant ? "badge-green" : "badge-orange"}`}
              style={{ marginLeft:"auto" }}>
              {user?.est_militant ? "Militant" : "Membre"}
            </span>
          </div>
        </div>

        {/* Stats rapides */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:20 }}>
          {[
            { icon:"📰", label:"Actualités",    value:articles.length, link:"/actualites" },
            { icon:"🔔", label:"Notifications", value:unread,          link:"/dashboard"  },
            { icon:"💬", label:"Groupes",       value:links.length,    link:"/communaute" },
          ].map((s,i) => (
            <Link key={i} to={s.link} className="card" style={{
              textAlign:"center", transition:"transform 0.2s, border-color 0.2s",
              cursor:"pointer",
            }}
              onMouseEnter={e=>e.currentTarget.style.borderColor="var(--orange)"}
              onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border)"}
            >
              <div style={{ fontSize:"1.6rem", marginBottom:6 }}>{s.icon}</div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:"1.5rem", fontWeight:800, color:"var(--orange)" }}>
                {s.value}
              </div>
              <div style={{ color:"var(--text2)", fontSize:"0.78rem" }}>{s.label}</div>
            </Link>
          ))}
        </div>

        {/* Notifications */}
        {notifs.length > 0 && (
          <div className="card fade-up" style={{ marginBottom:20 }}>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:"1rem", fontWeight:700, marginBottom:14 }}>
              🔔 Notifications
            </h2>
            {notifs.slice(0,3).map(n => (
              <div key={n.id} style={{
                padding:"10px 12px", borderRadius:8, marginBottom:8,
                background: n.is_read ? "var(--bg3)" : "rgba(244,121,32,0.07)",
                border:`1px solid ${n.is_read ? "var(--border)" : "rgba(244,121,32,0.2)"}`,
              }}>
                <p style={{ fontWeight:600, fontSize:"0.9rem" }}>{n.title}</p>
                <p style={{ color:"var(--text2)", fontSize:"0.82rem", marginTop:3 }}>{n.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* Dernières actualités */}
        <div className="card fade-up" style={{ marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:"1rem", fontWeight:700 }}>
              📰 Dernières actualités
            </h2>
            <Link to="/actualites" style={{ color:"var(--orange)", fontSize:"0.82rem", fontWeight:600 }}>
              Voir tout →
            </Link>
          </div>
          {articles.length === 0 ? (
            <p style={{ color:"var(--text2)", fontSize:"0.88rem", textAlign:"center", padding:"20px 0" }}>
              Aucune actualité pour le moment.
            </p>
          ) : articles.map(a => (
            <Link key={a.id} to={`/actualites/${a.id}`}
              style={{ display:"block", padding:"12px", borderRadius:8, marginBottom:8,
                background:"var(--bg3)", border:"1px solid var(--border)", transition:"all 0.2s" }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor="var(--orange)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor="var(--border)"; }}
            >
              <span className="badge badge-orange" style={{ marginBottom:6 }}>{a.category}</span>
              <p style={{ fontWeight:600, fontSize:"0.92rem" }}>{a.title}</p>
              <p style={{ color:"var(--text2)", fontSize:"0.8rem", marginTop:4 }}>
                {new Date(a.created_at).toLocaleDateString("fr-FR")}
              </p>
            </Link>
          ))}
        </div>

        {/* Liens WhatsApp rapides */}
        {links.length > 0 && (
          <div className="card fade-up">
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
              <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:"1rem", fontWeight:700 }}>
                💬 Rejoindre la communauté
              </h2>
              <Link to="/communaute" style={{ color:"var(--orange)", fontSize:"0.82rem", fontWeight:600 }}>
                Voir tout →
              </Link>
            </div>
            {links.slice(0,2).map(l => (
              <a key={l.id} href={l.url} target="_blank" rel="noopener noreferrer"
                style={{
                  display:"flex", alignItems:"center", gap:12,
                  padding:"12px", borderRadius:8, marginBottom:8,
                  background:"var(--bg3)", border:"1px solid var(--border)",
                  transition:"all 0.2s",
                }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor="var(--green)"; }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor="var(--border)"; }}
              >
                <span style={{ fontSize:"1.3rem" }}>{l.icon}</span>
                <div style={{ flex:1 }}>
                  <p style={{ fontWeight:600, fontSize:"0.9rem" }}>{l.label}</p>
                  <p style={{ color:"var(--text2)", fontSize:"0.78rem" }}>{l.description}</p>
                </div>
                <span style={{ color:"var(--text2)" }}>›</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
export default Dashboard;