package server

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/CJ-Matthew/poker-player/backend/internal/game"
	"github.com/CJ-Matthew/poker-player/backend/internal/store"
)

// NewHandler sets up the HTTP routes and returns the handler.
func NewHandler() http.Handler {
	store.Init()

	mux := http.NewServeMux()

	mux.Handle("/health", withLogging(withCORS(http.HandlerFunc(healthHandler))))
	mux.Handle("/api/tables", withLogging(withCORS(http.HandlerFunc(createTableHandler))))
	mux.Handle("/api/tables/join", withLogging(withCORS(http.HandlerFunc(joinTableHandler))))
	mux.Handle("/api/tables/action", withLogging(withCORS(http.HandlerFunc(actionHandler))))
	mux.Handle("/api/tables/start", withLogging(withCORS(http.HandlerFunc(startRoundHandler))))
	mux.Handle("/api/tables/dealer", withLogging(withCORS(http.HandlerFunc(moveDealerHandler))))
	mux.Handle("/api/tables/end", withLogging(withCORS(http.HandlerFunc(endRoundHandler))))
	mux.Handle("/api/tables/blinds", withLogging(withCORS(http.HandlerFunc(updateBlindsHandler))))
	mux.Handle("/api/tables/chips", withLogging(withCORS(http.HandlerFunc(updateChipsHandler))))
	mux.Handle("/api/tables/leave", withLogging(withCORS(http.HandlerFunc(leaveTableHandler))))
	mux.Handle("/api/tables/positions", withLogging(withCORS(http.HandlerFunc(updatePositionsHandler))))

	return mux
}

// Handlers moved from main.go

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

func createTableHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var req game.CreateTableRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	tableID, playerID, err := game.CreateTable(r.Context(), req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"tableId":  tableID,
		"playerId": playerID,
	})
}

func joinTableHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	type joinRequest struct {
		TableID string `json:"tableId"`
		game.JoinTableRequest
	}
	var req joinRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	playerID, err := game.JoinTable(r.Context(), req.TableID, req.JoinTableRequest)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"playerId": playerID,
	})
}

func actionHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	type actionRequest struct {
		TableID string `json:"tableId"`
		game.PlayerActionRequest
	}
	var req actionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if err := game.HandlePlayerAction(r.Context(), req.TableID, req.PlayerActionRequest); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

func startRoundHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	type startRequest struct {
		TableID string `json:"tableId"`
	}
	var req startRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if err := game.StartRound(r.Context(), req.TableID); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

func moveDealerHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	type moveDealerRequest struct {
		TableID string `json:"tableId"`
	}
	var req moveDealerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if err := game.MoveDealer(r.Context(), req.TableID); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

func endRoundHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	type endRoundRequest struct {
		TableID  string `json:"tableId"`
		WinnerID string `json:"winnerId"`
	}
	var req endRoundRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if err := game.EndRound(r.Context(), req.TableID, req.WinnerID); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

func updateBlindsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	type updateBlindsRequest struct {
		TableID    string `json:"tableId"`
		SmallBlind int    `json:"smallBlind"`
		BigBlind   int    `json:"bigBlind"`
	}
	var req updateBlindsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if err := game.UpdateBlinds(r.Context(), req.TableID, req.SmallBlind, req.BigBlind); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

func updateChipsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	type updateChipsRequest struct {
		TableID  string `json:"tableId"`
		PlayerID string `json:"playerId"`
		Chips    int    `json:"chips"`
	}
	var req updateChipsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if err := game.UpdatePlayerChips(r.Context(), req.TableID, req.PlayerID, req.Chips); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

func leaveTableHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	type leaveTableRequest struct {
		TableID  string `json:"tableId"`
		PlayerID string `json:"playerId"`
	}
	var req leaveTableRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if err := game.LeaveTable(r.Context(), req.TableID, req.PlayerID); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

func updatePositionsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	type updatePositionsRequest struct {
		TableID          string   `json:"tableId"`
		OrderedPlayerIDs []string `json:"orderedPlayerIds"`
	}
	var req updatePositionsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if err := game.UpdatePlayerPositions(r.Context(), req.TableID, req.OrderedPlayerIDs); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
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
