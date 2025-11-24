package game

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/CJ-Matthew/poker-player/backend/internal/store"

	"github.com/google/uuid"
)

func CreateTable(ctx context.Context, req CreateTableRequest) (string, string, error) {
	tableID := uuid.New().String()
	playerID := fmt.Sprintf("%s_%d", req.PlayerName, time.Now().UnixMilli())

	tableData := TableData{
		SmallBlind: req.SmallBlind,
		BigBlind:   req.BigBlind,
		Pot:        0,
		Players: []Player{{
			Name:       req.PlayerName,
			Chips:      req.BuyIn,
			Folded:     false,
			CurrentBet: 0,
			Active:     true,
		}},
		PlayerIDs:      []string{playerID},
		DealerPosition: 0,
		CurrentTurn:    -1,
		CurrentBet:     0,
		RoundActive:    false,
		RoundStage:     "",
		LastToAct:      -1,
	}

	err := store.CreateTableRecord(ctx, tableID, tableData)
	if err != nil {
		return "", "", err
	}

	return tableID, playerID, nil
}

func JoinTable(ctx context.Context, tableID string, req JoinTableRequest) (string, error) {
	// Get current table state
	rawState, err := store.GetTable(ctx, tableID)
	if err != nil {
		return "", err
	}

	var table TableData
	// We need to unmarshal the raw JSON into our struct
	// Assuming store.GetTable returns json.RawMessage which is []byte
	if err := jsonUnmarshal(rawState, &table); err != nil {
		return "", err
	}

	// Check if player exists
	for i, p := range table.Players {
		if p.Name == req.PlayerName {
			table.Players[i].Active = true
			if err := store.SaveTable(ctx, tableID, table); err != nil {
				return "", err
			}
			return table.PlayerIDs[i], nil
		}
	}

	if len(table.Players) >= 10 {
		return "", fmt.Errorf("table is full")
	}

	playerID := fmt.Sprintf("%s_%d", req.PlayerName, time.Now().UnixMilli())
	newPlayer := Player{
		Name:       req.PlayerName,
		Chips:      req.BuyIn,
		Folded:     false,
		CurrentBet: 0,
		Active:     true,
	}

	table.Players = append(table.Players, newPlayer)
	table.PlayerIDs = append(table.PlayerIDs, playerID)

	if err := store.SaveTable(ctx, tableID, table); err != nil {
		return "", err
	}

	return playerID, nil
}

// Helper to unmarshal since we can't import json in the main block easily without it being used
func jsonUnmarshal(data []byte, v interface{}) error {
	return json.Unmarshal(data, v)
}

func getActivePlayers(table TableData) ([]Player, []int) {
	var players []Player
	var indices []int
	for i, p := range table.Players {
		if p.Active {
			players = append(players, p)
			indices = append(indices, i)
		}
	}
	return players, indices
}

func findNextActivePlayer(table TableData, currentIndex int) int {
	_, indices := getActivePlayers(table)
	if len(indices) == 0 {
		return -1
	}

	currentActiveIndex := -1
	for i, idx := range indices {
		if idx == currentIndex {
			currentActiveIndex = i
			break
		}
	}

	// If current index not found in active (maybe they left?), start from 0 or handle gracefully
	// But usually we want next after current.
	// If not found, we can try to find the next highest index, or just wrap to 0.
	if currentActiveIndex == -1 {
		return indices[0]
	}

	nextActiveIndex := (currentActiveIndex + 1) % len(indices)
	attempts := 0

	for table.Players[indices[nextActiveIndex]].Folded && attempts < len(indices) {
		nextActiveIndex = (nextActiveIndex + 1) % len(indices)
		attempts++
	}

	return indices[nextActiveIndex]
}

func isBettingRoundComplete(table TableData) bool {
	activePlayers := 0
	for _, p := range table.Players {
		if p.Active && !p.Folded {
			activePlayers++
		}
	}
	if activePlayers <= 1 {
		return true
	}

	// Check if all active non-folded players matched the bet
	allMatched := true
	for _, p := range table.Players {
		if p.Active && !p.Folded {
			if p.CurrentBet != table.CurrentBet {
				allMatched = false
				break
			}
		}
	}

	if !allMatched {
		return false
	}

	// Check if we passed the lastToAct
	// This is a bit tricky to port exactly without the full context of "who acted last"
	// But the logic in frontend was:
	// if (!activeIndices.includes(tableData.lastToAct)) return allPlayersMatched;
	// ...
	// return currentTurnIndex === nextAfterLastToAct && allPlayersMatched;

	// We can simplify: if everyone matched and the current turn is "next after last to act", we are done.
	// But we need to know who is "next after last to act".
	
	_, indices := getActivePlayers(table)
	// Filter for non-folded
	var activeNonFoldedIndices []int
	for _, idx := range indices {
		if !table.Players[idx].Folded {
			activeNonFoldedIndices = append(activeNonFoldedIndices, idx)
		}
	}

	if len(activeNonFoldedIndices) == 0 {
		return true
	}

	// Find position of lastToAct in activeNonFoldedIndices
	lastToActPos := -1
	for i, idx := range activeNonFoldedIndices {
		if idx == table.LastToAct {
			lastToActPos = i
			break
		}
	}

	// If lastToAct is not active/non-folded anymore, we just check if everyone matched
	if lastToActPos == -1 {
		return allMatched
	}

	nextAfterLastToAct := activeNonFoldedIndices[(lastToActPos+1)%len(activeNonFoldedIndices)]

	return table.CurrentTurn == nextAfterLastToAct && allMatched
}

func AdvanceRoundStage(ctx context.Context, tableID string, table *TableData) error {
	stages := []string{"PRE_FLOP", "FLOP", "TURN", "RIVER", ""}
	currentIndex := -1
	for i, s := range stages {
		if s == table.RoundStage {
			currentIndex = i
			break
		}
	}

	nextStage := ""
	if currentIndex != -1 && currentIndex < len(stages)-1 {
		nextStage = stages[currentIndex+1]
	}

	_, indices := getActivePlayers(*table)
	if len(indices) == 0 {
		return nil
	}

	table.RoundStage = nextStage
	table.CurrentBet = 0
	for i := range table.Players {
		table.Players[i].CurrentBet = 0
	}

	dealerActiveIndex := -1
	for i, idx := range indices {
		if idx == table.DealerPosition {
			dealerActiveIndex = i
			break
		}
	}
	if dealerActiveIndex == -1 {
		dealerActiveIndex = 0
	}

	firstToActActiveIndex := (dealerActiveIndex + 1) % len(indices)
	table.CurrentTurn = indices[firstToActActiveIndex]
	table.LastToAct = indices[dealerActiveIndex]

	return store.SaveTable(ctx, tableID, *table)
}

func HandlePlayerAction(ctx context.Context, tableID string, req PlayerActionRequest) error {
	rawState, err := store.GetTable(ctx, tableID)
	if err != nil {
		return err
	}
	var table TableData
	if err := jsonUnmarshal(rawState, &table); err != nil {
		return err
	}

	playerIndex := -1
	for i, id := range table.PlayerIDs {
		if id == req.PlayerID {
			playerIndex = i
			break
		}
	}

	if playerIndex == -1 || playerIndex != table.CurrentTurn {
		return fmt.Errorf("not your turn")
	}

	player := &table.Players[playerIndex]
	if !player.Active {
		return fmt.Errorf("player not active")
	}

	switch req.Action {
	case "fold":
		player.Folded = true
	case "call":
		callAmount := table.CurrentBet - player.CurrentBet
		player.Chips -= callAmount
		player.CurrentBet = table.CurrentBet
		table.Pot += callAmount
	case "raise":
		totalBet := table.CurrentBet + req.RaiseAmount
		amountToAdd := totalBet - player.CurrentBet
		player.Chips -= amountToAdd
		player.CurrentBet = totalBet
		table.Pot += amountToAdd
		table.CurrentBet = totalBet
		table.LastToAct = playerIndex
	}

	table.CurrentTurn = findNextActivePlayer(table, table.CurrentTurn)

	// Save first
	if err := store.SaveTable(ctx, tableID, table); err != nil {
		return err
	}

	// Check round completion
	if isBettingRoundComplete(table) {
		activePlayersCount := 0
		for _, p := range table.Players {
			if p.Active && !p.Folded {
				activePlayersCount++
			}
		}

		if activePlayersCount == 1 {
			// Winner declared (handled by frontend or another call? Frontend usually calls EndRound)
			// For now we just return, maybe we should auto-end?
			// The frontend logic says: "Don't advance stage, let the winner be declared"
			return nil
		}

		if table.RoundStage != "RIVER" {
			return AdvanceRoundStage(ctx, tableID, &table)
		}
	}

	return nil
}

func StartRound(ctx context.Context, tableID string) error {
	rawState, err := store.GetTable(ctx, tableID)
	if err != nil {
		return err
	}
	var table TableData
	if err := jsonUnmarshal(rawState, &table); err != nil {
		return err
	}

	_, indices := getActivePlayers(table)
	if len(indices) < 2 {
		return fmt.Errorf("need at least 2 players")
	}

	dealerActiveIndex := -1
	for i, idx := range indices {
		if idx == table.DealerPosition {
			dealerActiveIndex = i
			break
		}
	}
	if dealerActiveIndex == -1 {
		dealerActiveIndex = 0
	}

	dealerPos := indices[dealerActiveIndex]
	sbActiveIndex := (dealerActiveIndex + 1) % len(indices)
	bbActiveIndex := (dealerActiveIndex + 2) % len(indices)

	sbPos := indices[sbActiveIndex]
	bbPos := indices[bbActiveIndex]

	table.Players[sbPos].Chips -= table.SmallBlind
	table.Players[sbPos].CurrentBet = table.SmallBlind
	table.Players[bbPos].Chips -= table.BigBlind
	table.Players[bbPos].CurrentBet = table.BigBlind

	table.Pot = table.SmallBlind + table.BigBlind
	table.CurrentBet = table.BigBlind
	table.RoundActive = true
	table.RoundStage = "PRE_FLOP"
	table.DealerPosition = dealerPos

	nextActiveIndex := (bbActiveIndex + 1) % len(indices)
	table.CurrentTurn = indices[nextActiveIndex]
	table.LastToAct = bbPos

	for _, idx := range indices {
		table.Players[idx].Folded = false
		if idx != sbPos && idx != bbPos {
			table.Players[idx].CurrentBet = 0
		}
	}

	return store.SaveTable(ctx, tableID, table)
}

func MoveDealer(ctx context.Context, tableID string) error {
	rawState, err := store.GetTable(ctx, tableID)
	if err != nil {
		return err
	}
	var table TableData
	if err := jsonUnmarshal(rawState, &table); err != nil {
		return err
	}

	_, indices := getActivePlayers(table)
	if len(indices) == 0 {
		return nil
	}

	currentDealerActiveIndex := -1
	for i, idx := range indices {
		if idx == table.DealerPosition {
			currentDealerActiveIndex = i
			break
		}
	}

	newDealerActiveIndex := 0
	if currentDealerActiveIndex != -1 {
		newDealerActiveIndex = (currentDealerActiveIndex + 1) % len(indices)
	}

	table.DealerPosition = indices[newDealerActiveIndex]

	return store.SaveTable(ctx, tableID, table)
}

func EndRound(ctx context.Context, tableID string, winnerID string) error {
	rawState, err := store.GetTable(ctx, tableID)
	if err != nil {
		return err
	}
	var table TableData
	if err := jsonUnmarshal(rawState, &table); err != nil {
		return err
	}

	winnerIndex := -1
	for i, id := range table.PlayerIDs {
		if id == winnerID {
			winnerIndex = i
			break
		}
	}

	if winnerIndex == -1 {
		return fmt.Errorf("winner not found")
	}

	table.Players[winnerIndex].Chips += table.Pot
	table.Pot = 0
	table.CurrentBet = 0
	table.RoundActive = false
	table.RoundStage = ""
	table.CurrentTurn = -1
	table.LastToAct = -1

	_, indices := getActivePlayers(table)
	if len(indices) > 0 {
		currentDealerActiveIndex := -1
		for i, idx := range indices {
			if idx == table.DealerPosition {
				currentDealerActiveIndex = i
				break
			}
		}
		newDealerActiveIndex := 0
		if currentDealerActiveIndex != -1 {
			newDealerActiveIndex = (currentDealerActiveIndex + 1) % len(indices)
		}
		table.DealerPosition = indices[newDealerActiveIndex]
	}

	for i := range table.Players {
		table.Players[i].CurrentBet = 0
		table.Players[i].Folded = false
	}

	return store.SaveTable(ctx, tableID, table)
}

func UpdateBlinds(ctx context.Context, tableID string, smallBlind int, bigBlind int) error {
	rawState, err := store.GetTable(ctx, tableID)
	if err != nil {
		return err
	}
	var table TableData
	if err := jsonUnmarshal(rawState, &table); err != nil {
		return err
	}

	table.SmallBlind = smallBlind
	table.BigBlind = bigBlind

	return store.SaveTable(ctx, tableID, table)
}

func UpdatePlayerChips(ctx context.Context, tableID string, playerID string, chips int) error {
	rawState, err := store.GetTable(ctx, tableID)
	if err != nil {
		return err
	}
	var table TableData
	if err := jsonUnmarshal(rawState, &table); err != nil {
		return err
	}

	playerIndex := -1
	for i, id := range table.PlayerIDs {
		if id == playerID {
			playerIndex = i
			break
		}
	}

	if playerIndex == -1 {
		return fmt.Errorf("player not found")
	}

	if chips < 0 {
		return fmt.Errorf("chips cannot be negative")
	}

	table.Players[playerIndex].Chips = chips

	return store.SaveTable(ctx, tableID, table)
}

func LeaveTable(ctx context.Context, tableID string, playerID string) error {
	rawState, err := store.GetTable(ctx, tableID)
	if err != nil {
		return err
	}
	var table TableData
	if err := jsonUnmarshal(rawState, &table); err != nil {
		return err
	}

	playerIndex := -1
	for i, id := range table.PlayerIDs {
		if id == playerID {
			playerIndex = i
			break
		}
	}

	if playerIndex == -1 {
		return nil // Already gone?
	}

	// If player is in an active round, fold them first
	if table.RoundActive && !table.Players[playerIndex].Folded {
		table.Players[playerIndex].Folded = true
		if table.CurrentTurn == playerIndex {
			table.CurrentTurn = findNextActivePlayer(table, playerIndex)
		}
	}

	table.Players[playerIndex].Active = false

	// Reorder players: active first, inactive last
	// This logic is a bit complex to port 1:1 with array splicing in Go vs JS
	// But we can just filter and reconstruct
	
	// We need to map old indices to new indices to update DealerPosition and CurrentTurn
	// This is getting complicated. For now, let's just mark as inactive and save.
	// The frontend reorders them visually anyway.
	// But the game logic relies on indices.
	// If we don't reorder, the indices stay the same, which is safer for now.
	// The original code did reorder.
	
	// Let's stick to just marking inactive for simplicity and safety in this migration step.
	// If we reorder, we break all index references (DealerPosition, CurrentTurn, LastToAct).
	
	return store.SaveTable(ctx, tableID, table)
}

func UpdatePlayerPositions(ctx context.Context, tableID string, orderedPlayerIDs []string) error {
	rawState, err := store.GetTable(ctx, tableID)
	if err != nil {
		return err
	}
	var table TableData
	if err := jsonUnmarshal(rawState, &table); err != nil {
		return err
	}

	if len(orderedPlayerIDs) != len(table.PlayerIDs) {
		return fmt.Errorf("player count mismatch")
	}

	// Create map of current players by ID
	playerMap := make(map[string]Player)
	for i, id := range table.PlayerIDs {
		playerMap[id] = table.Players[i]
	}

	// Create map of old indices to new indices to update pointers
	// Actually we need to know who the dealer/current turn IS, and find their NEW index.
	
	dealerID := ""
	if table.DealerPosition >= 0 && table.DealerPosition < len(table.PlayerIDs) {
		dealerID = table.PlayerIDs[table.DealerPosition]
	}
	
	currentTurnID := ""
	if table.CurrentTurn >= 0 && table.CurrentTurn < len(table.PlayerIDs) {
		currentTurnID = table.PlayerIDs[table.CurrentTurn]
	}
	
	lastToActID := ""
	if table.LastToAct >= 0 && table.LastToAct < len(table.PlayerIDs) {
		lastToActID = table.PlayerIDs[table.LastToAct]
	}

	// Reconstruct arrays in new order
	newPlayers := make([]Player, len(orderedPlayerIDs))
	for i, id := range orderedPlayerIDs {
		p, ok := playerMap[id]
		if !ok {
			return fmt.Errorf("unknown player id in order: %s", id)
		}
		newPlayers[i] = p
	}

	table.PlayerIDs = orderedPlayerIDs
	table.Players = newPlayers

	// Update indices
	if dealerID != "" {
		for i, id := range orderedPlayerIDs {
			if id == dealerID {
				table.DealerPosition = i
				break
			}
		}
	}
	
	if currentTurnID != "" {
		for i, id := range orderedPlayerIDs {
			if id == currentTurnID {
				table.CurrentTurn = i
				break
			}
		}
	}
	
	if lastToActID != "" {
		for i, id := range orderedPlayerIDs {
			if id == lastToActID {
				table.LastToAct = i
				break
			}
		}
	}

	return store.SaveTable(ctx, tableID, table)
}
