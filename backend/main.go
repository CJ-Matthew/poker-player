package main

import (
    "context"
    "encoding/json"
    "log"
    "net/http"
    "os"
    "os/signal"
    "strconv"
    "time"
)

type Player struct {
    ID   string `json:"id"`
    Name string `json:"name"`
    Chips int   `json:"chips"`
}

func main() {
    mux := http.NewServeMux()

    mux.Handle("/health", withLogging(withCORS(http.HandlerFunc(healthHandler))))
    mux.Handle("/api/players", withLogging(withCORS(http.HandlerFunc(playersHandler))))

    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }

    srv := &http.Server{
        Addr:    ":" + port,
        Handler: mux,
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

    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()
    if err := srv.Shutdown(ctx); err != nil {
        log.Fatalf("server forced to shutdown: %v", err)
    }
    log.Println("server exiting")
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    _ = json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

func playersHandler(w http.ResponseWriter, r *http.Request) {
    // For demo purposes return a small static list. In a real backend this
    // would talk to a database.
    players := []Player{
        {ID: "1", Name: "Alice", Chips: 1500},
        {ID: "2", Name: "Bob", Chips: 1200},
    }

    // support limit query param
    if q := r.URL.Query().Get("limit"); q != "" {
        if n, err := strconv.Atoi(q); err == nil && n < len(players) {
            players = players[:n]
        }
    }

    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    _ = json.NewEncoder(w).Encode(players)
}

// withCORS is a tiny middleware to allow browser requests during local dev.
func withCORS(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Access-Control-Allow-Origin", "*")
        w.Header().Set("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
        w.Header().Set("Access-Control-Allow-Headers", "Content-Type,Authorization")
        if r.Method == http.MethodOptions {
            w.WriteHeader(http.StatusNoContent)
            return
        }
        next.ServeHTTP(w, r)
    })
}

// withLogging logs basic request info.
func withLogging(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        rr := &responseRecorder{ResponseWriter: w, statusCode: 200}
        next.ServeHTTP(rr, r)
        log.Printf("%s %s %d %s", r.Method, r.URL.Path, rr.statusCode, time.Since(start))
    })
}

type responseRecorder struct {
    http.ResponseWriter
    statusCode int
}

func (r *responseRecorder) WriteHeader(code int) {
    r.statusCode = code
    r.ResponseWriter.WriteHeader(code)
}
