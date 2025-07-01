import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom'; 
import Login from './Login';
import PanelAlumno from './PanelAlumno';
import PanelDocente from './PanelDocente';
import VerEnsayos from './VerEnsayos';       
import ResolverEnsayo from './ResolverEnsayo';
import VerResultadosAlumno from './VerResultadosAlumno'; 
import VerResultadosDocente from './VerResultadosDocente';
 
const App = () => {
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate(); 

  useEffect(() => {
    const stored = localStorage.getItem('usuario');
    if (stored) {
      const parsedUser = JSON.parse(stored);
      setUsuario(parsedUser);
      
      if (parsedUser.rol === 'docente') {
        navigate('/panel-docente');
      } else {
        navigate('/panel-alumno'); 
      }
    } else {

      navigate('/login');
    }
  }, []);

  const handleLogin = (user) => {
    setUsuario(user);
    localStorage.setItem('usuario', JSON.stringify(user));
    if (user.rol === 'docente') {
      navigate('/panel-docente');
    } else {
      navigate('/panel-alumno'); 
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUsuario(null);
    navigate('/login');
  };

  return (
    <Routes>
      {/* Ruta para el inicio de sesión, accesible para todos */}
      <Route path="/login" element={<Login onLogin={handleLogin} />} />

      {/* Rutas protegidas para alumnos */}
      {usuario && usuario.rol === 'alumno' && (
        <>
          <Route path="/panel-alumno" element={<PanelAlumno usuario={usuario} onLogout={handleLogout} />} />
          <Route path="/ver-ensayos" element={<VerEnsayos usuario={usuario} onLogout={handleLogout} />} />
          <Route path="/resolver/:resultado_id" element={<ResolverEnsayo usuario={usuario} onLogout={handleLogout} />} />
          {/* Ruta para que el alumno vea sus propios resultados */}
          <Route path="/mis-resultados" element={<VerResultadosAlumno usuario={usuario} onLogout={handleLogout} />} />
          {/* Ruta para ver el detalle de un resultado específico (opcional, si se navega directamente) */}
          <Route path="/resultados/:resultado_id" element={<VerResultadosAlumno usuario={usuario} onLogout={handleLogout} />} />
          {/* Rutas de fallback para alumnos */}
          <Route path="/" element={<PanelAlumno usuario={usuario} onLogout={handleLogout} />} />
          <Route path="*" element={<PanelAlumno usuario={usuario} onLogout={handleLogout} />} />
        </>
      )}

      {/* Rutas protegidas para docentes */}
      {usuario && usuario.rol === 'docente' && (
        <>
          <Route path="/panel-docente" element={<PanelDocente usuario={usuario} onLogout={handleLogout} />} />
          {/* Ruta para que el docente vea los resultados de todos los alumnos */}
          <Route path="/resultados-docente" element={<VerResultadosDocente usuario={usuario} onLogout={handleLogout} />} />
          {/* Ruta para ver el detalle de un resultado específico (opcional, si se navega directamente) */}
          <Route path="/resultados/:resultado_id" element={<VerResultadosDocente usuario={usuario} onLogout={handleLogout} />} />
          {/* Rutas de fallback para docentes */}
          <Route path="/" element={<PanelDocente usuario={usuario} onLogout={handleLogout} />} />
          <Route path="*" element={<PanelDocente usuario={usuario} onLogout={handleLogout} />} />
        </>
      )}

      {/* Ruta de fallback si el usuario no está logueado o el rol no coincide, redirige al login */}
      <Route path="*" element={<Login onLogin={handleLogin} />} />

    </Routes>
  );
};

export default App;
