import type { TableData, Player } from '../types/poker';

// Helper function to get active players
export const getActivePlayers = (tableData: TableData): { players: Player[], indices: number[] } => {
  const activeData = tableData.players
    .map((player, index) => ({ player, index }))
    .filter(({ player }) => player.active);
  
  return {
    players: activeData.map(({ player }) => player),
    indices: activeData.map(({ index }) => index)
  };
};

// Helper function to get minimum raise amount
export const getMinRaiseAmount = (tableData: TableData): number => {
  const { indices: activeIndices } = getActivePlayers(tableData);
  
  if (activeIndices.length === 0) return tableData.bigBlind;
  
  // If no one has bet yet in this betting round, minimum is big blind
  if (tableData.currentBet === 0) {
    return tableData.bigBlind;
  }
  
  // For pre-flop with only the big blind posted
  if (tableData.roundStage === 'PRE_FLOP') {
    // Get all current bets from active players
    const activeBets = activeIndices
      .map(idx => tableData.players[idx].currentBet)
      .filter(bet => bet > 0)
      .sort((a, b) => b - a);
    
    if (activeBets.length === 0) return tableData.bigBlind;
    if (activeBets.length === 1) return tableData.bigBlind; // Only big blind posted
    
    // Calculate the size of the last raise
    const lastRaiseSize = activeBets[0] - activeBets[1];
    return Math.max(tableData.bigBlind, lastRaiseSize);
  }
  
  // For post-flop
  const activeBets = activeIndices
    .map(idx => tableData.players[idx].currentBet)
    .filter(bet => bet > 0)
    .sort((a, b) => b - a);
  
  if (activeBets.length < 2) {
    // First bet of the round or only one bet so far
    return tableData.bigBlind;
  }
  
  // Calculate the size of the last raise
  const lastRaiseSize = activeBets[0] - activeBets[1];
  return Math.max(tableData.bigBlind, lastRaiseSize);
};
