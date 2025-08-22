// frontend-paes/src/VerResultadosDocente.jsx
import React, { useEffect, useState, useCallback } from 'react';
import axiosInstance from './services/axiosConfig';
import './VerResultados.css';

const VerResultadosDocente = () => {
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [detalleResultado, setDetalleResultado] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Filtros
  const [filtroAlumnoId, setFiltroAlumnoId] = useState('');
  const [filtroEnsayoId, setFiltroEnsayoId] = useState('');
  const [filtroMateriaId, setFiltroMateriaId] = useState('');
  const [materias, setMaterias] = useState([]);
  const [ensayos, setEnsayos] = useState([]);

  // Helper: arma payload y query limpiando vacíos
  const buildFilters = useCallback(() => {
    const q = {};
    const toNum = (v) => {
      const n = Number(v);
      return Number.isFinite(n) && n > 0 ? n : undefined;
    };
    const alumno_id = toNum(filtroAlumnoId);
    const ensayo_id = toNum(filtroEnsayoId);
    const materia_id = toNum(filtroMateriaId);
    if (alumno_id) q.alumno_id = alumno_id;
    if (ensayo_id) q.ensayo_id = ensayo_id;
    if (materia_id) q.materia_id = materia_id;
    return q;
  }, [filtroAlumnoId, filtroEnsayoId, filtroMateriaId]);

  // Cargar resultados con estrategia robusta
  const fetchResultados = useCallback(async () => {
    setLoading(true);
    setError(null);

    const filters = buildFilters();
    const asQuery = new URLSearchParams(filters).toString();

    // 1) POST /ver-resultados-docente (preferido)
    try {
      console.log('[Docente] POST /api/resultados/ver-resultados-docente', filters);
      const r1 = await axiosInstance.post('/api/resultados/ver-resultados-docente', filters);
      setResultados(Array.isArray(r1.data) ? r1.data : []);
      return;
    } catch (e1) {
      const s = e1?.response?.status;
      console.warn('[Docente] POST ver-resultados-docente falló:', s, e1?.response?.data);
      if (s && s !== 404 && s !== 405) throw e1; // error real distinto a no-encontrado/metodo
    }

    // 2) GET /ver-resultados-docente (fallback)
    try {
      console.log('[Docente] GET /api/resultados/ver-resultados-docente', filters);
      const r2 = await axiosInstance.get('/api/resultados/ver-resultados-docente', { params: filters });
      setResultados(Array.isArray(r2.data) ? r2.data : []);
      return;
    } catch (e2) {
      const s = e2?.response?.status;
      console.warn('[Docente] GET ver-resultados-docente falló:', s, e2?.response?.data);
      if (s && s !== 404) throw e2;
    }

    // 3) POST /ver-resultados (usa scope docente)
    try {
      console.log('[Docente] POST /api/resultados/ver-resultados (scope=docente)', filters);
      const r3 = await axiosInstance.post('/api/resultados/ver-resultados', { ...filters, scope: 'docente' });
      setResultados(Array.isArray(r3.data) ? r3.data : []);
      return;
    } catch (e3) {
      const s = e3?.response?.status;
      console.warn('[Docente] POST ver-resultados (scope) falló:', s, e3?.response?.data);
      if (s && s !== 404 && s !== 405) throw e3;
    }

    // 4) GET /ver-resultados (último intento)
    try {
      console.log('[Docente] GET /api/resultados/ver-resultados', filters);
      const r4 = await axiosInstance.get('/api/resultados/ver-resultados', { params: filters });
      setResultados(Array.isArray(r4.data) ? r4.data : []);
      return;
    } catch (e4) {
      console.error('💥 [Docente] Todos los intentos fallaron:', e4?.response?.status, e4?.response?.data);
      throw e4;
    }
  }, [buildFilters]);

  // Cargar combos + resultados iniciales
  useEffect(() => {
    (async () => {
      try {
        setError(null);
        const [materiasRes, ensayosRes] = await Promise.all([
          axiosInstance.get('/api/materias/'),
          axiosInstance.get('/api/ensayos/listar-todos'),
        ]);
        setMaterias(Array.isArray(materiasRes.data) ? materiasRes.data : []);
        setEnsayos(Array.isArray(ensayosRes.data) ? ensayosRes.data : []);
        await fetchResultados();
      } catch (err) {
        console.error('Error al cargar filtros/resultados:', err?.response?.status, err?.response?.data);
        setError('Error al cargar opciones de filtro o resultados.');
      } finally {
        setLoading(false);
      }
    })();
  }, [fetchResultados]);

  const handleAplicarFiltros = async () => {
    try {
      await fetchResultados();
    } catch (err) {
      setError(err?.response?.data?.error || 'Error al cargar los resultados con los filtros.');
    } finally {
      setLoading(false);
    }
  };

  const verDetalle = async (resultado_id) => {
    try {
      setError(null);

      // 1) POST (preferido)
      try {
        const res = await axiosInstance.post('/api/resultados/ver-detalle-resultado', { resultado_id });
        setDetalleResultado(res.data);
        setModalOpen(true);
        return;
      } catch (e1) {
        const s = e1?.response?.status;
        console.warn('[Docente] POST ver-detalle-resultado falló:', s, e1?.response?.data);
        if (s && s !== 404 && s !== 405) throw e1;
      }

      // 2) GET (fallback)
      const res2 = await axiosInstance.get('/api/resultados/ver-detalle-resultado', { params: { resultado_id } });
      setDetalleResultado(res2.data);
      setModalOpen(true);
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.error || 'Error al cargar el detalle del resultado.';
      // Importante: NO limpiamos sesión aquí (lo controla el interceptor con lógica nueva)
      if (status === 403) {
        setError('No tienes permisos para ver el detalle de este resultado.');
      } else if (status === 401) {
        setError('Tu sesión no es válida. Intenta reingresar.');
      } else {
        setError(msg);
      }
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setDetalleResultado(null);
  };

  // Render
  if (loading) return <div className="resultados-container"><p className="no-resultados">Cargando resultados de alumnos...</p></div>;
  if (error)   return <div className="resultados-container"><p className="no-resultados error-message">{error}</p></div>;

  const rows = Array.isArray(resultados) ? resultados : [];

  return (
    <div className="resultados-container">
      <h2>Resultados de Alumnos</h2>

      <div className="filtros-resultados">
        <div>
          <label htmlFor="filtroAlumno">ID Alumno:</label>
          <input
            type="text"
            id="filtroAlumno"
            value={filtroAlumnoId}
            onChange={(e) => setFiltroAlumnoId(e.target.value)}
            placeholder="Opcional: ID de alumno"
          />
        </div>
        <div>
          <label htmlFor="filtroEnsayo">Ensayo:</label>
          <select
            id="filtroEnsayo"
            value={filtroEnsayoId}
            onChange={(e) => setFiltroEnsayoId(e.target.value)}
          >
            <option value="">Todos los Ensayos</option>
            {ensayos.map((ensayo) => (
              <option key={ensayo.id ?? ensayo.ensayo_id} value={ensayo.id ?? ensayo.ensayo_id}>
                {ensayo.nombre ?? ensayo.ensayo_nombre ?? `Ensayo ${ensayo.id ?? ensayo.ensayo_id}`}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filtroMateria">Materia:</label>
          <select
            id="filtroMateria"
            value={filtroMateriaId}
            onChange={(e) => setFiltroMateriaId(e.target.value)}
          >
            <option value="">Todas las Materias</option>
            {materias.map((materia) => (
              <option key={materia.id ?? materia.materia_id} value={materia.id ?? materia.materia_id}>
                {materia.nombre ?? materia.materia_nombre ?? `Materia ${materia.id ?? materia.materia_id}`}
              </option>
            ))}
          </select>
        </div>
        <button onClick={handleAplicarFiltros}>Aplicar Filtros</button>
      </div>

      {rows.length === 0 ? (
        <p className="no-resultados">No hay resultados que coincidan con los filtros aplicados.</p>
      ) : (
        <table className="tabla-resultados">
          <thead>
            <tr>
              <th>Alumno</th>
              <th>Ensayo</th>
              <th>Materia</th>
              <th>Puntaje</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.resultado_id || r.id || i}>
                <td>
                  {r.alumno_nombre ?? r.alumno?.nombre ?? r.alumno ?? '—'}
                  {r.alumno_correo ? ` (${r.alumno_correo})` : ''}
                </td>
                <td>{r.ensayo_nombre ?? r.ensayo?.nombre ?? r.ensayo ?? '—'}</td>
                <td>{r.materia_nombre ?? r.materia?.nombre ?? r.materia ?? '—'}</td>
                <td>{r.puntaje ?? '—'}</td>
                <td>{r.fecha ? new Date(r.fecha).toLocaleDateString() : '—'}</td>
                <td>
                  <button onClick={() => verDetalle(r.resultado_id || r.id)}>Ver Detalle</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-button" onClick={closeModal}>&times;</button>
            <h3>Detalle del Ensayo</h3>
            {Array.isArray(detalleResultado) && detalleResultado.length ? (
              <div>
                {detalleResultado.map((p, i) => (
                  <div key={p.pregunta_id || i} className={`pregunta-detalle ${p.correcta ? 'correcta' : 'incorrecta'}`}>
                    <p className="enunciado"><strong>{i + 1}. {p.texto}</strong></p>
                    <p className="opciones">
                      <span>A) {p.opcion_a}</span>
                      <span>B) {p.opcion_b}</span>
                      <span>C) {p.opcion_c}</span>
                      <span>D) {p.opcion_d}</span>
                    </p>
                    <p>Respuesta del Alumno: <span className="respuesta-dada">{p.respuesta_dada_id}</span></p>
                    <p>Respuesta Correcta: <span className="respuesta-correcta">{p.respuesta_correcta_id}</span></p>
                    <p className="estado-respuesta">Estado: {p.correcta ? '¡Correcta!' : 'Incorrecta'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No se pudieron cargar los detalles de este ensayo.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VerResultadosDocente;
