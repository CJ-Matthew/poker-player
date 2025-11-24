package util

import "testing"

func TestBeats(t *testing.T) {
	tests := []struct {
		name string
		p1   []Card
		p2   []Card
		hr   HandRank
		want string
	}{
		// HighCard cases
		{
			name: "HighCard_P1_AceHigh_Wins",
			p1: []Card{
				NewCard(Ace, Spades),
				NewCard(King, Hearts),
				NewCard(Queen, Diamonds),
				NewCard(Jack, Clubs),
				NewCard(Nine, Spades),
			},
			p2: []Card{
				NewCard(King, Spades),
				NewCard(Queen, Hearts),
				NewCard(Jack, Diamonds),
				NewCard(Ten, Clubs),
				NewCard(Nine, Hearts),
			},
			hr:   HighCard,
			want: "TRUE",
		},
		{
			name: "HighCard_P2_AceHigh_Wins",
			p1: []Card{
				NewCard(King, Spades),
				NewCard(Queen, Hearts),
				NewCard(Jack, Diamonds),
				NewCard(Ten, Clubs),
				NewCard(Nine, Hearts),
			},
			p2: []Card{
				NewCard(Ace, Spades),
				NewCard(King, Hearts),
				NewCard(Queen, Diamonds),
				NewCard(Jack, Clubs),
				NewCard(Nine, Spades),
			},
			hr:   HighCard,
			want: "FALSE",
		},
		{
			name: "HighCard_SameTopCard_SecondKickerWins",
			p1: []Card{
				NewCard(Ace, Spades),
				NewCard(King, Hearts),
				NewCard(Eight, Diamonds),
				NewCard(Six, Clubs),
				NewCard(Four, Spades),
			},
			p2: []Card{
				NewCard(Ace, Hearts),
				NewCard(Queen, Diamonds),
				NewCard(Jack, Clubs),
				NewCard(Ten, Hearts),
				NewCard(Nine, Spades),
			},
			hr:   HighCard,
			want: "TRUE",
		},
		{
			name: "HighCard_Chop",
			p1: []Card{
				NewCard(Ace, Spades),
				NewCard(King, Hearts),
				NewCard(Queen, Diamonds),
				NewCard(Jack, Clubs),
				NewCard(Nine, Spades),
			},
			p2: []Card{
				NewCard(Ace, Hearts),
				NewCard(King, Diamonds),
				NewCard(Queen, Clubs),
				NewCard(Jack, Hearts),
				NewCard(Nine, Diamonds),
			},
			hr:   HighCard,
			want: "CHOP",
		},

		// OnePair cases
		{
			name: "OnePair_HigherPair_Wins",
			p1: []Card{
				NewCard(Ace, Spades),
				NewCard(Ace, Hearts),
				NewCard(King, Diamonds),
				NewCard(Queen, Clubs),
				NewCard(Jack, Spades),
			},
			p2: []Card{
				NewCard(King, Hearts),
				NewCard(King, Diamonds),
				NewCard(Ace, Clubs),
				NewCard(Queen, Hearts),
				NewCard(Jack, Diamonds),
			},
			hr:   OnePair,
			want: "TRUE",
		},
		{
			name: "OnePair_LowerPair_Loses",
			p1: []Card{
				NewCard(Two, Spades),
				NewCard(Two, Hearts),
				NewCard(Ace, Diamonds),
				NewCard(King, Clubs),
				NewCard(Queen, Spades),
			},
			p2: []Card{
				NewCard(Three, Hearts),
				NewCard(Three, Diamonds),
				NewCard(Ace, Clubs),
				NewCard(King, Hearts),
				NewCard(Queen, Diamonds),
			},
			hr:   OnePair,
			want: "FALSE",
		},
		{
			name: "OnePair_SamePair_HigherKicker",
			p1: []Card{
				NewCard(King, Spades),
				NewCard(King, Hearts),
				NewCard(Ace, Diamonds),
				NewCard(Queen, Clubs),
				NewCard(Jack, Spades),
			},
			p2: []Card{
				NewCard(King, Diamonds),
				NewCard(King, Clubs),
				NewCard(Queen, Hearts),
				NewCard(Jack, Diamonds),
				NewCard(Ten, Hearts),
			},
			hr:   OnePair,
			want: "TRUE",
		},
		{
			name: "OnePair_SamePair_Chop",
			p1: []Card{
				NewCard(King, Spades),
				NewCard(King, Hearts),
				NewCard(Ace, Diamonds),
				NewCard(Queen, Clubs),
				NewCard(Jack, Spades),
			},
			p2: []Card{
				NewCard(King, Diamonds),
				NewCard(King, Clubs),
				NewCard(Ace, Hearts),
				NewCard(Queen, Hearts),
				NewCard(Jack, Diamonds),
			},
			hr:   OnePair,
			want: "CHOP",
		},

		// TwoPair cases
		{
			name: "TwoPair_HigherTopPair_Wins",
			p1: []Card{
				NewCard(Ace, Spades),
				NewCard(Ace, Hearts),
				NewCard(King, Diamonds),
				NewCard(King, Clubs),
				NewCard(Queen, Spades),
			},
			p2: []Card{
				NewCard(King, Hearts),
				NewCard(King, Spades),
				NewCard(Queen, Diamonds),
				NewCard(Queen, Clubs),
				NewCard(Ace, Clubs),
			},
			hr:   TwoPair,
			want: "TRUE",
		},
		{
			name: "TwoPair_SameTopPair_HigherBottomPair",
			p1: []Card{
				NewCard(Ace, Spades),
				NewCard(Ace, Hearts),
				NewCard(King, Diamonds),
				NewCard(King, Clubs),
				NewCard(Two, Spades),
			},
			p2: []Card{
				NewCard(Ace, Diamonds),
				NewCard(Ace, Clubs),
				NewCard(Queen, Hearts),
				NewCard(Queen, Spades),
				NewCard(Jack, Diamonds),
			},
			hr:   TwoPair,
			want: "TRUE",
		},
		{
			name: "TwoPair_SamePairs_HigherKicker",
			p1: []Card{
				NewCard(Ace, Spades),
				NewCard(Ace, Hearts),
				NewCard(King, Diamonds),
				NewCard(King, Clubs),
				NewCard(Queen, Spades),
			},
			p2: []Card{
				NewCard(Ace, Diamonds),
				NewCard(Ace, Clubs),
				NewCard(King, Hearts),
				NewCard(King, Spades),
				NewCard(Jack, Diamonds),
			},
			hr:   TwoPair,
			want: "TRUE",
		},
		{
			name: "TwoPair_Chop",
			p1: []Card{
				NewCard(Ace, Spades),
				NewCard(Ace, Hearts),
				NewCard(King, Diamonds),
				NewCard(King, Clubs),
				NewCard(Queen, Spades),
			},
			p2: []Card{
				NewCard(Ace, Diamonds),
				NewCard(Ace, Clubs),
				NewCard(King, Hearts),
				NewCard(King, Spades),
				NewCard(Queen, Diamonds),
			},
			hr:   TwoPair,
			want: "CHOP",
		},

		// ThreeOfAKind cases
		{
			name: "ThreeOfAKind_HigherTrips_Wins",
			p1: []Card{
				NewCard(Ace, Spades),
				NewCard(Ace, Hearts),
				NewCard(Ace, Diamonds),
				NewCard(King, Clubs),
				NewCard(Queen, Spades),
			},
			p2: []Card{
				NewCard(King, Hearts),
				NewCard(King, Diamonds),
				NewCard(King, Clubs),
				NewCard(Ace, Clubs),
				NewCard(Queen, Diamonds),
			},
			hr:   ThreeOfAKind,
			want: "TRUE",
		},
		{
			name: "ThreeOfAKind_LowerTrips_Loses",
			p1: []Card{
				NewCard(Two, Spades),
				NewCard(Two, Hearts),
				NewCard(Two, Diamonds),
				NewCard(Ace, Clubs),
				NewCard(King, Spades),
			},
			p2: []Card{
				NewCard(Three, Hearts),
				NewCard(Three, Diamonds),
				NewCard(Three, Clubs),
				NewCard(Ace, Spades),
				NewCard(King, Diamonds),
			},
			hr:   ThreeOfAKind,
			want: "FALSE",
		},

		// Straight cases
		{
			name: "Straight_HigherTop_Wins",
			p1: []Card{
				NewCard(Ten, Spades),
				NewCard(Jack, Hearts),
				NewCard(Queen, Diamonds),
				NewCard(King, Clubs),
				NewCard(Ace, Spades),
			},
			p2: []Card{
				NewCard(Nine, Hearts),
				NewCard(Ten, Diamonds),
				NewCard(Jack, Clubs),
				NewCard(Queen, Hearts),
				NewCard(King, Diamonds),
			},
			hr:   Straight,
			want: "TRUE",
		},
		{
			name: "Straight_WheelVsFiveStraight",
			p1: []Card{
				NewCard(Ace, Spades),
				NewCard(Two, Hearts),
				NewCard(Three, Diamonds),
				NewCard(Four, Clubs),
				NewCard(Five, Spades),
			},
			p2: []Card{
				NewCard(Two, Clubs),
				NewCard(Three, Hearts),
				NewCard(Four, Diamonds),
				NewCard(Five, Clubs),
				NewCard(Six, Hearts),
			},
			hr:   Straight,
			want: "FALSE",
		},
		{
			name: "Straight_Chop",
			p1: []Card{
				NewCard(Five, Spades),
				NewCard(Six, Hearts),
				NewCard(Seven, Diamonds),
				NewCard(Eight, Clubs),
				NewCard(Nine, Spades),
			},
			p2: []Card{
				NewCard(Five, Hearts),
				NewCard(Six, Diamonds),
				NewCard(Seven, Clubs),
				NewCard(Eight, Hearts),
				NewCard(Nine, Diamonds),
			},
			hr:   Straight,
			want: "CHOP",
		},

		// Flush cases
		{
			name: "Flush_HigherTopCard_Wins",
			p1: []Card{
				NewCard(Ace, Spades),
				NewCard(King, Spades),
				NewCard(Queen, Spades),
				NewCard(Jack, Spades),
				NewCard(Nine, Spades),
			},
			p2: []Card{
				NewCard(King, Hearts),
				NewCard(Queen, Hearts),
				NewCard(Jack, Hearts),
				NewCard(Ten, Hearts),
				NewCard(Eight, Hearts),
			},
			hr:   Flush,
			want: "TRUE",
		},
		{
			name: "Flush_SameTopCard_SecondKicker",
			p1: []Card{
				NewCard(Ace, Spades),
				NewCard(King, Spades),
				NewCard(Eight, Spades),
				NewCard(Six, Spades),
				NewCard(Four, Spades),
			},
			p2: []Card{
				NewCard(Ace, Hearts),
				NewCard(Queen, Hearts),
				NewCard(Jack, Hearts),
				NewCard(Ten, Hearts),
				NewCard(Nine, Hearts),
			},
			hr:   Flush,
			want: "TRUE",
		},
		{
			name: "Flush_Chop",
			p1: []Card{
				NewCard(Ace, Spades),
				NewCard(King, Spades),
				NewCard(Queen, Spades),
				NewCard(Jack, Spades),
				NewCard(Nine, Spades),
			},
			p2: []Card{
				NewCard(Ace, Hearts),
				NewCard(King, Hearts),
				NewCard(Queen, Hearts),
				NewCard(Jack, Hearts),
				NewCard(Nine, Hearts),
			},
			hr:   Flush,
			want: "CHOP",
		},

		// FullHouse cases
		{
			name: "FullHouse_HigherTrips_Wins",
			p1: []Card{
				NewCard(Ace, Spades),
				NewCard(Ace, Hearts),
				NewCard(Ace, Diamonds),
				NewCard(King, Clubs),
				NewCard(King, Spades),
			},
			p2: []Card{
				NewCard(King, Hearts),
				NewCard(King, Diamonds),
				NewCard(King, Spades),
				NewCard(Ace, Clubs),
				NewCard(Ace, Hearts),
			},
			hr:   FullHouse,
			want: "TRUE",
		},
		{
			name: "FullHouse_LowerTrips_Loses",
			p1: []Card{
				NewCard(Two, Spades),
				NewCard(Two, Hearts),
				NewCard(Two, Diamonds),
				NewCard(Ace, Clubs),
				NewCard(Ace, Spades),
			},
			p2: []Card{
				NewCard(Three, Hearts),
				NewCard(Three, Diamonds),
				NewCard(Three, Clubs),
				NewCard(Two, Clubs),
				NewCard(Two, Hearts),
			},
			hr:   FullHouse,
			want: "FALSE",
		},

		// FourOfAKind cases
		{
			name: "FourOfAKind_HigherQuads_Wins",
			p1: []Card{
				NewCard(Ace, Spades),
				NewCard(Ace, Hearts),
				NewCard(Ace, Diamonds),
				NewCard(Ace, Clubs),
				NewCard(King, Spades),
			},
			p2: []Card{
				NewCard(King, Hearts),
				NewCard(King, Diamonds),
				NewCard(King, Clubs),
				NewCard(King, Spades),
				NewCard(Ace, Hearts),
			},
			hr:   FourOfAKind,
			want: "TRUE",
		},
		{
			name: "FourOfAKind_LowerQuads_Loses",
			p1: []Card{
				NewCard(Two, Spades),
				NewCard(Two, Hearts),
				NewCard(Two, Diamonds),
				NewCard(Two, Clubs),
				NewCard(Ace, Spades),
			},
			p2: []Card{
				NewCard(Three, Hearts),
				NewCard(Three, Diamonds),
				NewCard(Three, Clubs),
				NewCard(Three, Spades),
				NewCard(Two, Hearts),
			},
			hr:   FourOfAKind,
			want: "FALSE",
		},

		// StraightFlush cases
		{
			name: "StraightFlush_HigherTop_Wins",
			p1: []Card{
				NewCard(Ten, Spades),
				NewCard(Jack, Spades),
				NewCard(Queen, Spades),
				NewCard(King, Spades),
				NewCard(Ace, Spades),
			},
			p2: []Card{
				NewCard(Nine, Hearts),
				NewCard(Ten, Hearts),
				NewCard(Jack, Hearts),
				NewCard(Queen, Hearts),
				NewCard(King, Hearts),
			},
			hr:   StraightFlush,
			want: "TRUE",
		},
		{
			name: "StraightFlush_WheelVsFiveStraight",
			p1: []Card{
				NewCard(Ace, Spades),
				NewCard(Two, Spades),
				NewCard(Three, Spades),
				NewCard(Four, Spades),
				NewCard(Five, Spades),
			},
			p2: []Card{
				NewCard(Two, Hearts),
				NewCard(Three, Hearts),
				NewCard(Four, Hearts),
				NewCard(Five, Hearts),
				NewCard(Six, Hearts),
			},
			hr:   StraightFlush,
			want: "FALSE",
		},
		{
			name: "StraightFlush_Chop",
			p1: []Card{
				NewCard(Five, Spades),
				NewCard(Six, Spades),
				NewCard(Seven, Spades),
				NewCard(Eight, Spades),
				NewCard(Nine, Spades),
			},
			p2: []Card{
				NewCard(Five, Hearts),
				NewCard(Six, Hearts),
				NewCard(Seven, Hearts),
				NewCard(Eight, Hearts),
				NewCard(Nine, Hearts),
			},
			hr:   StraightFlush,
			want: "CHOP",
		},

		// RoyalFlush cases
		{
			name: "RoyalFlush_AlwaysChop",
			p1: []Card{
				NewCard(Ten, Spades),
				NewCard(Jack, Spades),
				NewCard(Queen, Spades),
				NewCard(King, Spades),
				NewCard(Ace, Spades),
			},
			p2: []Card{
				NewCard(Ten, Hearts),
				NewCard(Jack, Hearts),
				NewCard(Queen, Hearts),
				NewCard(King, Hearts),
				NewCard(Ace, Hearts),
			},
			hr:   RoyalFlush,
			want: "CHOP",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := beats(tt.p1, tt.p2, tt.hr)
			if got != tt.want {
				t.Errorf("beats() = %v, want %v\nP1: %v\nP2: %v\nHandRank: %v",
					got, tt.want, tt.p1, tt.p2, tt.hr)
			}
		})
	}
}
