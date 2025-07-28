'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ThemeProps } from './types';

interface NeonParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

const PARTICLE_COUNT = 25;

export default function NeonCyber({ 
  accentColor = '#00ffff', 
  titleFontColor = '#ffffff', 
  captionFontColor = '#cccccc',
  backgroundColor = '#0a0a0a',
  mouseEffectsEnabled = true
}: ThemeProps) {
  const [particles, setParticles] = useState<NeonParticle[]>([]);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationId = useRef<number | undefined>(undefined);
  const particlesRef = useRef<NeonParticle[]>([]);

  // Initialize particles
  useEffect(() => {
    const data = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      data.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        life: Math.random(),
        maxLife: Math.random() * 0.5 + 0.5,
      });
    }
    setParticles(data);
    particlesRef.current = data;
    setIsPageLoaded(true);
  }, []);

  // Track mouse
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!mouseEffectsEnabled) return;
    const rect = document.body.getBoundingClientRect();
    mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 100;
    mouseRef.current.y = ((e.clientY - rect.top) / rect.height) * 100;
  }, [mouseEffectsEnabled]);

  useEffect(() => {
    if (mouseEffectsEnabled) {
      document.addEventListener('mousemove', handleMouseMove, { passive: true });
      return () => document.removeEventListener('mousemove', handleMouseMove);
    }
  }, [handleMouseMove, mouseEffectsEnabled]);

  // Animate particles
  useEffect(() => {
    if (particles.length === 0) return;

    const loop = () => {
      const now = performance.now();
      
      // Update particles
      particlesRef.current = particlesRef.current.map(particle => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Bounce off edges
        if (particle.x < 0 || particle.x > 100) particle.vx *= -1;
        if (particle.y < 0 || particle.y > 100) particle.vy *= -1;
        
        // Update life
        particle.life += 0.01;
        if (particle.life > particle.maxLife) {
          particle.life = 0;
          particle.x = Math.random() * 100;
          particle.y = Math.random() * 100;
        }
        
        return particle;
      });

      animationId.current = requestAnimationFrame(loop);
    };
    animationId.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationId.current!);
  }, [particles.length, mouseEffectsEnabled]);

  return (
    <div className="fixed inset-0 z-0 neon-cyber-bg">
      {/* Grid lines */}
      <div className="absolute inset-0 cyber-grid" />
      
      {/* Glow effect */}
      <div 
        className="absolute inset-0 cyber-glow"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${accentColor}10 0%, transparent 70%)`
        }}
      />
      
      {/* Particles */}
      {particlesRef.current.map(particle => {
        const lifeRatio = particle.life / particle.maxLife;
        const opacity = Math.sin(lifeRatio * Math.PI) * 0.8 + 0.2;
        
        return (
          <div
            key={particle.id}
            className="absolute neon-particle"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              opacity,
              backgroundColor: accentColor,
              boxShadow: `0 0 10px ${accentColor}, 0 0 20px ${accentColor}`,
            }}
          />
        );
      })}
      
      {/* Mouse cursor glow */}
      <div 
        className="absolute mouse-glow"
        style={{
          left: `${mouseRef.current.x}%`,
          top: `${mouseRef.current.y}%`,
          background: `radial-gradient(circle, ${accentColor}40 0%, transparent 70%)`,
        }}
      />
    </div>
  );
} 