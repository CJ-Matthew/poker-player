package store

import (
	"context"
	"encoding/json"
	"fmt"
	"os"

	"github.com/nedpals/supabase-go"
)

var Client *supabase.Client

func Init() {
	supabaseUrl := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_KEY")
	if supabaseUrl == "" || supabaseKey == "" {
		panic("SUPABASE_URL and SUPABASE_KEY must be set")
	}
	Client = supabase.CreateClient(supabaseUrl, supabaseKey)
}

// TableState represents the structure stored in Supabase
type TableState struct {
	ID        string          `json:"id,omitempty"`
	GameState json.RawMessage `json:"game_state"`
}

func GetTable(ctx context.Context, tableID string) (json.RawMessage, error) {
	var results []TableState
	// We are querying the 'tables' table in Supabase.
	// We assume there is a column 'id' and 'game_state' (jsonb).
	err := Client.DB.From("tables").Select("*").Eq("id", tableID).Execute(&results)
	if err != nil {
		return nil, err
	}
	if len(results) == 0 {
		return nil, fmt.Errorf("table not found")
	}
	return results[0].GameState, nil
}

func SaveTable(ctx context.Context, tableID string, gameState interface{}) error {
	// Upsert the table state
	// If we use a map[string]interface{} for gameState, it will be marshaled to JSON
	
	// We need to make sure we are passing a structure that matches the Supabase table columns
	data := map[string]interface{}{
		"id":         tableID,
		"game_state": gameState,
	}

	var results []TableState
	err := Client.DB.From("tables").Upsert(data).Execute(&results)
	return err
}

func CreateTableRecord(ctx context.Context, tableID string, gameState interface{}) error {
	data := map[string]interface{}{
		"id":         tableID,
		"game_state": gameState,
	}
	var results []TableState
	err := Client.DB.From("tables").Insert(data).Execute(&results)
	return err
}
