use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, Mint};

use super::*;

#[derive(Accounts)]
pub struct InitializeDiamondMint<'info> {
    #[account(
        init,
        payer = authority,
        mint::decimals = 9,
        mint::authority = mint_authority,
        seeds = [b"diamond_mint"],
        bump
    )]
    pub diamond_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = authority,
        seeds = [b"mint_authority"],
        bump
    )]
    /// CHECK: This is a PDA used as mint authority
    pub mint_authority: AccountInfo<'info>,

    #[account(mut)]
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct InitializeLeaderboard<'info> {
    #[account(
        init,
        payer = authority,
        space = Leaderboard::SIZE,
        seeds = [b"leaderboard"],
        bump
    )]
    pub leaderboard: Account<'info, Leaderboard>,

    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Leaderboard {
    pub top_scores: [ScoreEntry; 100],
    pub count: u32,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug)]
pub struct ScoreEntry {
    pub player: Pubkey,
    pub score: u64,
    pub timestamp: i64,
    pub player_name: [u8; 32],
}

impl Default for ScoreEntry {
    fn default() -> Self {
        Self {
            player: Pubkey::default(),
            score: 0,
            timestamp: 0,
            player_name: [0u8; 32],
        }
    }
}

impl Leaderboard {
    pub const SIZE: usize = 8 + // discriminator
        (100 * (32 + 8 + 8 + 32)) + // top_scores
        4; // count

    pub fn add_score(&mut self, player: Pubkey, score: u64, player_name: String) {
        let clock = Clock::get().unwrap();

        // Create new entry
        let mut name_bytes = [0u8; 32];
        let name_slice = player_name.as_bytes();
        let len = name_slice.len().min(32);
        name_bytes[..len].copy_from_slice(&name_slice[..len]);

        let new_entry = ScoreEntry {
            player,
            score,
            timestamp: clock.unix_timestamp,
            player_name: name_bytes,
        };

        // Find insertion point
        let mut insertion_index = self.count as usize;
        for i in 0..self.count as usize {
            if score > self.top_scores[i].score {
                insertion_index = i;
                break;
            }
        }

        // Shift entries if needed
        if insertion_index < 100 {
            if self.count < 100 {
                self.count += 1;
            }

            for i in ((insertion_index + 1)..self.count as usize).rev() {
                self.top_scores[i] = self.top_scores[i - 1];
            }

            self.top_scores[insertion_index] = new_entry;
        }
    }
}
