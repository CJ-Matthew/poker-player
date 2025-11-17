package util

import "fmt"

// Suit represents the four suits in a standard deck
type Suit int

const (
	Hearts Suit = iota
	Diamonds
	Clubs
	Spades
)

// String returns the string representation of a Suit
func (s Suit) String() string {
	switch s {
	case Hearts:
		return "♥"
	case Diamonds:
		return "♦"
	case Clubs:
		return "♣"
	case Spades:
		return "♠"
	default:
		return "?"
	}
}

// Rank represents the rank of a card (2 through Ace)
type Rank int

const (
	Two Rank = iota + 2
	Three
	Four
	Five
	Six
	Seven
	Eight
	Nine
	Ten
	Jack
	Queen
	King
	Ace
)

// String returns the string representation of a Rank
func (r Rank) String() string {
	switch r {
	case Two, Three, Four, Five, Six, Seven, Eight, Nine, Ten:
		return fmt.Sprintf("%d", r)
	case Jack:
		return "J"
	case Queen:
		return "Q"
	case King:
		return "K"
	case Ace:
		return "A"
	default:
		return "?"
	}
}

// Card represents a single playing card
type Card struct {
	Rank Rank
	Suit Suit
}

// String returns the string representation of a Card (e.g., "A♠")
func (c Card) String() string {
	return fmt.Sprintf("%s%s", c.Rank, c.Suit)
}

// NewCard creates a new Card
func NewCard(rank Rank, suit Suit) Card {
	return Card{Rank: rank, Suit: suit}
}

// HandRank represents the ranking of a poker hand
type HandRank int

const (
	HighCard HandRank = iota
	OnePair
	TwoPair
	ThreeOfAKind
	Straight
	Flush
	FullHouse
	FourOfAKind
	StraightFlush
	RoyalFlush
)

// String returns the string representation of a HandRank
func (hr HandRank) String() string {
	switch hr {
	case HighCard:
		return "High Card"
	case OnePair:
		return "One Pair"
	case TwoPair:
		return "Two Pair"
	case ThreeOfAKind:
		return "Three of a Kind"
	case Straight:
		return "Straight"
	case Flush:
		return "Flush"
	case FullHouse:
		return "Full House"
	case FourOfAKind:
		return "Four of a Kind"
	case StraightFlush:
		return "Straight Flush"
	case RoyalFlush:
		return "Royal Flush"
	default:
		return "Unknown"
	}
}

// HandValue represents a poker hand with its rank and cards
type HandValue struct {
	Rank HandRank
	Hand []Card
}
