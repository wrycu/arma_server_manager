FROM node:22-alpine

WORKDIR /app

COPY frontend/pnpm-lock.yaml frontend/package.json ./
RUN npm install -g pnpm@9
RUN pnpm install --frozen-lockfile

COPY frontend/ ./

EXPOSE 5173

ENV VITE_API_PROXY_TARGET=http://backend:5000

# Vite dev server
CMD ["pnpm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]


