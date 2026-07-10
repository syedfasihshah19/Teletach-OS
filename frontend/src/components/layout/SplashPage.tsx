import { useState, useEffect } from 'react';

interface SplashPageProps {
  onEnter: () => void;
}

export default function SplashPage({ onEnter }: SplashPageProps) {
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const logMessages = [
    "[ BOOT ] Initializing pluggable connectors...",
    "[ BOOT ] Loading global telemetry cache...",
    "[ BOOT ] Verifying AMD Instinct™ MI300X hardware link...",
    "[ BOOT ] Configuring ROCm & FireAttention optimizations...",
    "[ BOOT ] Spawning 15 parallel domain agents...",
    "[ BOOT ] Activating consensus & reporting modules...",
    "[ SUCCESS ] TeleGenesis OS is fully synchronized."
  ];

  useEffect(() => {
    // Increment progress
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsLoaded(true);
          return 100;
        }
        return prev + 1;
      });
    }, 20); // ~2 seconds total loading time

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Add logs based on progress thresholds
    const logsToAdd: string[] = [];
    if (progress >= 5) logsToAdd.push(logMessages[0]);
    if (progress >= 20) logsToAdd.push(logMessages[1]);
    if (progress >= 40) logsToAdd.push(logMessages[2]);
    if (progress >= 55) logsToAdd.push(logMessages[3]);
    if (progress >= 75) logsToAdd.push(logMessages[4]);
    if (progress >= 90) logsToAdd.push(logMessages[5]);
    if (progress >= 100) logsToAdd.push(logMessages[6]);

    setLogs(logsToAdd);
  }, [progress]);

  const handleEnter = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onEnter();
    }, 800); // Match CSS transition duration
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#020617] flex flex-col justify-center items-center overflow-hidden transition-all duration-[800ms] ease-in-out ${
        isFadingOut ? 'opacity-0 scale-[1.05] pointer-events-none' : 'opacity-100'
      }`}
      style={{
        backgroundImage: `radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.07) 0%, transparent 65%), 
                          radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)`,
      }}
    >
      {/* Moving Background Network Mesh */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:32px_32px]"></div>

      {/* Main Core Glowing Branding */}
      <div className="relative flex flex-col items-center text-center px-4 max-w-lg z-10">
        {/* Glow behind logo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none"></div>

        {/* Hardware Accelerator Badge */}
        <div className="flex items-center gap-2 px-3 py-1 mb-6 rounded-full border border-cyan-500/20 bg-cyan-950/20 backdrop-blur-md animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
          <span className="text-[10px] font-mono font-bold tracking-wider text-cyan-300 uppercase">
            AMD Instinct™ MI300X Accelerated
          </span>
        </div>

        {/* Title Header */}
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent select-none filter drop-shadow-[0_0_20px_rgba(6,182,212,0.15)]">
          TeleGenesis OS
        </h1>
        <p className="mt-3 text-sm text-slate-400 tracking-wide">
          Cognitive Multi-Agent Telecom Orchestration System
        </p>

        {/* Loader Progress & Console Log */}
        <div className="w-80 mt-10 flex flex-col items-center">
          {!isLoaded ? (
            <>
              {/* Progress Count */}
              <span className="text-xs font-mono text-cyan-400/80 font-semibold">
                SYSTEM INITIALIZATION: {progress}%
              </span>

              {/* Progress Bar */}
              <div className="w-full h-[3px] bg-slate-800/80 rounded-full overflow-hidden mt-3 mb-6 border border-slate-700/20 shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-75 ease-out shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </>
          ) : (
            /* Enter Platform Button */
            <button
              onClick={handleEnter}
              className="group relative w-full py-3.5 px-6 rounded-lg font-mono font-bold text-xs tracking-widest text-slate-900 overflow-hidden cursor-pointer shadow-[0_0_25px_rgba(6,182,212,0.25)] hover:shadow-[0_0_35px_rgba(6,182,212,0.4)] transition-all duration-300 active:scale-[0.98] border border-cyan-400/50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400 group-hover:opacity-90 transition-opacity"></div>
              <span className="relative z-10 flex items-center justify-center gap-2">
                INITIALIZE CONTROL CENTER
                <span className="text-[10px] group-hover:translate-x-1 transition-transform">&rarr;</span>
              </span>
            </button>
          )}

          {/* Boot Logs */}
          <div className="w-full h-24 mt-2 overflow-hidden flex flex-col justify-end text-left font-mono text-[9px] text-slate-500 leading-normal border-t border-slate-800/20 pt-2">
            {logs.slice(-3).map((log, index) => (
              <div
                key={index}
                className={`truncate ${
                  log.includes('SUCCESS') ? 'text-emerald-400 font-semibold' : 'text-slate-400'
                }`}
              >
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Decorative details */}
      <div className="absolute top-8 left-8 text-slate-700 font-mono text-[9px] select-none tracking-widest hidden sm:block">
        SYS_STATUS // ONLINE_SECURE
      </div>
      <div className="absolute bottom-8 left-8 text-slate-700 font-mono text-[9px] select-none tracking-widest hidden sm:block">
        INFRA // CLOUD_HYBRID
      </div>
    </div>
  );
}
