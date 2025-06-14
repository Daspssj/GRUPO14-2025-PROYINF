import { useState, useEffect } from 'react';
import axios from 'axios';

export default function RendirEnsayo({ ensayoId, alumnoId }) {
  const [preguntas, setPreguntas] = useState([]);
  const [respuestas, setRespuestas] = useState({});
  const [resultadoId, setResultadoId] = useState(null);

  useEffect(() => {
    axios.post(`/api/ensayos/${ensayoId}/iniciar`, { alumnoId })
      .then(res => setResultadoId(res.data.resultadoId));

    axios.get(`/api/ensayos/${ensayoId}/preguntas`)
      .then(res => setPreguntas(res.data));
  }, [ensayoId]);

  const manejarCambio = (preguntaId, valor) => {
    setRespuestas(prev => ({ ...prev, [preguntaId]: valor }));
  };

  const enviarRespuestas = async () => {
    const lista = preguntas.map(p => ({
      preguntaId: p.id,
      respuestaDada: respuestas[p.id]
    }));

    await axios.post(`/api/resultados/${resultadoId}/respuestas`, { respuestas: lista });
    alert('¡Respuestas enviadas!');
  };

  return (
    <div>
      <h2>Responde el ensayo</h2>
      {preguntas.map(p => (
        <div key={p.id}>
          <p>{p.enunciado}</p>
          {['A', 'B', 'C', 'D'].map(op => (
            <label key={op}>
              <input
                type="radio"
                name={`pregunta-${p.id}`}
                value={op}
                checked={respuestas[p.id] === op}
                onChange={e => manejarCambio(p.id, e.target.value)}
              />
              {p[`opcion_${op.toLowerCase()}`]}
            </label>
          ))}
          <hr />
        </div>
      ))}
      <button onClick={enviarRespuestas}>Enviar</button>
    </div>
  );
}