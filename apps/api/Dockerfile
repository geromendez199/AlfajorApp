FROM node:20-alpine
WORKDIR /app
COPY ../../package.json ../../pnpm-lock.yaml* ./
RUN corepack enable && pnpm install --frozen-lockfile --ignore-scripts
COPY ../../ .
WORKDIR /app/apps/api
RUN pnpm install --frozen-lockfile --ignore-scripts
RUN pnpm run build || true
EXPOSE 3001
CMD ["pnpm", "run", "start:dev"]
