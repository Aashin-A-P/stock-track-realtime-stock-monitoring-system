FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json* tsconfig.json ./
RUN npm install
COPY . .
COPY ./data ./dist/data
RUN npm run build
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "run", "start"]