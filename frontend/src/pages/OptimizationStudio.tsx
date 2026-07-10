import { useEffect, useState, useRef } from 'react';
import { optimizationApi } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  SparklesIcon, ArrowPathIcon, CheckCircleIcon, LightBulbIcon,
  ExclamationTriangleIcon, HandThumbUpIcon, HandThumbDownIcon, BoltIcon,
} from '@heroicons/react/24/outline';

const categories = ['all', 'routing', 'capacity', 'bandwidth', 'energy', 'cost'];

const CAT_COLORS: Record<string, string> = {
  routing: 'var(--accent-blue)', capacity: 'var(--accent-purple)',
  bandwidth: 'var(--accent-cyan)', energy: 'var(--accent-green)', cost: 'var(--accent-amber)',
};
const RISK_BADGE: Record<string, string> = {
  low: 'badge-success', medium: 'badge-major', high: 'badge-critical', minimal: 'badge-minor',
};
const CAT_ICONS: Record<string, string> = {
  routing: '🔀', capacity: '📦', bandwidth: '📡', energy: '⚡', cost: '💰',
};

export default function OptimizationStudio() {
  const [opts, setOpts]             = useState<any[]>([]);
  const [tab, setTab]               = useState('all');
  const [statusTab, setStatusTab]   = useState<'proposed' | 'approved' | 'rejected'>('proposed');
  const [selected, setSelected]     = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [genSuccess, setGenSuccess] = useState(false);
  const [genError, setGenError]     = useState('');
  const [loading, setLoading]       = useState(true);
  const [genProgress, setGenProgress] = useState<string[]>([]);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = async () => {
    try {
      const data = await optimizationApi.list();
      setOpts(data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const generate = async () => {
    setGenerating(true);
    setGenSuccess(false);
    setGenError('');
    setGenProgress([]);

    const animStages = [
      '🔀 Analyzing routing topology…',
      '📦 Forecasting capacity demand…',
      '📡 Evaluating bandwidth allocation…',
      '⚡ Auditing energy efficiency…',
      '💰 Computing cost savings…',
    ];
    let stage = 0;
    animRef.current = setInterval(() => {
      if (stage < animStages.length) {
        const msg = animStages[stage];
        stage++;
        setGenProgress(prev => prev.includes(msg) ? prev : [...prev, msg]);
      }
    }, 900);

    try {
      const results = await optimizationApi.generate(tab === 'all' ? 'all' : tab);
      clearInterval(animRef.current!);
      setGenProgress(animStages.map(s => s.replace('…', ' ✓')));
      await load();
      if (results?.length) setSelected(results[0]);
      setGenSuccess(true);
      setTimeout(() => { setGenSuccess(false); setGenProgress([]); }, 3500);
    } catch (e: any) {
      clearInterval(animRef.current!);
      setGenError(e?.message || 'Generation failed — check AI service connection.');
      setTimeout(() => setGenError(''), 6000);
    }
    setGenerating(false);
  };

  const handleDecision = async (decision: string) => {
    if (!selected) return;
    try {
      await optimizationApi.decide(selected.id, decision);
      setSelected({ ...selected, status: decision });
      setOpts(prev => prev.map(o => o.id === selected.id ? { ...o, status: decision } : o));
      setStatusTab(decision as any);
    } catch (e) { console.error(e); }
  };

  const categoryFiltered = tab === 'all' ? opts : opts.filter(o => o.category === tab);
  const finalFiltered = categoryFiltered.filter(o => o.status === statusTab);

  // Auto-select first item in filtered list when category or status tab changes
  useEffect(() => {
    if (finalFiltered.length) {
      if (!finalFiltered.some(o => o.id === selected?.id)) {
        setSelected(finalFiltered[0]);
      }
    } else {
      setSelected(null);
    }
  }, [tab, statusTab, opts]);

  const chartData = categories.slice(1).map(cat => {
    const catOpts = opts.filter(o => o.category === cat);
    const avg = catOpts.length
      ? Math.round(catOpts.reduce((s, o) => s + (o.improvement_pct || 0), 0) / catOpts.length)
      : 0;
    return { name: cat.charAt(0).toUpperCase() + cat.slice(1), improvement: avg, count: catOpts.length };
  });

  const avgImprovement = opts.length
    ? (opts.reduce((s, o) => s + (o.improvement_pct || 0), 0) / opts.length).toFixed(1)
    : '0.0';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── Toolbar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6, flex: 1, flexWrap: 'wrap' }}>
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setTab(c)}
              className={tab === c ? 'btn btn-primary' : 'btn btn-ghost'}
              style={{ textTransform: 'capitalize', fontSize: 12, padding: '5px 12px' }}
            >
              {c === 'all'
                ? `All (${opts.length})`
                : `${CAT_ICONS[c] || ''} ${c} (${opts.filter(o => o.category === c).length})`}
            </button>
          ))}
        </div>
        <button
          onClick={generate}
          disabled={generating}
          className={`btn ${genSuccess ? 'btn-success' : genError ? 'btn-danger' : 'btn-primary'}`}
          style={{ fontSize: 12, padding: '6px 16px', opacity: generating ? 0.85 : 1, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}
        >
          {generating
            ? <><ArrowPathIcon style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }} /> Generating…</>
            : genSuccess
            ? <><CheckCircleIcon style={{ width: 13, height: 13 }} /> Generated!</>
            : genError
            ? <><ExclamationTriangleIcon style={{ width: 13, height: 13 }} /> Error</>
            : <><SparklesIcon style={{ width: 13, height: 13 }} /> Generate AI Optimizations</>
          }
        </button>
      </div>

      {/* ── Generation Progress ── */}
      {generating && genProgress.length > 0 && (
        <div className="tg-card" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <BoltIcon style={{ width: 13, height: 13 }} />
            AI agents running concurrently — all categories in parallel…
          </div>
          {genProgress.map((msg, i) => (
            <div key={i} style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-green)', flexShrink: 0,
                animation: msg.includes('✓') ? 'none' : 'pulse 1s ease-in-out infinite',
              }} />
              {msg}
            </div>
          ))}
        </div>
      )}

      {/* ── Error Banner ── */}
      {genError && (
        <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', fontSize: 12, color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <ExclamationTriangleIcon style={{ width: 14, height: 14, flexShrink: 0 }} />
          {genError}
        </div>
      )}

      {/* ── Top Row: Chart + Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 14 }}>

        {/* Impact Chart */}
        <div className="tg-card">
          <span className="section-label" style={{ display: 'block', marginBottom: 14 }}>
            Optimization Impact by Category
          </span>
          {opts.length > 0 ? (
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} unit="%" />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 8, fontSize: 12 }}
                    formatter={(v: any, _: any, props: any) => [
                      `${v}%`, `Avg Improvement (${props?.payload?.count || 0} recs)`,
                    ]}
                  />
                  <Bar dataKey="improvement" name="Avg Improvement %" fill="var(--accent-green)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              <div style={{ textAlign: 'center' }}>
                <LightBulbIcon style={{ width: 36, height: 36, margin: '0 auto 10px', opacity: 0.2 }} />
                <div>No optimizations yet — click Generate to start</div>
              </div>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: 'Total Recommendations', value: opts.length, color: 'var(--accent-blue)' },
            { label: 'Avg Improvement', value: `${avgImprovement}%`, color: 'var(--accent-green)' },
            { label: 'High Risk Items', value: opts.filter(o => o.risk_level === 'high').length, color: 'var(--accent-red)' },
            { label: 'Ready to Apply', value: opts.filter(o => o.status === 'proposed').length, color: 'var(--accent-amber)' },
          ].map(s => (
            <div key={s.label} className="tg-card" style={{ padding: '10px 14px', flex: 1 }}>
              <div className="section-label" style={{ marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-mono)', color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom: List + Detail ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 14, minHeight: 280 }}>

        {/* List */}
        <div className="tg-card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Sub Tab Bar */}
          <div style={{ borderBottom: '1px solid var(--border-subtle)', display: 'flex', background: 'var(--bg-surface)' }}>
            {(['proposed', 'approved', 'rejected'] as const).map(st => {
              const labelMap = { proposed: '💡 Proposed', approved: '✅ Approved', rejected: '❌ Rejected' };
              const colorMap = { proposed: 'var(--accent-amber)', approved: 'var(--accent-green)', rejected: 'var(--accent-red)' };
              const active = statusTab === st;
              const count = categoryFiltered.filter(o => o.status === st).length;
              return (
                <button
                  key={st}
                  onClick={() => setStatusTab(st)}
                  style={{
                    flex: 1, padding: '10px 4px', fontSize: 10, fontWeight: 700,
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    borderBottom: active ? `2px solid ${colorMap[st]}` : '2px solid transparent',
                    color: active ? colorMap[st] : 'var(--text-muted)',
                    transition: 'all 150ms',
                  }}
                >
                  {labelMap[st]}
                  <span style={{
                    marginLeft: 4, padding: '1px 5px', borderRadius: 9999, fontSize: 9,
                    background: active ? `${colorMap[st]}20` : 'var(--bg-elevated)',
                    color: active ? colorMap[st] : 'var(--text-muted)',
                  }}>{count}</span>
                </button>
              );
            })}
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: 8, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {loading && (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                <ArrowPathIcon style={{ width: 20, height: 20, margin: '0 auto 8px', animation: 'spin 1.2s linear infinite' }} />
                Loading…
              </div>
            )}
            {!loading && finalFiltered.length === 0 && (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                <LightBulbIcon style={{ width: 28, height: 28, margin: '0 auto 8px', opacity: 0.2 }} />
                <div>No {statusTab} {tab === 'all' ? '' : tab + ' '}recs</div>
                <div style={{ marginTop: 6, fontSize: 11, opacity: 0.6 }}>Click "Generate AI Optimizations" above</div>
              </div>
            )}
            {finalFiltered.map((o, i) => {
              const isSelected = selected?.id === o.id;
              const catColor = CAT_COLORS[o.category] || 'var(--accent-blue)';
              const impPct = o.improvement_pct || 0;
              return (
                <div
                  key={o.id || i}
                  onClick={() => setSelected(o)}
                  className="animate-fade-in"
                  style={{
                    padding: '9px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                    background: isSelected ? 'rgba(59,130,246,0.08)' : 'transparent',
                    border: isSelected ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
                    transition: 'all 150ms ease-out',
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-surface)'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: catColor, flexShrink: 0 }} />
                    <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: catColor, textTransform: 'uppercase', fontWeight: 600 }}>{o.category}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)', marginLeft: 'auto', color: impPct > 0 ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                      {impPct > 0 ? `+${impPct.toFixed(1)}%` : '—'}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {o.title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="tg-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {!selected ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <div style={{ textAlign: 'center' }}>
                <LightBulbIcon style={{ width: 40, height: 40, margin: '0 auto 12px', opacity: 0.2 }} />
                <div style={{ fontSize: 14 }}>Select a recommendation to view details</div>
              </div>
            </div>
          ) : (
            <div style={{ overflow: 'auto' }}>

              {/* Header */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: 9999, fontSize: 10, fontWeight: 700,
                    fontFamily: 'var(--font-mono)', textTransform: 'uppercase',
                    background: `${CAT_COLORS[selected.category] || '#3B82F6'}20`,
                    color: CAT_COLORS[selected.category] || 'var(--accent-blue)',
                    border: `1px solid ${CAT_COLORS[selected.category] || '#3B82F6'}40`,
                  }}>{selected.category}</span>
                  {selected.risk_level && (
                    <span className={`badge ${RISK_BADGE[selected.risk_level] || 'badge-minor'}`}>
                      {selected.risk_level} risk
                    </span>
                  )}
                  {selected.rollback_available && (
                    <span className="badge badge-success">rollback available</span>
                  )}
                  {selected.confidence && (
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginLeft: 'auto' }}>
                      confidence: {Math.round((selected.confidence || 0) * 100)}%
                    </span>
                  )}
                </div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: 8 }}>
                  {selected.title}
                </h2>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {selected.status === 'approved' || selected.status === 'rejected' ? (
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 6, textTransform: 'uppercase',
                      background: selected.status === 'approved' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                      color: selected.status === 'approved' ? 'var(--accent-green)' : 'var(--accent-red)',
                    }}>{selected.status}</span>
                  ) : (
                    <>
                      <button onClick={() => handleDecision('approved')} className="btn btn-ghost"
                        style={{ fontSize: 11, padding: '4px 10px', color: 'var(--accent-green)', border: '1px solid rgba(34,197,94,0.3)' }}>
                        <HandThumbUpIcon style={{ width: 13, height: 13 }} /> Approve
                      </button>
                      <button onClick={() => handleDecision('rejected')} className="btn btn-ghost"
                        style={{ fontSize: 11, padding: '4px 10px', color: 'var(--accent-red)', border: '1px solid rgba(239,68,68,0.3)' }}>
                        <HandThumbDownIcon style={{ width: 13, height: 13 }} /> Reject
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Metrics row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
                {[
                  { label: 'Current', value: selected.current_value, color: 'var(--text-secondary)' },
                  { label: 'Projected', value: selected.projected_value, color: 'var(--accent-green)' },
                  {
                    label: 'Improvement',
                    value: (selected.improvement_pct || 0) > 0
                      ? `+${(selected.improvement_pct || 0).toFixed(1)}%`
                      : '—',
                    color: 'var(--accent-green)',
                  },
                ].map(m => (
                  <div key={m.label} style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', textAlign: 'center' }}>
                    <div className="section-label" style={{ marginBottom: 4 }}>{m.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-mono)', color: m.color }}>{m.value || '—'}</div>
                  </div>
                ))}
              </div>

              {/* AI Analysis */}
              {selected.description && (
                <div style={{ marginBottom: 14 }}>
                  <div className="section-label" style={{ marginBottom: 6 }}>AI Analysis</div>
                  <div style={{
                    padding: '12px 14px', borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                    fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.65,
                    maxHeight: 130, overflow: 'auto',
                  }}>
                    {selected.description}
                  </div>
                </div>
              )}

              {/* Impact Assessment */}
              {selected.impact && Object.keys(selected.impact).length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div className="section-label" style={{ marginBottom: 6 }}>Impact Assessment</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {Object.entries(selected.impact).map(([k, v]: [string, any]) => {
                      const COST_KEYS = ['estimated_capex', 'estimated_opex', 'downtime_hours', 'payback_months'];
                      const isCost = COST_KEYS.includes(k);
                      const isLongText = k === 'network_impact';
                      const ICONS: Record<string, string> = {
                        estimated_capex: '💰', estimated_opex: '📊',
                        downtime_hours: '⏱️', payback_months: '📅',
                        affected_customers: '👥', implementation_time: '🕐',
                        network_impact: '🌐',
                      };
                      const icon = ICONS[k] || '';
                      const displayVal = (() => {
                        if (v === null || v === undefined || v === '' || v === '—') return '—';
                        let s = String(v).trim();
                        if (k === 'estimated_capex' && !s.startsWith('$') && !isNaN(Number(s))) {
                          s = '$' + Number(s).toLocaleString();
                        }
                        if (k === 'estimated_opex' && !s.startsWith('$') && !isNaN(Number(s))) {
                          s = '$' + Number(s).toLocaleString() + '/month';
                        }
                        if (k === 'downtime_hours' && !s.endsWith('h')) {
                          s = `${s}h`;
                        }
                        if (k === 'payback_months' && !s.toLowerCase().includes('month')) {
                          s = `${s} months`;
                        }
                        return s;
                      })();
                      return (
                        <div key={k} style={{
                          display: 'flex',
                          flexDirection: isLongText ? 'column' : 'row',
                          justifyContent: isLongText ? 'flex-start' : 'space-between',
                          alignItems: isLongText ? 'flex-start' : 'center',
                          gap: isLongText ? 6 : 8,
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-sm)',
                          background: isCost ? 'rgba(168,85,247,0.04)' : 'var(--bg-surface)',
                          border: isCost ? '1px solid rgba(168,85,247,0.15)' : '1px solid transparent',
                        }}>
                          <span style={{ fontSize: 10, color: isCost ? 'var(--accent-purple)' : 'var(--text-muted)', textTransform: 'capitalize', fontWeight: isCost ? 600 : 500 }}>
                            {icon && icon + ' '}{k.replace(/_/g, ' ')}
                          </span>
                          <span style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            fontFamily: isLongText ? 'var(--font-sans)' : 'var(--font-mono)',
                            lineHeight: 1.4,
                            textAlign: isLongText ? 'left' : 'right'
                          }}>
                            {displayVal}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Alternative Approaches */}
              {selected.alternatives?.length > 0 && (
                <div>
                  <div className="section-label" style={{ marginBottom: 6 }}>Alternative Approaches</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {selected.alternatives.map((alt: any, i: number) => (
                      <div key={i} style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>#{alt.rank} {alt.title}</span>
                          <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                            +{alt.improvement_pct}%
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <span className={`badge ${RISK_BADGE[alt.risk_level] || 'badge-minor'}`}>{alt.risk_level} risk</span>
                          {alt.reason && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{alt.reason}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
    </div>
  );
}
