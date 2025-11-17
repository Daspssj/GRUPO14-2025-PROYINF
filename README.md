# Plataforma de Ensayos PAES — Documentación Técnica

## 1. Introducción y objetivos

La plataforma PAES es una aplicación web para la gestión y rendición de ensayos de preparación académica, orientada a alumnos y docentes.  

Los objetivos principales del sistema son:

- Permitir que **alumnos** y **docentes** se autentiquen (localmente o mediante Google OAuth).
- Administrar un **banco de preguntas** por materia.
- Crear **ensayos** (simulacros PAES) a partir del banco de preguntas.
- Gestionar la **relación Usuario ↔ Colegio ↔ Curso**, y utilizarla para la asignación de ensayos.
- Ofrecer dos modalidades de ensayos:
  - **Ensayos permanentes globales** (sin vencimiento, visibles para cualquier alumno).
  - **Ensayos por ventana** (acotados a un intervalo de tiempo y a un curso específico).
- Registrar **resultados y respuestas** por alumno y ensayo, respetando:
  - Ventanas de rendición.
  - Límite de intentos por ensayo.

La solución está construida con:

- **Frontend:** React.
- **Backend:** microservicios Node.js + Express.
- **Base de datos:** PostgreSQL.
- **API Gateway:** Nginx.
- **Orquestación:** Docker Compose.

---

## 2. Arquitectura del sistema

### 2.1 Visión general

La plataforma está compuesta por varios microservicios que exponen APIs REST, detrás de un API Gateway (Nginx), consumidos por un frontend React (SPA).

Componentes principales:

- **Frontend (React SPA)**
  - Responsable del flujo de autenticación, onboarding, wizard de colegio/curso, vistas de alumno/docente, rendición de ensayos, etc.
  - Se comunica exclusivamente con el backend vía `HTTP` a través del Gateway (`/api/...`).

- **API Gateway (Nginx)**
  - Reverse proxy que expone una única entrada pública (`http://localhost` o dominio en producción).
  - Rutea las peticiones por prefijo a cada microservicio.
  - Reenvía encabezados relevantes (`Authorization`, `Cookie`, `X-Forwarded-*`).
  - Gestiona CORS.

- **Microservicios Node.js/Express**
  - `auth-service` (`/api/auth/*`): autenticación local, Google OAuth, emisión de JWT.
  - `materias-service` (`/api/materias/*`): CRUD de materias.
  - `preguntas-service` (`/api/preguntas/*`): CRUD de preguntas por materia.
  - `ensayos-service` (`/api/ensayos/*`): creación/edición de ensayos, gestión de ventanas, listado de ensayos disponibles para alumnos.
  - `resultados-service` (`/api/resultados/*`): registro y consulta de resultados y respuestas.
  - `respuestas-service` (`/api/respuestas/*`): (opcional) operaciones específicas de respuestas.
  - `colegios-cursos-service`:
    - `/api/colegios/*`: gestión de colegios.
    - `/api/cursos/*`: gestión de cursos.
    - `/api/mi/*`: cursos a los que pertenece el usuario.
    - `/api/curso_miembros/*`: membresías usuario–curso.

- **Base de datos PostgreSQL**
  - Un único esquema `paes_db`, compartido por todos los servicios.
  - Migraciones SQL versionadas en `db/`.

### 2.2 Ruteo (Nginx → servicios)

Ejemplo de tabla de ruteo:

| Ruta pública              | Servicio interno             | Puerto interno |
|---------------------------|------------------------------|----------------|
| `/api/auth/`              | `auth-service`              | 5001           |
| `/api/preguntas/`         | `preguntas-service`         | 5002           |
| `/api/ensayos/`           | `ensayos-service`           | 5003           |
| `/api/resultados/`        | `resultados-service`        | 5004           |
| `/api/materias/`          | `materias-service`          | 5005           |
| `/api/respuestas/`        | `respuestas-service`        | 5006           |
| `/api/colegios/`          | `colegios-cursos-service`   | 5007           |
| `/api/cursos/`            | `colegios-cursos-service`   | 5010           |
| `/api/mi/`                | `colegios-cursos-service`   | 5010           |
| `/api/curso_miembros/`    | `colegios-cursos-service`   | 5010           |
| `postgres:5432` (interno) | Base de datos `paes_db`     | 5432           |

Ejemplo de configuración Nginx para el servicio de colegios/cursos:

```bash
location ^~ /api/colegios {
    proxy_pass http://colegios_cursos_service$request_uri;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Authorization $http_authorization;
    proxy_set_header Cookie $http_cookie;
}

location ^~ /api/cursos {
    proxy_pass http://colegios_cursos_service$request_uri;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Authorization $http_authorization;
    proxy_set_header Cookie $http_cookie;
}

location ^~ /api/mi {
    proxy_pass http://colegios_cursos_service$request_uri;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Authorization $http_authorization;
    proxy_set_header Cookie $http_cookie;
}

location ^~ /api/curso_miembros {
    proxy_pass http://colegios_cursos_service$request_uri;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Authorization $http_authorization;
    proxy_set_header Cookie $http_cookie;
}
```

---

## 3. Modelo de datos

### 3.1 Entidades principales

Resumen de tablas relevantes (simplificado):

* `usuarios`
* `colegios`, `cursos`, `curso_miembros`
* `materias`
* `preguntas`, `ensayos`, `ensayo_pregunta`
* `ventanas_rendicion`
* `resultados`, `respuestas`

### 3.2 Diagrama ER (resumen)

```mermaid
erDiagram
  USUARIOS ||--o{ ENSAYOS : "docente_id"
  USUARIOS ||--o{ CURSO_MIEMBROS : "usuario_id"
  COLEGIOS ||--o{ CURSOS : "colegio_id"
  CURSOS ||--o{ CURSO_MIEMBROS : "curso_id"
  CURSOS ||--o{ VENTANAS_RENDICION : "curso_id"
  MATERIAS ||--o{ PREGUNTAS : "materia_id"
  MATERIAS ||--o{ ENSAYOS : "materia_id"
  ENSAYOS ||--o{ ENSAYO_PREGUNTA : "ensayo_id"
  PREGUNTAS ||--o{ ENSAYO_PREGUNTA : "pregunta_id"
  ENSAYOS ||--o{ VENTANAS_RENDICION : "ensayo_id"
  ENSAYOS ||--o{ RESULTADOS : "ensayo_id"
  VENTANAS_RENDICION ||--o{ RESULTADOS : "ventana_id"

  USUARIOS {
    int id PK
    text nombre
    citext correo UNIQUE
    text contrasena?
    varchar rol          // alumno | docente
    boolean correo_verificado
    text auth_origen     // local | google
  }

  COLEGIOS {
    int id PK
    text nombre
    text comuna?
  }

  CURSOS {
    int id PK
    int colegio_id FK
    text nombre
    int anio
    text seccion
  }

  CURSO_MIEMBROS {
    int id PK
    int curso_id FK
    int usuario_id FK
    varchar rol_en_curso // alumno | docente | ayudante
  }

  MATERIAS {
    int id PK
    text nombre
  }

  PREGUNTAS {
    int id PK
    text enunciado
    text opcion_a
    text opcion_b
    text opcion_c
    text opcion_d
    char respuesta_correcta
    int materia_id FK
  }

  ENSAYOS {
    int id PK
    text nombre
    timestamptz fecha_creacion
    int docente_id FK
    int materia_id FK
    varchar disponibilidad // permanente | ventana
    int max_intentos?      // NULL = ilimitado
  }

  ENSAYO_PREGUNTA {
    int id PK
    int ensayo_id FK
    int pregunta_id FK
  }

  VENTANAS_RENDICION {
    int id PK
    int ensayo_id FK
    int curso_id FK
    timestamptz inicio
    timestamptz fin
    int duracion_min
    tstzrange periodo
  }

  RESULTADOS {
    int id PK
    int ensayo_id FK
    int alumno_id FK
    int puntaje
    timestamptz fecha
    int ventana_id FK? // NULL si permanente
  }

  RESPUESTAS {
    int id PK
    int resultado_id FK
    int pregunta_id FK
    text respuesta_dada
    boolean correcta
  }
```

### 3.3 Reglas de integridad y lógica de negocio

* **Colegios y cursos**

  * Normalización de texto al crear/buscar: `trim`, to lowercase, remover tildes.
  * Pseudo-unicidad basada en columnas normalizadas para evitar duplicados.
  * `curso_miembros` tiene `UNIQUE (curso_id, usuario_id)` para impedir membresías duplicadas.

* **Ensayos**

  * `disponibilidad ∈ {'permanente', 'ventana'}`, por defecto `'permanente'`.
  * `max_intentos`:

    * `NULL` → intentos ilimitados.
    * `N > 0` → máximo N intentos por alumno; la validación se hace al crear resultados.

* **Ventanas de rendición**

  * `CHECK (fin = inicio + (duracion_min || ' minutes')::interval)`.
  * Columna `periodo` de tipo `tstzrange` con constraint `EXCLUDE USING gist` para evitar solapamiento por `(curso_id, ensayo_id)`.
  * `ventanas_rendicion.ensayo_id` y `curso_id` referencian a `ensayos` y `cursos` respectivamente.
  * `resultados.ventana_id` referencia a `ventanas_rendicion(id)` con `ON DELETE SET NULL`.

* **Membresías**

  * Un usuario puede pertenecer a varios cursos.
  * No se permite borrar membresía si existen resultados asociados a ese curso o ventanas activas que lo afecten (validación implementada en la API).

---

## 4. APIs principales

En esta sección se resumen los endpoints más relevantes. Los paths están expresados desde el Gateway (`/api/...`).

### 4.1 Autenticación y usuarios (auth-service)

Ejemplos mínimos:

* `POST /api/auth/registro`
  Registra usuario local (correo y contraseña); luego el usuario completa onboarding (elección de rol y colegio/curso).

* `POST /api/auth/login`
  Devuelve un JWT con información del usuario (id, rol global).

* Flujo Google OAuth:

  * `GET /api/auth/oauth/google/start`
  * `GET /api/auth/oauth/google/callback`

### 4.2 Colegios, cursos y membresías (colegios-cursos-service)

* `GET /api/colegios?query=<texto>&page=1&pageSize=10`
  Busca colegios por nombre (normalizado), con paginación.

* `POST /api/colegios`
  Crea un colegio nuevo (normalizado, con control de duplicados).
  Actualmente, la creación está pensada para **docentes** (los alumnos seleccionan colegios existentes en el wizard).

* `GET /api/cursos?colegioId=<id>&query=<texto>`
  Lista cursos de un colegio, con filtro opcional por nombre/año/sección.

* `POST /api/cursos`
  Crea un curso asociado a un colegio.
  El creador (docente) queda auto-afiliado al curso con `rol_en_curso='docente'`.

* `POST /api/cursos/:cursoId/unirse`
  Crea membresía para el usuario autenticado en el curso especificado (si no existe).

* `GET /api/mi/cursos`
  Devuelve los cursos a los que pertenece el usuario actual (alumno o docente).

* `DELETE /api/curso_miembros/:id`
  Elimina una membresía si:

  * No hay resultados asociados.
  * No hay ventanas activas que dependan de dicha membresía.
    En caso contrario responde con `409` y mensaje de error.

### 4.3 Ensayos y preguntas (ensayos-service, preguntas-service)

* `POST /api/ensayos/crear-ensayo-con-preguntas`
  Crea un ensayo y asocia un conjunto de preguntas.

  Request (ejemplo):

  ```bash
  {
    "nombre": "Ensayo PAES Matemáticas 1",
    "materia_id": 1,
    "preguntas": [101, 102, 103],
    "disponibilidad": "permanente",
    "max_intentos": null
  }
  ```

  Lógica relevante:

  * Solo `docente` (o `admin`) pueden crear.
  * Si `disponibilidad = 'ventana'`, el ensayo se utiliza a través de **ventanas**.
  * Si `disponibilidad = 'permanente'`, el ensayo es global (visible para todos los alumnos) y se aplica `max_intentos`.

* `PUT /api/ensayos/:id`
  Actualiza nombre, materia, disponibilidad y `max_intentos` de un ensayo.
  Solo el docente creador (o admin) puede modificarlo.

* `GET /api/ensayos/:ensayo_id/preguntas`
  Devuelve los datos del ensayo y las preguntas asociadas.
  Control de permisos: un docente solo puede ver ensayos propios; admin puede ver todos.

* `GET /api/ensayos/listar-todos`
  Lista todos los ensayos (docentes y alumnos pueden ver el catálogo, según las reglas de visibilidad que use el frontend).

### 4.4 Ventanas de rendición (ensayos-service)

* `GET /api/ensayos/:ensayo_id/ventanas`
  Lista ventanas configuradas para un ensayo dado.

* `POST /api/ensayos/:ensayo_id/ventanas`
  Crea una ventana de rendición para un curso.

  Request (ejemplo):

  ```bash
  {
    "curso_id": 10,
    "inicio": "2025-07-01T10:00:00Z",
    "duracion_min": 90
  }
  ```

  Reglas:

  * El ensayo debe tener `disponibilidad = 'ventana'`.
  * El usuario autenticado debe ser el docente autor del ensayo.
  * El docente debe pertenecer como docente al curso (`curso_miembros`).
  * Se calcula automáticamente `fin = inicio + duracion_min`.
  * Se crea `periodo = tstzrange(inicio, fin, '[]')`.
  * Si se produce solapamiento con otra ventana del mismo `(curso_id, ensayo_id)`, devuelve `409`.

* `PUT /api/ensayos/ventanas/:id`
  Actualiza una ventana existente (curso, inicio, duración).
  Revalida propiedad del ensayo y constraints de solapamiento.

* `DELETE /api/ensayos/ventanas/:id`
  Elimina una ventana, validando que el docente tenga permiso sobre el ensayo.

### 4.5 Ensayos disponibles para el alumno (ensayos-service)

* `GET /api/ensayos/disponibles-para-alumno`
  Devuelve la lista de ensayos que el alumno **puede rendir** en ese momento, combinando:

  1. **Ensayos por ventana activa**

     * El alumno debe pertenecer a un curso que tenga una ventana activa para el ensayo.
     * No debe existir un resultado previo para esa ventana (`NOT EXISTS resultado con ventana_id = vr.id`).
     * La ventana debe estar vigente (`NOW() BETWEEN inicio AND fin`).

  2. **Ensayos permanentes globales**

     * `ensayos.disponibilidad = 'permanente'`.
     * Visibles para cualquier alumno (catálogo global).
     * El control de `max_intentos` se aplica al momento de crear el resultado (en el servicio de resultados).

  El resultado se retorna tipificado, por ejemplo:

  ```bash
  [
    {
      "ensayo_id": 5,
      "titulo": "Ensayo Matemáticas - Curso A",
      "tipo": "ventana",
      "ventana_id": 12,
      "inicio": "2025-07-01T10:00:00Z",
      "fin": "2025-07-01T11:30:00Z",
      "duracion_min": 90,
      "materia_nombre": "Matemáticas",
      "max_intentos": null
    },
    {
      "ensayo_id": 7,
      "titulo": "Ensayo Global Lenguaje 1",
      "tipo": "permanente",
      "ventana_id": null,
      "inicio": null,
      "fin": null,
      "duracion_min": null,
      "materia_nombre": "Lenguaje",
      "max_intentos": 3
    }
  ]
  ```

El frontend, a partir de esta información y de los resultados históricos, categoriza ensayos como:

* **Disponibles** (ventana activa y/o permanentes no agotados).
* **Finalizados / no disponibles**:

  * Ventana expirada.
  * Ensayo permanente con `max_intentos` alcanzado.

### 4.6 Resultados y respuestas (resultados-service)

De forma resumida:

* `POST /api/resultados/crear-resultado` o equivalente (dependiendo de la versión):

  * Para ensayo permanente: se pasa `ensayo_id`.
  * Para ensayo por ventana: se pasa `ventana_id`.
  * El servicio valida:

    * Límite de `max_intentos` (ensayos permanentes).
    * Pertenencia del alumno al curso (si aplica).
    * Ventana vigente (si aplica).

* `POST /api/resultados/:resultado_id/responder`

  * Registra una respuesta para una pregunta.

* `POST /api/resultados/:resultado_id/finalizar`

  * Cierra el intento, calcula el puntaje y marca la fecha de finalización.

* `GET /api/resultados/ver-resultados`

  * Alumno: ve sus propios resultados.
  * Docente: puede filtrar resultados por curso/alumno, según permisos.

---

## 5. Flujos funcionales clave

### 5.1 Onboarding y selección de colegio/curso

1. El usuario se autentica:

   * Google OAuth o login local.
2. Si el usuario no tiene rol global asignado:

   * La aplicación muestra pantalla de selección de rol: `alumno` o `docente`.
3. Se ejecuta el wizard:

   * **Paso 1: Colegio**

     * Búsqueda de colegios existentes (GET `/api/colegios`).
     * El usuario selecciona un colegio.
     * La creación de colegios está reservada a docentes (los alumnos seleccionan de la lista).
   * **Paso 2: Curso**

     * Listado de cursos del colegio seleccionado (GET `/api/cursos`).
     * El alumno se **une** a un curso existente.
     * El docente puede crear cursos nuevos y queda auto-afiliado como docente.
4. Se registra la membresía en `curso_miembros`.
5. El usuario es redirigido al panel principal (alumno o docente).

### 5.2 Gestión de ensayos por parte del docente

* Crear ensayo permanente global:

  * Desde el panel de docente, selecciona materia y preguntas.
  * Marca `disponibilidad='permanente'`.
  * Opcionalmente configura `max_intentos`.
* Crear ensayo por ventana:

  * Crea el ensayo con `disponibilidad='ventana'`.
  * Luego, crea una o más ventanas (`POST /api/ensayos/:id/ventanas`) para cursos específicos y periodos de tiempo definidos.

### 5.3 Vista del alumno: ensayos disponibles

* El alumno accede a la sección de “Ensayos disponibles”.
* El frontend llama a `GET /api/ensayos/disponibles-para-alumno`.
* Se muestran:

  * Ensayos con ventana activa para los cursos a los que pertenece.
  * Ensayos permanentes globales para los que aún no ha superado el `max_intentos`.
* El alumno puede iniciar la rendición, lo que crea un `resultado` y carga las preguntas desde el banco asociado al ensayo.

---

## 6. Pruebas

### 6.1 Pruebas de humo (smoke tests)

Con todos los servicios y la base de datos en ejecución mediante Docker:

* Comprobar salud básica:

  ```bash
  curl -i http://localhost/
  curl -i http://localhost/api/auth/health
  curl -i http://localhost/api/colegios/health
  ```
* Flujos mínimos:

  * Registro/login.
  * Crear colegio (docente).
  * Crear curso y unirse.
  * Crear ensayo permanente y por ventana.
  * Listar ensayos disponibles como alumno.
  * Rendir un ensayo y verificar resultados.

### 6.2 Pruebas unitarias y de integración

Se recomienda:

* **Unitarias (Node.js):**

  * Handlers de creación de ensayos (`crear-ensayo-con-preguntas`).
  * Validación de `max_intentos`.
  * Creación y actualización de ventanas de rendición.
  * Endpoints de colegios y cursos (creación, unirse, eliminación de membresía).

* **Integración:**

  * Flujos completos usando herramientas como Postman, Insomnia o tests automáticos con `supertest`.

* **E2E (opcional):**

  * Cypress o equivalente para probar el flujo completo (login → onboarding → rendir ensayo).

---

## 7. Conclusiones

La plataforma PAES implementa una arquitectura de microservicios sólida y extensible, con:

* Autenticación centralizada con JWT y soporte para Google OAuth.
* Modelado explícito de colegios, cursos y membresías, lo que permite escalar a escenarios reales de instituciones educativas.
* Gestión de ensayos flexible, con:

  * Ensayos permanentes globales controlados por límite de intentos.
  * Ensayos por ventana de rendición, con restricciones por curso y tiempo (incluyendo validaciones de no solapamiento).
* Un flujo de onboarding que alinea la experiencia del usuario con la estructura académica del sistema.
* Una base de datos coherente con constraints de integridad que refuerzan las reglas de negocio (FK, `CHECK`, `EXCLUDE`, `UNIQUE`).

El resultado es una plataforma apta para la administración de ensayos PAES en contexto escolar, con separación clara de responsabilidades por servicio y un diseño que facilita futuras extensiones (nuevos tipos de reportes, analítica, más roles, etc.).