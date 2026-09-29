
FROM node:20-bookworm-slim

FROM node:20-bookworm-slim
WORKDIR /app
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev
RUN npx playwright install --with-deps chromium
COPY backend/ ./
CMD ["npm", "start"]
