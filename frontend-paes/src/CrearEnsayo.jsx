import React, { useState } from 'react';
import axios from 'axios';
import './CrearEnsayo.css';

const CrearEnsayo = ({ usuario, onCreado }) => {
  const [tipoEnsayo, setTipoEnsayo] = useState('');
  const [ejesM1, setEjesM1] = useState({
    numeros: true,
    algebra: true,
    geometria: true,
    probabilidad: true
  });
  const [cantidadPreguntas, setCantidadPreguntas] = useState(50);
  const [nombreEnsayo, setNombreEnsayo] = useState('');
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  const tiposDeEnsayo = [
    { value: 'CL', label: 'Competencia Lectora' },
    { value: 'M1', label: 'Competencia Matemática 1 (M1)' },
    { value: 'CI', label: 'Ciencias (Biología, Física, Química)' },
    { value: 'HS', label: 'Historia y Ciencias Sociales' },
    { value: 'M2', label: 'Competencia Matemática 2 (M2)' }
  ];

  const handleEjeChange = (eje) => {
    setEjesM1(prev => ({
      ...prev,
      [eje]: !prev[eje]
    }));
  };

  const generarNombrePorDefecto = () => {
    const fecha = new Date().toLocaleDateString('es-CL');
    const tipoLabel = tiposDeEnsayo.find(t => t.value === tipoEnsayo)?.label || tipoEnsayo;
    return `Ensayo ${tipoLabel} - ${fecha}`;
  };

  const validarFormulario = () => {
    if (!tipoEnsayo) {
      alert('Por favor selecciona un tipo de ensayo');
      return false;
    }

    if (cantidadPreguntas <= 0) {
      alert('La cantidad de preguntas debe ser mayor a 0');
      return false;
    }

    // Si es M1, verificar que al menos un eje esté seleccionado
    if (tipoEnsayo === 'M1') {
      const ejesSeleccionados = Object.values(ejesM1).some(valor => valor);
      if (!ejesSeleccionados) {
        alert('Para Matemática 1, debes seleccionar al menos un eje temático');
        return false;
      }
    }

    return true;
  };

  const crearEnsayo = async () => {
    if (!validarFormulario()) return;

    setLoading(true);
    
    try {
      const nombreFinal = nombreEnsayo.trim() || generarNombrePorDefecto();
      
      const payload = {
        tipo: tipoEnsayo,
        nombre: nombreFinal,
        cantidad: cantidadPreguntas,
        docente_id: usuario.id,
        ...(tipoEnsayo === 'M1' && { ejes: ejesM1 })
      };

      await axios.post('http://localhost:3000/api/crear-ensayo-automatico', payload, {
        headers: { Authorization: token }
      });

      alert('¡Ensayo creado con éxito!');
      
      // Limpiar formulario
      setTipoEnsayo('');
      setEjesM1({
        numeros: true,
        algebra: true,
        geometria: true,
        probabilidad: true
      });
      setCantidadPreguntas(50);
      setNombreEnsayo('');
      
      // Redirigir a la lista de ensayos
      if (onCreado) onCreado();
      
    } catch (error) {
      console.error('Error al crear ensayo:', error);
      const mensaje = error.response?.data?.message || 'Error al crear el ensayo';
      alert(mensaje);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="crear-ensayo-container">
      <h2>📝 Crear Ensayo</h2>

      <div className="form-group">
        <label htmlFor="tipo-ensayo">Tipo de Ensayo:</label>
        <select
          id="tipo-ensayo"
          value={tipoEnsayo}
          onChange={e => setTipoEnsayo(e.target.value)}
          className="select-tipo-ensayo"
          disabled={loading}
        >
          <option value="">Seleccione un tipo de ensayo</option>
          {tiposDeEnsayo.map(tipo => (
            <option key={tipo.value} value={tipo.value}>
              {tipo.label}
            </option>
          ))}
        </select>
      </div>

      {tipoEnsayo === 'M1' && (
        <div className="form-group ejes-m1-container">
          <label>Ejes Temáticos M1:</label>
          <div className="checkboxes-container">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={ejesM1.numeros}
                onChange={() => handleEjeChange('numeros')}
                disabled={loading}
              />
              <span>Números</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={ejesM1.algebra}
                onChange={() => handleEjeChange('algebra')}
                disabled={loading}
              />
              <span>Álgebra y Funciones</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={ejesM1.geometria}
                onChange={() => handleEjeChange('geometria')}
                disabled={loading}
              />
              <span>Geometría</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={ejesM1.probabilidad}
                onChange={() => handleEjeChange('probabilidad')}
                disabled={loading}
              />
              <span>Probabilidad y Estadística</span>
            </label>
          </div>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="cantidad-preguntas">Cantidad de Preguntas:</label>
        <input
          id="cantidad-preguntas"
          type="number"
          min="1"
          max="200"
          value={cantidadPreguntas}
          onChange={e => setCantidadPreguntas(parseInt(e.target.value) || 0)}
          className="input-cantidad"
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="nombre-ensayo">Nombre del Ensayo (Opcional):</label>
        <input
          id="nombre-ensayo"
          type="text"
          placeholder="Si no ingresa un nombre, se generará automáticamente"
          value={nombreEnsayo}
          onChange={e => setNombreEnsayo(e.target.value)}
          className="input-nombre"
          disabled={loading}
        />
        {tipoEnsayo && (
          <small className="nombre-preview">
            Vista previa: {nombreEnsayo.trim() || generarNombrePorDefecto()}
          </small>
        )}
      </div>

      <button 
        className={`btn-crear ${loading ? 'loading' : ''}`}
        onClick={crearEnsayo}
        disabled={loading}
      >
        {loading ? '⏳ Creando...' : '✅ Crear Ensayo'}
      </button>
    </div>
  );
};

export default CrearEnsayo;