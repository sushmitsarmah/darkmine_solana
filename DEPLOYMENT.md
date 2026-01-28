# DarkMine Deployment Guide

## Deployment Summary

The Solana smart contracts have been successfully compiled and deployed to **devnet**.

### Program Information

- **Program ID**: `6u8zV7yYbDZg38eUabnwL6ghkghwFwZv7CHrZnh6xnxM`
- **Network**: Devnet
- **Deployment Signature**: `4xhiD5zYvCbj6DHUVKPuMJZrwGENLTb5sYLDAkwyZFKhuzgw6Aag2AAmJJqzEADvtBXeszc3S11jgVzPeSXhjk2m`

### Contract Features

The deployed contract includes:
- **Player Account Management**: Initialize and track player statistics
- **Game Result Submission**: Submit game scores, resources collected, and enemies defeated
- **Leaderboard System**: Track top 20 scores on-chain
- **Diamond Token Minting**: Claim diamond tokens based on in-game diamonds collected
- **Player Profiles**: Set custom player names

### Frontend Integration

The frontend has been updated with:
1. **IDL File**: `frontend/darkmine_contract.json` - contains the program interface
2. **Anchor Integration**: Added `@coral-xyz/anchor` dependency
3. **Custom Hooks**:
   - `useAnchorProgram.ts` - connects to the Anchor program
   - `useGameContract.ts` - provides game contract methods
4. **Automatic Submission**: Game results are automatically submitted to the blockchain when connected
5. **Player Initialization**: Player accounts are automatically created on first game

### Testing the Application

1. **Start the development server**:
   ```bash
   cd frontend
   npm run dev
   ```

2. **Connect your wallet**:
   - Make sure your Phantom wallet is set to **Devnet**
   - Connect your wallet in the game interface

3. **Play the game**:
   - Your game results will automatically be submitted to the blockchain when the game ends
   - Check your wallet for transaction confirmations

4. **View on Solana Explorer**:
   - Visit: `https://explorer.solana.com/address/6u8zV7yYbDZg38eUabnwL6ghkghwFwZv7CHrZnh6xnxM?cluster=devnet`

### Important Files

- **Contract**: `contracts/programs/contracts/src/lib.rs`
- **IDL**: `frontend/darkmine_contract.json`
- **Program Config**: `contracts/Anchor.toml`
- **Frontend Hooks**: `frontend/hooks/useGameContract.ts`, `frontend/hooks/useAnchorProgram.ts`

### Smart Contract Functions

1. **initialize_player()** - Creates a new player account (PDA)
2. **submit_game_result()** - Records game statistics on-chain
3. **initialize_leaderboard()** - Sets up the global leaderboard (admin only)
4. **mint_diamond_tokens()** - Converts in-game diamonds to tokens
5. **set_player_name()** - Updates player display name

### Next Steps

To deploy to mainnet:
1. Update `contracts/Anchor.toml` cluster to `mainnet-beta`
2. Run `anchor build`
3. Run `anchor deploy --provider.cluster mainnet-beta`
4. Update the program ID in `frontend/hooks/useAnchorProgram.ts`
5. Update the network in `frontend/components/SolanaProvider.tsx` to `WalletAdapterNetwork.Mainnet`

### Troubleshooting

- **Wallet not connecting**: Make sure Phantom wallet is set to Devnet
- **Transaction failing**: Ensure you have devnet SOL (use `solana airdrop 2`)
- **Player account errors**: The app will automatically initialize player accounts on first use
