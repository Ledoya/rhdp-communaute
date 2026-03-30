import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { path:"/dashboard",   icon:"🏠", label:"Accueil" },
  { path:"/actualites",  icon:"📰", label:"Actualités" },
  { path:"/communaute",  icon:"💬", label:"Communauté" },
  { path:"/profile",     icon:"👤", label:"Mon profil" },
];

export default function Layout({ children }) {
  const { user, logout }   = useAuth();
  const location           = useLocation();
  const navigate           = useNavigate();
  const [menuOpen, setMenu] = useState(false);

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex" }}>

      {/* ── Sidebar desktop ─────────────────────────────────── */}
      <aside style={{
        width:230, background:"var(--bg2)",
        borderRight:"1px solid var(--border)",
        display:"flex", flexDirection:"column",
        position:"fixed", top:0, left:0, bottom:0,
        zIndex:100,
        // Masqué sur mobile
        ...(menuOpen ? {} : { transform: window.innerWidth < 768 ? "translateX(-100%)" : "none" }),
      }}>
        {/* Logo */}
        <div style={{ padding:"20px 16px 16px", borderBottom:"1px solid var(--border)" }}>
          <div style={{ display:"flex", gap:4, marginBottom:10 }}>
            {["#F47920","rgba(255,255,255,0.15)","#009A44"].map((c,i)=>
              <div key={i} style={{ width:18,height:3,borderRadius:99,background:c }}/>
            )}
          </div>
          <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"0.95rem", color:"white", lineHeight:1.3 }}>
            Génération Impact
          </p>
          <p style={{ color:"var(--orange)", fontSize:"0.72rem", fontWeight:700, letterSpacing:"0.08em" }}>
            RHDP
          </p>
        </div>

        {/* User info */}
        <div style={{ padding:"14px 16px", borderBottom:"1px solid var(--border)" }}>
          <div style={{
            width:38, height:38, borderRadius:"50%",
            background:"linear-gradient(135deg, var(--orange), var(--orange-dark))",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontWeight:700, color:"white", fontSize:"0.95rem", marginBottom:8,
          }}>
            {user?.nom?.[0]?.toUpperCase() || "?"}
          </div>
          <p style={{ fontWeight:600, fontSize:"0.9rem", color:"white" }}>
            {user?.prenoms} {user?.nom}
          </p>
          <span className={`badge ${user?.est_militant ? "badge-green" : "badge-gray"}`}
            style={{ marginTop:4 }}>
            {user?.est_militant ? "Militant" : "Membre"}
          </span>
        </div>

        {/* Navigation */}
        <nav style={{ flex:1, padding:"10px 10px" }}>
          {NAV.map(({ path, icon, label }) => {
            const active = location.pathname === path;
            return (
              <Link key={path} to={path}
                style={{
                  display:"flex", alignItems:"center", gap:10,
                  padding:"11px 12px", borderRadius:8, marginBottom:2,
                  background: active ? "rgba(244,121,32,0.12)" : "transparent",
                  border: `1px solid ${active ? "rgba(244,121,32,0.3)" : "transparent"}`,
                  color: active ? "var(--orange)" : "var(--text2)",
                  fontWeight: active ? 600 : 400,
                  fontSize:"0.9rem", transition:"all 0.2s",
                }}
                onMouseEnter={e=>{ if(!active) e.currentTarget.style.background="rgba(255,255,255,0.04)"; }}
                onMouseLeave={e=>{ if(!active) e.currentTarget.style.background="transparent"; }}
              >
                <span style={{ fontSize:"1rem" }}>{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Déconnexion */}
        <div style={{ padding:"12px 10px", borderTop:"1px solid var(--border)" }}>
          <button onClick={handleLogout}
            style={{
              width:"100%", padding:"10px 12px",
              background:"transparent", border:"1px solid var(--border)",
              borderRadius:8, color:"var(--text2)", fontSize:"0.88rem",
              display:"flex", alignItems:"center", gap:8, transition:"all 0.2s",
            }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor="#ef4444"; e.currentTarget.style.color="#ef4444"; }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.color="var(--text2)"; }}
          >
            🚪 Déconnexion
          </button>
        </div>
      </aside>

      {/* ── Mobile overlay ───────────────────────────────────── */}
      {menuOpen && (
        <div onClick={()=>setMenu(false)} style={{
          position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:99,
        }}/>
      )}

      {/* ── Contenu principal ────────────────────────────────── */}
      <div style={{ flex:1, marginLeft: window.innerWidth >= 768 ? 230 : 0, minWidth:0 }}>

        {/* Topbar mobile */}
        <div style={{
          background:"var(--bg2)", borderBottom:"1px solid var(--border)",
          padding:"12px 16px", display:"flex", alignItems:"center",
          justifyContent:"space-between", position:"sticky", top:0, zIndex:90,
        }}>
          <button onClick={()=>setMenu(m=>!m)}
            style={{ background:"none", border:"none", color:"white", fontSize:"1.2rem" }}>
            ☰
          </button>
          <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"0.95rem", color:"white" }}>
            GI <span style={{ color:"var(--orange)" }}>RHDP</span>
          </p>
          <Link to="/profile" style={{ fontSize:"1.2rem" }}>👤</Link>
        </div>

        <main style={{ padding:"24px 16px 48px" }}>
          {children}
        </main>
      </div>
    </div>
  );
}