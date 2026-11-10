'use client';

import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import Header from '@/components/Header';
import OverallProgress from '@/components/OverallProgress';
import RadarChart from '@/components/RadarChart';
import ModuleProgressRings from '@/components/ModuleProgressRings';
import BottomStats from '@/components/BottomStats';
import RecommendationList from '@/components/RecommendationList';

gsap.registerPlugin(useGSAP);

interface RadarData {
  category: string;
  score: number;
  totalCards: number;
  reviewedCards: number;
}

interface CardStats {
  title: string;
  category: string;
  grillCount: number;
  lastGrilled: string | null;
  score: number;
  filePath: string;
  priority: number;
  lastGrillScore: number;
}

interface ProgressData {
  totalCards: number;
  reviewedCards: number;
  completedCards: number;
  totalGrills: number;
  streak: number;
  radarData: RadarData[];
  recommendations: CardStats[];
}

export default function Home() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/progress?sync=true');
      if (!res.ok) throw new Error('Failed to synchronize data');
      const newData = await res.json();
      setData(newData);
    } catch (err) {
      console.error(err);
    } finally {
      // Small visual delay to make rotation look satisfying
      setTimeout(() => setIsSyncing(false), 800);
    }
  };

  useEffect(() => {
    fetch('/api/progress')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch dashboard data');
        return res.json();
      })
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useGSAP(() => {
    if (!loading && !error && containerRef.current) {
      const elements = containerRef.current.querySelectorAll('.reveal-init');
      gsap.fromTo(elements,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out' }
      );
    }
  }, { dependencies: [loading, error] });

  if (loading) {
    return <SkeletonDashboard />;
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff4d4f', background: '#060913', padding: '2rem' }}>
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', maxWidth: '500px' }}>
          <h2 style={{ marginBottom: '1rem' }}>Database Connection Error</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error}</p>
          <button onClick={() => window.location.reload()} style={{ padding: '0.5rem 1.5rem', background: 'var(--accent-purple)', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}>Retry Sync</button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div ref={containerRef} style={{ position: 'relative', minHeight: '100vh', zIndex: 1, padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div className="ambient-glow-1" />
      <div className="ambient-glow-2" />

      {/* 
        Perfect Mathematically Aligned Heights to prevent vertical scrollbar:
        Left Column: Header (80px) + Radar Card (600px) + Stats Grid (120px) + 2 Gaps (40px) = 840px
        Right Column: OverallProgress (80px) + RecommendationList Card (740px) + 1 Gap (20px) = 840px
        Radar Card height increased from 540px to 600px to fully reveal progress rings.
      */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: '1.8fr 1fr', 
          gap: '1.25rem',
          position: 'relative',
          zIndex: 2
        }}
      >
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <Header onSync={handleSync} isSyncing={isSyncing} />

          {/* Main 6 Modules Panel */}
          <div 
            className="glass-panel reveal-init" 
            style={{ 
              padding: '1.5rem 1rem 1rem 1rem', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(10, 15, 30, 0.7)',
              borderColor: 'rgba(255,255,255,0.06)',
              height: '600px'
            }}
          >
            <h2 
              style={{ 
                alignSelf: 'flex-start',
                fontSize: '0.9rem', 
                color: 'var(--text-secondary)', 
                letterSpacing: '0.1em', 
                margin: '0 0 0 0.5rem',
                textTransform: 'uppercase',
                fontWeight: 700
              }}
            >
              6 Technical Modules
            </h2>
            
            <RadarChart data={data.radarData} />
            
            <ModuleProgressRings data={data.radarData} />
          </div>

          <BottomStats 
            totalCards={data.totalCards}
            reviewedCards={data.reviewedCards}
            completedCards={data.completedCards}
            totalGrills={data.totalGrills}
            streak={data.streak}
          />
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: '840px' }}>

          <OverallProgress reviewedCards={data.reviewedCards} totalCards={data.totalCards} />

          <div style={{ flex: 1, minHeight: 0 }}>
            <RecommendationList cards={data.recommendations} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Micro-Shimmer Dashboard Skeleton for seamless visual transition
function SkeletonDashboard() {
  return (
    <div style={{ position: 'relative', minHeight: '100vh', padding: '1.5rem', maxWidth: '1400px', margin: '0 auto', zIndex: 1 }}>
      <div className="ambient-glow-1" />
      <div className="ambient-glow-2" />
      
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: '1.8fr 1fr', 
          gap: '1.25rem',
          position: 'relative',
          zIndex: 2
        }}
      >
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Header Skeleton */}
          <div className="skeleton-card" style={{ height: '80px', padding: '1.5rem', display: 'flex', alignItems: 'center' }}>
            <div className="skeleton-shimmer" style={{ width: '35%', height: '18px', borderRadius: '4px' }} />
          </div>

          {/* Main 6 Modules Panel Skeleton */}
          <div 
            className="skeleton-card" 
            style={{ 
              height: '600px',
              padding: '1.5rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div className="skeleton-shimmer" style={{ width: '120px', height: '14px', borderRadius: '4px', alignSelf: 'flex-start', margin: '0 0 0 0.5rem' }} />
            
            {/* Hexagon radar shape mock */}
            <div className="skeleton-shimmer" style={{ width: '260px', height: '260px', borderRadius: '50%', margin: '1rem 0' }} />
            
            {/* Progress rings placeholders */}
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: '0.85rem', padding: '1.25rem 0.5rem 0.25rem 0.5rem', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: '1 0 80px' }}>
                  <div className="skeleton-shimmer" style={{ width: '56px', height: '56px', borderRadius: '50%' }} />
                  <div className="skeleton-shimmer" style={{ width: '40px', height: '10px', borderRadius: '2px' }} />
                </div>
              ))}
            </div>
          </div>

          {/* BottomStats Skeleton */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton-card" style={{ height: '120px', padding: '1.2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div className="skeleton-shimmer" style={{ width: '50%', height: '12px', borderRadius: '3px' }} />
                <div className="skeleton-shimmer" style={{ width: '40%', height: '28px', borderRadius: '4px' }} />
                <div className="skeleton-shimmer" style={{ width: '100%', height: '3px', borderRadius: '1.5px' }} />
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', height: '800px' }}>
          
          {/* OverallProgress Skeleton */}
          <div className="skeleton-card" style={{ height: '80px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.6rem' }}>
            <div className="skeleton-shimmer" style={{ width: '50%', height: '14px', borderRadius: '3px' }} />
            <div className="skeleton-shimmer" style={{ width: '100%', height: '6px', borderRadius: '3px' }} />
          </div>
          
          {/* RecommendationList Skeleton */}
          <div className="skeleton-card" style={{ height: '740px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="skeleton-shimmer" style={{ width: '40%', height: '14px', borderRadius: '3px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', flex: 1, overflow: 'hidden' }}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="skeleton-card" style={{ height: '94px', padding: '1.1rem 1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.02)', background: 'rgba(255,255,255,0.01)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', width: '70%' }}>
                      <div className="skeleton-shimmer" style={{ width: '90%', height: '15px', borderRadius: '3px' }} />
                      <div className="skeleton-shimmer" style={{ width: '35%', height: '10px', borderRadius: '2px' }} />
                    </div>
                    <div className="skeleton-shimmer" style={{ width: '20px', height: '20px', borderRadius: '4px' }} />
                  </div>
                  <div className="skeleton-shimmer" style={{ width: '100%', height: '4px', borderRadius: '2px' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
