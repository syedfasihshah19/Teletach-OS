import { useEffect, useState } from 'react';
import { agentApi } from '../services/api';
import { CpuChipIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function AgentActivity() {
  const [agents, setAgents] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    agentApi.list().then(setAgents).catch(() => {});
    agentApi.getActivity(50).then(setActivity).catch(() => {});
    const iv = setInterval(() => {
      agentApi.getActivity(50).then(setActivity).catch(() => {});
    }, 10000);
    return () => clearInterval(iv);
  }, []);

  const filtered = filter === 'all' ? activity : activity.filter(a => a.agent_type === filter);

  const statusIcon = (s: string) => {
    if (s === 'success') return <CheckCircleIcon style={{ width: 13, height: 13, color: 'var(--accent-green)' }} />;
    if (s === 'failed') return <XCircleIcon style={{ width: 13, height: 13, color: 'var(--accent-red)' }} />;
    return <ClockIcon style={{ width: 13, height: 13, color: 'var(--accent-amber)' }} />;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Agent Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
        {agents.slice(0, 8).map(a => {
          const isActive = a.status === 'active';
          return (
            <div key={a.id} className="tg-card" style={{ padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <CpuChipIcon style={{ width: 16, height: 16, color: isActive ? 'var(--accent-green)' : 'var(--text-muted)' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{a.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                <span>{a.tasks_completed} tasks</span>
                <span className={`badge ${isActive ? 'badge-success' : 'badge-minor'}`}>{a.status}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {['all', ...new Set(activity.map(a => a.agent_type))].map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={filter === t ? 'btn btn-primary' : 'btn btn-ghost'}
            style={{ fontSize: 12, padding: '4px 10px' }}>
            {t === 'all' ? 'All' : t.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Activity Timeline */}
      <div className="tg-card" style={{ padding: 0 }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
          <span className="section-label">Activity Timeline — {filtered.length} entries</span>
        </div>
        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            <CpuChipIcon style={{ width: 32, height: 32, margin: '0 auto 10px', opacity: 0.2 }} />
            <div>No activity yet — run an investigation to see real telemetry</div>
          </div>
        )}
        <div style={{ maxHeight: 500, overflow: 'auto' }}>
          {filtered.map((a, i) => (
            <div key={a.id || i} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
              borderBottom: '1px solid var(--border-subtle)',
              transition: 'background 150ms ease-out',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-surface)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              {statusIcon(a.status || 'success')}
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-blue)', width: 140, flexShrink: 0 }}>{a.agent_name}</span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {a.detail || a.action}
              </span>
              {a.workflow_name && (
                <span style={{
                  fontSize: 9, padding: '2px 6px', borderRadius: 4, fontFamily: 'var(--font-mono)',
                  background: 'rgba(139,92,246,0.12)', color: 'var(--accent-purple)', flexShrink: 0,
                  textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em',
                }}>{a.workflow_name}</span>
              )}
              {a.model_used && (
                <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                  {a.model_used.split('/').pop()?.slice(0, 12)}
                </span>
              )}
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', flexShrink: 0, minWidth: 55, textAlign: 'right' }}>
                {a.tokens_used > 0 && `${a.tokens_used} tok`}
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', flexShrink: 0, minWidth: 50, textAlign: 'right' }}>
                {a.duration_ms}ms
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
