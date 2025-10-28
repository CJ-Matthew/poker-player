import React, { useState, useMemo } from 'react';
import { PlayerCard } from './PlayerCard';
import { ActionButtons } from './ActionButtons';
import type { TableData, PlayerAction, Player } from '../types/poker';
import { EditBlindsModal } from './modals/EditBlindsModal';
import { RaiseModal } from './modals/RaiseModal';
import { LeaveTableModal } from './modals/LeaveTableModal';
import ManagePlayersModal from './modals/ManagePlayersModal';
import { getMinRaiseAmount } from '../services/firebase';

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
  onLeaveTable: () => void;
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
  onLeaveTable,
}) => {
  const [isEditingBlinds, setIsEditingBlinds] = useState(false);
  const [smallBlind, setSmallBlind] = useState('');
  const [bigBlind, setBigBlind] = useState('');
  const [isRearrangingPlayers, setIsRearrangingPlayers] = useState(false);
  const [chipValues, setChipValues] = useState<Record<string, string>>({});
  const [copyMessage, setCopyMessage] = useState('');
  const [isRaiseModalOpen, setIsRaiseModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  // Reorder players: active first, inactive last
  const orderedPlayers = useMemo(() => {
    if (!tableData) return [];
    
    return tableData.players
      .map((player, idx) => ({
        player,
        playerId: tableData.playerIds[idx],
        originalIndex: idx
      }))
      .sort((a, b) => {
        // Active players come first
        if (a.player.active && !b.player.active) return -1;
        if (!a.player.active && b.player.active) return 1;
        // Maintain original order within each group
        return a.originalIndex - b.originalIndex;
      });
  }, [tableData]);

  if (!tableData) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white">
        <p className="text-xl font-semibold">Loading...</p>
      </div>
    );
  }

  const currentPlayerIndex = tableData.playerIds.indexOf(currentPlayerId);
  const myPlayer = currentPlayerIndex >= 0 ? tableData.players[currentPlayerIndex] : undefined;

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
    setIsEditingBlinds(false);
  };

  const handleRaise = (amount: number): void => {
    if (amount && amount > 0) {
      onPlayerAction('raise', amount);
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

  const handleLeaveConfirm = () => {
    setIsLeaveModalOpen(false);
    onLeaveTable();
  };

  const currentPlayer: [string, Player] | null =
    tableData.currentTurn >= 0 && tableData.currentTurn < tableData.players.length
      ? [tableData.playerIds[tableData.currentTurn], tableData.players[tableData.currentTurn]]
      : null;

  const handleEditBlinds = (): void => {
    setSmallBlind(String(tableData.smallBlind));
    setBigBlind(String(tableData.bigBlind));
    setIsEditingBlinds(true);
  };

  const handleEditChips = (): void => {
    const initialChipValues = Object.fromEntries(
      tableData.playerIds.map((playerId, index) => [playerId, String(tableData.players[index].chips)])
    );
    setChipValues(initialChipValues);
    setIsRearrangingPlayers(true);
  };

  const getActivePlayersInfo = () => {
    const activeData = tableData.players
      .map((player, index) => ({ player, index }))
      .filter(({ player }) => player.active);
    return activeData;
  };

  const getBlindPositions = () => {
    if (!tableData.roundActive) {
      return { smallBlindIndex: -1, bigBlindIndex: -1 };
    }

    const activePlayersInfo = getActivePlayersInfo();
    if (activePlayersInfo.length < 2) {
      return { smallBlindIndex: -1, bigBlindIndex: -1 };
    }

    const dealerActiveIndex = activePlayersInfo.findIndex(({ index }) => index === tableData.dealerPosition);
    if (dealerActiveIndex === -1) {
      return { smallBlindIndex: -1, bigBlindIndex: -1 };
    }

    const sbActiveIndex = (dealerActiveIndex + 1) % activePlayersInfo.length;
    const bbActiveIndex = (dealerActiveIndex + 2) % activePlayersInfo.length;

    return {
      smallBlindIndex: activePlayersInfo[sbActiveIndex].index,
      bigBlindIndex: activePlayersInfo[bbActiveIndex].index
    };
  };

  const { smallBlindIndex, bigBlindIndex } = getBlindPositions();

  const getRoundStageDisplay = (stage: string): string => {
    switch (stage) {
      case 'PRE_FLOP':
        return 'Pre-Flop';
      case 'FLOP':
        return 'Flop';
      case 'TURN':
        return 'Turn';
      case 'RIVER':
        return 'River';
      default:
        return '';
    }
  };

  const minRaiseAmount = getMinRaiseAmount(tableData);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-500 to-purple-600 text-white">
      <style>{`
        .no-spinners::-webkit-outer-spin-button,
        .no-spinners::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .no-spinners {
          -moz-appearance: textfield;
        }
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
            <button
              onClick={onMoveDealer}
              className="text-sm text-blue-300 hover:text-blue-100 disabled:opacity-50"
              disabled={tableData.roundActive}
            >
              Dealer
            </button>
            <button
              onClick={handleEditChips}
              className="text-sm text-blue-300 hover:text-blue-100 disabled:opacity-50"
              disabled={tableData.roundActive}
            >
              Players
            </button>
            <button
              onClick={() => setIsLeaveModalOpen(true)}
              className="text-sm text-red-300 hover:text-red-100"
            >
              Leave
            </button>
          </div>
        </div>
      </div>

      {isRearrangingPlayers && (
        <ManagePlayersModal
          tableId={tableId}
          players={tableData.players}
          playerIds={tableData.playerIds}
          chipValues={chipValues}
          onChipChange={handleChipInputChange}
          onSaveChips={handleUpdateChips}
          onSaveRearrange={async (newOrderedIds) => {
            try {
              const { updatePlayerPositions } = await import('../services/firebase');
              await updatePlayerPositions(tableId, newOrderedIds);
              setIsRearrangingPlayers(false);
            } catch (err) {
              console.error('Error updating player positions:', err);
              alert('Failed to update positions.');
            }
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

      {isRaiseModalOpen && myPlayer && (
        <RaiseModal
          currentBet={tableData.currentBet}
          minRaise={minRaiseAmount}
          myCurrentBet={myPlayer.currentBet}
          onRaise={(amount: number) => {
            handleRaise(amount);
            setIsRaiseModalOpen(false);
          }}
          onCancel={() => setIsRaiseModalOpen(false)}
        />
      )}

      {isLeaveModalOpen && (
        <LeaveTableModal
          onConfirm={handleLeaveConfirm}
          onCancel={() => setIsLeaveModalOpen(false)}
        />
      )}

      <div className="min-h-screen flex flex-col pt-24 pb-8 px-6">
        <div className="max-w-6xl w-full mx-auto space-y-6">
          <div className="text-center p-4 bg-blue-900/50 backdrop-blur-sm shadow-xl rounded-xl border border-blue-400/30">
            <div className="flex justify-center items-center gap-6">
              <h3 className="text-2xl font-bold text-yellow-300">
                Current Pot: ${tableData.pot}
              </h3>
              {tableData.roundStage && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-300">|</span>
                  <h3 className="text-2xl font-bold text-green-300">
                    {getRoundStageDisplay(tableData.roundStage)}
                  </h3>
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 auto-rows-min">
            {orderedPlayers.map(({ player, playerId, originalIndex }) => (
              <PlayerCard
                key={playerId}
                player={player}
                playerId={playerId}
                isDealer={originalIndex === tableData.dealerPosition}
                isSmallBlind={originalIndex === smallBlindIndex}
                isBigBlind={originalIndex === bigBlindIndex}
                isCurrentTurn={tableData.currentTurn === originalIndex}
                isCurrentPlayer={playerId === currentPlayerId}
              />
            ))}
          </div>
          <div className="p-6 bg-blue-900/50 backdrop-blur-sm shadow-xl rounded-xl border border-blue-400/30 flex justify-center">
            <ActionButtons
              isMyTurn={tableData.currentTurn === tableData.playerIds.indexOf(currentPlayerId)}
              currentPlayer={currentPlayer}
              myPlayer={myPlayer}
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
    </div>
  );
};