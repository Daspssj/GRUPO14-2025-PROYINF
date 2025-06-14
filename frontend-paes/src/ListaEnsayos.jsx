import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ListaEnsayos = ({ usuario }) => {
  const [ensayos, setEnsayos] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get('http://localhost:3000/api/ensayos', { // 👈 Cambiar a /api/ensayos
      headers: { Authorization: token }
    })
    .then(res => setEnsayos(res.data))
    .catch(err => console.error(err));
  }, [token]);

  return (
    <div>
      <h2>Ensayos Creados</h2>
      <ul>
        {ensayos.length === 0 ? (
          <li>No hay ensayos creados.</li>
        ) : (
          ensayos.map(ensayo => (
            <li key={ensayo.id}>
              <strong>{ensayo.nombre}</strong> <br />
              Materia: {ensayo.materia_nombre} <br />
              Docente: {ensayo.docente_nombre} <br />
              Total de preguntas: {ensayo.total_preguntas}
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default ListaEnsayos;