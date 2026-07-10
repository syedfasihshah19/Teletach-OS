import { useEffect, useState } from 'react';
import { dashboardApi } from '../services/api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  ArrowTrendingUpIcon, ArrowTrendingDownIcon, ExclamationTriangleIcon,
  SignalIcon, ClockIcon, ServerStackIcon, BoltIcon, EyeIcon,
} from '@heroicons/react/24/outline';

interface KPI { name: string; value: number; unit: string; status: string; trend: string; }
interface Alarm { id: string; title: string; severity: string; source: string; timestamp: string; }

export default function ExecutiveDashboard() {
  const [health, setHealth] = useState(95);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [trafficData, setTrafficData] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const d = await dashboardApi.getData();
        setHealth(d.health_score);
        setKpis(d.kpis || []);
        setAlarms((d.recent_alarms || []).slice(0, 8));
        const throughputKpi = (d.kpis || []).find((k: any) => k.name === 'Throughput');
        const latencyKpi = (d.kpis || []).find((k: any) => k.name === 'Latency');
        const hours = Array.from({ length: 24 }, (_, i) => {
          const h = (new Date().getHours() - 23 + i + 24) % 24;
          const baseThru = throughputKpi?.value || 72;
          const baseLat = latencyKpi?.value || 12;
          const diurnal = 0.5 + 0.5 * Math.sin((h - 6) * Math.PI / 12);
          return {
            time: `${h.toString().padStart(2, '0')}:00`,
            throughput: Math.round((baseThru * (0.6 + diurnal * 0.5)) * 10) / 10,
            latency: Math.round((baseLat * (0.7 + diurnal * 0.4)) * 10) / 10,
          };
        });
        setTrafficData(hours);
      } catch {}
      try { setPredictions(await dashboardApi.getPredictions()); } catch {}
    };
    load();
    const iv = setInterval(load, 15000);
    return () => clearInterval(iv);
  }, []);

  const kpiIcons: Record<string, any> = {
    'Throughput': SignalIcon, 'Latency': ClockIcon,
    'Packet Loss': ExclamationTriangleIcon, 'Availability': ServerStackIcon,
  };

  const healthColor = health >= 90 ? 'var(--accent-green)' : health >= 70 ? 'var(--accent-amber)' : 'var(--accent-red)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top Row: Health + KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '280px 1fr', gap: 16 }}>
        {/* Health Gauge */}
        <div className="tg-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ position: 'relative', width: 140, height: 140 }}>
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border-subtle)" strokeWidth="6" />
              <circle cx="50" cy="50" r="42" fill="none" stroke={healthColor} strokeWidth="6"
                strokeDasharray={`${health * 2.64} ${264 - health * 2.64}`} strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 1s ease-out' }} />
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 700, fontFamily: 'var(--font-mono)', color: healthColor }}>{health}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>HEALTH</div>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: 10 }}>
          {kpis.slice(0, 6).map(k => {
            const Icon = kpiIcons[k.name] || SignalIcon;
            const statusColor = k.status === 'critical' ? 'var(--accent-red)' : k.status === 'warning' ? 'var(--accent-amber)' : 'var(--accent-green)';
            return (
              <div key={k.name} className="tg-card" style={{ padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icon style={{ width: 14, height: 14, color: 'var(--text-muted)' }} />
                    <span className="section-label">{k.name}</span>
                  </div>
                  {k.trend === 'up' ? (
                    <ArrowTrendingUpIcon style={{ width: 14, height: 14, color: 'var(--accent-green)' }} />
                  ) : k.trend === 'down' ? (
                    <ArrowTrendingDownIcon style={{ width: 14, height: 14, color: 'var(--accent-red)' }} />
                  ) : null}
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-mono)', color: statusColor }}>
                  {typeof k.value === 'number' ? k.value.toFixed(1) : k.value}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{k.unit}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Middle Row: Traffic Chart + Alarms */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 320px', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Traffic Chart */}
          <div className="tg-card">
            <span className="section-label" style={{ display: 'block', marginBottom: 14 }}>24h Network Traffic</span>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trafficData}>
                  <defs>
                    <linearGradient id="gThru" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} interval={3} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="throughput" stroke="#3B82F6" fill="url(#gThru)" strokeWidth={2} dot={false} name="Gbps" />
                  <Area type="monotone" dataKey="latency" stroke="#F59E0B" fill="none" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="ms" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── Predictive Incidents (Feature 5) ── */}
          {predictions.length > 0 && (
            <div className="tg-card" style={{ padding: 0 }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <EyeIcon style={{ width: 16, height: 16, color: 'var(--accent-purple)' }} />
                <span className="section-label">Predicted Incidents</span>
                <span style={{ fontSize: 10, color: 'var(--accent-purple)', fontFamily: 'var(--font-mono)', marginLeft: 'auto' }}>AI PREDICTIVE</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {predictions.map((p: any, i: number) => {
                  const sc = p.severity === 'critical' ? 'var(--accent-red)' : p.severity === 'major' ? 'var(--accent-amber)' : 'var(--accent-blue)';
                  return (
                    <div key={i} className="animate-fade-in" style={{
                      padding: '10px 16px', borderBottom: '1px solid var(--border-subtle)',
                      animationDelay: `${i * 100}ms`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <BoltIcon style={{ width: 14, height: 14, color: 'var(--accent-amber)' }} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>{p.title}</span>
                        <span className={`badge badge-${p.severity}`}>{p.severity}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 16, marginBottom: 4 }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          Confidence: <span style={{ color: sc, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{(p.confidence * 100).toFixed(0)}%</span>
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          Expected in: <span style={{ color: 'var(--accent-amber)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>~{p.estimated_minutes} min</span>
                        </span>
                        {p.matched_historical_cases > 0 && (
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            Matches: <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{p.matched_historical_cases} patterns</span>
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>{p.reason}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Alarm Feed */}
        <div className="tg-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span className="section-label">Live Alarms</span>
            <span className="badge badge-critical">{alarms.filter(a => a.severity === 'critical').length} critical</span>
          </div>
          <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {alarms.map((alarm) => {
              const sevColor = alarm.severity === 'critical' ? 'var(--accent-red)'
                : alarm.severity === 'major' ? 'var(--accent-amber)' : 'var(--accent-blue)';
              return (
                <div key={alarm.id} style={{
                  padding: '8px 10px', borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                  display: 'flex', gap: 8, alignItems: 'flex-start',
                  cursor: 'pointer', transition: 'border-color 150ms ease-out',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = sevColor; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
                >
                  <span style={{ width: 4, minHeight: 28, borderRadius: 2, background: sevColor, flexShrink: 0, marginTop: 2 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{alarm.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{alarm.source}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
