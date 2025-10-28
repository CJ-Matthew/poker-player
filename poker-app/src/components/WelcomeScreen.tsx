import React from 'react';

interface WelcomeScreenProps {
  playerName: string;
  setPlayerName: (name: string) => void;
  onContinue: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  playerName,
  setPlayerName,
  onContinue,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && playerName.trim()) {
      onContinue();
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
        <h1 className="text-4xl font-bold text-center mb-8">Poker Player</h1>
        <div className="space-y-6">
          <div>
            <label htmlFor="playerName" className="block text-sm font-medium mb-2">
              Enter your name
            </label>
            <input
              id="playerName"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Your name"
              className="w-full px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-black placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
          <button
            onClick={onContinue}
            disabled={!playerName.trim()}
            className="w-full bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};