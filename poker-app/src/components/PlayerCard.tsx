import React from 'react';
import type { Player } from '../types/poker';

interface PlayerCardProps {
  player: Player;
  isDealer: boolean;
  isCurrentTurn: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ 
  player,
  isDealer, 
  isCurrentTurn, 
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
    </div>
  );
};