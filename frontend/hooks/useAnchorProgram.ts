import { useMemo } from 'react';
import { AnchorProvider, Program, Idl } from '@coral-xyz/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import IDL from '../darkmine_contract.json';

export const PROGRAM_ID = new PublicKey('6u8zV7yYbDZg38eUabnwL6ghkghwFwZv7CHrZnh6xnxM');

export function useAnchorProgram() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const program = useMemo(() => {
    if (!wallet.publicKey) {
      return null;
    }

    const provider = new AnchorProvider(
      connection,
      wallet as any,
      { commitment: 'confirmed' }
    );

    return new Program(IDL as Idl, provider);
  }, [connection, wallet]);

  return { program, programId: PROGRAM_ID };
}
