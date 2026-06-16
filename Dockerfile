# Stage 1 — build the Vite client
FROM node:20-slim AS builder
WORKDIR /app
COPY client/package.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2 — serve with nginx (no Node runtime, no database)
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
