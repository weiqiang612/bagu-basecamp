'use client';

interface HeaderProps {
  onSync?: () => void;
  isSyncing?: boolean;
}

export default function Header({ onSync, isSyncing = false }: HeaderProps) {
  return (
    <div 
      className="glass-panel reveal-init" 
      style={{ 
        padding: '0 1.5rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'rgba(10, 18, 36, 0.7)',
        borderColor: 'rgba(0, 243, 255, 0.25)',
        boxShadow: '0 0 15px rgba(0, 243, 255, 0.12)',
        height: '80px', // Explicit height to match OverallProgress Card on the right
        margin: 0
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes header-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .sync-btn:hover {
          background: rgba(0, 243, 255, 0.08) !important;
          border-color: rgba(0, 243, 255, 0.45) !important;
          box-shadow: 0 0 10px rgba(0, 243, 255, 0.2);
        }
      `}} />

      <h1 
        style={{ 
          fontSize: '1.8rem', // Larger, bolder title for grander vibe
          fontWeight: 800, 
          letterSpacing: '0.12em', 
          margin: 0,
          fontFamily: 'var(--font-header)',
          textShadow: '0 0 12px var(--accent-cyan-glow)'
        }}
      >
        <span className="neon-gradient-text">BAGU PREP MASTERY</span>
      </h1>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Sync Button */}
        <button
          onClick={onSync}
          disabled={isSyncing}
          className="sync-btn"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(0, 243, 255, 0.15)',
            borderRadius: '4px',
            color: isSyncing ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            padding: '0.45rem 0.85rem',
            fontSize: '0.72rem',
            fontWeight: 700,
            cursor: isSyncing ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            transition: 'all 0.3s ease',
            letterSpacing: '0.05em',
            outline: 'none',
            opacity: isSyncing ? 0.7 : 1
          }}
          title="同步 NotebookLM 知识源"
        >
          <svg 
            viewBox="0 0 24 24" 
            width="13" 
            height="13" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            style={{ 
              animation: isSyncing ? 'header-spin 1.2s linear infinite' : 'none' 
            }}
          >
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
          {isSyncing ? 'SYNCING...' : 'SYNC NOTEBOOKLM'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.05em' }}>ETHAN CHEN</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>@geekdev</div>
          </div>
          <div 
            style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              color: '#060913',
              border: '2px solid rgba(255,255,255,0.2)'
            }}
          >
            EC
          </div>
        </div>
      </div>
    </div>
  );
}
