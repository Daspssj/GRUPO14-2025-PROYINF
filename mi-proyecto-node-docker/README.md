# Aplicación Node.js con Docker y PostgreSQL

Este es un ejemplo de una aplicación Node.js usando Express, Docker y PostgreSQL. Incluye configuración para desarrollo y producción.

## Requisitos Previos

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.0+)
- [Node.js](https://nodejs.org/) (opcional, solo para desarrollo local)
- `curl` o cliente HTTP (para probar endpoints)

## Instalación

### 1. Clonar el repositorio
git clone https://github.com/MatiasBV/analisis-y-diseno-de-software.git  
(debe tener docker-desktop abierto en todo momento)
Ejecutar en terminal:

1. Deben navegar hasta la carpeta analisis-y-diseno-de-software/mi-proyecto-node-docker  

2. (les instalará las dependencias se suele demorar un poco la primera vez con esto levantan el proyecto)  
docker compose up --build

(para detener los contenedores)  
docker compose down -v

si no les ejecuta asegurense de estar en la carpeta correcta  
si trabajan desde windows deben tener instalado WSL2 y tenerlo activado en docker desktop  
esto se puede verificar en  
Configuración   
-Resources  
  -Configure which WSL 2 distros you want to access Docker from. (esto debe estar activo)  
  -Enable integration with additional distros:(esto debe estar activo)  

# Comandos útiles 

Pueden levantar el proyecto sin volver a construir las imágenes con el siguiente comando:
  - docker compose up
Si quieren levantar el proyecto en segundo plano pueden usar:
  - docker compose up -d
Para ver el estado de los servicios que están corriendo:
  - docker compose ps
Para ver los logs en tiempo real de todos los servicios:
  - docker compose logs -f
O de un servicio específico:
  - docker compose logs -f nombre_servicio
Para reiniciar un servicio específico:
  - docker compose restart nombre_servicio
Para detener todos los contenedores sin eliminar volúmenes:
  - docker compose down

# Autenticación y pruebas con `curl` y Docker

Este documento resume los pasos para trabajar con autenticación de usuarios en un servidor Node.js utilizando `curl` y Docker.

## Comandos Docker básicos

### Iniciar los contenedores

```bash
docker-compose up --build
```

### Eliminar los contenedores

```bash
docker-compose down
```

### Reanudar los contenedores detenidos

```bash
docker-compose start
```

### Pausar contenedores en ejecución

```bash
docker-compose stop
```

---

## Dependencias necesarias en Node.js

Instala estas dependencias en tu backend antes de compilar:

```bash
npm install express-session bcrypt
```

---

## Operaciones de autenticación

### Crear un nuevo usuario

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Daniel","correo":"daniel@gmail.com","contrasena":"123","rol":"alumno"}'
```

### Iniciar sesión (y guardar cookies)

```bash
curl -X POST http://localhost:3000/auth/login \
  -c cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"correo":"daniel@gmail.com","contrasena":"123"}'
```

### Verificar si el usuario está autenticado (panel alumno)

```bash
curl -X GET http://localhost:3000/auth/alumno/panel \
  -b cookies.txt
```

### Verificar usuario logueado (whoami)

```bash
curl http://localhost:3000/auth/whoami \
  -b cookies.txt
```

### Ver todos los usuarios registrados (ruta temporal)

```bash
curl http://localhost:3000/auth/usuarios
```

### Cerrar sesión

```bash
curl -X POST http://localhost:3000/auth/logout \
  -b cookies.txt
```

### Eliminar archivo de sesión local

```bash
rm cookies.txt
```

---

## Notas adicionales

- Asegúrate de que el servidor Node.js esté ejecutándose en el puerto 3000
- El archivo `cookies.txt` almacena las cookies de sesión para autenticación
- Las rutas pueden variar según tu configuración de servidor
