import React, { useState } from 'react';

interface LobbyScreenProps {
  playerName: string;
  onCreateTable: (smallBlind: string, bigBlind: string, buyIn: string) => void;
  onJoinTable: (tableId: string, buyIn: string) => void;
  onBack: () => void;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({
  playerName,
  onCreateTable,
  onJoinTable,
  onBack,
}) => {
  const [smallBlind, setSmallBlind] = useState('');
  const [bigBlind, setBigBlind] = useState('');
  const [buyIn, setBuyIn] = useState('');
  const [tableId, setTableId] = useState('');
  const [joinBuyIn, setJoinBuyIn] = useState('');

  return (
    // 1. Full-screen background and center everything
    <div className="flex flex-col items-center justify-center h-screen w-full bg-gradient-to-br from-blue-500 to-purple-600 text-white">
      
      {/* 2. Content wrapper for max width and vertical alignment */}
      <div className="max-w-4xl w-full p-6 space-y-6">
        
        <h1 className="text-4xl font-extrabold text-center mb-6">
          Welcome, {playerName}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Create Table Section */}
          <div className="p-6 bg-blue-900/50 backdrop-blur-sm shadow-xl rounded-xl border border-blue-400/30">
            <h2 className="text-2xl font-semibold mb-4">Create a Table</h2>
            <input
              type="text"
              placeholder="Small Blind"
              value={smallBlind}
              onChange={(e) => setSmallBlind(e.target.value)}
              // Styling for white text in input and better focus state
              className="mb-3 w-full p-3 rounded-lg bg-white/10 text-white placeholder-gray-300 border border-transparent focus:outline-none focus:ring-2 focus:ring-white"
            />
            <input
              type="text"
              placeholder="Big Blind"
              value={bigBlind}
              onChange={(e) => setBigBlind(e.target.value)}
              className="mb-3 w-full p-3 rounded-lg bg-white/10 text-white placeholder-gray-300 border border-transparent focus:outline-none focus:ring-2 focus:ring-white"
            />
            <input
              type="text"
              placeholder="Buy-In Amount"
              value={buyIn}
              onChange={(e) => setBuyIn(e.target.value)}
              className="mb-6 w-full p-3 rounded-lg bg-white/10 text-white placeholder-gray-300 border border-transparent focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button
              onClick={() => onCreateTable(smallBlind, bigBlind, buyIn)}
              // Primary button style (bright white to match WelcomeScreen button)
              className="bg-white text-blue-600 hover:bg-gray-200 w-full font-bold py-3 rounded-lg shadow-md transition duration-150 ease-in-out disabled:opacity-50"
              disabled={!smallBlind || !bigBlind || !buyIn || !Number.isFinite(+smallBlind) || !Number.isFinite(+bigBlind) || !Number.isFinite(+buyIn)}
            >
              Create Table
            </button>
          </div>
          
          {/* Join Table Section */}
          <div className="p-6 bg-blue-900/50 backdrop-blur-sm shadow-xl rounded-xl border border-blue-400/30">
            <h2 className="text-2xl font-semibold mb-4">Join a Table</h2>
            <input
              type="text"
              placeholder="Table ID"
              value={tableId}
              onChange={(e) => setTableId(e.target.value)}
              className="mb-3 w-full p-3 rounded-lg bg-white/10 text-white placeholder-gray-300 border border-transparent focus:outline-none focus:ring-2 focus:ring-white"
            />
            <input
              type="text"
              placeholder="Buy-In Amount"
              value={joinBuyIn}
              onChange={(e) => setJoinBuyIn(e.target.value)}
              className="mb-6 w-full p-3 rounded-lg bg-white/10 text-white placeholder-gray-300 border border-transparent focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button
              onClick={() => onJoinTable(tableId, joinBuyIn)}
              // Secondary button style (a different color but same look/feel)
              className="bg-green-400 text-white hover:bg-green-500 w-full font-bold py-3 rounded-lg shadow-md transition duration-150 ease-in-out disabled:opacity-50"
              disabled={!tableId || !joinBuyIn || !Number.isFinite(+joinBuyIn)}
            >
              Join Table
            </button>
          </div>
        </div>

        {/* Back Button */}
        <div className="flex justify-center pt-4">
          <button
            onClick={onBack}
            // Muted, outline-style back button
            className="bg-transparent border border-white text-white hover:bg-white/20 font-semibold py-2 px-6 rounded-full transition duration-150 ease-in-out"
          >
            Back
          </button>
        </div>
        
      </div>
    </div>
  );
};