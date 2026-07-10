import { useState } from 'react';
import { simulationApi } from '../services/api';
import {
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { CubeTransparentIcon, PlayIcon, ArrowPathIcon, ShieldCheckIcon, SparklesIcon, ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/outline';

const scenarios = [
  { id: 'congestion_spike', name: 'Congestion Spike', desc: 'Simulate 2x traffic surge on trunk links' },
  { id: 'tower_outage', name: 'Tower Outage', desc: 'Simulate cell tower failure and failover' },
  { id: 'capacity_upgrade', name: 'Capacity Upgrade', desc: 'Test 100G upgrade on North-South trunk' },
  { id: 'traffic_reroute', name: 'Traffic Reroute', desc: 'Enable ECMP across all core routers' },
  { id: 'weather_event', name: 'Weather Event', desc: 'Simulate severe weather impact on East region' },
];

export default function DigitalTwin() {
  const [selectedScenario, setSelectedScenario] = useState(scenarios[0]);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [planQuestion, setPlanQuestion] = useState('');
  const [planning, setPlanning] = useState(false);
  const [planResult, setPlanResult] = useState<any>(null);

  const runSim = async () => {
    setRunning(true);
    setResult(null);
    try {
      const r = await simulationApi.run({
        type: selectedScenario.id, name: selectedScenario.name,
        parameters: {}, description: selectedScenario.desc,
      });
      setResult(r);
    } catch (e) { console.error(e); }
    setRunning(false);
  };

  const barData = result ? [
    { metric: 'Latency', before: result.before_metrics?.avg_latency_ms, after: result.after_metrics?.avg_latency_ms },
    { metric: 'Throughput', before: result.before_metrics?.throughput_gbps, after: result.after_metrics?.throughput_gbps },
    { metric: 'Pkt Loss', before: (result.before_metrics?.packet_loss_pct || 0) * 1000, after: (result.after_metrics?.packet_loss_pct || 0) * 1000 },
    { metric: 'Congestion', before: result.before_metrics?.congestion_pct, after: result.after_metrics?.congestion_pct },
  ] : [];

  // Build radar from actual simulation data
  const radarData = result ? (() => {
    const b = result.before_metrics || {};
    const a = result.after_metrics || {};
    const normalize = (val: number, max: number) => Math.min(100, Math.round((val / max) * 100));
    return [
      { metric: 'Latency', before: normalize(30 - Math.min(b.avg_latency_ms || 0, 30), 30), after: normalize(30 - Math.min(a.avg_latency_ms || 0, 30), 30) },
      { metric: 'Throughput', before: normalize(b.throughput_gbps || 0, 100), after: normalize(a.throughput_gbps || 0, 100) },
      { metric: 'Availability', before: normalize(b.availability_pct || 0, 100), after: normalize(a.availability_pct || 0, 100) },
      { metric: 'QoE', before: normalize((b.qoe_score || 0) * 20, 100), after: normalize((a.qoe_score || 0) * 20, 100) },
      { metric: 'Pkt Integrity', before: normalize(100 - (b.packet_loss_pct || 0) * 1000, 100), after: normalize(100 - (a.packet_loss_pct || 0) * 1000, 100) },
      { metric: 'Congestion Free', before: normalize(100 - (b.congestion_pct || 0), 100), after: normalize(100 - (a.congestion_pct || 0), 100) },
    ];
  })() : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top: Scenario Selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
        {scenarios.map(s => (
          <div key={s.id}
            onClick={() => setSelectedScenario(s)}
            style={{
              padding: '12px 14px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
              background: selectedScenario.id === s.id ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-secondary)',
              border: selectedScenario.id === s.id ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid var(--border-subtle)',
              transition: 'all 150ms ease-out',
            }}
            onMouseEnter={e => { if (selectedScenario.id !== s.id) e.currentTarget.style.borderColor = 'var(--border-default)'; }}
            onMouseLeave={e => { if (selectedScenario.id !== s.id) e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: selectedScenario.id === s.id ? 'var(--accent-blue)' : 'var(--text-primary)', marginBottom: 4 }}>{s.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.3 }}>{s.desc}</div>
          </div>
        ))}
      </div>

      {/* Run Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={runSim} disabled={running} className="btn btn-success"
          style={{ opacity: running ? 0.7 : 1 }}>
          {running ? (
            <><ArrowPathIcon style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} /> Simulating...</>
          ) : (
            <><PlayIcon style={{ width: 14, height: 14 }} /> Run Simulation</>
          )}
        </button>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          <CubeTransparentIcon style={{ width: 14, height: 14, display: 'inline', verticalAlign: -2, marginRight: 4 }} />
          {selectedScenario.name} — {selectedScenario.desc}
        </div>
      </div>

      {/* Results */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {/* Bar Chart */}
            <div className="tg-card">
              <span className="section-label" style={{ display: 'block', marginBottom: 14 }}>Before vs After Comparison</span>
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="metric" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="before" fill="#EF4444" name="Before" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="after" fill="#22C55E" name="After" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Radar Chart */}
            <div className="tg-card">
              <span className="section-label" style={{ display: 'block', marginBottom: 14 }}>Multi-Dimensional Impact</span>
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="var(--border-subtle)" />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                    <PolarRadiusAxis tick={{ fontSize: 9 }} domain={[0, 100]} />
                    <Radar name="Before" dataKey="before" stroke="#EF4444" fill="#EF4444" fillOpacity={0.15} />
                    <Radar name="After" dataKey="after" stroke="#22C55E" fill="#22C55E" fillOpacity={0.2} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Improvement Summary */}
          <div className="tg-card">
            <span className="section-label" style={{ display: 'block', marginBottom: 12 }}>Improvement Summary</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
              {Object.entries(result.improvement_pct || {}).map(([k, v]: [string, any]) => (
                <div key={k} style={{ padding: 12, borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-mono)', color: v > 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                    {v > 0 ? '+' : ''}{typeof v === 'number' ? v.toFixed(1) : v}%
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize', marginTop: 4 }}>{k.replace(/_/g, ' ')}</div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Analysis Section */}
          {(result.ai_analysis || result.risk_assessment || result.rollback_plan) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {/* AI Recommendation */}
              <div className="tg-card" style={{ borderLeft: '3px solid var(--accent-blue)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <SparklesIcon style={{ width: 15, height: 15, color: 'var(--accent-blue)' }} />
                  <span className="section-label">AI Analysis</span>
                  {result.confidence > 0 && (
                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700,
                      color: result.confidence >= 0.85 ? 'var(--accent-green)' : 'var(--accent-amber)',
                      marginLeft: 'auto' }}>
                      {(result.confidence * 100).toFixed(0)}% confidence
                    </span>
                  )}
                </div>
                {result.best_strategy && (
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-green)', marginBottom: 8, padding: '4px 8px',
                    background: 'rgba(34,197,94,0.08)', borderRadius: 'var(--radius-sm)', display: 'inline-block' }}>
                    Best: {result.best_strategy}
                  </div>
                )}
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  {result.ai_analysis}
                </p>
              </div>

              {/* Risk & Rollback */}
              <div className="tg-card" style={{ borderLeft: '3px solid var(--accent-amber)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <ShieldCheckIcon style={{ width: 15, height: 15, color: 'var(--accent-amber)' }} />
                  <span className="section-label">Risk & Rollback</span>
                </div>
                {result.risk_assessment && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>RISK ASSESSMENT</div>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{result.risk_assessment}</p>
                  </div>
                )}
                {result.rollback_plan && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>ROLLBACK PLAN</div>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{result.rollback_plan}</p>
                  </div>
                )}
                {result.customer_impact && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>CUSTOMER IMPACT</div>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{result.customer_impact}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Strategy Comparison */}
          {result.strategies?.length > 0 && (
            <div className="tg-card">
              <span className="section-label" style={{ display: 'block', marginBottom: 10 }}>Strategy Comparison</span>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${result.strategies.length}, 1fr)`, gap: 10 }}>
                {result.strategies.map((s: any, i: number) => (
                  <div key={i} style={{
                    padding: 12, borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)',
                    border: s.name === result.best_strategy ? '1px solid rgba(34,197,94,0.4)' : '1px solid var(--border-subtle)',
                  }}>
                    {s.name === result.best_strategy && (
                      <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--accent-green)', textTransform: 'uppercase',
                        background: 'rgba(34,197,94,0.1)', padding: '2px 6px', borderRadius: 4, marginBottom: 6, display: 'inline-block' }}>
                        ★ Recommended
                      </span>
                    )}
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>{s.name}</div>
                    <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-green)', marginBottom: 6 }}>
                      +{(s.improvement_factor * 100).toFixed(1)}%
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>improvement factor</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!result && !running && (
        <div className="tg-card" style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          <CubeTransparentIcon style={{ width: 48, height: 48, margin: '0 auto 12px', opacity: 0.2 }} />
          <div style={{ fontSize: 14 }}>Select a scenario and run a simulation</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>The Digital Twin validates changes before deployment</div>
        </div>
      )}

      {/* ── AI Scenario Planner (Feature 10) ── */}
      <div className="tg-card" style={{ borderLeft: '3px solid var(--accent-purple)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <ChatBubbleLeftEllipsisIcon style={{ width: 16, height: 16, color: 'var(--accent-purple)' }} />
          <span className="section-label">AI Scenario Planner</span>
          <span style={{ fontSize: 10, color: 'var(--accent-purple)', fontFamily: 'var(--font-mono)', marginLeft: 'auto' }}>NATURAL LANGUAGE</span>
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: planResult ? 14 : 0 }}>
          <input
            type="text"
            value={planQuestion}
            onChange={e => setPlanQuestion(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && planQuestion.trim()) { setPlanning(true); setPlanResult(null); simulationApi.plan(planQuestion).then(r => { setPlanResult(r); setPlanning(false); }).catch(() => setPlanning(false)); } }}
            placeholder="Ask: What if we reroute traffic through South Core instead of upgrading bandwidth?"
            style={{
              flex: 1, padding: '8px 14px', borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)', fontSize: 13, outline: 'none',
              fontFamily: 'var(--font-sans)',
            }}
          />
          <button
            onClick={() => { if (planQuestion.trim()) { setPlanning(true); setPlanResult(null); simulationApi.plan(planQuestion).then(r => { setPlanResult(r); setPlanning(false); }).catch(() => setPlanning(false)); } }}
            disabled={planning || !planQuestion.trim()}
            className="btn btn-primary"
            style={{ flexShrink: 0, opacity: planning ? 0.7 : 1, fontSize: 12, padding: '6px 14px' }}
          >
            {planning ? (
              <><ArrowPathIcon style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }} /> Planning...</>
            ) : (
              <><SparklesIcon style={{ width: 13, height: 13 }} /> Ask AI</>
            )}
          </button>
        </div>

        {/* Planner results */}
        {planResult && planResult.scenarios && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Scenario cards */}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${planResult.scenarios.length}, 1fr)`, gap: 10 }}>
              {planResult.scenarios.map((s: any, i: number) => {
                const isBest = i === planResult.best_scenario_index;
                return (
                  <div key={i} className="animate-fade-in" style={{
                    padding: 14, borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)',
                    border: isBest ? '1px solid rgba(34,197,94,0.4)' : '1px solid var(--border-subtle)',
                    animationDelay: `${i * 100}ms`,
                  }}>
                    {isBest && (
                      <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--accent-green)', textTransform: 'uppercase',
                        background: 'rgba(34,197,94,0.1)', padding: '2px 6px', borderRadius: 4, marginBottom: 6, display: 'inline-block' }}>
                        ★ Best Option
                      </span>
                    )}
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                      {s.scenario?.name || `Option ${i + 1}`}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.4 }}>
                      {s.scenario?.description || ''}
                    </div>
                    {s.scenario?.risk_level && (
                      <span className={`badge ${s.scenario.risk_level === 'high' ? 'badge-critical' : s.scenario.risk_level === 'medium' ? 'badge-major' : 'badge-success'}`}>
                        {s.scenario.risk_level} risk
                      </span>
                    )}
                    {s.confidence > 0 && (
                      <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-green)', marginLeft: 8 }}>
                        {(s.confidence * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* AI Comparison */}
            {planResult.comparison && (
              <div style={{ padding: 14, borderRadius: 'var(--radius-md)', background: 'rgba(168,85,247,0.04)', border: '1px solid rgba(168,85,247,0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <SparklesIcon style={{ width: 14, height: 14, color: 'var(--accent-purple)' }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-purple)' }}>AI Recommendation</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 8px' }}>
                  {planResult.comparison.recommendation}
                </p>
                {planResult.comparison.comparison_summary && (
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                    {planResult.comparison.comparison_summary}
                  </p>
                )}
                {planResult.comparison.warnings?.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    {planResult.comparison.warnings.map((w: string, i: number) => (
                      <div key={i} style={{ fontSize: 11, color: 'var(--accent-amber)', marginTop: 4 }}>⚠️ {w}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
