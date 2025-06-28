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
Si aún no ha clonado este proyecto, use el siguiente comando:

git clone https://github.com/Daspssj/GRUPO05-2025-PROYINF.git
cd GRUPO05-2025-PROYINF

2. Configuración de Variables de Entorno
Cree un archivo .env en cada una de las siguientes carpetas (son sensibles a mayúsculas/minúsculas y la extensión .env es importante).

services/auth-service/.env

services/materias-service/.env

services/preguntas-service/.env

services/ensayos-service/.env

services/resultados-service/.env

services/respuestas-service/.env (si existe)

El contenido general para cada uno será:

PORT=XXXX
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

4. Inicializar y Enviar Código (Solo si es la primera vez que sube o si el repositorio remoto está vacío)
Si está subiendo este proyecto por primera vez a un repositorio de GitHub que estaba vacío o solo tenía un README.md generado, puede usar estos comandos para inicializar Git y subir su código.

Desde la raíz de su proyecto en la terminal:

# Inicializa Git en esta carpeta (si aún no lo está)
git init

# Prepara todos los archivos para el primer commit
git add .

# Guarda la primera versión de su proyecto localmente
git commit -m "Carga inicial del proyecto"

# Conecta su repositorio local con el remoto de GitHub
git remote add origin https://github.com/Daspssj/GRUPO05-2025-PROYINF.git

# Sube el proyecto a la rama 'main' en GitHub.
# El --force reemplaza el contenido existente en el remoto, útil para la primera carga.
git push -u origin master:main --force

Nota: Es posible que se le pida su nombre de usuario y contraseña de GitHub.

5. Instalar Dependencias del Frontend
Navegue a la carpeta frontend e instale sus dependencias:

cd frontend
npm install # o yarn install

6. Verificar el Proxy del Frontend
Asegúrese de que en el archivo frontend/package.json exista la siguiente línea para que el frontend pueda comunicarse con el backend a través del Gateway Nginx:

// En frontend/package.json
"proxy": "http://localhost:80"

7. Iniciar los Servicios y el Frontend
Levantar los Microservicios con Docker Compose:
Desde la raíz de su proyecto (donde está docker-compose.yml), ejecute:

docker-compose up --build -d

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
