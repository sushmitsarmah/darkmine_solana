import React, { useEffect, useState } from 'react';

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

interface ParticleEffectProps {
  x: number;
  y: number;
  tileSize: number;
  particleType?: 'ore' | 'coal' | 'diamond' | 'rock' | 'trap';
  onComplete: () => void;
}

const ParticleEffect: React.FC<ParticleEffectProps> = ({
  x,
  y,
  tileSize,
  particleType = 'rock',
  onComplete
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Create particles based on type
    const colors = {
      ore: ['#FFD700', '#FFA500', '#FFFF00'],
      coal: ['#2D2D2D', '#1A1A1A', '#3D3D3D'],
      diamond: ['#00FFFF', '#87CEEB', '#FFFFFF'],
      rock: ['#808080', '#696969', '#A9A9A9'],
      trap: ['#FF0000', '#FF4500', '#FF6347']
    };

    const colorPalette = colors[particleType];
    const centerX = x * tileSize + tileSize / 2;
    const centerY = y * tileSize + tileSize / 2;

    // Generate unique base ID using current time and random number
    const baseId = Date.now() + Math.floor(Math.random() * 100000);

    const newParticles: Particle[] = Array.from({ length: 8 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 8 + Math.random() * 0.5;
      const speed = 1 + Math.random() * 2;
      return {
        id: baseId + i,
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
        size: 2 + Math.random() * 3
      };
    });

    setParticles(newParticles);

    // Animation loop
    let animationId: number;
    const animate = () => {
      setParticles(prevParticles => {
        const updated = prevParticles.map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.1, // gravity
          life: p.life - 0.02,
          vx: p.vx * 0.98 // friction
        }));

        const alive = updated.filter(p => p.life > 0);

        if (alive.length === 0) {
          onComplete();
          return [];
        }

        return alive;
      });

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [x, y, tileSize, particleType, onComplete]);

  return (
    <>
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute pointer-events-none"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            opacity: particle.life,
            transform: 'translate(-50%, -50%)',
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
            borderRadius: '50%',
            zIndex: 15
          }}
        />
      ))}
    </>
  );
};

export default ParticleEffect;
