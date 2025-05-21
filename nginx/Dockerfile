# Stage 1: Build the frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY ./frontend/package.json ./frontend/package-lock.json* ./
RUN npm install
COPY ./frontend/. ./ 
RUN npm run build

# Stage 2: Build the Nginx image
FROM nginx:alpine
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=frontend-builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]