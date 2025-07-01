###################  FASE DE CONSTRUCCIÓN DE DEPENDENCIAS  ###############
FROM node:18-alpine AS builder

# Establecer el directorio de trabajo principal en /app
WORKDIR /app

# 1. Copiar e instalar las dependencias del módulo común (_common)
# Copiamos solo los archivos de manifiesto para aprovechar la caché de Docker.
COPY services/_common/package.json ./services/_common/package.json
COPY services/_common/package-lock.json ./services/_common/package-lock.json
# Ejecutar npm install para el módulo _common
RUN npm --prefix ./services/_common install --omit=dev

# 2. Copiar e instalar las dependencias del micro-servicio específico
# El argumento de construcción SERVICE se pasa desde docker-compose (ej. 'services/auth')
ARG SERVICE
# Copiamos solo el package.json del servicio específico
COPY ${SERVICE}/package.json ${SERVICE}/package.json

# Ejecutar npm install para el servicio específico
RUN npm --prefix ./${SERVICE} install --omit=dev

# 3. Copiar todo el código fuente de la aplicación
# Esto incluye el código de todos los servicios y el módulo _common.
# Se hace aquí para que esté disponible para la fase final.
COPY . .

# Esta etapa crea la imagen final de producción, más pequeña.
FROM node:18-alpine

# Establecer el directorio de trabajo al directorio del servicio específico
ARG SERVICE
WORKDIR /app/${SERVICE}

# 1. Copiar las dependencias instaladas de la fase 'builder'
# Copiar los node_modules del servicio específico a su WORKDIR
COPY --from=builder /app/${SERVICE}/node_modules ./node_modules
# Copiar los node_modules del módulo común a su ubicación esperada
# Esto es CRÍTICO para que los módulos como 'jsonwebtoken' sean encontrados por el middleware.
COPY --from=builder /app/services/_common/node_modules /app/services/_common/node_modules

# 2. Copiar el código fuente del micro-servicio específico
# Se copia el contenido de la carpeta del servicio a la raíz de su WORKDIR
COPY ${SERVICE} .

# 3. Copiar el código compartido (_common)
# Esto asegura que los archivos .js del middleware estén disponibles en la ruta correcta.
COPY services/_common /app/services/_common

# Configuración de entorno y comando de inicio
ENV NODE_ENV=production
EXPOSE ${PORT:-5000}
CMD ["node", "index.js"]
