import React, { useEffect, useState } from 'react';
import axiosInstance from './services/axiosConfig';
import './BancoPreguntas.css';

const BancoPreguntas = () => {
  const [materias, setMaterias] = useState([]);
  const [materiaId, setMateriaId] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [preguntas, setPreguntas] = useState([]);
  const [crearVisible, setCrearVisible] = useState(false);
  const [error, setError] = useState('');

  const [nuevaPregunta, setNuevaPregunta] = useState({
    id: null,
    enunciado: '',
    imagen: '',
    opcion_a: '',
    opcion_b: '',
    opcion_c: '',
    opcion_d: '',
    respuesta_correcta: '',
    materia_id: ''
  });


  const fetchPreguntas = async (currentMateriaId, currentBusqueda) => {
    setError('');
    try {
      const res = await axiosInstance.get('/api/preguntas', {
        params: {
          materia_id: currentMateriaId,
          busqueda: currentBusqueda
        }
      });
      setPreguntas(res.data);
    } catch (err) {
      console.error('Error al cargar preguntas:', err);
      setError(err.response?.data?.error || 'Error al cargar las preguntas.');
    }
  };

  useEffect(() => {
    const fetchMaterias = async () => {
      try {
        setError('');
        const res = await axiosInstance.get('/api/materias');
        setMaterias(res.data);
      } catch (err) {
        console.error('Error al cargar materias:', err);
        setError(err.response?.data?.error || 'Error al cargar las materias.');
      }
    };
    fetchMaterias();
  }, []);

  useEffect(() => {
    fetchPreguntas(materiaId, busqueda);
  }, [materiaId, busqueda, crearVisible]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const url = nuevaPregunta.id
      ? `/api/preguntas/${nuevaPregunta.id}`
      : '/api/preguntas/crear-pregunta';
    const method = nuevaPregunta.id ? 'put' : 'post';

    try {
      await axiosInstance[method](url, nuevaPregunta);
      
      fetchPreguntas(materiaId, busqueda); 

      setCrearVisible(false);
      setNuevaPregunta({
        id: null,
        enunciado: '',
        imagen: '',
        opcion_a: '',
        opcion_b: '',
        opcion_c: '',
        opcion_d: '',
        respuesta_correcta: '',
        materia_id: ''
      });
    } catch (err) {
      console.error('Error al guardar pregunta:', err);
      setError(err.response?.data?.error || 'Error al guardar la pregunta.');
    }
  };

  const handleEliminar = async (id) => {
    const confirmar = window.confirm('¿Estás seguro de que deseas eliminar esta pregunta?');
    if (!confirmar) return;

    setError('');
    try {
      await axiosInstance.delete(`/api/preguntas/eliminar-pregunta/${id}`);
      

      fetchPreguntas(materiaId, busqueda);
    } catch (err) {
      console.error('Error al eliminar pregunta:', err);
      setError(err.response?.data?.error || 'Ocurrió un error al eliminar la pregunta.');
    }
  };

  const handleEditarClick = (pregunta) => {
    setNuevaPregunta({
      id: pregunta.id,
      enunciado: pregunta.enunciado,
      imagen: pregunta.imagen || '',
      opcion_a: pregunta.opcion_a,
      opcion_b: pregunta.opcion_b,
      opcion_c: pregunta.opcion_c,
      opcion_d: pregunta.opcion_d,
      respuesta_correcta: pregunta.respuesta_correcta,
      materia_id: pregunta.materia_id
    });
    setCrearVisible(true);
  };

  const handleToggleCrearForm = () => {
    setCrearVisible(!crearVisible);
    if (!crearVisible) {
      setNuevaPregunta({
        id: null,
        enunciado: '',
        imagen: '',
        opcion_a: '',
        opcion_b: '',
        opcion_c: '',
        opcion_d: '',
        respuesta_correcta: '',
        materia_id: ''
      });
    }
  };

  return (
    <div className="contenedor-ancho">
      <h2>Banco de Preguntas</h2>

      {error && <p className="error-message">{error}</p>} {/* Mostrar mensajes de error */}

      <div className="filter-container">
        <input
          type="text"
          placeholder="Buscar por texto"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <select value={materiaId} onChange={(e) => setMateriaId(e.target.value)}>
          <option value="">Todas las materias</option>
          {materias.map(m => (
            <option key={m.id} value={m.id}>{m.nombre}</option>
          ))}
        </select>
        <button className="btn-crear" onClick={handleToggleCrearForm}>
          {crearVisible ? '➖ Ocultar formulario' : '➕ Crear pregunta'}
        </button>
      </div>

      {crearVisible && (
        <div className="crear-formulario">
          <textarea
            className="enunciado-textarea"
            value={nuevaPregunta.enunciado}
            onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, enunciado: e.target.value })}
            placeholder="Enunciado de la pregunta"
            required
          />
          <input
            type="text"
            placeholder="URL de imagen (opcional)"
            value={nuevaPregunta.imagen}
            onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, imagen: e.target.value })}
          />
          <input
            type="text"
            placeholder="Opción A"
            value={nuevaPregunta.opcion_a}
            onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, opcion_a: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Opción B"
            value={nuevaPregunta.opcion_b}
            onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, opcion_b: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Opción C"
            value={nuevaPregunta.opcion_c}
            onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, opcion_c: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Opción D"
            value={nuevaPregunta.opcion_d}
            onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, opcion_d: e.target.value })}
            required
          />
          <select
            value={nuevaPregunta.respuesta_correcta}
            onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, respuesta_correcta: e.target.value })}
            required
          >
            <option value="">Respuesta Correcta</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>
          <select
            value={nuevaPregunta.materia_id}
            onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, materia_id: parseInt(e.target.value) || '' })}
            required
          >
            <option value="">Seleccione Materia</option>
            {materias.map(m => (
              <option key={m.id} value={m.id}>{m.nombre}</option>
            ))}
          </select>
          <button className="btn-guardar" onClick={handleSubmit}>
            {nuevaPregunta.id ? '✏️ Actualizar Pregunta' : '💾 Guardar Pregunta'}
          </button>
        </div>
      )}

      {!crearVisible && (
        <div className="preguntas-listado">
          {preguntas.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Enunciado</th>
                  <th>Opciones</th>
                  <th>Correcta</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {preguntas.map(p => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>
                      {p.enunciado}
                      {p.imagen && (
                        <div style={{ marginTop: '8px' }}>
                          <img
                            src={p.imagen}
                            alt="Imagen de la pregunta"
                            style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', marginTop: '10px' }}
                          />
                        </div>
                      )}
                    </td>
                    <td>
                      <strong>A:</strong> {p.opcion_a} <br />
                      <strong>B:</strong> {p.opcion_b} <br />
                      <strong>C:</strong> {p.opcion_c} <br />
                      <strong>D:</strong> {p.opcion_d}
                    </td>
                    <td style={{ color: '#4CAF50', fontWeight: 'bold' }}>{p.respuesta_correcta}</td>
                    <td>
                      <button className="btn-editar" onClick={() => handleEditarClick(p)}>
                        ✏️ Editar
                      </button>
                      <button onClick={() => handleEliminar(p.id)} className="btn-eliminar">🗑️ Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No hay preguntas disponibles. Intenta crear una o verifica los filtros.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default BancoPreguntas;
