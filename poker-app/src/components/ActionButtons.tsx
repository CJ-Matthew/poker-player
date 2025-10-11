import React from 'react';
import type { Player } from '../types/poker';

interface ActionButtonsProps {
  isMyTurn: boolean;
  currentPlayer: [string, Player] | null;
  myPlayer: Player | undefined;
  currentBet: number;
  roundActive: boolean;
  onFold: () => void;
  onCall: () => void;
  onRaise: () => void;
  onStartRound: () => void;
  onMoveDealer: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  isMyTurn, 
  currentPlayer,
  myPlayer,
  currentBet,
  roundActive,
  onFold, 
  onCall, 
  onRaise,
  onStartRound,
  onMoveDealer
}) => {
  if (!roundActive) {
    return (
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onStartRound}
          className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
        >
          Start Round
        </button>
        <button
          onClick={onMoveDealer}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Move Dealer
        </button>
      </div>
    );
  }

  if (isMyTurn && myPlayer) {
    return (
      <div className="w-full">
        <p className="text-lg font-bold mb-3 text-green-700">Your Turn!</p>
        <div className="flex flex-wrap gap-3">
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
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Raise
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