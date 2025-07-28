'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ThemeProps } from './types';

interface Leaf {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  type: 'leaf' | 'petal';
}

const LEAF_COUNT = 20;

export default function NatureForest({ 
  accentColor = '#4ade80', 
  backgroundColor = '#f0fdf4',
  mouseEffectsEnabled = true
}: ThemeProps) {
  const [leaves, setLeaves] = useState<Leaf[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationId = useRef<number | undefined>(undefined);
  const leavesRef = useRef<Leaf[]>([]);

  // Initialize leaves
  useEffect(() => {
    const data = [];
    for (let i = 0; i < LEAF_COUNT; i++) {
      data.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 2,
        size: Math.random() * 0.5 + 0.5,
        type: (Math.random() > 0.5 ? 'leaf' : 'petal') as 'leaf' | 'petal',
      });
    }
    setLeaves(data);
    leavesRef.current = data;
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

  // Animate leaves
  useEffect(() => {
    if (leaves.length === 0) return;

    const loop = () => {
      // Update leaves
      leavesRef.current = leavesRef.current.map(leaf => {
        // Update position
        leaf.x += leaf.vx;
        leaf.y += leaf.vy;
        leaf.rotation += leaf.rotationSpeed;
        
        // Wrap around edges
        if (leaf.x < -10) leaf.x = 110;
        if (leaf.x > 110) leaf.x = -10;
        if (leaf.y < -10) leaf.y = 110;
        if (leaf.y > 110) leaf.y = -10;
        
        // Add gentle wind effect
        leaf.vx += (Math.random() - 0.5) * 0.01;
        leaf.vy += (Math.random() - 0.5) * 0.01;
        
        // Clamp velocity
        leaf.vx = Math.max(-0.5, Math.min(0.5, leaf.vx));
        leaf.vy = Math.max(-0.5, Math.min(0.5, leaf.vy));
        
        return leaf;
      });

      animationId.current = requestAnimationFrame(loop);
    };
    animationId.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationId.current!);
  }, [leaves.length, mouseEffectsEnabled]);

  return (
    <div 
      className="fixed inset-0 z-0 nature-forest-bg"
      style={{ backgroundColor }}
    >
      {/* Sunlight rays */}
      <div className="absolute inset-0 sunlight-rays" />
      
      {/* Floating leaves */}
      {leavesRef.current.map(leaf => (
        <div
          key={leaf.id}
          className={`absolute floating-leaf ${leaf.type}`}
          style={{
            left: `${leaf.x}%`,
            top: `${leaf.y}%`,
            transform: `rotate(${leaf.rotation}deg) scale(${leaf.size})`,
            color: accentColor,
            opacity: 0.7,
          }}
        >
          {leaf.type === 'leaf' ? '🍃' : '🌸'}
        </div>
      ))}
      
      {/* Gentle breeze effect */}
      <div 
        className="absolute breeze-effect"
        style={{
          left: `${mouseRef.current.x}%`,
          top: `${mouseRef.current.y}%`,
          background: `radial-gradient(circle, ${accentColor}20 0%, transparent 70%)`,
        }}
      />
    </div>
  );
} 