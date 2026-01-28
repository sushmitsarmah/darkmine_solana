
import React, { useState, useEffect } from 'react';

interface SpriteProps {
  src: string;
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
  fps: number;
  row: number;
  scale?: number;
  sheetWidth?: number;
  sheetHeight?: number;
}

const Sprite: React.FC<SpriteProps> = ({
  src,
  frameWidth,
  frameHeight,
  frameCount,
  fps,
  row,
  scale = 1.5,
  sheetWidth,
  sheetHeight,
}) => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(prevFrame => (prevFrame + 1) % frameCount);
    }, 1000 / fps);
    return () => clearInterval(interval);
  }, [frameCount, fps]);

  // Use background-image approach for proper sprite sheet rendering
  const spriteStyle = {
    width: `${frameWidth}px`,
    height: `${frameHeight}px`,
    transform: `scale(${scale})`,
    imageRendering: 'pixelated' as const,
    backgroundImage: `url(${src})`,
    backgroundRepeat: 'no-repeat' as const,
    backgroundPosition: `-${frame * frameWidth}px -${row * frameHeight}px`,
    // If sheet dimensions are provided, use them to ensure proper scaling
    backgroundSize: sheetWidth && sheetHeight ? `${sheetWidth}px ${sheetHeight}px` : undefined,
  };

  return <div style={spriteStyle} />;
};

export default Sprite;
