import React, { useState } from 'react';

interface LobbyScreenProps {
  playerName: string;
  onCreateTable: (smallBlind: string, bigBlind: string) => void;
  onJoinTable: (tableId: string, buyIn: string) => void;
  onBack: () => void;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({ 
  playerName, 
  onCreateTable, 
  onJoinTable, 
  onBack 
}) => {
  const [smallBlind, setSmallBlind] = useState<string>('');
  const [bigBlind, setBigBlind] = useState<string>('');
  const [joinTableId, setJoinTableId] = useState<string>('');
  const [buyIn, setBuyIn] = useState<string>('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-950 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Welcome, {playerName}!</h2>
        
        <div className="space-y-6">
          <div className="border-2 border-gray-200 rounded-lg p-4">
            <h3 className="text-xl font-semibold mb-4">Create New Table</h3>
            <input
              type="number"
              placeholder="Small Blind"
              value={smallBlind}
              onChange={(e) => setSmallBlind(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="number"
              placeholder="Big Blind"
              value={bigBlind}
              onChange={(e) => setBigBlind(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={() => onCreateTable(smallBlind, bigBlind)}
              className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Create Table
            </button>
          </div>

          <div className="border-2 border-gray-200 rounded-lg p-4">
            <h3 className="text-xl font-semibold mb-4">Join Existing Table</h3>
            <input
              type="text"
              placeholder="Table ID"
              value={joinTableId}
              onChange={(e) => setJoinTableId(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Buy-in Amount"
              value={buyIn}
              onChange={(e) => setBuyIn(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => onJoinTable(joinTableId, buyIn)}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Join Table
            </button>
          </div>
        </div>

        <button
          onClick={onBack}
          className="w-full mt-6 text-gray-600 hover:text-gray-800 transition"
        >
          ← Back
        </button>
      </div>
    </div>
  );
};