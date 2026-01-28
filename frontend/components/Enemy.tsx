
import React from 'react';
import { EnemyType } from '../types';
import { ENEMY_IMAGE } from '../assets';

interface EnemyProps {
  type: EnemyType;
}

const Enemy: React.FC<EnemyProps> = React.memo(({ type }) => {
  switch (type) {
    case EnemyType.GLOOM_BAT:
      return (
        <img
          src={ENEMY_IMAGE}
          alt="Gloom Bat"
          className="w-full h-full object-contain"
          style={{
            imageRendering: 'pixelated',
          }}
        />
      );
    default:
      return null;
  }
});

export default Enemy;
