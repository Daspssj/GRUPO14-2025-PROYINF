import React, { useEffect, useState } from 'react';
import axios from 'axios';

const VerEnsayos = () => {
  const [ensayos, setEnsayos] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get('http://localhost:3000/api/ver-ensayos-disponibles', {
      headers: {
        Authorization: token
      }
    })
    .then(res => {
      setEnsayos(res.data);
    })
    .catch(err => {
      console.error('Error al cargar ensayos:', err);
    });
  }, []);

  return (
    <div>
      <h2>Ensayos disponibles</h2>
      <ul>
        {ensayos.map((e) => (
          <li key={e.id}>
            {e.nombre} ({e.materia}) - {e.fecha_creacion.split('T')[0]}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VerEnsayos;
