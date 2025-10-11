import React, { useState } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult
} from '@hello-pangea/dnd';
import { updatePlayerPositions } from '../../services/firebase';
import { type Player } from '../../types/poker';

interface RearrangePlayersModalProps {
  tableId: string;
  players: Record<string, Player>;
  onClose: () => void;
}

const RearrangePlayersModal: React.FC<RearrangePlayersModalProps> = ({
  tableId,
  players,
  onClose
}) => {
  const [playerOrder, setPlayerOrder] = useState(
    Object.entries(players).sort((a, b) => a[1].position - b[1].position)
  );

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const reordered = Array.from(playerOrder);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    setPlayerOrder(reordered);
  };

  const handleSave = async () => {
    try {
      await updatePlayerPositions(tableId, playerOrder);
      onClose();
    } catch (err) {
      console.error('Error updating player positions:', err);
      alert('Failed to update positions.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-semibold text-center mb-4">Rearrange Players</h2>

        <div className="max-h-64 overflow-y-auto border rounded-lg">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="players">
              {(provided) => (
                <ul
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="divide-y divide-gray-200"
                >
                  {playerOrder.map(([id, player], index) => (
                    <Draggable key={id} draggableId={id} index={index}>
                      {(provided, snapshot) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`p-3 flex justify-between items-center transition-all duration-150 rounded ${
                            snapshot.isDragging ? 'bg-blue-50 shadow-md' : 'bg-white'
                          }`}
                        >
                          <span className="font-medium text-black">{player.name}</span>
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

        <div className="flex justify-end mt-6 gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-red-500 hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default RearrangePlayersModal;
