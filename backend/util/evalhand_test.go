package util

import "testing"

func TestEvalHand(t *testing.T) {
    tests := []struct {
        name string
        hand []Card
        want HandRank
    }{
        {
            name: "RoyalFlush",
            hand: []Card{
                NewCard(Ten, Spades),
                NewCard(Jack, Spades),
                NewCard(Queen, Spades),
                NewCard(King, Spades),
                NewCard(Ace, Spades),
            },
            want: RoyalFlush,
        },
        {
            name: "StraightFlush",
            hand: []Card{
                NewCard(Six, Hearts),
                NewCard(Seven, Hearts),
                NewCard(Eight, Hearts),
                NewCard(Nine, Hearts),
                NewCard(Ten, Hearts),
            },
            want: StraightFlush,
        },
        {
            name: "StraightFlushLowEnd",
            hand: []Card{
                NewCard(Two, Diamonds),
                NewCard(Three, Diamonds),
                NewCard(Four, Diamonds),
                NewCard(Five, Diamonds),
                NewCard(Six, Diamonds),
            },
            want: StraightFlush,
        },
        {
            name: "StraightFlushWheel",
            hand: []Card{
                NewCard(Ace, Clubs),
                NewCard(Two, Clubs),
                NewCard(Three, Clubs),
                NewCard(Four, Clubs),
                NewCard(Five, Clubs),
            },
            want: StraightFlush,
        },
        {
            name: "FourOfAKind",
            hand: []Card{
                NewCard(Ace, Spades),
                NewCard(Ace, Hearts),
                NewCard(Ace, Diamonds),
                NewCard(Ace, Clubs),
                NewCard(Two, Hearts),
            },
            want: FourOfAKind,
        },
        {
            name: "FourOfAKindLowCards",
            hand: []Card{
                NewCard(Two, Spades),
                NewCard(Two, Hearts),
                NewCard(Two, Diamonds),
                NewCard(Two, Clubs),
                NewCard(King, Hearts),
            },
            want: FourOfAKind,
        },
        {
            name: "FourOfAKindMixedOrder",
            hand: []Card{
                NewCard(Three, Hearts),
                NewCard(Ace, Clubs),
                NewCard(Three, Spades),
                NewCard(Three, Diamonds),
                NewCard(Three, Clubs),
            },
            want: FourOfAKind,
        },
        {
            name: "FullHouse",
            hand: []Card{
                NewCard(King, Spades),
                NewCard(King, Hearts),
                NewCard(King, Diamonds),
                NewCard(Four, Clubs),
                NewCard(Four, Hearts),
            },
            want: FullHouse,
        },
        {
            name: "FullHouseLowTrips",
            hand: []Card{
                NewCard(Two, Spades),
                NewCard(Two, Hearts),
                NewCard(Two, Diamonds),
                NewCard(Ace, Clubs),
                NewCard(Ace, Hearts),
            },
            want: FullHouse,
        },
        {
            name: "FullHouseAcesOverKings",
            hand: []Card{
                NewCard(Ace, Spades),
                NewCard(Ace, Hearts),
                NewCard(Ace, Diamonds),
                NewCard(King, Clubs),
                NewCard(King, Hearts),
            },
            want: FullHouse,
        },
        {
            name: "FullHouseKingsOverAces",
            hand: []Card{
                NewCard(King, Spades),
                NewCard(King, Hearts),
                NewCard(King, Diamonds),
                NewCard(Ace, Clubs),
                NewCard(Ace, Hearts),
            },
            want: FullHouse,
        },
        {
            name: "Flush",
            hand: []Card{
                NewCard(Two, Clubs),
                NewCard(Five, Clubs),
                NewCard(Nine, Clubs),
                NewCard(Jack, Clubs),
                NewCard(King, Clubs),
            },
            want: Flush,
        },
        {
            name: "FlushNonStraight",
            hand: []Card{
                NewCard(Two, Clubs),
                NewCard(Four, Clubs),
                NewCard(Six, Clubs),
                NewCard(Nine, Clubs),
                NewCard(Jack, Clubs),
            },
            want: Flush,
        },
        {
            name: "FlushWithAce",
            hand: []Card{
                NewCard(Ace, Hearts),
                NewCard(King, Hearts),
                NewCard(Ten, Hearts),
                NewCard(Seven, Hearts),
                NewCard(Two, Hearts),
            },
            want: Flush,
        },
        {
            name: "FlushAllLowCards",
            hand: []Card{
                NewCard(Two, Spades),
                NewCard(Three, Spades),
                NewCard(Five, Spades),
                NewCard(Seven, Spades),
                NewCard(Nine, Spades),
            },
            want: Flush,
        },
        {
            name: "Straight",
            hand: []Card{
                NewCard(Three, Spades),
                NewCard(Four, Hearts),
                NewCard(Five, Diamonds),
                NewCard(Six, Clubs),
                NewCard(Seven, Spades),
            },
            want: Straight,
        },
        {
            name: "StraightHighEnd",
            hand: []Card{
                NewCard(Ten, Spades),
                NewCard(Jack, Hearts),
                NewCard(Queen, Diamonds),
                NewCard(King, Clubs),
                NewCard(Ace, Spades),
            },
            want: Straight,
        },
        {
            name: "WheelStraight",
            hand: []Card{
                NewCard(Ace, Spades),
                NewCard(Two, Hearts),
                NewCard(Three, Diamonds),
                NewCard(Four, Clubs),
                NewCard(Five, Spades),
            },
            want: Straight,
        },
        {
            name: "UnsortedStraight",
            hand: []Card{
                NewCard(Seven, Hearts),
                NewCard(Five, Diamonds),
                NewCard(Six, Clubs),
                NewCard(Four, Spades),
                NewCard(Three, Hearts),
            },
            want: Straight,
        },
        {
            name: "StraightMidRange",
            hand: []Card{
                NewCard(Five, Hearts),
                NewCard(Six, Diamonds),
                NewCard(Seven, Clubs),
                NewCard(Eight, Spades),
                NewCard(Nine, Hearts),
            },
            want: Straight,
        },
        {
            name: "ThreeOfAKind",
            hand: []Card{
                NewCard(Seven, Spades),
                NewCard(Seven, Hearts),
                NewCard(Seven, Diamonds),
                NewCard(Two, Clubs),
                NewCard(Nine, Spades),
            },
            want: ThreeOfAKind,
        },
        {
            name: "ThreeOfAKindAces",
            hand: []Card{
                NewCard(Ace, Spades),
                NewCard(Ace, Hearts),
                NewCard(Ace, Diamonds),
                NewCard(King, Clubs),
                NewCard(Queen, Spades),
            },
            want: ThreeOfAKind,
        },
        {
            name: "ThreeOfAKindTwos",
            hand: []Card{
                NewCard(Two, Spades),
                NewCard(Two, Hearts),
                NewCard(Two, Diamonds),
                NewCard(Jack, Clubs),
                NewCard(Four, Spades),
            },
            want: ThreeOfAKind,
        },
        {
            name: "TwoPair",
            hand: []Card{
                NewCard(Eight, Spades),
                NewCard(Eight, Hearts),
                NewCard(Three, Diamonds),
                NewCard(Three, Clubs),
                NewCard(Ace, Hearts),
            },
            want: TwoPair,
        },
        {
            name: "TwoPairSeparated",
            hand: []Card{
                NewCard(Nine, Spades),
                NewCard(Three, Hearts),
                NewCard(Nine, Diamonds),
                NewCard(Three, Clubs),
                NewCard(King, Hearts),
            },
            want: TwoPair,
        },
        {
            name: "TwoPairHighCards",
            hand: []Card{
                NewCard(Ace, Spades),
                NewCard(Ace, Hearts),
                NewCard(King, Diamonds),
                NewCard(King, Clubs),
                NewCard(Queen, Hearts),
            },
            want: TwoPair,
        },
        {
            name: "TwoPairLowCards",
            hand: []Card{
                NewCard(Three, Spades),
                NewCard(Three, Hearts),
                NewCard(Two, Diamonds),
                NewCard(Two, Clubs),
                NewCard(Ace, Hearts),
            },
            want: TwoPair,
        },
        {
            name: "OnePair",
            hand: []Card{
                NewCard(Four, Spades),
                NewCard(Four, Hearts),
                NewCard(Seven, Diamonds),
                NewCard(Nine, Clubs),
                NewCard(Jack, Hearts),
            },
            want: OnePair,
        },
        {
            name: "OnePairWithKickers",
            hand: []Card{
                NewCard(Queen, Hearts),
                NewCard(Queen, Diamonds),
                NewCard(Ace, Spades),
                NewCard(Ten, Clubs),
                NewCard(Four, Hearts),
            },
            want: OnePair,
        },
        {
            name: "OnePairAces",
            hand: []Card{
                NewCard(Ace, Spades),
                NewCard(Ace, Hearts),
                NewCard(King, Diamonds),
                NewCard(Queen, Clubs),
                NewCard(Jack, Hearts),
            },
            want: OnePair,
        },
        {
            name: "OnePairTwos",
            hand: []Card{
                NewCard(Two, Spades),
                NewCard(Two, Hearts),
                NewCard(Ace, Diamonds),
                NewCard(King, Clubs),
                NewCard(Queen, Hearts),
            },
            want: OnePair,
        },
        {
            name: "HighCard",
            hand: []Card{
                NewCard(Two, Spades),
                NewCard(Five, Hearts),
                NewCard(Nine, Diamonds),
                NewCard(Jack, Clubs),
                NewCard(Ace, Hearts),
            },
            want: HighCard,
        },
        {
            name: "HighCardNoAce",
            hand: []Card{
                NewCard(Two, Spades),
                NewCard(Four, Hearts),
                NewCard(Seven, Diamonds),
                NewCard(Nine, Clubs),
                NewCard(King, Hearts),
            },
            want: HighCard,
        },
        {
            name: "HighCardAllLow",
            hand: []Card{
                NewCard(Two, Spades),
                NewCard(Three, Hearts),
                NewCard(Five, Diamonds),
                NewCard(Seven, Clubs),
                NewCard(Nine, Hearts),
            },
            want: HighCard,
        },
        {
            name: "HighCardMixedSuits",
            hand: []Card{
                NewCard(Ten, Spades),
                NewCard(Jack, Hearts),
                NewCard(King, Diamonds),
                NewCard(Three, Clubs),
                NewCard(Five, Hearts),
            },
            want: HighCard,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            got := evalHand(tt.hand)
            if got != tt.want {
                t.Fatalf("%s: evalHand = %v, want %v", tt.name, got, tt.want)
            }
        })
    }
}

func TestEvalHandPartial(t *testing.T) {
    tests := []struct {
        name string
        hand []Card
        want HandRank
    }{
        // Two card tests
        {
            name: "TwoCards_Pair",
            hand: []Card{
                NewCard(Ace, Spades),
                NewCard(Ace, Hearts),
            },
            want: OnePair,
        },
        {
            name: "TwoCards_HighCard",
            hand: []Card{
                NewCard(King, Spades),
                NewCard(Queen, Hearts),
            },
            want: HighCard,
        },
        {
            name: "TwoCards_SameSuit",
            hand: []Card{
                NewCard(Ten, Diamonds),
                NewCard(Jack, Diamonds),
            },
            want: HighCard,
        },
        {
            name: "TwoCards_LowPair",
            hand: []Card{
                NewCard(Two, Clubs),
                NewCard(Two, Spades),
            },
            want: OnePair,
        },
        
        // Three card tests
        {
            name: "ThreeCards_ThreeOfAKind",
            hand: []Card{
                NewCard(Seven, Spades),
                NewCard(Seven, Hearts),
                NewCard(Seven, Diamonds),
            },
            want: ThreeOfAKind,
        },
        {
            name: "ThreeCards_OnePair",
            hand: []Card{
                NewCard(Jack, Clubs),
                NewCard(Jack, Hearts),
                NewCard(Four, Diamonds),
            },
            want: OnePair,
        },
        {
            name: "ThreeCards_HighCard",
            hand: []Card{
                NewCard(Ace, Spades),
                NewCard(King, Hearts),
                NewCard(Nine, Diamonds),
            },
            want: HighCard,
        },
        {
            name: "ThreeCards_StraightPotential",
            hand: []Card{
                NewCard(Five, Spades),
                NewCard(Six, Hearts),
                NewCard(Seven, Diamonds),
            },
            want: HighCard,
        },
        
        // Four card tests
        {
            name: "FourCards_FourOfAKind",
            hand: []Card{
                NewCard(Nine, Spades),
                NewCard(Nine, Hearts),
                NewCard(Nine, Diamonds),
                NewCard(Nine, Clubs),
            },
            want: FourOfAKind,
        },
        {
            name: "FourCards_ThreeOfAKind",
            hand: []Card{
                NewCard(King, Spades),
                NewCard(King, Hearts),
                NewCard(King, Diamonds),
                NewCard(Three, Clubs),
            },
            want: ThreeOfAKind,
        },
        {
            name: "FourCards_TwoPair",
            hand: []Card{
                NewCard(Eight, Spades),
                NewCard(Eight, Hearts),
                NewCard(Five, Diamonds),
                NewCard(Five, Clubs),
            },
            want: TwoPair,
        },
        {
            name: "FourCards_OnePair",
            hand: []Card{
                NewCard(Queen, Hearts),
                NewCard(Queen, Diamonds),
                NewCard(Jack, Spades),
                NewCard(Ten, Clubs),
            },
            want: OnePair,
        },
        {
            name: "FourCards_High",
            hand: []Card{
                NewCard(Three, Hearts),
                NewCard(Four, Diamonds),
                NewCard(Five, Clubs),
                NewCard(Six, Spades),
            },
            want: HighCard,
        },
        {
            name: "FourCards_HighCard",
            hand: []Card{
                NewCard(Ace, Spades),
                NewCard(King, Hearts),
                NewCard(Ten, Diamonds),
                NewCard(Five, Clubs),
            },
            want: HighCard,
        },
        {
            name: "FourCards_AlmostFullHouse",
            hand: []Card{
                NewCard(Six, Spades),
                NewCard(Six, Hearts),
                NewCard(Six, Diamonds),
                NewCard(Four, Clubs),
            },
            want: ThreeOfAKind,
        },
        
        // Edge cases with mixed card counts
        {
            name: "TwoCards_BothAces",
            hand: []Card{
                NewCard(Ace, Clubs),
                NewCard(Ace, Diamonds),
            },
            want: OnePair,
        },
        {
            name: "ThreeCards_AllSameSuit",
            hand: []Card{
                NewCard(Three, Spades),
                NewCard(Eight, Spades),
                NewCard(Queen, Spades),
            },
            want: HighCard,
        },
        {
            name: "FourCards_AlmostRoyalFlush",
            hand: []Card{
                NewCard(Ten, Hearts),
                NewCard(Jack, Hearts),
                NewCard(Queen, Hearts),
                NewCard(King, Hearts),
            },
            want: HighCard,
        },
        {
            name: "ThreeCards_TripsAces",
            hand: []Card{
                NewCard(Ace, Spades),
                NewCard(Ace, Hearts),
                NewCard(Ace, Diamonds),
            },
            want: ThreeOfAKind,
        },
        {
            name: "FourCards_QuadTwos",
            hand: []Card{
                NewCard(Two, Spades),
                NewCard(Two, Hearts),
                NewCard(Two, Diamonds),
                NewCard(Two, Clubs),
            },
            want: FourOfAKind,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            got := evalHand(tt.hand)
            if got != tt.want {
                t.Fatalf("%s: evalHand = %v, want %v", tt.name, got, tt.want)
            }
        })
    }
}