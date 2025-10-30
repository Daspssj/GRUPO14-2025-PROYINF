// src/PanelAlumno.jsx
import React, { useState, useMemo } from 'react';
import VerEnsayos from './VerEnsayos';
import './PanelAlumno.css';
import VerResultados from './VerResultadosAlumno';

function decodeSubFromJwt(token) {
  try {
    if (!token) return null;
    const [, payload] = token.split('.');
    if (!payload) return null;
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return json?.sub ?? null;
  } catch { return null; }
}

const PanelAlumno = ({ usuario, onLogout }) => {
  const [seccion, setSeccion] = useState('ensayos');

  const alumnoId = useMemo(() => {
    const direct =
      usuario?.id ??
      usuario?.user?.id ??
      usuario?.usuario?.id ??
      usuario?.usuario_id ??
      null;
    if (direct) return direct;
    const tok = localStorage.getItem('token') || localStorage.getItem('accessToken');
    const sub = decodeSubFromJwt(tok);
    return sub ? (typeof sub === 'string' ? parseInt(sub, 10) || sub : sub) : null;
  }, [usuario]);

  return (
    <div className="panel-alumno">
      <header className="panel-header">
        <h1>Bienvenido, {usuario?.nombre || 'Usuario'}</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onLogout}>Cerrar sesión</button>
        </div>
      </header>

      <nav className="panel-nav">
        <button
          className={seccion === 'ensayos' ? 'active' : ''}
          onClick={() => setSeccion('ensayos')}
        >
          📘 Ensayos disponibles
        </button>
        <button
          className={seccion === 'resultados' ? 'active' : ''}
          onClick={() => setSeccion('resultados')}
        >
          📊 Mis resultados
        </button>
      </nav>

      <main className="panel-main">
        {seccion === 'ensayos' && <VerEnsayos alumnoId={alumnoId} />}
        {seccion === 'resultados' && <VerResultados alumnoId={alumnoId} />}
      </main>
    </div>
  );
};

export default PanelAlumno;