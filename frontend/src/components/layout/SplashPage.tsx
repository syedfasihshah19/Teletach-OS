import { useState, useEffect, useRef } from 'react';

interface SplashPageProps {
  onEnter: () => void;
}

export default function SplashPage({ onEnter }: SplashPageProps) {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'architecture' | 'agents' | 'amd'>('architecture');
  const [systemLogs, setSystemLogs] = useState<string[]>([]);
  const [typedTitle, setTypedTitle] = useState('');
  const [hudData, setHudData] = useState({
    latency: '1.8 ms',
    loss: '0.00%',
    jitter: '0.2 ms',
    throughput: '942.8 Gbps'
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Typewriter effect for tagline
  useEffect(() => {
    const fullText = "Cognitive AI-Powered Network Control";
    let index = 0;
    const timer = setInterval(() => {
      setTypedTitle(fullText.substring(0, index));
      index++;
      if (index > fullText.length) {
        clearInterval(timer);
      }
    }, 45);
    return () => clearInterval(timer);
  }, []);

  // HTML5 Canvas Interactive Particle Network (0 API Credits, fully local)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }> = [];

    const particleCount = 45;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.5 + 0.5
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw connections
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.05)';
      ctx.lineWidth = 0.5;

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < 130) {
            ctx.strokeStyle = `rgba(6, 182, 212, ${0.08 * (1 - dist / 130)})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Draw and update particles
      ctx.fillStyle = 'rgba(34, 211, 238, 0.25)';
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // 3D Perspective Card Tilt Hover effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;

    // Tilt limits
    const tiltX = (y / (box.height / 2)) * -8;
    const tiltY = (x / (box.width / 2)) * 8;

    card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
  };

  // Simulated server logs feed
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
      const newLog = logPool[Math.floor(Math.random() * logPool.length)];
      setSystemLogs(prev => [...prev.slice(-3), `[${new Date().toLocaleTimeString()}] ${newLog}`]);

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
      {/* ─── HTML5 Canvas Particle Background ─── */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-40" />

      {/* ─── SCIFI STYLES (Clean and decoupled) ─── */}
      <style>{`
        .tg-splash-container {
          position: fixed;
          inset: 0;
          z-index: 99999;
          background-color: #03050c;
          background-image: 
            linear-gradient(rgba(5, 7, 15, 0.85), rgba(5, 7, 15, 0.85)),
            url('/telecom_galaxy_lines.png'),
            linear-gradient(to right, rgba(6, 182, 212, 0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(6, 182, 212, 0.02) 1px, transparent 1px);
          background-size: cover, cover, 60px 60px, 60px 60px;
          background-position: center;
          background-repeat: no-repeat;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
          transition: all 850ms cubic-bezier(0.4, 0, 0.2, 1);
          color: #f8fafc;
        }

        .tg-splash-container.fade-out {
          opacity: 0;
          transform: scale(1.025);
          pointer-events: none;
        }

        /* ─── Navigation Header ─── */
        .tg-splash-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 64px;
          background: rgba(3, 4, 8, 0.5);
          backdrop-filter: blur(12px);
          border-b: 1px solid rgba(255, 255, 255, 0.04);
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
          border-radius: 6px;
          background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 16px rgba(6, 182, 212, 0.4);
          font-family: 'Fira Code', monospace;
          font-weight: 700;
          font-size: 12px;
          color: #030408;
        }

        .logo-text {
          font-family: 'Fira Code', monospace;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        .header-status {
          display: flex;
          align-items: center;
          gap: 16px;
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

        /* ─── Hero Main Content ─── */
        .tg-splash-main {
          flex: 1;
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          align-items: center;
          padding: 0 64px;
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
            gap: 48px;
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
          font-size: 56px;
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -2px;
          margin-bottom: 20px;
          height: 120px; /* reserve space for typing animation */
        }

        @media (max-width: 1024px) {
          .hero-title {
            height: auto;
            margin-bottom: 24px;
          }
        }

        @media (max-width: 640px) {
          .hero-title {
            font-size: 38px;
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

        /* ─── Operations Console HUD ─── */
        .tech-console {
          background: rgba(15, 23, 42, 0.45);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 16px 20px;
          width: 100%;
          max-width: 500px;
          margin-bottom: 36px;
          text-align: left;
          backdrop-filter: blur(8px);
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

        /* ─── Action Buttons ─── */
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
          color: #030408;
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
          backdrop-filter: blur(4px);
        }

        .btn-docs:hover {
          border-color: rgba(6, 182, 212, 0.3);
          background: rgba(6, 182, 212, 0.05);
          transform: translateY(-2px);
        }

        /* ─── Right Graphics Side (Motion Image Container) ─── */
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

        /* 3D Holographic Card containing generated image */
        .hologram-visual-card {
          width: 440px;
          height: 380px;
          border-radius: 12px;
          border: 1px solid rgba(239, 68, 68, 0.2);
          background: rgba(15, 23, 42, 0.3);
          backdrop-filter: blur(12px);
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
          position: relative;
          overflow: hidden;
          transition: transform 150ms ease-out, border-color 200ms ease;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: crosshair;
          z-index: 5;
        }

        @media (max-width: 1024px) {
          .hologram-visual-card {
            width: 320px;
            height: 280px;
          }
        }

        .hologram-visual-card:hover {
          border-color: rgba(239, 68, 68, 0.55);
        }

        /* Asset background visual */
        .hologram-asset-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.85;
          transition: transform 300ms ease;
          pointer-events: none;
          filter: brightness(0.9) contrast(1.1);
        }

        .hologram-visual-card:hover .hologram-asset-img {
          transform: scale(1.03);
          filter: brightness(1.05) contrast(1.1);
        }

        /* Radar scan sweeping overlay */
        .radar-scanner {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 50%, rgba(239, 68, 68, 0.18) 50%, transparent 52%);
          background-size: 100% 200%;
          animation: scan-sweep 6s linear infinite;
          pointer-events: none;
          z-index: 6;
        }

        /* Dynamic HUD telemetry data card overlay */
        .hud-telemetry-panel {
          position: absolute;
          bottom: 24px;
          right: 24px;
          background: rgba(5, 7, 15, 0.85);
          border: 1px solid rgba(239, 68, 68, 0.35);
          border-radius: 4px;
          padding: 12px 16px;
          width: 170px;
          backdrop-filter: blur(8px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          z-index: 10;
          font-family: 'Fira Code', monospace;
          font-size: 10px;
          color: #94a3b8;
          pointer-events: none;
          transition: all 250ms ease;
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
        @keyframes scan-sweep {
          0% { background-position: 0% 0%; }
          100% { background-position: 0% 200%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>

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
            {typedTitle}
            <span className="cursor-blink" style={{ color: '#06b6d4', animation: 'pulse-dot 0.8s infinite' }}>_</span>
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

        {/* Right Side: Interactive 3D Perspective Visual Card with Radar Sweeper */}
        <div className="hero-right" style={{ flexDirection: 'column', gap: '16px' }}>
          <div className="glow-aura" style={{ background: 'radial-gradient(circle, rgba(239, 68, 68, 0.12) 0%, transparent 70%)' }} />
          
          {/* Team Name badge banner */}
          <div style={{
            fontFamily: "'Fira Code', monospace",
            fontSize: "12px",
            letterSpacing: "3px",
            color: "#ef4444",
            textShadow: "0 0 10px rgba(239, 68, 68, 0.6)",
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.25)",
            padding: "6px 20px",
            borderRadius: "4px",
            textTransform: "uppercase",
            fontWeight: 800,
            animation: "float 6s ease-in-out infinite",
            animationDelay: "0.2s"
          }}>
            DEV_UNIT // REDLINE DEVS
          </div>

          <div 
            ref={cardRef}
            className="hologram-visual-card animate-[float_6s_ease-in-out_infinite]"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* Holographic Radar Line Sweeper */}
            <div className="radar-scanner" />
            
            {/* Generated Image visual asset */}
            <img 
              src="/redline_devs_logo.png" 
              alt="REDLINE Devs Team Logo" 
              className="hologram-asset-img"
            />

            {/* Corner Bracket Decorations (Cyberpunk UI elements) */}
            <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-red-500/40 pointer-events-none" />
            <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-red-500/40 pointer-events-none" />
            <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-red-500/40 pointer-events-none" />
            <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-red-500/40 pointer-events-none" />

            {/* Dynamic Telemetry HUD overlay inside card */}
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
                      The simulated data represents realistic network behaviors. Network traffic follows a strict diurnal cycle peaking at noon, and system failures propagate realistically (e.g. CRC error bursts cause OSPF session drop &rarr; routing flaps &rarr; downstream congestions).
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
