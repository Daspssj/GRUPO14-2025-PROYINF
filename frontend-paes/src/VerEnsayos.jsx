import React, { useEffect, useState } from 'react';
import axios from 'axios';

const VerEnsayos = () => {
  const [ensayos, setEnsayos] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get('http://localhost:3000/api/ensayos', {
      headers: { Authorization: token }
    })
    .then(res => setEnsayos(res.data))
    .catch(err => console.error(err));
  }, [token]); // <-- Agrega 'token' como dependencia

  return (
    <div>
      <h2>Ensayos Disponibles</h2>
      <ul>
        {ensayos.length === 0 ? (
          <li>No hay ensayos disponibles.</li>
        ) : (
          ensayos.map((e) => (
            <li key={e.id}>
              <strong>{e.nombre}</strong> <br />
              Materia: {e.materia_nombre} <br />
              Docente: {e.docente_nombre} <br />
              Total de preguntas: {e.total_preguntas} <br />
              Fecha: {new Date(e.fecha_creacion).toLocaleDateString()}
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default VerEnsayos;