
import React from 'react';
import { EnemyType } from '../types';
import Sprite from './Sprite';
import { GLOOM_BAT_SPRITE_SHEET } from '../assets';

interface EnemyProps {
  type: EnemyType;
}

const Enemy: React.FC<EnemyProps> = React.memo(({ type }) => {
  switch (type) {
    case EnemyType.GLOOM_BAT:
      return (
        <Sprite
          src={GLOOM_BAT_SPRITE_SHEET}
          frameWidth={32}
          frameHeight={32}
          frameCount={4}
          fps={10}
          row={0}
          sheetWidth={1024}
          sheetHeight={1024}
        />
      );
    default:
      return null;
  }
});

export default Enemy;
