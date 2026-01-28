
export enum TileType {
  ROCK = 'ROCK',
  EMPTY = 'EMPTY',
  COAL = 'COAL',
  ORE = 'ORE',
  DIAMOND = 'DIAMOND',
  TRAP = 'TRAP',
  PLAYER = 'PLAYER',
  LIGHT = 'LIGHT',
  EXIT = 'EXIT'
}

export interface Tile {
  type: TileType;
  revealed: boolean;
  explored?: boolean; // Has been seen before
}

export interface Position {
  x: number;
  y: number;
}

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface PlayerState {
  position: Position;
  health: number;
  energy: number;
  miningPower: number;
  visionRange: number;
  score: number;
  direction: Direction;
}

export interface MiningEffect {
  x: number;
  y: number;
  direction: Direction;
  id: number;
}

export interface ParticleEffectData {
  x: number;
  y: number;
  id: number;
  type: TileType;
}

export interface Inventory {
  coal: number;
  ore: number;
  diamond: number;
}

export enum GameStatus {
    START_SCREEN = 'START_SCREEN',
    PLAYING = 'PLAYING',
    GAME_OVER = 'GAME_OVER'
}

export enum EnemyType {
  GLOOM_BAT = 'GLOOM_BAT',
}

export interface Enemy {
  id: number;
  position: Position;
  health: number;
  type: EnemyType;
  active: boolean;
}

export enum PowerType {
  MEGA_MINE = 'MEGA_MINE',
  ILLUMINATE = 'ILLUMINATE',
}
