FROM node:22-alpine

WORKDIR /app

COPY BanCafe/backend/package.json BanCafe/backend/package-lock.json ./
RUN npm ci --omit=dev

COPY BanCafe/backend/server.js BanCafe/backend/setup_db.js BanCafe/backend/init_supabase.sql ./
COPY BanCafe/wwwroot ./public

RUN mkdir -p uploads && chown -R node:node /app

ENV NODE_ENV=production
ENV STATIC_ROOT=/app/public

USER node
EXPOSE 5000

CMD ["node", "server.js"]