import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { getCategoryIcon } from '@/lib/icons';

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

interface RecommendationListProps {
  cards: CardStats[];
}

export default function RecommendationList({ cards }: RecommendationListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleCardClick = (filePath: string) => {
    if (!filePath) return;
    const obsidianUrl = `obsidian://open?path=${encodeURIComponent(filePath)}`;
    window.open(obsidianUrl);
  };

  // Score intervals mappings for color codes
  const getScoreStatus = (score: number) => {
    if (score < 40) {
      return { 
        label: 'URGENT', 
        colorClass: 'card-urgent', 
        themeColor: 'var(--color-urgent)',
        bgRgb: '255, 77, 79'
      };
    }
    if (score < 80) {
      return { 
        label: 'DECAYING', 
        colorClass: 'card-decaying', 
        themeColor: 'var(--color-decaying)',
        bgRgb: '245, 158, 11'
      };
    }
    return { 
      label: 'STABLE', 
      colorClass: 'card-stable', 
      themeColor: 'var(--color-stable)',
      bgRgb: '16, 185, 129'
    };
  };

  // GSAP Hover and 3D Tilt handlers
  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    const card = e.currentTarget;
    const badge = card.querySelector('.obsidian-link-badge');
    const status = getScoreStatus(cards[index].score);
    
    // Choose glow according to score level
    const glowColor = status.themeColor;
    const borderColor = `rgba(${status.bgRgb}, 0.35)`;

    gsap.to(card, {
      y: -3,
      boxShadow: `0 12px 30px rgba(0, 0, 0, 0.7), 0 0 20px ${glowColor}25`,
      borderColor: borderColor,
      background: 'rgba(255, 255, 255, 0.035)',
      duration: 0.3,
      ease: 'power2.out'
    });

    if (badge) {
      gsap.to(badge, {
        opacity: 1,
        x: 0,
        duration: 0.3,
        ease: 'power2.out'
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    
    // Calculate cursor location relative to center coordinates of card (-0.5 to 0.5)
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const percentX = (x / rect.width) - 0.5;
    const percentY = (y / rect.height) - 0.5;

    // Limit rotational bias to a premium, subtle 3 degrees max
    const rotateY = percentX * 3;
    const rotateX = -percentY * 3;

    gsap.to(card, {
      rotateY: rotateY,
      rotateX: rotateX,
      transformPerspective: 600,
      duration: 0.25,
      ease: 'power1.out'
    });
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    const card = e.currentTarget;
    const badge = card.querySelector('.obsidian-link-badge');
    const status = getScoreStatus(cards[index].score);

    // Revert back to the idle styling class constraints
    const defaultBorder = `rgba(${status.bgRgb}, 0.08)`;

    gsap.to(card, {
      y: 0,
      rotateX: 0,
      rotateY: 0,
      boxShadow: 'none',
      borderColor: defaultBorder,
      background: 'rgba(255, 255, 255, 0.02)',
      duration: 0.5,
      ease: 'power2.out'
    });

    if (badge) {
      gsap.to(badge, {
        opacity: 0,
        x: 6,
        duration: 0.3,
        ease: 'power2.in'
      });
    }
  };

  useGSAP(() => {
    if (containerRef.current) {
      const elements = containerRef.current.querySelectorAll('.recommendation-card');
      gsap.fromTo(elements, 
        { y: 30, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.8, 
          stagger: 0.12, 
          ease: "back.out(1.5)",
          delay: 0.8 
        }
      );

      cards.forEach((card, i) => {
        const bar = barRefs.current[i];
        if (bar) {
          gsap.fromTo(bar,
            { width: '0%' },
            { width: `${card.score}%`, duration: 1.5, ease: 'power3.out', delay: 1.0 + i * 0.1 }
          );
        }
      });
    }
  }, { dependencies: [cards] });

  const getBadgeColors = (category: string) => {
    const name = category.replace(/^\d+\.\s*/, '');
    switch (name) {
      case 'Java 核心':
      case 'Java':
        return { border: '1px solid rgba(0, 243, 255, 0.18)', background: 'rgba(0, 243, 255, 0.04)', color: 'var(--accent-cyan)' };
      case 'Spring 与 AOP':
      case 'Spring':
        return { border: '1px solid rgba(16, 185, 129, 0.18)', background: 'rgba(16, 185, 129, 0.04)', color: 'var(--accent-emerald)' };
      case 'Redis 与缓存':
      case 'Redis':
        return { border: '1px solid rgba(181, 55, 242, 0.18)', background: 'rgba(181, 55, 242, 0.04)', color: 'var(--accent-purple)' };
      case 'MySQL 与数据库':
      case 'MySQL':
        return { border: '1px solid rgba(59, 130, 246, 0.18)', background: 'rgba(59, 130, 246, 0.04)', color: '#3b82f6' };
      default:
        return { border: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-secondary)' };
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="glass-panel" 
      style={{ 
        padding: '1.5rem', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        background: 'rgba(10, 15, 30, 0.75)',
        borderColor: 'rgba(255, 255, 255, 0.05)',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
      }}
    >
      <h2 
        style={{ 
          fontSize: '0.9rem', 
          color: 'var(--text-secondary)', 
          letterSpacing: '0.12em', 
          marginTop: 0, 
          marginBottom: '1.25rem', 
          textTransform: 'uppercase', 
          fontWeight: 700 
        }}
      >
        Recently Reviewed Topics
      </h2>
      
      {cards.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          No study recommendations at this time.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', flex: 1, overflowY: 'auto', paddingRight: '4px' }} className="custom-scroll-container">
          {cards.map((card, index) => {
            const badgeStyle = getBadgeColors(card.category);
            const status = getScoreStatus(card.score);

            return (
              <div 
                key={index} 
                className={`recommendation-card ${status.colorClass}`}
                onClick={() => handleCardClick(card.filePath)}
                onMouseEnter={(e) => handleMouseEnter(e, index)}
                onMouseMove={handleMouseMove}
                onMouseLeave={(e) => handleMouseLeave(e, index)}
                style={{
                  border: `1px solid rgba(${status.bgRgb}, 0.08)`,
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '10px',
                  padding: '1.1rem 1rem 1rem 1rem',
                  cursor: 'pointer',
                  transition: 'background 0.3s, border-color 0.3s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                  position: 'relative',
                  transformStyle: 'preserve-3d'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxWidth: '78%' }}>
                    <h3 
                      style={{ 
                        fontSize: '0.9rem', 
                        fontWeight: 700, 
                        margin: 0, 
                        color: 'var(--text-primary)',
                        letterSpacing: '0.01em',
                        lineHeight: '1.25',
                        whiteSpace: 'normal',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {card.title}
                    </h3>
                    
                    {/* Badge layout with score status warning badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <div 
                        className="obsidian-badge" 
                        style={{ 
                          alignSelf: 'flex-start',
                          fontSize: '0.68rem',
                          padding: '1px 7px',
                          ...badgeStyle
                        }}
                      >
                        {card.category}
                      </div>
                      
                      <div 
                        style={{
                          fontSize: '0.64rem',
                          padding: '1px 6px',
                          borderRadius: '3px',
                          background: `rgba(${status.bgRgb}, 0.12)`,
                          color: status.themeColor,
                          border: `1px solid rgba(${status.bgRgb}, 0.25)`,
                          fontWeight: 800,
                          letterSpacing: '0.04em',
                          fontFamily: 'var(--font-sans)'
                        }}
                      >
                        {status.label}
                      </div>

                      {card.lastGrillScore > 0 && (
                        <div 
                          style={{
                            fontSize: '0.64rem',
                            padding: '1px 6px',
                            borderRadius: '3px',
                            background: 'rgba(0, 243, 255, 0.12)',
                            color: 'var(--accent-cyan)',
                            border: '1px solid rgba(0, 243, 255, 0.25)',
                            fontWeight: 800,
                            letterSpacing: '0.04em',
                            fontFamily: 'var(--font-sans)'
                          }}
                        >
                          得分: {card.lastGrillScore}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div 
                    style={{ 
                      fontSize: '1.3rem', 
                      color: badgeStyle.color,
                      opacity: 0.8,
                      filter: `drop-shadow(0 0 4px ${badgeStyle.color}40)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '2px'
                    }}
                  >
                    {getCategoryIcon(card.category)}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <span 
                      style={{ 
                        fontSize: '0.8rem', 
                        fontWeight: 700, 
                        color: status.themeColor, 
                        fontFamily: 'var(--font-mono)',
                        textShadow: `0 0 6px ${status.themeColor}50`
                      }}
                    >
                      {card.score}%
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '5px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '2.5px', overflow: 'hidden' }}>
                    <div 
                      ref={el => { barRefs.current[index] = el; }}
                      style={{ 
                        height: '100%', 
                        width: '0%', 
                        background: `linear-gradient(90deg, ${status.themeColor}, #0070f3)`,
                        borderRadius: '2.5px',
                        boxShadow: `0 0 6px ${status.themeColor}60`
                      }}
                    />
                  </div>
                </div>

                {/* Sliding Obsidian open deep link indicator badge */}
                <div 
                  className="obsidian-link-badge"
                  style={{
                    position: 'absolute',
                    bottom: '0.8rem',
                    right: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    color: 'rgba(181, 55, 242, 0.95)',
                    background: 'rgba(181, 55, 242, 0.08)',
                    border: '1px solid rgba(181, 55, 242, 0.25)',
                    padding: '1.5px 5px',
                    borderRadius: '4px',
                    opacity: 0,
                    transform: 'translateX(6px)',
                    pointerEvents: 'none',
                    letterSpacing: '0.04em'
                  }}
                >
                  <span>OPEN</span>
                  <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
