import React from 'react';
import { PlayerCard } from './PlayerCard';
import { ActionButtons } from './ActionButtons';
import type { TableData, PlayerAction } from '../types/poker';

interface TableScreenProps {
  tableId: string;
  tableData: TableData | null;
  currentPlayerId: string;
  onStartRound: () => void;
  onMoveDealer: () => void;
  onPlayerAction: (action: PlayerAction, raiseAmount?: number) => void;
  onEndRound: (winnerId: string) => void;
  onUpdateChips: (playerId: string, newChips: string) => void;
  onUpdateBlinds: (smallBlind: string, bigBlind: string) => void;
}

export const TableScreen: React.FC<TableScreenProps> = ({ 
  tableId, 
  tableData, 
  currentPlayerId,
  onStartRound,
  onMoveDealer,
  onPlayerAction,
  onEndRound,
  onUpdateChips,
  onUpdateBlinds
}) => {
  if (!tableData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-950 flex items-center justify-center">
        <p className="text-white text-xl">Loading...</p>
      </div>
    );
  }

  const players = Object.entries(tableData.players).sort((a, b) => a[1].position - b[1].position);
  const currentPlayer = tableData.currentTurn >= 0 ? players[tableData.currentTurn] : null;
  const isMyTurn = currentPlayer ? currentPlayer[0] === currentPlayerId : false;
  const myPlayer = tableData.players[currentPlayerId];
  const activePlayers = players.filter(([, p]) => !p.folded);

  const handleEditChips = (playerId: string, currentChips: number): void => {
    const newChips = prompt('Enter new chip amount:', String(currentChips));
    if (newChips) onUpdateChips(playerId, newChips);
  };

  const handleUpdateBlinds = (): void => {
    const newSB = prompt('Enter new Small Blind:', String(tableData.smallBlind));
    const newBB = prompt('Enter new Big Blind:', String(tableData.bigBlind));
    if (newSB && newBB) onUpdateBlinds(newSB, newBB);
  };

  const handleRaise = (): void => {
    const amount = prompt('Raise amount:');
    if (amount) onPlayerAction('raise', parseInt(amount));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-950 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Table ID: {tableId}</h2>
              <p className="text-sm text-gray-600">Share this ID with friends to join</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">Blinds: ${tableData.smallBlind}/${tableData.bigBlind}</p>
              <button onClick={handleUpdateBlinds} className="text-sm text-blue-600 hover:text-blue-800">
                Edit Blinds
              </button>
            </div>
          </div>
        </div>

        <div className="bg-green-700 rounded-lg shadow-lg p-8 mb-4 text-center">
          <h3 className="text-white text-xl font-semibold mb-2">Pot</h3>
          <p className="text-4xl font-bold text-yellow-300">${tableData.pot}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
          {players.map(([id, player], idx) => (
            <PlayerCard
              key={id}
              player={player}
              playerId={id}
              isDealer={idx === tableData.dealerPosition}
              isCurrentTurn={currentPlayer ? currentPlayer[0] === id : false}
              onEditChips={handleEditChips}
              onWinPot={onEndRound}
              showWinButton={activePlayers.length > 1}
            />
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <ActionButtons
            isMyTurn={isMyTurn}
            currentPlayer={currentPlayer}
            myPlayer={myPlayer}
            currentBet={tableData.currentBet}
            roundActive={tableData.roundActive}
            onFold={() => onPlayerAction('fold')}
            onCall={() => onPlayerAction('call')}
            onRaise={handleRaise}
            onStartRound={onStartRound}
            onMoveDealer={onMoveDealer}
          />
        </div>
      </div>
    </div>
  );
};