# Stage 1: Build Go binary
FROM golang:1.26-alpine AS builder

WORKDIR /app
RUN apk add --no-cache ca-certificates tzdata

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /app/server ./cmd/server

# Stage 2: Minimal production runtime with CA certs for Neon TLS
FROM alpine:3.21

WORKDIR /app
RUN apk add --no-cache ca-certificates tzdata

COPY --from=builder /app/server /app/server

ENV APP_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["/app/server"]
