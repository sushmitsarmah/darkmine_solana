
import React from 'react';
import Sprite from './Sprite';
import { PLAYER_SPRITE_SHEET } from '../assets';
import { Direction } from '../types';

interface PlayerProps {
  direction: Direction;
}

const directionToRowMap: Record<Direction, number> = {
  down: 0,
  left: 1,
  right: 2,
  up: 3,
};

const Player: React.FC<PlayerProps> = ({ direction }) => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <Sprite
        src={PLAYER_SPRITE_SHEET}
        frameWidth={32}
        frameHeight={32}
        frameCount={4}
        fps={8}
        row={directionToRowMap[direction]}
        sheetWidth={1024}
        sheetHeight={1024}
      />
    </div>
  );
};

export default Player;
