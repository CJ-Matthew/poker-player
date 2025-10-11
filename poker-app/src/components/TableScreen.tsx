import React, { useState } from 'react';
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
  onUpdateBlinds,
}) => {
  const [isEditingChips, setIsEditingChips] = useState(false); // State to toggle modal visibility
  const [chipValues, setChipValues] = useState<Record<string, string>>({}); // State to store updated chip values

  if (!tableData) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-gradient-to-br from-blue-500 to-purple-600 text-white">
        <p className="text-xl font-semibold">Loading...</p>
      </div>
    );
  }

  const players = Object.entries(tableData.players).sort((a, b) => a[1].position - b[1].position);

  const handleUpdateChips = (): void => {
    Object.entries(chipValues).forEach(([playerId, newChips]) => {
      if (parseInt(newChips, 10) >= 0) {
        onUpdateChips(playerId, newChips);
      }
    });
    setIsEditingChips(false); // Close the modal after updating
  };

  const handleChipInputChange = (playerId: string, value: string): void => {
    setChipValues((prev) => ({
      ...prev,
      [playerId]: value,
    }));
  };

  const handleUpdateBlinds = (): void => {
    const newSB = prompt('Enter new Small Blind:', String(tableData.smallBlind));
    const newBB = prompt('Enter new Big Blind:', String(tableData.bigBlind));
    if (newSB && newBB) onUpdateBlinds(newSB, newBB);
  };

  const handleRaise = (): void => {
    const amount = prompt('Raise amount:');
    if (amount && parseInt(amount, 10) > 0) {
      onPlayerAction('raise', parseInt(amount, 10));
    } else {
      alert('Raise amount must be greater than 0!');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-gradient-to-br from-blue-500 to-purple-600 text-white">
      <div className="max-w-6xl w-full p-6 space-y-6">
        {/* Table Info */}
        <div className="p-6 bg-blue-900/50 backdrop-blur-sm shadow-xl rounded-xl border border-blue-400/30">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Table ID: {tableId}</h2>
              <p className="text-sm text-gray-300">Share this ID with friends to join</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleUpdateBlinds}
                className="text-sm text-blue-300 hover:text-blue-100"
              >
                Edit Blinds
              </button>
              <button
                onClick={() => setIsEditingChips(true)}
                className="text-sm text-blue-300 hover:text-blue-100"
              >
                Edit Chips
              </button>
            </div>
          </div>
        </div>

        {/* Modal for Editing Chips */}
        {isEditingChips && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-96">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Edit Player Chips</h3>
              <form className="space-y-4">
                {players.map(([id, player]) => (
                  <div key={id} className="flex items-center justify-between">
                    <span className="text-gray-800">{player.name}:</span>
                    <input
                      type="number"
                      value={chipValues[id] ?? player.chips}
                      onChange={(e) => handleChipInputChange(id, e.target.value)}
                      className="w-24 p-2 rounded-lg bg-gray-100 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </form>
              <div className="flex justify-end mt-6">
                <button
                  onClick={handleUpdateChips}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditingChips(false)}
                  className="ml-2 bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Player Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {players.map(([id, player], idx) => (
            <PlayerCard
              key={id}
              player={player}
              playerId={id}
              isDealer={idx === tableData.dealerPosition}
              isCurrentTurn={tableData.currentTurn === idx}
              onEditChips={() => {}} // No longer needed here
              onWinPot={onEndRound}
              showWinButton={players.filter(([, p]) => !p.folded).length > 1}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="p-6 bg-blue-900/50 backdrop-blur-sm shadow-xl rounded-xl border border-blue-400/30">
          <ActionButtons
            isMyTurn={tableData.currentTurn === players.findIndex(([id]) => id === currentPlayerId)}
            currentPlayer={players[tableData.currentTurn] || null}
            myPlayer={tableData.players[currentPlayerId]}
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