'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Heart } from 'lucide-react';
import { ThemeProps } from './types';

interface HeartData {
  id: number;
  originalX: number;
  originalY: number;
  size: number;
  pulseDelay: number;
}

interface ClickEffect {
  id: number;
  x: number;
  y: number;
  time: number;
  particles: Array<{ x: number; y: number; vx: number; vy: number; life: number }>;
}

const HEART_COUNT = 35;
const FOLLOW_THRESHOLD = 25;
const LERP_FACTOR = 0.25;
const CLICK_DURATION = 800;

export default function LoveTheme({ 
  accentColor = '#ff6b9d', 
  mouseEffectsEnabled = true
}: ThemeProps) {
  const [hearts, setHearts] = useState<HeartData[]>([]);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const mouseRef = useRef({ x: 0, y: 0 });
  const positionsRef = useRef<{ x: number; y: number }[]>([]);
  const heartsRefs = useRef<(HTMLDivElement | null)[]>([]);
  const animationId = useRef<number | undefined>(undefined);
  const clickedRef = useRef<{ id: number; time: number; x: number; y: number } | null>(null);
  const followStatesRef = useRef<boolean[]>([]);
  const clickEffectsRef = useRef<ClickEffect[]>([]);
  const heartsRef = useRef<HeartData[]>([]);

  // Initialize hearts
  useEffect(() => {
    const data = [];
    for (let i = 0; i < HEART_COUNT; i++) {
      data.push({
        id: i,
        originalX: Math.random() * 100,
        originalY: Math.random() * 100,
        size: Math.random() * 0.6 + 0.6,
        pulseDelay: Math.random() * 0.2,
      });
    }
    setHearts(data);
    heartsRef.current = data;
    positionsRef.current = data.map(h => ({ x: h.originalX, y: h.originalY }));
    followStatesRef.current = Array(HEART_COUNT).fill(false);

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

  function darkenHex(hex: string, amount: number = 0.2): string {
    const num = parseInt(hex.slice(1), 16);
    const r = Math.floor((num >> 16) * (1 - amount));
    const g = Math.floor(((num >> 8) & 0x00FF) * (1 - amount));
    const b = Math.floor((num & 0x0000FF) * (1 - amount));
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
  }

  // Animate hearts
  useEffect(() => {
    if (hearts.length === 0) return;

    const loop = () => {
      const now = performance.now();
      
      // Update click effects
      clickEffectsRef.current = clickEffectsRef.current.filter(effect => {
        const elapsed = now - effect.time;
        return elapsed < CLICK_DURATION;
      });

      heartsRef.current.forEach((heart, idx) => {
        const el = heartsRefs.current[idx];
        if (!el) return;

        const pos = positionsRef.current[idx];
        const dx = mouseRef.current.x - heart.originalX;
        const dy = mouseRef.current.y - heart.originalY;
        const dist = Math.hypot(dx, dy);
        const follow = mouseEffectsEnabled && dist < FOLLOW_THRESHOLD;

        const target = follow
          ? { 
              x: heart.originalX + dx * 0.8, 
              y: heart.originalY + dy * 0.8 
            }
          : { x: heart.originalX, y: heart.originalY };

        pos.x += (target.x - pos.x) * LERP_FACTOR;
        pos.y += (target.y - pos.y) * LERP_FACTOR;

        const wasFollowing = followStatesRef.current[idx];
        if (follow !== wasFollowing) {
          if (follow) {
            el.classList.add('following');
          } else {
            el.classList.remove('following');
          }
          followStatesRef.current[idx] = follow;
        }

        let scale = heart.size;
        let rotation = 0;
        
        // Handle click animation
        if (clickedRef.current?.id === heart.id) {
          const elapsed = now - clickedRef.current.time;
          if (elapsed < CLICK_DURATION) {
            const p = elapsed / CLICK_DURATION;
            const easeOut = 1 - Math.pow(1 - p, 3);
            
            // Scale up during animation
            scale = heart.size * (1 + 0.3 * easeOut);
            rotation = 360 * easeOut;
            
            // Add sparkle effect for entire animation
            el.classList.add('sparkle');
            el.style.setProperty('--sparkle-fill', accentColor);
          } else {
            // Animation finished, reset
            clickedRef.current = null;
            el.classList.remove('sparkle');
            el.style.removeProperty('--sparkle-fill');
          }
        }

        // Apply transforms
        el.style.left = `${pos.x}%`;
        el.style.top = `${pos.y}%`;
        el.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
      });
      
      animationId.current = requestAnimationFrame(loop);
    };
    animationId.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationId.current!);
  }, [hearts.length, mouseEffectsEnabled, accentColor]);

  const onHeartClick = (id: number, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    
    clickedRef.current = { 
      id, 
      time: performance.now(),
      x: x,
      y: y
    };

    // Create particle effect
    const particles = [];
    for (let i = 0; i < 8; i++) {
      particles.push({
        x: 0,
        y: 0,
        vx: (Math.random() - 0.5) * 200,
        vy: (Math.random() - 0.5) * 200,
        life: 1
      });
    }

    clickEffectsRef.current.push({
      id: Date.now(),
      x: x,
      y: y,
      time: performance.now(),
      particles
    });
  };

  return (
    <div className="fixed inset-0 z-0">
      {/* Background gradient using accent color */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${accentColor}20 0%, transparent 70%)`
        }}
      />
      
      {/* Particle effects */}
      {clickEffectsRef.current.map(effect => (
        <div key={effect.id} className="absolute pointer-events-none">
          {effect.particles.map((particle, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full animate-ping"
              style={{
                left: `${effect.x + particle.x}%`,
                top: `${effect.y + particle.y}%`,
                animationDelay: `${i * 50}ms`,
                backgroundColor: accentColor
              }}
            />
          ))}
        </div>
      ))}
      
      {hearts.map((heart, i) => (
        <div
          key={heart.id}
          ref={(el) => {
            heartsRefs.current[i] = el;
          }}
          className={`absolute cursor-pointer will-change-transform transition-all duration-1000 ease-out heart-container ${
            isPageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}
          style={{ 
            left: `${heart.originalX}%`, 
            top: `${heart.originalY}%`,
            zIndex: 10,
            transitionDelay: '0ms',
            pointerEvents: 'auto'
          }}
          onClick={(e) => onHeartClick(heart.id, e)}
        >
          <Heart 
            className="w-8 h-8 transition-transform"
            style={{
              transitionDuration: '800ms',
              color: `${accentColor}66`,
              fill: darkenHex(accentColor, 0.2)
            }}
          />
        </div>
      ))}
    </div>
  );
} 