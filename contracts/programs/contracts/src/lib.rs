use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint};

declare_id!("6u8zV7yYbDZg38eUabnwL6ghkghwFwZv7CHrZnh6xnxM");

#[program]
pub mod darkmine_contract {
    use super::*;

    pub fn initialize_player(ctx: Context<InitializePlayer>) -> Result<()> {
        let player_account = &mut ctx.accounts.player_account;
        let clock = Clock::get()?;

        player_account.player = ctx.accounts.player.key();
        player_account.name = String::new();
        player_account.games_played = 0;
        player_account.total_score = 0;
        player_account.high_score = 0;
        player_account.total_coal = 0;
        player_account.total_ore = 0;
        player_account.total_diamonds = 0;
        player_account.total_enemies_defeated = 0;
        player_account.joined_timestamp = clock.unix_timestamp;
        player_account.last_game_timestamp = 0;

        msg!("Player initialized: {}", ctx.accounts.player.key());
        Ok(())
    }

    pub fn initialize_leaderboard(ctx: Context<InitializeLeaderboard>) -> Result<()> {
        let leaderboard = &mut ctx.accounts.leaderboard;
        // 20 entries fits easily in memory, so we can initialize directly
        leaderboard.top_scores = [ScoreEntry::default(); 20];
        leaderboard.count = 0;

        msg!("Leaderboard initialized (Top 20)");
        Ok(())
    }

    pub fn submit_game_result(
        ctx: Context<SubmitGameResult>,
        score: u64,
        coal_collected: u64,
        ore_collected: u64,
        diamonds_collected: u64,
        enemies_defeated: u8,
    ) -> Result<()> {
        let player_account = &mut ctx.accounts.player_account;
        let leaderboard = &mut ctx.accounts.leaderboard;

        // Update statistics
        player_account.games_played = player_account.games_played.checked_add(1).unwrap();
        player_account.total_score = player_account.total_score.checked_add(score).unwrap();
        player_account.total_coal = player_account.total_coal.checked_add(coal_collected).unwrap();
        player_account.total_ore = player_account.total_ore.checked_add(ore_collected).unwrap();
        player_account.total_diamonds = player_account.total_diamonds.checked_add(diamonds_collected).unwrap();
        player_account.total_enemies_defeated = player_account.total_enemies_defeated.checked_add(enemies_defeated as u64).unwrap();

        if score > player_account.high_score {
            player_account.high_score = score;
        }

        let clock = Clock::get()?;
        player_account.last_game_timestamp = clock.unix_timestamp;

        // Update leaderboard (Standard vector logic works fine for 20 items)
        if score > 0 {
             leaderboard.add_score(
                ctx.accounts.player.key(),
                score,
                player_account.name.clone()
            );
        }

        emit!(GameCompleted {
            player: ctx.accounts.player.key(),
            score,
            coal_collected,
            ore_collected,
            diamonds_collected,
            enemies_defeated,
            timestamp: clock.unix_timestamp,
        });

        msg!("Game result submitted. Score: {}", score);
        Ok(())
    }

    pub fn mint_diamond_tokens(
        ctx: Context<MintDiamondTokens>,
        amount: u64,
    ) -> Result<()> {
        let player_account = &mut ctx.accounts.player_account;

        require!(
            amount <= player_account.claimable_diamonds(),
            GameError::InsufficientUnclaimedDiamonds
        );

        let mint_amount = amount.checked_mul(1_000_000_000).unwrap(); 

        let cpi_accounts = token::MintTo {
            mint: ctx.accounts.diamond_mint.to_account_info(),
            to: ctx.accounts.player_token_account.to_account_info(),
            authority: ctx.accounts.mint_authority.to_account_info(),
        };

        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        token::mint_to(cpi_ctx, mint_amount)?;

        player_account.diamonds_claimed = player_account.diamonds_claimed.checked_add(amount).unwrap();

        msg!("Minted {} diamond tokens", amount);
        Ok(())
    }

    pub fn set_player_name(
        ctx: Context<UpdatePlayer>,
        name: String,
    ) -> Result<()> {
        let player_account = &mut ctx.accounts.player_account;
        require!(name.len() <= 32, GameError::NameTooLong);
        player_account.name = name;
        Ok(())
    }
}

// Instructions

#[derive(Accounts)]
pub struct InitializePlayer<'info> {
    #[account(
        init,
        payer = player,
        space = PlayerAccount::SIZE,
        seeds = [b"player", player.key().as_ref()],
        bump
    )]
    pub player_account: Account<'info, PlayerAccount>,
    #[account(mut)]
    pub player: Signer<'info>,
    pub system_program: Program<'info, System>,
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
    pub leaderboard: Account<'info, Leaderboard>, // Standard Account type is safe now
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SubmitGameResult<'info> {
    #[account(
        mut,
        seeds = [b"player", player.key().as_ref()],
        bump
    )]
    pub player_account: Account<'info, PlayerAccount>,
    pub player: Signer<'info>,

    #[account(
        mut,
        seeds = [b"leaderboard"],
        bump
    )]
    pub leaderboard: Account<'info, Leaderboard>,
}

#[derive(Accounts)]
pub struct MintDiamondTokens<'info> {
    #[account(mut)]
    pub player_account: Account<'info, PlayerAccount>,

    #[account(
        mut,
        seeds = [b"mint_authority"],
        bump
    )]
    /// CHECK: This is the PDA authority for minting, validated by seeds
    pub mint_authority: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [b"diamond_mint"],
        bump
    )]
    pub diamond_mint: Account<'info, Mint>,

    #[account(
        mut,
        constraint = player_token_account.owner == player.key(),
        constraint = player_token_account.mint == diamond_mint.key()
    )]
    pub player_token_account: Account<'info, TokenAccount>,

    pub player: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UpdatePlayer<'info> {
    #[account(
        mut,
        seeds = [b"player", player.key().as_ref()],
        bump
    )]
    pub player_account: Account<'info, PlayerAccount>,
    pub player: Signer<'info>,
}

// Data structures

#[account]
pub struct PlayerAccount {
    pub player: Pubkey,
    pub name: String,
    pub games_played: u64,
    pub total_score: u64,
    pub high_score: u64,
    pub total_coal: u64,
    pub total_ore: u64,
    pub total_diamonds: u64,
    pub diamonds_claimed: u64,
    pub total_enemies_defeated: u64,
    pub joined_timestamp: i64,
    pub last_game_timestamp: i64,
}

impl PlayerAccount {
    // 8 disc + 32 pubkey + 36 string + 8*9 fields = ~148 bytes
    pub const SIZE: usize = 200; 

    pub fn claimable_diamonds(&self) -> u64 {
        self.total_diamonds.saturating_sub(self.diamonds_claimed)
    }
}

// Events
#[event]
pub struct GameCompleted {
    pub player: Pubkey,
    pub score: u64,
    pub coal_collected: u64,
    pub ore_collected: u64,
    pub diamonds_collected: u64,
    pub enemies_defeated: u8,
    pub timestamp: i64,
}

// Leaderboard: Reduced to Top 20 to fit in Stack Memory (Avoids "Stack offset exceeded")
#[account]
pub struct Leaderboard {
    pub top_scores: [ScoreEntry; 20],
    pub count: u32,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, Default)]
pub struct ScoreEntry {
    pub player: Pubkey,
    pub score: u64,
    pub timestamp: i64,
    pub player_name: [u8; 32],
}

impl Leaderboard {
    // 8 discriminator + (20 * 80 size of entry) + 4 count = ~1612 bytes
    // This is well within the 4096 byte stack limit.
    pub const SIZE: usize = 8 + (20 * (32 + 8 + 8 + 32)) + 4;

    pub fn add_score(&mut self, player: Pubkey, score: u64, player_name: String) {
        let clock = Clock::get().unwrap();

        // 1. Check if score qualifies (is it higher than the lowest score?)
        // If full (20 items) and new score is smaller than the last one, return early.
        if self.count >= 20 && score <= self.top_scores[19].score {
            return;
        }

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

        // Shift entries
        if insertion_index < 20 {
            if self.count < 20 {
                self.count += 1;
            }

            // Shift elements down to make room
            for i in ((insertion_index + 1)..self.count as usize).rev() {
                self.top_scores[i] = self.top_scores[i - 1];
            }

            self.top_scores[insertion_index] = new_entry;
        }
    }
}

// Errors
#[error_code]
pub enum GameError {
    #[msg("Player does not have enough unclaimed diamonds")]
    InsufficientUnclaimedDiamonds,
    #[msg("Player name must be 32 characters or less")]
    NameTooLong,
    #[msg("Player account not found")]
    PlayerAccountNotFound,
    #[msg("Leaderboard not initialized")]
    LeaderboardNotInitialized,
}
