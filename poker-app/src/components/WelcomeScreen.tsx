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
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-gradient-to-br from-blue-500 to-purple-600 text-white">
      <h1 className="text-4xl font-bold mb-6">Poker Player</h1>
      <input
        type="text"
        placeholder="Enter your name"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        // Added styling for the input to look better with the background
        className="mb-4 w-80 p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white"
      />
      <button
        onClick={onContinue}
        // Added styling for the button to look better
        className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-full shadow-lg transition duration-150 ease-in-out disabled:opacity-50"
        disabled={!playerName.trim()} // Good practice: disable button until a name is entered
      >
        Continue
      </button>
    </div>
  );
};