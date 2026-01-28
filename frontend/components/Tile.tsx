
import React from 'react';
import { Tile as TileTypeData } from '../types';
import { TileType } from '../types';

interface TileProps {
  tile: TileTypeData;
  distance?: number;
  maxVisionRange?: number;
}

const TileContent: React.FC<{ type: TileType }> = React.memo(({ type }) => {
    switch (type) {
        case TileType.ROCK:
            return <div className="w-full h-full" style={{background: 'linear-gradient(45deg, #6b7280 25%, #4b5563 25%, #4b5563 50%, #6b7280 50%, #6b7280 75%, #4b5563 75%, #4b5563 100%)', backgroundSize: '8px 8px'}}></div>;
        case TileType.EMPTY:
            return <div className="w-full h-full" style={{background: '#312e2b'}}></div>;
        case TileType.COAL:
            return <div className="w-3/4 h-3/4 m-auto bg-black border-2 border-gray-600 rounded-full shadow-[inset_2px_2px_0px_#4a5568]"></div>;
        case TileType.ORE:
            return <div className="w-3/4 h-3/4 m-auto bg-yellow-500 border-2 border-yellow-700 transform rotate-45 shadow-[inset_2px_2px_0px_#fde047]"></div>;
        case TileType.DIAMOND:
            return <div className="w-3/4 h-3/4 m-auto bg-blue-400 border-2 border-blue-600 transform rotate-45 scale-y-75 shadow-[inset_2px_2px_0px_#a5f3fc]"></div>;
        case TileType.TRAP:
            return (
                <div className="w-full h-full flex items-center justify-center">
                    <div className="w-1 h-3 bg-gray-400 transform rotate-45"></div>
                    <div className="w-1 h-3 bg-gray-400 transform -rotate-45 absolute"></div>
                </div>
            );
        case TileType.LIGHT:
            return <div className="w-3/4 h-3/4 m-auto bg-yellow-200 rounded-full animate-pulse" style={{boxShadow: '0 0 8px 2px #fef08a'}}></div>;
        default:
            return null;
    }
});

const Tile: React.FC<TileProps> = React.memo(({ tile, distance = 0, maxVisionRange = 1 }) => {
  const baseClasses = "w-full h-full flex items-center justify-center transition-opacity duration-500";

  // If not revealed, check if explored
  if (!tile.revealed) {
    if (tile.explored) {
      // Show explored tile as very dim grayscale
      return (
        <div className={`${baseClasses} bg-gray-900`}>
          <div style={{ filter: 'grayscale(100%) brightness(0.3)', opacity: 0.4 }}>
            <TileContent type={tile.type} />
          </div>
        </div>
      );
    }
    // Not revealed or explored - show black
    return <div className={`${baseClasses} bg-black`}></div>;
  }

  // Calculate opacity based on distance for gradient effect
  let opacity = 1;
  if (distance > maxVisionRange * 0.7) {
    // Outer ring - dim
    opacity = 0.4;
  } else if (distance > maxVisionRange * 0.4) {
    // Middle ring - partially dim
    opacity = 0.7;
  }

  // Clamp opacity to reasonable values
  opacity = Math.max(0.3, Math.min(1, opacity));

  return (
    <div
      className={`${baseClasses} bg-gray-800`}
      style={{ opacity }}
    >
        <TileContent type={tile.type} />
    </div>
  );
});

export default Tile;
