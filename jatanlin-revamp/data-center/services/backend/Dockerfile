FROM golang:1.24-alpine AS builder

WORKDIR /app
COPY go.mod ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /out/data-center-api ./cmd/api

FROM alpine:3.22
WORKDIR /app
COPY --from=builder /out/data-center-api /app/data-center-api
EXPOSE 8080
CMD ["/app/data-center-api"]
