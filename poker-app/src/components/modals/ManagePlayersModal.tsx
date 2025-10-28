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
  players: Player[];
  playerIds: string[];
  chipValues: Record<string, string>;
  onChipChange: (playerId: string, value: string) => void;
  onSaveChips: () => void;
  onSaveRearrange: (newOrderedIds: string[]) => void;
  onClose: () => void;
}

const ManagePlayersModal: React.FC<ManagePlayersModalProps> = ({
  players,
  playerIds,
  chipValues,
  onChipChange,
  onSaveChips,
  onSaveRearrange,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'rearrange' | 'chips'>('rearrange');
  
  // Filter out inactive players and create rearrangeable order
  const activePlayerData = playerIds
    .map((id, index) => ({ 
      id, 
      player: players[index],
      originalIndex: index 
    }))
    .filter(item => item.player.active);
  
  const inactivePlayerData = playerIds
    .map((id, index) => ({ 
      id, 
      player: players[index],
      originalIndex: index 
    }))
    .filter(item => !item.player.active);
  
  const [rearrangedOrder, setRearrangedOrder] = useState(activePlayerData);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const reordered = Array.from(rearrangedOrder);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    setRearrangedOrder(reordered);
  };

  const handleSaveRearrange = () => {
    // Combine reordered active players with inactive players at the end
    const newOrderedIds = [
      ...rearrangedOrder.map(item => item.id),
      ...inactivePlayerData.map(item => item.id)
    ];
    onSaveRearrange(newOrderedIds);
  };

  const handleSaveChips = () => {
    onSaveChips();
  };

  const handleInputChange = (playerId: string, value: string) => {
    // Allow empty string or valid numeric input
    if (value === '' || /^\d+$/.test(value)) {
      onChipChange(playerId, value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (activeTab === 'rearrange') {
        handleSaveRearrange();
      } else {
        handleSaveChips();
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onKeyDown={handleKeyDown}
    >
      <div className="bg-white rounded-lg shadow-lg p-6 w-96 max-h-[80vh] flex flex-col">
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
            Rearrange
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
          <div className="flex-1 overflow-y-auto border rounded-lg">
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="players">
                {(provided) => (
                  <ul
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="divide-y divide-gray-200"
                  >
                    {rearrangedOrder.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
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
                              {item.player.name}
                            </span>
                            <span className="text-sm text-gray-500">
                              Chips: {item.player.chips}
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
            
            {/* Show inactive players (non-draggable) */}
            {inactivePlayerData.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-500 mb-2 px-3">
                  Inactive Players
                </h4>
                <ul className="divide-y divide-gray-200 opacity-50">
                  {inactivePlayerData.map((item) => (
                    <li
                      key={item.id}
                      className="p-3 flex justify-between items-center bg-gray-50"
                    >
                      <span className="font-medium text-gray-600">
                        {item.player.name}
                      </span>
                      <span className="text-sm text-gray-400">
                        Left Table
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Edit Chips Tab */}
        {activeTab === 'chips' && (
          <form className="space-y-4 flex-1 overflow-y-auto">
            {/* Active Players */}
            {playerIds.map((playerId, index) => {
              const player = players[index];
              if (!player || !player.active) return null;
              
              return (
                <div
                  key={playerId}
                  className="flex items-center justify-between"
                >
                  <span className="text-gray-800">{player.name}:</span>
                  <input
                    type="text"
                    value={chipValues[playerId] ?? player.chips}
                    onChange={(e) => handleInputChange(playerId, e.target.value)}
                    className="no-spinners w-24 p-2 rounded-lg bg-gray-100 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              );
            })}
            
            {/* Inactive Players (read-only) */}
            {inactivePlayerData.length > 0 && (
              <>
                <div className="border-t pt-4 mt-4">
                  <h4 className="text-sm font-semibold text-gray-500 mb-2">
                    Inactive Players (Cannot Edit)
                  </h4>
                </div>
                {inactivePlayerData.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between opacity-50"
                  >
                    <span className="text-gray-600">{item.player.name}:</span>
                    <input
                      type="text"
                      value={item.player.chips}
                      disabled
                      className="no-spinners w-24 p-2 rounded-lg bg-gray-200 text-gray-600 border border-gray-300 cursor-not-allowed"
                    />
                  </div>
                ))}
              </>
            )}
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
              Save Order
            </button>
          )}
          {activeTab === 'chips' && (
            <button
              onClick={handleSaveChips}
              className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
              disabled={Object.keys(chipValues).length === 0}
            >
              Save Chips
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagePlayersModal;