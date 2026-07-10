import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import type { KPIData } from '../../types';

interface KPICardProps {
  kpi: KPIData;
  index?: number;
}

const statusColors = {
  normal: { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.3)', text: 'var(--color-status-success)' },
  warning: { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)', text: 'var(--color-status-warning)' },
  critical: { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', text: 'var(--color-status-critical)' },
};

const trendIcons = { up: TrendingUp, down: TrendingDown, stable: Minus };

export default function KPICard({ kpi, index = 0 }: KPICardProps) {
  const colors = statusColors[kpi.status];
  const TrendIcon = trendIcons[kpi.trend];
  const trendColor = kpi.trend === 'up'
    ? (kpi.name.toLowerCase().includes('loss') || kpi.name.toLowerCase().includes('latency')
      ? 'var(--color-status-critical)' : 'var(--color-status-success)')
    : kpi.trend === 'down'
    ? (kpi.name.toLowerCase().includes('loss') || kpi.name.toLowerCase().includes('latency')
      ? 'var(--color-status-success)' : 'var(--color-status-critical)')
    : 'var(--color-text-muted)';

  const sparkData = kpi.history?.slice(-20).map((p, i) => ({ i, v: p.value })) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="relative rounded-xl p-4 border transition-all duration-200 hover:border-[var(--color-border-light)] group"
      style={{
        background: 'var(--color-bg-secondary)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Status indicator */}
      <div
        className="absolute top-3 right-3 w-2 h-2 rounded-full"
        style={{ background: colors.text, boxShadow: `0 0 8px ${colors.text}` }}
      />

      <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-2">{kpi.name}</p>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">
            {typeof kpi.value === 'number' ? kpi.value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : kpi.value}
            <span className="text-sm font-normal text-[var(--color-text-muted)] ml-1">{kpi.unit}</span>
          </p>
          <div className="flex items-center gap-1 mt-1">
            <TrendIcon size={12} style={{ color: trendColor }} />
            <span className="text-xs font-medium" style={{ color: trendColor }}>
              {kpi.trend_pct > 0 ? '+' : ''}{kpi.trend_pct.toFixed(1)}%
            </span>
          </div>
        </div>

        {sparkData.length > 0 && (
          <div className="w-20 h-10 opacity-60 group-hover:opacity-100 transition-opacity">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkData}>
                <defs>
                  <linearGradient id={`spark-${kpi.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={colors.text} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={colors.text} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={colors.text}
                  strokeWidth={1.5}
                  fill={`url(#spark-${kpi.id})`}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Generic Stat Card ───
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  color?: string;
  subtitle?: string;
}

export function StatCard({ label, value, icon, color = 'var(--color-accent-blue)', subtitle }: StatCardProps) {
  return (
    <div
      className="rounded-xl p-4 border border-[var(--color-border)] hover:border-[var(--color-border-light)] transition-colors"
      style={{ background: 'var(--color-bg-secondary)' }}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">{label}</p>
        {icon && <div style={{ color }} className="opacity-60">{icon}</div>}
      </div>
      <p className="text-2xl font-bold text-[var(--color-text-primary)]">{value}</p>
      {subtitle && <p className="text-xs text-[var(--color-text-muted)] mt-1">{subtitle}</p>}
    </div>
  );
}
