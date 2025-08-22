// frontend-paes/src/VerResultadosAlumno.jsx
import React, { useEffect, useState } from 'react';
import axiosInstance from './services/axiosConfig';
import './VerResultados.css';

const VerResultadosAlumno = ({ alumnoId }) => {
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [detalleResultado, setDetalleResultado] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        if (alumnoId == null) {
          setError('No se pudo identificar al alumno (alumnoId ausente).');
          setLoading(false);
          return;
        }

        const aid = Number(alumnoId);
        console.log('[Resultados] intentando POST con alumno_id=', aid);

        // 1) Muchos backends leen req.body en este endpoint:
        try {
          const res = await axiosInstance.post('/api/resultados/ver-resultados', { alumno_id: aid });
          setResultados(Array.isArray(res.data) ? res.data : []);
          return; // listo
        } catch (e1) {
          console.warn('[Resultados] POST falló, probando GET con query...', e1?.response?.status, e1?.response?.data);
          // 2) Fallback a GET con query
          const res2 = await axiosInstance.get(`/api/resultados/ver-resultados?alumno_id=${aid}`);
          setResultados(Array.isArray(res2.data) ? res2.data : []);
        }
      } catch (err) {
        console.error('💥 Resultados alumno error (POST y GET):', err?.response?.status, err?.response?.data);
        setError(err?.response?.data?.error || 'Error al cargar tus resultados.');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [alumnoId]);

  const verDetalle = async (resultado_id) => {
    try {
      setError(null);
      const res = await axiosInstance.get(`/api/resultados/ver-detalle-resultado?resultado_id=${resultado_id}`);
      setDetalleResultado(res.data);
      setModalOpen(true);
    } catch (err) {
      console.error('💥 Detalle resultado error:', err?.response?.status, err?.response?.data);
      setError(err?.response?.data?.error || 'Error al cargar el detalle del resultado.');
    }
  };

  if (loading) return <div className="resultados-container"><p className="no-resultados">Cargando tus resultados...</p></div>;
  if (error)   return <div className="resultados-container"><p className="no-resultados error-message">Error: {error}</p></div>;
  if (!resultados.length) return <div className="resultados-container"><p className="no-resultados">Aún no tienes resultados.</p></div>;

  return (
    <div className="resultados-container">
      <h2>Mis Resultados de Ensayos</h2>
      <table className="tabla-resultados">
        <thead>
          <tr><th>Ensayo</th><th>Materia</th><th>Puntaje</th><th>Fecha</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {resultados.map((r) => (
            <tr key={r.resultado_id || r.id}>
              <td>{r.ensayo_nombre || r.ensayo?.nombre || r.ensayo}</td>
              <td>{r.materia_nombre || r.materia?.nombre || r.materia}</td>
              <td>{r.puntaje ?? '-'}</td>
              <td>{r.fecha ? new Date(r.fecha).toLocaleDateString() : '-'}</td>
              <td><button onClick={() => verDetalle(r.resultado_id || r.id)}>Ver Detalle</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-button" onClick={() => { setModalOpen(false); setDetalleResultado(null); }}>&times;</button>
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
                    <p>Tu Respuesta: <span className="respuesta-dada">{p.respuesta_dada_id}</span></p>
                    <p>Respuesta Correcta: <span className="respuesta-correcta">{p.respuesta_correcta_id}</span></p>
                    <p className="estado-respuesta">Estado: {p.correcta ? '¡Correcta!' : 'Incorrecta'}</p>
                  </div>
                ))}
              </div>
            ) : (<p>No se pudieron cargar los detalles de este ensayo.</p>)}
          </div>
        </div>
      )}
    </div>
  );
};

export default VerResultadosAlumno;