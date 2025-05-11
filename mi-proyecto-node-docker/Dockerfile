FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Instalar wait-port globalmente
RUN npm install -g wait-port

# Comando modificado para esperar a PostgreSQL
CMD ["sh", "-c", "wait-port postgres_db:5432 && npm start"]