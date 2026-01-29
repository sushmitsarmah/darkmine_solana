import { useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { useAnchorProgram } from './useAnchorProgram';
import { BN } from '@coral-xyz/anchor';

const TREASURY_ADDRESS = new PublicKey("7hobWVCH1mVBtedRndouStN2ku5UF6E2Zb1gCHqexeRp");

export function useGameContract() {
  const { program, programId } = useAnchorProgram();
  const wallet = useWallet();

  const getPlayerAccountPDA = useCallback(
    (playerPubkey: PublicKey) => {
      return PublicKey.findProgramAddressSync(
        [Buffer.from('player'), playerPubkey.toBuffer()],
        programId
      );
    },
    [programId]
  );

  const getLeaderboardPDA = useCallback(() => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('leaderboard')],
      programId
    );
  }, [programId]);

  const initializePlayer = useCallback(async () => {
    if (!program || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    console.log('@@!!!! Initializing player')

    const [playerAccountPDA] = getPlayerAccountPDA(wallet.publicKey);

    try {
      console.log('!!!!!!!!!!')
      const tx = await program.methods
        .initializePlayer()
        .accounts({
          playerAccount: playerAccountPDA,
          player: wallet.publicKey,
          treasury: TREASURY_ADDRESS,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log('Player initialized:', tx);
      return tx;
    } catch (error) {
      console.error('Error initializing player:', error);
      throw error;
    }
  }, [program, wallet.publicKey, getPlayerAccountPDA]);

  const getPlayerAccount = useCallback(async () => {
    if (!program || !wallet.publicKey) {
      return null;
    }

    try {
      const [playerAccountPDA] = getPlayerAccountPDA(wallet.publicKey);
      const account = await program.account.playerAccount.fetch(playerAccountPDA);
      return account;
    } catch (error) {
      console.log('Player account not found or error fetching:', error);
      return null;
    }
  }, [program, wallet.publicKey, getPlayerAccountPDA]);

  const submitGameResult = useCallback(
    async (
      score: number,
      coalCollected: number,
      oreCollected: number,
      diamondsCollected: number,
      enemiesDefeated: number
    ) => {
      if (!program || !wallet.publicKey) {
        throw new Error('Wallet not connected');
      }

      const [playerAccountPDA] = getPlayerAccountPDA(wallet.publicKey);
      const [leaderboardPDA] = getLeaderboardPDA();

      try {
        const tx = await program.methods
          .submitGameResult(
            new BN(score),
            new BN(coalCollected),
            new BN(oreCollected),
            new BN(diamondsCollected),
            enemiesDefeated
          )
          .accounts({
            playerAccount: playerAccountPDA,
            player: wallet.publicKey,
            leaderboard: leaderboardPDA,
          })
          .rpc();

        console.log('Game result submitted:', tx);
        return tx;
      } catch (error) {
        console.error('Error submitting game result:', error);
        throw error;
      }
    },
    [program, wallet.publicKey, getPlayerAccountPDA, getLeaderboardPDA]
  );

  const getLeaderboard = useCallback(async () => {
    if (!program) {
      return null;
    }

    try {
      const [leaderboardPDA] = getLeaderboardPDA();
      const leaderboard = await program.account.leaderboard.fetch(leaderboardPDA);
      return leaderboard;
    } catch (error) {
      console.log('Leaderboard not found or error fetching:', error);
      return null;
    }
  }, [program, getLeaderboardPDA]);

  const setPlayerName = useCallback(
    async (name: string) => {
      if (!program || !wallet.publicKey) {
        throw new Error('Wallet not connected');
      }

      const [playerAccountPDA] = getPlayerAccountPDA(wallet.publicKey);

      try {
        const tx = await program.methods
          .setPlayerName(name)
          .accounts({
            playerAccount: playerAccountPDA,
            player: wallet.publicKey,
          })
          .rpc();

        console.log('Player name set:', tx);
        return tx;
      } catch (error) {
        console.error('Error setting player name:', error);
        throw error;
      }
    },
    [program, wallet.publicKey, getPlayerAccountPDA]
  );

  return {
    program,
    initializePlayer,
    getPlayerAccount,
    submitGameResult,
    getLeaderboard,
    setPlayerName,
    getPlayerAccountPDA,
    getLeaderboardPDA,
  };
}
