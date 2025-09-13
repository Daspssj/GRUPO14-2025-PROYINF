Se continuara trabajando en este proyecto, con un integrante nuevo el cual es Lucas Morrison.

Integrantes:

Agustin Santibañez | 202204682-1

Diego Sierra       | 202273531-7

Daniel Ruiz        | 202273525-2

Lucas Morrison     | 202273547-3


Proyecto de Ensayos PAES: Plataforma de Evaluación Educativa
Este repositorio contiene la implementación de una plataforma para la gestión y realización de ensayos de preparación académica, utilizando una arquitectura de microservicios. Nuestro objetivo es proporcionar una herramienta robusta para estudiantes y docentes.

 -Descripción General
El proyecto se estructura en varios componentes interconectados:

Autenticación de Usuarios: Permite el registro e inicio de sesión para alumnos, docentes y administradores.

Gestión de Contenido: Maneja materias, preguntas (con opciones y respuestas correctas) y la creación de ensayos.

Realización de Ensayos: Los alumnos pueden completar ensayos.

Resultados Detallados: Ofrece la visualización de resultados tanto para el alumno individual como para los docentes (con acceso a todos los resultados).

- Tecnologías Clave
Backend: Node.js (Express.js)

Base de Datos: PostgreSQL

Frontend: React.js

Orquestación: Docker Compose (para gestionar contenedores de microservicios, base de datos y un API Gateway)

API Gateway: Nginx

- Requisitos del Sistema
Para ejecutar este proyecto, necesitará tener instalado:

Docker Desktop: Incluye Docker Engine y Docker Compose. (Puede encontrar las instrucciones de instalación en el sitio web oficial de Docker).

Node.js y npm (o Yarn): Necesario para el desarrollo del frontend. (Disponible en el sitio web oficial de Node.js).

Un editor de código, como VS Code.

- Pasos para Configurar y Ejecutar
Siga estos pasos desde la terminal en la raíz del proyecto.

1. Clonar el Repositorio
Si aún no ha clonado este proyecto, navege en una terminal hasta la carpeta a utilizar y use el siguiente comando:

git clone https://github.com/Daspssj/GRUPO05-2025-PROYINF.git

2. Configuración de Variables de Entorno
Cree un archivo .env en cada una de las siguientes carpetas (son sensibles a mayúsculas/minúsculas y la extensión .env es importante).

services/auth-service/.env

services/materias-service/.env

services/preguntas-service/.env

services/ensayos-service/.env

services/resultados-service/.env

services/respuestas-service/.env (si existe)

El contenido general para cada uno será:

PORT=XXXX ####DEBE REVISAR EL "docker-compose.yml" en la raiz del backend del proyecto y reemplazar las XXXX por el puerto que corresponde para cada microservicio (Ej: Para el auth service seria PORT=5001)

DB_USER=user

DB_HOST=postgres-paes

DB_DATABASE=paes_db

DB_PASSWORD=password

DB_PORT=5432

JWT_SECRET=supersecretodev


Nota Importante: El valor de JWT_SECRET (supersecretodev en este ejemplo) debe ser idéntico en todos los archivos .env de los servicios que lo requieran.

3. Archivo .gitignore (para Git)
Asegúrese de que el archivo .gitignore exista en la raíz de su proyecto con el siguiente contenido. Esto evita que archivos innecesarios (como las carpetas node_modules o sus archivos .env con secretos) se suban a GitHub.

# Directorios de módulos
node_modules/
frontend/node_modules/
services/*/node_modules/

# Variables de entorno
.env
services/*/.env

# Archivos de logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Otros archivos de build o temporales
build/
.DS_Store
.vscode/
*.sublime-project
*.sublime-workspace
*.iml
.idea/

4. Instalar Dependencias del Frontend
Navegue a la carpeta frontend e instale sus dependencias:

cd frontend
npm install # o yarn install

5. Iniciar los Servicios y el Frontend
Levantar los Microservicios con Docker Compose:
Desde la raíz de su proyecto (donde está docker-compose.yml), ejecute:

docker-compose build --no-cache

(En caso se presente error sobre la creacion de la imagen en docker, simplemente se debe volver a ejecutar el comando "docker-compose build --no-cache" para lograr construir los contenedores,
pues es un error interno de Docker en el manejo de las imagenes y no del código en si)

y una vez esten todos los contenedores listos en estado "built" debe ejecutar

docker compose up

Este comando construirá y levantará todos los servicios Docker (base de datos, microservicios y Nginx Gateway) en segundo plano.

Verificar el estado de los Contenedores:

docker-compose ps

Todos los servicios deberían mostrar Up.

Iniciar el Frontend:
En una nueva terminal, navegue al directorio frontend y ejecute:

cd frontend
npm start # o yarn start

Esto iniciará la aplicación React en su navegador (generalmente en http://localhost:3000).

- Acceso a la Aplicación
Una vez que todos los servicios estén en marcha, acceda a la aplicación a través de su navegador en: http://localhost:3000.

- Credenciales de Prueba
Para inicializar en la pagina debe crear un NUEVO USUARIO ya sea de docente o estudiante, y desde ahi empezar a trabajar pues el proyecto no cuenta con cuentas registradas previamente.

troubleshooting
- Consejos para Solución de Problemas
Problemas de Conexión (ej. 404 Not Found en frontend):

Asegúrese de que todos los contenedores Docker estén Up (docker-compose ps).

Verifique la configuración del proxy en frontend/package.json y del proxy_pass en gateway/nginx.conf.

Intente reiniciar Docker Compose (docker-compose down y luego docker-compose up --build -d).

Errores del Backend (500 Internal Server Error, Connection Refused):

Revise los logs del microservicio específico que falla (ej. docker-compose logs auth-service).

Confirme que las variables de entorno de la base de datos en los archivos .env de los servicios sean correctas (DB_HOST debe ser postgres-paes).

Problemas de Autenticación (401 Unauthorized, 403 Forbidden):

Verifique que el JWT_SECRET sea idéntico en todos los archivos .env relevantes (servicios y auth-service).

Asegúrese de que los roles asignados a sus usuarios de prueba coincidan con los roles esperados por los middlewares de autorización.

Cambios en la Base de Datos no Aplicados:

Si modificó db/init_postgres.sql y los cambios no aparecen, es probable que el volumen de Docker para PostgreSQL ya exista. Para recrear la base de datos desde cero (perdiendo todos los datos existentes), use:

docker-compose down -v
docker-compose up --build -d
