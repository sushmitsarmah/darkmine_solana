import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey } from '@solana/web3.js';

// Import CSS for wallet adapter
import '@solana/wallet-adapter-react-ui/styles.css';

interface WalletConnectorProps {
  onWalletConnected?: (walletAddress: string) => void;
}

const WalletConnector: React.FC<WalletConnectorProps> = ({ onWalletConnected }) => {
  const { wallet, connected, publicKey } = useWallet();
  const [phantomInstalled, setPhantomInstalled] = useState(false);

  useEffect(() => {
    // Detect if Phantom is installed
    const isPhantomInstalled = typeof window !== 'undefined' &&
      (window as any).solana &&
      (window as any).solana.isPhantom;

    setPhantomInstalled(!!isPhantomInstalled);
  }, []);

  useEffect(() => {
    if (connected && publicKey && onWalletConnected) {
      onWalletConnected(publicKey.toString());
    }
  }, [connected, publicKey, onWalletConnected]);

  const handleInstallPhantom = () => {
    window.open('https://phantom.app/download', '_blank');
  };

  const getWalletDisplay = () => {
    if (!connected || !publicKey) {
      return 'Not Connected';
    }
    const address = publicKey.toString();
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-black bg-opacity-50 rounded-lg border border-gray-600">
      <div>
        <h2 className="text-xl font-bold text-yellow-400 mb-1">Miner Profile</h2>
        <p className="text-sm text-gray-300">
          {connected ? (
            <span className="text-green-400">Connected: {getWalletDisplay()}</span>
          ) : (
            <span className="text-yellow-400">Connect Wallet to Save Progress</span>
          )}
        </p>
      </div>

      <div className="ml-auto">
        {!phantomInstalled ? (
          <button
            onClick={handleInstallPhantom}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 3a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2H3zm11.293 3.293a1 1 0 011.414 0L16 8.586l1.293-1.293a1 1 0 111.414 1.414L17.414 10l1.293 1.293a1 1 0 01-1.414 1.414L16 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L14.586 10l-1.293-1.293a1 1 0 010-1.414z"/>
            </svg>
            Install Phantom
          </button>
        ) : (
          <WalletMultiButton className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-lg transition-colors duration-200" />
        )}
      </div>
    </div>
  );
};

export default WalletConnector;
