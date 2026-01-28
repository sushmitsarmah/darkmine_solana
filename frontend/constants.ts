
import { PlayerState, Inventory } from './types';

export const GRID_WIDTH = 25;
export const GRID_HEIGHT = 25;

export const INITIAL_PLAYER_STATE: PlayerState = {
  position: { x: Math.floor(GRID_WIDTH / 2), y: Math.floor(GRID_HEIGHT / 2) },
  health: 100,
  energy: 100,
  miningPower: 1,
  visionRange: 2,
  score: 0,
  direction: 'down',
};

export const INITIAL_INVENTORY: Inventory = {
  coal: 0,
  ore: 0,
  diamond: 0,
};

export const MINE_COST = 2;
export const MOVE_COST = 1;
export const ATTACK_COST = 3;


export const TILE_PROBABILITY = {
  COAL: 0.15,
  ORE: 0.08,
  DIAMOND: 0.01,
  TRAP: 0.05,
  LIGHT: 0.03,
};

export const ENEMY_PROBABILITY = 0.04;
export const GLOOM_BAT_HEALTH = 30;
export const GLOOM_BAT_DAMAGE = 10;
export const PLAYER_DAMAGE = 15;

export const MEGA_MINE_COST = 5;
export const ILLUMINATE_COST = 3;
