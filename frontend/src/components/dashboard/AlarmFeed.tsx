import { motion } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info, XCircle, Clock } from 'lucide-react';
import type { Alarm } from '../../types';

interface AlarmFeedProps {
  alarms: Alarm[];
  maxItems?: number;
}

const severityConfig = {
  critical: { icon: XCircle, color: 'var(--color-status-critical)', bg: 'rgba(239, 68, 68, 0.1)' },
  major: { icon: AlertTriangle, color: 'var(--color-status-warning)', bg: 'rgba(245, 158, 11, 0.1)' },
  minor: { icon: AlertCircle, color: 'var(--color-accent-blue)', bg: 'rgba(59, 130, 246, 0.1)' },
  warning: { icon: Info, color: 'var(--color-text-muted)', bg: 'rgba(107, 114, 128, 0.1)' },
};

export default function AlarmFeed({ alarms, maxItems = 20 }: AlarmFeedProps) {
  const displayed = alarms.slice(0, maxItems);

  return (
    <div className="rounded-xl border border-[var(--color-border)] overflow-hidden" style={{ background: 'var(--color-bg-secondary)' }}>
      <div className="px-4 py-3 border-b border-[var(--color-border)] flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Live Alarms</h3>
        <span className="text-xs text-[var(--color-text-muted)]">{alarms.length} active</span>
      </div>
      <div className="max-h-[400px] overflow-y-auto divide-y divide-[var(--color-border)]/50">
        {displayed.length === 0 ? (
          <div className="p-8 text-center text-[var(--color-text-muted)] text-sm">No active alarms</div>
        ) : (
          displayed.map((alarm, i) => {
            const config = severityConfig[alarm.severity];
            const Icon = config.icon;
            const timeAgo = formatTimeAgo(alarm.timestamp);

            return (
              <motion.div
                key={alarm.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="px-4 py-3 hover:bg-white/[0.02] transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1 rounded" style={{ background: config.bg }}>
                    <Icon size={14} style={{ color: config.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--color-text-primary)] font-medium truncate">{alarm.title}</p>
                    <p className="text-xs text-[var(--color-text-muted)] truncate mt-0.5">{alarm.source} · {alarm.region}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] flex-shrink-0">
                    <Clock size={10} />
                    <span>{timeAgo}</span>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

function formatTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
