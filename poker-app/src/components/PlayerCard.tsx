import React from 'react';
import type { Player } from '../types/poker';

interface PlayerCardProps {
  player: Player;
  playerId: string;
  isDealer: boolean;
  isCurrentTurn: boolean;
  onEditChips: (playerId: string, currentChips: number) => void;
  onWinPot: (playerId: string) => void;
  showWinButton: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ 
  player, 
  playerId, 
  isDealer, 
  isCurrentTurn, 
  onEditChips, 
  onWinPot,
  showWinButton 
}) => {
  return (
    <div
      className={`bg-white rounded-lg p-4 shadow-lg ${
        player.folded ? 'opacity-50' : ''
      } ${isCurrentTurn ? 'ring-4 ring-yellow-400' : ''}`}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-bold text-gray-800">{player.name}</h4>
        {isDealer && (
          <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">D</span>
        )}
      </div>
      <p className="text-2xl font-bold text-green-600">${player.chips}</p>
      {player.currentBet > 0 && (
        <p className="text-sm text-gray-600">Bet: ${player.currentBet}</p>
      )}
      {player.folded && <p className="text-sm text-red-600 font-semibold">FOLDED</p>}
      
      <div className="mt-2 space-y-1">
        <button
          onClick={() => onEditChips(playerId, player.chips)}
          className="w-full text-xs bg-gray-200 hover:bg-gray-300 py-1 rounded"
        >
          Edit Chips
        </button>
        {showWinButton && (
          <button
            onClick={() => onWinPot(playerId)}
            className="w-full text-xs bg-green-500 hover:bg-green-600 text-white py-1 rounded"
          >
            Win Pot
          </button>
        )}
      </div>
    </div>
  );
};