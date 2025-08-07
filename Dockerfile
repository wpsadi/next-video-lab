# syntax=docker/dockerfile:1

# ---------------------------------------
# 1. Node.js base for building (better Next.js compatibility)
FROM node:20-slim AS base
WORKDIR /app

# Install FFmpeg (for video processing)
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# ---------------------------------------
# 2. Install dependencies with npm
FROM base AS deps

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# ---------------------------------------
# 3. Build Next.js App with Node.js
FROM base AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Optional: disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Install dev dependencies and build
RUN npm ci && npm run build

# ---------------------------------------
# 4. Final production image with Bun runtime + FFmpeg
FROM oven/bun:1.1.13 AS runner
WORKDIR /app

# Install FFmpeg in the runtime image
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create a non-root user
RUN addgroup --system --gid 1001 bunuser && \
    adduser --system --uid 1001 bunuser

# Copy only necessary production files from builder
COPY --from=builder --chown=bunuser:bunuser /app/public ./public
COPY --from=builder --chown=bunuser:bunuser /app/.next/standalone ./
COPY --from=builder --chown=bunuser:bunuser /app/.next/static ./.next/static
COPY --from=builder --chown=bunuser:bunuser /app/package.json ./

# Create temp directory for HLS processing with proper permissions
RUN mkdir -p /tmp/hls-processing && \
    chown bunuser:bunuser /tmp/hls-processing

USER bunuser

EXPOSE 3000

# Use Bun to run the Next.js standalone server
ENTRYPOINT ["bun", "server.js"]
