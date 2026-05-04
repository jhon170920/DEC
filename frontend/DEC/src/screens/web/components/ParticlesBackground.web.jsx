import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

export default function ParticlesBackground() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0, radius: 180 });
  const trailRef = useRef([]);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const handleMouseMove = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      mouseRef.current.x = x;
      mouseRef.current.y = y;
      trailRef.current.push({ x, y, life: 1, size: 4 });
      if (trailRef.current.length > 30) trailRef.current.shift();
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Crear partículas de fondo (más suaves y claras)
    const PARTICLE_COUNT = 380;
    const particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        color: `rgba(255, 240, 180, ${Math.random() * 0.3 + 0.1})`,
      });
    }
    particlesRef.current = particles;

    const draw = () => {
      if (!ctx) return;
      // Limpiar completamente el canvas (fondo transparente)
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // ---- Partículas de fondo ----
      const { x: mouseX, y: mouseY, radius: mouseRadius } = mouseRef.current;
      for (let p of particles) {
        // Repelencia al ratón
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouseRadius) {
          const angle = Math.atan2(dy, dx);
          const force = (mouseRadius - dist) / mouseRadius;
          p.x += Math.cos(angle) * force * 1.5;
          p.y += Math.sin(angle) * force * 1.5;
        }
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) { p.x = 0; p.vx = -p.vx * 0.9; }
        if (p.x > canvas.width) { p.x = canvas.width; p.vx = -p.vx * 0.9; }
        if (p.y < 0) { p.y = 0; p.vy = -p.vy * 0.9; }
        if (p.y > canvas.height) { p.y = canvas.height; p.vy = -p.vy * 0.9; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }

      // ---- Estela del cursor (encima de las partículas) ----
      for (let i = 0; i < trailRef.current.length; i++) {
        const point = trailRef.current[i];
        point.life -= 0.04;
        point.size -= 0.1;
        if (point.life <= 0 || point.size <= 0) continue;
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 200, 100, ${point.life * 0.8})`;
        ctx.fill();
      }
      trailRef.current = trailRef.current.filter(p => p.life > 0 && p.size > 0);

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  );
}