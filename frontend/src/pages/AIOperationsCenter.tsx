import { useEffect, useState } from 'react';
import { dashboardApi } from '../services/api';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';

export default function AIOperationsCenter() {
  const [kpis, setKpis] = useState<any[]>([]);
  const [alarms, setAlarms] = useState<any[]>([]);
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
        const [k, a] = await Promise.all([dashboardApi.getKPIs(), dashboardApi.getAlarms(100)]);
        setKpis(k || []); setAlarms(a || []);
      } catch {}
    };
    load();
    const iv = setInterval(load, 15000);
    return () => clearInterval(iv);
  }, []);

  const sevCounts = { critical: 0, major: 0, minor: 0, warning: 0 };
  alarms.forEach(a => { if (a.severity in sevCounts) sevCounts[a.severity as keyof typeof sevCounts]++; });
  const pieData = [
    { name: 'Critical', value: sevCounts.critical, color: '#EF4444' },
    { name: 'Major', value: sevCounts.major, color: '#F59E0B' },
    { name: 'Minor', value: sevCounts.minor, color: '#3B82F6' },
    { name: 'Warning', value: sevCounts.warning, color: '#A855F7' },
  ].filter(d => d.value > 0);

  const regionData = ['North', 'South', 'East'].map(r => ({
    region: r,
    alarms: alarms.filter(a => a.region === r).length,
    critical: alarms.filter(a => a.region === r && a.severity === 'critical').length,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Live KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : `repeat(${kpis.length || 6}, 1fr)`, gap: 10 }}>
        {kpis.map(k => {
          const sc = k.status === 'critical' ? 'var(--accent-red)' : k.status === 'warning' ? 'var(--accent-amber)' : 'var(--accent-green)';
          return (
            <div key={k.name} className="tg-card" style={{ padding: '10px 14px', textAlign: 'center' }}>
              <div className="section-label" style={{ marginBottom: 4 }}>{k.name}</div>
              <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-mono)', color: sc }}>
                {typeof k.value === 'number' ? k.value.toFixed(1) : k.value}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{k.unit}</div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 300px', gap: 16 }}>
        {/* Alarms by Region */}
        <div className="tg-card">
          <span className="section-label" style={{ display: 'block', marginBottom: 14 }}>Alarms by Region</span>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="alarms" fill="var(--accent-blue)" name="Total" radius={[4, 4, 0, 0]} />
                <Bar dataKey="critical" fill="var(--accent-red)" name="Critical" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution */}
        <div className="tg-card">
          <span className="section-label" style={{ display: 'block', marginBottom: 14 }}>Severity Distribution</span>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                  dataKey="value" paddingAngle={3} strokeWidth={0}>
                  {pieData.map(d => <Cell key={d.name} fill={d.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            {pieData.map(d => (
              <span key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-secondary)' }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} /> {d.name}: {d.value}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Alarm Timeline */}
      <div className="tg-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span className="section-label">Alarm Timeline</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{alarms.length} total</span>
        </div>
        <div style={{ maxHeight: 300, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {alarms.slice(0, 20).map(a => {
            const sc = a.severity === 'critical' ? 'var(--accent-red)' : a.severity === 'major' ? 'var(--accent-amber)' : 'var(--accent-blue)';
            return (
              <div key={a.id} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px',
                borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)',
              }}>
                <span style={{ width: 4, height: 20, borderRadius: 2, background: sc, flexShrink: 0 }} />
                <span className={`badge badge-${a.severity}`} style={{ flexShrink: 0 }}>{a.severity}</span>
                <span style={{ fontSize: 12, color: 'var(--text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{a.source}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
