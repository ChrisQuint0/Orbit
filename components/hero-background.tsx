"use client";

import { useEffect, useRef, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  opacity: number;
}

const PARTICLE_COUNT = 30;
const CONNECTION_DISTANCE = 120;
const SPEED = 0.15;

const COLORS = [
  "rgba(124, 110, 247, 0.6)", // violet
  "rgba(154, 142, 249, 0.5)", // violet-light
  "rgba(90, 206, 167, 0.4)",  // teal
  "rgba(181, 169, 250, 0.35)", // violet-200
];

function createParticle(width: number, height: number): Particle {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * SPEED,
    vy: (Math.random() - 0.5) * SPEED,
    radius: Math.random() * 1.5 + 0.5,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    opacity: Math.random() * 0.5 + 0.2,
  };
}

export function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);
  const isVisibleRef = useRef(true);
  const lastFrameRef = useRef(0);

  const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);

    // Radial gradient overlay
    const gradient = ctx.createRadialGradient(
      width * 0.5, height * 0.45, 0,
      width * 0.5, height * 0.45, width * 0.6
    );
    gradient.addColorStop(0, "rgba(124, 110, 247, 0.06)");
    gradient.addColorStop(0.5, "rgba(124, 110, 247, 0.02)");
    gradient.addColorStop(1, "transparent");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    const particles = particlesRef.current;

    // Update positions
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      p.x = Math.max(0, Math.min(width, p.x));
      p.y = Math.max(0, Math.min(height, p.y));
    }

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECTION_DISTANCE) {
          const opacity = (1 - dist / CONNECTION_DISTANCE) * 0.12;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(124, 110, 247, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[j].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw particles
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      // Re-initialize particles on resize
      particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () =>
        createParticle(rect.width, rect.height)
      );
    };

    resize();

    // If reduced motion, draw once and stop
    if (prefersReducedMotion) {
      const rect = canvas.getBoundingClientRect();
      draw(ctx, rect.width, rect.height);
      return;
    }

    // IntersectionObserver to pause when offscreen
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    observer.observe(canvas);

    const animate = (timestamp: number) => {
      animationRef.current = requestAnimationFrame(animate);

      // Throttle to ~30fps
      if (timestamp - lastFrameRef.current < 33) return;
      lastFrameRef.current = timestamp;

      if (!isVisibleRef.current) return;

      const rect = canvas.getBoundingClientRect();
      draw(ctx, rect.width, rect.height);
    };

    animationRef.current = requestAnimationFrame(animate);

    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
      observer.disconnect();
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
