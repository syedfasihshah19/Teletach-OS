import { useState } from 'react';

interface SplashPageProps {
  onEnter: () => void;
}

export default function SplashPage({ onEnter }: SplashPageProps) {
  const [isFadingOut, setIsFadingOut] = useState(false);

  const handleEnter = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onEnter();
    }, 850);
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#02040a] flex flex-col justify-between overflow-hidden transition-all duration-[850ms] ease-in-out font-sans ${
        isFadingOut ? 'opacity-0 scale-[1.05] pointer-events-none' : 'opacity-100'
      }`}
      style={{
        background: 'radial-gradient(circle at 60% 40%, #0d122b 0%, #030511 70%, #010206 100%)'
      }}
    >
      {/* ─── Sci-Fi Glowing Background Objects ─── */}
      {/* Purple & Cyan Neon Nebulas */}
      <div className="absolute top-[20%] right-[10%] w-[550px] h-[550px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none animate-[pulse_8s_infinite_alternate]"></div>
      <div className="absolute bottom-[10%] right-[35%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none animate-[pulse_6s_infinite_alternate]"></div>
      <div className="absolute top-[40%] left-[5%] w-[350px] h-[350px] bg-cyan-600/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #ffffff 1px, transparent 1px),
            linear-gradient(to bottom, #ffffff 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      ></div>

      {/* Light Flares / Horizon line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent shadow-[0_0_20px_rgba(6,182,212,0.3)]"></div>

      {/* Floating Particles/Stars */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-cyan-400"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.7 + 0.3,
              animation: `float-particle ${5 + Math.random() * 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      {/* ─── Header Navigation ─── */}
      <header className="relative z-10 flex justify-between items-center px-8 sm:px-16 py-6 w-full backdrop-blur-sm bg-black/10 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          {/* Logo Icon */}
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <span className="text-[10px] font-bold text-slate-900 font-mono">TG</span>
          </div>
          <span className="text-sm font-semibold tracking-wider text-white uppercase font-mono">
            TeleGenesis <span className="text-cyan-400">OS</span>
          </span>
        </div>

        {/* Mock Links (Purely Client-side static styling) */}
        <nav className="hidden md:flex items-center gap-8 text-[11px] font-mono tracking-widest text-slate-400 uppercase">
          <a href="#about" className="hover:text-cyan-400 transition-colors">Platform</a>
          <a href="#architecture" className="hover:text-cyan-400 transition-colors">AMD Instinct</a>
          <a href="#github" className="hover:text-cyan-400 transition-colors">Code</a>
          <span className="px-2 py-0.5 rounded border border-cyan-500/30 bg-cyan-950/20 text-cyan-400 text-[9px] font-bold tracking-normal uppercase">
            v1.1.0-LIVE
          </span>
        </nav>
      </header>

      {/* ─── Hero Content Area ─── */}
      <main className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 items-center px-8 sm:px-16 max-w-7xl mx-auto w-full py-12 gap-12">
        {/* Left text column (5 cols) */}
        <div className="lg:col-span-6 flex flex-col justify-center text-left">
          {/* Tagline */}
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full border border-cyan-500/25 bg-cyan-950/30 w-fit backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-[10px] font-mono font-bold tracking-wider text-cyan-300 uppercase">
              AMD Instinct™ MI300X Optimized
            </span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white font-sans leading-[1.1] select-none">
            Cognitive AI-Powered <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent filter drop-shadow-[0_0_30px_rgba(6,182,212,0.2)]">
              Network Control
            </span>
          </h2>
          
          <p className="mt-6 text-sm sm:text-base text-slate-400 max-w-lg leading-relaxed font-sans">
            Automating multi-agent incident investigations, alarm correlations, and deterministic digital twin simulations. Accelerated by Fireworks AI on enterprise-class hardware.
          </p>

          {/* Action Buttons */}
          <div className="mt-10 flex flex-wrap gap-4">
            <button
              onClick={handleEnter}
              className="relative py-3.5 px-8 rounded-lg font-mono font-bold text-xs tracking-widest text-slate-900 overflow-hidden cursor-pointer shadow-[0_0_30px_rgba(6,182,212,0.35)] hover:shadow-[0_0_40px_rgba(6,182,212,0.5)] transition-all duration-300 active:scale-[0.98] border border-cyan-400/50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400"></div>
              <span className="relative z-10 flex items-center justify-center gap-2">
                ENTER CONTROL CENTER
                <span className="text-xs">&rarr;</span>
              </span>
            </button>

            <a
              href="file:///e:/AMD Hackton/docs/AMD_EVALUATION_WALKTHROUGH.md"
              target="_blank"
              rel="noreferrer"
              className="py-3.5 px-6 rounded-lg font-mono font-bold text-xs tracking-widest text-white border border-white/10 hover:border-cyan-500/40 bg-white/[0.02] hover:bg-cyan-500/[0.04] transition-all duration-300 flex items-center gap-2"
            >
              WALKTHROUGH DOCS
            </a>
          </div>
        </div>

        {/* Right Graphic column (6 cols) */}
        <div className="lg:col-span-6 relative flex justify-center items-center h-[380px] lg:h-[500px]">
          {/* Orbital glowing ring */}
          <div 
            className="absolute rounded-full border border-dashed border-cyan-500/20"
            style={{
              width: '320px',
              height: '320px',
              transform: 'rotateX(72deg) rotateY(-18deg)',
              animation: 'spin 25s linear infinite'
            }}
          />
          <div 
            className="absolute rounded-full border border-double border-purple-500/10"
            style={{
              width: '360px',
              height: '360px',
              transform: 'rotateX(68deg) rotateY(12deg)',
              animation: 'spin-reverse 35s linear infinite'
            }}
          />

          {/* Holographic Glowing Globe Grid (Rotating Globe) */}
          <div className="absolute w-[220px] h-[220px] lg:w-[260px] lg:h-[260px] rounded-full flex items-center justify-center select-none pointer-events-none animate-[float_6s_ease-in-out_infinite]">
            
            {/* Inner Glow Filter */}
            <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-[20px] pointer-events-none"></div>
            
            {/* SVG Globe */}
            <svg 
              viewBox="0 0 100 100" 
              className="w-full h-full text-cyan-400/50 animate-[spin-slow_20s_linear_infinite]"
              style={{ filter: 'drop-shadow(0 0 12px rgba(6,182,212,0.4))' }}
            >
              {/* Outer boundary */}
              <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.3" />
              
              {/* Latitudes */}
              <ellipse cx="50" cy="50" rx="48" ry="12" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <ellipse cx="50" cy="50" rx="48" ry="28" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <line x1="2" y1="50" x2="98" y2="50" stroke="currentColor" strokeWidth="0.5" />

              {/* Longitudes */}
              <ellipse cx="50" cy="50" rx="12" ry="48" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <ellipse cx="50" cy="50" rx="28" ry="48" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <line x1="50" y1="2" x2="50" y2="98" stroke="currentColor" strokeWidth="0.5" />

              {/* Constellation Nodes (Interactive look) */}
              <circle cx="28" cy="38" r="1.5" fill="#38bdf8" />
              <circle cx="72" cy="38" r="1.5" fill="#38bdf8" />
              <circle cx="50" cy="22" r="1.5" fill="#818cf8" />
              <circle cx="34" cy="62" r="1.5" fill="#c084fc" />
              <circle cx="66" cy="62" r="1.5" fill="#c084fc" />
              
              {/* Constellation Lines */}
              <line x1="28" y1="38" x2="50" y2="22" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="1 1" />
              <line x1="72" y1="38" x2="50" y2="22" stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="1 1" />
              <line x1="34" y1="62" x2="50" y2="50" stroke="#818cf8" strokeWidth="0.5" />
              <line x1="66" y1="62" x2="50" y2="50" stroke="#818cf8" strokeWidth="0.5" />
              <line x1="28" y1="38" x2="34" y2="62" stroke="#c084fc" strokeWidth="0.5" strokeDasharray="1 1" />
            </svg>
          </div>

          {/* Wireframe Holographic cybernetic hand pointing up to support the globe */}
          <div className="absolute bottom-[5%] w-[280px] lg:w-[320px] h-[180px] pointer-events-none select-none animate-[hand-breath_4s_ease-in-out_infinite]">
            <svg 
              viewBox="0 0 200 120" 
              className="w-full h-full text-blue-500/35"
              style={{ filter: 'drop-shadow(0 0 15px rgba(59,130,246,0.35))' }}
            >
              {/* Hand base grid structure */}
              {/* Wrist & Palm */}
              <path d="M 60 120 L 140 120 L 150 90 L 50 90 Z" fill="none" stroke="currentColor" strokeWidth="0.75" />
              <path d="M 50 90 L 150 90 L 165 55 L 35 55 Z" fill="none" stroke="currentColor" strokeWidth="0.75" />
              
              {/* Internal wireframe lattice connecting lines */}
              <line x1="60" y1="120" x2="50" y2="90" stroke="currentColor" strokeWidth="0.5" />
              <line x1="80" y1="120" x2="75" y2="90" stroke="currentColor" strokeWidth="0.5" />
              <line x1="100" y1="120" x2="100" y2="90" stroke="currentColor" strokeWidth="0.5" />
              <line x1="120" y1="120" x2="125" y2="90" stroke="currentColor" strokeWidth="0.5" />
              <line x1="140" y1="120" x2="150" y2="90" stroke="currentColor" strokeWidth="0.5" />

              <line x1="50" y1="90" x2="35" y2="55" stroke="currentColor" strokeWidth="0.5" />
              <line x1="75" y1="90" x2="70" y2="55" stroke="currentColor" strokeWidth="0.5" />
              <line x1="100" y1="90" x2="100" y2="55" stroke="currentColor" strokeWidth="0.5" />
              <line x1="125" y1="90" x2="130" y2="55" stroke="currentColor" strokeWidth="0.5" />
              <line x1="150" y1="90" x2="165" y2="55" stroke="currentColor" strokeWidth="0.5" />

              {/* Fingers wireframe */}
              {/* Thumb */}
              <path d="M 35 55 L 20 40 L 15 28 L 22 25 L 38 42 Z" fill="none" stroke="currentColor" strokeWidth="0.75" />
              {/* Index */}
              <path d="M 45 55 L 45 25 L 47 10 L 53 10 L 55 25 L 55 55" fill="none" stroke="currentColor" strokeWidth="0.75" />
              {/* Middle */}
              <path d="M 75 55 L 77 20 L 79 5 L 87 5 L 89 20 L 85 55" fill="none" stroke="currentColor" strokeWidth="0.75" />
              {/* Ring */}
              <path d="M 115 55 L 113 22 L 115 8 L 123 8 L 125 22 L 125 55" fill="none" stroke="currentColor" strokeWidth="0.75" />
              {/* Pinky */}
              <path d="M 145 55 L 149 32 L 153 20 L 159 20 L 161 32 L 155 55" fill="none" stroke="currentColor" strokeWidth="0.75" />

              {/* Cross connection lattices on palm */}
              <line x1="60" y1="120" x2="75" y2="90" stroke="currentColor" strokeWidth="0.4" />
              <line x1="80" y1="120" x2="100" y2="90" stroke="currentColor" strokeWidth="0.4" />
              <line x1="100" y1="120" x2="125" y2="90" stroke="currentColor" strokeWidth="0.4" />
              <line x1="120" y1="120" x2="150" y2="90" stroke="currentColor" strokeWidth="0.4" />
              
              <line x1="50" y1="90" x2="70" y2="55" stroke="currentColor" strokeWidth="0.4" />
              <line x1="75" y1="90" x2="100" y2="55" stroke="currentColor" strokeWidth="0.4" />
              <line x1="100" y1="90" x2="130" y2="55" stroke="currentColor" strokeWidth="0.4" />
              <line x1="125" y1="90" x2="165" y2="55" stroke="currentColor" strokeWidth="0.4" />

              {/* Glowing Finger Tip Nodes */}
              <circle cx="17" cy="26" r="2.5" fill="#67e8f9" />
              <circle cx="50" cy="9" r="2.5" fill="#67e8f9" />
              <circle cx="83" cy="4" r="2.5" fill="#67e8f9" />
              <circle cx="119" cy="7" r="2.5" fill="#67e8f9" />
              <circle cx="156" cy="19" r="2.5" fill="#67e8f9" />
            </svg>
          </div>
        </div>
      </main>

      {/* ─── Footer Details ─── */}
      <footer className="relative z-10 flex flex-wrap justify-between items-center px-8 sm:px-16 py-6 border-t border-white/5 bg-black/20 text-[10px] font-mono tracking-widest text-slate-500">
        <div>SYS_STATUS // ONLINE_SECURE</div>
        <div className="mt-2 sm:mt-0">POWERED BY FIREFALL &amp; AMD INSTINCT MI300X</div>
      </footer>

      {/* ─── Custom Global Animations ─── */}
      <style>{`
        @keyframes float-particle {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-80px) scale(0.6);
            opacity: 0;
          }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(1deg); }
        }
        @keyframes hand-breath {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.95; }
          50% { transform: translateY(5px) scale(0.97); opacity: 0.8; }
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
    </div>
  );
}
