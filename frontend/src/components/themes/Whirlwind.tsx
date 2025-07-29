'use client';

import React, { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';
import { ThemeProps } from './types';

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragmentShader = `
precision highp float;

#define PI 3.14159265359

uniform float uTime;
uniform vec3 uResolution;
uniform float uSpinRotation;
uniform float uSpinSpeed;
uniform vec2 uOffset;
uniform vec3 uAccentColor;
uniform vec3 uBackgroundColor;
uniform float uContrast;
uniform float uLighting;
uniform float uSpinAmount;
uniform float uPixelFilter;
uniform float uSpinEase;
uniform bool uIsRotate;
uniform vec2 uMouse;

varying vec2 vUv;

vec3 hexToRgb(vec3 hex) {
  return hex / 255.0;
}

vec4 effect(vec2 screenSize, vec2 screen_coords) {
    float pixel_size = length(screenSize.xy) / uPixelFilter;
    vec2 uv = (floor(screen_coords.xy * (1.0 / pixel_size)) * pixel_size - 0.5 * screenSize.xy) / length(screenSize.xy) - uOffset;
    float uv_len = length(uv);
    
    float speed = (uSpinRotation * uSpinEase * 0.2);
    if(uIsRotate){
       speed = uTime * speed;
    }
    speed += 302.2;
    
    float mouseInfluence = (uMouse.x * 2.0 - 1.0);
    speed += mouseInfluence * 0.1;
    
    float new_pixel_angle = atan(uv.y, uv.x) + speed - uSpinEase * 20.0 * (uSpinAmount * uv_len + (1.0 - uSpinAmount));
    vec2 mid = (screenSize.xy / length(screenSize.xy)) / 2.0;
    uv = (vec2(uv_len * cos(new_pixel_angle) + mid.x, uv_len * sin(new_pixel_angle) + mid.y) - mid);
    
    uv *= 30.0;
    float baseSpeed = uTime * uSpinSpeed;
    speed = baseSpeed + mouseInfluence * 2.0;
    
    vec2 uv2 = vec2(uv.x + uv.y);
    
    for(int i = 0; i < 5; i++) {
        uv2 += sin(max(uv.x, uv.y)) + uv;
        uv += 0.5 * vec2(
            cos(5.1123314 + 0.353 * uv2.y + speed * 0.131121),
            sin(uv2.x - 0.113 * speed)
        );
        uv -= cos(uv.x + uv.y) - sin(uv.x * 0.711 - uv.y);
    }
    
    float contrast_mod = (0.25 * uContrast + 0.5 * uSpinAmount + 1.2);
    float paint_res = min(2.0, max(0.0, length(uv) * 0.035 * contrast_mod));
    float c1p = max(0.0, 1.0 - contrast_mod * abs(1.0 - paint_res));
    float c2p = max(0.0, 1.0 - contrast_mod * abs(paint_res));
    float c3p = 1.0 - min(1.0, c1p + c2p);
    float light = (uLighting - 0.2) * max(c1p * 5.0 - 4.0, 0.0) + uLighting * max(c2p * 5.0 - 4.0, 0.0);
    
    vec3 color1 = uAccentColor;
    vec3 color2 = mix(uAccentColor, vec3(1.0), 0.3);
    vec3 color3 = uBackgroundColor;
    
    return vec4((0.3 / uContrast) * color1 + (1.0 - 0.3 / uContrast) * (color1 * c1p + color2 * c2p + c3p * color3) + light, 1.0);
}

void main() {
    vec2 uv = vUv * uResolution.xy;
    gl_FragColor = effect(uResolution.xy, uv);
}
`;

export default function Whirlwind({ 
  themeColor = '#4f46e5', 
  accentColor = '#4f46e5',
  mouseEffectsEnabled = true,
  previewMode = false
}: ThemeProps) {
  const ctnDom = useRef<HTMLDivElement>(null);

  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return [0.545, 0.361, 0.965]; // Default purple
    
    return [
      parseInt(result[1], 16) / 255,
      parseInt(result[2], 16) / 255,
      parseInt(result[3], 16) / 255,
    ];
  };

  useEffect(() => {
    if (!ctnDom.current) return;
    const ctn = ctnDom.current;
    const renderer = new Renderer();
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 1);

    const geometry = new Triangle(gl);
    const themeRgb = hexToRgb(themeColor);
    const backgroundColor = [0.05, 0.05, 0.1]; // Dark background
    const program: Program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: {
          value: new Float32Array([
            gl.canvas.width,
            gl.canvas.height,
            gl.canvas.width / gl.canvas.height,
          ]),
        },
        uSpinRotation: { value: -2.0 },
        uSpinSpeed: { value: 7.0 },
        uOffset: { value: new Float32Array([0.0, 0.0]) },
        uAccentColor: { value: new Float32Array(themeRgb) },
        uBackgroundColor: { value: new Float32Array(backgroundColor) },
        uContrast: { value: 3.5 },
        uLighting: { value: 0.4 },
        uSpinAmount: { value: 0.25 },
        uPixelFilter: { value: 745.0 },
        uSpinEase: { value: 1.0 },
        uIsRotate: { value: false },
        uMouse: { value: new Float32Array([0.5, 0.5]) },
      },
    });

    function resize() {
      const scale = 1;
      renderer.setSize(ctn.offsetWidth * scale, ctn.offsetHeight * scale);
      if (program) {
        program.uniforms.uResolution.value = new Float32Array([
          gl.canvas.width,
          gl.canvas.height,
          gl.canvas.width / gl.canvas.height,
        ]);
      }
    }
    window.addEventListener("resize", resize, false);
    resize();

    const mesh = new Mesh(gl, { geometry, program });
    let animateId: number;

    function update(t: number) {
      animateId = requestAnimationFrame(update);
      program.uniforms.uTime.value = t * 0.001;
      renderer.render({ scene: mesh });
    }
    animateId = requestAnimationFrame(update);
    ctn.appendChild(gl.canvas);

    function handleMouseMove(e: MouseEvent) {
      if (!mouseEffectsEnabled) return;
      const rect = ctn.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;
      program.uniforms.uMouse.value = new Float32Array([x, y]);
    }
    
    if (mouseEffectsEnabled) {
      ctn.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      cancelAnimationFrame(animateId);
      window.removeEventListener("resize", resize);
      if (mouseEffectsEnabled) {
        ctn.removeEventListener("mousemove", handleMouseMove);
      }
      if (gl.canvas.parentElement) {
        gl.canvas.parentElement.removeChild(gl.canvas);
      }
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [themeColor, accentColor, mouseEffectsEnabled]);

  return (
    <div
      ref={ctnDom}
      className={`${previewMode ? 'absolute inset-0' : 'fixed inset-0 z-0'} whirlwind-bg`}
    />
  );
} 