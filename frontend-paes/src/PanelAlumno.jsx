import React, { useState } from 'react';
import VerEnsayos from './VerEnsayos'; // Puedes crear un VerResultados también
import './PanelAlumno.css';
import VerResultados from './VerResultados';


const PanelAlumno = ({ usuario, onLogout }) => {
  const [seccion, setSeccion] = useState('ensayos');

  return (
    <div className="panel-alumno">
      <header className="panel-header">
        <h1>Bienvenido, {usuario.nombre}</h1>
        <button onClick={onLogout}>Cerrar sesión</button>
      </header>

      <nav className="panel-nav">
        <button onClick={() => setSeccion('ensayos')}>📘 Ensayos disponibles</button>
        <button onClick={() => setSeccion('resultados')}>📊 Mis resultados</button>
      </nav>

      <main className="panel-main">
        {seccion === 'ensayos' && <VerEnsayos />}
        {seccion === 'resultados' && <VerResultados onVerDetalle={(id) => {
        // más adelante se puede mostrar el detalle de resultado
        alert(`Ver detalle del resultado ID: ${id}`);
        }} />}
      </main>
    </div>
  );
};

export default PanelAlumno;
