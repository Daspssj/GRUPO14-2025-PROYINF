import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './BancoPreguntas.css';

const BancoPreguntas = () => {
  const [materias, setMaterias] = useState([]);
  const [materiaId, setMateriaId] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [preguntas, setPreguntas] = useState([]);
  const [crearVisible, setCrearVisible] = useState(false);

  const [nuevaPregunta, setNuevaPregunta] = useState({
    enunciado: '',
    imagen: '',
    opcion_a: '',
    opcion_b: '',
    opcion_c: '',
    opcion_d: '',
    respuesta_correcta: '',
    materia_id: ''
  });

  const token = localStorage.getItem('token');

  const handleSubmit = async (e) => {
  e.preventDefault();
    const url = nuevaPregunta.id
      ? `http://localhost:3000/api/preguntas/${nuevaPregunta.id}`
      : 'http://localhost:3000/api/crear-pregunta';
    const method = nuevaPregunta.id ? 'put' : 'post';

    try {
      await axios[method](url, nuevaPregunta, {
        headers: { Authorization: token }
      });

      // Recarga las preguntas manualmente
      const params = {};
      if (materiaId) params.materia_id = materiaId;
      if (busqueda) params.busqueda = busqueda;

      const res = await axios.get('http://localhost:3000/api/ver-preguntas', {
        headers: { Authorization: token },
        params
      });
      setPreguntas(res.data);

      // Limpieza
      setCrearVisible(false);
      setNuevaPregunta({
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
      console.error(err);
    }
  };


  useEffect(() => {
    axios.get('http://localhost:3000/api/materias', {
      headers: { Authorization: token }
    })
      .then(res => setMaterias(res.data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    const params = {};
    if (materiaId) params.materia_id = materiaId;
    if (busqueda) params.busqueda = busqueda;

    axios.get('http://localhost:3000/api/ver-preguntas', {
      headers: { Authorization: token },
      params
    })
      .then(res => setPreguntas(res.data))
      .catch(err => console.error(err));
  }, [materiaId, busqueda, crearVisible]);

  const handleEliminar = async (id) => {
    const confirmar = window.confirm('¿Estás seguro de que deseas eliminar esta pregunta?');
    if (!confirmar) return;

    try {
      await axios.delete(`http://localhost:3000/api/preguntas/${id}`, {
        headers: { Authorization: token }
      });

      // Recargar lista actualizada
      const params = {};
      if (materiaId) params.materia_id = materiaId;
      if (busqueda) params.busqueda = busqueda;

      const res = await axios.get('http://localhost:3000/api/ver-preguntas', {
        headers: { Authorization: token },
        params
      });
      setPreguntas(res.data);
    } catch (err) {
      console.error(err);
      alert('Ocurrió un error al eliminar la pregunta');
    }
  };


  const handleCrearPregunta = () => {
    axios.post('http://localhost:3000/api/crear-pregunta', nuevaPregunta, {
      headers: { Authorization: token }
    })
      .then(() => {
        setCrearVisible(false);
        setNuevaPregunta({
          enunciado: '',
          imagen: '',
          opcion_a: '',
          opcion_b: '',
          opcion_c: '',
          opcion_d: '',
          respuesta_correcta: '',
          materia_id: ''
        });
      })
      .catch(err => console.error(err));
  };

  return (
    <div className="contenedor-ancho">
      <h2>Banco de Preguntas</h2>

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
        <button className="btn-crear" onClick={() => setCrearVisible(!crearVisible)}>
          ➕ Crear pregunta
        </button>
      </div>

      {crearVisible && (
        <div className="crear-formulario">
          <textarea
            className="enunciado-textarea"
            value={nuevaPregunta.enunciado}
            onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, enunciado: e.target.value })}
            placeholder="Enunciado de la pregunta"
          />
          <input
            type="text"
            placeholder="Enlace de imagen (opcional)"
            value={nuevaPregunta.imagen}
            onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, imagen: e.target.value })}
          />
          <input
            type="text"
            placeholder="Opción A"
            value={nuevaPregunta.opcion_a}
            onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, opcion_a: e.target.value })}
          />
          <input
            type="text"
            placeholder="Opción B"
            value={nuevaPregunta.opcion_b}
            onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, opcion_b: e.target.value })}
          />
          <input
            type="text"
            placeholder="Opción C"
            value={nuevaPregunta.opcion_c}
            onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, opcion_c: e.target.value })}
          />
          <input
            type="text"
            placeholder="Opción D"
            value={nuevaPregunta.opcion_d}
            onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, opcion_d: e.target.value })}
          />
          <select
            value={nuevaPregunta.respuesta_correcta}
            onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, respuesta_correcta: e.target.value })}
          >
            <option value="">Respuesta Correcta</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>
          <select
            value={nuevaPregunta.materia_id}
            onChange={(e) => setNuevaPregunta({ ...nuevaPregunta, materia_id: e.target.value })}
          >
            <option value="">Seleccione Materia</option>
            {materias.map(m => (
              <option key={m.id} value={m.id}>{m.nombre}</option>
            ))}
          </select>
          <button className="btn-guardar" onClick={handleSubmit}>💾 Guardar Pregunta</button>
        </div>
      )}

      {!crearVisible && (
        <div className="preguntas-listado">
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
                    <button
                      className="btn-editar"
                      onClick={() => {
                        setNuevaPregunta({
                          id: p.id,
                          enunciado: p.enunciado,
                          imagen: p.imagen,
                          opcion_a: p.opcion_a,
                          opcion_b: p.opcion_b,
                          opcion_c: p.opcion_c,
                          opcion_d: p.opcion_d,
                          respuesta_correcta: p.respuesta_correcta,
                          materia_id: p.materia_id
                        });
                        setCrearVisible(true);
                      }}
                    >
                      ✏️ Editar
                    </button>
                    <button onClick={() => handleEliminar(p.id)} className="btn-eliminar">🗑️ Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BancoPreguntas;
