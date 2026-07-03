# ─────────────────────────────────────────
# Dockerfile de DESARROLLO – Angular 21
# ─────────────────────────────────────────
FROM node:20 
WORKDIR /app 
COPY . . 
RUN npm install 
EXPOSE 4200 
CMD ["npm", "run", "dev", "build"]