import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getDatabase, ref, set, push, update, get, Database } from 'firebase/database';
import type { TableData, Player, PlayerAction } from '../types/poker';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "poker-player.firebaseapp.com",
  projectId: "poker-player",
  storageBucket: "poker-player.firebasestorage.app",
  messagingSenderId: "983170959819",
  appId: "1:983170959819:web:dc5bf0f863016cc53c8e4e",
  measurementId: "G-KEYFZKYNMK"
};

const app: FirebaseApp = initializeApp(firebaseConfig);
export const database: Database = getDatabase(app);

interface CreateTableResult {
  tableId: string;
  playerId: string;
}

// Helper function to get active players
const getActivePlayers = (tableData: TableData): { players: Player[], indices: number[] } => {
  const activeData = tableData.players
    .map((player, index) => ({ player, index }))
    .filter(({ player }) => player.active);
  
  return {
    players: activeData.map(({ player }) => player),
    indices: activeData.map(({ index }) => index)
  };
};

// Helper function to find next active player
const findNextActivePlayer = (tableData: TableData, currentIndex: number): number => {
  const { indices } = getActivePlayers(tableData);
  
  if (indices.length === 0) return -1;
  
  const currentActiveIndex = indices.indexOf(currentIndex);
  if (currentActiveIndex === -1) {
    return indices[0];
  }
  
  let nextActiveIndex = (currentActiveIndex + 1) % indices.length;
  let attempts = 0;
  
  while (tableData.players[indices[nextActiveIndex]].folded && attempts < indices.length) {
    nextActiveIndex = (nextActiveIndex + 1) % indices.length;
    attempts++;
  }
  
  return indices[nextActiveIndex];
};

// Helper function to check if betting round is complete
const isBettingRoundComplete = (tableData: TableData): boolean => {
  const activePlayers = tableData.players.filter((p) => 
    p.active && !p.folded
  );
  
  if (activePlayers.length <= 1) return true;
  
  // Get active, non-folded player indices
  const activeIndices = tableData.players
    .map((p, idx) => ({ p, idx }))
    .filter(({ p }) => p.active && !p.folded)
    .map(({ idx }) => idx);
  
  if (activeIndices.length === 0) return true;
  
  // Check if all active players have matched the current bet
  const allPlayersMatched = activeIndices.every(idx => {
    return tableData.players[idx].currentBet === tableData.currentBet;
  });
  
  if (!allPlayersMatched) return false;
  
  // Check if we've returned to the last player to act
  const currentTurnIndex = tableData.currentTurn;
  
  // Special case: if lastToAct is not in active players anymore, round is complete
  if (!activeIndices.includes(tableData.lastToAct)) {
    return allPlayersMatched;
  }
  
  // Find the next active player after lastToAct
  const lastToActPosition = activeIndices.indexOf(tableData.lastToAct);
  const nextAfterLastToAct = activeIndices[(lastToActPosition + 1) % activeIndices.length];
  
  // Round is complete when we reach the player after lastToAct and all bets are matched
  return currentTurnIndex === nextAfterLastToAct && allPlayersMatched;
};

export const createTable = async (
  playerName: string, 
  smallBlind: string | number, 
  bigBlind: string | number, 
  buyIn: string | number
): Promise<CreateTableResult> => {
  const newTableRef = push(ref(database, 'tables'));
  const newTableId = newTableRef.key;

  if (!newTableId) {
    throw new Error('Failed to generate table ID');
  }

  const playerId = `${playerName}_${Date.now()}`;

  const tableData: TableData = {
    smallBlind: parseInt(String(smallBlind)),
    bigBlind: parseInt(String(bigBlind)),
    pot: 0,
    players: [{
      name: playerName,
      chips: parseInt(String(buyIn)),
      folded: false,
      currentBet: 0, 
      active: true
    }],
    playerIds: [playerId],
    dealerPosition: 0,
    currentTurn: -1,
    currentBet: 0,
    roundActive: false,
    roundStage: '',
    lastToAct: -1
  };

  await set(newTableRef, tableData);
  return { tableId: newTableId, playerId };
};

export const joinTable = async (
  tableId: string, 
  playerName: string, 
  buyIn: string | number
): Promise<string> => {
  const tableRef = ref(database, `tables/${tableId}`);
  const snapshot = await get(tableRef);

  if (!snapshot.exists()) {
    throw new Error('Table not found');
  }

  const table = snapshot.val() as TableData;
  const players = table.players || [];
  const playerIds = table.playerIds || [];
  
  const existingPlayerIndex = players.findIndex(p => p.name === playerName);
  
  if (existingPlayerIndex !== -1) {
    const existingPlayerId = playerIds[existingPlayerIndex];
    await update(ref(database, `tables/${tableId}/players/${existingPlayerIndex}`), { active: true });
    return existingPlayerId;
  }

  if (players.length >= 10) {
    throw new Error('Table is full');
  }

  const playerId = `${playerName}_${Date.now()}`;

  const newPlayer: Player = {
    name: playerName,
    chips: parseInt(String(buyIn)),
    folded: false,
    currentBet: 0,
    active: true
  };

  const updates: Record<string, unknown> = {};
  updates[`tables/${tableId}/players/${players.length}`] = newPlayer;
  updates[`tables/${tableId}/playerIds/${playerIds.length}`] = playerId;

  await update(ref(database), updates);
  return playerId;
};

export const leaveTable = async (
  tableId: string,
  playerId: string
): Promise<void> => {
  const tableRef = ref(database, `tables/${tableId}`);
  const snapshot = await get(tableRef);
  
  if (!snapshot.exists()) return;
  
  const table = snapshot.val() as TableData;
  const playerIndex = table.playerIds.indexOf(playerId);
  
  if (playerIndex === -1) return;

  const updates: Record<string, unknown> = {};
  
  // If player is in an active round, fold them first
  if (table.roundActive && !table.players[playerIndex].folded) {
    updates[`tables/${tableId}/players/${playerIndex}/folded`] = true;
    
    // If it's their turn, move to next player
    if (table.currentTurn === playerIndex) {
      const nextTurn = findNextActivePlayer(table, playerIndex);
      updates[`tables/${tableId}/currentTurn`] = nextTurn;
    }
  }
  
  // Mark as inactive
  updates[`tables/${tableId}/players/${playerIndex}/active`] = false;
  
  await update(ref(database), updates);
  
  // Move inactive player to the end
  const updatedSnapshot = await get(tableRef);
  if (updatedSnapshot.exists()) {
    const updatedTable = updatedSnapshot.val() as TableData;
    
    // Separate active and inactive players
    const playerData = updatedTable.playerIds.map((id, idx) => ({
      id,
      player: updatedTable.players[idx],
      originalIndex: idx
    }));
    
    const activePlayers = playerData.filter(p => p.player.active);
    const inactivePlayers = playerData.filter(p => !p.player.active);
    
    // Reorder: active players first, then inactive
    const reorderedData = [...activePlayers, ...inactivePlayers];
    
    // Create index mapping for dealer and currentTurn positions
    const indexMapping: Record<number, number> = {};
    reorderedData.forEach((item, newIndex) => {
      indexMapping[item.originalIndex] = newIndex;
    });
    
    const reorderedPlayers = reorderedData.map(item => item.player);
    const reorderedPlayerIds = reorderedData.map(item => item.id);
    
    const reorderUpdates: Record<string, unknown> = {};
    reorderUpdates[`tables/${tableId}/players`] = reorderedPlayers;
    reorderUpdates[`tables/${tableId}/playerIds`] = reorderedPlayerIds;
    
    // Update dealer position if it changed
    if (indexMapping[updatedTable.dealerPosition] !== undefined) {
      reorderUpdates[`tables/${tableId}/dealerPosition`] = indexMapping[updatedTable.dealerPosition];
    }
    
    // Update currentTurn if it changed
    if (updatedTable.currentTurn >= 0 && indexMapping[updatedTable.currentTurn] !== undefined) {
      reorderUpdates[`tables/${tableId}/currentTurn`] = indexMapping[updatedTable.currentTurn];
    }
    
    await update(ref(database), reorderUpdates);
  }
};

export const startRound = async (tableId: string, tableData: TableData): Promise<void> => {
  const { indices: activeIndices } = getActivePlayers(tableData);
  
  if (activeIndices.length < 2) {
    throw new Error('Need at least 2 active players to start a round');
  }

  const players = tableData.players;
  
  let dealerActiveIndex = activeIndices.indexOf(tableData.dealerPosition);
  if (dealerActiveIndex === -1) {
    dealerActiveIndex = 0;
  }

  const dealerPos = activeIndices[dealerActiveIndex];
  const sbActiveIndex = (dealerActiveIndex + 1) % activeIndices.length;
  const bbActiveIndex = (dealerActiveIndex + 2) % activeIndices.length;
  
  const sbPos = activeIndices[sbActiveIndex];
  const bbPos = activeIndices[bbActiveIndex];

  const updates: Record<string, unknown> = {};
  
  updates[`tables/${tableId}/players/${sbPos}/chips`] = players[sbPos].chips - tableData.smallBlind;
  updates[`tables/${tableId}/players/${sbPos}/currentBet`] = tableData.smallBlind;
  updates[`tables/${tableId}/players/${bbPos}/chips`] = players[bbPos].chips - tableData.bigBlind;
  updates[`tables/${tableId}/players/${bbPos}/currentBet`] = tableData.bigBlind;
  
  updates[`tables/${tableId}/pot`] = tableData.smallBlind + tableData.bigBlind;
  updates[`tables/${tableId}/currentBet`] = tableData.bigBlind;
  updates[`tables/${tableId}/roundActive`] = true;
  updates[`tables/${tableId}/roundStage`] = 'PRE_FLOP';
  updates[`tables/${tableId}/dealerPosition`] = dealerPos;
  
  const nextActiveIndex = (bbActiveIndex + 1) % activeIndices.length;
  const firstToAct = activeIndices[nextActiveIndex];
  updates[`tables/${tableId}/currentTurn`] = firstToAct;
  updates[`tables/${tableId}/lastToAct`] = bbPos;

  activeIndices.forEach((index) => {
    updates[`tables/${tableId}/players/${index}/folded`] = false;
    if (index !== sbPos && index !== bbPos) {
      updates[`tables/${tableId}/players/${index}/currentBet`] = 0;
    }
  });

  await update(ref(database), updates);
};

export const moveDealer = async (
  tableId: string
): Promise<void> => {
  const tableRef = ref(database, `tables/${tableId}`);
  const snapshot = await get(tableRef);
  
  if (!snapshot.exists()) return;
  
  const tableData = snapshot.val() as TableData;
  const { indices: activeIndices } = getActivePlayers(tableData);
  
  if (activeIndices.length === 0) return;

  const currentDealerActiveIndex = activeIndices.indexOf(tableData.dealerPosition);
  let newDealerActiveIndex;
  
  if (currentDealerActiveIndex === -1) {
    newDealerActiveIndex = 0;
  } else {
    newDealerActiveIndex = (currentDealerActiveIndex + 1) % activeIndices.length;
  }
  
  const newDealerPos = activeIndices[newDealerActiveIndex];
  await update(ref(database, `tables/${tableId}`), { dealerPosition: newDealerPos });
};

export const advanceRoundStage = async (
  tableId: string,
  tableData: TableData
): Promise<void> => {
  const stageOrder: Array<'PRE_FLOP' | 'FLOP' | 'TURN' | 'RIVER' | ''> = ['PRE_FLOP', 'FLOP', 'TURN', 'RIVER', ''];
  const currentIndex = stageOrder.indexOf(tableData.roundStage);
  const nextStage = currentIndex < stageOrder.length - 1 ? stageOrder[currentIndex + 1] : '';
  
  const { indices: activeIndices } = getActivePlayers(tableData);
  
  if (activeIndices.length === 0) return;

  const updates: Record<string, unknown> = {};
  updates[`tables/${tableId}/roundStage`] = nextStage;
  updates[`tables/${tableId}/currentBet`] = 0;
  
  // Reset all player bets for the new betting round
  tableData.players.forEach((_, index) => {
    updates[`tables/${tableId}/players/${index}/currentBet`] = 0;
  });
  
  let dealerActiveIndex = activeIndices.indexOf(tableData.dealerPosition);
  if (dealerActiveIndex === -1) {
    dealerActiveIndex = 0;
  }
  
  const firstToActActiveIndex = (dealerActiveIndex + 1) % activeIndices.length;
  const firstToAct = activeIndices[firstToActActiveIndex];
  
  const lastToAct = activeIndices[dealerActiveIndex];
  
  updates[`tables/${tableId}/currentTurn`] = firstToAct;
  updates[`tables/${tableId}/lastToAct`] = lastToAct;
  
  await update(ref(database), updates);
};

export const playerAction = async (
  tableId: string, 
  tableData: TableData, 
  playerId: string, 
  action: PlayerAction, 
  raiseAmount: number = 0
): Promise<void> => {
  const playerIndex = tableData.playerIds.indexOf(playerId);
  if (playerIndex === -1 || playerIndex !== tableData.currentTurn) return;

  const currentPlayer = tableData.players[playerIndex];
  
  if (!currentPlayer.active) return;

  const updates: Record<string, unknown> = {};
  
  if (action === 'fold') {
    updates[`tables/${tableId}/players/${playerIndex}/folded`] = true;
  } else if (action === 'call') {
    const callAmount = tableData.currentBet - currentPlayer.currentBet;
    updates[`tables/${tableId}/players/${playerIndex}/chips`] = currentPlayer.chips - callAmount;
    updates[`tables/${tableId}/players/${playerIndex}/currentBet`] = tableData.currentBet;
    updates[`tables/${tableId}/pot`] = tableData.pot + callAmount;
  } else if (action === 'raise') {
    const totalBet = tableData.currentBet + raiseAmount;
    const amountToAdd = totalBet - currentPlayer.currentBet;
    updates[`tables/${tableId}/players/${playerIndex}/chips`] = currentPlayer.chips - amountToAdd;
    updates[`tables/${tableId}/players/${playerIndex}/currentBet`] = totalBet;
    updates[`tables/${tableId}/pot`] = tableData.pot + amountToAdd;
    updates[`tables/${tableId}/currentBet`] = totalBet;
    
    // When someone raises, they become the last to act (action is on everyone else again)
    updates[`tables/${tableId}/lastToAct`] = playerIndex;
  }

  // Find next active player
  const nextTurn = findNextActivePlayer(tableData, tableData.currentTurn);
  updates[`tables/${tableId}/currentTurn`] = nextTurn;
  
  await update(ref(database), updates);
  
  // Check if betting round is complete after this action
  const updatedSnapshot = await get(ref(database, `tables/${tableId}`));
  if (updatedSnapshot.exists()) {
    const updatedTableData = updatedSnapshot.val() as TableData;
    
    if (isBettingRoundComplete(updatedTableData)) {
      // Check if only one player left
      const activePlayers = updatedTableData.players.filter(p => p.active && !p.folded);
      
      if (activePlayers.length === 1) {
        // Don't advance stage, let the winner be declared
        return;
      }
      
      // Advance to next stage if not at river
      if (updatedTableData.roundStage !== 'RIVER') {
        await advanceRoundStage(tableId, updatedTableData);
      }
      // If RIVER and betting complete, round stays active for showdown/win pot button
    }
  }
};

export const endRound = async (
  tableId: string, 
  tableData: TableData, 
  winnerId: string,
): Promise<void> => {
  const winnerIndex = tableData.playerIds.indexOf(winnerId);
  if (winnerIndex === -1) return;

  const updates: Record<string, unknown> = {};
  const winner = tableData.players[winnerIndex];
  
  updates[`tables/${tableId}/players/${winnerIndex}/chips`] = winner.chips + tableData.pot;
  updates[`tables/${tableId}/pot`] = 0;
  updates[`tables/${tableId}/currentBet`] = 0;
  updates[`tables/${tableId}/roundActive`] = false;
  updates[`tables/${tableId}/roundStage`] = '';
  updates[`tables/${tableId}/currentTurn`] = -1;
  updates[`tables/${tableId}/lastToAct`] = -1;

  const { indices: activeIndices } = getActivePlayers(tableData);
  if (activeIndices.length > 0) {
    const currentDealerActiveIndex = activeIndices.indexOf(tableData.dealerPosition);
    const newDealerActiveIndex = currentDealerActiveIndex === -1 ? 0 : (currentDealerActiveIndex + 1) % activeIndices.length;
    updates[`tables/${tableId}/dealerPosition`] = activeIndices[newDealerActiveIndex];
  }

  tableData.players.forEach((_, index) => {
    updates[`tables/${tableId}/players/${index}/currentBet`] = 0;
    updates[`tables/${tableId}/players/${index}/folded`] = false;
  });

  await update(ref(database), updates);
};

export const updatePlayerChips = async (
  tableId: string, 
  playerId: string, 
  newChips: string
): Promise<void> => {
  const tableRef = ref(database, `tables/${tableId}`);
  const snapshot = await get(tableRef);
  
  if (!snapshot.exists()) return;
  
  const table = snapshot.val() as TableData;
  const playerIndex = table.playerIds.indexOf(playerId);
  
  if (playerIndex === -1) return;

  const chips = parseInt(newChips, 10);
  if (chips < 0) {
    alert('Chips cannot be negative!');
    return;
  }
  
  await update(ref(database, `tables/${tableId}/players/${playerIndex}`), { 
    chips: chips
  });
};

export const updateBlinds = async (
  tableId: string, 
  smallBlind: string | number, 
  bigBlind: string | number
): Promise<void> => {
  await update(ref(database, `tables/${tableId}`), {
    smallBlind: parseInt(String(smallBlind)),
    bigBlind: parseInt(String(bigBlind))
  });
};

export const updatePlayerPositions = async (
  tableId: string,
  orderedPlayerIds: string[]
): Promise<void> => {
  const tableRef = ref(database, `tables/${tableId}`);
  const snapshot = await get(tableRef);
  
  if (!snapshot.exists()) return;
  
  const table = snapshot.val() as TableData;
  
  const reorderedPlayers: Player[] = [];
  const reorderedPlayerIds: string[] = [];
  
  orderedPlayerIds.forEach(playerId => {
    const currentIndex = table.playerIds.indexOf(playerId);
    if (currentIndex !== -1) {
      reorderedPlayers.push(table.players[currentIndex]);
      reorderedPlayerIds.push(playerId);
    }
  });
  
  const updates: Record<string, unknown> = {};
  updates[`tables/${tableId}/players`] = reorderedPlayers;
  updates[`tables/${tableId}/playerIds`] = reorderedPlayerIds;
  
  await update(ref(database), updates);
};

export const setPlayerActive = async (
  tableId: string,
  playerId: string,
  active: boolean
): Promise<void> => {
  const tableRef = ref(database, `tables/${tableId}`);
  const snapshot = await get(tableRef);
  
  if (!snapshot.exists()) return;
  
  const table = snapshot.val() as TableData;
  const playerIndex = table.playerIds.indexOf(playerId);
  
  if (playerIndex === -1) return;
  
  await update(ref(database, `tables/${tableId}/players/${playerIndex}`), { 
    active: active
  });
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
