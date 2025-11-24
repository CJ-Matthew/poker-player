package game

type Player struct {
	Name       string `json:"name"`
	Chips      int    `json:"chips"`
	Folded     bool   `json:"folded"`
	CurrentBet int    `json:"currentBet"`
	Active     bool   `json:"active"`
}

type TableData struct {
	SmallBlind     int      `json:"smallBlind"`
	BigBlind       int      `json:"bigBlind"`
	Pot            int      `json:"pot"`
	Players        []Player `json:"players"`
	PlayerIDs      []string `json:"playerIds"`
	DealerPosition int      `json:"dealerPosition"`
	CurrentTurn    int      `json:"currentTurn"`
	CurrentBet     int      `json:"currentBet"`
	RoundActive    bool     `json:"roundActive"`
	RoundStage     string   `json:"roundStage"` // PRE_FLOP, FLOP, TURN, RIVER, ""
	LastToAct      int      `json:"lastToAct"`
}

type CreateTableRequest struct {
	PlayerName string `json:"playerName"`
	SmallBlind int    `json:"smallBlind"`
	BigBlind   int    `json:"bigBlind"`
	BuyIn      int    `json:"buyIn"`
}

type JoinTableRequest struct {
	PlayerName string `json:"playerName"`
	BuyIn      int    `json:"buyIn"`
}

type PlayerActionRequest struct {
	PlayerID    string `json:"playerId"`
	Action      string `json:"action"` // fold, call, raise
	RaiseAmount int    `json:"raiseAmount,omitempty"`
}
