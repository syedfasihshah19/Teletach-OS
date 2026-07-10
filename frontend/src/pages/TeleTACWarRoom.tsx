import { useEffect, useState, useRef } from 'react';
import { incidentApi } from '../services/api';
import {
  BoltIcon, ArrowPathIcon, CheckCircleIcon,
  ChevronDownIcon, ClockIcon,
} from '@heroicons/react/24/outline';
import { IncidentSummary, AgentFindings, ConsensusPanel, HistoricalCases, AffectedNetwork, RCAReport } from './WarRoomSections';

interface Incident {
  id: string; title: string; description: string; severity: string;
  status: string; affected_region: string; affected_nodes: string[];
  source_alarm_ids?: string[];
  agent_findings?: any[]; consensus?: any; timeline?: any[];
  similar_cases?: any[]; affected_network?: any; rca_report?: string | null;
}

export default function TeleTACWarRoom() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selected, setSelected] = useState<Incident | null>(null);
  const [investigating, setInvestigating] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const loadingIntervalRef = useRef<any>(null);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    incidentApi.list().then(setIncidents).catch(() => {});
  }, []);

  const runInvestigation = async () => {
    if (!selected) return;
    setInvestigating(true);
    setLoadingStep(0);
    let step = 0;
    loadingIntervalRef.current = setInterval(() => {
      step = Math.min(step + 1, 5);
      setLoadingStep(step);
    }, 2000);
    try {
      const result = await incidentApi.investigate(selected.id);
      setSelected(result);
      setIncidents(prev => prev.map(i => i.id === result.id ? result : i));
    } catch (e) { console.error(e); }
    clearInterval(loadingIntervalRef.current);
    setInvestigating(false);
    setLoadingStep(0);
  };

  const sevColor = (s: string) => s === 'critical' ? 'var(--accent-red)' : s === 'major' ? 'var(--accent-amber)' : 'var(--accent-blue)';
  const isInvestigated = (inc: Incident) => !!(inc.agent_findings && inc.agent_findings.length > 0);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '320px 1fr', gap: 16, height: isMobile ? 'auto' : '100%', minHeight: 0 }}>
      {/* Left: Incident List */}
      <div className="tg-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0, maxHeight: isMobile ? 320 : undefined }}>
        <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <BoltIcon style={{ width: 14, height: 14, color: 'var(--accent-red)' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Incidents</span>
          <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 9999, background: 'rgba(239,68,68,0.1)', color: 'var(--accent-red)', fontWeight: 700, marginLeft: 'auto' }}>{incidents.length}</span>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {incidents.length === 0 && (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, opacity: 0.6 }}>No incidents</div>
          )}
          {incidents.map(inc => {
            const investigated = isInvestigated(inc);
            return (
              <div key={inc.id} onClick={() => setSelected(inc)}
                style={{
                  padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                  background: selected?.id === inc.id ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                  border: selected?.id === inc.id ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
                  cursor: 'pointer', transition: 'all 150ms ease-out',
                }}
                onMouseEnter={e => { if (selected?.id !== inc.id) e.currentTarget.style.background = 'var(--bg-surface)'; }}
                onMouseLeave={e => { if (selected?.id !== inc.id) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: sevColor(inc.severity), flexShrink: 0 }} />
                  <span className={`badge badge-${inc.severity}`}>{inc.severity}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginLeft: 'auto' }}>{inc.id}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.3 }}>{inc.title}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5 }}>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{inc.affected_region}</span>
                  {investigated
                    ? <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 9999, background: 'rgba(34,197,94,0.1)', color: 'var(--accent-green)' }}>INVESTIGATED</span>
                    : <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 9999, background: 'rgba(239,68,68,0.08)', color: 'var(--accent-red)' }}>PENDING</span>
                  }
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Investigation Panel */}
      <div className="tg-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0, minHeight: 0, height: isMobile ? 'auto' : '100%' }}>
        {!selected ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <div style={{ textAlign: 'center' }}>
              <BoltIcon style={{ width: 40, height: 40, margin: '0 auto 12px', opacity: 0.3 }} />
              <div style={{ fontSize: 14 }}>Select an incident to investigate</div>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span className={`badge badge-${selected.severity}`}>{selected.severity}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{selected.id}</span>
                </div>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{selected.title}</h2>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{selected.description}</p>
              </div>
              {!isInvestigated(selected) && (
                <button onClick={runInvestigation} disabled={investigating} className="btn btn-primary"
                  style={{ opacity: investigating ? 0.7 : 1, pointerEvents: investigating ? 'none' : 'auto', flexShrink: 0 }}>
                  {investigating ? (
                    <><ArrowPathIcon style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} /> Investigating...</>
                  ) : (
                    <><BoltIcon style={{ width: 14, height: 14 }} /> Run Investigation</>
                  )}
                </button>
              )}
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: 16, display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
              {/* Loading Animation */}
              {investigating && !selected.agent_findings?.length && (
                <div style={{ padding: '32px 24px', color: 'var(--text-muted)' }}>
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Investigating Incident</span>
                      <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--accent-blue)' }}>
                        {loadingStep <= 1 ? 'Collecting...' : loadingStep <= 3 ? 'Analyzing...' : loadingStep <= 4 ? 'Generating Report...' : 'Finalizing...'}
                      </span>
                    </div>
                    <div style={{ height: 4, borderRadius: 2, background: 'var(--bg-elevated)', overflow: 'hidden', position: 'relative' }}>
                      <div style={{
                        height: '100%', borderRadius: 2,
                        background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-purple))',
                        width: `${Math.min((loadingStep + 1) * 18, 95)}%`,
                        transition: 'width 1.8s cubic-bezier(0.4, 0, 0.2, 1)',
                      }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {[
                      { label: 'Collecting Data', icon: '📡' },
                      { label: 'Running AI Agents', icon: '🤖' },
                      { label: 'Building Consensus', icon: '🔗' },
                      { label: 'Generating Report', icon: '📄' },
                      { label: 'Finalizing', icon: '✅' },
                    ].map((s, i) => (
                      <div key={i} style={{
                        flex: 1, padding: '8px 6px', borderRadius: 'var(--radius-sm)',
                        background: loadingStep >= i ? 'rgba(59, 130, 246, 0.06)' : 'transparent',
                        border: loadingStep >= i ? '1px solid rgba(59, 130, 246, 0.15)' : '1px solid var(--border-subtle)',
                        textAlign: 'center', transition: 'all 400ms ease-out', opacity: loadingStep >= i ? 1 : 0.4,
                      }}>
                        <div style={{ fontSize: 16, marginBottom: 4 }}>{s.icon}</div>
                        <div style={{ fontSize: 10, fontWeight: 600, color: loadingStep >= i ? 'var(--accent-blue)' : 'var(--text-muted)' }}>{s.label}</div>
                        {loadingStep === i && <ArrowPathIcon style={{ width: 10, height: 10, margin: '4px auto 0', color: 'var(--accent-blue)', animation: 'spin 1s linear infinite' }} />}
                        {loadingStep > i && <CheckCircleIcon style={{ width: 10, height: 10, margin: '4px auto 0', color: 'var(--accent-green)' }} />}
                      </div>
                    ))}
                  </div>
                  <div style={{ textAlign: 'center', marginTop: 14, fontSize: 11, color: 'var(--text-muted)' }}>
                    Running multi-agent parallel analysis...
                  </div>
                </div>
              )}

              {/* ── 1. Incident Summary (always shown) ── */}
              {!investigating && <IncidentSummary incident={selected} />}

              {/* ── 2. Agent Findings ── */}
              {selected.agent_findings && selected.agent_findings.length > 0 && (
                <AgentFindings findings={selected.agent_findings} />
              )}

              {/* ── 3. Consensus Panel ── */}
              {selected.consensus && (
                <ConsensusPanel consensus={selected.consensus} findings={selected.agent_findings || []} />
              )}

              {/* ── 4. Historical Similar Cases ── */}
              {selected.similar_cases && selected.similar_cases.length > 0 && (
                <HistoricalCases cases={selected.similar_cases} />
              )}

              {/* ── 5. Affected Network ── */}
              {selected.affected_network && (
                <AffectedNetwork network={selected.affected_network} />
              )}

              {/* ── 6. Auto RCA Report ── */}
              {selected.rca_report && (
                <RCAReport report={selected.rca_report} />
              )}

              {/* ── 7. Investigation Timeline (collapsed by default) ── */}
              {selected.timeline && selected.timeline.length > 0 && (
                <div style={{ borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                  <div onClick={() => setShowTimeline(!showTimeline)}
                    style={{ padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <ClockIcon style={{ width: 14, height: 14, color: 'var(--accent-purple)' }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Investigation Timeline</span>
                    </div>
                    <ChevronDownIcon style={{ width: 14, height: 14, color: 'var(--text-muted)', transform: showTimeline ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }} />
                  </div>
                  {showTimeline && (
                    <div style={{ padding: '8px 14px 14px', borderTop: '1px solid var(--border-subtle)' }}>
                      {selected.timeline.map((t: any, i: number) => (
                        <div key={i} style={{ display: 'flex', gap: 10 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20 }}>
                            <div style={{
                              width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                              background: t.status === 'complete' ? 'var(--accent-green)' : t.status === 'failed' ? 'var(--accent-red)' : t.status === 'info' ? 'var(--accent-purple)' : 'var(--accent-blue)',
                              border: '2px solid var(--bg-primary)',
                            }} />
                            {i < selected.timeline!.length - 1 && <div style={{ width: 2, flex: 1, background: 'var(--border-subtle)', minHeight: 20 }} />}
                          </div>
                          <div style={{ flex: 1, paddingBottom: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{t.agent_name}</span>
                              {t.duration_ms > 0 && <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{t.duration_ms}ms</span>}
                              {t.tokens_used > 0 && <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{t.tokens_used} tok</span>}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{t.event}</div>
                          </div>
                          <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                            {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
