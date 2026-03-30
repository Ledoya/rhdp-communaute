import axios from "axios";

const baseUrl = import.meta.env.VITE_API_URL || "https://rhdp-communaute-production.up.railway.app/api";

const api = axios.create({
  baseURL: baseUrl,
  timeout: 15000,
});

// ── Injecte le token JWT automatiquement ──────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("rhdp_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Gestion globale des erreurs ───────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem("rhdp_token");
      localStorage.removeItem("rhdp_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;