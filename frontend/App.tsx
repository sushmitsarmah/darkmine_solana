
import React, { useState, useCallback, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import Game from './components/Game';
import StartScreen from './components/StartScreen';
import GameOverScreen from './components/GameOverScreen';
import WalletConnector from './components/WalletConnector';
import SolanaProvider from './components/SolanaProvider';
import { GameStatus } from './types';
import { useGameContract } from './hooks/useGameContract';
import { PublicKey } from '@solana/web3.js';

interface GameStats {
  score: number;
  coal: number;
  ore: number;
  diamond: number;
  enemiesDefeated: number;
}

const AppContent: React.FC = () => {
  const { connected, publicKey } = useWallet();
  const { initializePlayer, getPlayerAccount } = useGameContract();
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.START_SCREEN);
  const [gameStats, setGameStats] = useState<GameStats>({ score: 0, coal: 0, ore: 0, diamond: 0, enemiesDefeated: 0 });
  const [walletProfile, setWalletProfile] = useState<string | null>(null);
  const [playerInitialized, setPlayerInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  const handleWalletConnected = useCallback((address: string) => {
    setWalletProfile(address);
  }, []);

  const checkPlayerInitialization = useCallback(async () => {
    if (!publicKey || !getPlayerAccount) return;

    try {
      const account = await getPlayerAccount();
      setPlayerInitialized(!!account);
    } catch (error) {
      setPlayerInitialized(false);
    }
  }, [publicKey, getPlayerAccount]);

  useEffect(() => {
    if (connected && publicKey) {
      checkPlayerInitialization();
    } else {
      setPlayerInitialized(false);
    }
  }, [connected, publicKey, checkPlayerInitialization]);

  const handleInitializePlayer = useCallback(async () => {
    if (!initializePlayer || !publicKey) return;

    setIsInitializing(true);
    try {
      await initializePlayer();
      setPlayerInitialized(true);
    } catch (error) {
      console.error('Failed to initialize player:', error);
    } finally {
      setIsInitializing(false);
    }
  }, [initializePlayer, publicKey]);

  const startGame = useCallback(() => {
    setGameStatus(GameStatus.PLAYING);
  }, []);

  const endGame = useCallback((finalScore: number, inventory: { coal: number; ore: number; diamond: number }, enemiesDefeated: number) => {
    setGameStats({
      score: finalScore,
      coal: inventory.coal,
      ore: inventory.ore,
      diamond: inventory.diamond,
      enemiesDefeated,
    });
    setGameStatus(GameStatus.GAME_OVER);
  }, []);

  const restartGame = useCallback(() => {
    setGameStats({ score: 0, coal: 0, ore: 0, diamond: 0, enemiesDefeated: 0 });
    setGameStatus(GameStatus.PLAYING);
  }, []);

  const renderContent = () => {
    switch (gameStatus) {
      case GameStatus.PLAYING:
        return <Game onGameOver={endGame} walletProfile={walletProfile} />;
      case GameStatus.GAME_OVER:
        return <GameOverScreen gameStats={gameStats} onRestart={restartGame} walletProfile={walletProfile} />;
      case GameStatus.START_SCREEN:
      default:
        return (
          <StartScreen
            onStartGame={startGame}
            walletProfile={walletProfile}
            isWalletConnected={connected}
            playerInitialized={playerInitialized}
            onInitializePlayer={handleInitializePlayer}
            isInitializing={isInitializing}
          />
        );
    }
  };

  return (
    <div className="bg-black text-white min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-4">
        <WalletConnector onWalletConnected={handleWalletConnected} />

        <div className="text-center text-gray-400 text-sm">
          {connected ? (
            <p>
              Mining as: <span className="text-green-400 font-mono">{walletProfile?.slice(0, 8)}...{walletProfile?.slice(-4)}</span>
            </p>
          ) : (
            <p>Connect wallet to save your mining progress on-chain</p>
          )}
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <SolanaProvider>
      <AppContent />
    </SolanaProvider>
  );
};

export default App;
