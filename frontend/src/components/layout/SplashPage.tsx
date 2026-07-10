import { useState, useEffect } from 'react';

interface SplashPageProps {
  onEnter: () => void;
}

export default function SplashPage({ onEnter }: SplashPageProps) {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [hudCoord, setHudCoord] = useState({ x: '50%', y: '50%' });
  const [hudActive, setHudActive] = useState(false);
  const [hudNodeName, setHudNodeName] = useState('NODE_CORE_01');
  const [hudStatus, setHudStatus] = useState('ACTIVE');
  const [pingTime, setPingTime] = useState(2);

  // Generate dynamic telemetry values for HUD
  useEffect(() => {
    const interval = setInterval(() => {
      setPingTime(Math.floor(Math.random() * 3) + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleNodeHover = (nodeName: string, status: string, x: string, y: string) => {
    setHudNodeName(nodeName);
    setHudStatus(status);
    setHudCoord({ x, y });
    setHudActive(true);
  };

  const handleEnter = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onEnter();
    }, 850);
  };

  return (
    <div
      className={`tg-splash-container ${isFadingOut ? 'fade-out' : ''}`}
      style={{
        fontFamily: "'Fira Sans', system-ui, -apple-system, sans-serif"
      }}
    >
      {/* ─── SCIFI STYLES (No compile dependencies) ─── */}
      <style>{`
        .tg-splash-container {
          position: fixed;
          inset: 0;
          z-index: 99999;
          background-color: #030712;
          background-image: 
            radial-gradient(circle at 65% 35%, rgba(6, 182, 212, 0.12) 0%, transparent 60%),
            radial-gradient(circle at 25% 75%, rgba(139, 92, 246, 0.08) 0%, transparent 50%),
            linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 100% 100%, 100% 100%, 40px 40px, 40px 40px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
          transition: all 850ms cubic-bezier(0.4, 0, 0.2, 1);
          color: #f8fafc;
        }

        .tg-splash-container.fade-out {
          opacity: 0;
          transform: scale(1.04);
          pointer-events: none;
        }

        /* ─── Navigation ─── */
        .tg-splash-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 64px;
          background: rgba(3, 7, 18, 0.4);
          backdrop-filter: blur(8px);
          border-b: 1px solid rgba(255, 255, 255, 0.05);
          z-index: 10;
        }

        @media (max-width: 768px) {
          .tg-splash-header {
            padding: 16px 24px;
          }
        }

        .logo-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 16px rgba(6, 182, 212, 0.4);
          font-family: 'Fira Code', monospace;
          font-weight: 700;
          font-size: 13px;
          color: #030712;
        }

        .logo-text {
          font-family: 'Fira Code', monospace;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 32px;
          font-family: 'Fira Code', monospace;
          font-size: 11px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #94a3b8;
        }

        .nav-link {
          text-decoration: none;
          color: inherit;
          transition: color 200ms ease;
        }

        /* ─── Main Hero Layout ─── */
        .tg-splash-main {
          flex: 1;
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          align-items: center;
          padding: 0 64px;
          max-width: 1300px;
          width: 100%;
          margin: 0 auto;
          gap: 48px;
          z-index: 5;
        }

        @media (max-width: 1024px) {
          .tg-splash-main {
            grid-template-columns: 1fr;
            padding: 40px 24px;
            gap: 32px;
            text-align: center;
          }
        }

        .hero-left {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        @media (max-width: 1024px) {
          .hero-left {
            align-items: center;
          }
        }

        /* ─── UI Badges & Typography ─── */
        .amd-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          border-radius: 9999px;
          border: 1px solid rgba(6, 182, 212, 0.25);
          background: rgba(6, 182, 212, 0.05);
          backdrop-filter: blur(8px);
          width: fit-content;
          margin-bottom: 24px;
        }

        .amd-badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #06b6d4;
          box-shadow: 0 0 8px #06b6d4;
          animation: pulse-dot 1.5s ease-in-out infinite;
        }

        .amd-badge-text {
          font-family: 'Fira Code', monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #22d3ee;
        }

        .hero-title {
          font-size: 54px;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -1.5px;
          margin-bottom: 20px;
        }

        @media (max-width: 640px) {
          .hero-title {
            font-size: 40px;
          }
        }

        .gradient-txt {
          background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #a855f7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-desc {
          font-size: 15px;
          color: #94a3b8;
          line-height: 1.6;
          max-width: 520px;
          margin-bottom: 36px;
        }

        /* ─── Feature Tag grid ─── */
        .spec-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 40px;
        }

        .spec-tag {
          font-family: 'Fira Code', monospace;
          font-size: 10px;
          padding: 6px 12px;
          border-radius: 6px;
          background: rgba(30, 41, 59, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.05);
          color: #cbd5e1;
        }

        .spec-tag-accent {
          border-color: rgba(168, 85, 247, 0.25);
          color: #d8b4fe;
        }

        /* ─── Buttons ─── */
        .btn-group {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .btn-action {
          font-family: 'Fira Code', monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          padding: 14px 28px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 250ms ease;
          border: none;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-enter {
          background: linear-gradient(90deg, #06b6d4 0%, #3b82f6 100%);
          color: #030712;
          box-shadow: 0 0 24px rgba(6, 182, 212, 0.25);
          border: 1px solid rgba(6, 182, 212, 0.4);
        }

        .btn-enter:hover {
          box-shadow: 0 0 32px rgba(6, 182, 212, 0.45);
          transform: translateY(-2px);
        }

        .btn-docs {
          background: rgba(255, 255, 255, 0.03);
          color: #f8fafc;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .btn-docs:hover {
          border-color: rgba(6, 182, 212, 0.3);
          background: rgba(6, 182, 212, 0.05);
          transform: translateY(-2px);
        }

        /* ─── Right Graphics Side ─── */
        .hero-right {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 520px;
        }

        @media (max-width: 1024px) {
          .hero-right {
            height: 380px;
          }
        }

        .glow-aura {
          position: absolute;
          width: 320px;
          height: 320px;
          background: radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 70%);
          filter: blur(20px);
          pointer-events: none;
          z-index: 1;
        }

        /* Orbiting Rings */
        .orbit-ring-1 {
          position: absolute;
          width: 350px;
          height: 350px;
          border: 1px dashed rgba(6, 182, 212, 0.25);
          border-radius: 50%;
          transform: rotateX(72deg) rotateY(-18deg);
          animation: spin 30s linear infinite;
          pointer-events: none;
          z-index: 2;
        }

        .orbit-ring-2 {
          position: absolute;
          width: 390px;
          height: 390px;
          border: 1px double rgba(168, 85, 247, 0.15);
          border-radius: 50%;
          transform: rotateX(68deg) rotateY(12deg);
          animation: spin-reverse 40s linear infinite;
          pointer-events: none;
          z-index: 2;
        }

        /* ─── Globe ─── */
        .hologram-globe {
          position: absolute;
          width: 250px;
          height: 250px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: float 6s ease-in-out infinite;
          z-index: 3;
        }

        @media (max-width: 1024px) {
          .hologram-globe {
            width: 200px;
            height: 200px;
          }
        }

        .hologram-globe svg {
          width: 100%;
          height: 100%;
          color: rgba(6, 182, 212, 0.55);
          filter: drop-shadow(0 0 16px rgba(6,182,212,0.45));
          animation: spin-slow 25s linear infinite;
        }

        .interactive-node {
          cursor: pointer;
          transition: fill 200ms, r 200ms;
        }

        .interactive-node:hover {
          fill: #22d3ee;
          r: 3.5;
        }

        /* ─── Floating HUD Telemetry HUD ─── */
        .hud-panel {
          position: absolute;
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 8px;
          padding: 12px;
          width: 160px;
          backdrop-filter: blur(8px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          z-index: 10;
          font-family: 'Fira Code', monospace;
          font-size: 9px;
          color: #94a3b8;
          pointer-events: none;
          transform: translate(-50%, -100%) translateY(-20px);
          transition: opacity 250ms ease, transform 250ms ease;
        }

        .hud-title {
          font-weight: 700;
          color: #06b6d4;
          border-b: 1px solid rgba(6, 182, 212, 0.2);
          padding-bottom: 4px;
          margin-bottom: 6px;
        }

        .hud-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
        }

        .hud-item-val {
          color: #f8fafc;
          font-weight: 600;
        }

        /* ─── Hand ─── */
        .cyber-hand {
          position: absolute;
          bottom: 2%;
          width: 320px;
          height: 180px;
          pointer-events: none;
          animation: hand-breath 4s ease-in-out infinite;
          z-index: 2;
        }

        @media (max-width: 1024px) {
          .cyber-hand {
            width: 260px;
            height: 140px;
            bottom: 5%;
          }
        }

        .cyber-hand svg {
          width: 100%;
          height: 100%;
          color: rgba(59, 130, 246, 0.3);
          filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.4));
        }

        /* ─── Architectural Walkthrough Overlay Modal ─── */
        .walkthrough-overlay {
          position: fixed;
          inset: 0;
          background: rgba(2, 4, 10, 0.85);
          backdrop-filter: blur(16px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 100000;
          padding: 24px;
          animation: fade-in-modal 300ms ease forwards;
        }

        .walkthrough-modal {
          background: rgba(15, 23, 42, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          width: 100%;
          max-width: 760px;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
          padding: 40px;
          position: relative;
          color: #f8fafc;
          animation: scale-in-modal 300ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        @media (max-width: 640px) {
          .walkthrough-modal {
            padding: 24px;
          }
        }

        .modal-close-btn {
          position: absolute;
          top: 24px;
          right: 24px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #cbd5e1;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-family: monospace;
          font-weight: bold;
          font-size: 14px;
          transition: all 200ms ease;
        }

        .modal-close-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          border-color: rgba(239, 68, 68, 0.4);
          color: #fca5a5;
        }

        .modal-title {
          font-size: 24px;
          font-weight: 700;
          color: #f8fafc;
          margin-bottom: 8px;
          border-left: 4px solid #06b6d4;
          padding-left: 12px;
        }

        .modal-subtitle {
          font-size: 12px;
          font-family: 'Fira Code', monospace;
          color: #06b6d4;
          margin-bottom: 32px;
          padding-left: 16px;
        }

        .modal-section {
          margin-bottom: 28px;
        }

        .modal-section-title {
          font-size: 16px;
          font-weight: 600;
          color: #e2e8f0;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .modal-section-title span {
          color: #06b6d4;
          font-family: 'Fira Code', monospace;
          font-size: 14px;
        }

        .modal-body-txt {
          font-size: 13.5px;
          color: #94a3b8;
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .modal-list {
          list-style: none;
          padding-left: 8px;
          margin-bottom: 16px;
        }

        .modal-list-item {
          font-size: 13px;
          color: #cbd5e1;
          margin-bottom: 8px;
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }

        .modal-list-item::before {
          content: '▪';
          color: #06b6d4;
          font-size: 10px;
          margin-top: 2px;
        }

        .modal-footer {
          margin-top: 36px;
          padding-top: 20px;
          border-t: 1px solid rgba(255,255,255,0.05);
          font-size: 11px;
          font-family: 'Fira Code', monospace;
          color: #64748b;
          text-align: center;
        }

        /* ─── Footer ─── */
        .tg-splash-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 64px;
          border-t: 1px solid rgba(255, 255, 255, 0.05);
          background: rgba(3, 7, 18, 0.2);
          font-family: 'Fira Code', monospace;
          font-size: 10px;
          letter-spacing: 1px;
          color: #475569;
          z-index: 10;
        }

        @media (max-width: 768px) {
          .tg-splash-footer {
            flex-direction: column;
            gap: 12px;
            padding: 16px;
            text-align: center;
          }
        }

        /* Modal Keyframes */
        @keyframes fade-in-modal {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scale-in-modal {
          from { transform: scale(0.95) translateY(10px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }

        /* ─── General Animations ─── */
        @keyframes pulse-dot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.6; }
        }
        @keyframes float-particle {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          15% { opacity: 0.7; }
          85% { opacity: 0.7; }
          100% { transform: translateY(-100px) scale(0.6); opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(1.5deg); }
        }
        @keyframes hand-breath {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(4px) scale(0.98); }
        }
        @keyframes spin {
          from { transform: rotateX(72deg) rotateY(-18deg) rotateZ(0deg); }
          to { transform: rotateX(72deg) rotateY(-18deg) rotateZ(360deg); }
        }
        @keyframes spin-reverse {
          from { transform: rotateX(68deg) rotateY(12deg) rotateZ(360deg); }
          to { transform: rotateX(68deg) rotateY(12deg) rotateZ(0deg); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* ─── Floating Particle Grid ─── */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-cyan-400"
            style={{
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              top: `${Math.random() * 80 + 10}%`,
              left: `${Math.random() * 80 + 10}%`,
              opacity: Math.random() * 0.6 + 0.3,
              animation: `float-particle ${6 + Math.random() * 8}s linear infinite`,
              animationDelay: `${Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* ─── Navigation Header ─── */}
      <header className="tg-splash-header">
        <div className="logo-group">
          <div className="logo-icon">TG</div>
          <span className="logo-text">
            TeleGenesis <span style={{ color: '#06b6d4' }}>OS</span>
          </span>
        </div>

        <nav className="nav-links">
          <span className="nav-link">Control Center v1.1</span>
          <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
          <span className="nav-link" style={{ color: '#06b6d4' }}>AMD Instinct Node</span>
        </nav>
      </header>

      {/* ─── Main Columns ─── */}
      <main className="tg-splash-main">
        {/* Left Side: Brand Value pitch */}
        <div className="hero-left">
          <div className="amd-badge">
            <span className="amd-badge-dot" />
            <span className="amd-badge-text">AMD Instinct™ MI300X Optimized</span>
          </div>

          <h1 className="hero-title">
            Cognitive AI-Powered <br />
            <span className="gradient-txt">Network Control</span>
          </h1>

          <p className="hero-desc">
            A comprehensive, vendor-neutral telecom management platform built to accelerate network diagnostics, correlation, and simulations. Real-time telemetry paired with zero-lag multi-agent pipelines.
          </p>

          <div className="spec-grid">
            <span className="spec-tag">ROCm™ v6.1</span>
            <span className="spec-tag">Multi-Agent Consensus</span>
            <span className="spec-tag">Digital Twin</span>
            <span className="spec-tag spec-tag-accent">Fireworks AI Gateway</span>
          </div>

          <div className="btn-group">
            <button className="btn-action btn-enter" onClick={handleEnter}>
              ENTER PLATFORM <span>&rarr;</span>
            </button>
            <button 
              onClick={() => setShowDocs(true)} 
              className="btn-action btn-docs"
            >
              WALKTHROUGH DOCS
            </button>
          </div>
        </div>

        {/* Right Side: Scientific Globe Animation with dynamic HUD feedback */}
        <div className="hero-right">
          <div className="glow-aura" />
          <div className="orbit-ring-1" />
          <div className="orbit-ring-2" />

          {/* Interactive Floating Globe */}
          <div className="hologram-globe">
            <svg viewBox="0 0 100 100">
              {/* Outer shell */}
              <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.4" strokeDasharray="3 3" opacity="0.25" />
              
              {/* Latitudes */}
              <ellipse cx="50" cy="50" rx="48" ry="12" fill="none" stroke="currentColor" strokeWidth="0.4" />
              <ellipse cx="50" cy="50" rx="48" ry="28" fill="none" stroke="currentColor" strokeWidth="0.4" />
              <line x1="2" y1="50" x2="98" y2="50" stroke="currentColor" strokeWidth="0.4" />

              {/* Longitudes */}
              <ellipse cx="50" cy="50" rx="12" ry="48" fill="none" stroke="currentColor" strokeWidth="0.4" />
              <ellipse cx="50" cy="50" rx="28" ry="48" fill="none" stroke="currentColor" strokeWidth="0.4" />
              <line x1="50" y1="2" x2="50" y2="98" stroke="currentColor" strokeWidth="0.4" />

              {/* Hologram Nodes with dynamic hover states */}
              <circle 
                className="interactive-node" cx="28" cy="38" r="2.5" fill="#06b6d4" 
                onMouseEnter={() => handleNodeHover('NODE_NORTH_CORE', 'HEALTHY', '28%', '38%')}
                onMouseLeave={() => setHudActive(false)}
              />
              <circle 
                className="interactive-node" cx="72" cy="38" r="2.5" fill="#3b82f6" 
                onMouseEnter={() => handleNodeHover('NODE_SOUTH_AGG', 'HEALTHY', '72%', '38%')}
                onMouseLeave={() => setHudActive(false)}
              />
              <circle 
                className="interactive-node" cx="50" cy="22" r="2.5" fill="#818cf8" 
                onMouseEnter={() => handleNodeHover('NODE_EAST_DC', 'ACTIVE', '50%', '22%')}
                onMouseLeave={() => setHudActive(false)}
              />
              <circle 
                className="interactive-node" cx="34" cy="62" r="2.5" fill="#a855f7" 
                onMouseEnter={() => handleNodeHover('NODE_WEST_BORDER', 'HEALTHY', '34%', '62%')}
                onMouseLeave={() => setHudActive(false)}
              />
              <circle 
                className="interactive-node" cx="66" cy="62" r="2.5" fill="#ef4444" 
                onMouseEnter={() => handleNodeHover('NODE_CORE_GATEWAY', 'ALERT', '66%', '62%')}
                onMouseLeave={() => setHudActive(false)}
              />
              
              {/* Mesh connectors */}
              <line x1="28" y1="38" x2="50" y2="22" stroke="#06b6d4" strokeWidth="0.3" strokeDasharray="1 1" />
              <line x1="72" y1="38" x2="50" y2="22" stroke="#3b82f6" strokeWidth="0.3" strokeDasharray="1 1" />
              <line x1="34" y1="62" x2="50" y2="50" stroke="#818cf8" strokeWidth="0.3" />
              <line x1="66" y1="62" x2="50" y2="50" stroke="#ef4444" strokeWidth="0.3" />
              <line x1="28" y1="38" x2="34" y2="62" stroke="#a855f7" strokeWidth="0.3" strokeDasharray="1 1" />
            </svg>
          </div>

          {/* Interactive Floating HUD panel */}
          <div 
            className="hud-panel" 
            style={{ 
              opacity: hudActive ? 1 : 0, 
              left: hudCoord.x, 
              top: hudCoord.y 
            }}
          >
            <div className="hud-title">{hudNodeName}</div>
            <div className="hud-item">
              <span>STATUS:</span>
              <span className="hud-item-val" style={{ color: hudStatus === 'ALERT' ? '#ef4444' : '#22c55e' }}>
                {hudStatus}
              </span>
            </div>
            <div className="hud-item">
              <span>PING:</span>
              <span className="hud-item-val">{pingTime}ms</span>
            </div>
            <div className="hud-item">
              <span>LOSS:</span>
              <span className="hud-item-val">{hudStatus === 'ALERT' ? '0.12%' : '0.00%'}</span>
            </div>
          </div>

          {/* Cybernetic Wireframe Hand */}
          <div className="cyber-hand">
            <svg viewBox="0 0 200 120">
              {/* Wrist & Palm mesh grids */}
              <path d="M 60 120 L 140 120 L 150 90 L 50 90 Z" fill="none" stroke="currentColor" strokeWidth="0.6" />
              <path d="M 50 90 L 150 90 L 165 55 L 35 55 Z" fill="none" stroke="currentColor" strokeWidth="0.6" />
              
              {/* Wrist joints */}
              <line x1="60" y1="120" x2="50" y2="90" stroke="currentColor" strokeWidth="0.4" />
              <line x1="80" y1="120" x2="75" y2="90" stroke="currentColor" strokeWidth="0.4" />
              <line x1="100" y1="120" x2="100" y2="90" stroke="currentColor" strokeWidth="0.4" />
              <line x1="120" y1="120" x2="125" y2="90" stroke="currentColor" strokeWidth="0.4" />
              <line x1="140" y1="120" x2="150" y2="90" stroke="currentColor" strokeWidth="0.4" />

              {/* Palm lattices */}
              <line x1="50" y1="90" x2="35" y2="55" stroke="currentColor" strokeWidth="0.4" />
              <line x1="75" y1="90" x2="70" y2="55" stroke="currentColor" strokeWidth="0.4" />
              <line x1="100" y1="90" x2="100" y2="55" stroke="currentColor" strokeWidth="0.4" />
              <line x1="125" y1="90" x2="130" y2="55" stroke="currentColor" strokeWidth="0.4" />
              <line x1="150" y1="90" x2="165" y2="55" stroke="currentColor" strokeWidth="0.4" />

              {/* Cyber fingers wireframes */}
              <path d="M 35 55 L 20 40 L 15 28 L 22 25 L 38 42 Z" fill="none" stroke="currentColor" strokeWidth="0.6" />
              <path d="M 45 55 L 45 25 L 47 10 L 53 10 L 55 25 L 55 55" fill="none" stroke="currentColor" strokeWidth="0.6" />
              <path d="M 75 55 L 77 20 L 79 5 L 87 5 L 89 20 L 85 55" fill="none" stroke="currentColor" strokeWidth="0.6" />
              <path d="M 115 55 L 113 22 L 115 8 L 123 8 L 125 22 L 125 55" fill="none" stroke="currentColor" strokeWidth="0.6" />
              <path d="M 145 55 L 149 32 L 153 20 L 159 20 L 161 32 L 155 55" fill="none" stroke="currentColor" strokeWidth="0.6" />

              {/* Node tip points */}
              <circle cx="17" cy="26" r="2" fill="#06b6d4" />
              <circle cx="50" cy="9" r="2" fill="#06b6d4" />
              <circle cx="83" cy="4" r="2" fill="#06b6d4" />
              <circle cx="119" cy="7" r="2" fill="#06b6d4" />
              <circle cx="156" cy="19" r="2" fill="#06b6d4" />
            </svg>
          </div>
        </div>
      </main>

      {/* ─── Architectural Walkthrough Overlay Modal ─── */}
      {showDocs && (
        <div className="walkthrough-overlay" onClick={() => setShowDocs(false)}>
          <div className="walkthrough-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowDocs(false)}>×</button>
            
            <h2 className="modal-title">TeleGenesis OS</h2>
            <div className="modal-subtitle">Platform Architecture &amp; AMD Acceleration Guide</div>

            <div className="modal-section">
              <h3 className="modal-section-title">
                <span>[01]</span> System Design &amp; Data Synchronization
              </h3>
              <p className="modal-body-txt">
                TeleGenesis OS utilizes a decoupled, three-tier architecture that guarantees complete network status synchronization across the system:
              </p>
              <ul className="modal-list">
                <li className="modal-list-item">
                  <strong>Pluggable Connector Layer:</strong> Standardizes data structures for physical alarms, configurations, logs, and network telemetry.
                </li>
                <li className="modal-list-item">
                  <strong>Atomic Telemetry Cache:</strong> Maintains a 15-second snapshot of all node metrics, ensuring that the Executive Dashboard and AI Operations Center show identical network states.
                </li>
              </ul>
            </div>

            <div className="modal-section">
              <h3 className="modal-section-title">
                <span>[02]</span> Parallel Agent Investigation
              </h3>
              <p className="modal-body-txt">
                When a critical link or hardware incident is triggered, the system dispatches <strong>15 specialized domain agents</strong> concurrently to isolate the incident's root cause:
              </p>
              <ul className="modal-list">
                <li className="modal-list-item">
                  <strong>Performance &amp; Logs:</strong> Isolates latency spikes, throughput degradation, and router OSPF adjacency error signatures.
                </li>
                <li className="modal-list-item">
                  <strong>Consensus &amp; Reporting:</strong> Compares conflicting domain reports, determines the correct root cause, and generates structured markdown RCA reports.
                </li>
              </ul>
            </div>

            <div className="modal-section">
              <h3 className="modal-section-title">
                <span>[03]</span> AMD Instinct™ MI300X Acceleration
              </h3>
              <p className="modal-body-txt">
                Running 15 AI agent investigations in parallel requires high-performance, massive bandwidth hardware resources:
              </p>
              <ul className="modal-list">
                <li className="modal-list-item">
                  <strong>Fireworks AI Catalog:</strong> Routes all agent queries to Fireworks AI, running on clusters optimized with <strong>AMD Instinct™ MI300X accelerators</strong> and the <strong>AMD ROCm™</strong> stack.
                </li>
                <li className="modal-list-item">
                  <strong>High Throughput:</strong> Harnesses 192GB HBM3 memory and 5.3 TB/s bandwidth to run all 15 agent prompts concurrently without queue lag or API latency.
                </li>
              </ul>
            </div>

            <div className="modal-footer">
              END OF DOCUMENT // TeleGenesis OS Team
            </div>
          </div>
        </div>
      )}

      {/* ─── Footer Status ─── */}
      <footer className="tg-splash-footer">
        <div>SYS_STATUS // SECURE_ONLINE</div>
        <div>ACCELERATED BY AMD INSTINCT™ MI300X &amp; ROCm™</div>
      </footer>
    </div>
  );
}
