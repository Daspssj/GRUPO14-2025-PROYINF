````markdown
# API.md — PAES API Gateway (cURL cheatsheet)

**Base URL:** `http://localhost` (el puerto 80 es el por defecto)

---

## Autenticación

Todas las rutas (excepto **registro** y **login**) requieren un token **JWT**.

```bash
# 1) Registrar un docente (si no existe)
curl -s -X POST "http://localhost/api/auth/registro" \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Profe Demo","correo":"profe.demo@example.com","contrasena":"secreto123","rol":"docente"}' | jq .

# 2) Login para obtener token
LOGIN_JSON=$(curl -s -X POST "http://localhost/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"correo":"profe.demo@example.com","contrasena":"secreto123"}')

# 3) Exportar TOKEN para usar en la terminal
export TOKEN=$(echo "$LOGIN_JSON" | jq -r .token)
echo "Token exportado a la variable \$TOKEN"
```

---

## 1. Colegios, Cursos y Membresías

### 1.1 Buscar colegios

```bash
curl -s "http://localhost/api/colegios?query=colegio" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

### 1.2 Crear colegio

```bash
curl -s -X POST "http://localhost/api/colegios" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Colegio de Prueba", "comuna": "Santiago"}' | jq .
```

### 1.3 Crear curso

```bash
curl -s -X POST "http://localhost/api/cursos" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"colegioId": 1, "nombre": "4° Medio A", "anio": 2025, "seccion": "A"}' | jq .
```

### 1.4 Unirse a un curso

```bash
curl -i -X POST "http://localhost/api/cursos/<ID_DEL_CURSO>/unirse" \
  -H "Authorization: Bearer $TOKEN"
```

### 1.5 Ver mis cursos

```bash
curl -s "http://localhost/api/mi/cursos" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

---

## 2. Ensayos (Gestión)

### 2.1 Crear ensayo (permanente o por ventana)

> **Ejemplo:** Ensayo de tipo **"ventana"**

```bash
# Ejemplo: Ensayo de tipo "ventana"
curl -s -X POST "http://localhost/api/ensayos/crear-ensayo-con-preguntas" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "PAES Matemática M1 (Ventana)",
    "materia_id": 2,
    "preguntas": [1, 2],
    "disponibilidad": "ventana"
  }' | jq .

# Ejemplo: Ensayo "permanente" con 3 intentos
curl -s -X POST "http://localhost/api/ensayos/crear-ensayo-con-preguntas" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "PAES Lenguaje #1 (Permanente)",
    "materia_id": 1,
    "preguntas": [3, 4],
    "disponibilidad": "permanente",
    "max_intentos": 3
  }' | jq .
```

---

## 3. Ventanas de Rendición

### 3.1 Asignar un ensayo a un curso (crear ventana)

> **Nota:** El endpoint correcto es `/api/ensayos/<ID>/ventanas`, **no** `/api/asignaciones`.

```bash
curl -s -X POST "http://localhost/api/ensayos/<ID_ENSAYO_VENTANA>/ventanas" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "curso_id": 1,
    "inicio": "2025-10-20T12:00:00Z",
    "duracion_min": 90
  }' | jq .
```

---

## 4. Flujo del Alumno

### 4.1 Ver ensayos disponibles (permanentes + ventanas activas)

> **Nota:** La URL correcta es `/api/ensayos/disponibles-para-alumno` para que coincida con el enrutamiento de **Nginx**.

```bash
curl -s "http://localhost/api/ensayos/disponibles-para-alumno" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

**Respuesta esperada:** Un array de objetos, cada uno con un campo `"tipo": "ventana"` o `"tipo": "permanente"`.

### 4.2 Iniciar una rendición

> **Nota:** Los campos en el body deben ser `ventana_id` **o** `ensayo_id` (**snake_case**).

```bash
# Iniciar un ensayo POR VENTANA
curl -s -X POST "http://localhost/api/resultados/rendiciones" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "ventana_id": 1 }' | jq .

# Iniciar un ensayo PERMANENTE
curl -s -X POST "http://localhost/api/resultados/rendiciones" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "ensayo_id": 2 }' | jq .
```

---

## 5. Scripts de Pruebas de Humo (Completos y Corregidos)

### 5.1 Prueba de Humo: Colegios y Cursos

```bash
#!/bin/bash
# --- Smoke Test Script for HU-009

# --- Configuración ---
BASE_URL="http://localhost"
TEST_ID=$RANDOM
echo "Iniciando Pruebas de Humo para HU-009 (Ejecución #${TEST_ID})..."

echo -e "\n--------------------------------------------------"
echo "PASO 1: Preparando entorno (Usuarios y Grupos)..."
# Registro (no importa si falla por duplicado)
curl -s -X POST "${BASE_URL}/api/auth/registro" -H "Content-Type: application/json" -d '{"nombre":"Profesor HU009","correo":"profe.hu009@test.com","contrasena":"secreto123","rol":"docente"}' > /dev/null
curl -s -X POST "${BASE_URL}/api/auth/registro" -H "Content-Type: application/json" -d '{"nombre":"Alumno HU009","correo":"alumno.hu009@test.com","contrasena":"secreto123","rol":"alumno"}' > /dev/null

# Login y Tokens
LOGIN_DOCENTE=$(curl -s -X POST "${BASE_URL}/api/auth/login" -H "Content-Type: application/json" -d '{"correo":"profe.hu009@test.com","contrasena":"secreto123"}')
LOGIN_ALUMNO=$(curl -s -X POST "${BASE_URL}/api/auth/login" -H "Content-Type: application/json" -d '{"correo":"alumno.hu009@test.com","contrasena":"secreto123"}')
export TOKEN_DOCENTE=$(echo "$LOGIN_DOCENTE" | jq -r .token)
export TOKEN_ALUMNO=$(echo "$LOGIN_ALUMNO" | jq -r .token)
echo "   Tokens para docente y alumno obtenidos."

# Crear Colegio y Curso
COLEGIO_CREADO=$(curl -s -X POST "${BASE_URL}/api/colegios" -H "Authorization: Bearer $TOKEN_DOCENTE" -H "Content-Type: application/json" -d "{\"nombre\":\"Colegio PAES Ventanas ${TEST_ID}\",\"comuna\":\"Test\"}")
ID_COLEGIO=$(echo "$COLEGIO_CREADO" | jq -r .id)
CURSO_CREADO=$(curl -s -X POST "${BASE_URL}/api/cursos" -H "Authorization: Bearer $TOKEN_DOCENTE" -H "Content-Type: application/json" -d "{\"colegioId\":${ID_COLEGIO},\"nombre\":\"Curso de Prueba Ventanas ${TEST_ID}\",\"anio\":2025,\"seccion\":\"A\"}")
ID_CURSO=$(echo "$CURSO_CREADO" | jq -r .id)
echo "   Colegio (ID: ${ID_COLEGIO}) y Curso (ID: ${ID_CURSO}) creados."

# Alumno se une al curso
curl -s -X POST "${BASE_URL}/api/cursos/${ID_CURSO}/unirse" -H "Authorization: Bearer $TOKEN_ALUMNO" > /dev/null
echo "   Alumno inscrito en el curso."

echo -e "\n--------------------------------------------------"
echo "PASO 2: Docente creando los ensayos de prueba..."

# Crear Ensayo de tipo "ventana" para materia_id 2 con preguntas 1 y 2 (ESTO AHORA COINCIDE CON TU DATA.SQL)
ENSAYO_VENTANA=$(curl -s -X POST "${BASE_URL}/api/ensayos/crear-ensayo-con-preguntas" \
  -H "Authorization: Bearer $TOKEN_DOCENTE" \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Ensayo por Ventana M1","materia_id":2,"preguntas":[1,2],"disponibilidad":"ventana"}') # <-- CORREGIDO
export ID_ENSAYO_VENTANA=$(echo "$ENSAYO_VENTANA" | jq -r .ensayo.id)
echo "   Ensayo para Ventana creado (ID: ${ID_ENSAYO_VENTANA})."

# Crear Ensayo de tipo "permanente" para materia_id 4 con pregunta 3 (ESTO AHORA COINCIDE CON TU DATA.SQL)
ENSAYO_PERMANENTE=$(curl -s -X POST "${BASE_URL}/api/ensayos/crear-ensayo-con-preguntas" \
  -H "Authorization: Bearer $TOKEN_DOCENTE" \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Ensayo Permanente C1 (2 intentos)","materia_id":4,"preguntas":[3],"disponibilidad":"permanente","max_intentos":2}') # <-- CORREGIDO
export ID_ENSAYO_PERMANENTE=$(echo "$ENSAYO_PERMANENTE" | jq -r .ensayo.id)
echo "   Ensayo Permanente (2 intentos) creado (ID: ${ID_ENSAYO_PERMANENTE})."

echo -e "\n--------------------------------------------------"
echo "PASO 3: Docente asignando una VENTANA ACTIVA al curso..."
FECHA_INICIO_ACTIVA=$(date --iso-8601=seconds --utc)
VENTANA_ACTIVA=$(curl -s -X POST "${BASE_URL}/api/ensayos/${ID_ENSAYO_VENTANA}/ventanas" -H "Authorization: Bearer $TOKEN_DOCENTE" -H "Content-Type: application/json" -d "{\"curso_id\":${ID_CURSO},\"inicio\":\"${FECHA_INICIO_ACTIVA}\",\"duracion_min\":60}")
export ID_VENTANA_ACTIVA=$(echo "$VENTANA_ACTIVA" | jq -r .id)
echo "   Ventana ACTIVA creada (ID: ${ID_VENTANA_ACTIVA}). Inicia ahora y dura 60 min."

echo -e "\n--------------------------------------------------"
echo "PASO 4: Alumno consultando sus ensayos disponibles..." #Este no me funcionó
curl -s "${BASE_URL}/api/alumno/ensayos-disponibles" -H "Authorization: Bearer $TOKEN_ALUMNO" | jq .

echo -e "\n--------------------------------------------------"
echo "PASO 5.1: Probando rendición de ensayo por VENTANA (debe funcionar)..."
curl -i -X POST "${BASE_URL}/api/resultados/rendiciones" -H "Authorization: Bearer $TOKEN_ALUMNO" -H "Content-Type: application/json" -d "{\"ventana_id\":${ID_VENTANA_ACTIVA}}"

echo -e "\n--------------------------------------------------"
echo "PASO 5.2: Intentando rendir OTRA VEZ el mismo ensayo por VENTANA (debe fallar 409)..."
curl -i -X POST "${BASE_URL}/api/resultados/rendiciones" -H "Authorization: Bearer $TOKEN_ALUMNO" -H "Content-Type: application/json" -d "{\"ventana_id\":${ID_VENTANA_ACTIVA}}"

echo -e "\n--------------------------------------------------"
echo "PASO 5.3: Probando 1er intento de ensayo PERMANENTE (debe funcionar)..."
curl -i -X POST "${BASE_URL}/api/resultados/rendiciones" -H "Authorization: Bearer $TOKEN_ALUMNO" -H "Content-Type: application/json" -d "{\"ensayo_id\":${ID_ENSAYO_PERMANENTE}}"

echo -e "\n--------------------------------------------------"
echo "PASO 5.4: Probando 2do intento de ensayo PERMANENTE (debe funcionar)..."
curl -i -X POST "${BASE_URL}/api/resultados/rendiciones" -H "Authorization: Bearer $TOKEN_ALUMNO" -H "Content-Type: application/json" -d "{\"ensayo_id\":${ID_ENSAYO_PERMANENTE}}"

echo -e "\n--------------------------------------------------"
echo "PASO 5.5: Probando 3er intento de ensayo PERMANENTE (debe fallar 403 por límite)..."
curl -i -X POST "${BASE_URL}/api/resultados/rendiciones" -H "Authorization: Bearer $TOKEN_ALUMNO" -H "Content-Type: application/json" -d "{\"ensayo_id\":${ID_ENSAYO_PERMANENTE}}"

echo -e "\n--------------------------------------------------"
echo "PASO 6.1: Docente asignando una VENTANA FUTURA al curso..."
FECHA_INICIO_FUTURA=$(date -d '+1 day' --iso-8601=seconds --utc)
VENTANA_FUTURA=$(curl -s -X POST "${BASE_URL}/api/ensayos/${ID_ENSAYO_VENTANA}/ventanas" -H "Authorization: Bearer $TOKEN_DOCENTE" -H "Content-Type: application/json" -d "{\"curso_id\":${ID_CURSO},\"inicio\":\"${FECHA_INICIO_FUTURA}\",\"duracion_min\":60}")
export ID_VENTANA_FUTURA=$(echo "$VENTANA_FUTURA" | jq -r .id)
echo "   Ventana FUTURA creada (ID: ${ID_VENTANA_FUTURA}). Inicia en 24 horas."

echo -e "\n--------------------------------------------------"
echo "PASO 6.2: Alumno intentando rendir el ensayo en la VENTANA FUTURA (debe fallar 403)..."
curl -i -X POST "${BASE_URL}/api/resultados/rendiciones" -H "Authorization: Bearer $TOKEN_ALUMNO" -H "Content-Type: application/json" -d "{\"ventana_id\":${ID_VENTANA_FUTURA}}"


echo -e "\n\nPruebas de Humo para HU-009 finalizadas!"
```