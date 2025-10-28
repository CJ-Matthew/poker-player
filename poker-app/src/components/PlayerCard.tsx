import React from 'react';
import type { Player } from '../types/poker';

interface PlayerCardProps {
  player: Player;
  playerId: string;
  isDealer: boolean;
  isSmallBlind: boolean;
  isBigBlind: boolean;
  isCurrentTurn: boolean;
  isCurrentPlayer: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  isDealer,
  isSmallBlind,
  isBigBlind,
  isCurrentTurn,
  isCurrentPlayer,
}) => {
  return (
    <div
      className={`p-4 rounded-lg shadow-lg border-2 transition-all duration-200 h-fit ${
        isCurrentTurn
          ? 'bg-yellow-100 border-yellow-400 shadow-yellow-400/50'
          : player.folded
          ? 'bg-gray-200 border-gray-400 opacity-60'
          : player.active
          ? 'bg-white border-blue-400'
          : 'bg-red-100 border-red-400 opacity-40'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className={`font-bold text-lg ${
          isCurrentPlayer 
            ? 'text-blue-600' 
            : player.folded 
            ? 'text-gray-500' 
            : 'text-gray-800'
        }`}>
          {player.name}
        </h3>
        <div className="flex gap-1">
          {isDealer && (
            <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-bold">
              D
            </span>
          )}
          {isSmallBlind && (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
              SB
            </span>
          )}
          {isBigBlind && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
              BB
            </span>
          )}
        </div>
      </div>
      
      <div className="space-y-1">
        <p className={`text-sm ${player.folded ? 'text-gray-400' : 'text-gray-600'}`}>
          Chips: <span className="font-semibold">${player.chips}</span>
        </p>
        
        {player.currentBet > 0 && (
          <p className={`text-sm ${player.folded ? 'text-gray-400' : 'text-blue-600'}`}>
            Bet: <span className="font-semibold">${player.currentBet}</span>
          </p>
        )}
        
        {player.folded && (
          <p className="text-red-500 text-sm font-semibold">FOLDED</p>
        )}
        
        {!player.active && (
          <p className="text-red-600 text-sm font-semibold">SITTING OUT</p>
        )}
      </div>
    </div>
  );
};