
    SET search_path TO "$user", public;


    CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        correo VARCHAR(255) UNIQUE NOT NULL,
        contrasena VARCHAR(255) NOT NULL, 
        rol VARCHAR(50) NOT NULL 
    );


    CREATE TABLE IF NOT EXISTS materias (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) UNIQUE NOT NULL
    );


    CREATE TABLE IF NOT EXISTS preguntas (
        id SERIAL PRIMARY KEY,
        enunciado TEXT NOT NULL,
        imagen VARCHAR(255), 
        opcion_a TEXT NOT NULL,
        opcion_b TEXT NOT NULL,
        opcion_c TEXT NOT NULL,
        opcion_d TEXT NOT NULL,
        respuesta_correcta VARCHAR(1) NOT NULL, -- 'A', 'B', 'C' ou 'D'
        materia_id INTEGER NOT NULL REFERENCES materias(id) ON DELETE CASCADE
    );


    CREATE TABLE IF NOT EXISTS ensayos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        docente_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        materia_id INTEGER NOT NULL REFERENCES materias(id) ON DELETE CASCADE
    );


    CREATE TABLE IF NOT EXISTS ensayo_pregunta (
        id SERIAL PRIMARY KEY,
        ensayo_id INTEGER NOT NULL REFERENCES ensayos(id) ON DELETE CASCADE,
        pregunta_id INTEGER NOT NULL REFERENCES preguntas(id) ON DELETE CASCADE,
        UNIQUE(ensayo_id, pregunta_id) 
    );


    CREATE TABLE IF NOT EXISTS resultados (
        id SERIAL PRIMARY KEY,
        ensayo_id INTEGER NOT NULL REFERENCES ensayos(id) ON DELETE CASCADE,
        alumno_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        puntaje INTEGER DEFAULT 0, -- Pontuação final do ensaio
        fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );


    CREATE TABLE IF NOT EXISTS respuestas (
        id SERIAL PRIMARY KEY,
        resultado_id INTEGER NOT NULL REFERENCES resultados(id) ON DELETE CASCADE,
        pregunta_id INTEGER NOT NULL REFERENCES preguntas(id) ON DELETE CASCADE,
        respuesta_dada VARCHAR(1) NOT NULL, 
        correcta BOOLEAN NOT NULL, 
        UNIQUE(resultado_id, pregunta_id)
    );
    
