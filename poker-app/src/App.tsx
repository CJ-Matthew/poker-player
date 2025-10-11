import React, { useState } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { LobbyScreen } from './components/LobbyScreen';
import { TableScreen } from './components/TableScreen';
import { useTable } from './hooks/useTable';
import * as firebaseService from './services/firebase';
import type { PlayerAction } from './types/poker';

type Screen = 'welcome' | 'lobby' | 'table';

export default function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [playerName, setPlayerName] = useState<string>('');
  const [tableId, setTableId] = useState<string>('');
  const [currentPlayerId, setCurrentPlayerId] = useState<string>('');
  
  const tableData = useTable(tableId);

  const handleCreateTable = async (smallBlind: string, bigBlind: string, buyIn: string): Promise<void> => {
    if (!playerName || !smallBlind || !bigBlind || !buyIn) {
      alert('Please fill in all fields');
      return;
    }

    if (parseInt(buyIn, 10) <= 0) {
      alert('Buy-in amount must be greater than 0!');
      return;
    }

    try {
      const { tableId: newTableId, playerId } = await firebaseService.createTable(
        playerName,
        smallBlind,
        bigBlind,
        buyIn // Pass buyIn to the createTable function
      );
      setTableId(newTableId);
      setCurrentPlayerId(playerId);
      setScreen('table');
    } catch (error) {
      alert('Error creating table: ' + (error as Error).message);
    }
  };

  const handleJoinTable = async (joinTableId: string, buyIn: string): Promise<void> => {
    if (!playerName || !joinTableId || !buyIn) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const playerId = await firebaseService.joinTable(joinTableId, playerName, buyIn);
      setCurrentPlayerId(playerId);
      setTableId(joinTableId);
      setScreen('table');
    } catch (error) {
      alert('Error joining table: ' + (error as Error).message);
    }
  };

  const handleStartRound = (): void => {
    if (tableData) {
      firebaseService.startRound(tableId, tableData);
    }
  };

  const handleMoveDealer = (): void => {
    if (tableData) {
      firebaseService.moveDealer(
        tableId, 
        tableData.dealerPosition, 
        Object.keys(tableData.players).length
      );
    }
  };

  const handlePlayerAction = (action: PlayerAction, raiseAmount?: number): void => {
    if (tableData) {
      firebaseService.playerAction(tableId, tableData, currentPlayerId, action, raiseAmount);
    }
  };

  const handleEndRound = (winnerId: string): void => {
    if (tableData) {
      firebaseService.endRound(tableId, tableData, winnerId);
    }
  };

  const handleUpdateChips = (playerId: string, newChips: string): void => {
    firebaseService.updatePlayerChips(tableId, playerId, newChips);
  };

  const handleUpdateBlinds = (smallBlind: string, bigBlind: string): void => {
    firebaseService.updateBlinds(tableId, smallBlind, bigBlind);
  };

  if (screen === 'welcome') {
    return (
      <WelcomeScreen
        playerName={playerName}
        setPlayerName={setPlayerName}
        onContinue={() => setScreen('lobby')}
      />
    );
  }

  if (screen === 'lobby') {
    return (
      <LobbyScreen
        playerName={playerName}
        onCreateTable={handleCreateTable}
        onJoinTable={handleJoinTable}
        onBack={() => setScreen('welcome')}
      />
    );
  }

  if (screen === 'table') {
    return (
      <TableScreen
        tableId={tableId}
        tableData={tableData}
        currentPlayerId={currentPlayerId}
        onStartRound={handleStartRound}
        onMoveDealer={handleMoveDealer}
        onPlayerAction={handlePlayerAction}
        onEndRound={handleEndRound}
        onUpdateChips={handleUpdateChips}
        onUpdateBlinds={handleUpdateBlinds}
      />
    );
  }

  return null;
}