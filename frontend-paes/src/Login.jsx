import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';

const Login = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);

  // Campos comunes
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');

  // Solo para registro
  const [nombre, setNombre] = useState('');
  const [rol, setRol] = useState('alumno');
  const [claveSecreta, setClaveSecreta] = useState('');

  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setMensaje('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');

    if (isLogin) {
      // Login
      try {
        const res = await axios.post('/api/login', {
          correo,
          contrasena
        });

        const { token, usuario } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('usuario', JSON.stringify(usuario));
        onLogin(usuario);
      } catch {
        setError('Credenciales incorrectas');
      }
    } else {
      // Registro
      if (!nombre || !correo || !contrasena || !rol) {
        setError('Todos los campos son obligatorios');
        return;
      }

      if (rol === 'docente' && claveSecreta !== '3312') {
        setError('Clave secreta incorrecta para registrar docentes');
        return;
      }

      try {
        const res = await axios.post('/api/registro', {
            nombre,
            correo,
            contrasena,
            rol
        });

        setMensaje(`Usuario ${res.data.nombre} creado con éxito`);
        setIsLogin(true);
    } catch (err) {
        console.error('Error completo:', err); // NUEVO: imprime todo el error

        if (err.response?.data?.error) {
            setError(err.response.data.error);
        } else if (err.response) {
            setError('Error desconocido: ' + JSON.stringify(err.response.data));
        } else if (err.request) {
            setError('No hubo respuesta del servidor.');
        } else {
            setError('Error inesperado: ' + err.message);
        }
    }
    }
  };

  return (
    <div className="login-container">
      <h2>{isLogin ? 'Iniciar sesión' : 'Registro'}</h2>

      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <>
            <input type="text" placeholder="Nombre completo" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </>
        )}

        <input type="email" placeholder="Correo" value={correo} onChange={(e) => setCorreo(e.target.value)} />
        <input type="password" placeholder="Contraseña" value={contrasena} onChange={(e) => setContrasena(e.target.value)} />

        {!isLogin && (
          <>
            <select value={rol} onChange={(e) => setRol(e.target.value)}>
              <option value="alumno">Alumno</option>
              <option value="docente">Docente</option>
            </select>

            {rol === 'docente' && (
              <input type="password" placeholder="Clave secreta docente" value={claveSecreta} onChange={(e) => setClaveSecreta(e.target.value)} />
            )}
          </>
        )}

        <button type="submit">{isLogin ? 'Ingresar' : 'Registrarse'}</button>
      </form>

      {error && <p className="error">{error}</p>}
      {mensaje && <p className="success">{mensaje}</p>}

      <p onClick={toggleMode} className="toggle-mode">
        {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
      </p>
    </div>
  );
};

export default Login;
