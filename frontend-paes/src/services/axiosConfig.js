// frontend-paes/src/services/axiosConfig.js
import axios from 'axios';

/** Detecta si estamos en localhost (dev) */
const isLocalhost = () => typeof window !== 'undefined' && window.location.hostname === 'localhost';

/** Base URL:
 * - Si defines REACT_APP_API_URL => se usa esa (ej: http://localhost:80).
 * - Si NO, y estás en localhost => usa http://localhost:80 (gateway por defecto).
 * - Si NO y NO estás en localhost => usa rutas relativas (misma origin) "".
 */
const baseURL =
  process.env.REACT_APP_API_URL ||
  (isLocalhost() ? 'http://localhost:80' : ''); // <- clave para dev

/** Helper: obtiene el token desde storage con fallbacks */
function getToken() {
  return (
    localStorage.getItem('token') ||
    localStorage.getItem('accessToken') ||
    sessionStorage.getItem('token') ||
    sessionStorage.getItem('accessToken') ||
    null
  );
}

const axiosInstance = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  // withCredentials: false, // usa true solo si trabajas con cookies de sesión
});

// === Request: adjunta token automáticamente (si no viene ya) ===
axiosInstance.interceptors.request.use(
  (cfg) => {
    const token = getToken();
    const hasAuth = !!cfg.headers?.Authorization;
    if (token && !hasAuth) {
      // evita prefijos duplicados
      const header = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      cfg.headers.Authorization = header;
    }
    return cfg;
  },
  (error) => Promise.reject(error)
);

// === Response: manejo centralizado 401/403 ===
let onUnauthorized = null;
let lastKick = 0; // anti-bucle: evita múltiples redirecciones seguidas

export function setOnUnauthorized(fn) {
  onUnauthorized = fn;
}

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || "";
    const isApiCall = url.includes("/api/");

    // Extrae un posible código del backend para diferenciar causas
    const code = error?.response?.data?.error || error?.response?.data?.code || "";

    // ¿Es claramente un problema de token?
    const isAuthEndpoint = /\/api\/auth\//.test(url);
    const isTokenIssue =
      code?.toLowerCase().includes("token") || // ej: "invalid_token", "token_expired"
      error?.response?.headers?.["www-authenticate"]; // algunos backends lo mandan

    if (isApiCall && (status === 401 || status === 403)) {
      if (isAuthEndpoint || isTokenIssue) {
        // => token inválido/expirado: limpiar y notificar
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("usuario");
        const now = Date.now();
        if (typeof onUnauthorized === "function" && now - lastKick > 1000) {
          lastKick = now;
          try { onUnauthorized(); } catch {}
        }
      } else {
        // No es un tema de token: devolvemos el error al caller sin limpiar sesión
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;