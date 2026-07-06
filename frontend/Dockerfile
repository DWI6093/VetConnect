# ─────────────────────────────────────────
# Dockerfile de DESARROLLO – Angular 21
# ─────────────────────────────────────────
FROM node:20 
WORKDIR /app 
COPY . . 
RUN npm install 
EXPOSE 4200 
CMD ["npx", "ng", "serve", "--host", "0.0.0.0"]
