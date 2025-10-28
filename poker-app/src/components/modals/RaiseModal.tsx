import React, { useState } from 'react';

interface RaiseModalProps {
  currentBet: number;
  minRaise: number;
  myCurrentBet: number;
  onRaise: (amount: number) => void;
  onCancel: () => void;
}

export const RaiseModal: React.FC<RaiseModalProps> = ({
  currentBet,
  minRaise,
  myCurrentBet,
  onRaise,
  onCancel,
}) => {
  const [raiseAmount, setRaiseAmount] = useState<string>(String(minRaise));

  const handleRaise = () => {
    const numericRaiseAmount = Number(raiseAmount);
    if (numericRaiseAmount >= minRaise) {
      onRaise(numericRaiseAmount);
    } else {
      alert(`Raise amount must be at least $${minRaise}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setRaiseAmount(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRaise();
    }
  };

  // Calculate the total bet amount
  const raiseBy = Number(raiseAmount || 0);
  const newTotalBet = currentBet + raiseBy;
  const additionalChipsNeeded = newTotalBet - myCurrentBet;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onKeyDown={handleKeyDown}
    >
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Raise</h3>
        <form className="space-y-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="raiseAmount" className="text-gray-800 font-semibold">
              Raise By:
            </label>
            <input
              id="raiseAmount"
              type="text"
              value={raiseAmount}
              onChange={handleInputChange}
              className="no-spinners w-full p-3 rounded-lg bg-gray-100 text-gray-800 text-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="bg-blue-50 p-3 rounded-lg space-y-1">
            <p className="text-sm text-gray-700">
              Minimum raise: <span className="font-bold text-blue-600">${minRaise}</span>
            </p>
            <p className="text-sm text-gray-700">
              Current bet to match: <span className="font-bold">${currentBet}</span>
            </p>
            <p className="text-sm text-gray-700">
              Your current bet: <span className="font-bold">${myCurrentBet}</span>
            </p>
            <div className="border-t border-blue-200 my-2 pt-2">
              <p className="text-sm text-gray-700">
                New total bet: <span className="font-bold text-green-600">${newTotalBet}</span>
              </p>
              <p className="text-sm text-gray-700">
                Additional chips needed: <span className="font-bold text-red-600">${additionalChipsNeeded}</span>
              </p>
            </div>
          </div>
        </form>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleRaise}
            className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-50"
            disabled={raiseAmount === '' || Number(raiseAmount) < minRaise}
          >
            Raise ${raiseAmount || 0}
          </button>
        </div>
      </div>
    </div>
  );
};