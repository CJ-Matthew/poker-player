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
  onRaise: () => void;
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
  onRaise,
  onStartRound,
  onWinPot
}) => {

  const activePlayers = Object.entries(tableData.players).filter(
    ([, player]) => !player.folded
  )
  const isOnlyOneActivePlayer = activePlayers.length === 1;
  const winningPlayerId = isOnlyOneActivePlayer ? activePlayers[0][0] : '-1';

  if (!roundActive) {
    return (
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onStartRound}
          className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
          disabled={Object.keys(tableData.players).length === 1}
        >
          Start Round
        </button>
        
      </div>
    );
  }

if (isMyTurn && myPlayer) {
  return (
    <div className="">
      {/* Container for Fold, Call, and Raise buttons */}
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
          Call ${currentBet - myPlayer.currentBet}
        </button>
        <button
          onClick={onRaise}
          className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition"
        >
          Raise
        </button>
      </div>
      
      {/* Container for Win Pot button (now on its own line) */}
      <div className="flex justify-center flex-wrap gap-3">
        <button
          onClick={() => onWinPot(winningPlayerId)}
          className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
          disabled={!isOnlyOneActivePlayer}
        >
          Win Pot
        </button>
      </div>
    </div>
  );
}

  if (currentPlayer) {
    return (
      <p className="text-lg">
        Waiting for <span className="font-bold">{currentPlayer[1].name}</span> to act...
      </p>
    );
  }

  return null;
};