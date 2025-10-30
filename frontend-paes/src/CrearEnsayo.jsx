import React, { useEffect, useState, useMemo } from 'react';
import axiosInstance from './services/axiosConfig';
import './CrearEnsayo.css';

// Convierte un valor de <input type="datetime-local"> a ISO UTC ("2025-10-20T12:00:00Z")
function toUtcIsoString(localDateTimeValue) {
  if (!localDateTimeValue) return null;
  // El valor viene como "YYYY-MM-DDTHH:mm" en hora local del navegador
  const d = new Date(localDateTimeValue);
  return new Date(Date.UTC(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    d.getHours(),
    d.getMinutes(),
    d.getSeconds(),
    d.getMilliseconds()
  )).toISOString();
}

const CrearEnsayo = ({ usuario }) => {
  const [materias, setMaterias] = useState([]);
  const [materiaId, setMateriaId] = useState('');
  const [preguntas, setPreguntas] = useState([]);
  const [nombre, setNombre] = useState('');
  const [preguntasSeleccionadas, setPreguntasSeleccionadas] = useState([]);
  const [error, setError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [isFadingOut, setIsFadingOut] = useState(false);

  // NUEVO: disponibilidad del ensayo
  const [disponibilidad, setDisponibilidad] = useState('permanente'); // 'permanente' | 'ventana'
  const [maxIntentos, setMaxIntentos] = useState('0'); // 0 o vacío => ilimitado

  // NUEVO: datos para crear ventana inicial (opcional)
  const [cursos, setCursos] = useState([]);
  const [cursoId, setCursoId] = useState('');
  const [inicioLocal, setInicioLocal] = useState(''); // input datetime-local
  const [duracionMin, setDuracionMin] = useState(120);

  const authHeaders = useMemo(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  useEffect(() => {
    const fetchMateriasYCursos = async () => {
      try {
        setError('');
        if (!authHeaders.Authorization) {
          setError('No hay token de autenticación. Por favor, inicia sesión.');
          return;
        }
        const config = { headers: authHeaders };
        const [resMaterias, resCursos] = await Promise.all([
          axiosInstance.get('/api/materias/', config),
          axiosInstance.get('/api/cursos', config).catch(() => ({ data: [] })), // si aún no existe endpoint, no rompe
        ]);
        setMaterias(resMaterias.data || []);
        setCursos(resCursos.data || []);
      } catch (err) {
        console.error('Error al cargar materias/cursos:', err);
        setError(err.response?.data?.error || 'Error al cargar datos iniciales.');
      }
    };
    fetchMateriasYCursos();
  }, [authHeaders]);

  useEffect(() => {
    const fetchPreguntas = async () => {
      if (materiaId) {
        try {
          setError('');
          if (!authHeaders.Authorization) {
            setError('No hay token de autenticación para cargar preguntas.');
            return;
          }
          const config = { headers: authHeaders };
          const res = await axiosInstance.get(`/api/preguntas/?materia_id=${Number(materiaId)}`, config);
          setPreguntas(res.data || []);
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
  }, [materiaId, authHeaders]);

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

    if (usuario?.rol !== 'docente' && usuario?.rol !== 'admin') {
      setError('Solo docentes (o admin) pueden crear ensayos.');
      return;
    }
    if (!nombre || !materiaId || preguntasSeleccionadas.length === 0) {
      setError('Por favor, completa todos los campos y selecciona al menos una pregunta.');
      return;
    }
    if (disponibilidad === 'ventana') {
      if (!cursoId) return setError('Selecciona un curso para la ventana inicial.');
      if (!inicioLocal) return setError('Selecciona fecha/hora de inicio para la ventana.');
      if (!duracionMin || Number(duracionMin) <= 0) return setError('Duración inválida.');
    }

    try {
      if (!authHeaders.Authorization) {
        setError('No hay token de autenticación para crear el ensayo.');
        return;
      }
      const config = { headers: { ...authHeaders, 'Content-Type': 'application/json' } };

      // 1) Crear el ENSAYO (con disponibilidad)
      const payloadEnsayo = {
        titulo: nombre, // tu backend acepta titulo o nombre; aquí usamos titulo
        materia_id: Number(materiaId),
        preguntas: preguntasSeleccionadas.map(Number),
        // NUEVO:
        disponibilidad, // 'permanente' | 'ventana'
        max_intentos: Number(maxIntentos) > 0 ? Number(maxIntentos) : null, // null => ilimitado
      };

      console.log('POST /api/ensayos/crear-ensayo-con-preguntas payload:', payloadEnsayo);
      const res = await axiosInstance.post('/api/ensayos/crear-ensayo-con-preguntas', payloadEnsayo, config);

      const ensayoCreado = res.data?.ensayo || {};
      const ensayoId = ensayoCreado.id || res.data?.ensayo_id;

      // 2) Si la disponibilidad es por ventana, crear la ventana inicial
      if (disponibilidad === 'ventana' && ensayoId) {
        const inicioUtc = toUtcIsoString(inicioLocal);
        const payloadVentana = {
          cursoId: Number(cursoId),
          ensayoId: Number(ensayoId),
          inicio: inicioUtc,
          duracionMin: Number(duracionMin),
        };
        console.log('POST /api/asignaciones payload:', payloadVentana);
        const resVentana = await axiosInstance.post('/api/asignaciones', payloadVentana, config);
        if (!resVentana || resVentana.status >= 400) {
          throw new Error('Ensayo creado, pero no se pudo crear la ventana inicial.');
        }
      }

      const ensayoNombre = ensayoCreado?.titulo || ensayoCreado?.nombre || nombre;
      setMensajeExito(
        disponibilidad === 'permanente'
          ? `Ensayo "${ensayoNombre}" creado como PERMANENTE (sin vencimiento${Number(maxIntentos) > 0 ? `, máx ${Number(maxIntentos)} intentos` : ', intentos ilimitados'}).`
          : `Ensayo "${ensayoNombre}" creado con ventana inicial asignada.`
      );

      // Reset de formulario
      setNombre('');
      setMateriaId('');
      setPreguntasSeleccionadas([]);
      setPreguntas([]);
      setDisponibilidad('permanente');
      setMaxIntentos('0');
      setCursoId('');
      setInicioLocal('');
      setDuracionMin(120);
    } catch (err) {
      console.error('Error al crear ensayo:', err);
      setError(err.response?.data?.error || err.message || 'Error al crear el ensayo. Inténtalo de nuevo.');
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

      {/* NUEVO: Bloque de disponibilidad */}
      <fieldset className="disponibilidad-fieldset">
        <legend>Disponibilidad</legend>
        <div className="disponibilidad-row">
          <label className="disp-option">
            <input
              type="radio"
              name="disponibilidad"
              value="permanente"
              checked={disponibilidad === 'permanente'}
              onChange={() => setDisponibilidad('permanente')}
            />
            Permanente (sin vencimiento)
          </label>

          <label className="disp-option">
            <input
              type="radio"
              name="disponibilidad"
              value="ventana"
              checked={disponibilidad === 'ventana'}
              onChange={() => setDisponibilidad('ventana')}
            />
            Por ventana (fecha/hora + duración)
          </label>
        </div>

        <div className="mt-2">
          <label className="block text-sm">Máximo de intentos</label>
          <input
            type="number"
            min={0}
            className="input-small"
            value={maxIntentos}
            onChange={(e) => setMaxIntentos(e.target.value)}
          />
          <span className="input-hint">0 o vacío = ilimitado</span>
        </div>
      </fieldset>

      {/* NUEVO: Si por ventana, pedir datos de la ventana inicial */}
      {disponibilidad === 'ventana' && (
        <fieldset className="ventana-fieldset">
          <legend>Ventana inicial</legend>
          <div className="ventana-grid">
            <div>
              <label>Curso</label>
              <select
                className="select-materia"
                value={cursoId}
                onChange={(e) => setCursoId(e.target.value)}
              >
                <option value="">Seleccione un curso</option>
                {cursos.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}{c.seccion ? ` ${c.seccion}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Inicio (fecha y hora)</label>
              <input
                type="datetime-local"
                className="input-nombre"
                value={inicioLocal}
                onChange={(e) => setInicioLocal(e.target.value)}
              />
            </div>

            <div>
              <label>Duración (minutos)</label>
              <input
                type="number"
                min={1}
                className="input-small"
                value={duracionMin}
                onChange={(e) => setDuracionMin(e.target.value)}
              />
            </div>
          </div>
          <p className="input-hint">Se creará una ventana para el curso seleccionado. Puedes agregar más luego.</p>
        </fieldset>
      )}

      <button className="btn-crear" onClick={crearEnsayo}>Crear Ensayo</button>
    </div>
  );
};

export default CrearEnsayo;