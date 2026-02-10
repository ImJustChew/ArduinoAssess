# Dockerfile for ArduinoAssess
# Multi-stage build for production deployment on Google Cloud Run

FROM oven/bun:1 AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build frontend
RUN bun run build:frontend

# Production stage
FROM oven/bun:1-slim

WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./

# Install production dependencies only
RUN bun install --production --frozen-lockfile

# Copy server source
COPY server ./server

# Copy built frontend from builder
COPY --from=builder /app/dist ./dist

# Expose port (Cloud Run will set PORT env var)
EXPOSE 3000

# Set production environment
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun -e "await fetch('http://localhost:3000/api/health')" || exit 1

# Start server
CMD ["bun", "run", "server/index.ts"]
