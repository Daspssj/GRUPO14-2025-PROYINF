// src/OAuthSuccess.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Lee un parámetro desde ?query o #hash (por compatibilidad)
 */
function readParam(name) {
  const fromSearch = new URLSearchParams(window.location.search).get(name);
  if (fromSearch) return fromSearch;
  const hash = window.location.hash?.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
  if (!hash) return null;
  return new URLSearchParams(hash).get(name);
}

/**
 * Intenta parsear el parámetro "usuario" que puede venir:
 * - como JSON plano
 * - url-encoded (una o dos veces)
 * - en base64 (url-safe) de JSON
 */
function parseUsuarioParam(raw) {
  if (!raw) return null;

  // 1) Intento: JSON directo
  try {
    const obj = JSON.parse(raw);
    if (obj && typeof obj === 'object') return obj;
  } catch {}

  // 2) Intento: decodeURIComponent 1 o 2 veces y luego JSON
  try {
    const once = decodeURIComponent(raw);
    try {
      const obj = JSON.parse(once);
      if (obj && typeof obj === 'object') return obj;
    } catch {
      const twice = decodeURIComponent(once);
      const obj = JSON.parse(twice);
      if (obj && typeof obj === 'object') return obj;
    }
  } catch {}

  // 3) Intento: base64 (url-safe) -> JSON
  try {
    const normalized = raw.replace(/-/g, '+').replace(/_/g, '/');
    // padding base64
    const pad = normalized.length % 4 === 0 ? normalized : normalized + '='.repeat(4 - (normalized.length % 4));
    const json = atob(pad);
    const obj = JSON.parse(json);
    if (obj && typeof obj === 'object') return obj;
  } catch {}

  return null;
}

export default function OAuthSuccess({ onLogin }) {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const token = useMemo(() => readParam('token'), []);
  const usuarioRaw = useMemo(() => readParam('usuario'), []);
  const usuario = useMemo(() => parseUsuarioParam(usuarioRaw), [usuarioRaw]);

  useEffect(() => {
    // Si falta token o usuario, volvemos a /login con error
    if (!token || !usuario) {
      setError('No se pudo completar el inicio de sesión con Google.');
      const t = setTimeout(() => navigate('/login?error=oauth_failed', { replace: true }), 1200);
      return () => clearTimeout(t);
    }

    try {
      // Guarda sesión
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));

      // Notifica a la app
      if (typeof onLogin === 'function') onLogin(usuario, token);

      // Limpia la URL actual (opcional) y redirige al panel
      window.history.replaceState({}, document.title, '/oauth-success');
      navigate('/', { replace: true });
    } catch (e) {
      console.error('[OAuthSuccess] error guardando sesión', e);
      setError('Ocurrió un error guardando tu sesión.');
      const t = setTimeout(() => navigate('/login?error=storage_failed', { replace: true }), 1200);
      return () => clearTimeout(t);
    }
  }, [token, usuario, navigate, onLogin]);

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={{ margin: 0 }}>Conectando con tu cuenta…</h2>
        <p style={{ opacity: 0.8, marginTop: 8 }}>
          {error ? error : 'Un momento por favor.'}
        </p>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: '100svh',
    display: 'grid',
    placeItems: 'center',
    background: '#f6f7fb',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    background: '#fff',
    borderRadius: 16,
    padding: 24,
    boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
    textAlign: 'center',
  },
};