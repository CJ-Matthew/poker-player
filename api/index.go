package handler

import (
	"net/http"

	"github.com/CJ-Matthew/poker-player/backend/server"
)

// Handler is the entry point for Vercel serverless functions.
func Handler(w http.ResponseWriter, r *http.Request) {
	server.NewHandler().ServeHTTP(w, r)
}
