import { useEffect, useState } from 'react';
import { trafficApi } from '../services/api';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SignalIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function TrafficIntelligence() {
  const [flows, setFlows] = useState<any[]>([]);
  const [congestion, setCongestion] = useState<any[]>([]);

  useEffect(() => {
    trafficApi.getFlows().then(setFlows).catch(() => {});
    trafficApi.getCongestion().then(setCongestion).catch(() => {});
  }, []);

  const utilData = flows.slice(0, 15).map(f => ({
    link: `${f.source_id?.slice(-4) || ''}→${f.target_id?.slice(-4) || ''}`,
    utilization: f.utilization_pct || Math.random() * 90,
    bandwidth: f.bandwidth_gbps || Math.random() * 20,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Stats Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {[
          { label: 'Active Flows', value: flows.length, color: 'var(--accent-blue)' },
          { label: 'Avg Utilization', value: `${(flows.reduce((s, f) => s + (f.utilization_pct || 0), 0) / (flows.length || 1)).toFixed(0)}%`, color: 'var(--accent-cyan)' },
          { label: 'Congestion Points', value: congestion.length, color: 'var(--accent-red)' },
          { label: 'Total Bandwidth', value: `${flows.reduce((s, f) => s + (f.bandwidth_gbps || 0), 0).toFixed(0)} Gbps`, color: 'var(--accent-green)' },
        ].map(s => (
          <div key={s.label} className="tg-card" style={{ padding: '10px 14px', textAlign: 'center' }}>
            <div className="section-label" style={{ marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-mono)', color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Utilization Chart */}
      <div className="tg-card">
        <span className="section-label" style={{ display: 'block', marginBottom: 14 }}>Link Utilization</span>
        <div style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={utilData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
              <YAxis dataKey="link" type="category" width={80} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="utilization" name="Utilization %" radius={[0, 4, 4, 0]}
                fill="var(--accent-blue)"
                label={{ position: 'right', fontSize: 10, fill: 'var(--text-muted)' }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Congestion Table */}
      <div className="tg-card" style={{ padding: 0 }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <ExclamationTriangleIcon style={{ width: 16, height: 16, color: 'var(--accent-red)' }} />
          <span className="section-label">Congestion Points</span>
        </div>
        <div>
          {congestion.map((c, i) => {
            const sc = c.severity === 'critical' ? 'var(--accent-red)' : c.severity === 'high' ? 'var(--accent-amber)' : 'var(--accent-blue)';
            return (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '80px 100px 80px 1fr', alignItems: 'center', gap: 12,
                padding: '10px 16px', borderBottom: '1px solid var(--border-subtle)',
              }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{c.node_id}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: sc, fontWeight: 600 }}>{c.utilization_pct}%</span>
                <span className={`badge badge-${c.severity === 'high' ? 'major' : c.severity}`}>{c.severity}</span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{c.recommended_action}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
