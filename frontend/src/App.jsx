import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Register  from "./pages/Register";
import Login     from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile   from "./pages/Profile";
import Articles  from "./pages/Articles";
import ArticleDetail from "./pages/ArticleDetail";
import Whatsapp  from "./pages/Whatsapp";

// ── Route protégée (membre connecté) ─────────────────────────────────────
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh" }}>
      <div className="spinner" style={{ width:36, height:36 }} />
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

// ── Route publique (redirige si déjà connecté) ────────────────────────────
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to="/dashboard" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"         element={<Navigate to="/login" replace />} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />

      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/profile"   element={<PrivateRoute><Profile /></PrivateRoute>} />
      <Route path="/actualites" element={<PrivateRoute><Articles /></PrivateRoute>} />
      <Route path="/actualites/:id" element={<PrivateRoute><ArticleDetail /></PrivateRoute>} />
      <Route path="/communaute" element={<PrivateRoute><Whatsapp /></PrivateRoute>} />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}