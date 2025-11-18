// src/Login.jsx
import React, { useState, useCallback } from 'react';
import axiosInstance from './services/axiosConfig';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  // Campos Login
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');

  // Campos Registro
  const [nombre, setNombre] = useState('');

  // UI state
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setMensaje('');
    // no limpiamos correo para facilitar volver; si limpiamos contraseña
    setContrasena('');
  };

  const goGoogle = useCallback(() => {
    try {
      window.location.assign('/api/auth/oauth/google/start');
    } catch {
      // si algo falla, dejamos que el <a href> haga su trabajo
    }
  }, []);

  const onLoginSuccess = (token, usuario) => {
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
    onLogin?.(usuario, token);
    navigate('/', { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');
    setLoading(true);

    try {
      if (isLogin) {
        // ---- LOGIN (Sin cambios) ----
        if (!correo || !contrasena) {
          setError('Debes ingresar correo y contraseña.');
          setLoading(false); // Detenemos el loading
          return;
        }
        const res = await axiosInstance.post('/api/auth/login', {
          correo: correo.trim(),
          contrasena,
        });
        const { token, usuario } = res.data || {};
        if (!token || !usuario) throw new Error('Respuesta invalida del servidor');
        onLoginSuccess(token, usuario);
      } else {
        // ---- REGISTRO (Modificado) ----
        // (Validacion sin rol)
        if (!nombre.trim() || !correo.trim() || !contrasena) {
          setError('Todos los campos son obligatorios.');
          setLoading(false); // Detenemos el loading
          return;
        }
        if (contrasena.length < 6) {
          setError('La contraseña debe tener al menos 6 caracteres.');
          setLoading(false); // Detenemos el loading
          return;
        }

        // (Payload sin rol)
        const res = await axiosInstance.post('/api/auth/registro', {
          nombre: nombre.trim(),
          correo: correo.trim(),
          contrasena,
        });

        // ---- (LOGICA DE EXITO MODIFICADA) ----
        // Asumimos que el registro ahora devuelve un token temporal
        // para forzar el Onboarding (igual que Google)
        const { temp_token, tempToken, token } = res.data || {};
        const finalTempToken = temp_token || tempToken || token;

        if ((res.status === 201 || res.status === 200) && finalTempToken) {
            // Limpiamos el formulario (opcional)
            setNombre('');
            setCorreo('');
            setContrasena('');
            
            // Redirigimos al Onboarding con el token temporal
            navigate(
                `/onboarding?temp_token=${finalTempToken}&name=${encodeURIComponent(nombre.trim())}&email=${encodeURIComponent(correo.trim())}`,
                { replace: true }
            );
        } else {
            // Fallback si el backend no devuelve un token temp (comportamiento antiguo)
            console.warn("El registro fue exitoso pero no devolvio un temp_token, mostrando mensaje.")
            setMensaje(`Usuario ${nombre} creado con exito. Ahora inicia sesion.`);
            setIsLogin(true);
            setContrasena('');
        }
      }
    } catch (err) {
      console.error('[AUTH] error', err);
      if (err?.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err?.response) {
        setError('Error desconocido: ' + JSON.stringify(err.response.data));
      } else if (err?.request) {
        setError('No hubo respuesta del servidor.');
      } else {
        setError('Error inesperado: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="login-container"
      style={{ position: 'relative', zIndex: 1, pointerEvents: 'auto' }}
    >
      <h2>{isLogin ? 'Iniciar sesion' : 'Registro'}</h2>

      {/* FORMULARIO principal */}
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <input
            type="text"
            placeholder="Nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        )}

        <input
          type="email"
          placeholder="Correo"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
        />

        <input
          type="password"
          placeholder={isLogin ? 'Contraseña' : 'Minimo 6 caracteres'}
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Procesando...' : isLogin ? 'Ingresar' : 'Registrarse'}
        </button>
      </form>

      {/* Separador visual */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
        <hr style={{ flex: 1 }} />
        <span style={{ opacity: 0.7 }}>o</span>
        <hr style={{ flex: 1 }} />
      </div>

      <a
        href={`${API_BASE}/api/auth/oauth/google/start`}
        style={{
          display: 'inline-block',
          marginTop: 12,
          padding: '10px 12px',
          border: '1px solid #ccc',
          borderRadius: 6,
          textDecoration: 'none',
          fontWeight: 600,
          background: '#fff',
          color: '#111',
          position: 'relative',
          zIndex: 2,
          pointerEvents: 'auto'
        }}
      >
        {isLogin ? 'Ingresar con Google' : 'Registrarse con Google'}
      </a>

      {error && <p className="error">{error}</p>}
      {mensaje && <p className="success">{mensaje}</p>}

      {/* Link para cambiar de modo */}
      <p onClick={toggleMode} className="toggle-mode" style={{ cursor: 'pointer' }}>
        {isLogin ? '¿No tienes cuenta? Registrate aqui' : '¿Ya tienes cuenta? Inicia sesion'}
      </p>
    </div>
  );
};

Login.propTypes = {
  // onLogin puede ser opcional
  onLogin: PropTypes.func, 
};

export default Login;
