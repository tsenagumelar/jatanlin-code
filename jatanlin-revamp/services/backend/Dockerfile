# Build stage
FROM golang:1.24-alpine AS builder
ARG TARGETOS
ARG TARGETARCH

# Install build dependencies
RUN apk add --no-cache git ca-certificates tzdata

# Set working directory
WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build all binaries
RUN CGO_ENABLED=0 GOOS=${TARGETOS:-linux} GOARCH=${TARGETARCH} \
    go build -ldflags="-w -s" -o /app/bin/api ./cmd/api && \
    go build -ldflags="-w -s" -o /app/bin/anpr-watcher ./cmd/anpr-watcher && \
    go build -ldflags="-w -s" -o /app/bin/axle-watcher ./cmd/axle-watcher && \
    go build -ldflags="-w -s" -o /app/bin/cctv-streamer ./cmd/cctv-streamer

# Runtime stage
FROM alpine:latest

# Install runtime dependencies
RUN apk --no-cache add ca-certificates tzdata

# Set timezone
ENV TZ=Asia/Jakarta

# Create non-root user
RUN addgroup -g 1000 appuser && \
    adduser -D -u 1000 -G appuser appuser

# Set working directory
WORKDIR /app

# Copy binaries from builder
COPY --from=builder /app/bin ./bin

# Change ownership
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose API port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD sh -c '[ "$SERVICE" != "api" ] || wget --no-verbose --tries=1 --spider http://127.0.0.1:${API_PORT:-4000}/health || exit 1'

# Entrypoint selector (SERVICE=api|anpr-watcher|axle-watcher|cctv-streamer)
ENTRYPOINT ["/bin/sh", "-c", "\
  case \"$SERVICE\" in \
    api|\"\" ) exec /app/bin/api ;; \
    anpr-watcher ) exec /app/bin/anpr-watcher ;; \
    axle-watcher ) exec /app/bin/axle-watcher ;; \
    cctv-streamer ) exec /app/bin/cctv-streamer ;; \
    * ) echo \"Unknown SERVICE '$SERVICE'\"; exit 1 ;; \
  esac \
"]
