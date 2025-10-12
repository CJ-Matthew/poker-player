import React, { useState } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd';
import type { Player } from '../../types/poker';

interface ManagePlayersModalProps {
  tableId: string;
  players: Record<string, Player>;
  playerOrder: string[];
  chipValues: Record<string, string>;
  onChipChange: (playerId: string, value: string) => void;
  onSaveChips: () => void;
  onSaveRearrange: (newOrder: [string, Player][]) => void;
  onClose: () => void;
}

const ManagePlayersModal: React.FC<ManagePlayersModalProps> = ({
  players,
  playerOrder,
  chipValues,
  onChipChange,
  onSaveChips,
  onSaveRearrange,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'rearrange' | 'chips'>('rearrange');
  const [rearrangedOrder, setRearrangedOrder] = useState(
    Object.entries(players).sort((a, b) => a[1].position - b[1].position)
  );

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const reordered = Array.from(rearrangedOrder);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    setRearrangedOrder(reordered);
  };

  const handleSaveRearrange = () => {
    onSaveRearrange(rearrangedOrder);
    onClose();
  };

  const handleSaveChips = () => {
    onSaveChips();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Manage Players</h3>

        {/* Tabs */}
        <div className="flex justify-around mb-4">
          <button
            onClick={() => setActiveTab('rearrange')}
            className={`px-4 py-2 rounded-lg font-semibold ${
              activeTab === 'rearrange'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            Rearrange Players
          </button>
          <button
            onClick={() => setActiveTab('chips')}
            className={`px-4 py-2 rounded-lg font-semibold ${
              activeTab === 'chips'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            Edit Chips
          </button>
        </div>

        {/* Rearrange Players Tab */}
        {activeTab === 'rearrange' && (
          <div className="max-h-64 overflow-y-auto border rounded-lg">
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="players">
                {(provided) => (
                  <ul
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="divide-y divide-gray-200"
                  >
                    {rearrangedOrder.map(([id, player], index) => (
                      <Draggable key={id} draggableId={id} index={index}>
                        {(provided, snapshot) => (
                          <li
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-3 flex justify-between items-center transition-all duration-150 rounded ${
                              snapshot.isDragging
                                ? 'bg-blue-50 shadow-md'
                                : 'bg-white'
                            }`}
                          >
                            <span className="font-medium text-black">
                              {player.name}
                            </span>
                            <span className="text-sm text-gray-500">
                              Chips: {player.chips}
                            </span>
                          </li>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        )}

        {/* Edit Chips Tab */}
        {activeTab === 'chips' && (
          <form className="space-y-4">
            {playerOrder.map((playerId) => {
              const player = players[playerId];
              return (
                <div
                  key={playerId}
                  className="flex items-center justify-between"
                >
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
        )}

        {/* Buttons */}
        <div className="flex justify-end mt-6 gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
          >
            Cancel
          </button>
          {activeTab === 'rearrange' && (
            <button
              onClick={handleSaveRearrange}
              className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
            >
              Save
            </button>
          )}
          {activeTab === 'chips' && (
            <button
              onClick={handleSaveChips}
              className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
            >
              Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagePlayersModal;