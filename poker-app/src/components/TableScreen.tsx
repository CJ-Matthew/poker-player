import React, { useState } from 'react';
import { PlayerCard } from './PlayerCard';
import { ActionButtons } from './ActionButtons';
import type { TableData, PlayerAction, Player } from '../types/poker';
import { EditBlindsModal } from './modals/EditBlindsModal';
import { RaiseModal } from './modals/RaiseModal';
import ManagePlayersModal from './modals/ManagePlayersModal';


interface TableScreenProps {
  tableId: string;
  tableData: TableData | null;
  currentPlayerId: string;
  onStartRound: () => void;
  onMoveDealer: () => void;
  onPlayerAction: (action: PlayerAction, raiseAmount?: number) => void;
  onEndRound: (winnerId: string) => void;
  onUpdateChips: (playerId: string, newChips: string) => void;
  onUpdateBlinds: (smallBlind: string, bigBlind: string) => void;
}

export const TableScreen: React.FC<TableScreenProps> = ({
  tableId,
  tableData,
  currentPlayerId,
  onStartRound,
  onMoveDealer,
  onPlayerAction,
  onEndRound,
  onUpdateChips,
  onUpdateBlinds,
}) => {
  const [isEditingBlinds, setIsEditingBlinds] = useState(false);
  const [smallBlind, setSmallBlind] = useState('');
  const [bigBlind, setBigBlind] = useState('');
  const [isRearrangingPlayers, setIsRearrangingPlayers] = useState(false);
  const [chipValues, setChipValues] = useState<Record<string, string>>({});
  const [copyMessage, setCopyMessage] = useState('');
  const [isRaiseModalOpen, setIsRaiseModalOpen] = useState(false);

  if (!tableData) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-gradient-to-br from-blue-500 to-purple-600 text-white">
        <p className="text-xl font-semibold">Loading...</p>
      </div>
    );
  }

  const players = Object.entries(tableData.players).sort((a, b) => a[1].position - b[1].position);
  const playerOrder = players.map(([id]) => id); // Add this line

  const handleUpdateChips = (): void => {
    Object.entries(chipValues).forEach(([playerId, newChips]) => {
      if (parseInt(newChips, 10) >= 0) {
        onUpdateChips(playerId, newChips);
      }
    });
    setIsRearrangingPlayers(false);
  };

  const handleChipInputChange = (playerId: string, value: string): void => {
    setChipValues((prev) => ({
      ...prev,
      [playerId]: value,
    }));
  };

  const handleUpdateBlinds = (): void => {
    onUpdateBlinds(smallBlind, bigBlind);
    setIsEditingBlinds(false)
  };

  const handleRaise = (amount: string): void => {

    if (amount && parseInt(amount, 10) > 0) {
      onPlayerAction('raise', parseInt(amount, 10));
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(tableId);
      setCopyMessage('Table ID copied!');
      setTimeout(() => setCopyMessage(''), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      setCopyMessage('Failed to copy.');
      setTimeout(() => setCopyMessage(''), 2000);
    }
  };

  const currentPlayer: [string, Player] | null =
    tableData.currentTurn >= 0 && tableData.currentTurn < playerOrder.length
      ? [playerOrder[tableData.currentTurn], tableData.players[playerOrder[tableData.currentTurn]]]
      : null;

  const handleEditBlinds = (): void => {
    setSmallBlind(String(tableData.smallBlind)); // Initialize with current small blind
    setBigBlind(String(tableData.bigBlind)); // Initialize with current big blind
    setIsEditingBlinds(true); // Open the modal
  };

  return (
    <div className="relative flex flex-col items-center justify-center h-screen w-full bg-gradient-to-br from-blue-500 to-purple-600 text-white">

      <style>{`
        .no-spinners::-webkit-outer-spin-button,
        .no-spinners::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .no-spinners {
          -moz-appearance: textfield; /* Firefox */
        }
        /* Simple fade-in-out animation for the message */
        @keyframes fade-in-out {
          0%, 100% { opacity: 0; transform: translate(-50%, -20px); }
          10%, 90% { opacity: 1; transform: translate(-50%, 16px); }
        }
        .animate-fade-in-out {
          animation: fade-in-out 2s ease-in-out forwards;
        }
      `}</style>

      <div className="fixed top-0 left-0 w-full bg-blue-900/50 backdrop-blur-sm shadow-xl border-b border-blue-400/30 z-50">
        <div className="max-w-6xl mx-auto p-4 flex justify-between items-center">
          <div>
            {copyMessage && (
              <div className="fixed top-0 left-1/2 -translate-x-1/2 mt-4 px-4 py-2 bg-green-500 text-white rounded-md shadow-lg z-50 animate-fade-in-out">
                {copyMessage}
              </div>
            )}
            <div className="flex flex-col items-start">
              <div onClick={copyToClipboard} className="cursor-pointer">
                <h2 className="text-2xl font-bold">
                  Table ID:{' '}
                  <span className="text-blue-300 relative px-3 py-1 border border-black-600 rounded-md hover:border-blue-400 transition-colors duration-200">
                    {tableId}
                  </span>
                </h2>
              </div>
              <p className="text-sm text-gray-300 mt-2">Share this ID with friends to join</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleEditBlinds}
              className="text-sm text-blue-300 hover:text-blue-100 disabled:opacity-50"
              disabled={tableData.roundActive}
            >
              Blinds
            </button>
            {/* <button
              onClick={handleEditChips}
              className="text-sm text-blue-300 hover:text-blue-100 disabled:opacity-50"
              disabled={tableData.roundActive}
            >
              Chips
            </button> */}
            <button
              onClick={onMoveDealer}
              className="text-sm text-blue-300 hover:text-blue-100  disabled:opacity-50"
              disabled={tableData.roundActive}
            >
              Dealer
            </button>
            <button
              onClick={() => setIsRearrangingPlayers(true)}
              className="text-sm text-blue-300 hover:text-blue-100  disabled:opacity-50"
              disabled={tableData.roundActive}
            >
              Players
            </button>
          </div>
        </div>
      </div>

      {isRearrangingPlayers && (
        <ManagePlayersModal
          tableId={tableId}
          players={tableData.players}
          playerOrder={playerOrder}
          chipValues={chipValues}
          onChipChange={handleChipInputChange}
          onSaveChips={handleUpdateChips}
          onSaveRearrange={(newOrder) => {
            // Update player positions based on the new order
            const updatedPlayers = Object.fromEntries(
              newOrder.map(([id, player], index) => [
                id,
                { ...player, position: index },
              ])
            );
            // Update tableData.players with the new positions
            tableData.players = updatedPlayers;
          }}
          onClose={() => setIsRearrangingPlayers(false)}
        />
      )}

      {isEditingBlinds && (
        <EditBlindsModal
          smallBlind={smallBlind}
          bigBlind={bigBlind}
          onSmallBlindChange={setSmallBlind}
          onBigBlindChange={setBigBlind}
          onSave={handleUpdateBlinds}
          onCancel={() => setIsEditingBlinds(false)}
        />
      )}

      {/* {isRearrangingPlayers && (
        <RearrangePlayersModal
          tableId={tableId}
          players={tableData.players}
          onClose={() => setIsRearrangingPlayers(false)}
        />
      )} */}

      {isRaiseModalOpen && (
        <RaiseModal
          currentBet={tableData.currentBet}
          minRaise={tableData.currentBet*2}
          onRaise={(amount: number) => {
            handleRaise(String(amount));
            setIsRaiseModalOpen(false);
          }}
          onCancel={() => setIsRaiseModalOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="max-w-6xl w-full p-6 space-y-6 mt-20">
        <div className="text-center p-4 bg-blue-900/50 backdrop-blur-sm shadow-xl rounded-xl border border-blue-400/30">
          <h3 className="text-2xl font-bold text-yellow-300">Current Pot: ${tableData.pot}</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {playerOrder.map((id, idx) => (
            <PlayerCard
              key={id}
              player={tableData.players[id]}
              isDealer={idx === tableData.dealerPosition}
              isCurrentTurn={tableData.currentTurn === idx}
            />
          ))}
        </div>
        <div className="p-6 bg-blue-900/50 backdrop-blur-sm shadow-xl rounded-xl border border-blue-400/30 flex justify-center">
          <ActionButtons
            isMyTurn={tableData.currentTurn === playerOrder.findIndex((id) => id === currentPlayerId)}
            currentPlayer={currentPlayer}
            myPlayer={tableData.players[currentPlayerId]}
            currentBet={tableData.currentBet}
            roundActive={tableData.roundActive}
            tableData={tableData}
            onFold={() => onPlayerAction('fold')}
            onCall={() => onPlayerAction('call')}
            onRaiseOpen={() => setIsRaiseModalOpen(true)}
            onStartRound={onStartRound}
            onWinPot={onEndRound}
          />
        </div>
      </div>
    </div>
  );
};