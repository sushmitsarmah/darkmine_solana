
import React from 'react';

interface StartScreenProps {
  onStartGame: () => void;
  walletProfile?: string | null;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStartGame, walletProfile }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <div className="w-full max-w-lg mx-auto border-4 border-gray-900 bg-[#3a3d52] p-12 box-shadow-hard" style={{backgroundImage: 'repeating-conic-gradient(#4a4d62 0% 25%, #3a3d52 0% 50%)', backgroundSize: '8px 8px'}}>
        {walletProfile && (
          <div className="mb-6 p-2 bg-black bg-opacity-50 rounded border border-green-600 text-green-400 font-mono text-xs">
            Miner: {walletProfile.slice(0, 8)}...{walletProfile.slice(-4)}
          </div>
        )}
        <h1 className="text-6xl md:text-7xl font-bold mb-4 text-yellow-400 text-shadow-hard">
          DarkMine
        </h1>
        <p className="text-lg text-gray-300 mb-12">
          Every swing is a gamble.
        </p>
        {!walletProfile && (
          <p className="text-sm text-orange-400 mb-6">
            Connect your wallet above to save progress
          </p>
        )}
        <button
          onClick={onStartGame}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-4 border-b-4 border-green-800 hover:border-green-600 rounded text-2xl transition-transform transform hover:scale-105"
        >
          START MINING
        </button>
      </div>
    </div>
  );
};

export default StartScreen;
