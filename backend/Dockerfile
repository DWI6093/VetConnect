FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-alpine AS production

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Usuario sin privilegios
RUN addgroup -S nestjs && adduser -S nestjs -G nestjs
USER nestjs

EXPOSE 3000

CMD ["node", "dist/src/main.js"]
