// src/Onboarding.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from './services/axiosConfig';

function getParam(name) {
  const sp = new URLSearchParams(window.location.search);
  return sp.get(name);
}

function getTempToken() {
  // Acepta varios nombres por compatibilidad
  return (
    getParam('temp_token') ||
    getParam('tempToken') ||
    getParam('temp') ||
    getParam('token') || // fallback si el backend usa 'token' para el temporal
    localStorage.getItem('onboarding_temp_token') ||
    ''
  );
}

export default function Onboarding({ onLogin }) {
  const navigate = useNavigate();

  const [rol, setRol] = useState('alumno'); // 'alumno' | 'docente'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Datos opcionales para UI
  const name = useMemo(() => getParam('name') || '', []);
  const email = useMemo(() => getParam('email') || '', []);
  const picture = useMemo(() => getParam('picture') || '', []);
  const tempToken = useMemo(() => getTempToken(), []);

  // Si no hay token temporal, devolvemos a /login
  useEffect(() => {
    if (!tempToken) {
      navigate('/login?error=missing_onboarding_token', { replace: true });
    } else {
      // Persistimos por si el usuario recarga
      localStorage.setItem('onboarding_temp_token', tempToken);
    }
  }, [tempToken, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    if (!tempToken) {
      setError('Falta el token temporal de onboarding.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await axiosInstance.post(
        '/api/auth/complete-profile',
        { rol }, // 'alumno' | 'docente'
        { headers: { Authorization: `Bearer ${tempToken}` } }
      );

      const { token, usuario } = data || {};
      if (!token || !usuario) throw new Error('Respuesta inválida del servidor');

      // Limpia token temporal
      localStorage.removeItem('onboarding_temp_token');

      // Guarda sesión final
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));
      if (typeof onLogin === 'function') onLogin(usuario, token);

      navigate('/', { replace: true });
    } catch (err) {
      console.error('[Onboarding] error', err);
      if (err?.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err?.response) {
        setError('Error desconocido: ' + JSON.stringify(err.response.data));
      } else if (err?.request) {
        setError('No hubo respuesta del servidor.');
      } else {
        setError('Error inesperado: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={{ display: 'grid', placeItems: 'center', gap: 10 }}>
          {picture ? (
            <img
              src={picture}
              alt="avatar"
              referrerPolicy="no-referrer"
              style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : null}
          <h2 style={{ margin: 0 }}>¡Bienvenido{ name ? `, ${name}` : '' }!</h2>
          {email ? <p style={{ margin: 0, opacity: 0.8 }}>{email}</p> : null}
          <p style={{ marginTop: 8, opacity: 0.8, textAlign: 'center' }}>
            Elige tu rol para completar tu perfil.
          </p>
        </div>

        <form onSubmit={submit} style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <div style={styles.roleBox}>
            <label style={styles.radio}>
              <input
                type="radio"
                name="rol"
                value="alumno"
                checked={rol === 'alumno'}
                onChange={(e) => setRol(e.target.value)}
              />
              Alumno
            </label>
            <label style={styles.radio}>
              <input
                type="radio"
                name="rol"
                value="docente"
                checked={rol === 'docente'}
                onChange={(e) => setRol(e.target.value)}
              />
              Profesor
            </label>
          </div>

          <button type="submit" disabled={loading} style={styles.primaryBtn}>
            {loading ? 'Guardando…' : 'Continuar'}
          </button>
        </form>

        {error ? <div style={styles.error}>{error}</div> : null}

        <button
          type="button"
          onClick={() => navigate('/login', { replace: true })}
          style={styles.linkBtn}
        >
          ¿No eres tú? Volver al inicio de sesión
        </button>
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
    maxWidth: 480,
    background: '#fff',
    borderRadius: 16,
    padding: 24,
    boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
  },
  roleBox: {
    display: 'flex',
    gap: 16,
    alignItems: 'center',
    border: '1px solid #dadde5',
    borderRadius: 10,
    padding: '10px 12px',
  },
  radio: { display: 'flex', alignItems: 'center', gap: 6 },
  primaryBtn: {
    border: 'none',
    borderRadius: 10,
    padding: '10px 12px',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    background: '#111827',
    color: '#fff',
  },
  linkBtn: {
    marginTop: 10,
    background: 'none',
    border: 'none',
    color: '#2563eb',
    cursor: 'pointer',
    padding: 0,
    textDecoration: 'underline',
    fontSize: 14,
  },
  error: {
    marginTop: 12,
    color: '#b91c1c',
    background: '#fee2e2',
    border: '1px solid #fecaca',
    padding: '8px 10px',
    borderRadius: 8,
    fontSize: 14,
  },
};