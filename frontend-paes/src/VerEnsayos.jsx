// frontend-paes/src/VerEnsayos.jsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import axiosInstance from './services/axiosConfig';
import './PanelAlumno.css';
import { useNavigate } from 'react-router-dom';

// === Utils ===
const fmt = (zIso) => {
  try {
    const d = new Date(zIso);
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    }).format(d);
  } catch { return zIso ?? '-'; }
};
const dedupeById = (arr) => {
  const map = new Map();
  for (const x of arr || []) if (x && x.id != null && !map.has(x.id)) map.set(x.id, x);
  return Array.from(map.values());
};
const getUsados = (e) =>
  e.intentos_realizados ?? e.intentos ?? e.realizados ?? e.intentos_usados ?? 0;

// Calcula ventana actual / próxima a partir del objeto (usa e.ventana_actual / ventana_proxima si vienen,
// y si no, infiere desde e.ventanas).
const computeEstadoVentana = (e) => {
  const now = new Date();
  let ventanaActual = e?.ventana_actual || null;
  let ventanaProxima = e?.ventana_proxima || null;

  if (!ventanaActual && !ventanaProxima && Array.isArray(e?.ventanas)) {
    const futuras = [];
    for (const v of e.ventanas) {
      const ini = new Date(v.inicio);
      const fin = new Date(v.fin);
      if (ini <= now && fin > now) ventanaActual = v;
      else if (ini > now) futuras.push(v);
    }
    if (!ventanaActual && futuras.length) {
      futuras.sort((a, b) => new Date(a.inicio) - new Date(b.inicio));
      ventanaProxima = futuras[0];
    }
  }

  if (ventanaActual) return { key: 'disponible', ventanaActual, ventanaProxima };
  if (ventanaProxima) return { key: 'proximo', ventanaActual: null, ventanaProxima };
  return { key: 'cerrado', ventanaActual: null, ventanaProxima: null };
};

const VerEnsayos = ({ alumnoId }) => {
  const [ensayosVentana, setEnsayosVentana] = useState([]);   // por ventana (disponibles ahora)
  const [ensayosGlobales, setEnsayosGlobales] = useState([]); // permanentes (disponibles)
  const [noDisponibles, setNoDisponibles] = useState([]);     // vencidos/futuros/límite
  const [materias, setMaterias] = useState([]);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const navigate = useNavigate();

  // Carga materias + lista ensayos + ventanas por ensayo (enriquecimiento)
// 1) Saca load() fuera del useEffect
const load = useCallback(async () => {
  try {
    setLoading(true); setError(null);

    // 1) Materias
    const materiasRes = await axiosInstance.get('/api/materias');
    const M = Array.isArray(materiasRes.data) ? materiasRes.data : [];
    setMaterias(M);

    // 2) Ensayos base
    const ensayosRes = await axiosInstance.get('/api/ensayos/listar-todos');
    const base = Array.isArray(ensayosRes.data) ? ensayosRes.data : [];

    let misResultados = [];
    try {
        const resultadosRes = await axiosInstance.get('/api/resultados/mis-resultados');
        misResultados = Array.isArray(resultadosRes.data) ? resultadosRes.data : [];
    } catch (err) {
        console.warn("No se pudieron cargar los resultados (intentos) del alumno:", err.message);
        // No es fatal, continuamos, pero los intentos se mostrarán como 0.
    }

    // Contar intentos por ensayo
    const intentosMap = new Map();
    for (const res of misResultados) {
        const id = res.ensayo_id;
        intentosMap.set(id, (intentosMap.get(id) || 0) + 1);
    }

    // 3) Enriquecer cada ensayo con sus ventanas
    const enriched = await Promise.all(base.map(async (e) => {
      const m = M.find(mm => mm.id === e.materia_id);
      const enrichedItem = { 
        ...e, 
        materiaNombre: m ? m.nombre : 'Materia Desconocida' 
      };

      try {
        const vRes = await axiosInstance.get(`/api/ensayos/${e.id}/ventanas`);
        if (Array.isArray(vRes.data) && vRes.data.length > 0) {
          enrichedItem.disponibilidad = 'ventana';
          enrichedItem.ventanas = vRes.data;
        }
      } catch (_) {
        // 404/501: sin ventanas -> seguimos
      }

      // Si no viene disponibilidad desde ventanas, usar la del ensayo o 'permanente'
      if (!enrichedItem.disponibilidad) {
        enrichedItem.disponibilidad = e.disponibilidad || 'permanente';
      }

      // Cargar max_intentos si no lo tiene aún
      if (enrichedItem.max_intentos == null && e.max_intentos != null) {
        enrichedItem.max_intentos = e.max_intentos;
      }

      // 0 significa ilimitado → lo tratamos como null en el front
      if (enrichedItem.max_intentos === 0) {
        enrichedItem.max_intentos = null;
      }

      // Intentos realizados (contador desde misResultados, con fallback a lo que venga del back)
      enrichedItem.intentos_realizados =
        intentosMap.get(e.id) ?? e.intentos_realizados ?? 0;

      return enrichedItem;
    }));

    // 4) Clasificación (igual que ya tienes)
    const V = [], G = [], ND = [];
    const pushND = (row, motivo) => ND.push({ ...row, _motivo: motivo });

    dedupeById(enriched).forEach((e) => {
      const max = e.max_intentos ?? null;
      const usados = getUsados(e);
      const excedido = (max != null) && (Number(usados) >= Number(max));

      if (e.disponibilidad === 'ventana') {
        const est = computeEstadoVentana(e);
        const row = { ...e, _estado: est };
        if (excedido)        pushND(row, 'Límite de intentos alcanzado');
        else if (est.key === 'disponible' && est.ventanaActual) V.push(row);
        else if (est.key === 'proximo')                         pushND(row, 'Ventana futura');
        else {
          let motivo = 'Sin ventana activa';
          if (Array.isArray(e.ventanas) && e.ventanas.length) {
            const allPast = e.ventanas.every(v => new Date(v.fin) <= new Date());
            if (allPast) motivo = 'Ventana vencida';
          }
          pushND(row, motivo);
        }
      } else {
        if (excedido) pushND(e, 'Límite de intentos alcanzado');
        else G.push(e);
      }
    });

    V.sort((a,b) => a.nombre.localeCompare(b.nombre));
    G.sort((a,b) => a.nombre.localeCompare(b.nombre));
    ND.sort((a,b) => a.nombre.localeCompare(b.nombre));

    setEnsayosVentana(V);
    setEnsayosGlobales(G);
    setNoDisponibles(ND);
  } catch (err) {
    console.error('💥 Error cargando:', err?.response?.status, err?.response?.data || err?.message);
    setError(err?.response?.data?.error || err?.message || 'Error al cargar datos.');
  } finally {
    setLoading(false);
  }
}, []); // sin dependencias (usa solo setters/axiosInstance estables)

  // 2) Llamar al montar
  useEffect(() => {
    load();
  }, [load]);

  // 3) Volver a cargar al recuperar el foco (cuando vuelves de ResolverEnsayo, por ejemplo)
  useEffect(() => {
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [load]);

    useEffect(() => {
    const onFocus = () => {
      try {
        if (sessionStorage.getItem('ventanaUsada') === '1') {
          sessionStorage.removeItem('ventanaUsada');
          // vuelve a cargar tu data (reusa tu función load)
          // si tu load está inline en useEffect, extrae a una función y llámala aquí
          // load();
          window.location.reload(); // si prefieres algo rápido
        }
      } catch {}
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);



  // Filtros por materia
  const ventFiltrados = useMemo(
    () => (materiaSeleccionada ? ensayosVentana.filter(e => e.materia_id === Number(materiaSeleccionada)) : ensayosVentana),
    [ensayosVentana, materiaSeleccionada]
  );
  const globFiltrados = useMemo(
    () => (materiaSeleccionada ? ensayosGlobales.filter(e => e.materia_id === Number(materiaSeleccionada)) : ensayosGlobales),
    [ensayosGlobales, materiaSeleccionada]
  );
  const noDispFiltrados = useMemo(
    () => (materiaSeleccionada ? noDisponibles.filter(e => e.materia_id === Number(materiaSeleccionada)) : noDisponibles),
    [noDisponibles, materiaSeleccionada]
  );

  // Columnas Inicio / Fin (para ventana: actual, próxima o última)
  const ventanaInicioFin = (e) => {
    if (e.disponibilidad !== 'ventana') return { ini: 'Ilimitado', fin: 'Ilimitado' };
    const est = e._estado || computeEstadoVentana(e);
    if (est.key === 'disponible' && est.ventanaActual) {
      const v = est.ventanaActual;
      return { ini: fmt(v.inicio), fin: fmt(v.fin) };
    }
    if (est.key === 'proximo' && est.ventanaProxima) {
      const v = est.ventanaProxima;
      return { ini: fmt(v.inicio), fin: fmt(v.fin) };
    }
    if (Array.isArray(e.ventanas) && e.ventanas.length) {
      const ordered = [...e.ventanas].sort((a,b) => new Date(a.inicio) - new Date(b.inicio));
      const last = ordered[ordered.length - 1];
      return { ini: fmt(last.inicio), fin: fmt(last.fin) };
    }
    return { ini: '-', fin: '-' };
  };

  const renderIntentos = (e) => {
    const usados = getUsados(e);
    const maxRaw = e.max_intentos;

    // null o undefined => ilimitado
    if (maxRaw == null) {
      // Puedes mostrar sólo "Ilimitado" o también cuántos lleva usados
      // return `(${usados}) Ilimitado`;
      return 'Ilimitado';
    }

    const max = Number(maxRaw);
    return `${usados}/${max}`;
  };

  // Iniciar rendición (y si el back rechaza por límite/ventana, mover a ND en vivo)
  const comenzarEnsayo = async (e) => {
    const confirmar = window.confirm('¿Estás seguro de que deseas comenzar este ensayo?');
    if (!confirmar) return;

    const moveToND = (ens, motivo) => {
      const idNum = Number(ens.id);
      setEnsayosVentana(prev => prev.filter(x => Number(x.id) !== idNum));
      setEnsayosGlobales(prev => prev.filter(x => Number(x.id) !== idNum));
      setNoDisponibles(prev => dedupeById([...prev, { ...ens, _motivo: motivo }]));
    };

    try {
      if (e.disponibilidad === 'ventana') {
        const est = e._estado || computeEstadoVentana(e);
        const vId = est?.ventanaActual?.id;
        if (!vId) { alert('Este ensayo solo se puede rendir a través de una ventana asignada.'); moveToND(e, 'Sin ventana activa'); return; }
        try {
          const r = await axiosInstance.post('/api/resultados/rendiciones', { ventana_id: vId });
          const rid = r.data?.resultado_id;
          if (!rid) throw new Error('Sin resultado_id');
          navigate(`/resolver/${rid}`); return;
        } catch (err1) {
          const s   = err1?.response?.status;
          const raw = err1?.response?.data;
          const msg = (raw?.error || raw?.message || String(raw) || err1?.message || '').toLowerCase();

          // 409 = intento ya utilizado en esta ventana
          if (s === 409 || /ya has completado.*intento/.test(msg)) {
            alert('Ya has completado un intento para esta evaluación.');
            moveToND({ ...e, _usedWindow: true }, 'Intento ya utilizado');
            return;
          }

          if (s === 403 && /límite|limite|intentos/.test(msg)) {
            alert('Has alcanzado el límite de intentos para este ensayo.');
            moveToND(e, 'Límite de intentos alcanzado');
            return;
          }

          if (s === 403 && /disponible|ventana/.test(msg)) {
            alert('Esta evaluación no está disponible en este momento.');
            moveToND(e, 'Ventana fuera de rango');
            return;
          }

          if (s !== 404) throw err1; // deja el fallback legacy si lo usas
        }
      } else {
        try {
          const r = await axiosInstance.post('/api/resultados/rendiciones', { ensayo_id: e.id });
          const rid = r.data?.resultado_id;
          if (!rid) throw new Error('Sin resultado_id');
          navigate(`/resolver/${rid}`); return;
        } catch (err1) {
          const s = err1?.response?.status;
          const raw = err1?.response?.data;
          const msg = (raw?.error || raw?.message || String(raw) || err1?.message || '').toLowerCase();

          // NUEVO: 409 = ya usaste el intento para esta ventana
          if (s === 409 || /ya has completado.*intento/.test(msg)) {
            alert('Ya has completado un intento para esta evaluación.');
            moveToND({ ...e, _usedWindow: true }, 'Intento ya utilizado');
            return;
          }

          // Ya tenías estos (déjalos):
          if (s === 403 && /límite|limite|intentos/.test(msg)) {
            alert('Has alcanzado el límite de intentos para este ensayo.');
            moveToND(e, 'Límite de intentos alcanzado');
            return;
          }
          if (s === 403 && /disponible|ventana/.test(msg)) {
            alert('Esta evaluación no está disponible en este momento.');
            moveToND(e, 'Ventana fuera de rango');
            return;
          }

          if (s !== 404) throw err1;
          // si es 404, cae al “fallback legacy” que ya tienes abajo
        }
      }

      // Fallback legacy
      const params = new URLSearchParams({ ensayo_id: String(e.id) });
      const body = { ensayo_id: e.id };
      if (e.disponibilidad === 'ventana') {
        const est = e._estado || computeEstadoVentana(e);
        const vId = est?.ventanaActual?.id;
        if (!vId) { alert('Este ensayo solo se puede rendir a través de una ventana asignada.'); moveToND(e, 'Sin ventana activa'); return; }
        params.append('ventana_id', String(vId));
        body.ventana_id = vId;
      }
      const r2 = await axiosInstance.post(`/api/resultados/crear-resultado?${params.toString()}`, body);
      const rid2 = r2.data?.resultado_id || r2.data?.resultado?.id || r2.data?.id;
      if (!rid2) throw new Error('Respuesta del servidor sin resultado_id');
      navigate(`/resolver/${rid2}`);
    } catch (err) {
      const s   = err?.response?.status;
      const raw = err?.response?.data;
      const msg = (raw?.error || raw?.message || String(raw) || err?.message || '').toLowerCase();

      console.error('💥 Error al crear resultado:', s, raw || err?.message);
      alert(raw?.error || err?.message || 'No se pudo iniciar el ensayo.');

      if (s === 409 || /ya has completado.*intento/.test(msg)) {
        moveToND({ ...e, _usedWindow: true }, 'Intento ya utilizado');
      } else if (s === 403 && /límite|limite|intentos/.test(msg)) {
        moveToND(e, 'Límite de intentos alcanzado');
      } else if (s === 403 && /disponible|ventana/.test(msg)) {
        moveToND(e, 'Ventana fuera de rango');
      }
    }
  };

  // UI
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

  // Render helpers
  const RowVentana = (e) => {
    const { ini, fin } = ventanaInicioFin(e);
    return (
      <tr key={e.id}>
        <td>{e.nombre}</td>
        <td>{e.materiaNombre}</td>
        <td>{ini}</td>
        <td>{fin}</td>
        <td>{renderIntentos(e)}</td>
        <td><button className="btn-comenzar" onClick={() => comenzarEnsayo(e)}>Comenzar</button></td>
      </tr>
    );
  };
  const RowGlobal = (e) => (
    <tr key={e.id}>
      <td>{e.nombre}</td>
      <td>{e.materiaNombre}</td>
      <td>{renderIntentos(e)}</td>
      <td><button className="btn-comenzar" onClick={() => comenzarEnsayo(e)}>Comenzar</button></td>
    </tr>
  );
  const RowNoDisp = (e) => {
    const { ini, fin } = ventanaInicioFin(e);
    return (
      <tr key={e.id}>
        <td>{e.nombre}</td>
        <td>{e.materiaNombre}</td>
        <td>{e._motivo || 'No disponible'}</td>
        <td>{ini}</td>
        <td>{fin}</td>
        <td>{renderIntentos(e)}</td>
      </tr>
    );
  };

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

      {/* Ensayos por Ventana (disponibles ahora) */}
      <div className="tabla-contenedor" style={{ marginTop: 24 }}>
        <h3 className="subtitulo-seccion">Ensayos por Ventana</h3>
        {ventFiltrados.length === 0 ? (
          <p className="nota-vacia">No hay ensayos por ventana disponibles.</p>
        ) : (
          <table className="tabla-ensayos">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Materia</th>
                <th>Inicio</th>
                <th>Fin</th>
                <th>Intentos</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>{ventFiltrados.map(RowVentana)}</tbody>
          </table>
        )}
      </div>

      {/* Ensayos Globales (permanentes disponibles) */}
      <div className="tabla-contenedor" style={{ marginTop: 32 }}>
        <h3 className="subtitulo-seccion">Ensayos Globales</h3>
        {globFiltrados.length === 0 ? (
          <p className="nota-vacia">No hay ensayos globales disponibles.</p>
        ) : (
          <table className="tabla-ensayos">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Materia</th>
                <th>Intentos</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>{globFiltrados.map(RowGlobal)}</tbody>
          </table>
        )}
      </div>

      {/* Ensayos No Disponibles */}
      <div className="tabla-contenedor" style={{ marginTop: 32 }}>
        <h3 className="subtitulo-seccion">Ensayos No Disponibles</h3>
        {noDispFiltrados.length === 0 ? (
          <p className="nota-vacia">No hay ensayos no disponibles.</p>
        ) : (
          <table className="tabla-ensayos">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Materia</th>
                <th>Motivo</th>
                <th>Inicio</th>
                <th>Fin</th>
                <th>Intentos</th>
              </tr>
            </thead>
            <tbody>{noDispFiltrados.map(RowNoDisp)}</tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default VerEnsayos;