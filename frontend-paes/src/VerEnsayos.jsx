// frontend-paes/src/VerEnsayos.jsx
import React, { useEffect, useState } from 'react';
import axiosInstance from './services/axiosConfig';
import './PanelAlumno.css';
import { useNavigate } from 'react-router-dom';

const VerEnsayos = ({ alumnoId }) => {
  const [ensayos, setEnsayos] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true); setError(null);
        const [ensayosRes, materiasRes] = await Promise.all([
          axiosInstance.get('/api/ensayos/listar-todos'),
          axiosInstance.get('/api/materias'),
        ]);
        const E = Array.isArray(ensayosRes.data) ? ensayosRes.data : [];
        const M = Array.isArray(materiasRes.data) ? materiasRes.data : [];
        const enriched = E.map(e => {
          const m = M.find(mm => mm.id === e.materia_id);
          return { ...e, materiaNombre: m ? m.nombre : 'Materia Desconocida' };
        });
        setEnsayos(enriched); setMaterias(M);
      } catch (err) {
        console.error('💥 Error cargando ensayos/materias:', err?.response?.status, err?.response?.data);
        setError(err?.response?.data?.error || 'Error al cargar datos.');
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const ensayosFiltrados = materiaSeleccionada
    ? ensayos.filter(e => e.materia_id === Number(materiaSeleccionada))
    : ensayos;

  const comenzarEnsayo = async (ensayo_id) => {
    const confirmar = window.confirm('¿Estás seguro de que deseas comenzar este ensayo?');
    if (!confirmar) return;

    try {
      if (alumnoId == null) { alert('No se pudo identificar al alumno.'); return; }

      const aid = Number(alumnoId);
      const eid = Number(ensayo_id);

      // 🔴 Importante: este back parece leer los ids en query. Los mando en query + body.
      const url = `/api/resultados/crear-resultado?alumno_id=${aid}&ensayo_id=${eid}`;
      const body = { alumno_id: aid, ensayo_id: eid };

      console.log('[Crear resultado] URL=', url, ' body=', body);

      const res = await axiosInstance.post(url, body);

      const resultadoId = res.data?.resultado_id || res.data?.resultado?.id || res.data?.id;
      if (!resultadoId) throw new Error('Respuesta del servidor sin resultado_id');

      navigate(`/resolver/${resultadoId}`);
    } catch (err) {
      console.error('💥 Error al crear resultado:', err?.response?.status, err?.response?.data);
      alert(err?.response?.data?.error || 'Faltan datos para crear el resultado (verifica alumno y ensayo).');
    }
  };

  if (loading) return (
    <div className="panel-alumno" style={{ textAlign:'center', padding:20 }}>
      <h2 className="titulo-seccion">Cargando Ensayos...</h2>
      <p>Por favor, espera.</p>
    </div>
  );
  if (error) return (
    <div className="panel-alumno" style={{ textAlign:'center', padding:20, color:'red' }}>
      <h2 className="titulo-seccion">Error al cargar</h2>
      <p>{error}</p>
    </div>
  );
  if (!ensayos.length) return (
    <div className="panel-alumno" style={{ textAlign:'center', padding:20 }}>
      <h2 className="titulo-seccion">Ensayos Disponibles</h2>
      <p>No hay ensayos disponibles.</p>
    </div>
  );

  return (
    <div className="panel-alumno">
      <h2 className="titulo-seccion">Ensayos Disponibles</h2>

      <div className="selector-materia">
        <label htmlFor="materia">Filtrar por materia:</label>
        <select id="materia" value={materiaSeleccionada} onChange={(e) => setMateriaSeleccionada(e.target.value)}>
          <option value="">Todas las materias</option>
          {materias.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
        </select>
      </div>

      <div className="tabla-contenedor">
        <table className="tabla-ensayos">
          <thead>
            <tr><th>Nombre del Ensayo</th><th>Materia</th><th>Acción</th></tr>
          </thead>
          <tbody>
            {ensayosFiltrados.map(e => (
              <tr key={e.id}>
                <td>{e.nombre}</td>
                <td>{e.materiaNombre}</td>
                <td><button className="btn-comenzar" onClick={() => comenzarEnsayo(e.id)}>Comenzar</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default VerEnsayos;