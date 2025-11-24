import React from 'react';

interface EditBlindsModalProps {
  smallBlind: string;
  bigBlind: string;
  onSmallBlindChange: (value: string) => void;
  onBigBlindChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const EditBlindsModal: React.FC<EditBlindsModalProps> = ({
  smallBlind,
  bigBlind,
  onSmallBlindChange,
  onBigBlindChange,
  onSave,
  onCancel,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !(!smallBlind.trim() || !bigBlind.trim())) {
      e.preventDefault(); // Prevent default form submission behavior
      onSave(); // Trigger the save action
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: string) => void
  ) => {
    const value = e.target.value;
    // Allow empty string or valid numeric input
    if (value === '' || /^\d+$/.test(value)) {
      onChange(value);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onKeyDown={handleKeyDown}
    >
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Edit Blinds</h3>
        <form className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="smallBlind" className="text-gray-800">
              Small Blind:
            </label>
            <input
              id="smallBlind"
              type="text" // Use text input to allow empty values
              value={smallBlind}
              onChange={(e) => handleInputChange(e, onSmallBlindChange)}
              className="no-spinners w-24 p-2 rounded-lg bg-gray-100 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <label htmlFor="bigBlind" className="text-gray-800">
              Big Blind:
            </label>
            <input
              id="bigBlind"
              type="text" // Use text input to allow empty values
              value={bigBlind}
              onChange={(e) => handleInputChange(e, onBigBlindChange)}
              className="no-spinners w-24 p-2 rounded-lg bg-gray-100 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
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
            className="ml-2 bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-50"
            disabled={!smallBlind.trim() || !bigBlind.trim()} // Disable if inputs are empty
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
