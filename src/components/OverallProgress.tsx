import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface OverallProgressProps {
  reviewedCards: number;
  totalCards: number;
}

export default function OverallProgress({ reviewedCards, totalCards }: OverallProgressProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  
  const percentage = totalCards === 0 ? 0 : Math.round((reviewedCards / totalCards) * 100);

  // Merged states for customizable sprint countdown to avoid cascading renders
  const [sprintState, setSprintState] = useState({
    isMounted: false,
    sprintDays: 14,
    passedDays: 0
  });
  const [showSettings, setShowSettings] = useState(false);

  const { isMounted, sprintDays, passedDays } = sprintState;

  useEffect(() => {
    const timer = setTimeout(() => {
      const savedSprint = localStorage.getItem('sprint_days');
      const savedPassed = localStorage.getItem('passed_days');
      setSprintState({
        isMounted: true,
        sprintDays: savedSprint ? parseInt(savedSprint) || 14 : 14,
        passedDays: savedPassed ? parseInt(savedPassed) || 0 : 0
      });
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleSprintChange = (val: number) => {
    const cleaned = Math.max(1, val);
    localStorage.setItem('sprint_days', cleaned.toString());
    setSprintState(prev => {
      const nextPassed = prev.passedDays > cleaned ? cleaned : prev.passedDays;
      if (prev.passedDays > cleaned) {
        localStorage.setItem('passed_days', cleaned.toString());
      }
      return {
        ...prev,
        sprintDays: cleaned,
        passedDays: nextPassed
      };
    });
  };

  const handlePassedChange = (val: number) => {
    const cleaned = Math.max(0, Math.min(sprintDays, val));
    localStorage.setItem('passed_days', cleaned.toString());
    setSprintState(prev => ({
      ...prev,
      passedDays: cleaned
    }));
  };

  const timeRatio = sprintDays > 0 ? (passedDays / sprintDays) * 100 : 0;
  const isBehind = isMounted && passedDays > 0 && percentage < timeRatio;

  useGSAP(() => {
    gsap.fromTo(barRef.current,
      { width: '0%' },
      { width: `${percentage}%`, duration: 1.5, ease: 'power3.out', delay: 0.5 }
    );

    gsap.fromTo(textRef.current,
      { innerText: 0 },
      {
        innerText: percentage,
        duration: 1.5,
        ease: 'power3.out',
        delay: 0.5,
        snap: { innerText: 1 },
        onUpdate: function() {
          if (textRef.current) {
            textRef.current.innerText = this.targets()[0].innerText + '%';
          }
        }
      }
    );
  }, { dependencies: [percentage] });

  return (
    <div 
      className="glass-panel reveal-init" 
      style={{ 
        padding: '0 1.5rem', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center',
        gap: '0.6rem',
        height: '80px', // Explicit 80px height to align perfectly with Header card on Row 1
        margin: 0,
        position: 'relative',
        overflow: 'visible', // Ensure settings popover is visible when opened
        zIndex: showSettings ? 999 : 2 // Elevate zIndex when popover is open to override 3D Tilt layers below
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-header)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Overall Progress: <span ref={textRef} className="neon-text" style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>0%</span>
          {isMounted && passedDays > 0 && (
            <span 
              style={{ 
                fontSize: '0.72rem', 
                padding: '1px 6px',
                borderRadius: '3px',
                background: isBehind ? 'rgba(255, 77, 79, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                color: isBehind ? '#ff4d4f' : 'var(--accent-emerald)', 
                fontWeight: 700,
                border: isBehind ? '1px solid rgba(255, 77, 79, 0.25)' : '1px solid rgba(16, 185, 129, 0.25)',
                textShadow: isBehind ? '0 0 6px rgba(255, 77, 79, 0.4)' : 'none',
                letterSpacing: '0.02em'
              }}
            >
              {isBehind ? 'BEHIND' : 'ON TRACK'}
            </span>
          )}
        </span>
        
        {/* Settings gear trigger icon */}
        <button 
          onClick={() => setShowSettings(!showSettings)}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: showSettings ? 'var(--accent-cyan)' : 'var(--text-secondary)', 
            cursor: 'pointer', 
            padding: '2px', 
            display: 'flex', 
            alignItems: 'center',
            transition: 'color 0.2s',
            outline: 'none'
          }}
          title="设置冲刺燃尽时间"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: showSettings ? 'rotate(45deg)' : 'none', transition: 'transform 0.3s' }}>
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>
      
      <div 
        style={{ 
          width: '100%', 
          height: '6px', 
          background: 'rgba(255, 255, 255, 0.05)', 
          borderRadius: '3px',
          overflow: 'visible', // Allow time marker to visually pop
          position: 'relative'
        }}
      >
        <div 
          ref={barRef}
          style={{ 
            height: '100%', 
            width: '0%',
            background: isBehind 
              ? 'linear-gradient(90deg, #ff4d4f, var(--accent-purple))' 
              : 'linear-gradient(90deg, var(--accent-cyan), var(--accent-purple))',
            borderRadius: '3px',
            boxShadow: isBehind 
              ? '0 0 10px rgba(255, 77, 79, 0.7)' 
              : '0 0 8px var(--accent-cyan-glow)',
            transition: 'background 0.3s, box-shadow 0.3s'
          }}
        />
        
        {/* Burning deadline dashed timeline marker */}
        {isMounted && sprintDays > 0 && passedDays > 0 && (
          <div 
            style={{
              position: 'absolute',
              top: '-4px',
              bottom: '-4px',
              left: `${Math.min(100, timeRatio)}%`,
              width: '2px',
              background: '#ffffff',
              boxShadow: '0 0 8px #ffffff, 0 0 15px rgba(255, 255, 255, 0.6)',
              zIndex: 3,
              pointerEvents: 'none'
            }}
            title={`面试时间线已耗: ${Math.round(timeRatio)}%`}
          />
        )}
      </div>

      {/* Floating Settings Popover Panel */}
      {showSettings && (
        <div 
          className="glass-panel"
          style={{
            position: 'absolute',
            top: '2.8rem',
            right: '1.25rem',
            zIndex: 100,
            padding: '1rem',
            background: 'rgba(6, 9, 18, 0.96)',
            borderColor: 'rgba(0, 243, 255, 0.25)',
            boxShadow: '0 15px 35px rgba(0,0,0,0.85), 0 0 15px rgba(0, 243, 255, 0.08)',
            width: '200px',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
            fontSize: '0.8rem',
            borderRadius: '8px',
            animation: 'reveal-popover 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)'
          }}
        >
          <style jsx>{`
            @keyframes reveal-popover {
              from { opacity: 0; transform: translateY(-5px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          <div style={{ fontWeight: 700, color: 'var(--accent-cyan)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', letterSpacing: '0.05em' }}>
            <span>面试突击排程</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => setShowSettings(false)}>CLOSE</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>冲刺总天数:</label>
            <input 
              type="number" 
              value={sprintDays} 
              onChange={(e) => handleSprintChange(parseInt(e.target.value) || 1)}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '4px',
                padding: '4px 6px',
                color: '#fff',
                fontSize: '0.8rem',
                fontFamily: 'var(--font-mono)',
                outline: 'none'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>已过去天数:</label>
            <input 
              type="number" 
              value={passedDays} 
              onChange={(e) => handlePassedChange(parseInt(e.target.value) || 0)}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '4px',
                padding: '4px 6px',
                color: '#fff',
                fontSize: '0.8rem',
                fontFamily: 'var(--font-mono)',
                outline: 'none'
              }}
            />
          </div>
          
          {isMounted && (
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.5rem', marginTop: '0.2rem' }}>
              时间已消耗 <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{Math.round(timeRatio)}%</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
