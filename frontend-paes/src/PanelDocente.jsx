// PanelDocente.jsx
import React, { useState } from 'react';
import './PanelDocente.css';
import CrearEnsayo from './CrearEnsayo';
import BancoPreguntas from './BancoPreguntas';
import ListaEnsayos from './ListaEnsayos'; // Importa ListaEnsayos

const PanelDocente = ({ usuario, onLogout }) => {
  const [seccion, setSeccion] = useState('crear');

  return (
    <div className="panel-docente">
      <header className="panel-header">
        <h1>👨‍🏫 Panel Docente - {usuario.nombre}</h1>
        <button onClick={onLogout}>Cerrar sesión</button>
      </header>

      <nav className="panel-nav">
        <button onClick={() => setSeccion('crear')}>📝 Crear Ensayo</button>
        <button onClick={() => setSeccion('lista')}>Ver Ensayos</button>
        <button onClick={() => setSeccion('banco')}>📚 Banco de Preguntas</button>
        <button onClick={() => setSeccion('resultados')}>📊 Resultados de Alumnos</button>
      </nav>

      <main className="panel-main">
        {seccion === 'crear' && <CrearEnsayo usuario={usuario} onCreado={() => setSeccion('lista')} />}
        {seccion === 'lista' && <ListaEnsayos usuario={usuario} />}
        {seccion === 'banco' && <BancoPreguntas usuario={usuario} />}
        {seccion === 'resultados' && <p>Aquí se mostrarán los resultados de los alumnos</p>}
      </main>
    </div>
  );
};

export default PanelDocente;