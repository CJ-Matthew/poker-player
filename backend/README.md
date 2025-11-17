# Poker-player backend (Go)

This is a tiny Go HTTP server used for local development and testing.

Endpoints:

- GET /health -> {"status":"ok"}
- GET /api/players -> returns a JSON array of players. Optional `limit` query param.

Run locally (requires Go 1.18+):

1. From the `backend/` directory run:

```bash
# run directly
go run .

# or build and run
go build -o poker-backend .
./poker-backend
```

2. Set PORT environment variable to change the listening port (default 8080):

```bash
PORT=4000 go run .
```

Quick tests:

```bash
curl localhost:8080/health
curl localhost:8080/api/players
curl "localhost:8080/api/players?limit=1"
```

Notes:

- This server is intentionally minimal. Replace the static player list with a database or service as needed.
- The CORS middleware allows requests from any origin for development. Lock this down for production.
