package main

import (
	"log"
	"net/http"
	"os"
	"os/signal"

	"github.com/CJ-Matthew/poker-player/backend/server"
	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load() // Load .env file if it exists

	handler := server.NewHandler()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	srv := &http.Server{
		Addr:    ":" + port,
		Handler: handler,
	}

	// Start server
	go func() {
		log.Printf("starting server on %s", srv.Addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %s", err)
		}
	}()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)
	<-quit
	log.Println("shutdown signal received")
}
