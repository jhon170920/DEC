// src/components/ParticlesBackground.native.jsx
import React, { useEffect, useRef } from 'react';
import { View, Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ParticlesBackground() {
  const viewsRef = useRef([]);
  const animRef = useRef(null);
  const particles = useRef([]);

  useEffect(() => {
    const count = 80;
    for (let i = 0; i < count; i++) {
      particles.current.push({
        x: Math.random() * screenWidth,
        y: Math.random() * screenHeight,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 2,
        opacity: Math.random() * 0.3 + 0.1,
      });
    }

    const animate = () => {
      for (let i = 0; i < particles.current.length; i++) {
        const p = particles.current[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) { p.x = 0; p.vx = -p.vx * 0.95; }
        if (p.x > screenWidth) { p.x = screenWidth; p.vx = -p.vx * 0.95; }
        if (p.y < 0) { p.y = 0; p.vy = -p.vy * 0.95; }
        if (p.y > screenHeight) { p.y = screenHeight; p.vy = -p.vy * 0.95; }
        if (viewsRef.current[i]) {
          viewsRef.current[i].setNativeProps({
            style: {
              transform: [{ translateX: p.x }, { translateY: p.y }],
            },
          });
        }
      }
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'hidden',
      }}
    >
      {particles.current.map((p, idx) => (
        <View
          key={idx}
          ref={(ref) => (viewsRef.current[idx] = ref)}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            borderRadius: p.size / 2,
            backgroundColor: `rgba(34, 197, 94, ${p.opacity})`, // color verde suave
            transform: [{ translateX: p.x }, { translateY: p.y }],
          }}
        />
      ))}
    </View>
  );
}