import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function Login() {
  const navigate  = useNavigate();
  const { login } = useAuth();

  const [form,     setForm]     = useState({ email:"", password:"" });
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [showPass, setShowPass] = useState(false);

  const set = (k,v) => { setForm(f=>({...f,[k]:v})); setError(""); };

  const submit = async (e) => {
    e?.preventDefault();
    if (!form.email || !form.password) {
      setError("Email et mot de passe requis.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      login(data.token, data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight:"100vh", background:"var(--bg)",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      padding:"24px 16px",
    }}>
      {/* Logo */}
      <div style={{ textAlign:"center", marginBottom:32 }}>
        <div style={{ display:"flex", justifyContent:"center", gap:6, marginBottom:14 }}>
          {["#F47920","rgba(255,255,255,0.15)","#009A44"].map((c,i) =>
            <div key={i} style={{ width:28, height:5, borderRadius:99, background:c }}/>
          )}
        </div>
        <h1 style={{
          fontFamily:"'Syne',sans-serif", fontSize:"1.6rem", fontWeight:800, color:"white"
        }}>
          Génération Impact <span style={{ color:"var(--orange)" }}>RHDP</span>
        </h1>
        <p style={{ color:"var(--text2)", fontSize:"0.88rem", marginTop:6 }}>
          Connectez-vous à votre espace membre
        </p>
      </div>

      {/* Card */}
      <div className="card fade-up" style={{ width:"100%", maxWidth:420 }}>
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:"1.2rem", fontWeight:700, marginBottom:20 }}>
          Connexion
        </h2>

        {error && (
          <div style={{
            background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)",
            borderRadius:8, padding:"11px 14px", marginBottom:16,
            color:"#ef4444", fontSize:"0.87rem"
          }}>{error}</div>
        )}

        <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div className="input-group">
            <label>Adresse e-mail <span>*</span></label>
            <input type="email" className="input-field"
              placeholder="exemple@gmail.com"
              value={form.email} onChange={e=>set("email",e.target.value)}
              autoComplete="email"/>
          </div>

          <div className="input-group">
            <label>Mot de passe <span>*</span></label>
            <div style={{ position:"relative" }}>
              <input
                type={showPass ? "text" : "password"}
                className="input-field"
                placeholder="Votre mot de passe"
                value={form.password} onChange={e=>set("password",e.target.value)}
                autoComplete="current-password"
                style={{ paddingRight:44 }}
              />
              <button type="button"
                onClick={()=>setShowPass(p=>!p)}
                style={{
                  position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
                  background:"none", border:"none", color:"var(--text2)", fontSize:"1rem",
                }}
              >{showPass ? "🙈" : "👁️"}</button>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop:6 }}>
            {loading ? <><div className="spinner"/>Connexion...</> : "Se connecter →"}
          </button>
        </form>

        <p style={{ textAlign:"center", marginTop:20, color:"var(--text2)", fontSize:"0.85rem" }}>
          Pas encore membre ?{" "}
          <Link to="/register" style={{ color:"var(--orange)", fontWeight:600 }}>
            S'inscrire
          </Link>
        </p>
      </div>

      <p style={{ color:"var(--text2)", fontSize:"0.75rem", marginTop:24, opacity:0.5 }}>
        © 2025 Communauté Génération Impact RHDP
      </p>
    </div>
  );
}