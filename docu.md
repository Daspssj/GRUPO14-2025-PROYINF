# Documentación funcional y técnica — Colegios, Cursos, Ventanas y Ensayos (permanentes y por ventana)

## 1. Objetivo

Habilitar un flujo **self-service** para que alumnos y docentes se afilien a cursos (vinculados a colegios) y gestionar **disponibilidad de ensayos** de dos tipos:

* **Permanentes** (sin vencimiento, repetibles; con o sin límite de intentos).
* **Por ventana** (intervalo [inicio, fin) por curso, con validación de acceso por tiempo).

## 2. Alcance y decisiones clave

* **Rol global**: `usuarios.rol ∈ {alumno, docente}` (no existe `admin`).
* **Rol en curso**: `curso_miembros.rol_en_curso ∈ {alumno, docente, ayudante}`.
* **Quién crea curso**:

  * En **wizard**: **alumno y docente** (para alumno, mostrar “Demo only”).
  * En “Mi perfil” (fuera de este alcance): **solo docente**.
* **Ensayos globales** (no llevan `curso_id`).
* **Visibilidad de ensayos permanentes** (modo por defecto):

  * **Restrictivo**: Solo alumnos cuyos **docentes de curso** incluyen al **docente autor** del ensayo.
  * **Opción global** (feature flag): Todos (alumnos y docentes) pueden verlos.
* **Borrar membresía**: permitido **solo si** el usuario no tiene **resultados** asociados y no hay **ventanas activas** vinculadas a su participación.

## 3. Modelo de datos (tablas y campos relevantes)

### 3.1 Colegios y cursos

* `colegios(id, nombre, comuna?, created_at, updated_at, created_by?)`
* `cursos(id, colegio_id, nombre, anio, seccion, created_at, updated_at, created_by?)`
* `curso_miembros(id, curso_id, usuario_id, rol_en_curso, created_at, UNIQUE(curso_id, usuario_id))`

**Notas de integridad y calidad:**

* Normalización de texto al crear/buscar: `trim`, lower, quitar tildes.
* Pseudounicidad:

  * `colegios`: (nombre_normalizado, comuna_normalizada) para sugerir/evitar duplicados.
  * `cursos`: (colegio_id, nombre_normalizado, anio, seccion_normalizada).

### 3.2 Ensayos y preguntas

* `ensayos(id, nombre/titulo, fecha_creacion, docente_id, materia_id, disponibilidad, max_intentos)`

  * `disponibilidad ∈ {permanente, ventana}` (DEFAULT `permanente`)
  * `max_intentos NULL = ilimitado` (si >0, aplicar límite por alumno)
* `ensayo_pregunta(id, ensayo_id, pregunta_id, UNIQUE(ensayo_id, pregunta_id))`

### 3.3 Ventanas por curso (ensayos con tiempo)

* `ventanas_rendicion(id, ensayo_id, curso_id, inicio TIMESTAMPTZ, fin TIMESTAMPTZ, duracion_min, periodo tstzrange, created_at, updated_at)`

  * **CHECK**: `fin = inicio + (duracion_min || ' minutes')::interval`
  * **EXCLUDE** (btree_gist): no solape de `periodo` por `(curso_id, ensayo_id)`
  * **Trigger** `updated_at` automático.

### 3.4 Resultados y respuestas

* `resultados(id, ensayo_id, alumno_id, puntaje, fecha, ventana_id NULLABLE)`

  * `ventana_id = NULL` para intentos sobre **ensayos permanentes**
  * `ventana_id = id de ventanas_rendicion` para intentos **por ventana**
* `respuestas(id, resultado_id, pregunta_id, respuesta_dada, correcta)`

> **Compatibilidad**: Ensayos existentes → `disponibilidad='permanente'`, `max_intentos=NULL`.

## 4. Flujos UX

### 4.1 Onboarding (Google y Local)

**Entrada Google OAuth → Onboarding.jsx**

1. Elegir **rol global** (alumno/docente) si aún no está seteado.
2. Wizard **Colegio → Curso**.
3. Confirmación y Dashboard.

**Entrada Registro Local (email/clave)**

1. Elige **rol global** en el registro.
2. Redirige a `Onboarding` con flag (p.ej. `?source=local`).
3. `Onboarding` **omite** elección de rol y muestra **directo** el wizard: **Colegio → Curso**.
4. Confirmación y Dashboard.

### 4.2 Wizard de afiliación (2 pasos + confirmación)

* **Paso Colegio**:

  * Buscar por nombre (autocomplete; normalizado).
  * Si no existe: **Crear colegio** (con controles de duplicados y sugerencias).
* **Paso Curso**:

  * Listar cursos del colegio (nombre + año + sección).
  * Unirse a curso existente **o** **crear** (alumno: “Demo only” visible).
  * Auto-membresía del creador (docente → `rol_en_curso='docente'`).
* **Confirmación**:

  * Mostrar colegio/curso y rol en curso.
  * Botón “Agregar otro curso” (útil para docentes).
  * CTA principal: “Ir a mi panel”.

## 5. Contratos de API (resumen)

### 5.1 Colegios

* **GET** `/api/colegios?query=<texto>&page=1&pageSize=10`

  * Devuelve lista paginada; coincidencia case/tildes-insensitive; orden por similitud.
* **POST** `/api/colegios`

  * Body: `{ nombre, comuna? }`
  * Normaliza, checa similitud; 201 si crea; 409 con sugerencias si probable duplicado.

### 5.2 Cursos

* **GET** `/api/cursos?colegioId=<id>&query=<texto>`

  * Lista/paginación; filtra por nombre/año/sección.
* **POST** `/api/cursos`

  * Body: `{ colegioId, nombre, anio, seccion }`
  * Reglas:

    * Si creador es **docente** → auto-membresía como `docente`.
    * Si creador es **alumno** → permitido en **wizard** (marcar “Demo only” en UI).
  * Pseudounicidad y sugerencias en caso de colisión.

### 5.3 Membresías

* **POST** `/api/cursos/:cursoId/unirse`

  * Usa `req.user.id` y `usuarios.rol` para fijar `rol_en_curso`.
* **GET** `/api/mi/cursos`

  * Lista membresías del usuario.
* **DELETE** `/api/curso_miembros/:id`

  * Permitir **solo si** no hay resultados del usuario en ese curso ni ventanas activas que lo afecten.

### 5.4 Ensayos y Ventanas

* **POST** `/api/ensayos/crear-ensayo-con-preguntas`

  * Body base: `{ titulo/nombre, materia_id, preguntas[] }`
  * Extendido: `{ disponibilidad: 'permanente'|'ventana', max_intentos: null|>0 }`
  * **Respuesta**: ensayo creado; si `disponibilidad='ventana'`, el front puede crear la ventana inicial.
* **POST** `/api/asignaciones` (ventana)

  * `{ cursoId, ensayoId, inicio: ISO UTC, duracionMin }` → crea ventana consistente (calcula `fin`, rellena `periodo`).
* **GET** `/api/alumno/ensayos-disponibles`

  * **permanentes**: según política (por defecto, restrictiva: ver §2).
  * **disponibles** (ventana activa): `now ∈ [inicio, fin)`.
  * **finalizados** (ventana caducada): `now ≥ fin` (paginado, `fin DESC`).

### 5.5 Rendiciones

* **POST** `/api/rendiciones`

  * **Permanente**: body `{ ensayoId }` → crear `resultado` con `ventana_id=NULL`. Respetar `max_intentos`.
  * **Ventana**: body `{ ventanaId }` → validar membrecía y `now ∈ [inicio, fin)`; crear `resultado` con `ventana_id`.

## 6. Reglas de validación y seguridad

* **Colegios/Cursos**:

  * Normalización + sugerencias de coincidencias cercanas.
  * Límites por hora para creación (anti-spam).
* **Cursos**:

  * En wizard: alumno puede crear (solo demo; marcar en UI). Fuera del wizard (Mi perfil): **solo docente** (no implementado ahora).
* **Ventanas**:

  * `inicio` y `fin` en **UTC** (`TIMESTAMPTZ`).
  * `CHECK fin = inicio + duracion`.
  * `EXCLUDE` no solape por `(curso_id, ensayo_id)`.
* **Permanentes**:

  * `max_intentos` NULL → ilimitado; si >0, validar conteo previo por alumno/ensayo.
  * Visibilidad **restrictiva** por defecto (docente autor ∈ docentes del curso del alumno). **Global** opcional por feature flag.
* **Borrar membresía**:

  * Solo si sin `resultados` y sin **ventanas activas** que dependan del usuario.

## 7. Feature flags (recomendados)

* `onboarding.wizard.enabled` — encender/apagar wizard.
* `onboarding.allowStudentCreateCourse` — permitir creación de curso por alumno (demo).
* `ensayos.permanentes.globalVisibility` — si `true`, permanentes visibles para todos.

## 8. Migraciones resumidas (orden lógico)

1. **Cursos & miembros** (si no existen):

   * `cursos`, `curso_miembros`, índices.
2. **Ventanas**:

   * `TIMESTAMPTZ`, `FK curso_id`, `CHECK fin`, `tstzrange periodo`, `EXCLUDE`, trigger `updated_at`.
3. **Ensayos permanentes**:

   * `ALTER ensayos ADD disponibilidad DEFAULT 'permanente'`
   * `ALTER ensayos ADD max_intentos NULL`
   * **Backfill**: set `disponibilidad='permanente'`, `max_intentos=NULL` (ensayos existentes).
4. **Resultados → ventana**:

   * `ALTER resultados ADD ventana_id INT NULL REFERENCES ventanas_rendicion(id) ON DELETE SET NULL`

## 9. Semillas (seed) recomendadas

* 3–5 **colegios**, 2–3 **cursos** por colegio.
* **curso_miembros**: al menos 1–2 docentes y 2–3 alumnos por curso.
* No crear **ventanas** por defecto (ensayos existentes quedan **permanentes**).

## 10. QA / Criterios de aceptación

**Onboarding & Wizard**

* Google: si no hay rol, pedirlo; luego wizard colegio→curso.
* Local: rol definido en registro; onboarding entra directo al wizard.
* Alumno crea curso (wizard) → permitido y marcado “Demo only” en UI.
* Duplicados de colegio/curso → se ofrecen sugerencias, no se crean falsos positivos.

**Ensayos permanentes**

* Visible a alumnos **solo** si comparten docente autor en el curso (por defecto).
* Con flag global activada → visibles para todos.
* `max_intentos`: `NULL` = ilimitado; si `3`, el 4° intento falla con mensaje.

**Ventanas**

* Crear ventana válida → aparece en “Disponibles ahora” durante `[inicio, fin)`.
* Vencida → pasa a “Finalizados” (paginado, `fin DESC`).
* Solape `(curso, ensayo)` → 409/422 por `EXCLUDE`.
* Rendición fuera de ventana → 403.

**Membresías**

* No permite borrar si hay resultados del usuario o ventanas activas que lo afecten.

## 11. ER (referencial, sintaxis Mermaid válida)

```mermaid
erDiagram
  USUARIOS ||--o{ ENSAYOS : "docente_id"
  USUARIOS ||--o{ CURSO_MIEMBROS : "usuario_id"
  COLEGIOS ||--o{ CURSOS : "colegio_id"
  CURSOS ||--o{ CURSO_MIEMBROS : "curso_id"
  CURSOS ||--o{ VENTANAS_RENDICION : "curso_id"
  ENSAYOS ||--o{ ENSAYO_PREGUNTA : "ensayo_id"
  PREGUNTAS ||--o{ ENSAYO_PREGUNTA : "pregunta_id"
  ENSAYOS ||--o{ VENTANAS_RENDICION : "ensayo_id"
  ENSAYOS ||--o{ RESULTADOS : "ensayo_id"
  VENTANAS_RENDICION ||--o{ RESULTADOS : "ventana_id (nullable)"
  MATERIAS ||--o{ PREGUNTAS : "materia_id"
  MATERIAS ||--o{ ENSAYOS : "materia_id"

  USUARIOS {
    int id PK
    text nombre
    citext correo UNIQUE
    text contrasena?
    varchar rol  // alumno | docente
    boolean correo_verificado
    text auth_origen // local | google
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
    int max_intentos? // NULL = ilimitado
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
```

---

### 12. Lista de verificación para el desarrollo (DoD)

* [ ] Migraciones aplicadas (cursos, miembros, ensayos permanentes, ventanas con constraints).
* [ ] Seed cargado (colegios, cursos, membresías).
* [ ] Endpoints listos (colegios, cursos, membresías, asignaciones, alumno/ensayos-disponibles, rendiciones).
* [ ] Wizard en Onboarding integrado (Google y Local).
* [ ] Validaciones y mensajes de error claros (duplicados, fuera de ventana, intentos máximos).
* [ ] Feature flags configurados y documentados.
* [ ] Pruebas manuales + QA checklist cumplido.

# 📦 Resumen del alcance (lo que vamos a hacer)

* Incorporar **Colegios, Cursos y Membresías**.
* Gestionar **Ensayos permanentes** (con `max_intentos`) y **por ventana** (asignaciones por curso con inicio/fin/duración).
* Exponer endpoints para:

  * `GET/POST /api/colegios`
  * `GET/POST /api/cursos`
  * `POST /api/cursos/:cursoId/unirse`
  * `GET /api/mi/cursos`
  * `DELETE /api/curso_miembros/:id`
* Mantener lo actual (Auth, Preguntas, Ensayos, Resultados, Materias, Respuestas).
* **Flag de visibilidad** de ensayos permanentes → ON (modo global permitido).
* Roles globales: `alumno`, `docente` (sin `admin` en alcance de colegios/cursos).

# 🗄️ Cambios de base de datos (SQL)

## Ficheros nuevos / ajustados

1. `01_schema.sql` (base existente; ok).
2. `02_colegios_cursos.sql` (reemplazado para evitar UNIQUE con expresiones):

   * Tablas:

     * `colegios(id, nombre, comuna, comuna_norm GENERATED, created_by, created_at, updated_at)`
       UNIQUE `(nombre, comuna_norm)`.
     * `cursos(id, colegio_id FK, nombre, anio, seccion, anio_norm GENERATED, seccion_norm GENERATED, created_by, created_at, updated_at)`
       UNIQUE `(colegio_id, nombre, anio_norm, seccion_norm)`.
     * `curso_miembros(id, curso_id FK, usuario_id FK, rol_en_curso CHECK IN ('alumno','docente'), UNIQUE(curso_id, usuario_id))`.
   * Trigger `set_updated_at()` reutilizado para timestamps.
3. `03_ventanas_fk_utc.sql` (ok):

   * `ALTER ventanas_rendicion` → FK real a `cursos`, `TIMESTAMPTZ`, `CHECK fin = inicio + duracion`, columna `periodo tstzrange` con **EXCLUDE** (no solape por `(curso_id, ensayo_id)`), trigger `updated_at`.
4. `04_resultados_ventana.sql` (ok):

   * `ALTER resultados ADD ventana_id REFERENCES ventanas_rendicion(id) ON DELETE SET NULL`.
5. (Opcional recomendado a futuro) `05_ensayos_permanentes.sql`:

   * `ALTER ensayos ADD disponibilidad DEFAULT 'permanente' CHECK IN ('permanente','ventana');`
   * `ALTER ensayos ADD max_intentos INT NULL;`
   * Backfill: ensayos existentes → `permanente`, `max_intentos=NULL`.

### Cómo resetear DB y aplicar en orden

* **Full reset (compose):**

  ```bash
  docker compose down -v
  docker compose up -d --build
  ```
* **Sin bajar contenedores (aplicar a mano):**

  ```bash
  docker compose exec postgres psql -U ${DB_USER:-user} -d ${DB_NAME:-paes_db} -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO public;"

  docker compose exec -T postgres psql -U ${DB_USER:-user} -d ${DB_NAME:-paes_db} < db/01_schema.sql
  docker compose exec -T postgres psql -U ${DB_USER:-user} -d ${DB_NAME:-paes_db} < db/02_colegios_cursos.sql
  docker compose exec -T postgres psql -U ${DB_USER:-user} -d ${DB_NAME:-paes_db} < db/02_data.sql
  docker compose exec -T postgres psql -U ${DB_USER:-user} -d ${DB_NAME:-paes_db} < db/03_ventanas_fk_utc.sql
  docker compose exec -T postgres psql -U ${DB_USER:-user} -d ${DB_NAME:-paes_db} < db/04_resultados_ventana.sql
  ```

# 🌐 API Gateway (Nginx)

* Upstreams configurados para todos los servicios + **nuevo** `colegios-cursos-service`.
* **Clave**: para este servicio decidimos que **el microservicio escucha en `/api`**, y **Nginx reenvía el path completo** (sin rewrites y preservando querystring).

Bloques efectivos (los que terminamos usando):

```nginx
# Colegios
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

# Cursos
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

# Mis cursos
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

# Borrar membresía
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

> Nota: para evitar 301 cuando llamas sin “/” final (p. ej. `/api/colegios`), añadimos también **locations exactos** como `location = /api/colegios { proxy_pass ... }` (opcional, pero cómodo).



# 🧩 Nuevo microservicio: `colegios-cursos-service`

**Ubicación**: `services/colegios-cursos/`
**Estructura mínima**:

* `Dockerfile` (Node 18-alpine, `CMD ["node","src/server.js"]`)
* `package.json` (deps: `express`, `pg`, `helmet`, `cors`, `jsonwebtoken`)
* `src/server.js`:

  * `app.use(helmet()), app.use(cors(...)), app.use(express.json())`
  * **Logger**: `console.log(req.method, req.originalUrl)`
  * `GET /health`
  * **Monta rutas en `/api`**: `app.use("/api", routes)`
* `src/db.js` → Pool a Postgres (host `postgres`, db `paes_db`)
* `src/mw/auth.js` → `requireAuth` (ver “401” más abajo)
* `src/routes/index.js` con endpoints:

  * `GET /colegios`, `POST /colegios`
  * `GET /cursos`, `POST /cursos`
  * `POST /cursos/:cursoId/unirse`
  * `GET /mi/cursos`
  * `DELETE /curso_miembros/:id`
* `src/controllers/{colegios.js,cursos.js}` con lógica (normalización, ON CONFLICT por constraint, auto-membresía si `docente`).

# 🧪 Smoke tests (lo que ya corriste)

> Todos vía gateway (`http://localhost`), con **JWT en `$TOKEN`**.

* Health (del servicio nuevo):
  `curl -s http://localhost/api/colegios/health`  ✅
* Crear colegio:

  ```bash
  curl -s -X POST http://localhost/api/colegios/ \
    -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d '{"nombre":"Colegio Central","comuna":"Santiago"}'
  ```

  → **201** (lo lograste)
* Listar colegios:
  `curl -i "http://localhost/api/colegios/?query=cole" -H "Authorization: Bearer $TOKEN"`
  (aquí apareció **401** por token inválido/no verificado)
* Crear curso:

  ```bash
  curl -s -X POST http://localhost/api/cursos/ \
    -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d '{"colegioId":<ID>, "nombre":"4º Medio", "anio":2025, "seccion":"B"}'
  ```
* Unirse a curso:
  `curl -s -X POST http://localhost/api/cursos/<CURSO_ID>/unirse -H "Authorization: Bearer $TOKEN"`
* Mis cursos:
  `curl -s http://localhost/api/mi/cursos/ -H "Authorization: Bearer $TOKEN"`

# ❗Estado actual: “Unauthorized” (401) al listar

Ya enruta bien (logs muestran `GET /api/colegios?query=cole` en el servicio), pero el **JWT falla en `verify`**.

### Causas detectadas

* Tu `docker-compose.yml` usa anclaje `x-db-env` con **solo `JWT_SECRET`**, **sin `JWT_ISSUER`** para la mayoría de servicios.
* Solo `colegios-cursos-service` tenía `JWT_ISSUER`.
* Es muy probable que el **auth-service no esté firmando con `issuer`** (o el token anterior expiró).
* Nuestro middleware inicialmente forzaba issuer; ahora recomendé hacerlo **tolerante**.

### Soluciones (elige inmediata + duradera)

**Inmediata (para que te deje de bloquear hoy):**

* Usa el middleware **tolerante** en `src/mw/auth.js` (acepta `uid|id|sub`, `rol|role`, no falla si falta `iss`).
* Reinicia solo ese servicio:

  ```bash
  docker compose restart colegios-cursos-service
  ```
* Saca un **token nuevo**:

  ```bash
  LOGIN_JSON=$(curl -s -X POST http://localhost/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"correo":"profe.demo@example.com","contrasena":"secreto123"}')
  export TOKEN=$(echo "$LOGIN_JSON" | jq -r .token)
  ```
* Prueba:

  ```bash
  curl -i "http://localhost/api/colegios/?query=cole" -H "Authorization: Bearer $TOKEN"
  ```

**Duradera (para dejarlo prolijo y estricto):**

1. Propaga `JWT_ISSUER` en el anclaje común:

   ```yaml
   x-db-env: &db-env
     ...
     JWT_SECRET: superSecret123
     JWT_ISSUER: ${JWT_ISSUER:-paes-auth}
   ```

   Todos los servicios que usan `<<: *db-env` heredarán `JWT_ISSUER`.
2. En `auth-service`, al firmar:

   ```js
   const token = jwt.sign(
     { uid: usuario.id, rol: usuario.rol },
     process.env.JWT_SECRET,
     { issuer: process.env.JWT_ISSUER, expiresIn: "7d" }
   );
   ```
3. **Rebuild** auth-service y reemitir token:

   ```bash
   docker compose up -d --build auth-service
   # luego login de nuevo para TOKEN nuevo
   ```
4. Si quieres, vuelves a poner el **check estricto** de issuer en el middleware del servicio nuevo.

# ✅ Qué quedó funcionando

* DB inicializa completa con los nuevos objetos (tras fix de UNIQUE con columnas generadas).
* Nginx gateway enruta correctamente al nuevo servicio (path completo con `$request_uri`).
* Nuevo `colegios-cursos-service` levanta, health OK.
* `POST /api/colegios` → **201** probado.
* Logging de rutas activo (ves `GET /api/colegios?...` en los logs del servicio).

# ⏭️ Próximos pasos recomendados

1. **Destrabar 401** (aplicar “Inmediata”, luego “Duradera”).
2. Implementar en `ensayos-service`:

   * `ALTER ensayos ADD disponibilidad, max_intentos`
   * Validación de `max_intentos` en creación de rendición (en resultados-service).
3. Endpoints de **asignaciones de ventana** (si los centralizas en ensayos o un nuevo módulo “asignaciones”):

   * `POST /api/asignaciones` → crea `ventanas_rendicion` (calcular `fin`, set `periodo`).
   * `GET /api/alumno/ensayos-disponibles` → mezcla permanentes (política visible) + ventanas activas.
4. UI Onboarding Wizard (2 pasos) — ya con colegios/cursos reales.
5. QA con los criterios de aceptación listados (duplicados, ventanas, `max_intentos`, borrado de membresía con bloqueos).

# .env en mi-proyecto-node-docker/services/auth/.env para Google Oauth

```bash
PORT=5001
DB_USER=user
DB_HOST=postgres
DB_DATABASE=paes_db
DB_PASSWORD=password
DB_PORT=5432
JWT_SECRET=superSecret123

# Añadimos OAuth
GOOGLE_CLIENT_ID=estanEnGoogleCloud
GOOGLE_CLIENT_SECRET=estanEnGoogleCloud
SESSION_SECRET=algoseguro (no recuerdo pero prob en Google Cloud)
AUTH_PUBLIC_BASE_URL=http://localhost
FRONTEND_BASE_URL=http://localhost:3000
```