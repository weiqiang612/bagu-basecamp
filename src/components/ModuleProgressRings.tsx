'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { getCategoryIcon } from '@/lib/icons';

interface RadarData {
  category: string;
  score: number;
  totalCards: number;
  reviewedCards: number;
}

interface ModuleProgressRingsProps {
  data: RadarData[];
}

export default function ModuleProgressRings({ data }: ModuleProgressRingsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ringRefs = useRef<(SVGCircleElement | null)[]>([]);

  const radius = 22;
  const circumference = 2 * Math.PI * radius;

  // Exact matching styling stop colors from design mockup
  const themeColors = [
    { text: '#00f3ff', glow: 'rgba(0, 243, 255, 0.35)', gradId: 'ring-cyan' },
    { text: '#10b981', glow: 'rgba(16, 185, 129, 0.35)', gradId: 'ring-green' },
    { text: '#b537f2', glow: 'rgba(181, 55, 242, 0.35)', gradId: 'ring-purple' },
    { text: '#3b82f6', glow: 'rgba(59, 130, 246, 0.35)', gradId: 'ring-blue' },
    { text: '#00f3ff', glow: 'rgba(0, 243, 255, 0.35)', gradId: 'ring-cyan2' },
    { text: '#22d3ee', glow: 'rgba(34, 211, 238, 0.35)', gradId: 'ring-cyan3' }
  ];

  useGSAP(() => {
    data.forEach((d, i) => {
      const ring = ringRefs.current[i];
      if (ring) {
        const percentage = d.score / 100;
        const targetOffset = circumference - percentage * circumference;
        
        gsap.fromTo(ring,
          { strokeDashoffset: circumference },
          { 
            strokeDashoffset: targetOffset, 
            duration: 1.8, 
            ease: "power3.out",
            delay: 0.6 + i * 0.1
          }
        );
      }
    });
  }, { dependencies: [data] });

  return (
    <div 
      ref={containerRef} 
      style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        width: '100%', 
        padding: '1.25rem 0.5rem 0.25rem 0.5rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.04)',
        flexWrap: 'wrap',
        gap: '0.85rem'
      }}
    >
      {data.map((d, index) => {
        const color = themeColors[index % themeColors.length];
        const cleanName = d.category.replace(/核心|与缓存|与数据库|与AOP|检索架构|架构/g, '').trim();
        
        const total = d.totalCards;
        const reviewed = d.reviewedCards;
        
        // Progress tag
        const progressPercentage = total > 0 ? Math.round((reviewed / total) * 100) : 0;

        return (
          <div 
            key={index} 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              flex: '1 0 80px',
              textAlign: 'center',
              gap: '0.4rem'
            }}
          >
            {/* Circle Progress Container */}
            <div style={{ position: 'relative', width: '56px', height: '56px' }}>
              <svg width="56" height="56" viewBox="0 0 56 56" style={{ transform: 'rotate(-90deg)' }}>
                {/* Background Ring Track */}
                <circle
                  cx="28"
                  cy="28"
                  r={radius}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.025)"
                  strokeWidth="3.5"
                />
                {/* Animated Inner glowing progress path */}
                <circle
                  ref={el => { ringRefs.current[index] = el; }}
                  cx="28"
                  cy="28"
                  r={radius}
                  fill="none"
                  stroke={`url(#${color.gradId})`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference}
                  style={{ filter: `drop-shadow(0 0 4px ${color.glow})` }}
                />
                
                <defs>
                  <linearGradient id={color.gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={color.text} />
                    <stop offset="100%" stopColor="#0a0f1e" stopOpacity="0.1" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Score inside circular center */}
              <div 
                style={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  width: '100%', 
                  height: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  color: d.score > 0 ? color.text : 'var(--text-muted)',
                  textShadow: d.score > 0 ? `0 0 8px ${color.glow}` : 'none'
                }}
              >
                {d.score}%
              </div>
            </div>

            {/* Sub-label: Reviewed / Total card count and name badge */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.15rem' }}>
              {/* Cards finished details */}
              <div 
                style={{ 
                  fontSize: '0.68rem', 
                  color: 'var(--text-secondary)', 
                  fontFamily: 'var(--font-mono)', 
                  fontWeight: 500
                }}
              >
                {progressPercentage}%
              </div>
              
              {/* Category Logo + Short Title tag */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', justifyContent: 'center' }}>
                {getCategoryIcon(d.category, { fontSize: '0.8rem', color: d.score > 0 ? color.text : 'var(--text-muted)' })}
                <span 
                  style={{ 
                    fontSize: '0.72rem', 
                    fontWeight: 600, 
                    color: d.score > 0 ? 'var(--text-primary)' : 'var(--text-muted)' 
                  }}
                >
                  {cleanName}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
