FROM node:20-alpine

WORKDIR /app

# Instala dependências
COPY package*.json ./
RUN npm install

# Copia o schema do Prisma e gera o cliente
COPY prisma ./prisma/
RUN npx prisma generate

# Copia o resto do código
COPY . .

# Expõe a porta definida no .env (7070)
EXPOSE 7070

# Comando para desenvolvimento
CMD ["npm", "run", "dev"]
