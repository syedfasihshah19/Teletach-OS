import { ChevronDownIcon, ShieldCheckIcon, SparklesIcon, CheckCircleIcon, ExclamationTriangleIcon, ClockIcon, GlobeAltIcon, DocumentTextIcon, ServerStackIcon, PrinterIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

const S: any = {
  card: { borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', overflow: 'hidden' },
  hdr: { padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 6, borderBottom: '1px solid var(--border-subtle)' },
  label: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.05em', color: 'var(--text-muted)' },
  val: { fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 },
  badge: (c: string) => ({ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: `${c}15`, color: c, fontWeight: 700 }),
  row: { display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px' },
  mono: { fontFamily: 'var(--font-mono)', fontSize: 11 },
};

const sevColor = (s: string) => s === 'critical' ? 'var(--accent-red)' : s === 'major' ? 'var(--accent-amber)' : 'var(--accent-blue)';

/* ── 1. Incident Summary ── */
export function IncidentSummary({ incident }: { incident: any }) {
  if (!incident) return null;
  const items = [
    ['Incident ID', incident.id],
    ['Severity', incident.severity?.toUpperCase()],
    ['Region', incident.affected_region],
    ['Affected Nodes', (incident.affected_nodes || []).join(', ') || 'N/A'],
    ['Correlated Alarms', `${(incident.source_alarm_ids || []).length} alarms`],
    ['Status', incident.status?.toUpperCase()],
  ];
  return (
    <div style={S.card}>
      <div style={{ ...S.hdr, borderBottom: '1px solid var(--border-subtle)' }}>
        <ExclamationTriangleIcon style={{ width: 14, height: 14, color: sevColor(incident.severity) }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Incident Summary</span>
        <span style={{ ...S.badge(sevColor(incident.severity)), marginLeft: 'auto' }}>{incident.severity}</span>
      </div>
      <div style={{ padding: '8px 0' }}>
        {items.map(([k, v], i) => (
          <div key={i} style={{ ...S.row, borderBottom: i < items.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
            <span style={{ ...S.label, width: 130, flexShrink: 0 }}>{k}</span>
            <span style={{ fontSize: 12, color: k === 'Severity' ? sevColor(incident.severity) : 'var(--text-primary)', fontWeight: k === 'Severity' ? 700 : 400, ...(k === 'Incident ID' ? S.mono : {}) }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── 2. Agent Findings ── */
export function AgentFindings({ findings }: { findings: any[] }) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  if (!findings?.length) return null;
  const toggle = (i: number) => { const n = new Set(expanded); n.has(i) ? n.delete(i) : n.add(i); setExpanded(n); };

  return (
    <div style={S.card}>
      <div style={S.hdr}>
        <ShieldCheckIcon style={{ width: 14, height: 14, color: 'var(--accent-blue)' }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Agent Findings</span>
        <span style={{ ...S.badge('var(--accent-blue)'), marginLeft: 'auto' }}>{findings.length} agents</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {findings.map((f, i) => {
          const st = f.structured || {};
          const isOpen = expanded.has(i);
          const conf = typeof f.confidence === 'number' ? (f.confidence < 1 ? f.confidence * 100 : f.confidence) : 70;
          return (
            <div key={i} style={{ borderBottom: i < findings.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
              <div onClick={() => toggle(i)} style={{ padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>{f.agent_name}</span>
                <span style={{ ...S.mono, fontWeight: 700, color: conf >= 85 ? 'var(--accent-green)' : 'var(--accent-amber)' }}>{conf.toFixed(0)}%</span>
                <ChevronDownIcon style={{ width: 12, height: 12, color: 'var(--text-muted)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }} />
              </div>
              <div style={{ padding: '0 14px 8px' }}>
                <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{f.finding}</p>
              </div>
              {isOpen && (
                <div style={{ padding: '8px 14px 12px', borderTop: '1px solid var(--border-subtle)', display: 'grid', gap: 8 }}>
                  {st.root_cause && <Field label="Root Cause" value={st.root_cause} color="var(--accent-red)" />}
                  {st.impact && <Field label="Impact" value={st.impact} color="var(--accent-amber)" />}
                  {f.evidence?.length > 0 && (
                    <div><div style={S.label}>Evidence</div><div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                      {f.evidence.map((e: string, j: number) => <span key={j} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'var(--bg-elevated)', color: 'var(--text-muted)', ...S.mono }}>{e}</span>)}
                    </div></div>
                  )}
                  <Field label="Confidence" value={`${conf.toFixed(0)}%`} color={conf >= 85 ? 'var(--accent-green)' : 'var(--accent-amber)'} />
                  <Field label="Risk" value={st.risk || 'Medium'} color="var(--accent-amber)" />
                  {st.rollback && <Field label="Rollback Plan" value={st.rollback} color="var(--text-muted)" />}
                  {f.recommendations?.length > 0 && (
                    <div><div style={S.label}>Recommendations</div>
                      {f.recommendations.map((r: any, j: number) => <div key={j} style={{ fontSize: 11, color: 'var(--text-secondary)', paddingLeft: 10, borderLeft: '2px solid var(--border-subtle)', marginTop: 4 }}>{formatRecommendation(r)}</div>)}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── 3. Consensus Panel ── */
export function ConsensusPanel({ consensus, findings }: { consensus: any; findings: any[] }) {
  if (!consensus) return null;
  const agreeScore = consensus.agreement_score ?? 0;
  const agreeColor = agreeScore >= 85 ? 'var(--accent-green)' : agreeScore >= 65 ? 'var(--accent-amber)' : 'var(--accent-red)';
  const overallConf = typeof consensus.confidence === 'number' ? (consensus.confidence < 1 ? consensus.confidence * 100 : consensus.confidence) : 85;

  return (
    <div style={{ ...S.card, border: '1px solid rgba(34,197,94,0.25)', background: 'rgba(34,197,94,0.03)' }}>
      <div style={{ ...S.hdr, borderColor: 'rgba(34,197,94,0.15)' }}>
        <SparklesIcon style={{ width: 14, height: 14, color: 'var(--accent-green)' }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-green)' }}>Consensus Panel</span>
        <span style={{ ...S.mono, fontWeight: 700, color: agreeColor, marginLeft: 'auto' }}>{agreeScore}% Agreement</span>
      </div>
      <div style={{ padding: 14, display: 'grid', gap: 10 }}>
        <Field label="Final Root Cause" value={consensus.root_cause} color="var(--text-primary)" large />
        {consensus.impact && <Field label="Impact" value={consensus.impact} color="var(--accent-amber)" />}
        {consensus.contributing_factors?.length > 0 && (
          <div><div style={S.label}>Why Agents Agreed</div>
            <div style={{ marginTop: 4 }}>{consensus.contributing_factors.map((f: string, i: number) => (
              <div key={i} style={{ fontSize: 11, color: 'var(--text-secondary)', paddingLeft: 10, borderLeft: '2px solid var(--accent-green)', marginBottom: 4 }}>{typeof f === 'string' ? f : JSON.stringify(f)}</div>
            ))}</div>
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <StatBox label="Agreement" value={`${agreeScore}%`} color={agreeColor} />
          <StatBox label="Confidence" value={`${overallConf.toFixed(0)}%`} color="var(--accent-blue)" />
          <StatBox label="Risk Level" value={consensus.risk_assessment || 'Medium'} color="var(--accent-amber)" />
        </div>
        {consensus.agent_confidence_breakdown?.length > 0 && (
          <div><div style={S.label}>Agent Confidence Breakdown</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
              {consensus.agent_confidence_breakdown.map((a: any, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)', width: 130, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.agent_name}</span>
                  <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--bg-elevated)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 3, width: `${a.confidence}%`, background: a.confidence >= 85 ? 'var(--accent-green)' : a.confidence >= 60 ? 'var(--accent-amber)' : 'var(--accent-red)', transition: 'width 600ms' }} />
                  </div>
                  <span style={{ ...S.mono, fontWeight: 600, width: 35, textAlign: 'right', color: a.confidence >= 85 ? 'var(--accent-green)' : a.confidence >= 60 ? 'var(--accent-amber)' : 'var(--accent-red)' }}>{a.confidence}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {consensus.needs_human_review && (
          <div style={{ fontSize: 11, padding: '6px 10px', borderRadius: 4, background: 'rgba(239,68,68,0.08)', color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <ExclamationTriangleIcon style={{ width: 12, height: 12 }} /> Human review recommended — agents disagree
          </div>
        )}
        {consensus.recommended_actions?.length > 0 && (
          <div><div style={S.label}>Recommended Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
              {consensus.recommended_actions.map((a: any, i: number) => (
                <div key={i} style={{ padding: '6px 10px', borderRadius: 4, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                  <span style={S.badge(a.priority === 'immediate' ? 'var(--accent-red)' : a.priority === 'high' ? 'var(--accent-amber)' : 'var(--accent-blue)')}>{a.priority}</span>
                  <span style={{ color: 'var(--text-primary)', flex: 1 }}>{a.action}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {consensus.rollback_plan && <Field label="Rollback Plan" value={consensus.rollback_plan} color="var(--text-muted)" />}
      </div>
    </div>
  );
}

/* ── 4. Historical Similar Cases ── */
export function HistoricalCases({ cases }: { cases: any[] }) {
  if (!cases?.length) return null;
  return (
    <div style={S.card}>
      <div style={S.hdr}>
        <ClockIcon style={{ width: 14, height: 14, color: 'var(--accent-purple)' }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Historical Similar Cases</span>
        <span style={{ ...S.badge('var(--accent-purple)'), marginLeft: 'auto' }}>{cases.length} found</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {cases.map((c, i) => (
          <div key={i} style={{ padding: '10px 14px', borderBottom: i < cases.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Similar Incident {i + 1}</span>
              {c.match_score && <span style={{ ...S.mono, fontSize: 10, color: 'var(--accent-purple)' }}>Score: {c.match_score}</span>}
              {c.semantic && <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: 'rgba(139,92,246,0.1)', color: 'var(--accent-purple)' }}>Semantic</span>}
              <span style={{ ...S.badge(c.outcome === 'resolved' ? 'var(--accent-green)' : 'var(--accent-amber)'), marginLeft: 'auto' }}>{c.outcome || 'unknown'}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{c.title}</div>
            {c.summary && <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{c.summary}</div>}
            {c.lessons_learned && <div style={{ fontSize: 11, color: 'var(--accent-blue)', marginTop: 4, fontStyle: 'italic' }}>💡 {c.lessons_learned}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function formatCustomerImpact(impact: any): string {
  if (!impact) return 'None';
  if (typeof impact === 'string') {
    if (impact.trim().startsWith('{')) {
      try {
        return formatCustomerImpact(JSON.parse(impact));
      } catch (e) {
        return impact;
      }
    }
    return impact;
  }
  if (typeof impact === 'object') {
    const parts: string[] = [];
    const subscribers = impact.estimated_subscriber_count ?? impact.affected_subscribers ?? impact.subscribers ?? impact.estimated_subscribers;
    const dropRate = impact.call_drop_rate ?? impact.call_drops;
    const degradation = impact.service_degradation_percent ?? impact.degradation ?? impact.service_degradation;

    if (subscribers !== undefined) {
      const num = typeof subscribers === 'number' ? subscribers.toLocaleString() : subscribers;
      parts.push(`Estimated subscribers affected: ${num}`);
    }
    if (dropRate !== undefined) {
      parts.push(`Call drop rate: ${dropRate}%`);
    }
    if (degradation !== undefined) {
      parts.push(`Service degradation: ${degradation}%`);
    }

    if (parts.length > 0) {
      return parts.join(' | ');
    }
    
    return Object.entries(impact)
      .map(([key, val]) => `${key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}: ${val}`)
      .join(' | ');
  }
  return String(impact);
}

/* ── 5. Affected Network ── */
export function AffectedNetwork({ network }: { network: any }) {
  if (!network) return null;
  return (
    <div style={S.card}>
      <div style={S.hdr}>
        <ServerStackIcon style={{ width: 14, height: 14, color: 'var(--accent-amber)' }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Affected Network</span>
      </div>
      <div style={{ padding: 14, display: 'grid', gap: 8 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <StatBox label="Nodes" value={`${network.node_count}`} color="var(--accent-blue)" />
          <StatBox label="Links" value={`${network.link_count}`} color="var(--accent-blue)" />
        </div>
        <Field label="Region" value={network.region} color="var(--text-primary)" />
        <Field label="Impacted Nodes" value={(network.impacted_nodes || []).join(', ') || 'None'} color="var(--accent-red)" />
        {network.customer_impact && <Field label="Customer Impact" value={formatCustomerImpact(network.customer_impact)} color="var(--accent-amber)" />}
        {network.high_util_links?.length > 0 && (
          <div><div style={S.label}>High Utilization Links</div>
            <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
              {network.high_util_links.map((l: any, i: number) => (
                <div key={i} style={{ fontSize: 11, ...S.mono, color: 'var(--text-secondary)', padding: '3px 8px', borderRadius: 3, background: 'var(--bg-elevated)' }}>
                  {l.source}↔{l.target}: <span style={{ color: l.util_pct > 90 ? 'var(--accent-red)' : 'var(--accent-amber)', fontWeight: 700 }}>{l.util_pct}%</span> of {l.capacity_gbps}G
                </div>
              ))}
            </div>
          </div>
        )}
        {network.congestion_points?.length > 0 && (
          <div><div style={S.label}>Congestion Points</div>
            <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
              {network.congestion_points.map((c: any, i: number) => (
                <div key={i} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 3, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={S.badge(c.severity === 'critical' ? 'var(--accent-red)' : 'var(--accent-amber)')}>{c.severity}</span>
                  <span style={{ color: 'var(--text-secondary)', ...S.mono }}>{c.link}: {c.util_pct}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── 6. Auto RCA Report ── */
export function RCAReport({ report }: { report: string | null }) {
  const [open, setOpen] = useState(true);
  if (!report) return null;
  const sections = parseRCAReport(report);

  const printRCA = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Root Cause Analysis (RCA) Report</title>
      <style>
        body{font-family:'Segoe UI',system-ui,sans-serif;max-width:800px;margin:40px auto;padding:0 24px;color:#1a1a2e;line-height:1.7;font-size:14px}
        h1{font-size:22px;border-bottom:2px solid #3b82f6;padding-bottom:8px;margin:28px 0 14px;color:#0f172a}
        h2{font-size:17px;color:#1e293b;margin:22px 0 10px;border-bottom:1px solid #e2e8f0;padding-bottom:6px}
        h3{font-size:13px;text-transform:uppercase;letter-spacing:0.06em;color:#3b82f6;margin:16px 0 8px}
        strong{color:#0f172a}em{color:#d97706}
        code{font-family:'Cascadia Code',monospace;font-size:12px;background:#f1f5f9;border:1px solid #e2e8f0;padding:1px 5px;border-radius:4px}
        ul{padding-left:20px;margin:10px 0}li{margin:4px 0}
        table{border-collapse:collapse;width:100%;margin:12px 0}th,td{border:1px solid #e2e8f0;padding:8px 12px;text-align:left;font-size:13px}th{background:#f8fafc;font-weight:600}
        .header{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #1e293b;padding-bottom:12px;margin-bottom:24px}
        .badge{display:inline-block;padding:2px 10px;border-radius:99px;font-size:11px;font-weight:600;background:#ef444415;color:#ef4444}
        .meta{font-size:12px;color:#64748b}
        @media print{body{margin:20px}}
      </style></head><body>
      <div class="header"><div><h1 style="margin:0;border:none;padding:0">Root Cause Analysis (RCA) Report</h1>
      <div class="meta">Generated on ${new Date().toLocaleString()}</div></div>
      <span class="badge">RCA</span></div>
      ${renderMarkdown(report)}
      <div style="margin-top:40px;padding-top:12px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;text-align:center">
        Generated by TeleGenesis AI · ${new Date().toLocaleString()}
      </div></body></html>`);
    w.document.close();
    setTimeout(() => { w.print(); }, 400);
  };

  return (
    <div style={S.card}>
      <div onClick={() => setOpen(!open)} style={{ ...S.hdr, cursor: 'pointer' }}>
        <DocumentTextIcon style={{ width: 14, height: 14, color: 'var(--accent-blue)' }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Auto RCA Report</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            printRCA();
          }}
          className="btn btn-ghost"
          style={{
            fontSize: 11,
            padding: '4px 10px',
            marginLeft: 'auto',
            marginRight: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            border: '1px solid var(--border-subtle)',
            borderRadius: 6,
            background: 'transparent',
            color: 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          <PrinterIcon style={{ width: 13, height: 13 }} /> Print
        </button>
        <ChevronDownIcon style={{ width: 12, height: 12, color: 'var(--text-muted)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }} />
      </div>
      {open && (
        <div style={{ padding: 14 }}>
          {sections.length > 0 ? sections.map((s, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              {s.heading && <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-blue)', marginBottom: 4, textTransform: 'uppercase' }}>{s.heading}</div>}
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{s.content}</div>
            </div>
          )) : (
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{report}</div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Helpers ── */
function Field({ label, value, color, large }: { label: string; value: string; color: string; large?: boolean }) {
  return (
    <div>
      <div style={S.label}>{label}</div>
      <div style={{ fontSize: large ? 13 : 11, color, marginTop: 2, lineHeight: 1.5, fontWeight: large ? 600 : 400 }}>{value}</div>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ padding: '8px 10px', borderRadius: 6, background: 'var(--bg-elevated)', textAlign: 'center' }}>
      <div style={{ fontSize: 16, fontWeight: 700, color, ...S.mono }}>{value}</div>
      <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>{label}</div>
    </div>
  );
}

function parseRCAReport(text: string): { heading: string; content: string }[] {
  const lines = text.split('\n');
  const sections: { heading: string; content: string }[] = [];
  let current: { heading: string; content: string } | null = null;
  for (const line of lines) {
    const hMatch = line.match(/^#{1,3}\s+(.+)/) || line.match(/^\*\*(.+)\*\*\s*$/) || line.match(/^([A-Z][A-Z\s]{4,})$/);
    if (hMatch) {
      if (current) sections.push(current);
      current = { heading: hMatch[1].replace(/\*+/g, '').trim(), content: '' };
    } else if (current) {
      current.content += line + '\n';
    } else {
      current = { heading: '', content: line + '\n' };
    }
  }
  if (current) sections.push(current);
  return sections.filter(s => s.content.trim());
}

function renderMarkdown(md: string): string {
  const lines = md.split('\n');
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    if (lines[i].trim().startsWith('|') && i + 1 < lines.length && /^\|[\s\-:|]+\|/.test(lines[i + 1].trim())) {
      const headerCells = lines[i].split('|').filter(c => c.trim()).map(c => `<th>${c.trim()}</th>`).join('');
      let table = `<table><thead><tr>${headerCells}</tr></thead><tbody>`;
      i += 2;
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        const cells = lines[i].split('|').filter(c => c.trim()).map(c => `<td>${c.trim()}</td>`).join('');
        table += `<tr>${cells}</tr>`;
        i++;
      }
      table += '</tbody></table>';
      out.push(table);
    } else {
      out.push(lines[i]);
      i++;
    }
  }

  return out.join('\n')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^\d+\.\s+(.+)$/gm, '<li class="numbered">$1</li>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/((?:<li>.*<\/li>\s*)+)/gs, '<ul>$1</ul>')
    .replace(/((?:<li class="numbered">.*<\/li>\s*)+)/gs, '<ol>$1</ol>')
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/^(.+)$/gm, (line) =>
      /^<[hupolt]/.test(line.trim()) ? line : line)
    .split('\n').join('<br/>');
}

function formatRecommendation(rec: any): string {
  if (!rec) return '';
  if (typeof rec === 'string') {
    if (rec.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(rec);
        return formatRecommendation(parsed);
      } catch (e) {
        return rec;
      }
    }
    return rec;
  }
  if (typeof rec === 'object') {
    return rec.action ?? rec.recommendation ?? rec.description ?? rec.text ?? JSON.stringify(rec);
  }
  return String(rec);
}
