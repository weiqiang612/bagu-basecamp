'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface CircularProgressProps {
  reviewedCards: number;
  totalCards: number;
}

export default function CircularProgress({ reviewedCards, totalCards }: CircularProgressProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const percentage = totalCards === 0 ? 0 : (reviewedCards / totalCards);
  const targetOffset = circumference - percentage * circumference;

  useGSAP(() => {
    // Animate the circle stroke
    gsap.fromTo(circleRef.current, 
      { strokeDashoffset: circumference },
      { 
        strokeDashoffset: targetOffset, 
        duration: 2, 
        ease: "power3.out",
        delay: 0.5
      }
    );

    // Animate the text counting up
    gsap.fromTo(textRef.current,
      { innerText: 0 },
      {
        innerText: Math.round(percentage * 100),
        duration: 2,
        ease: "power3.out",
        delay: 0.5,
        snap: { innerText: 1 },
        onUpdate: function() {
          if (textRef.current) {
            textRef.current.innerHTML = this.targets()[0].innerText + '<span style="font-size: 0.5em; color: var(--text-muted)">%</span>';
          }
        }
      }
    );
  }, { dependencies: [targetOffset, percentage] });

  return (
    <div ref={containerRef} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', letterSpacing: '0.05em' }}>整体织网进度</h2>
      <div style={{ position: 'relative', width: '160px', height: '160px' }}>
        <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="var(--bg-dark)"
            strokeWidth="12"
          />
          {/* Foreground progress circle */}
          <circle
            ref={circleRef}
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="url(#cyan-glow)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            style={{ filter: 'drop-shadow(0 0 8px var(--accent-cyan-glow))' }}
          />
          <defs>
            <linearGradient id="cyan-glow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--accent-cyan)" />
              <stop offset="100%" stopColor="var(--accent-purple)" />
            </linearGradient>
          </defs>
        </svg>
        <div 
          style={{ 
            position: 'absolute', 
            top: '0', 
            left: '0', 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexDirection: 'column'
          }}
        >
          <div ref={textRef} className="neon-text" style={{ fontSize: '2.5rem', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>
            0<span style={{ fontSize: '0.5em', color: 'var(--text-muted)' }}>%</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {reviewedCards} / {totalCards} 卡片
          </div>
        </div>
      </div>
    </div>
  );
}
