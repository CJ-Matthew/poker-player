import React from 'react';
import type { Player } from '../../types/poker';

interface EditChipsModalProps {
  players: Record<string, Player>;
  playerOrder: string[];
  chipValues: Record<string, string>;
  onChipChange: (playerId: string, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const EditChipsModal: React.FC<EditChipsModalProps> = ({
  players,
  playerOrder,
  chipValues,
  onChipChange,
  onSave,
  onCancel,
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-lg p-6 w-96">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Edit Player Chips</h3>
      <form className="space-y-4">
        {playerOrder.map((playerId) => {
          const player = players[playerId];
          return (
            <div key={playerId} className="flex items-center justify-between">
              <span className="text-gray-800">{player.name}:</span>
              <input
                type="number"
                value={chipValues[playerId] ?? player.chips}
                onChange={(e) => onChipChange(playerId, e.target.value)}
                className="no-spinners w-24 p-2 rounded-lg bg-gray-100 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          );
        })}
      </form>
      <div className="flex justify-end mt-6">
        <button
          onClick={onCancel}
          className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className="ml-2 bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition"
        >
          Save
        </button>
      </div>
    </div>
  </div>
);
