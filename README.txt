Para iniciar la pagina, primeramente tenemos
## Requisitos Previos

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.0+)
- [Node.js](https://nodejs.org/) (opcional, solo para desarrollo local)
- `curl` o cliente HTTP (para probar endpoints)
- React (npm)

## Instalación

### 1. Clonar el repositorio

1. Deben navegar hasta la carpeta ProyectoPaes/frontend-paes en una nueva terminal y ejecutar
    -npm install
    -npm install react-icon

2. Deben navegar hasta la carpeta ProyectoPaes/mi-proyecto-node-docker y ejecutar Docker compose up --build
(les instalará las dependencias se suele demorar un poco la primera vez con esto levantan el proyecto)  

(para detener los contenedores)  
docker compose down -v

si no les ejecuta asegurense de estar en la carpeta correcta  
si trabajan desde windows deben tener instalado WSL2 y tenerlo activado en docker desktop  
esto se puede verificar en  
Configuración   
-Resources  
  -Configure which WSL 2 distros you want to access Docker from. (esto debe estar activo)  
  -Enable integration with additional distros:(esto debe estar activo)  

3. Para iniciar la pagina deben volver a navegar en una nueva terminal a ProyectoPaes/frontend-paes y deben ejecutar "npm start" y escribir "y" cuando diga puerto ocupado y listo. 