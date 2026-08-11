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
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Usuario sin privilegios
RUN addgroup -S nestjs && adduser -S nestjs -G nestjs
RUN mkdir -p /app/uploads/negocios \
  && chown -R nestjs:nestjs /app/uploads
USER nestjs

EXPOSE 3000

CMD ["node", "dist/src/main.js"]
