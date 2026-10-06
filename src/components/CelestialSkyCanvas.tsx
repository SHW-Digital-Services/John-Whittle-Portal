import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  speedX: number;
  alpha: number;
  color: string;
  type: 'star' | 'lantern' | 'smoke' | 'qi';
  flicker?: number;
  size?: number;
}

interface CelestialSkyCanvasProps {
  burstTrigger?: number; // Increment to trigger a burst of rising lanterns/Qi
  burstOffering?: 'incense' | 'lantern' | 'reiki_qi' | 'tea' | 'candle' | 'lotus';
  isDarkMode: boolean;
}

export const CelestialSkyCanvas: React.FC<CelestialSkyCanvasProps> = ({
  burstTrigger = 0,
  burstOffering = 'lantern',
  isDarkMode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Initial particles
    const particles: Particle[] = [];
    const starCount = isDarkMode ? 70 : 30;

    for (let i = 0; i < starCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height * 0.75,
        radius: Math.random() * 1.5 + 0.5,
        speedX: (Math.random() - 0.5) * 0.05,
        speedY: (Math.random() - 0.5) * 0.05,
        alpha: Math.random() * 0.7 + 0.3,
        color: isDarkMode ? '#e9d5ff' : '#a855f7',
        type: 'star',
        flicker: Math.random() * 0.05 + 0.01,
      });
    }

    // Gentle floating lanterns in distance
    for (let i = 0; i < 9; i++) {
      particles.push({
        x: Math.random() * width,
        y: height * 0.2 + Math.random() * (height * 0.8),
        radius: Math.random() * 3 + 2.5,
        speedX: (Math.random() - 0.5) * 0.2,
        speedY: -(Math.random() * 0.25 + 0.15),
        alpha: Math.random() * 0.6 + 0.2,
        color: '#f59e0b',
        type: 'lantern',
      });
    }

    // Qi floating motes
    for (let i = 0; i < 14; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: -(Math.random() * 0.3 + 0.1),
        alpha: Math.random() * 0.5 + 0.2,
        color: i % 2 === 0 ? '#4ade80' : '#c084fc',
        type: 'qi',
      });
    }

    particlesRef.current = particles;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particlesRef.current.forEach((p) => {
        if (p.type === 'star') {
          p.alpha += (Math.random() - 0.5) * (p.flicker || 0.02);
          if (p.alpha < 0.2) p.alpha = 0.2;
          if (p.alpha > 0.9) p.alpha = 0.9;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${isDarkMode ? '240, 230, 255' : '147, 51, 234'}, ${p.alpha})`;
          ctx.fill();
        } else if (p.type === 'lantern') {
          p.y += p.speedY;
          p.x += p.speedX;

          if (p.y < -30) {
            p.y = height + 20;
            p.x = Math.random() * width;
          }

          // Draw warm glowing Chinese paper lantern
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3.5);
          glow.addColorStop(0, `rgba(251, 191, 36, ${p.alpha * 0.9})`);
          glow.addColorStop(0.5, `rgba(245, 158, 11, ${p.alpha * 0.4})`);
          glow.addColorStop(1, 'rgba(217, 119, 6, 0)');

          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 3.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = `rgba(254, 243, 199, ${p.alpha})`;
          ctx.beginPath();
          ctx.ellipse(p.x, p.y, p.radius, p.radius * 1.3, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'qi') {
          p.y += p.speedY;
          p.x += Math.sin(p.y * 0.02) * 0.3;
          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha * 0.4;
          ctx.fill();
          ctx.globalAlpha = 1.0;
        } else if (p.type === 'smoke') {
          p.y += p.speedY;
          p.x += Math.sin(p.y * 0.03) * 0.6;
          p.radius += 0.03;
          p.alpha -= 0.003;

          if (p.alpha > 0) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(216, 180, 254, ${p.alpha * 0.35})`;
            ctx.fill();
          }
        }
      });

      // Cleanup faded smoke
      particlesRef.current = particlesRef.current.filter((p) => p.type !== 'smoke' || p.alpha > 0.01);

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isDarkMode]);

  // Burst effect when user sends a thought or offering
  useEffect(() => {
    if (!burstTrigger || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const centerX = canvas.width / 2;
    const bottomY = canvas.height * 0.7;

    const newParticles: Particle[] = [];

    // Ascending lanterns or Qi spirals
    for (let i = 0; i < 18; i++) {
      const isReiki = burstOffering === 'reiki_qi';
      const color = isReiki
        ? (i % 2 === 0 ? '#c084fc' : '#4ade80')
        : '#f59e0b';

      newParticles.push({
        x: centerX + (Math.random() - 0.5) * 220,
        y: bottomY + (Math.random() - 0.5) * 80,
        radius: Math.random() * 4 + 3,
        speedX: (Math.random() - 0.5) * 0.8,
        speedY: -(Math.random() * 1.5 + 0.8),
        alpha: 0.95,
        color,
        type: burstOffering === 'incense' ? 'smoke' : 'lantern',
      });
    }

    particlesRef.current.push(...newParticles);
  }, [burstTrigger, burstOffering]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-60 dark:opacity-80 transition-opacity"
      aria-hidden="true"
    />
  );
};
