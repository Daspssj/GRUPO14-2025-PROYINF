# mi-proyecto-node-docker/services/colegios-cursos/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Instala deps sólo con los manifest (para cache eficiente)
COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev

# Copia el código
COPY src ./src

ENV NODE_ENV=production
ENV PORT=5007
EXPOSE 5007

CMD ["node", "src/server.js"]