
import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useGameContract } from '../hooks/useGameContract';

interface GameStats {
  score: number;
  coal: number;
  ore: number;
  diamond: number;
  enemiesDefeated: number;
}

interface GameOverScreenProps {
  gameStats: GameStats;
  onRestart: () => void;
  walletProfile?: string | null;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ gameStats, onRestart, walletProfile }) => {
  const { connected } = useWallet();
  const { submitGameResult, initializePlayer, getPlayerAccount } = useGameContract();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const submitToBlockchain = async () => {
      if (!connected || submitting || submitted) {
        return;
      }

      setSubmitting(true);
      setError(null);

      try {
        // Check if player account exists, if not initialize it
        const playerAccount = await getPlayerAccount();
        if (!playerAccount) {
          console.log('Initializing player account...');
          await initializePlayer();
        }

        // Submit game result
        await submitGameResult(
          gameStats.score,
          gameStats.coal,
          gameStats.ore,
          gameStats.diamond,
          gameStats.enemiesDefeated
        );

        setSubmitted(true);
        console.log('Game result submitted successfully!');
      } catch (err: any) {
        console.error('Error submitting game result:', err);
        setError(err.message || 'Failed to submit game result');
      } finally {
        setSubmitting(false);
      }
    };

    if (connected && gameStats.score > 0) {
      submitToBlockchain();
    }
  }, [connected, gameStats, submitting, submitted, submitGameResult, initializePlayer, getPlayerAccount]);

  return (
    <div className="flex flex-col items-center justify-center text-center p-4">
      <div className="border-4 border-red-700 bg-gray-900 p-8 w-full max-w-md box-shadow-hard">
        {walletProfile && (
          <div className="mb-4 p-2 bg-black bg-opacity-50 rounded border border-green-600 text-green-400 font-mono text-xs">
            Miner: {walletProfile.slice(0, 8)}...{walletProfile.slice(-4)}
          </div>
        )}
        <h1 className="text-5xl font-bold mb-4 text-red-500 text-shadow-hard">
          GAME OVER
        </h1>
        <p className="text-2xl mb-8 text-gray-300">
          Your journey ends here.
        </p>
        <div className="text-2xl mb-6 space-y-2">
          <div>
            <span className="text-gray-400">Final Score: </span>
            <span className="text-yellow-400">{gameStats.score}</span>
          </div>
          <div className="text-lg text-gray-400">
            <div>Coal: {gameStats.coal}</div>
            <div>Ore: {gameStats.ore}</div>
            <div>Diamonds: {gameStats.diamond}</div>
            <div>Enemies Defeated: {gameStats.enemiesDefeated}</div>
          </div>
        </div>
        {walletProfile && (
          <div className="mb-6">
            {submitting && (
              <p className="text-sm text-yellow-400">
                Submitting to blockchain...
              </p>
            )}
            {submitted && (
              <p className="text-sm text-green-400">
                Run saved on-chain!
              </p>
            )}
            {error && (
              <p className="text-sm text-red-400">
                Error: {error}
              </p>
            )}
          </div>
        )}
        <button
          onClick={onRestart}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 border-b-4 border-blue-800 hover:border-blue-600 rounded text-2xl transition-transform transform hover:scale-105"
        >
          TRY AGAIN
        </button>
      </div>
    </div>
  );
};

export default GameOverScreen;
