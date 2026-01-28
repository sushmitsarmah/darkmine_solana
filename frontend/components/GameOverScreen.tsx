
import React from 'react';

interface GameOverScreenProps {
  score: number;
  onRestart: () => void;
  walletProfile?: string | null;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, onRestart, walletProfile }) => {
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
        <div className="text-3xl mb-10">
          <span className="text-gray-400">Final Score: </span>
          <span className="text-yellow-400">{score}</span>
        </div>
        {walletProfile && (
          <p className="text-sm text-blue-400 mb-6">
            Run saved on-chain!
          </p>
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
