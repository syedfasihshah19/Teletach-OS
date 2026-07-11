import { useEffect, useState } from 'react';
import { dashboardApi } from '../services/api';
import { Cog6ToothIcon, KeyIcon, CpuChipIcon, BellIcon, SignalIcon } from '@heroicons/react/24/outline';

export default function Settings() {
  const [extKpis, setExtKpis] = useState<any[]>([]);
  useEffect(() => { dashboardApi.getExtendedKPIs().then(setExtKpis).catch(() => {}); }, []);

  return (
    <div style={{ maxWidth: 700, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* AI Integration */}
      <div className="tg-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <KeyIcon style={{ width: 18, height: 18, color: 'var(--accent-blue)' }} />
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>AI Integration</span>
        </div>
        {[
          { label: 'Fireworks AI API Key', value: 'fw_Hui1...fL', type: 'key' },
          { label: 'Primary Model', value: 'DeepSeek V4 Pro (deepseek-v4-pro)', type: 'text' },
          { label: 'Fast Model', value: 'GLM 5 Pro 2 (glm-5p2)', type: 'text' },
          { label: 'Base URL', value: 'https://api.fireworks.ai/inference/v1', type: 'text' },
        ].map(f => (
          <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{f.label}</span>
            <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', background: 'var(--bg-surface)', padding: '3px 8px', borderRadius: 4 }}>{f.value}</span>
          </div>
        ))}
      </div>

      {/* Agent Management */}
      <div className="tg-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <CpuChipIcon style={{ width: 18, height: 18, color: 'var(--accent-green)' }} />
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Agent Configuration</span>
        </div>
        {['Performance', 'Alarm Correlation', 'Log Analysis', 'Security', 'Customer Experience', 'Traffic Engineering',
          'Consensus', 'Simulation', 'Knowledge', 'Reporting', 'Configuration', 'Capacity Planning', 'Cost Optimization', 'Energy Optimization', 'Incident Investigation'].map(a => (
          <div key={a} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{a} Agent</span>
            <span className="badge badge-success">Enabled</span>
          </div>
        ))}
      </div>

      {/* Data Connectors — Vendor Neutral */}
      <div className="tg-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Cog6ToothIcon style={{ width: 18, height: 18, color: 'var(--accent-amber)' }} />
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Data Connectors</span>
        </div>
        {/* Active */}
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Active</div>
        {[
          { name: 'Mock Telecom Connector', status: 'active', desc: 'Dynamic telemetry with diurnal patterns' },
        ].map(c => (
          <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{c.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.desc}</div>
            </div>
            <span className="badge badge-success">{c.status}</span>
          </div>
        ))}
        {/* Vendor NMS */}
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 14, marginBottom: 6 }}>Vendor NMS</div>
        {[
          { name: 'Nokia OSS', desc: 'Nokia Operations Support System' },
          { name: 'Ericsson ENM', desc: 'Ericsson Network Manager' },
          { name: 'Cisco NSO', desc: 'Cisco Network Services Orchestrator' },
          { name: 'Juniper Paragon', desc: 'Juniper Automation Suite' },
          { name: 'Huawei iManager', desc: 'Huawei Network Manager' },
          { name: 'ZTE NetNumen', desc: 'ZTE OSS Platform' },
          { name: 'Mikrotik RouterOS', desc: 'Mikrotik Management API' },
        ].map(c => (
          <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{c.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.desc}</div>
            </div>
            <span className="badge badge-minor">planned</span>
          </div>
        ))}
        {/* Monitoring & Protocols */}
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 14, marginBottom: 6 }}>Monitoring & Protocols</div>
        {[
          { name: 'Prometheus', desc: 'Metrics & time-series monitoring' },
          { name: 'Grafana', desc: 'Dashboard & alerting integration' },
          { name: 'OpenTelemetry', desc: 'Distributed tracing & telemetry' },
          { name: 'SNMP v2c/v3', desc: 'Simple Network Management Protocol' },
          { name: 'NETCONF/YANG', desc: 'Network Configuration Protocol' },
          { name: 'gNMI', desc: 'gRPC Network Management Interface' },
        ].map(c => (
          <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{c.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.desc}</div>
            </div>
            <span className="badge badge-minor">planned</span>
          </div>
        ))}
      </div>

      {/* Extended KPI Library */}
      {extKpis.length > 0 && (
        <div className="tg-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <SignalIcon style={{ width: 18, height: 18, color: 'var(--accent-cyan)' }} />
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Telecom KPI Library</span>
            <span style={{ fontSize: 10, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', marginLeft: 'auto' }}>LIVE</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {extKpis.map(k => {
              const sc = k.status === 'critical' ? 'var(--accent-red)' : k.status === 'warning' ? 'var(--accent-amber)' : 'var(--accent-green)';
              return (
                <div key={k.name} style={{ padding: '8px 10px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>{k.name}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-mono)', color: sc }}>{typeof k.value === 'number' ? k.value.toFixed(1) : k.value}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{k.unit}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
