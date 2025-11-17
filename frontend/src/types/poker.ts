export interface Player {
  name: string;
  chips: number;
  folded: boolean;
  currentBet: number;
  active: boolean;
}

export interface TableData {
  smallBlind: number;
  bigBlind: number;
  pot: number;
  players: Player[];
  playerIds: string[];
  dealerPosition: number;
  currentTurn: number;
  currentBet: number;
  roundActive: boolean;
  roundStage: 'PRE_FLOP' | 'FLOP' | 'TURN' | 'RIVER' | '';
  lastToAct: number; // Track the last player who needs to act in this betting round
}

export type PlayerAction = 'fold' | 'call' | 'raise';