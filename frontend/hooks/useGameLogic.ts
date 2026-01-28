
import { useState, useCallback, useEffect } from 'react';
import { Tile, TileType, PlayerState, Position, Inventory, Enemy, EnemyType, PowerType, Direction, MiningEffect, ParticleEffectData } from '../types';
import {
    GRID_WIDTH, GRID_HEIGHT, INITIAL_PLAYER_STATE, INITIAL_INVENTORY, TILE_PROBABILITY,
    MINE_COST, MOVE_COST, ATTACK_COST, ENEMY_PROBABILITY, GLOOM_BAT_HEALTH, PLAYER_DAMAGE,
    GLOOM_BAT_DAMAGE, MEGA_MINE_COST, ILLUMINATE_COST
} from '../constants';

const generateGrid = (): Tile[][] => {
  const grid = Array.from({ length: GRID_HEIGHT }, () =>
    Array.from({ length: GRID_WIDTH }, (): Tile => ({ type: TileType.ROCK, revealed: false }))
  );

  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
       if (x === INITIAL_PLAYER_STATE.position.x && y === INITIAL_PLAYER_STATE.position.y) {
         grid[y][x] = { type: TileType.EMPTY, revealed: false };
         continue;
       }
       
      const rand = Math.random();
      if (rand < TILE_PROBABILITY.DIAMOND) grid[y][x].type = TileType.DIAMOND;
      else if (rand < TILE_PROBABILITY.DIAMOND + TILE_PROBABILITY.ORE) grid[y][x].type = TileType.ORE;
      else if (rand < TILE_PROBABILITY.DIAMOND + TILE_PROBABILITY.ORE + TILE_PROBABILITY.COAL) grid[y][x].type = TileType.COAL;
      else if (rand < TILE_PROBABILITY.DIAMOND + TILE_PROBABILITY.ORE + TILE_PROBABILITY.COAL + TILE_PROBABILITY.TRAP) grid[y][x].type = TileType.TRAP;
       else if (rand < TILE_PROBABILITY.DIAMOND + TILE_PROBABILITY.ORE + TILE_PROBABILITY.COAL + TILE_PROBABILITY.TRAP + TILE_PROBABILITY.LIGHT) grid[y][x].type = TileType.LIGHT;
    }
  }
  return grid;
};

const generateEnemies = (grid: Tile[][]): Enemy[] => {
    const newEnemies: Enemy[] = [];
    let enemyId = 0;
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            const dist = Math.abs(x - INITIAL_PLAYER_STATE.position.x) + Math.abs(y - INITIAL_PLAYER_STATE.position.y);
            if (dist < 6) continue;

            if (grid[y][x].type !== TileType.EMPTY && Math.random() < ENEMY_PROBABILITY) {
                newEnemies.push({
                    id: enemyId++,
                    position: { x, y },
                    health: GLOOM_BAT_HEALTH,
                    type: EnemyType.GLOOM_BAT,
                    active: false,
                });
            }
        }
    }
    return newEnemies;
};


export const useGameLogic = (onGameOver: (score: number, inventory: Inventory, enemiesDefeated: number) => void) => {
  const [grid, setGrid] = useState<Tile[][]>([]);
  const [player, setPlayer] = useState<PlayerState>(INITIAL_PLAYER_STATE);
  const [inventory, setInventory] = useState<Inventory>(INITIAL_INVENTORY);
  const [message, setMessage] = useState('Use arrow keys or WASD to move and mine.');
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [enemiesDefeated, setEnemiesDefeated] = useState(0);
  const [miningEffects, setMiningEffects] = useState<MiningEffect[]>([]);
  const [particleEffects, setParticleEffects] = useState<ParticleEffectData[]>([]);

  const resetGame = useCallback(() => {
    const newGrid = generateGrid();
    const newEnemies = generateEnemies(newGrid);
    setGrid(newGrid);
    setEnemies(newEnemies);
    setPlayer(INITIAL_PLAYER_STATE);
    setInventory(INITIAL_INVENTORY);
    setEnemiesDefeated(0);
    setMiningEffects([]);
    setParticleEffects([]);
    const { updatedGrid, updatedEnemies } = updateVisibility(INITIAL_PLAYER_STATE.position, INITIAL_PLAYER_STATE.visionRange, newGrid, newEnemies);
    setGrid(updatedGrid);
    setEnemies(updatedEnemies);
  }, []);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  const updateVisibility = useCallback((center: Position, range: number, currentGrid: Tile[][], currentEnemies: Enemy[]) => {
    const newGrid = currentGrid.map(row => row.map(tile => ({...tile})));
    const newEnemies = currentEnemies.map(e => ({...e}));
    for (let y = center.y - range; y <= center.y + range; y++) {
      for (let x = center.x - range; x <= center.x + range; x++) {
        if (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT) {
          const distance = Math.sqrt(Math.pow(center.x - x, 2) + Math.pow(center.y - y, 2));
          if (distance <= range) {
            // Mark as revealed and explored
            newGrid[y][x] = {
              ...newGrid[y][x],
              revealed: true,
              explored: true // Once seen, always explored
            };
            const enemyIndex = newEnemies.findIndex(e => e.position.x === x && e.position.y === y);
            if (enemyIndex !== -1 && !newEnemies[enemyIndex].active) {
                newEnemies[enemyIndex].active = true;
            }
          }
        }
      }
    }
    return { updatedGrid: newGrid, updatedEnemies: newEnemies };
  }, []);
  
  useEffect(() => {
    if(!grid.length) return;
    const { updatedGrid, updatedEnemies } = updateVisibility(player.position, player.visionRange, grid, enemies);
    setGrid(updatedGrid);
    setEnemies(updatedEnemies);
  }, [player.position, player.visionRange]);

  const processEnemyTurn = useCallback((currentPlayerState: PlayerState) => {
      setEnemies(currentEnemies => {
          let playerHealth = currentPlayerState.health;
          const nextEnemies = currentEnemies.map(enemy => {
              if (!enemy.active) return enemy;
              
              const dx = currentPlayerState.position.x - enemy.position.x;
              const dy = currentPlayerState.position.y - enemy.position.y;

              if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1 && dx !== 0 && dy !== 0) { // Touching diagonally
                // No attack
              } else if (Math.abs(dx) + Math.abs(dy) <= 1) { // Touching cardinally
                  playerHealth -= GLOOM_BAT_DAMAGE;
                  setMessage("A Gloom Bat attacks you!");
                  return enemy;
              }

              let newPos = {...enemy.position};
              if (Math.abs(dx) > Math.abs(dy)) {
                  newPos.x += Math.sign(dx);
              } else {
                  newPos.y += Math.sign(dy);
              }
              
              const isOccupied = currentEnemies.some(e => e.id !== enemy.id && e.position.x === newPos.x && e.position.y === newPos.y) || (grid[newPos.y] && grid[newPos.y][newPos.x].type !== TileType.EMPTY);
              
              if (!isOccupied) {
                  return {...enemy, position: newPos};
              }
              return enemy;
          });

          if(playerHealth !== currentPlayerState.health) {
              setPlayer(p => {
                  const newPlayerHealthState = {...p, health: playerHealth};
                  if (playerHealth <= 0) {
                      onGameOver(p.score, inventory, enemiesDefeated);
                  }
                  return newPlayerHealthState;
              });
          }
          return nextEnemies;
      });
  }, [grid, onGameOver, inventory, enemiesDefeated]);

  const addMiningEffect = useCallback((x: number, y: number, direction: Direction) => {
    const id = Date.now() + Math.random();
    const newEffect: MiningEffect = { x, y, direction, id };
    setMiningEffects(effects => [...effects, newEffect]);

    // Remove effect after animation completes
    setTimeout(() => {
      setMiningEffects(effects => effects.filter(effect => effect.id !== id));
    }, 500);
  }, []);

  const addParticleEffect = useCallback((x: number, y: number, tileType: TileType) => {
    const id = Date.now() + Math.random();
    const particleType =
      tileType === TileType.COAL ? 'coal' :
      tileType === TileType.ORE ? 'ore' :
      tileType === TileType.DIAMOND ? 'diamond' :
      tileType === TileType.TRAP ? 'trap' : 'rock';

    const newEffect: ParticleEffectData = {
      x,
      y,
      id,
      type: particleType as any
    };
    setParticleEffects(effects => [...effects, newEffect]);

    // Remove effect after animation completes
    setTimeout(() => {
      setParticleEffects(effects => effects.filter(effect => effect.id !== id));
    }, 1500);
  }, []);

  const mineTile = useCallback((x: number, y: number, currentP: PlayerState, currentI: Inventory, currentG: Tile[][], currentE: Enemy[]) => {
    let newPlayerState = { ...currentP };
    let newInventory = { ...currentI };
    let newGrid = currentG.map(row => row.map(tile => ({...tile})));
    let newMessage = "";
    let newEnemies = [...currentE];

    const targetTile = newGrid[y][x];

    const tileType = targetTile.type;

    switch(tileType) {
      case TileType.COAL:
        newInventory.coal += 1;
        newPlayerState.energy = Math.min(100, newPlayerState.energy + 20);
        newPlayerState.score += 10;
        newMessage = "You found coal! Restored 20 energy.";
        break;
      case TileType.ORE:
        newInventory.ore += 1;
        newPlayerState.score += 50;
        newMessage = "You found ore!";
        break;
      case TileType.DIAMOND:
        newInventory.diamond += 1;
        newPlayerState.score += 200;
        newPlayerState.visionRange += 1;
        newMessage = "A rare diamond! Your vision expands.";
        break;
      case TileType.TRAP:
        newPlayerState.health -= 20;
        newPlayerState.score = Math.max(0, newPlayerState.score - 25);
        newMessage = "It's a trap! You lost 20 health.";
        break;
      case TileType.LIGHT:
        const { updatedGrid, updatedEnemies } = updateVisibility({x, y}, 5, newGrid, newEnemies);
        newGrid = updatedGrid;
        newEnemies = updatedEnemies;
        newMessage = "A burst of light reveals the area!";
        break;
      default: // ROCK
        newPlayerState.score += 1;
        newMessage = "You mined through solid rock.";
    }
    newGrid[y][x].type = TileType.EMPTY;

    // Trigger particle effect
    addParticleEffect(x, y, tileType);

    return {newPlayerState, newInventory, newGrid, newMessage, newEnemies};
  }, [updateVisibility, addParticleEffect]);

  const handleAction = useCallback((direction: Direction) => {
    let newPlayerState: PlayerState;
    
    setPlayer(p => {
      const newPosition = { ...p.position };
      if (direction === 'up') newPosition.y--;
      if (direction === 'down') newPosition.y++;
      if (direction === 'left') newPosition.x--;
      if (direction === 'right') newPosition.x++;

      if (newPosition.x < 0 || newPosition.x >= GRID_WIDTH || newPosition.y < 0 || newPosition.y >= GRID_HEIGHT) {
        setMessage("You can't go that way.");
        return p;
      }
      
      const enemyAtTarget = enemies.find(e => e.position.x === newPosition.x && e.position.y === newPosition.y);
      if (enemyAtTarget) {
          const newHealth = enemyAtTarget.health - PLAYER_DAMAGE;
          let newEnemies = [...enemies];
          if(newHealth <= 0) {
              setMessage(`You defeated the Gloom Bat! +100 score.`);
              newEnemies = enemies.filter(e => e.id !== enemyAtTarget.id);
              setEnemiesDefeated(prev => prev + 1);
          } else {
               setMessage(`You hit the Gloom Bat!`);
               const enemyIndex = enemies.findIndex(e => e.id === enemyAtTarget.id);
               newEnemies[enemyIndex] = {...enemyAtTarget, health: newHealth};
          }
          setEnemies(newEnemies);
          newPlayerState = {...p, energy: p.energy - ATTACK_COST, score: newHealth <= 0 ? p.score + 100 : p.score, direction};
      } else {
          const targetTile = grid[newPosition.y][newPosition.x];
          let cost = 0;
          
          if (targetTile.type === TileType.EMPTY) {
            cost = MOVE_COST;
            setMessage("Moved to an empty space.");
            newPlayerState = { ...p, position: newPosition, energy: p.energy - cost, direction };
          } else {
            cost = MINE_COST;
            const result = mineTile(newPosition.x, newPosition.y, p, inventory, grid, enemies);
            newPlayerState = { ...result.newPlayerState, position: newPosition, energy: p.energy - cost, direction };
            setInventory(result.newInventory);
            setGrid(result.newGrid);
            setEnemies(result.newEnemies);
            setMessage(result.newMessage);

            // Trigger mining animation effect
            addMiningEffect(newPosition.x, newPosition.y, direction);
          }
      }
      
      if (newPlayerState.health <= 0 || newPlayerState.energy <= 0) {
        onGameOver(newPlayerState.score, inventory, enemiesDefeated);
        return INITIAL_PLAYER_STATE;
      }

      processEnemyTurn(newPlayerState);
      return newPlayerState;
    });
  }, [grid, enemies, inventory, enemiesDefeated, onGameOver, processEnemyTurn, mineTile, addMiningEffect]);

  const handlePower = useCallback((power: PowerType) => {
    let cost = 0;
    switch(power){
        case PowerType.MEGA_MINE: cost = MEGA_MINE_COST; break;
        case PowerType.ILLUMINATE: cost = ILLUMINATE_COST; break;
    }

    if(inventory.coal < cost) {
        setMessage("Not enough coal!");
        return;
    }
    
    let tempPlayer = {...player};
    setInventory(i => ({...i, coal: i.coal - cost}));

    if(power === PowerType.ILLUMINATE) {
        setMessage("A brilliant flash illuminates the area!");
        const { updatedGrid, updatedEnemies } = updateVisibility(player.position, 7, grid, enemies);
        setGrid(updatedGrid);
        setEnemies(updatedEnemies);
        processEnemyTurn(player);
    } else if (power === PowerType.MEGA_MINE) {
        setMessage("You unleash a powerful mining blast!");
        let currentGrid = [...grid];
        let currentInventory = {...inventory, coal: inventory.coal - cost};
        let currentPlayer = {...player};
        let currentEnemies = [...enemies];

        for (let y = player.position.y - 1; y <= player.position.y + 1; y++) {
            for (let x = player.position.x - 1; x <= player.position.x + 1; x++) {
                if (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT && !(x === player.position.x && y === player.position.y)) {
                    if(currentGrid[y][x].type !== TileType.EMPTY) {
                        const result = mineTile(x, y, currentPlayer, currentInventory, currentGrid, currentEnemies);
                        currentPlayer = result.newPlayerState;
                        currentInventory = result.newInventory;
                        currentGrid = result.newGrid;
                        currentEnemies = result.newEnemies;
                    }
                }
            }
        }
        setGrid(currentGrid);
        setInventory(currentInventory);
        setPlayer(currentPlayer);
        setEnemies(currentEnemies);
        processEnemyTurn(currentPlayer);
    }

  }, [inventory, player, grid, enemies, updateVisibility, processEnemyTurn, mineTile]);

  return { grid, player, inventory, message, enemies, handleAction, handlePower, miningEffects, particleEffects };
};
