import React from 'react';
import type { Player, TableData } from '../types/poker';

interface ActionButtonsProps {
  isMyTurn: boolean;
  currentPlayer: [string, Player] | null;
  myPlayer: Player | undefined;
  currentBet: number;
  roundActive: boolean;
  tableData: TableData;
  onFold: () => void;
  onCall: () => void;
  onRaiseOpen: () => void;
  onStartRound: () => void;
  onWinPot: (winnerId: string) => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  isMyTurn, 
  currentPlayer,
  myPlayer,
  currentBet,
  roundActive,
  tableData,
  onFold, 
  onCall, 
  onRaiseOpen,
  onStartRound,
  onWinPot
}) => {
  const activePlayers = tableData.players.filter((player) => 
    player.active && !player.folded
  );
  
  const isOnlyOneActivePlayer = activePlayers.length === 1;
  
  // Find the winning player ID
  const winningPlayerIndex = isOnlyOneActivePlayer 
    ? tableData.players.findIndex(player => player.active && !player.folded)
    : -1;
  const winningPlayerId = winningPlayerIndex >= 0 ? tableData.playerIds[winningPlayerIndex] : '';

  if (!roundActive) {
    return (
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onStartRound}
          className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
          disabled={activePlayers.length < 2}
        >
          Start Round
        </button>
      </div>
    );
  }

  if (isMyTurn && myPlayer) {
    const callValue = currentBet - myPlayer.currentBet;

    return (
      <div className="">
        {/* Container for Fold, Call/Check, and Raise buttons */}
        {
          !isOnlyOneActivePlayer && (
            <div className="flex flex-wrap gap-3 mb-3">
          <button
            onClick={onFold}
            className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
          >
            Fold
          </button>
          <button
            onClick={onCall}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            {callValue === 0 ? 'Check' : `Call $${callValue}`}
          </button>
          <button
            onClick={onRaiseOpen}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition"
          >
            Raise
          </button>
        </div>
          )
        }
        
        {/* Container for Win Pot button (now on its own line) */}
        {isOnlyOneActivePlayer && (
          <div className="flex justify-center flex-wrap gap-3">
            <button
              onClick={() => onWinPot(winningPlayerId)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Win Pot
            </button>
          </div>
        )}
      </div>
    );
  }

  if (currentPlayer) {
    return (
      <div className="">
        <p className="text-lg mb-3">
          Waiting for <span className="font-bold">{currentPlayer[1].name}</span> to act...
        </p>
        
        {/* Show Win Pot button even when it's not your turn if only one active player */}
        {isOnlyOneActivePlayer && !myPlayer?.folded && (
          <div className="flex justify-center flex-wrap gap-3">
            <button
              onClick={() => onWinPot(winningPlayerId)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Win Pot
            </button>
          </div>
        )}
      </div>
    );
  }

  return null;
};