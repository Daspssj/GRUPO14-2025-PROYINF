# Proyecto de Ensayos PAES — Plataforma de Evaluación Educativa

Plataforma para gestionar y rendir ensayos de preparación académica (PAES), pensada para estudiantes y docentes. Arquitectura basada en microservicios con un **API Gateway (Nginx)**, **backend Node.js/Express**, **PostgreSQL** y **frontend React**.

## Tecnologías Clave

* **API Gateway:** Nginx (reverse proxy, CORS, headers, compresión)
* **Backend:** Node.js + Express (microservicios: auth, materias, preguntas, ensayos, resultados, respuestas)
* **Base de Datos:** PostgreSQL
* **Frontend:** React
* **Orquestación:** Docker Compose

---

### Ruteo (Gateway → Servicios)

| Ruta pública       | Servicio interno      | Puerto |
| ------------------ | --------------------- | ------ |
| `/api/auth/`       | `auth-service`        | 5001   |
| `/api/preguntas/`  | `preguntas-service`   | 5002   |
| `/api/ensayos/`    | `ensayos-service`     | 5003   |
| `/api/resultados/` | `resultados-service`  | 5004   |
| `/api/materias/`   | `materias-service`    | 5005   |
| `/api/respuestas/` | `respuestas-service`  | 5006   |
| DB (interno)       | `postgres:5432`       | 5432   |
| DB (host)          | `localhost:5433→5432` | 5433   |

---

## Estructura (resumen)

```
.
├─ gateway/                     # Nginx (Dockerfile, nginx.conf)
├─ services/
│  ├─ _common/                  # Dockerfile base, middlewares compartidos
│  ├─ auth/                     # Auth (JWT, Google OAuth)
│  ├─ materias/
│  ├─ preguntas/
│  ├─ ensayos/
│  ├─ resultados/
│  └─ respuestas/
├─ db/                          # init scripts para PostgreSQL
├─ frontend-paes/               # React app
└─ docker-compose.yml
```

---

## Variables de Entorno

> **Importante:** No se deben commitear `.env` al repositorio (ver sección `.gitignore`). Los valores de abajo son **para desarrollo local**.

### Crear `services/auth/.env`

```
PORT=5001
DB_USER=user
DB_HOST=postgres
DB_DATABASE=paes_db
DB_PASSWORD=password
DB_PORT=5432
JWT_SECRET=superSecret123

# OAuth (dev)
GOOGLE_CLIENT_ID=960162294016-cti4p4ikgkrjuq0l99ckso383nd41spg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
SESSION_SECRET=algoseguro
AUTH_PUBLIC_BASE_URL=http://localhost
FRONTEND_BASE_URL=http://localhost:3000
```

### Crear `.env` en cada microservicio (si aplica)

Para `materias`, `preguntas`, `ensayos`, `resultados`, `respuestas`:

```
PORT=XXXX            # 5002, 5003, 5004, 5005, 5006 según servicio
DB_USER=user
DB_HOST=postgres
DB_DATABASE=paes_db
DB_PASSWORD=password
DB_PORT=5432
JWT_SECRET=superSecret123
```

> **Nota:** Asegúrate de que `JWT_SECRET` sea **idéntico** en todos los servicios que validan tokens.

---

## Ejecución local

1. **Construir imágenes**

```bash
docker compose build --no-cache
```

2. **Levantar servicios**

```bash
docker compose up -d
docker compose ps
```

3. **Frontend (React)**

```bash
cd frontend-paes
npm install
npm start
# abre http://localhost:3000
```

---

## Pruebas de humo (con todo arriba)

```bash
# Gateway
curl -i http://localhost/

# Health de servicios (vía gateway, si tienen /health)
curl -i http://localhost/api/auth/health
curl -i http://localhost/api/materias/health

# (Ejemplo) Login → obtener JWT (ajusta email/password a tu caso)
curl -s -X POST http://localhost/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"docente@test.com","password":"123456"}'
```

---

## .gitignore (para evitar subir secretos)

Asegura que en la **raíz** del repo exista un `.gitignore` que ignore **todos los `.env`** y `node_modules` de servicios:

```
# Node
node_modules/
frontend-paes/node_modules/
services/*/node_modules/

# Entornos
.env
.env.*
services/*/.env

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Builds y editor
build/
dist/
.DS_Store
.vscode/
.idea/
```

---

## Troubleshooting

* **404 desde frontend a `/api/resultados/...`:** la ruta puede no existir en el microservicio. Revisa `services/resultados/routes/resultados.js` y el prefijo en `index.js` (`/api/resultados`).
* **401/403 aleatorios:** confirma que el **JWT** no esté expirado y que los roles sean correctos. El interceptor del front diferencia entre token inválido y errores de negocio.
* **Cambios en `db/init_postgres.sql` no se aplican:** puede existir el volumen. Reconstruir la DB:

  ```bash
  docker compose down -v
  docker compose up -d --build
  ```

---

## Seguridad (dev)

* CORS restringido a `http://localhost:3000` en prod.
* `JWT_SECRET` por entorno (no hardcodear en código).
* **Rate limiting** en auth y rutas sensibles (Nginx o Express).
* `X-Request-Id` en gateway y logs de backend para traza end-to-end.

---
