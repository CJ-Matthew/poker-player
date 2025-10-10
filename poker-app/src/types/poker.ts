export interface Player {
  name: string;
  chips: number;
  position: number;
  folded: boolean;
  currentBet: number;
}

export interface TableData {
  smallBlind: number;
  bigBlind: number;
  pot: number;
  players: Record<string, Player>;
  dealerPosition: number;
  currentTurn: number;
  currentBet: number;
  roundActive: boolean;
}

export type PlayerAction = 'fold' | 'call' | 'raise';