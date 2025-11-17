import { useState, useEffect, useCallback } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { LobbyScreen } from './components/LobbyScreen';
import { TableScreen } from './components/TableScreen';
import { useTable } from './hooks/useTable';
import { 
  createTable, 
  joinTable, 
  startRound, 
  moveDealer, 
  playerAction, 
  endRound, 
  updatePlayerChips,
  updateBlinds,
  leaveTable
} from './services/firebase';
import type { PlayerAction } from './types/poker';
import './App.css';

function App() {
  const [screen, setScreen] = useState<'welcome' | 'lobby' | 'table'>('welcome');
  const [playerName, setPlayerName] = useState<string>('');
  const [tableId, setTableId] = useState<string>('');
  const [playerId, setPlayerId] = useState<string>('');

  const tableData = useTable(tableId);

  useEffect(() => {
    if (screen === 'table' && tableData && playerId) {
      const playerIndex = tableData.playerIds.indexOf(playerId);
      if (playerIndex !== -1 && !tableData.players[playerIndex]?.active) {
        setScreen('welcome');
        setTableId('');
        setPlayerId('');
      }
    }
  }, [tableData, playerId, screen]);

  const handleCreateTable = useCallback(async (smallBlind: string, bigBlind: string, buyIn: string) => {
    try {
      const { tableId: newTableId, playerId: newPlayerId } = await createTable(
        playerName,
        smallBlind,
        bigBlind,
        buyIn
      );
      setTableId(newTableId);
      setPlayerId(newPlayerId);
      setScreen('table');
    } catch (error) {
      console.error('Error creating table:', error);
      alert('Failed to create table. Please try again.');
    }
  }, [playerName]);

  const handleJoinTable = useCallback(async (tableIdToJoin: string, buyIn: string) => {
    try {
      const newPlayerId = await joinTable(tableIdToJoin, playerName, buyIn);
      setTableId(tableIdToJoin);
      setPlayerId(newPlayerId);
      setScreen('table');
    } catch (error) {
      console.error('Error joining table:', error);
      alert('Failed to join table. Please check the Table ID and try again.');
    }
  }, [playerName]);

  const handleStartRound = useCallback(async () => {
    if (!tableId || !tableData) return;
    
    try {
      await startRound(tableId, tableData);
    } catch (error) {
      console.error('Error starting round:', error);
      alert('Failed to start round. Make sure there are at least 2 active players.');
    }
  }, [tableId, tableData]);

  const handleMoveDealer = useCallback(async () => {
    if (!tableId) return;
    
    try {
      await moveDealer(tableId);
    } catch (error) {
      console.error('Error moving dealer:', error);
      alert('Failed to move dealer.');
    }
  }, [tableId]);

  const handlePlayerAction = useCallback(async (action: PlayerAction, raiseAmount?: number) => {
    if (!tableId || !tableData || !playerId) return;
    
    try {
      await playerAction(tableId, tableData, playerId, action, raiseAmount);
    } catch (error) {
      console.error('Error performing action:', error);
      alert('Failed to perform action.');
    }
  }, [tableId, tableData, playerId]);

  const handleEndRound = useCallback(async (winnerId: string) => {
    if (!tableId || !tableData) return;
    
    try {
      await endRound(tableId, tableData, winnerId);
    } catch (error) {
      console.error('Error ending round:', error);
      alert('Failed to end round.');
    }
  }, [tableId, tableData]);

  const handleUpdateChips = useCallback(async (playerIdToUpdate: string, newChips: string) => {
    if (!tableId) return;
    
    try {
      await updatePlayerChips(tableId, playerIdToUpdate, newChips);
    } catch (error) {
      console.error('Error updating chips:', error);
      alert('Failed to update chips.');
    }
  }, [tableId]);

  const handleUpdateBlinds = useCallback(async (smallBlind: string, bigBlind: string) => {
    if (!tableId) return;
    
    try {
      await updateBlinds(tableId, smallBlind, bigBlind);
    } catch (error) {
      console.error('Error updating blinds:', error);
      alert('Failed to update blinds.');
    }
  }, [tableId]);

  const handleLeaveTable = useCallback(async () => {
    if (!tableId || !playerId) return;
    
    try {
      await leaveTable(tableId, playerId);
      setScreen('welcome');
      setTableId('');
      setPlayerId('');
    } catch (error) {
      console.error('Error leaving table:', error);
      alert('Failed to leave table.');
    }
  }, [tableId, playerId]);

  const handleContinueFromWelcome = () => {
    if (playerName.trim()) {
      setScreen('lobby');
    }
  };

  if (screen === 'welcome') {
    return (
      <WelcomeScreen
        playerName={playerName}
        setPlayerName={setPlayerName}
        onContinue={handleContinueFromWelcome}
      />
    );
  }

  if (screen === 'lobby') {
    return (
      <LobbyScreen
        playerName={playerName}
        onCreateTable={handleCreateTable}
        onJoinTable={handleJoinTable}
      />
    );
  }

  if (screen === 'table') {
    return (
      <TableScreen
        tableId={tableId}
        tableData={tableData}
        currentPlayerId={playerId}
        onStartRound={handleStartRound}
        onMoveDealer={handleMoveDealer}
        onPlayerAction={handlePlayerAction}
        onEndRound={handleEndRound}
        onUpdateChips={handleUpdateChips}
        onUpdateBlinds={handleUpdateBlinds}
        onLeaveTable={handleLeaveTable}
      />
    );
  }

  return null;
}

export default App;