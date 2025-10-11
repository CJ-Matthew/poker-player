import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getDatabase, ref, set, push, update, get, Database } from 'firebase/database';
import type { TableData, Player, PlayerAction } from '../types/poker';

const firebaseConfig = {
  apiKey: "AIzaSyAirrWaVgFyjcnz-OvxSHCENER7e-AI85I",
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

export const createTable = async (
  playerName: string, 
  smallBlind: string | number, 
  bigBlind: string | number, 
  buyIn: string | number // Add buyIn parameter
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
    players: {
      [playerId]: {
        name: playerName,
        chips: parseInt(String(buyIn)), // Set initial chips to buyIn
        position: 0,
        folded: false,
        currentBet: 0
      }
    },
    dealerPosition: 0,
    currentTurn: -1,
    currentBet: 0,
    roundActive: false
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
  const players = table.players || {};
  
  const existingPlayer = Object.entries(players).find(
    ([, p]) => p.name === playerName
  );
  
  if (existingPlayer) {
    return existingPlayer[0];
  }

  if (Object.keys(players).length >= 10) {
    throw new Error('Table is full');
  }

  const playerId = `${playerName}_${Date.now()}`;
  const newPosition = Object.keys(players).length;

  const newPlayer: Player = {
    name: playerName,
    chips: parseInt(String(buyIn)),
    position: newPosition,
    folded: false,
    currentBet: 0
  };

  await update(ref(database, `tables/${tableId}/players/${playerId}`), newPlayer);
  return playerId;
};

export const startRound = async (tableId: string, tableData: TableData): Promise<void> => {
  const players = Object.entries(tableData.players).sort(
    (a, b) => a[1].position - b[1].position
  );
  const dealerPos = tableData.dealerPosition;
  const sbPos = (dealerPos + 1) % players.length;
  const bbPos = (dealerPos + 2) % players.length;

  const updates: Record<string, unknown> = {};
  
  updates[`tables/${tableId}/players/${players[sbPos][0]}/chips`] = 
    players[sbPos][1].chips - tableData.smallBlind;
  updates[`tables/${tableId}/players/${players[sbPos][0]}/currentBet`] = tableData.smallBlind;
  updates[`tables/${tableId}/players/${players[bbPos][0]}/chips`] = 
    players[bbPos][1].chips - tableData.bigBlind;
  updates[`tables/${tableId}/players/${players[bbPos][0]}/currentBet`] = tableData.bigBlind;
  
  updates[`tables/${tableId}/pot`] = tableData.smallBlind + tableData.bigBlind;
  updates[`tables/${tableId}/currentBet`] = tableData.bigBlind;
  updates[`tables/${tableId}/roundActive`] = true;
  updates[`tables/${tableId}/currentTurn`] = (bbPos + 1) % players.length;

  players.forEach(([id]) => {
    updates[`tables/${tableId}/players/${id}/folded`] = false;
  });

  await update(ref(database), updates);
};

export const moveDealer = async (
  tableId: string, 
  dealerPosition: number, 
  playerCount: number
): Promise<void> => {
  const newDealerPos = (dealerPosition + 1) % playerCount;
  await update(ref(database, `tables/${tableId}`), { dealerPosition: newDealerPos });
};

export const playerAction = async (
  tableId: string, 
  tableData: TableData, 
  playerId: string, 
  action: PlayerAction, 
  raiseAmount: number = 0
): Promise<void> => {
  const players = Object.entries(tableData.players).sort(
    (a, b) => a[1].position - b[1].position
  );
  const currentPlayer = players[tableData.currentTurn];
  
  if (!currentPlayer || currentPlayer[0] !== playerId) return;

  const updates: Record<string, unknown> = {};
  
  if (action === 'fold') {
    updates[`tables/${tableId}/players/${playerId}/folded`] = true;
  } else if (action === 'call') {
    const callAmount = tableData.currentBet - currentPlayer[1].currentBet;
    updates[`tables/${tableId}/players/${playerId}/chips`] = currentPlayer[1].chips - callAmount;
    updates[`tables/${tableId}/players/${playerId}/currentBet`] = tableData.currentBet;
    updates[`tables/${tableId}/pot`] = tableData.pot + callAmount;
  } else if (action === 'raise') {
    const totalBet = tableData.currentBet + raiseAmount;
    const amountToAdd = totalBet - currentPlayer[1].currentBet;
    updates[`tables/${tableId}/players/${playerId}/chips`] = currentPlayer[1].chips - amountToAdd;
    updates[`tables/${tableId}/players/${playerId}/currentBet`] = totalBet;
    updates[`tables/${tableId}/pot`] = tableData.pot + amountToAdd;
    updates[`tables/${tableId}/currentBet`] = totalBet;
  }

  let nextTurn = (tableData.currentTurn + 1) % players.length;
  let attempts = 0;
  while (players[nextTurn][1].folded && attempts < players.length) {
    nextTurn = (nextTurn + 1) % players.length;
    attempts++;
  }
  
  updates[`tables/${tableId}/currentTurn`] = nextTurn;
  await update(ref(database), updates);
};

export const endRound = async (
  tableId: string, 
  tableData: TableData, 
  winnerId: string
): Promise<void> => {
  const updates: Record<string, unknown> = {};
  const winner = tableData.players[winnerId];
  updates[`tables/${tableId}/players/${winnerId}/chips`] = winner.chips + tableData.pot;
  updates[`tables/${tableId}/pot`] = 0;
  updates[`tables/${tableId}/currentBet`] = 0;
  updates[`tables/${tableId}/roundActive`] = false;
  updates[`tables/${tableId}/currentTurn`] = -1;

  Object.keys(tableData.players).forEach(id => {
    updates[`tables/${tableId}/players/${id}/currentBet`] = 0;
    updates[`tables/${tableId}/players/${id}/folded`] = false;
  });

  await update(ref(database), updates);
};

export const updatePlayerChips = async (
  tableId: string, 
  playerId: string, 
  newChips: string
): Promise<void> => {
  const chips = parseInt(newChips, 10);
  if (chips < 0) {
    alert('Chips cannot be negative!');
    return;
  }
  await update(ref(database, `tables/${tableId}/players/${playerId}`), { 
    chips: parseInt(String(newChips)) 
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