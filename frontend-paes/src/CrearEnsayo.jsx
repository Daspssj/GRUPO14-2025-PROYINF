import React, { useEffect, useState } from 'react';
import axiosInstance from './services/axiosConfig';
import './CrearEnsayo.css';

const CrearEnsayo = ({ usuario }) => {
  const [materias, setMaterias] = useState([]);
  const [materiaId, setMateriaId] = useState('');
  const [preguntas, setPreguntas] = useState([]);
  const [nombre, setNombre] = useState('');
  const [preguntasSeleccionadas, setPreguntasSeleccionadas] = useState([]);
  const [error, setError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [isFadingOut, setIsFadingOut] = useState(false);


  useEffect(() => {
    const fetchMaterias = async () => {
      try {
        setError('');
        const token = localStorage.getItem('token');
        if (!token) {
            setError('No hay token de autenticación. Por favor, inicia sesión.');
            return;
        }
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const res = await axiosInstance.get('/api/materias/', config); 
        setMaterias(res.data);
      } catch (err) {
        console.error('Error al cargar materias:', err);
        setError(err.response?.data?.error || 'Error al cargar las materias.');
      }
    };
    fetchMaterias();
  }, []);

  useEffect(() => {
    const fetchPreguntas = async () => {
      if (materiaId) {
        try {
          setError('');
          const token = localStorage.getItem('token');
          if (!token) {
              setError('No hay token de autenticación para cargar preguntas.');
              return;
          }
          const config = { headers: { Authorization: `Bearer ${token}` } };

          const res = await axiosInstance.get(`/api/preguntas/?materia_id=${materiaId}`, config); 
          setPreguntas(res.data);
          setPreguntasSeleccionadas([]);
        } catch (err) {
          console.error('Error al cargar preguntas:', err);
          setError(err.response?.data?.error || 'Error al cargar las preguntas para la materia seleccionada.');
        }
      } else {
        setPreguntas([]);
        setPreguntasSeleccionadas([]);
      }
    };
    fetchPreguntas();
  }, [materiaId]);

  useEffect(() => {
    if (mensajeExito) {
      setIsFadingOut(false);
      const timer = setTimeout(() => {
        setIsFadingOut(true);
        const hideTimer = setTimeout(() => {
          setMensajeExito('');
          setIsFadingOut(false);
        }, 500);
        return () => clearTimeout(hideTimer);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [mensajeExito]);


  const crearEnsayo = async () => {
    setError('');
    setMensajeExito('');

    if (!nombre || !materiaId || preguntasSeleccionadas.length === 0) {
      setError('Por favor, completa todos los campos y selecciona al menos una pregunta.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
          setError('No hay token de autenticación para crear el ensayo.');
          return;
      }
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const res = await axiosInstance.post('/api/ensayos/crear-ensayo-con-preguntas', {
        nombre,
        docente_id: usuario.id,
        materia_id: materiaId,
        preguntas: preguntasSeleccionadas
      }, config);
      
      setMensajeExito(`Ensayo "${res.data.ensayo.nombre}" creado con éxito.`);
      setNombre('');
      setMateriaId('');
      setPreguntasSeleccionadas([]);
      setPreguntas([]);
      
    } catch (err) {
      console.error('Error al crear ensayo:', err);
      setError(err.response?.data?.error || 'Error al crear el ensayo. Inténtalo de nuevo.');
    }
  };

  const togglePregunta = (id) => {
    setPreguntasSeleccionadas(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  return (
    <div className="crear-ensayo-container">
      <h2>Crear Ensayo</h2>
      {error && <p className="error-message">{error}</p>}
      {mensajeExito && <p className={`success-message ${isFadingOut ? 'fade-out' : ''}`}>{mensajeExito}</p>}

      <input
        type="text"
        placeholder="Nombre del ensayo"
        value={nombre}
        onChange={e => setNombre(e.target.value)}
        className="input-nombre"
      />

      <select
        value={materiaId}
        onChange={e => setMateriaId(e.target.value)}
        className="select-materia"
      >
        <option value="">Seleccione una materia</option>
        {materias.map(m => (
          <option key={m.id} value={m.id}>{m.nombre}</option>
        ))}
      </select>

      {materiaId && (
        <div className="preguntas-box">
          <h4>Seleccionar preguntas:</h4>
          {preguntas.length > 0 ? (
            <ul className="lista-preguntas">
              {preguntas.map(p => (
                <li key={p.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={preguntasSeleccionadas.includes(p.id)}
                      onChange={() => togglePregunta(p.id)}
                    />
                    {p.enunciado}
                  </label>
                </li>
              ))}
            </ul>
          ) : (
            <p>No hay preguntas disponibles para esta materia o no se pudieron cargar.</p>
          )}
        </div>
      )}

      <button className="btn-crear" onClick={crearEnsayo}>Crear Ensayo</button>
    </div>
  );
};

export default CrearEnsayo;
