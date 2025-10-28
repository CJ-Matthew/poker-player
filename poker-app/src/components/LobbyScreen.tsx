import React, { useState } from 'react';

interface LobbyScreenProps {
  playerName: string;
  onCreateTable: (smallBlind: string, bigBlind: string, buyIn: string) => void;
  onJoinTable: (tableId: string, buyIn: string) => void;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({
  playerName,
  onCreateTable,
  onJoinTable,
}) => {
  const [mode, setMode] = useState<'select' | 'create' | 'join'>('select');
  const [smallBlind, setSmallBlind] = useState('1');
  const [bigBlind, setBigBlind] = useState('2');
  const [buyIn, setBuyIn] = useState('100');
  const [tableIdToJoin, setTableIdToJoin] = useState('');

  const handleCreateTable = () => {
    if (smallBlind && bigBlind && buyIn) {
      onCreateTable(smallBlind, bigBlind, buyIn);
    }
  };

  const handleJoinTable = () => {
    if (tableIdToJoin && buyIn) {
      onJoinTable(tableIdToJoin, buyIn);
    }
  };

  const handleInputChange = (
    setter: React.Dispatch<React.SetStateAction<string>>,
    value: string
  ) => {
    if (value === '' || /^\d+$/.test(value)) {
      setter(value);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
        <h1 className="text-3xl font-bold text-center mb-2">Welcome, {playerName}!</h1>
        <p className="text-center text-white/80 mb-8">Choose an option to continue</p>

        {mode === 'select' && (
          <div className="space-y-4">
            <button
              onClick={() => setMode('create')}
              className="w-full bg-white text-blue-600 px-6 py-4 rounded-lg font-semibold hover:bg-blue-50 transition"
            >
              Create New Table
            </button>
            <button
              onClick={() => setMode('join')}
              className="w-full bg-white/20 backdrop-blur-sm border border-white/30 px-6 py-4 rounded-lg font-semibold hover:bg-white/30 transition"
            >
              Join Existing Table
            </button>
          </div>
        )}

        {mode === 'create' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Small Blind</label>
              <input
                type="text"
                value={smallBlind}
                onChange={(e) => handleInputChange(setSmallBlind, e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Big Blind</label>
              <input
                type="text"
                value={bigBlind}
                onChange={(e) => handleInputChange(setBigBlind, e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Buy-In Amount</label>
              <input
                type="text"
                value={buyIn}
                onChange={(e) => handleInputChange(setBuyIn, e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setMode('select')}
                className="flex-1 bg-white/20 backdrop-blur-sm border border-white/30 px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition"
              >
                Back
              </button>
              <button
                onClick={handleCreateTable}
                className="flex-1 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                Create
              </button>
            </div>
          </div>
        )}

        {mode === 'join' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Table ID</label>
              <input
                type="text"
                value={tableIdToJoin}
                onChange={(e) => setTableIdToJoin(e.target.value)}
                placeholder="Enter table ID"
                className="w-full px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Buy-In Amount</label>
              <input
                type="text"
                value={buyIn}
                onChange={(e) => handleInputChange(setBuyIn, e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setMode('select')}
                className="flex-1 bg-white/20 backdrop-blur-sm border border-white/30 px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition"
              >
                Back
              </button>
              <button
                onClick={handleJoinTable}
                className="flex-1 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                Join
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};