package util

import (
	"reflect"
	"testing"
)

func TestGetWinningPlayer(t *testing.T) {
	tests := []struct {
		name        string
		hands       []Card
		board       []Card
		want        []int
		wantErr     bool
		errContains string
	}{
		// Error cases
		{
			name: "Error_UnevenPlayerCards",
			hands: []Card{
				NewCard(Ace, Spades),
				NewCard(King, Spades),
				NewCard(Queen, Spades),
			},
			board: []Card{
				NewCard(Two, Hearts),
				NewCard(Three, Hearts),
				NewCard(Four, Hearts),
				NewCard(Five, Hearts),
				NewCard(Six, Hearts),
			},
			want:        []int{},
			wantErr:     true,
			errContains: "uneven player cards",
		},
		{
			name: "Error_IncompletBoard",
			hands: []Card{
				NewCard(Ace, Spades),
				NewCard(King, Spades),
				NewCard(Queen, Spades),
				NewCard(Jack, Spades),
			},
			board: []Card{
				NewCard(Two, Hearts),
				NewCard(Three, Hearts),
				NewCard(Four, Hearts),
			},
			want:        []int{},
			wantErr:     true,
			errContains: "full board cards not given",
		},

		// Single winner cases
		{
			name: "TwoPlayers_P1Wins_HighCard",
			hands: []Card{
				// Player 1 (index 0): Ace high
				NewCard(Ace, Spades),
				NewCard(King, Hearts),
				// Player 2 (index 1): King high
				NewCard(Queen, Diamonds),
				NewCard(Jack, Clubs),
			},
			board: []Card{
				NewCard(Two, Hearts),
				NewCard(Four, Diamonds),
				NewCard(Six, Clubs),
				NewCard(Eight, Spades),
				NewCard(Ten, Hearts),
			},
			want:    []int{0},
			wantErr: false,
		},
		{
			name: "TwoPlayers_P2Wins_Pair",
			hands: []Card{
				// Player 1 (index 0): High card
				NewCard(Ace, Spades),
				NewCard(King, Hearts),
				// Player 2 (index 1): Pair of Queens
				NewCard(Queen, Diamonds),
				NewCard(Queen, Clubs),
			},
			board: []Card{
				NewCard(Two, Hearts),
				NewCard(Four, Diamonds),
				NewCard(Six, Clubs),
				NewCard(Eight, Spades),
				NewCard(Ten, Hearts),
			},
			want:    []int{1},
			wantErr: false,
		},
		{
			name: "TwoPlayers_P1Wins_Flush",
			hands: []Card{
				// Player 1 (index 0): Flush
				NewCard(Ace, Hearts),
				NewCard(King, Hearts),
				// Player 2 (index 1): No flush
				NewCard(Queen, Diamonds),
				NewCard(Jack, Clubs),
			},
			board: []Card{
				NewCard(Two, Hearts),
				NewCard(Four, Hearts),
				NewCard(Six, Hearts),
				NewCard(Eight, Spades),
				NewCard(Ten, Spades),
			},
			want:    []int{0},
			wantErr: false,
		},
		{
			name: "TwoPlayers_P2Wins_Straight",
			hands: []Card{
				// Player 1 (index 0): Pair of Aces
				NewCard(Ace, Spades),
				NewCard(Ace, Hearts),
				// Player 2 (index 1): Straight (3-4-5-6-7)
				NewCard(Three, Diamonds),
				NewCard(Seven, Clubs),
			},
			board: []Card{
				NewCard(Four, Hearts),
				NewCard(Five, Diamonds),
				NewCard(Six, Clubs),
				NewCard(Eight, Spades),
				NewCard(Ten, Hearts),
			},
			want:    []int{1},
			wantErr: false,
		},
		{
			name: "TwoPlayers_P1Wins_FullHouse",
			hands: []Card{
				// Player 1 (index 0): Full house (Aces full of Kings)
				NewCard(Ace, Spades),
				NewCard(Ace, Hearts),
				// Player 2 (index 1): Two pair
				NewCard(Queen, Diamonds),
				NewCard(Queen, Clubs),
			},
			board: []Card{
				NewCard(Ace, Diamonds),
				NewCard(King, Hearts),
				NewCard(King, Clubs),
				NewCard(Two, Spades),
				NewCard(Three, Hearts),
			},
			want:    []int{0},
			wantErr: false,
		},

		// Chop cases
		{
			name: "TwoPlayers_Chop_SameHighCard",
			hands: []Card{
				// Player 1 (index 0)
				NewCard(Ace, Spades),
				NewCard(Two, Hearts),
				// Player 2 (index 1)
				NewCard(Ace, Diamonds),
				NewCard(Three, Clubs),
			},
			board: []Card{
				NewCard(King, Hearts),
				NewCard(Queen, Diamonds),
				NewCard(Jack, Clubs),
				NewCard(Ten, Spades),
				NewCard(Nine, Hearts),
			},
			want:    []int{0, 1},
			wantErr: false,
		},
		{
			name: "TwoPlayers_Chop_BoardPlays",
			hands: []Card{
				// Player 1 (index 0): Can't improve board straight
				NewCard(Two, Spades),
				NewCard(Three, Hearts),
				// Player 2 (index 1): Can't improve board straight
				NewCard(Four, Diamonds),
				NewCard(Six, Clubs),
			},
			board: []Card{
				NewCard(Seven, Hearts),
				NewCard(Eight, Diamonds),
				NewCard(Nine, Clubs),
				NewCard(Ten, Spades),
				NewCard(Jack, Hearts),
			},
			want:    []int{0, 1},
			wantErr: false,
		},
		{
			name: "TwoPlayers_Chop_SameStraight",
			hands: []Card{
				// Player 1 (index 0): Makes 6-7-8-9-10 straight
				NewCard(Six, Spades),
				NewCard(Two, Hearts),
				// Player 2 (index 1): Makes 6-7-8-9-10 straight
				NewCard(Six, Diamonds),
				NewCard(Three, Clubs),
			},
			board: []Card{
				NewCard(Seven, Hearts),
				NewCard(Eight, Diamonds),
				NewCard(Nine, Clubs),
				NewCard(Ten, Spades),
				NewCard(King, Hearts),
			},
			want:    []int{0, 1},
			wantErr: false,
		},

		// Multiple players
		{
			name: "ThreePlayers_P2Wins",
			hands: []Card{
				// Player 1 (index 0): High card
				NewCard(Ace, Spades),
				NewCard(King, Hearts),
				// Player 2 (index 1): Pair of Queens
				NewCard(Queen, Diamonds),
				NewCard(Queen, Clubs),
				// Player 3 (index 2): High card
				NewCard(Jack, Spades),
				NewCard(Ten, Hearts),
			},
			board: []Card{
				NewCard(Two, Hearts),
				NewCard(Four, Diamonds),
				NewCard(Six, Clubs),
				NewCard(Eight, Spades),
				NewCard(Nine, Hearts),
			},
			want:    []int{1},
			wantErr: false,
		},
		{
			name: "ThreePlayers_P1AndP3Chop",
			hands: []Card{
				// Player 1 (index 0): Pair of Aces (uses A♠ and A♦ from board)
				NewCard(Ace, Spades),
				NewCard(Two, Hearts),
				// Player 2 (index 1): Pair of Kings (uses K♦ and K♥ from board)
				NewCard(King, Diamonds),
				NewCard(Three, Clubs),
				// Player 3 (index 2): Pair of Aces (uses A♥ and A♦ from board)
				NewCard(Ace, Hearts),
				NewCard(Four, Diamonds),
			},
			board: []Card{
				NewCard(Ace, Diamonds),
				NewCard(King, Hearts),
				NewCard(Queen, Clubs),
				NewCard(Jack, Spades),
				NewCard(Nine, Hearts),
			},
			want:    []int{0, 2},
			wantErr: false,
		},
		{
			name: "FourPlayers_P3Wins",
			hands: []Card{
				// Player 1 (index 0): Pair of 2s
				NewCard(Two, Spades),
				NewCard(Two, Hearts),
				// Player 2 (index 1): High card
				NewCard(Three, Diamonds),
				NewCard(Four, Clubs),
				// Player 3 (index 2): Three of a kind (5s)
				NewCard(Five, Spades),
				NewCard(Five, Hearts),
				// Player 4 (index 3): Pair of 6s
				NewCard(Six, Diamonds),
				NewCard(Six, Clubs),
			},
			board: []Card{
				NewCard(Five, Diamonds),
				NewCard(Ten, Hearts),
				NewCard(Eight, Clubs),
				NewCard(Nine, Spades),
				NewCard(Jack, Hearts),
			},
			want:    []int{2},
			wantErr: false,
		},

		// Edge cases with strong hands
		{
			name: "TwoPlayers_P1Wins_StraightFlush",
			hands: []Card{
				// Player 1 (index 0): Straight flush
				NewCard(Nine, Hearts),
				NewCard(Ten, Hearts),
				// Player 2 (index 1): Regular flush
				NewCard(Ace, Hearts),
				NewCard(Two, Hearts),
			},
			board: []Card{
				NewCard(Six, Hearts),
				NewCard(Seven, Hearts),
				NewCard(Eight, Hearts),
				NewCard(King, Spades),
				NewCard(Queen, Diamonds),
			},
			want:    []int{0},
			wantErr: false,
		},
		{
			name: "TwoPlayers_P2Wins_FourOfAKind",
			hands: []Card{
				// Player 1 (index 0): Full house
				NewCard(King, Spades),
				NewCard(King, Hearts),
				// Player 2 (index 1): Four of a kind
				NewCard(Ace, Spades),
				NewCard(Ace, Hearts),
			},
			board: []Card{
				NewCard(Ace, Diamonds),
				NewCard(Ace, Clubs),
				NewCard(King, Diamonds),
				NewCard(Two, Clubs),
				NewCard(Three, Spades),
			},
			want:    []int{1},
			wantErr: false,
		},
		{
			name: "TwoPlayers_BothHaveWheel_Chop",
			hands: []Card{
				// Player 1 (index 0): Uses wheel
				NewCard(Ace, Spades),
				NewCard(King, Hearts),
				// Player 2 (index 1): Uses wheel
				NewCard(Ace, Diamonds),
				NewCard(Queen, Clubs),
			},
			board: []Card{
				NewCard(Two, Hearts),
				NewCard(Three, Diamonds),
				NewCard(Four, Clubs),
				NewCard(Five, Spades),
				NewCard(Jack, Hearts),
			},
			want:    []int{0, 1},
			wantErr: false,
		},
		{
			name: "TwoPlayers_P2Wins_HigherStraight",
			hands: []Card{
				// Player 1 (index 0): Wheel straight (A-2-3-4-5)
				NewCard(Ace, Spades),
				NewCard(King, Hearts),
				// Player 2 (index 1): Six-high straight (2-3-4-5-6)
				NewCard(Six, Diamonds),
				NewCard(Queen, Clubs),
			},
			board: []Card{
				NewCard(Two, Hearts),
				NewCard(Three, Diamonds),
				NewCard(Four, Clubs),
				NewCard(Five, Spades),
				NewCard(Jack, Hearts),
			},
			want:    []int{1},
			wantErr: false,
		},
		{
			name: "TwoPlayers_P1Wins_BetterKicker",
			hands: []Card{
				// Player 1 (index 0): Pair of Kings with Ace kicker
				NewCard(King, Spades),
				NewCard(Ace, Hearts),
				// Player 2 (index 1): Pair of Kings with Queen kicker
				NewCard(King, Diamonds),
				NewCard(Queen, Clubs),
			},
			board: []Card{
				NewCard(King, Hearts),
				NewCard(Two, Diamonds),
				NewCard(Four, Clubs),
				NewCard(Six, Spades),
				NewCard(Eight, Hearts),
			},
			want:    []int{0},
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := getWinningPlayer(tt.hands, tt.board)
			
			// Check error cases
			if tt.wantErr {
				if err == nil {
					t.Errorf("getWinningPlayer() expected error containing %q, got nil", tt.errContains)
					return
				}
				if tt.errContains != "" && !contains(err.Error(), tt.errContains) {
					t.Errorf("getWinningPlayer() error = %v, want error containing %q", err, tt.errContains)
				}
				return
			}
			
			// Check non-error cases
			if err != nil {
				t.Errorf("getWinningPlayer() unexpected error = %v", err)
				return
			}
			
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("getWinningPlayer() = %v, want %v", got, tt.want)
				t.Logf("Hands: %v", tt.hands)
				t.Logf("Board: %v", tt.board)
			}
		})
	}
}

func TestGetWinningPlayer_EdgeCases(t *testing.T) {
	tests := []struct {
		name        string
		hands       []Card
		board       []Card
		want        []int
		wantErr     bool
		errContains string
	}{
		// ==================== BOUNDARY CASES ====================
		{
			name: "Edge_MinimumPlayers_TwoPlayers",
			hands: []Card{
				NewCard(Ace, Spades),
				NewCard(King, Hearts),
				NewCard(Queen, Diamonds),
				NewCard(Jack, Clubs),
			},
			board: []Card{
				NewCard(Two, Hearts),
				NewCard(Three, Diamonds),
				NewCard(Four, Clubs),
				NewCard(Five, Spades),
				NewCard(Six, Hearts),
			},
			want:    []int{0,1},
			wantErr: false,
		},
		{
			name: "Edge_MaximumPlayers_TenPlayers",
			hands: []Card{
				// P1
				NewCard(Two, Spades), NewCard(Three, Spades),
				// P2
				NewCard(Four, Hearts), NewCard(Five, Hearts),
				// P3
				NewCard(Six, Diamonds), NewCard(Seven, Diamonds),
				// P4
				NewCard(Eight, Clubs), NewCard(Nine, Clubs),
				// P5
				NewCard(Ten, Spades), NewCard(Jack, Spades),
				// P6
				NewCard(Queen, Hearts), NewCard(King, Hearts),
				// P7
				NewCard(Two, Hearts), NewCard(Three, Hearts),
				// P8
				NewCard(Four, Diamonds), NewCard(Five, Diamonds),
				// P9
				NewCard(Six, Clubs), NewCard(Seven, Clubs),
				// P10 - Winner with Ace
				NewCard(Ace, Spades), NewCard(King, Spades),
			},
			board: []Card{
				NewCard(Two, Diamonds),
				NewCard(Four, Spades),
				NewCard(Six, Spades),
				NewCard(Eight, Spades),
				NewCard(Ten, Hearts),
			},
			want:    []int{9},
			wantErr: false,
		},
		{
			name: "Edge_AllPlayersChop_IdenticalHands",
			hands: []Card{
				NewCard(Two, Spades), NewCard(Three, Hearts),
				NewCard(Two, Hearts), NewCard(Three, Diamonds),
				NewCard(Two, Diamonds), NewCard(Three, Clubs),
				NewCard(Two, Clubs), NewCard(Three, Spades),
			},
			board: []Card{
				NewCard(Ace, Spades),
				NewCard(Ace, Hearts),
				NewCard(Ace, Diamonds),
				NewCard(Ace, Clubs),
				NewCard(King, Hearts),
			},
			want:    []int{0, 1, 2, 3},
			wantErr: false,
		},

		// ==================== KICKER BATTLES ====================
		{
			name: "Edge_FiveKickerComparison_SameHand",
			hands: []Card{
				// P1: High card A-K-Q-J-9
				NewCard(Ace, Spades), NewCard(King, Hearts),
				// P2: High card A-K-Q-J-9 (identical)
				NewCard(Ace, Hearts), NewCard(King, Diamonds),
			},
			board: []Card{
				NewCard(Queen, Clubs),
				NewCard(Jack, Spades),
				NewCard(Nine, Hearts),
				NewCard(Eight, Diamonds),
				NewCard(Two, Clubs),
			},
			want:    []int{0,1},
			wantErr: false,
		},
		{
			name: "Edge_FourKickers_PairWithMultipleKickers",
			hands: []Card{
				// P1: Pair of 2s with A-K-Q kickers
				NewCard(Two, Spades), NewCard(Ace, Hearts),
				// P2: Pair of 2s with A-K-Q kickers (identical)
				NewCard(Two, Hearts), NewCard(Ace, Diamonds),
			},
			board: []Card{
				NewCard(Two, Diamonds),
				NewCard(King, Clubs),
				NewCard(Queen, Spades),
				NewCard(Jack, Hearts),
				NewCard(Three, Clubs),
			},
			want:    []int{0,1},
			wantErr: false,
		},
		{
			name: "Edge_ThreeKickers_TwoPairComparison",
			hands: []Card{
				// P1: KK & QQ with A kicker
				NewCard(King, Spades), NewCard(Ace, Hearts),
				// P2: KK & QQ with J kicker
				NewCard(King, Hearts), NewCard(Jack, Diamonds),
			},
			board: []Card{
				NewCard(King, Diamonds),
				NewCard(Queen, Clubs),
				NewCard(Queen, Spades),
				NewCard(Two, Hearts),
				NewCard(Three, Clubs),
			},
			want:    []int{0},
			wantErr: false,
		},
		{
			name: "Edge_TwoKickers_ThreeOfAKindComparison",
			hands: []Card{
				// P1: Three 5s with A-K kickers
				NewCard(Five, Spades), NewCard(Ace, Hearts),
				// P2: Three 5s with A-K kickers (identical)
				NewCard(Five, Hearts), NewCard(Ace, Diamonds),
			},
			board: []Card{
				NewCard(Five, Diamonds),
				NewCard(Five, Clubs),
				NewCard(King, Spades),
				NewCard(Queen, Hearts),
				NewCard(Two, Clubs),
			},
			want:    []int{0,1},
			wantErr: false,
		},
		{
			name: "Edge_OneKicker_FourOfAKindComparison",
			hands: []Card{
				// P1: Four 3s with A kicker
				NewCard(Three, Spades), NewCard(Ace, Hearts),
				// P2: Four 3s with K kicker
				NewCard(Three, Hearts), NewCard(King, Diamonds),
			},
			board: []Card{
				NewCard(Three, Diamonds),
				NewCard(Three, Clubs),
				NewCard(Two, Spades),
				NewCard(Four, Hearts),
				NewCard(Five, Clubs),
			},
			want:    []int{0},
			wantErr: false,
		},

		// ==================== STRAIGHT EDGE CASES ====================
		{
			name: "Edge_WheelStraight_AceAsOne",
			hands: []Card{
				NewCard(Ace, Spades), NewCard(Two, Hearts),
				NewCard(King, Diamonds), NewCard(Queen, Clubs),
			},
			board: []Card{
				NewCard(Three, Hearts),
				NewCard(Four, Diamonds),
				NewCard(Five, Clubs),
				NewCard(Jack, Spades),
				NewCard(Ten, Hearts),
			},
			want:    []int{0},
			wantErr: false,
		},
		{
			name: "Edge_BroadwayStraight_HighestStraight",
			hands: []Card{
				NewCard(Ace, Spades), NewCard(King, Hearts),
				NewCard(Nine, Diamonds), NewCard(Eight, Clubs),
			},
			board: []Card{
				NewCard(Queen, Hearts),
				NewCard(Jack, Diamonds),
				NewCard(Ten, Clubs),
				NewCard(Two, Spades),
				NewCard(Three, Hearts),
			},
			want:    []int{0},
			wantErr: false,
		},
		{
			name: "Edge_MiddleStraight_SevenHigh",
			hands: []Card{
				NewCard(Three, Spades), NewCard(Seven, Hearts),
				NewCard(Ace, Diamonds), NewCard(King, Clubs),
			},
			board: []Card{
				NewCard(Four, Hearts),
				NewCard(Five, Diamonds),
				NewCard(Six, Clubs),
				NewCard(Ten, Spades),
				NewCard(Jack, Hearts),
			},
			want:    []int{0},
			wantErr: false,
		},
		{
			name: "Edge_MultipleStraightPossibilities_UsesHighest",
			hands: []Card{
				// P1 can make 5-6-7-8-9 or 6-7-8-9-10
				NewCard(Nine, Spades), NewCard(Ten, Hearts),
				// P2 can only make 5-6-7-8-9
				NewCard(Nine, Diamonds), NewCard(Two, Clubs),
			},
			board: []Card{
				NewCard(Five, Hearts),
				NewCard(Six, Diamonds),
				NewCard(Seven, Clubs),
				NewCard(Eight, Spades),
				NewCard(Jack, Hearts),
			},
			want:    []int{0},
			wantErr: false,
		},
		{
			name: "Edge_AlmostStraight_FourToStraight",
			hands: []Card{
				// P1: Has 3-4-5-6 but missing connector
				NewCard(Three, Spades), NewCard(Six, Hearts),
				// P2: Has pair of 8s
				NewCard(Eight, Diamonds), NewCard(Eight, Clubs),
			},
			board: []Card{
				NewCard(Four, Hearts),
				NewCard(Five, Diamonds),
				NewCard(Nine, Clubs),
				NewCard(Jack, Spades),
				NewCard(King, Hearts),
			},
			want:    []int{1},
			wantErr: false,
		},

		// ==================== FLUSH EDGE CASES ====================
		{
			name: "Edge_MinimalFlush_FiveCards",
			hands: []Card{
				NewCard(Two, Hearts), NewCard(Three, Hearts),
				NewCard(Ace, Spades), NewCard(King, Spades),
			},
			board: []Card{
				NewCard(Four, Hearts),
				NewCard(Six, Hearts),
				NewCard(Eight, Hearts),
				NewCard(Ten, Diamonds),
				NewCard(Queen, Clubs),
			},
			want:    []int{0},
			wantErr: false,
		},
		{
			name: "Edge_SixCardFlush_UsesTopFive",
			hands: []Card{
				// P1: Can make 6-card heart flush, uses A-K-Q-J-10
				NewCard(Ace, Hearts), NewCard(King, Hearts),
				// P2: Only 5-card heart flush with lower cards
				NewCard(Nine, Hearts), NewCard(Eight, Hearts),
			},
			board: []Card{
				NewCard(Queen, Hearts),
				NewCard(Jack, Hearts),
				NewCard(Ten, Hearts),
				NewCard(Seven, Hearts),
				NewCard(Two, Spades),
			},
			want:    []int{0},
			wantErr: false,
		},
		{
			name: "Edge_SevenCardFlush_UsesTopFive",
			hands: []Card{
				NewCard(Ace, Spades), NewCard(King, Spades),
				NewCard(Two, Spades), NewCard(Three, Spades),
			},
			board: []Card{
				NewCard(Queen, Spades),
				NewCard(Jack, Spades),
				NewCard(Ten, Spades),
				NewCard(Nine, Spades),
				NewCard(Eight, Spades),
			},
			want:    []int{0},
			wantErr: false,
		},
		{
			name: "Edge_FlushKickerBattle_SameSuit",
			hands: []Card{
				// P1: Heart flush A-K-Q-J-9
				NewCard(Ace, Hearts), NewCard(Nine, Hearts),
				// P2: Heart flush A-K-Q-J-8
				NewCard(Ace, Diamonds), NewCard(Eight, Hearts),
			},
			board: []Card{
				NewCard(King, Hearts),
				NewCard(Queen, Hearts),
				NewCard(Jack, Hearts),
				NewCard(Seven, Hearts),
				NewCard(Two, Clubs),
			},
			want:    []int{0},
			wantErr: false,
		},
		{
			name: "Edge_CompetingFlushSuits_OnlyOneFlush",
			hands: []Card{
				// P1: Heart flush (A-K-Q-J-10)
				NewCard(Ace, Hearts), NewCard(King, Hearts),
				// P2: Two pair (Queens and Jacks, no flush - only 4 spades)
				NewCard(Ace, Spades), NewCard(King, Spades),
			},
			board: []Card{
				NewCard(Queen, Hearts),
				NewCard(Jack, Hearts),
				NewCard(Ten, Hearts),
				NewCard(Queen, Spades),
				NewCard(Jack, Spades),
			},
			want:    []int{0},
			wantErr: false,
		},

		// ==================== FULL HOUSE EDGE CASES ====================
		{
			name: "Edge_FullHouse_HigherTrips",
			hands: []Card{
				// P1: QQQ over KK
				NewCard(Queen, Spades), NewCard(Queen, Hearts),
				// P2: KKK over QQ
				NewCard(King, Diamonds), NewCard(King, Clubs),
			},
			board: []Card{
				NewCard(Queen, Diamonds),
				NewCard(King, Hearts),
				NewCard(King, Spades),
				NewCard(Two, Clubs),
				NewCard(Three, Hearts),
			},
			want:    []int{1},
			wantErr: false,
		},
		{
			name: "Edge_FullHouse_SameTrips_DifferentPair",
			hands: []Card{
				// P1: AAA over KK
				NewCard(Ace, Spades), NewCard(King, Hearts),
				// P2: AAA over QQ
				NewCard(Ace, Hearts), NewCard(Queen, Diamonds),
			},
			board: []Card{
				NewCard(Ace, Diamonds),
				NewCard(Ace, Clubs),
				NewCard(King, Diamonds),
				NewCard(Queen, Clubs),
				NewCard(Two, Spades),
			},
			want:    []int{0},
			wantErr: false,
		},
		{
			name: "Edge_FullHouse_ThreePairOnBoard",
			hands: []Card{
				// P1: Has Ace, makes AAA over KK
				NewCard(Ace, Spades), NewCard(Two, Hearts),
				// P2: Has King, makes KKK over AA
				NewCard(King, Diamonds), NewCard(Three, Clubs),
			},
			board: []Card{
				NewCard(Ace, Hearts),
				NewCard(Ace, Diamonds),
				NewCard(King, Hearts),
				NewCard(King, Clubs),
				NewCard(Queen, Spades),
			},
			want:    []int{0},
			wantErr: false,
		},
		{
			name: "Edge_FullHouse_vs_FourOfAKind",
			hands: []Card{
				// P1: Full house (888 over 55)
				NewCard(Eight, Spades), NewCard(Eight, Hearts),
				// P2: Four of a kind (5555)
				NewCard(Five, Diamonds), NewCard(Five, Clubs),
			},
			board: []Card{
				NewCard(Eight, Diamonds),
				NewCard(Five, Hearts),
				NewCard(Five, Spades),
				NewCard(King, Clubs),
				NewCard(Ace, Hearts),
			},
			want:    []int{1},
			wantErr: false,
		},

		// ==================== QUADS EDGE CASES ====================
		{
			name: "Edge_Quads_HigherQuads",
			hands: []Card{
				// P1: Four 5s
				NewCard(Five, Spades), NewCard(Five, Hearts),
				// P2: Four 6s
				NewCard(Six, Diamonds), NewCard(Six, Clubs),
			},
			board: []Card{
				NewCard(Five, Diamonds),
				NewCard(Five, Clubs),
				NewCard(Six, Hearts),
				NewCard(Six, Spades),
				NewCard(Ace, Hearts),
			},
			want:    []int{1},
			wantErr: false,
		},
		{
			name: "Edge_Quads_SameQuads_KickerMatters",
			hands: []Card{
				// P1: Four 7s with Ace kicker
				NewCard(Seven, Spades), NewCard(Ace, Hearts),
				// P2: Four 7s with King kicker
				NewCard(Seven, Hearts), NewCard(King, Diamonds),
			},
			board: []Card{
				NewCard(Seven, Diamonds),
				NewCard(Seven, Clubs),
				NewCard(Two, Spades),
				NewCard(Three, Hearts),
				NewCard(Four, Clubs),
			},
			want:    []int{0},
			wantErr: false,
		},
		{
			name: "Edge_Quads_OnBoard_PlayersChop",
			hands: []Card{
				NewCard(Ace, Spades), NewCard(King, Hearts),
				NewCard(Ace, Hearts), NewCard(King, Diamonds),
			},
			board: []Card{
				NewCard(Queen, Clubs),
				NewCard(Queen, Spades),
				NewCard(Queen, Hearts),
				NewCard(Queen, Diamonds),
				NewCard(Two, Spades),
			},
			want:    []int{0, 1},
			wantErr: false,
		},

		// ==================== STRAIGHT FLUSH EDGE CASES ====================
		{
			name: "Edge_StraightFlush_WheelStraightFlush",
			hands: []Card{
				// P1: Wheel straight flush (A-2-3-4-5 hearts)
				NewCard(Ace, Hearts), NewCard(Two, Hearts),
				// P2: Regular flush
				NewCard(King, Hearts), NewCard(Queen, Hearts),
			},
			board: []Card{
				NewCard(Three, Hearts),
				NewCard(Four, Hearts),
				NewCard(Five, Hearts),
				NewCard(Ten, Spades),
				NewCard(Jack, Diamonds),
			},
			want:    []int{0},
			wantErr: false,
		},
		{
			name: "Edge_StraightFlush_RoyalFlush",
			hands: []Card{
				// P1: Royal flush
				NewCard(Ace, Spades), NewCard(King, Spades),
				// P2: Lower straight flush
				NewCard(Nine, Spades), NewCard(Eight, Spades),
			},
			board: []Card{
				NewCard(Queen, Spades),
				NewCard(Jack, Spades),
				NewCard(Ten, Spades),
				NewCard(Two, Hearts),
				NewCard(Three, Diamonds),
			},
			want:    []int{0},
			wantErr: false,
		},
		{
			name: "Edge_StraightFlush_MiddleRange",
			hands: []Card{
				// P1: 5-6-7-8-9 straight flush
				NewCard(Five, Diamonds), NewCard(Nine, Diamonds),
				// P2: Four of a kind
				NewCard(King, Clubs), NewCard(King, Hearts),
			},
			board: []Card{
				NewCard(Six, Diamonds),
				NewCard(Seven, Diamonds),
				NewCard(Eight, Diamonds),
				NewCard(King, Spades),
				NewCard(King, Diamonds),
			},
			want:    []int{0},
			wantErr: false,
		},
		{
			name: "Edge_HighCard_KickerBattle",
			hands: []Card{
				// P1: High card K-Q-J-10-8
				NewCard(Five, Hearts), NewCard(Nine, Hearts),
				// P2: High card K-Q-J-10-8 (wins with better 5th kicker)
				NewCard(Six, Hearts), NewCard(Ten, Hearts),
			},
			board: []Card{
				NewCard(Seven, Hearts),
				NewCard(Eight, Hearts),
				NewCard(Jack, Diamonds),
				NewCard(Queen, Clubs),
				NewCard(King, Spades),
			},
			want:    []int{1},
			wantErr: false,
		},

		// ==================== COUNTERFEITING EDGE CASES ====================
		{
			name: "Edge_FourOfAKind_BeatsTopTwoPair",
			hands: []Card{
				// P1: Four 5s (5♠ 5♥ 5♦ 5♣)
				NewCard(Five, Spades), NewCard(Five, Hearts),
				// P2: Two pair (Aces and Kings)
				NewCard(Ace, Diamonds), NewCard(King, Clubs),
			},
			board: []Card{
				NewCard(Five, Diamonds),
				NewCard(Five, Clubs),
				NewCard(Ace, Hearts),
				NewCard(King, Spades),
				NewCard(Queen, Hearts),
			},
			want:    []int{0},
			wantErr: false,
		},
		{
			name: "Edge_Counterfeited_TwoPairBecomesOnePair",
			hands: []Card{
				// P1: 33 & 44 (board makes 44, so only trips 4s with pair 3s)
				NewCard(Three, Spades), NewCard(Three, Hearts),
				// P2: AA & 44 (board makes 44, so trips 4s with pair As)
				NewCard(Ace, Diamonds), NewCard(Ace, Clubs),
			},
			board: []Card{
				NewCard(Four, Hearts),
				NewCard(Four, Diamonds),
				NewCard(Four, Clubs),
				NewCard(Two, Spades),
				NewCard(King, Hearts),
			},
			want:    []int{1},
			wantErr: false,
		},

		// ==================== BOARD PLAYS ====================
		{
			name: "Edge_BoardPlays_StraightFlushOnBoard",
			hands: []Card{
				NewCard(Two, Clubs), NewCard(Three, Diamonds),
				NewCard(Four, Spades), NewCard(Five, Hearts),
			},
			board: []Card{
				NewCard(Ten, Hearts),
				NewCard(Jack, Hearts),
				NewCard(Queen, Hearts),
				NewCard(King, Hearts),
				NewCard(Ace, Hearts),
			},
			want:    []int{0, 1},
			wantErr: false,
		},
		{
			name: "Edge_BoardPlays_QuadsOnBoard",
			hands: []Card{
				NewCard(Ace, Spades), NewCard(Two, Hearts),
				NewCard(King, Diamonds), NewCard(Three, Clubs),
			},
			board: []Card{
				NewCard(Queen, Hearts),
				NewCard(Queen, Diamonds),
				NewCard(Queen, Clubs),
				NewCard(Queen, Spades),
				NewCard(Jack, Hearts),
			},
			want:    []int{0},
			wantErr: false,
		},
		{
			name: "Edge_BoardPlays_FullHouseOnBoard",
			hands: []Card{
				NewCard(Two, Spades), NewCard(Three, Hearts),
				NewCard(Four, Diamonds), NewCard(Five, Clubs),
			},
			board: []Card{
				NewCard(King, Hearts),
				NewCard(King, Diamonds),
				NewCard(King, Clubs),
				NewCard(Ace, Spades),
				NewCard(Ace, Hearts),
			},
			want:    []int{0, 1},
			wantErr: false,
		},

		// ==================== COMPLEX MULTI-WAY POTS ====================
		{
			name: "Edge_ThreeWayChop_SameStraight",
			hands: []Card{
				NewCard(Nine, Spades), NewCard(Two, Hearts),
				NewCard(Nine, Diamonds), NewCard(Three, Clubs),
				NewCard(Nine, Hearts), NewCard(Four, Spades),
			},
			board: []Card{
				NewCard(Five, Hearts),
				NewCard(Six, Diamonds),
				NewCard(Seven, Clubs),
				NewCard(Eight, Spades),
				NewCard(King, Hearts),
			},
			want:    []int{0, 1, 2},
			wantErr: false,
		},
		{
			name: "Edge_FourWayChop_BoardPlays",
			hands: []Card{
				NewCard(Two, Spades), NewCard(Three, Spades),
				NewCard(Two, Hearts), NewCard(Three, Hearts),
				NewCard(Two, Diamonds), NewCard(Three, Diamonds),
				NewCard(Two, Clubs), NewCard(Three, Clubs),
			},
			board: []Card{
				NewCard(Ace, Spades),
				NewCard(Ace, Hearts),
				NewCard(Ace, Diamonds),
				NewCard(Ace, Clubs),
				NewCard(King, Spades),
			},
			want:    []int{0, 1, 2, 3},
			wantErr: false,
		},
		{
			name: "Edge_SixPlayers_MultipleWinners",
			hands: []Card{
				// P1 & P2: Make nut straight
				NewCard(Ace, Spades), NewCard(Two, Hearts),
				NewCard(Ace, Hearts), NewCard(Three, Diamonds),
				// P3 & P4: Make lower straight
				NewCard(Nine, Clubs), NewCard(Eight, Spades),
				NewCard(Nine, Hearts), NewCard(Eight, Diamonds),
				// P5 & P6: Only high card
				NewCard(King, Diamonds), NewCard(Queen, Clubs),
				NewCard(King, Hearts), NewCard(Queen, Spades),
			},
			board: []Card{
				NewCard(Ten, Hearts),
				NewCard(Jack, Diamonds),
				NewCard(Queen, Hearts),
				NewCard(King, Clubs),
				NewCard(Four, Spades),
			},
			want:    []int{0, 1},
			wantErr: false,
		},

		// ==================== PAIRING BOARD ====================
		{
			name: "Edge_PairedBoard_DoesNotMakeFullHouse",
			hands: []Card{
				// P1: Has Ace but board pair doesn't help
				NewCard(Ace, Spades), NewCard(King, Hearts),
				// P2: Makes trips with the pair
				NewCard(Queen, Diamonds), NewCard(Queen, Clubs),
			},
			board: []Card{
				NewCard(Queen, Hearts),
				NewCard(Two, Diamonds),
				NewCard(Two, Clubs),
				NewCard(Five, Spades),
				NewCard(Seven, Hearts),
			},
			want:    []int{1},
			wantErr: false,
		},
		{
			name: "Edge_TripsOnBoard_KickerBattle",
			hands: []Card{
				NewCard(Ace, Spades), NewCard(King, Hearts),
				NewCard(Ace, Hearts), NewCard(Queen, Diamonds),
			},
			board: []Card{
				NewCard(Jack, Clubs),
				NewCard(Jack, Spades),
				NewCard(Jack, Hearts),
				NewCard(Two, Diamonds),
				NewCard(Three, Clubs),
			},
			want:    []int{0},
			wantErr: false,
		},

		// ==================== UNUSUAL HAND RANKINGS ====================
		{
			name: "Edge_WorstPossibleHand_SevenHighNothing",
			hands: []Card{
				// P1: 7-5-4-3-2 (worst possible hand)
				NewCard(Seven, Spades), NewCard(Five, Hearts),
				// P2: 7-6-4-3-2 (slightly better)
				NewCard(Seven, Diamonds), NewCard(Six, Clubs),
			},
			board: []Card{
				NewCard(Four, Hearts),
				NewCard(Three, Diamonds),
				NewCard(Two, Clubs),
				NewCard(Eight, Spades),
				NewCard(Nine, Hearts),
			},
			want:    []int{1},
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := getWinningPlayer(tt.hands, tt.board)

			// Check error cases
			if tt.wantErr {
				if err == nil {
					t.Errorf("getWinningPlayer() expected error containing %q, got nil", tt.errContains)
					return
				}
				if tt.errContains != "" && !contains(err.Error(), tt.errContains) {
					t.Errorf("getWinningPlayer() error = %v, want error containing %q", err, tt.errContains)
				}
				return
			}

			// Check non-error cases
			if err != nil {
				t.Errorf("getWinningPlayer() unexpected error = %v", err)
				return
			}

			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("getWinningPlayer() = %v, want %v", got, tt.want)
				t.Logf("Hands: %v", tt.hands)
				t.Logf("Board: %v", tt.board)
			}
		})
	}
}


// Helper function to check if a string contains a substring
func contains(s, substr string) bool {
	return len(s) >= len(substr) && (s == substr || len(substr) == 0 || 
		(len(s) > 0 && len(substr) > 0 && indexOf(s, substr) >= 0))
}

func indexOf(s, substr string) int {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return i
		}
	}
	return -1
}
