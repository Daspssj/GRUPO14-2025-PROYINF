// src/App.jsx
import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Login from './Login';
import PanelAlumno from './PanelAlumno';
import PanelDocente from './PanelDocente';
import OAuthSuccess from './OAuthSuccess';
import Onboarding from './Onboarding';
import ResolverEnsayo from './ResolverEnsayo';          // 👈 IMPORTANTE
import { setOnUnauthorized } from './services/axiosConfig';

function AppInner() {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const t = localStorage.getItem('token');
    const u = localStorage.getItem('usuario');
    if (t && u) {
      setToken(t);
      try { setUsuario(JSON.parse(u)); } catch {}
    }
  }, []);

  useEffect(() => {
    setOnUnauthorized(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      setToken(null);
      setUsuario(null);
      navigate('/login', { replace: true });
    });
  }, [navigate]);

  useEffect(() => {
    if (usuario && location.pathname === '/login') {
      navigate('/', { replace: true });
    }
  }, [usuario, location.pathname, navigate]);

  const onLogin = (usr, tok) => {
    if (tok) {
      localStorage.setItem('token', tok);
      setToken(tok);
    }
    if (usr) {
      localStorage.setItem('usuario', JSON.stringify(usr));
      setUsuario(usr);
    }
  };

  const onAuthUpdate = ({ usuario: usr, token: tok } = {}) => {
    if (tok) {
      localStorage.setItem('token', tok);
      setToken(tok);
    }
    if (usr) {
      localStorage.setItem('usuario', JSON.stringify(usr));
      setUsuario(usr);
    }
  };

  const onLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setToken(null);
    setUsuario(null);
    navigate('/login', { replace: true });
  };

  const isAuthed = !!usuario;

  return (
    <Routes>
      <Route path="/login" element={<Login onLogin={onLogin} />} />
      <Route path="/oauth-success" element={<OAuthSuccess onLogin={onLogin} />} />
      <Route path="/onboarding" element={<Onboarding onLogin={onLogin} />} />

      {/* 👇 Ruta protegida para resolver el ensayo */}
      <Route
        path="/resolver/:resultado_id"
        element={
          !isAuthed ? (
            <Navigate to="/login" replace />
          ) : (
            <ResolverEnsayo />
          )
        }
      />

      {/* Panel principal */}
      <Route
        path="/"
        element={
          !isAuthed ? (
            <Navigate to="/login" replace />
          ) : usuario.rol === 'docente' ? (
            <PanelDocente usuario={usuario} onLogout={onLogout} />
          ) : (
            <PanelAlumno usuario={usuario} onLogout={onLogout} onAuthUpdate={onAuthUpdate} />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return <AppInner />;
}