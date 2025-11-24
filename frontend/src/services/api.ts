import type {PlayerAction } from '../types/poker';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const createTable = async (
  playerName: string, 
  smallBlind: string | number, 
  bigBlind: string | number, 
  buyIn: string | number
): Promise<{ tableId: string; playerId: string }> => {
  const response = await fetch(`${API_URL}/tables`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      playerName,
      smallBlind: parseInt(String(smallBlind)),
      bigBlind: parseInt(String(bigBlind)),
      buyIn: parseInt(String(buyIn))
    })
  });
  
  if (!response.ok) {
    throw new Error(await response.text());
  }
  
  return response.json();
};

export const joinTable = async (
  tableId: string, 
  playerName: string, 
  buyIn: string | number
): Promise<string> => {
  const response = await fetch(`${API_URL}/tables/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tableId,
      playerName,
      buyIn: parseInt(String(buyIn))
    })
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const data = await response.json();
  return data.playerId;
};

export const playerAction = async (
  tableId: string, 
  playerId: string, 
  action: PlayerAction, 
  raiseAmount: number = 0
): Promise<void> => {
  const response = await fetch(`${API_URL}/tables/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tableId,
      playerId,
      action,
      raiseAmount
    })
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
};

export const startRound = async (tableId: string): Promise<void> => {
  const response = await fetch(`${API_URL}/tables/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tableId })
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
};

// These are not yet implemented in backend but needed to avoid breaking UI calls immediately
// We can implement them as no-ops or add backend endpoints later
export const leaveTable = async (tableId: string, playerId: string): Promise<void> => {
    const response = await fetch(`${API_URL}/tables/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId, playerId })
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }
};

export const updatePlayerChips = async (tableId: string, playerId: string, newChips: string): Promise<void> => {
     const response = await fetch(`${API_URL}/tables/chips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            tableId, 
            playerId, 
            chips: parseInt(newChips) 
        })
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }
};

export const updateBlinds = async (tableId: string, smallBlind: string | number, bigBlind: string | number): Promise<void> => {
    const response = await fetch(`${API_URL}/tables/blinds`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            tableId, 
            smallBlind: parseInt(String(smallBlind)), 
            bigBlind: parseInt(String(bigBlind)) 
        })
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }
};

export const moveDealer = async (tableId: string): Promise<void> => {
    const response = await fetch(`${API_URL}/tables/dealer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId })
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }
};

export const updatePlayerPositions = async (tableId: string, orderedPlayerIds: string[]): Promise<void> => {
    const response = await fetch(`${API_URL}/tables/positions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId, orderedPlayerIds })
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }
};

export const endRound = async (tableId: string, winnerId: string): Promise<void> => {
    const response = await fetch(`${API_URL}/tables/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId, winnerId })
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }
};
