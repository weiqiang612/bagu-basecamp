'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { TrophyIcon, CalendarIcon } from '@/lib/icons';

interface BottomStatsProps {
  totalCards: number;
  reviewedCards: number;
  completedCards: number;
  totalGrills: number;
  streak: number;
}

export default function BottomStats({ totalCards, reviewedCards, completedCards, totalGrills, streak }: BottomStatsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const valRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progressRefs = useRef<(HTMLDivElement | null)[]>([]);

  const stats = [
    { label: 'Completed', value: completedCards, suffix: '', icon: <TrophyIcon />, progress: totalCards > 0 ? (completedCards / totalCards) * 100 : 0 },
    { label: 'Topics Reviewed', value: reviewedCards, suffix: '', icon: <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9M3 20v-8a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v8M13 20v-4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v8" /></svg>, progress: totalCards > 0 ? (reviewedCards / totalCards) * 100 : 0 },
    { label: 'Mock Grills', value: totalGrills, suffix: '', icon: <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>, progress: Math.min(100, (totalGrills / 30) * 100) },
    { label: 'Streak', value: streak, suffix: ' Days', icon: <CalendarIcon />, progress: Math.min(100, (streak / 14) * 100) }
  ];

  useGSAP(() => {
    stats.forEach((stat, i) => {
      const element = valRefs.current[i];
      if (element) {
        gsap.fromTo(element,
          { innerText: 0 },
          {
            innerText: stat.value,
            duration: 1.5,
            ease: 'power3.out',
            delay: 0.4 + i * 0.1,
            snap: { innerText: 1 },
            onUpdate: function() {
              if (element) {
                element.innerText = this.targets()[0].innerText + stat.suffix;
              }
            }
          }
        );
      }
    });

    progressRefs.current.forEach((bar, i) => {
      if (bar) {
        gsap.fromTo(bar,
          { width: '0%' },
          { width: `${stats[i].progress}%`, duration: 1.5, ease: 'power3.out', delay: 0.6 + i * 0.1 }
        );
      }
    });
  }, { dependencies: [completedCards, reviewedCards, totalGrills, streak] });

  return (
    <div 
      ref={containerRef} 
      style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', // Force rigid 4 columns layout
        gap: '1.25rem', 
        width: '100%',
        margin: 0
      }}
    >
      {stats.map((stat, index) => (
        <div 
          key={index} 
          className="glass-panel reveal-init" 
          style={{ 
            padding: '1.2rem 1.25rem 1rem 1.25rem', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between',
            background: 'rgba(10, 15, 30, 0.65)',
            height: '120px' // Explicit height for grid alignment
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-secondary)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.05em', fontFamily: 'var(--font-header)' }}>{stat.label}</span>
            <span style={{ fontSize: '1rem', color: 'var(--accent-cyan)' }}>{stat.icon}</span>
          </div>
          
          <div 
            ref={el => { valRefs.current[index] = el; }} 
            className="neon-text" 
            style={{ 
              fontSize: '2.2rem', // enlarged from 1.75rem for much more grand look
              fontWeight: 700, 
              fontFamily: 'var(--font-mono)',
              lineHeight: 1.1,
              margin: '0.25rem 0'
            }}
          >
            0{stat.suffix}
          </div>
          
          <div style={{ width: '100%', height: '3px', background: 'rgba(255,255,255,0.04)', borderRadius: '1.5px', overflow: 'hidden' }}>
            <div 
              ref={el => { progressRefs.current[index] = el; }} 
              style={{ 
                height: '100%', 
                background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-purple))',
                borderRadius: '1.5px'
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
