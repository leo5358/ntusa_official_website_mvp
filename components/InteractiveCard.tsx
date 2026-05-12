"use client";

import React, { useEffect, useRef } from "react";
import "./InteractiveCard.css"; // 引入卡片的樣式

export default function InteractiveCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    const glare = glareRef.current;
    if (!card || !glare) return;

    const MAX_TILT = 16;
    const LERP_FACTOR = 0.10;

    let hovered = false;
    let rafId: number | null = null;
    let floatRafId: number | null = null;

    const cur = { rx: 0, ry: 0, gx: 50, gy: 50 };
    const tgt = { rx: 0, ry: 0, gx: 50, gy: 50 };

    function lerp(a: number, b: number, t: number) {
      return a + (b - a) * t;
    }

    function applyTransforms() {
      if (!card || !glare) return;
      const scale = hovered ? 1.03 : 1;
      card.style.transform = `perspective(900px) rotateX(${cur.rx.toFixed(2)}deg) rotateY(${cur.ry.toFixed(2)}deg) scale(${scale})`;

      const dist = Math.hypot((cur.gx - 50) / 50, (cur.gy - 50) / 50);
      const op = hovered ? Math.min(dist * 0.6 + 0.1, 0.55) : 0;

      glare.style.background =
        `radial-gradient(circle 350px at ${cur.gx.toFixed(1)}% ${cur.gy.toFixed(1)}%,` +
        `rgba(255,255,255,${(op * 1.5).toFixed(2)}) 0%,` +
        `rgba(255,255,255,${(op * 0.4).toFixed(2)}) 40%,` +
        `transparent 75%)`;
    }

    function tick() {
      let needsUpdate = false;
      const keys: (keyof typeof cur)[] = ['rx', 'ry', 'gx', 'gy'];
      
      for (const k of keys) {
        const next = lerp(cur[k], tgt[k], LERP_FACTOR);
        if (Math.abs(next - cur[k]) > 0.005) {
          cur[k] = next;
          needsUpdate = true;
        } else {
          cur[k] = tgt[k];
        }
      }

      applyTransforms();

      if (needsUpdate || hovered) {
        rafId = requestAnimationFrame(tick);
      } else {
        rafId = null;
      }
    }

    function startRAF() {
      if (!rafId) rafId = requestAnimationFrame(tick);
    }

    function computeFromPointer(clientX: number, clientY: number) {
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((clientY - rect.top) / rect.height) * 2 - 1;

      tgt.rx = -ny * MAX_TILT;
      tgt.ry = nx * MAX_TILT;
      tgt.gx = ((clientX - rect.left) / rect.width) * 100;
      tgt.gy = ((clientY - rect.top) / rect.height) * 100;
    }

    function resetToRest() {
      tgt.rx = 0; tgt.ry = 0;
      tgt.gx = 50; tgt.gy = 50;
    }

    const handleMouseEnter = (e: MouseEvent) => {
      hovered = true;
      computeFromPointer(e.clientX, e.clientY);
      startRAF();
    };

    const handleMouseMove = (e: MouseEvent) => {
      computeFromPointer(e.clientX, e.clientY);
    };

    const handleMouseLeave = () => {
      hovered = false;
      resetToRest();
      startRAF();
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      hovered = true;
      computeFromPointer(e.touches[0].clientX, e.touches[0].clientY);
      startRAF();
    };

    const handleTouchEnd = () => {
      hovered = false;
      resetToRest();
      startRAF();
    };

    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);
    card.addEventListener('touchmove', handleTouchMove, { passive: false });
    card.addEventListener('touchend', handleTouchEnd);

    function float(timestamp: number) {
      if (!card) return;
      if (!hovered && Math.abs(tgt.rx) < 0.5 && Math.abs(tgt.ry) < 0.5) {
        const rx = Math.sin(timestamp * 0.0007) * 2.5;
        const ry = Math.cos(timestamp * 0.0005) * 2.0;
        card.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(1)`;
      }
      floatRafId = requestAnimationFrame(float);
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!mediaQuery.matches) {
      floatRafId = requestAnimationFrame(float);
    } else {
      card.style.transform = 'none';
    }

    return () => {
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
      card.removeEventListener('touchmove', handleTouchMove);
      card.removeEventListener('touchend', handleTouchEnd);
      if (rafId) cancelAnimationFrame(rafId);
      if (floatRafId) cancelAnimationFrame(floatRafId);
    };
  }, []);

  return (
    <div className="stage">
      <div className="scene">
        <div className="card" ref={cardRef} id="card">
          <div className="card-noise"></div>
          <div className="card-glare" ref={glareRef} id="cardGlare"></div>
          <div className="card-dot"></div>
          <div className="card-inner">
            <span className="card-label">NTU Student Association</span>
            <div className="card-bottom">
              <div className="card-title">臺大學生會</div>
              <div className="card-desc">代表每一位臺大學生<br />守護學生權益，促進校園民主</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
