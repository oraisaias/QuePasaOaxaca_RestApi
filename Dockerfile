FROM node:18-alpine

WORKDIR /app

COPY package.json .

RUN npm install

COPY . . 

RUN npm run build

# Exponer puerto
EXPOSE 3000

# Usar start:prod para producción
CMD ["npm", "run", "start:prod"]