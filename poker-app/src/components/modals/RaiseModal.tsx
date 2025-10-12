import React, { useState } from 'react';

interface RaiseModalProps {
  currentBet: number;
  minRaise: number;
  onRaise: (amount: number) => void;
  onCancel: () => void;
}

export const RaiseModal: React.FC<RaiseModalProps> = ({
  minRaise,
  onRaise,
  onCancel,
}) => {
  const [raiseAmount, setRaiseAmount] = useState<string>(String(minRaise)); // Use string for input value

  const handleRaise = () => {
    const numericRaiseAmount = Number(raiseAmount);
    if (numericRaiseAmount >= minRaise) {
      onRaise(numericRaiseAmount);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string or valid numeric input
    if (value === '' || /^\d+$/.test(value)) {
      setRaiseAmount(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !(raiseAmount === '' || Number(raiseAmount) < minRaise)) {
      e.preventDefault(); // Prevent default form submission behavior
      handleRaise(); // Trigger the raise action
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onKeyDown={handleKeyDown}
    >
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Raise</h3>
        <form className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="raiseAmount" className="text-gray-800">
              Raise Amount:
            </label>
            <input
              id="raiseAmount"
              type="text" // Use text input to allow empty values
              value={raiseAmount}
              onChange={handleInputChange}
              className="no-spinners w-24 p-2 rounded-lg bg-gray-100 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <p className="text-sm text-gray-600">
            Minimum raise: <span className="font-bold">${minRaise}</span>
          </p>
        </form>
        <div className="flex justify-end mt-6">
          <button
            onClick={onCancel}
            className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleRaise}
            className="ml-2 bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-50"
            disabled={raiseAmount === '' || Number(raiseAmount) < minRaise} // Disable button if input is empty
          >
            Raise
          </button>
        </div>
      </div>
    </div>
  );
};