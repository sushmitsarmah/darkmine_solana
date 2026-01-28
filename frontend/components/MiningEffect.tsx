import React, { useState, useEffect } from 'react';

interface MiningEffectProps {
  x: number;
  y: number;
  direction: 'up' | 'down' | 'left' | 'right';
  tileSize: number;
  onComplete: () => void;
}

const MiningEffect: React.FC<MiningEffectProps> = ({ x, y, direction, tileSize, onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 300; // milliseconds
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setProgress(progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        onComplete();
      }
    };

    requestAnimationFrame(animate);
  }, [onComplete]);

  // Calculate pickaxe position and rotation based on direction
  const centerX = x * tileSize + tileSize / 2;
  const centerY = y * tileSize + tileSize / 2;

  let pickaxeX = centerX;
  let pickaxeY = centerY;
  let rotation = 0;

  // Swing animation
  const swingAmount = Math.sin(progress * Math.PI * 2) * 45;

  switch (direction) {
    case 'up':
      rotation = -90 + swingAmount;
      pickaxeY += tileSize * 0.3;
      break;
    case 'down':
      rotation = 90 - swingAmount;
      pickaxeY -= tileSize * 0.3;
      break;
    case 'left':
      rotation = 180 - swingAmount;
      pickaxeX += tileSize * 0.3;
      break;
    case 'right':
      rotation = swingAmount;
      pickaxeX -= tileSize * 0.3;
      break;
  }

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${pickaxeX}px`,
        top: `${pickaxeY}px`,
        width: '32px',
        height: '32px',
        transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${1 + progress * 0.2})`,
        opacity: 1 - progress * 0.3,
        zIndex: 20,
        transition: 'none'
      }}
    >
      <svg viewBox="0 0 32 32" className="w-full h-full">
        {/* Pickaxe SVG */}
        <line x1="16" y1="10" x2="16" y2="25" stroke="#8B4513" strokeWidth="2" />
        <path d="M10 10 L22 10 L20 8 L16 12 L12 8 Z" fill="#808080" />
        <path d="M12 10 L12 8 L10 6" stroke="#808080" strokeWidth="2" fill="none" />
        <path d="M20 10 L20 8 L22 6" stroke="#808080" strokeWidth="2" fill="none" />
        {/* Spark effects */}
        {progress > 0.3 && (
          <>
            <circle cx="8" cy="18" r="1" fill="#FFD700" opacity={1 - progress}>
              <animate attributeName="cy" from="18" to="10" dur="0.2s" fill="freeze" />
            </circle>
            <circle cx="24" cy="14" r="1" fill="#FFA500" opacity={1 - progress}>
              <animate attributeName="cy" from="14" to="8" dur="0.2s" fill="freeze" />
            </circle>
          </>
        )}
      </svg>
    </div>
  );
};

export default MiningEffect;
