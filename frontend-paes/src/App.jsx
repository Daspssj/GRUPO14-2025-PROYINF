import React, { useState, useEffect } from 'react';
import Login from './Login';
import PanelAlumno from './PanelAlumno';
import PanelDocente from './PanelDocente';

const App = () => {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('usuario');
    if (stored) setUsuario(JSON.parse(stored));
  }, []);

  const handleLogin = (user) => {
    setUsuario(user);
    localStorage.setItem('usuario', JSON.stringify(user));
  };

  const handleLogout = () => {
    localStorage.clear(); // limpiar token y usuario
    setUsuario(null);     // volver al login
  };

  // 👇 VALIDACIÓN A PRUEBA DE TODO
  if (!usuario || !usuario.rol) {
    return <Login onLogin={handleLogin} />;
  }

  if (usuario.rol === 'docente') {
    return <PanelDocente usuario={usuario} onLogout={handleLogout} />;
  }

  return <PanelAlumno usuario={usuario} onLogout={handleLogout} />;
};

export default App;
