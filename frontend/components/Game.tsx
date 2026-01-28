
import React, { useMemo, useCallback } from 'react';
import { useGameLogic } from '../hooks/useGameLogic';
import { useKeyboardControls } from '../hooks/useKeyboardControls';
import Tile from './Tile';
import Player from './Player';
import Enemy from './Enemy';
import Hud from './Hud';
import MiningEffect from './MiningEffect';
import ParticleEffect from './ParticleEffect';
import { BACKGROUND_IMAGE } from '../assets';
import { GRID_WIDTH, GRID_HEIGHT } from '../constants';

interface GameProps {
  onGameOver: (score: number, inventory: { coal: number; ore: number; diamond: number }, enemiesDefeated: number) => void;
  walletProfile?: string | null;
}

const Game: React.FC<GameProps> = ({ onGameOver, walletProfile }) => {
  const { grid, player, inventory, message, enemies, handleAction, handlePower, miningEffects, particleEffects } = useGameLogic(onGameOver);

  useKeyboardControls(handleAction);
  
  const TILE_SIZE = 24; // size in pixels for each tile

  const gridStyle = useMemo(() => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${GRID_WIDTH}, ${TILE_SIZE}px)`,
    gridTemplateRows: `repeat(${GRID_HEIGHT}, ${TILE_SIZE}px)`,
    width: `${GRID_WIDTH * TILE_SIZE}px`,
    height: `${GRID_HEIGHT * TILE_SIZE}px`,
  }), []);

  // Calculate distance from player for each tile
  const calculateDistance = useCallback((x: number, y: number) => {
    const dx = player.position.x - x;
    const dy = player.position.y - y;
    return Math.sqrt(dx * dx + dy * dy);
  }, [player.position]);

  const playerStyle = useMemo(() => ({
    position: 'absolute' as const,
    left: `${player.position.x * TILE_SIZE}px`,
    top: `${player.position.y * TILE_SIZE}px`,
    width: `${TILE_SIZE}px`,
    height: `${TILE_SIZE}px`,
    transition: 'left 0.1s linear, top 0.1s linear',
    zIndex: 10,
    // Center the sprite inside the tile
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }), [player.position.x, player.position.y]);

  return (
    <div className="flex flex-col items-center gap-4">
      <Hud player={player} inventory={inventory} message={message} onPower={handlePower} walletProfile={walletProfile} />
      <div
        className="relative border-4 border-gray-600 overflow-hidden box-shadow-hard"
        style={{
          width: `${GRID_WIDTH * TILE_SIZE}px`,
          height: `${GRID_HEIGHT * TILE_SIZE}px`,
          backgroundImage: `url(${BACKGROUND_IMAGE})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div style={gridStyle}>
          {grid.map((row, y) =>
            row.map((tile, x) => {
              const distance = tile.revealed ? calculateDistance(x, y) : Infinity;
              return (
                <Tile
                  key={`tile-${y}-${x}`}
                  tile={tile}
                  distance={distance}
                  maxVisionRange={player.visionRange}
                />
              );
            })
          )}
        </div>
        <div style={playerStyle}>
          <Player direction={player.direction} />
        </div>
        {enemies.map(enemy => enemy.active && (
           <div
            key={enemy.id}
            style={{
                position: 'absolute',
                left: `${enemy.position.x * TILE_SIZE}px`,
                top: `${enemy.position.y * TILE_SIZE}px`,
                width: `${TILE_SIZE}px`,
                height: `${TILE_SIZE}px`,
                transition: 'left 0.1s linear, top 0.1s linear',
                zIndex: 9,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
           >
               <Enemy type={enemy.type} />
           </div>
        ))}
        {miningEffects.map(effect => (
          <MiningEffect
            key={effect.id}
            x={effect.x}
            y={effect.y}
            direction={effect.direction}
            tileSize={TILE_SIZE}
            onComplete={() => {}}
          />
        ))}
        {particleEffects.map(effect => (
          <ParticleEffect
            key={effect.id}
            x={effect.x}
            y={effect.y}
            tileSize={TILE_SIZE}
            particleType={effect.type}
            onComplete={() => {}}
          />
        ))}
      </div>
    </div>
  );
};

export default Game;
