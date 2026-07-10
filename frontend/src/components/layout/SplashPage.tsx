import { useState, useEffect } from 'react';

interface SplashPageProps {
  onEnter: () => void;
}

export default function SplashPage({ onEnter }: SplashPageProps) {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'architecture' | 'agents' | 'amd'>('architecture');
  const [systemLogs, setSystemLogs] = useState<string[]>([]);
  const [hudData, setHudData] = useState({
    latency: '1.8 ms',
    loss: '0.00%',
    jitter: '0.2 ms',
    throughput: '942.8 Gbps'
  });

  // Simulated real-time server telemetry log feed
  useEffect(() => {
    const logPool = [
      "SYS: Sync with telemetry cache complete",
      "API: Dispatching Fireworks interface calls",
      "ROCm: Instinct MI300X temperature 44°C",
      "NET: OSPF neighbor state full",
      "AGENT: Consensus engine standby",
      "CONN: Nokia OSS stream healthy",
      "CONN: Prometheus polling active"
    ];
    setSystemLogs([
      "SYS: Boot complete",
      "ROCm: Loading ROCm stack v6.1",
      "CONN: Mock connector initialized"
    ]);

    const interval = setInterval(() => {
      // Add a log
      const newLog = logPool[Math.floor(Math.random() * logPool.length)];
      setSystemLogs(prev => [...prev.slice(-3), `[${new Date().toLocaleTimeString()}] ${newLog}`]);

      // Shift telemetry slightly
      setHudData({
        latency: `${(1.5 + Math.random() * 0.6).toFixed(1)} ms`,
        loss: Math.random() > 0.95 ? '0.01%' : '0.00%',
        jitter: `${(0.1 + Math.random() * 0.3).toFixed(1)} ms`,
        throughput: `${(940 + Math.random() * 8).toFixed(1)} Gbps`
      });
    }, 2800);

    return () => clearInterval(interval);
  }, []);

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
        /* ─── Global Reset & Layout ─── */
        .tg-splash-container {
          position: fixed;
          inset: 0;
          z-index: 99999;
          background-color: #05070f;
          background-image: 
            radial-gradient(circle at 75% 30%, rgba(6, 182, 212, 0.08) 0%, transparent 60%),
            radial-gradient(circle at 25% 75%, rgba(139, 92, 246, 0.06) 0%, transparent 55%),
            linear-gradient(to right, rgba(148, 163, 184, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(148, 163, 184, 0.03) 1px, transparent 1px);
          background-size: 100% 100%, 100% 100%, 50px 50px, 50px 50px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
          transition: all 850ms cubic-bezier(0.4, 0, 0.2, 1);
          color: #f8fafc;
        }

        .tg-splash-container.fade-out {
          opacity: 0;
          transform: scale(1.03);
          pointer-events: none;
        }

        /* ─── Header ─── */
        .tg-splash-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 48px;
          background: rgba(5, 7, 15, 0.6);
          backdrop-filter: blur(12px);
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
          width: 30px;
          height: 30px;
          border-radius: 6px;
          background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 16px rgba(6, 182, 212, 0.35);
          font-family: 'Fira Code', monospace;
          font-weight: 700;
          font-size: 12px;
          color: #05070f;
        }

        .logo-text {
          font-family: 'Fira Code', monospace;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        .header-status {
          display: flex;
          align-items: center;
          gap: 20px;
          font-family: 'Fira Code', monospace;
          font-size: 10px;
          color: #64748b;
        }

        .status-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 4px;
          background: rgba(34, 197, 94, 0.08);
          border: 1px solid rgba(34, 197, 94, 0.2);
          color: #4ade80;
        }

        /* ─── Hero Container ─── */
        .tg-splash-main {
          flex: 1;
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          align-items: center;
          padding: 0 48px;
          max-width: 1400px;
          width: 100%;
          margin: 0 auto;
          gap: 64px;
          z-index: 5;
        }

        @media (max-width: 1024px) {
          .tg-splash-main {
            grid-template-columns: 1fr;
            padding: 40px 24px;
            gap: 40px;
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

        .amd-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 5px 12px;
          border-radius: 4px;
          border: 1px solid rgba(6, 182, 212, 0.2);
          background: rgba(6, 182, 212, 0.04);
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
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #22d3ee;
        }

        .hero-title {
          font-size: 58px;
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -2px;
          margin-bottom: 24px;
        }

        @media (max-width: 640px) {
          .hero-title {
            font-size: 42px;
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
          line-height: 1.65;
          max-width: 540px;
          margin-bottom: 36px;
        }

        /* ─── Tech Console HUD (Left side spec card) ─── */
        .tech-console {
          background: rgba(15, 23, 42, 0.45);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 16px 20px;
          width: 100%;
          max-width: 500px;
          margin-bottom: 36px;
          text-align: left;
        }

        .console-header {
          display: flex;
          justify-content: space-between;
          font-family: 'Fira Code', monospace;
          font-size: 10px;
          color: #64748b;
          margin-bottom: 10px;
          border-b: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 6px;
        }

        .console-log-row {
          font-family: 'Fira Code', monospace;
          font-size: 10px;
          color: #94a3b8;
          line-height: 1.6;
          margin-bottom: 2px;
        }

        .console-log-accent {
          color: #06b6d4;
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
          border-radius: 4px;
          cursor: pointer;
          transition: all 250ms ease;
          border: none;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-enter {
          background: linear-gradient(90deg, #06b6d4 0%, #3b82f6 100%);
          color: #05070f;
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
          width: 340px;
          height: 340px;
          background: radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, transparent 70%);
          filter: blur(20px);
          pointer-events: none;
          z-index: 1;
        }

        .orbit-ring-1 {
          position: absolute;
          width: 340px;
          height: 340px;
          border: 1px dashed rgba(6, 182, 212, 0.2);
          border-radius: 50%;
          transform: rotateX(72deg) rotateY(-18deg);
          animation: spin 30s linear infinite;
          pointer-events: none;
          z-index: 2;
        }

        .orbit-ring-2 {
          position: absolute;
          width: 380px;
          height: 380px;
          border: 1px double rgba(168, 85, 247, 0.12);
          border-radius: 50%;
          transform: rotateX(68deg) rotateY(12deg);
          animation: spin-reverse 40s linear infinite;
          pointer-events: none;
          z-index: 2;
        }

        /* ─── Globe ─── */
        .hologram-globe {
          position: absolute;
          width: 240px;
          height: 240px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: float 6s ease-in-out infinite;
          z-index: 3;
        }

        .hologram-globe svg {
          width: 100%;
          height: 100%;
          color: rgba(6, 182, 212, 0.5);
          filter: drop-shadow(0 0 16px rgba(6,182,212,0.4));
          animation: spin-slow 28s linear infinite;
        }

        /* ─── Live Telemetry Panel (Right side floating HUD) ─── */
        .hud-telemetry-panel {
          position: absolute;
          top: 15%;
          right: 5%;
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(6, 182, 212, 0.25);
          border-radius: 6px;
          padding: 12px 16px;
          width: 170px;
          backdrop-filter: blur(8px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          z-index: 10;
          font-family: 'Fira Code', monospace;
          font-size: 10px;
          color: #94a3b8;
          animation: float 5.5s ease-in-out infinite;
          animation-delay: 1s;
        }

        .hud-tel-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .hud-tel-row:last-child {
          margin-bottom: 0;
        }

        .hud-tel-val {
          color: #22d3ee;
          font-weight: 600;
        }

        /* ─── Cybernetic Hand ─── */
        .cyber-hand {
          position: absolute;
          bottom: 4%;
          width: 310px;
          height: 170px;
          pointer-events: none;
          animation: hand-breath 4s ease-in-out infinite;
          z-index: 2;
        }

        .cyber-hand svg {
          width: 100%;
          height: 100%;
          color: rgba(59, 130, 246, 0.25);
          filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.35));
        }

        /* ─── Detailed Technical Walkthrough Modal ─── */
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
        }

        .walkthrough-modal {
          background: #0b0f19;
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 8px;
          width: 100%;
          max-width: 900px;
          height: 80vh;
          box-shadow: 0 20px 50px rgba(0,0,0,0.6);
          display: flex;
          flex-direction: column;
          position: relative;
          color: #f8fafc;
          overflow: hidden;
        }

        .modal-header {
          padding: 24px 32px;
          border-b: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-title-group h2 {
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.5px;
          color: #f8fafc;
        }

        .modal-title-group p {
          font-family: 'Fira Code', monospace;
          font-size: 9px;
          color: #06b6d4;
          margin-top: 4px;
        }

        .modal-close-btn {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          width: 28px;
          height: 28px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-weight: bold;
          transition: all 200ms ease;
        }

        .modal-close-btn:hover {
          background: rgba(239, 68, 68, 0.15);
          border-color: rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }

        /* Paginated Layout inside Modal */
        .modal-tabs {
          display: flex;
          background: rgba(255, 255, 255, 0.02);
          border-b: 1px solid rgba(255, 255, 255, 0.05);
          padding: 0 32px;
        }

        .modal-tab {
          font-family: 'Fira Code', monospace;
          font-size: 10px;
          padding: 14px 20px;
          color: #64748b;
          cursor: pointer;
          border-b: 2px solid transparent;
          transition: all 200ms ease;
        }

        .modal-tab.active {
          color: #06b6d4;
          border-b-color: #06b6d4;
          background: rgba(6, 182, 212, 0.02);
        }

        .modal-content {
          flex: 1;
          overflow-y: auto;
          padding: 32px;
        }

        .content-section {
          margin-bottom: 32px;
        }

        .content-section h4 {
          font-size: 14px;
          font-weight: 700;
          color: #e2e8f0;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .content-section h4 span {
          color: #06b6d4;
          font-family: 'Fira Code', monospace;
          font-size: 12px;
        }

        .content-p {
          font-size: 13.5px;
          color: #94a3b8;
          line-height: 1.6;
          margin-bottom: 16px;
        }

        /* Tech Table styling */
        .tech-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 16px;
          font-size: 12px;
        }

        .tech-table th {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          color: #f8fafc;
          font-family: 'Fira Code', monospace;
          font-size: 10px;
          font-weight: 700;
          text-align: left;
          padding: 10px 14px;
        }

        .tech-table td {
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 10px 14px;
          color: #cbd5e1;
        }

        .tech-table tr:hover td {
          background: rgba(6, 182, 212, 0.02);
        }

        .modal-footer {
          padding: 16px 32px;
          border-t: 1px solid rgba(255, 255, 255, 0.05);
          font-family: 'Fira Code', monospace;
          font-size: 9px;
          color: #475569;
          display: flex;
          justify-content: space-between;
          background: rgba(255, 255, 255, 0.01);
        }

        /* ─── Footer ─── */
        .tg-splash-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 48px;
          border-t: 1px solid rgba(255, 255, 255, 0.05);
          background: rgba(5, 7, 15, 0.2);
          font-family: 'Fira Code', monospace;
          font-size: 9px;
          letter-spacing: 1.5px;
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

        /* Keyframes */
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
          50% { transform: translateY(-8px) rotate(1deg); }
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
              opacity: Math.random() * 0.5 + 0.2,
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

        <div className="header-status">
          <span>HOST: localhost:5173</span>
          <div className="status-pill">
            <span className="amd-badge-dot" style={{ backgroundColor: '#4ade80', boxShadow: '0 0 8px #4ade80' }}></span>
            <span>AMD Instinct Node Active</span>
          </div>
        </div>
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
            A high-performance, vendor-neutral telecom management platform built to accelerate network diagnostics, correlation, and simulations. Real-time telemetry paired with zero-lag multi-agent pipelines.
          </p>

          {/* Dynamic Telemetry Log Console (Premium Look) */}
          <div className="tech-console">
            <div className="console-header">
              <span>SYSTEM EVENT CONSOLE</span>
              <span>STATE: ACTIVE</span>
            </div>
            {systemLogs.map((log, index) => (
              <div key={index} className="console-log-row">
                <span className="console-log-accent">&gt;&gt;</span> {log}
              </div>
            ))}
            {systemLogs.length === 0 && (
              <div className="console-log-row">
                <span className="console-log-accent">&gt;&gt;</span> SYS: Listening for network events...
              </div>
            )}
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
              <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.4" strokeDasharray="3 3" opacity="0.25" />
              <ellipse cx="50" cy="50" rx="48" ry="12" fill="none" stroke="currentColor" strokeWidth="0.4" />
              <ellipse cx="50" cy="50" rx="48" ry="28" fill="none" stroke="currentColor" strokeWidth="0.4" />
              <line x1="2" y1="50" x2="98" y2="50" stroke="currentColor" strokeWidth="0.4" />
              <ellipse cx="50" cy="50" rx="12" ry="48" fill="none" stroke="currentColor" strokeWidth="0.4" />
              <ellipse cx="50" cy="50" rx="28" ry="48" fill="none" stroke="currentColor" strokeWidth="0.4" />
              <line x1="50" y1="2" x2="50" y2="98" stroke="currentColor" strokeWidth="0.4" />

              {/* Constellation Nodes */}
              <circle cx="28" cy="38" r="2.5" fill="#06b6d4" />
              <circle cx="72" cy="38" r="2.5" fill="#3b82f6" />
              <circle cx="50" cy="22" r="2.5" fill="#818cf8" />
              <circle cx="34" cy="62" r="2.5" fill="#a855f7" />
              <circle cx="66" cy="62" r="2.5" fill="#06b6d4" />
              
              {/* Lines */}
              <line x1="28" y1="38" x2="50" y2="22" stroke="#06b6d4" strokeWidth="0.3" strokeDasharray="1 1" />
              <line x1="72" y1="38" x2="50" y2="22" stroke="#3b82f6" strokeWidth="0.3" strokeDasharray="1 1" />
              <line x1="34" y1="62" x2="50" y2="50" stroke="#818cf8" strokeWidth="0.3" />
              <line x1="66" y1="62" x2="50" y2="50" stroke="#06b6d4" strokeWidth="0.3" />
            </svg>
          </div>

          {/* Floating Live Telemetry HUD */}
          <div className="hud-telemetry-panel">
            <div style={{ color: '#06b6d4', borderBottom: '1px solid rgba(6,182,212,0.15)', paddingBottom: '4px', marginBottom: '8px', fontWeight: 'bold' }}>
              TEL_METRICS
            </div>
            <div className="hud-tel-row">
              <span>LATENCY:</span>
              <span className="hud-tel-val">{hudData.latency}</span>
            </div>
            <div className="hud-tel-row">
              <span>PKT LOSS:</span>
              <span className="hud-tel-val">{hudData.loss}</span>
            </div>
            <div className="hud-tel-row">
              <span>JITTER:</span>
              <span className="hud-tel-val">{hudData.jitter}</span>
            </div>
            <div className="hud-tel-row">
              <span>CAPACITY:</span>
              <span className="hud-tel-val">{hudData.throughput}</span>
            </div>
          </div>

          {/* Cybernetic Wireframe Hand */}
          <div className="cyber-hand">
            <svg viewBox="0 0 200 120">
              <path d="M 60 120 L 140 120 L 150 90 L 50 90 Z" fill="none" stroke="currentColor" strokeWidth="0.6" />
              <path d="M 50 90 L 150 90 L 165 55 L 35 55 Z" fill="none" stroke="currentColor" strokeWidth="0.6" />
              
              <line x1="60" y1="120" x2="50" y2="90" stroke="currentColor" strokeWidth="0.4" />
              <line x1="80" y1="120" x2="75" y2="90" stroke="currentColor" strokeWidth="0.4" />
              <line x1="100" y1="120" x2="100" y2="90" stroke="currentColor" strokeWidth="0.4" />
              <line x1="120" y1="120" x2="125" y2="90" stroke="currentColor" strokeWidth="0.4" />
              <line x1="140" y1="120" x2="150" y2="90" stroke="currentColor" strokeWidth="0.4" />

              <line x1="50" y1="90" x2="35" y2="55" stroke="currentColor" strokeWidth="0.4" />
              <line x1="75" y1="90" x2="70" y2="55" stroke="currentColor" strokeWidth="0.4" />
              <line x1="100" y1="90" x2="100" y2="55" stroke="currentColor" strokeWidth="0.4" />
              <line x1="125" y1="90" x2="130" y2="55" stroke="currentColor" strokeWidth="0.4" />
              <line x1="150" y1="90" x2="165" y2="55" stroke="currentColor" strokeWidth="0.4" />

              <path d="M 35 55 L 20 40 L 15 28 L 22 25 L 38 42 Z" fill="none" stroke="currentColor" strokeWidth="0.6" />
              <path d="M 45 55 L 45 25 L 47 10 L 53 10 L 55 25 L 55 55" fill="none" stroke="currentColor" strokeWidth="0.6" />
              <path d="M 75 55 L 77 20 L 79 5 L 87 5 L 89 20 L 85 55" fill="none" stroke="currentColor" strokeWidth="0.6" />
              <path d="M 115 55 L 113 22 L 115 8 L 123 8 L 125 22 L 125 55" fill="none" stroke="currentColor" strokeWidth="0.6" />
              <path d="M 145 55 L 149 32 L 153 20 L 159 20 L 161 32 L 155 55" fill="none" stroke="currentColor" strokeWidth="0.6" />

              <circle cx="17" cy="26" r="2" fill="#06b6d4" />
              <circle cx="50" cy="9" r="2" fill="#06b6d4" />
              <circle cx="83" cy="4" r="2" fill="#06b6d4" />
              <circle cx="119" cy="7" r="2" fill="#06b6d4" />
              <circle cx="156" cy="19" r="2" fill="#06b6d4" />
            </svg>
          </div>
        </div>
      </main>

      {/* ─── Detailed Technical Walkthrough Modal ─── */}
      {showDocs && (
        <div className="walkthrough-overlay" onClick={() => setShowDocs(false)}>
          <div className="walkthrough-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <h2>TELETAC-OS WALKTHROUGH</h2>
                <p>PLATFORM ARCHITECTURE &amp; HARDWARE ACCELERATION SCHEMATIC</p>
              </div>
              <button className="modal-close-btn" onClick={() => setShowDocs(false)}>×</button>
            </div>

            <div className="modal-tabs">
              <div 
                className={`modal-tab ${selectedTab === 'architecture' ? 'active' : ''}`}
                onClick={() => setSelectedTab('architecture')}
              >
                01. ARCHITECTURE
              </div>
              <div 
                className={`modal-tab ${selectedTab === 'agents' ? 'active' : ''}`}
                onClick={() => setSelectedTab('agents')}
              >
                02. MULTI-AGENT PANEL
              </div>
              <div 
                className={`modal-tab ${selectedTab === 'amd' ? 'active' : ''}`}
                onClick={() => setSelectedTab('amd')}
              >
                03. AMD HARDWARE
              </div>
            </div>

            <div className="modal-content">
              {selectedTab === 'architecture' && (
                <div>
                  <div className="content-section">
                    <h4><span>//</span> PLUGGABLE TELEMETRY CONNECTOR</h4>
                    <p className="content-p">
                      TeleGenesis OS operates on a vendor-agnostic connector architecture. This separates live operational telemetry from the UI and AI agents:
                    </p>
                    <ul style={{ paddingLeft: '16px', color: '#94a3b8', fontSize: '13px', lineHeight: '1.6' }}>
                      <li style={{ marginBottom: '8px' }}>
                        <strong>BaseConnector:</strong> Defines unified abstract models for router interfaces, OSPF adjacency logs, topology configurations, and regional KPI feeds.
                      </li>
                      <li style={{ marginBottom: '8px' }}>
                        <strong>MockTelecomConnector:</strong> Simulates a realistic telecom topology consisting of 27 nodes and 30 active high-capacity fiber links.
                      </li>
                    </ul>
                  </div>

                  <div className="content-section">
                    <h4><span>//</span> DIURNAL AND CASCADING FAILURE MODELING</h4>
                    <p className="content-p">
                      The simulated data represents realistic network behaviors. Network traffic follows a strict diurnal cycle peaking at noon, and system failures propagate realistically (e.g. CRC error bursts cause OSPF session drop -> routing flaps -> downstream congestions).
                    </p>
                  </div>
                </div>
              )}

              {selectedTab === 'agents' && (
                <div>
                  <div className="content-section">
                    <h4><span>//</span> 15-AGENT PARALLEL DIAGNOSTIC PANEL</h4>
                    <p className="content-p">
                      When a critical network alert triggers, the TeleGenesis Agent Engine dispatches 15 specialized agents concurrently rather than using a single chatbot:
                    </p>

                    <table className="tech-table">
                      <thead>
                        <tr>
                          <th>PHASE</th>
                          <th>AGENT NAME</th>
                          <th>ROLE / OBJECTIVE</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Phase 1</td>
                          <td>Performance Agent</td>
                          <td>Scans physical KPIs, throughput rates, and packet loss trends.</td>
                        </tr>
                        <tr>
                          <td>Phase 2</td>
                          <td>Log Analysis Agent</td>
                          <td>Scans router CLI log streams for OSPF adjacency reset codes.</td>
                        </tr>
                        <tr>
                          <td>Phase 3</td>
                          <td>Security Agent</td>
                          <td>Evaluates for indicators of DDoS or unauthorized config modifications.</td>
                        </tr>
                        <tr>
                          <td>Phase 4</td>
                          <td>Consensus Agent</td>
                          <td>Correlates all individual findings, resolves discrepancy conflicts, and states RCA.</td>
                        </tr>
                        <tr>
                          <td>Phase 5</td>
                          <td>Reporting Agent</td>
                          <td>Compiles consensus conclusions into structured markdown audit reports.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {selectedTab === 'amd' && (
                <div>
                  <div className="content-section">
                    <h4><span>//</span> AMD INSTINCT™ MI300X GPU ACCELERATION</h4>
                    <p className="content-p">
                      TeleGenesis OS routes all agent inference calls to the Fireworks AI API. This infrastructure is fully optimized to run on top-tier hardware:
                    </p>
                    <ul style={{ paddingLeft: '16px', color: '#94a3b8', fontSize: '13px', lineHeight: '1.6' }}>
                      <li style={{ marginBottom: '10px' }}>
                        <strong>Massive HBM3 Memory:</strong> AMD Instinct MI300X features 192GB HBM3 memory and 5.3 TB/s bandwidth, allowing the backend to execute all 15 agents concurrently in a single hardware batch.
                      </li>
                      <li style={{ marginBottom: '10px' }}>
                        <strong>ROCm Stack Optimizations:</strong> Utilizes FireAttention and ROCm software layers to reduce token generation latencies to single-digit milliseconds.
                      </li>
                      <li style={{ marginBottom: '10px' }}>
                        <strong>Serverless Scalability:</strong> Delivers enterprise-tier, multi-agent AI execution directly via Fireworks serverless endpoints without requiring dedicated local GPU clusters.
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <span>DOC_ID: TG-OS-SPEC-V1.1</span>
              <span>TELEGENESIS NETWORK OPERATIONS</span>
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
