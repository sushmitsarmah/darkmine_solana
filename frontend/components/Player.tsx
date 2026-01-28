
import React from 'react';
import { PLAYER_IMAGE } from '../assets';
import { Direction } from '../types';

interface PlayerProps {
  direction: Direction;
}

const Player: React.FC<PlayerProps> = ({ direction }) => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <img
        src={PLAYER_IMAGE}
        alt="Player"
        className="w-full h-full object-contain"
        style={{
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
};

export default Player;
