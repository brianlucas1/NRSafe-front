# ===== build =====
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Ajuste o nome do projeto se precisar; esse comando gera dist/<app>/browser
RUN npm run build -- --configuration production --base-href=/

# ===== run (Nginx) =====
FROM nginx:1.27-alpine
# limpa conf default
RUN rm -f /etc/nginx/conf.d/*

COPY --from=build /app/dist/NRSafe/browser/ /usr/share/nginx/html/

# health simples
RUN echo "ok" > /usr/share/nginx/html/healthz
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
