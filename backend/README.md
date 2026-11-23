# Kingshouse Learning Centre — Go Backend

Go HTTP API server for Kingshouse Learning Centre (`khlc-backend`).

## Structure

- `cmd/server/main.go` — Server entrypoint, router, and graceful shutdown
- `internal/config/` — Environment configuration loader
- `internal/handlers/` — HTTP route handlers (`health`, `enquiries`, `newsletter`) and unit tests
- `internal/middleware/` — CORS and structured `slog` request logging

## Endpoints

| Method | Path | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Service health check |
| `POST` | `/api/v1/enquiries` | Submit a school, parent/learner, partner, or instructor enquiry |
| `GET` | `/api/v1/enquiries` | List recorded enquiries |
| `POST` | `/api/v1/newsletter` | Subscribe an email address to Kingshouse updates |

## Running Locally

```bash
cd backend
go run ./cmd/server
```

## Testing & Building

```bash
cd backend
go test ./...
go build -o bin/server ./cmd/server
```
