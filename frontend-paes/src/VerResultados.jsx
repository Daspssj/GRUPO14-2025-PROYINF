import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './VerResultados.css';

const VerResultados = ({ onVerDetalle }) => {
  const [resultados, setResultados] = useState([]);
  const token = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  useEffect(() => {
    axios.get(`http://localhost:3000/api/ver-resultados?alumno_id=${usuario.id}`, {
      headers: { Authorization: token }
    })
    .then(res => setResultados(res.data))
    .catch(err => console.error(err));
  }, []);

  return (
    <div className="resultados-container">
      <h2>📊 Resultados de Ensayos</h2>
      {resultados.length === 0 ? (
        <p>Aún no has rendido ningún ensayo.</p>
      ) : (
        <table className="tabla-resultados">
          <thead>
            <tr>
              <th>Ensayo</th>
              <th>Materia</th>
              <th>Puntaje</th>
              <th>Fecha</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {resultados.map((r) => (
              <tr key={r.resultado_id}>
                <td>{r.ensayo}</td>
                <td>{r.materia}</td>
                <td>{r.puntaje}</td>
                <td>{new Date(r.fecha).toLocaleDateString()}</td>
                <td>
                  <button className="detalle-btn" onClick={() => onVerDetalle(r.resultado_id)}>
                    Ver detalles
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default VerResultados;
