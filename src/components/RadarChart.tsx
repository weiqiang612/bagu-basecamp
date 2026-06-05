'use client';

import { useRef, useMemo } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface RadarData {
  category: string;
  score: number;
}

interface RadarChartProps {
  data: RadarData[];
}

const getCoordinates = (scores: number[], center: number, radius: number) => {
  return scores.map((score, index) => {
    const angle = (Math.PI / 2) - (index * (2 * Math.PI) / 6);
    const scaledRadius = (score / 100) * radius;
    const x = center + scaledRadius * Math.cos(angle);
    const y = center - scaledRadius * Math.sin(angle);
    return { x, y, string: `${x},${y}` };
  });
};

const getInnerCoordinates = (scores: number[], center: number, radius: number) => {
  return scores.map((score, index) => {
    const angle = (Math.PI / 2) - (index * (2 * Math.PI) / 6);
    const scaledRadius = (score / 100) * radius * 0.97;
    const x = center + scaledRadius * Math.cos(angle);
    const y = center - scaledRadius * Math.sin(angle);
    return { x, y, string: `${x},${y}` };
  });
};

export default function RadarChart({ data }: RadarChartProps) {
  const polygonOuterRef = useRef<SVGPolygonElement>(null);
  const polygonInnerRef = useRef<SVGPolygonElement>(null);
  const dotRefs = useRef<(SVGCircleElement | null)[]>([]);
  const outerDotRefs = useRef<(SVGCircleElement | null)[]>([]);

  // Expanded size from 380 to 420 for a grander and more prominent display
  const size = 420;
  const center = size / 2;
  const radius = (size / 2) - 68; // Optimized spacing for labels

  const safeData = useMemo(() => {
    const d = data.slice(0, 6);
    while (d.length < 6) {
      d.push({ category: `Unknown ${d.length + 1}`, score: 0 });
    }
    return d;
  }, [data]);

  const zeroCoords = useMemo(() => getCoordinates(safeData.map(() => 0), center, radius).map(c => c.string).join(' '), [safeData, radius, center]);
  
  const targetCoords = useMemo(() => getCoordinates(safeData.map(d => d.score), center, radius), [safeData, radius, center]);
  const targetPointsString = useMemo(() => targetCoords.map(c => c.string).join(' '), [targetCoords]);

  const targetInnerCoords = useMemo(() => getInnerCoordinates(safeData.map(d => d.score), center, radius), [safeData, radius, center]);
  const targetInnerPointsString = useMemo(() => targetInnerCoords.map(c => c.string).join(' '), [targetInnerCoords]);

  const getAnchor = (angle: number) => {
    const cos = Math.cos(angle);
    if (cos > 0.15) return 'start';
    if (cos < -0.15) return 'end';
    return 'middle';
  };

  useGSAP(() => {
    if (polygonOuterRef.current) {
      gsap.fromTo(polygonOuterRef.current,
        { attr: { points: zeroCoords } },
        { attr: { points: targetPointsString }, duration: 1.8, ease: "elastic.out(1, 0.65)", delay: 0.1 }
      );
    }

    if (polygonInnerRef.current) {
      gsap.fromTo(polygonInnerRef.current,
        { attr: { points: zeroCoords } },
        { attr: { points: targetInnerPointsString }, duration: 1.8, ease: "elastic.out(1, 0.65)", delay: 0.2 }
      );
    }

    targetCoords.forEach((coord, i) => {
      const dot = dotRefs.current[i];
      const outerDot = outerDotRefs.current[i];
      
      if (dot && outerDot) {
        gsap.fromTo(dot,
          { attr: { cx: center, cy: center, r: 0 } },
          { attr: { cx: coord.x, cy: coord.y, r: 3 }, duration: 1.8, ease: "elastic.out(1, 0.65)", delay: 0.15 }
        );

        gsap.fromTo(outerDot,
          { attr: { cx: center, cy: center, r: 0 } },
          { attr: { cx: coord.x, cy: coord.y, r: 8 }, duration: 1.8, ease: "elastic.out(1, 0.65)", delay: 0.15 }
        );
      }
    });
  }, { dependencies: [targetPointsString, targetInnerPointsString, zeroCoords, targetCoords] });

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', padding: '0.25rem 0' }}>
      <svg width={size} height={size} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="grid-glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(0, 243, 255, 0.15)" />
            <stop offset="100%" stopColor="rgba(181, 55, 242, 0.1)" />
          </linearGradient>
          <linearGradient id="radar-cyan-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f3ff" />
            <stop offset="100%" stopColor="#0070f3" />
          </linearGradient>
        </defs>

        {/* Grid Hexagons */}
        {[100, 80, 60, 40, 20].map((level) => (
          <polygon
            key={level}
            points={getCoordinates(safeData.map(() => level), center, radius).map(c => c.string).join(' ')}
            fill="none"
            stroke="url(#grid-glow)"
            strokeWidth="1"
          />
        ))}

        {/* Boundary Hexagon */}
        <polygon
          points={getCoordinates(safeData.map(() => 100), center, radius).map(c => c.string).join(' ')}
          fill="none"
          stroke="rgba(0, 243, 255, 0.08)"
          strokeWidth="1.5"
        />

        {/* Grid Axes */}
        {safeData.map((_, index) => {
          const angle = (Math.PI / 2) - (index * (2 * Math.PI) / 6);
          const x = center + radius * Math.cos(angle);
          const y = center - radius * Math.sin(angle);
          return (
            <line 
              key={`axis-${index}`} 
              x1={center} 
              y1={center} 
              x2={x} 
              y2={y} 
              stroke="rgba(255, 255, 255, 0.035)" 
              strokeWidth="1"
              strokeDasharray="2 2"
            />
          );
        })}

        {/* Outer Cyan Glow Polygon */}
        <polygon
          ref={polygonOuterRef}
          points={zeroCoords}
          fill="rgba(0, 243, 255, 0.04)"
          stroke="url(#radar-cyan-grad)"
          strokeWidth="3.5"
          style={{ filter: 'drop-shadow(0 0 6px rgba(0, 243, 255, 0.4))' }}
        />

        {/* Inner Purple Dashed Polygon */}
        <polygon
          ref={polygonInnerRef}
          points={zeroCoords}
          fill="rgba(181, 55, 242, 0.02)"
          stroke="var(--accent-purple)"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />

        {/* Glowing Dots */}
        {safeData.map((_, i) => (
          <g key={`dots-group-${i}`}>
            <circle
              ref={el => { outerDotRefs.current[i] = el; }}
              cx={center}
              cy={center}
              r="0"
              fill="rgba(0, 243, 255, 0.25)"
              stroke="rgba(0, 243, 255, 0.4)"
              strokeWidth="1"
            />
            <circle
              ref={el => { dotRefs.current[i] = el; }}
              cx={center}
              cy={center}
              r="0"
              fill="#ffffff"
            />
          </g>
        ))}

        {/* Labels with Rajdhani/Chakra styling */}
        {safeData.map((d, index) => {
          const angle = (Math.PI / 2) - (index * (2 * Math.PI) / 6);
          const labelRadius = radius + 24; // pushed slightly further out to align nicely
          const x = center + labelRadius * Math.cos(angle);
          const y = center - labelRadius * Math.sin(angle);
          const anchor = getAnchor(angle);
          
          const cleanCategory = d.category.replace(/核心|与缓存|与数据库|与AOP|检索架构|架构/g, '').trim().toUpperCase();

          return (
            <g key={`label-${index}`} style={{ transform: 'translateY(4px)' }}>
              <text
                x={x}
                y={y - 8}
                fill="var(--text-primary)"
                fontSize="11" // enlarged from 10 to 11
                fontWeight="700"
                fontFamily="var(--font-header)" // changed to Chakra Petch
                letterSpacing="0.08em"
                textAnchor={anchor}
              >
                {cleanCategory}
              </text>
              <text
                x={x}
                y={y + 8}
                fill="var(--accent-cyan)"
                fontSize="12" // enlarged from 11 to 12
                fontWeight="700"
                fontFamily="var(--font-mono)"
                textAnchor={anchor}
                style={{ 
                  fill: d.score > 0 ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  textShadow: d.score > 0 ? '0 0 6px var(--accent-cyan-glow)' : 'none'
                }}
              >
                {d.score}%
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
