# ---------- Build stage ----------
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx prisma generate || true
RUN npm run build


# ---------- Production stage ----------
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/src ./src

# Copy server files if your backend entry is outside src
COPY --from=build /app/server.js ./server.js
COPY --from=build /app/index.js ./index.js

RUN npx prisma generate || true

EXPOSE 5000

CMD ["sh", "-c", "npx prisma migrate deploy || true && npm start"]
