# Dockerfile para desplegar el backend en Coolify

# Usamos una imagen ligera de Node
FROM node:18-alpine

# Directorio de trabajo
WORKDIR /app

# Copiamos archivos de dependencias
COPY package*.json ./

# Instalamos dependencias
# Nota: Asegúrate de tener un package.json con express, pg, cors, body-parser
RUN npm install

# Copiamos el código fuente (server.js)
COPY . .

# Exponemos el puerto
EXPOSE 3000

# Comando de inicio
CMD ["node", "server.js"]