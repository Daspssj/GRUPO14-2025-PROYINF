// src/ResolverEnsayo.jsx
import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from './services/axiosConfig';
import { useParams, useNavigate } from 'react-router-dom';
import './ResolverEnsayo.css';

const ResolverEnsayo = () => {
  const { resultado_id } = useParams();
  const navigate = useNavigate();

  const [ensayo, setEnsayo] = useState(null);
  const [preguntas, setPreguntas] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [respuestasSeleccionadas, setRespuestasSeleccionadas] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [timeLeft, setTimeLeft] = useState(3600);
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchEnsayoAndPreguntas = async () => {
      try {
        setLoading(true);
        setError(null);

        // 👇 ruta relativa + axiosInstance adjunta el Bearer token
        const response = await axiosInstance.get(`/api/resultados/${resultado_id}/preguntas-ensayo`);
        const { ensayo: fetchedEnsayo, preguntas: fetchedPreguntas, respuestasPrevias = {} } = response.data;

        setEnsayo(fetchedEnsayo);
        setPreguntas(fetchedPreguntas || []);
        setRespuestasSeleccionadas(respuestasPrevias || {});
      } catch (err) {
        console.error('💥 Error al cargar preguntas:', err);
        if (err.response) {
          setError(`Error: ${err.response.status} - ${err.response.data.message || err.response.data.error || 'Error desconocido'}`);
        } else if (err.request) {
          setError('Error de red: no se pudo conectar al servidor.');
        } else {
          setError(`Error inesperado: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEnsayoAndPreguntas();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resultado_id]);

  // Inicia timer solo si hay preguntas
  useEffect(() => {
    if (!loading && !error && preguntas.length > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleFinalizarEnsayo(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [loading, error, preguntas.length]);

  const formatTime = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

  const handleOptionSelect = async (preguntaId, opcionId) => {
    setRespuestasSeleccionadas((prev) => ({ ...prev, [preguntaId]: opcionId }));
    try {
      await axiosInstance.post(`/api/resultados/${resultado_id}/responder`, {
        pregunta_id: preguntaId,
        respuesta_dada: opcionId,
      });
    } catch (err) {
      console.error('Error al guardar respuesta:', err);
      // Podrías mostrar un toast, pero no bloqueamos la UI
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < preguntas.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((i) => i - 1);
    }
  };

  const handleFinalizarEnsayo = async (auto = false) => {
    if (!auto) {
      const ok = window.confirm('¿Finalizar el ensayo? No podrás cambiar respuestas.');
      if (!ok) return;
    }
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      const resp = await axiosInstance.post(`/api/resultados/${resultado_id}/finalizar`, {});
      console.log('Finalizado:', resp.data);
      // Ir a detalle del resultado (tu front muestra modal desde Mis Resultados;
      // aquí te dejo una navegación opcional a la lista)
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Error al finalizar el ensayo:', err);
      alert('Error al finalizar el ensayo. Intenta nuevamente.');
    }
  };

  if (loading) {
    return <div className="container"><p className="message">Cargando ensayo...</p></div>;
  }

  if (error) {
    return (
      <div className="container">
        <p className="message error-message">{error}</p>
        <button onClick={() => navigate('/')} className="nav-button" style={{ marginTop: 16 }}>Volver</button>
      </div>
    );
  }

  if (!ensayo || preguntas.length === 0) {
    return (
      <div className="container">
        <p className="message">Este ensayo no tiene preguntas asignadas.</p>
        <button onClick={() => navigate('/')} className="nav-button" style={{ marginTop: 16 }}>Volver</button>
      </div>
    );
  }

  const currentQuestion = preguntas[currentQuestionIndex];

  return (
    <div className="container">
      <h2 className="title">Ensayo: {ensayo.titulo}</h2>

      <div className="timer-container">
        Tiempo restante: <span className="timer-display">{formatTime(timeLeft)}</span>
      </div>

      <div className="question-container">
        <p className="question-counter">Pregunta {currentQuestionIndex + 1} de {preguntas.length}</p>
        <h3 className="question-text">{currentQuestion.texto}</h3>

        <div className="options-container">
          {currentQuestion.opciones?.map(opcion => (
            <label key={opcion.id} className="option-label">
              <input
                type="radio"
                name={`question-${currentQuestion.id}`}
                value={opcion.id}
                checked={respuestasSeleccionadas[currentQuestion.id] === opcion.id}
                onChange={() => handleOptionSelect(currentQuestion.id, opcion.id)}
                className="radio-input"
              />
              {opcion.texto}
            </label>
          ))}
        </div>

        <div className="navigation-buttons">
          <button onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0}
                  className={`nav-button ${currentQuestionIndex === 0 ? 'nav-button-disabled' : ''}`}>
            Anterior
          </button>
          <button onClick={handleNextQuestion} disabled={currentQuestionIndex === preguntas.length - 1}
                  className={`nav-button ${currentQuestionIndex === preguntas.length - 1 ? 'nav-button-disabled' : ''}`}>
            Siguiente
          </button>

          {currentQuestionIndex === preguntas.length - 1 && (
            <button onClick={() => handleFinalizarEnsayo(false)} className="finalizar-button">
              Finalizar Ensayo
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResolverEnsayo;