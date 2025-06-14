import React, { useState } from 'react';
import Login from './Login';
import VerEnsayos from './VerEnsayos';

const App = () => {
  const [logueado, setLogueado] = useState(!!localStorage.getItem('token'));

  return (
    <div>
      {logueado ? (
        <VerEnsayos />
      ) : (
        <Login onLogin={() => setLogueado(true)} />
      )}
    </div>
  );
};

export default App;
