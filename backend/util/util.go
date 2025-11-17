package util

import "errors"

// All possible 5 card hands from the given cards
func generateCombinations(cards []Card) [][]Card {
	var combinations [][]Card
	for a := 0; a < len(cards); a++ {
		for b := a + 1; b < len(cards); b++ {
			for c := b + 1; c < len(cards); c++ {
				for d := c + 1; d < len(cards); d++ {
					for e := d + 1; e < len(cards); e++ {
						combination := []Card{cards[a], cards[b], cards[c], cards[d], cards[e]}
						combinations = append(combinations, combination)
					}
				}
			}
		}
	}
	return combinations
}


// Give a list of cards where each two cards in a row represents a player
// Give five cards that represents the final board
// A list of integers are returned which is the index of the winning player (An array as there can be chops) 
func getWinningPlayer(hands []Card, board []Card) ([]int, error) {

	// Uneven number of cards
	if len(hands) % 2 != 0 {
		return []int{}, errors.New("uneven player cards")
	}

	// Full board not given
	if len(board) != 5 {
		return []int{}, errors.New("full board cards not given")
	}

	var winnerHandValue HandValue
	var winner []int

	// Going through each persons possible hands 7C5 (21) and finding the best for each person
	for i := 0; i < len(hands); i+=2 {
		// Create a fresh slice for each player to avoid appending to the board slice
		cardRange := make([]Card, len(board))
		copy(cardRange, board)
		cardRange = append(cardRange, hands[i], hands[i+1])

		handCombinations := generateCombinations(cardRange)

		bestHand := HandValue{Rank: -1}

		for _, hand := range handCombinations {
			handR := evalHand(hand)

			valuation := HandValue{handR, hand}
			
			if bestHand.Rank == -1 {
				bestHand = valuation
			} else {
				if valuation.Rank > bestHand.Rank {
					bestHand = valuation
				} else if valuation.Rank == bestHand.Rank {
					if beats(valuation.Hand, bestHand.Hand, valuation.Rank) == "TRUE" {
						bestHand = valuation
					} 
				}
			}
		}

		// If there is no current winner
		if len(winner) == 0 {
			winner = []int{i/2}
			winnerHandValue = bestHand
		} else {
			
			// If the player has a better hand rank
			if bestHand.Rank > winnerHandValue.Rank {
				winner = []int{i/2}
				winnerHandValue = bestHand
			} else if bestHand.Rank == winnerHandValue.Rank {

				// If the players have the same hand rank see who has the better hand
				comparison := beats(bestHand.Hand, winnerHandValue.Hand, bestHand.Rank)

				switch comparison {
				case "TRUE":
					winner = []int{i/2}
					winnerHandValue = bestHand
				case "CHOP":
					winner = append(winner, i/2)
				}
			}
		}
	}

	return winner, nil
}

// Takes in between 2-5 cards and gives the current best hand rank
// Returns the best hand rank
func evalHand(hand []Card) HandRank {
	flush := true
	straight := false
	fourKind := false
	trips := false
	pair := false
	twoPair := false
	royal := false
	pairCounter := 0
	row := 0

	var counter [13]int


	for i:=0; i<len(hand); i++ {

		counter[hand[i].Rank-2] += 1

		if i != 0 && hand[i].Suit != hand[i-1].Suit || len(hand) != 5 {
			flush = false
		} 
	}

	for i:=0; i<len(counter); i++ {
		switch counter[i] {
		case 4:
			fourKind = true
		case 3:
			trips = true
		case 2:
			pair = true
			pairCounter += 1
			if pairCounter == 2 {
				twoPair = true
			}
		}
		
		if counter[i] > 0 {
			row += 1
			if row == 5 {
				straight = true
				if i == len(counter)-1 {
					royal = true
				}
			} else if row == 4 && i == 3 && counter[12] == 1 {
				straight = true
			}
		} else {
			row = 0
		}
	}

	if royal && flush {
		return RoyalFlush
	}
	
	if straight && flush {
		return StraightFlush
	}
	
	if fourKind {
		return FourOfAKind
	}

	if trips && pair {
		return FullHouse
	}

	if flush {
		return Flush
	}
	
	if straight {
		return Straight
	}
	
	if trips {
		return ThreeOfAKind
	}

	if twoPair {
		return TwoPair
	}

	if pair {
		return OnePair
	}


	return HighCard
}

func beats(p1 []Card, p2 []Card, hr HandRank) string {
	var p1Counter [13]int
	var p2Counter [13]int

	for i:=0;i<len(p1);i++ {
		p1Counter[p1[i].Rank-2] += 1
		p2Counter[p2[i].Rank-2] += 1
	}


	switch hr {
	case(HighCard):
		return higherCard(p1Counter[:], p2Counter[:])
	case(OnePair):
		for i:=12;i>=0;i-- {
			if p1Counter[i] == 2 && p2Counter[i] != 2 {
				return "TRUE"
			} else if p1Counter[i] != 2 && p2Counter[i] == 2 {
				return "FALSE"
			}
		}

		return beats(p1, p2, HighCard)

	case(TwoPair):
		for i:=12;i>=0;i-- {
			if p1Counter[i] == 2 && p2Counter[i] != 2 {
				return "TRUE"
			} else if p1Counter[i] != 2 && p2Counter[i] == 2 {
				return "FALSE"
			}
		}

		return beats(p1,p2, HighCard)

	case(ThreeOfAKind):
		for i:=12;i>=0;i-- {
			if p1Counter[i] == 3 && p2Counter[i] != 3 {
				return "TRUE"
			} else if p1Counter[i] != 3 && p2Counter[i] == 3 {
				return "FALSE"
			}
		}
		return higherCard(p1Counter[:], p2Counter[:])

	case(Straight):
		if (p1Counter[12]==1 && p1Counter[0] == 1 && p2Counter[12] != 1) {
			return "FALSE"
		} else if (p2Counter[12] == 1 && p2Counter[0] == 1 && p1Counter[12] != 1) {
			return "TRUE"
		}

		return higherCard(p1Counter[:], p2Counter[:])

	case(Flush):
		return higherCard(p1Counter[:], p2Counter[:])

	case(FullHouse):
		for i:=12;i>=0;i-- {
			if p1Counter[i] == 3 && p2Counter[i] != 3 {
				return "TRUE"
			} else if p1Counter[i] != 3 && p2Counter[i] == 3 {
				return "FALSE"
			}
		}
		return beats(p1, p2, OnePair)

	case(FourOfAKind):
		for i:=12;i>=0;i-- {
			if p1Counter[i] == 4 && p2Counter[i] != 4 {
				return "TRUE"
			} else if p1Counter[i] != 4 && p2Counter[i] == 4 {
				return "FALSE"
			}
		}
		return higherCard(p1Counter[:], p2Counter[:])

	case(StraightFlush):
		if (p1Counter[12]==1 && p1Counter[0] == 1 && p2Counter[12] != 1) {
			return "FALSE"
		} else if (p2Counter[12] == 1 && p2Counter[0] == 1 && p1Counter[12] != 1) {
			return "TRUE"
		}

		return higherCard(p1Counter[:], p2Counter[:])

	case(RoyalFlush):
		return "CHOP"
	}

	return "ERROR"
}


func higherCard(p1Counter []int, p2Counter []int) string {
	for i:=12;i>=0;i-- {
			if p1Counter[i] == 1 && p2Counter[i] != 1 {
				return "TRUE"
			} else if p1Counter[i] != 1 && p2Counter[i] == 1 {
				return "FALSE"
			}
		}

		return "CHOP"
}

