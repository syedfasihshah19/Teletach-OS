import { motion } from 'framer-motion';

interface HealthGaugeProps {
  score: number; // 0-100
  size?: number;
}

export default function HealthGauge({ score, size = 180 }: HealthGaugeProps) {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference * 0.75;

  const getColor = (s: number) => {
    if (s >= 90) return 'var(--color-status-success)';
    if (s >= 70) return 'var(--color-status-warning)';
    return 'var(--color-status-critical)';
  };

  const getLabel = (s: number) => {
    if (s >= 90) return 'Healthy';
    if (s >= 70) return 'Degraded';
    return 'Critical';
  };

  const color = getColor(score);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="-rotate-[135deg]"
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Background arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={8}
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
            strokeLinecap="round"
          />
          {/* Value arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={8}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-3xl font-bold"
            style={{ color }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {score}
          </motion.span>
          <span className="text-xs text-[var(--color-text-muted)]">{getLabel(score)}</span>
        </div>
      </div>
      <p className="text-sm font-medium text-[var(--color-text-secondary)] mt-2">Network Health</p>
    </div>
  );
}
