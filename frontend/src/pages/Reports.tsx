import { useEffect, useState, useCallback, useRef } from 'react';
import { reportApi, reportGenerateApi } from '../services/api';
import {
  DocumentTextIcon, SparklesIcon, ArrowDownTrayIcon,
  ArrowPathIcon, FunnelIcon, ClockIcon, CheckCircleIcon,
  PrinterIcon, ChevronDownIcon,
} from '@heroicons/react/24/outline';

interface Report {
  id: string;
  type: string;
  title: string;
  summary: string;
  content: string;
  incident_id?: string;
  created_at?: string;
}

const REPORT_TYPES = [
  { key: 'executive_summary', label: 'Executive Summary', badge: 'badge-success', desc: 'High-level network status overview' },
  { key: 'performance',       label: 'Performance Analysis', badge: 'badge-minor', desc: 'KPI deep-dive & SLA compliance' },
  { key: 'capacity',          label: 'Capacity Planning', badge: 'badge-major', desc: 'Utilization & growth projections' },
  { key: 'security',          label: 'Security Assessment', badge: 'badge-critical', desc: 'Threat indicators & risk assessment' },
  { key: 'traffic',           label: 'Traffic Intelligence', badge: 'badge-success', desc: 'Flow analysis & routing efficiency' },
  { key: 'rca',               label: 'Root Cause Analysis', badge: 'badge-critical', desc: 'Incident RCA & corrective actions' },
];

const TYPE_LABELS: Record<string, { label: string; badge: string }> = Object.fromEntries(
  REPORT_TYPES.map(t => [t.key, { label: t.label.split(' ')[0], badge: t.badge }])
);

function getMeta(type: string) {
  return TYPE_LABELS[type] ?? { label: type, badge: 'badge-minor' };
}

function formatDate(iso?: string) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
}

/** Lightweight markdown-to-HTML renderer with table + numbered list support. */
function renderMarkdown(md: string): string {
  // Convert markdown tables to HTML tables
  const lines = md.split('\n');
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    // Detect table: line with |, next line is separator |---|
    if (lines[i].trim().startsWith('|') && i + 1 < lines.length && /^\|[\s\-:|]+\|/.test(lines[i + 1].trim())) {
      const headerCells = lines[i].split('|').filter(c => c.trim()).map(c => `<th>${c.trim()}</th>`).join('');
      let table = `<table><thead><tr>${headerCells}</tr></thead><tbody>`;
      i += 2; // skip header + separator
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

export default function Reports() {
  const [reports, setReports]     = useState<Report[]>([]);
  const [selected, setSelected]   = useState<Report | null>(null);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState<string>('all');
  const [genSuccess, setGenSuccess] = useState(false);
  const [genType, setGenType]     = useState('executive_summary');
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const menuRef  = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const data = await reportApi.list();
      setReports(data);
      if (data.length && !selected) setSelected(data[0]);
    } catch { /* backend offline gracefully */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Close dropdown on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowTypeMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const generateReport = async (type: string) => {
    setGenerating(true);
    setGenSuccess(false);
    setShowTypeMenu(false);
    try {
      const r = await reportGenerateApi.generate(type);
      await load();
      if (r?.id) setSelected(r);
      setGenSuccess(true);
      setTimeout(() => setGenSuccess(false), 3000);
    } catch (e) { console.error(e); }
    setGenerating(false);
  };

  const printReport = () => {
    if (!printRef.current || !selected) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>${selected.title}</title>
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
        .badge{display:inline-block;padding:2px 10px;border-radius:99px;font-size:11px;font-weight:600;background:#dbeafe;color:#2563eb}
        .meta{font-size:12px;color:#64748b}
        @media print{body{margin:20px}}
      </style></head><body>
      <div class="header"><div><h1 style="margin:0;border:none;padding:0">${selected.title}</h1>
      <div class="meta">${selected.created_at ? new Date(selected.created_at).toLocaleString() : ''} · ${getMeta(selected.type).label}</div></div>
      <span class="badge">${getMeta(selected.type).label}</span></div>
      ${selected.summary ? '<p style="color:#475569;font-style:italic;margin-bottom:20px">' + selected.summary + '</p>' : ''}
      ${renderMarkdown(selected.content)}
      <div style="margin-top:40px;padding-top:12px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;text-align:center">
        Generated by TeleGenesis AI · ${new Date().toLocaleString()}
      </div></body></html>`);
    w.document.close();
    setTimeout(() => { w.print(); }, 400);
  };

  const downloadReport = () => {
    if (!selected) return;
    const blob = new Blob([selected.content], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${selected.title.replace(/[^a-z0-9]/gi, '_')}.md`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const allFilterKeys = ['all', ...REPORT_TYPES.map(t => t.key)];
  const filtered = filter === 'all' ? reports : reports.filter(r => r.type === filter);
  const typeCounts = reports.reduce<Record<string, number>>((acc, r) => {
    acc[r.type] = (acc[r.type] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, height: 'calc(100vh - 120px)' }}>

      {/* ── Toolbar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, flexWrap: 'wrap' }}>
          <FunnelIcon style={{ width: 14, height: 14, color: 'var(--text-muted)' }} />
          {allFilterKeys.map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              style={{
                padding: '4px 12px',
                borderRadius: 9999,
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                border: filter === t
                  ? '1px solid rgba(59,130,246,0.5)'
                  : '1px solid var(--border-subtle)',
                background: filter === t ? 'rgba(59,130,246,0.12)' : 'transparent',
                color: filter === t ? 'var(--accent-blue)' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 150ms ease-out',
              }}
            >
              {t === 'all' ? `All (${reports.length})` : `${getMeta(t).label} (${typeCounts[t] ?? 0})`}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {selected && (
            <>
              <button onClick={printReport} className="btn btn-ghost" style={{ fontSize: 12, padding: '6px 12px' }}>
                <PrinterIcon style={{ width: 14, height: 14 }} /> Print
              </button>
              <button onClick={downloadReport} className="btn btn-ghost" style={{ fontSize: 12, padding: '6px 12px' }}>
                <ArrowDownTrayIcon style={{ width: 14, height: 14 }} /> Export
              </button>
            </>
          )}
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => generating ? null : setShowTypeMenu(!showTypeMenu)}
              disabled={generating}
              className={`btn ${genSuccess ? 'btn-success' : 'btn-primary'}`}
              style={{
                fontSize: 12, padding: '7px 16px', opacity: generating ? 0.7 : 1,
                display: 'flex', alignItems: 'center', gap: 7,
                background: genSuccess ? undefined : 'linear-gradient(135deg, rgba(59,130,246,0.9), rgba(99,102,241,0.9))',
                border: 'none', borderRadius: 8,
              }}
            >
              {generating ? (
                <><ArrowPathIcon style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} /> Generating…</>
              ) : genSuccess ? (
                <><CheckCircleIcon style={{ width: 14, height: 14 }} /> Generated!</>
              ) : (
                <><SparklesIcon style={{ width: 14, height: 14 }} /> Generate Report <ChevronDownIcon style={{ width: 11, height: 11, transition: 'transform 200ms', transform: showTypeMenu ? 'rotate(180deg)' : 'rotate(0)' }} /></>
              )}
            </button>
            {showTypeMenu && !generating && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 310,
                background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                borderRadius: 10, padding: 8, zIndex: 100,
                boxShadow: '0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
                backdropFilter: 'blur(12px)',
                animation: 'dropIn 150ms ease-out',
              }}>
                <div style={{ padding: '6px 10px 10px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)' }}>
                  Select Report Type
                </div>
                {REPORT_TYPES.map(t => {
                  const colors: Record<string, string> = {
                    executive_summary: '#22c55e', performance: '#f59e0b', capacity: '#8b5cf6',
                    security: '#ef4444', traffic: '#06b6d4', rca: '#f43f5e',
                  };
                  const clr = colors[t.key] || '#3b82f6';
                  return (
                    <button
                      key={t.key}
                      onClick={() => generateReport(t.key)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                        textAlign: 'left', padding: '10px 12px', marginBottom: 2,
                        background: 'transparent', border: 'none', borderRadius: 8,
                        cursor: 'pointer', transition: 'all 120ms ease-out',
                        borderLeft: `3px solid ${clr}`,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = `${clr}12`; e.currentTarget.style.borderLeftColor = clr; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <SparklesIcon style={{ width: 16, height: 16, color: clr, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>{t.label}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.4, marginTop: 1 }}>{t.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Main 2-panel layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 14, flex: 1, minHeight: 0 }}>

        {/* Left: Report List */}
        <div className="tg-card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <DocumentTextIcon style={{ width: 13, height: 13, color: 'var(--text-muted)' }} />
            <span className="section-label">Reports — {filtered.length}</span>
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: 8, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {loading && (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                <ArrowPathIcon style={{ width: 20, height: 20, margin: '0 auto 8px', animation: 'spin 1.2s linear infinite' }} />
                Loading reports…
              </div>
            )}

            {!loading && filtered.length === 0 && (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
                <DocumentTextIcon style={{ width: 32, height: 32, margin: '0 auto 10px', opacity: 0.3 }} />
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>No reports yet</div>
                <div style={{ fontSize: 11, lineHeight: 1.5 }}>
                  Click <strong style={{ color: 'var(--accent-blue)' }}>Generate AI Report</strong> to create your first executive summary.
                </div>
              </div>
            )}

            {filtered.map(r => {
              const meta = getMeta(r.type);
              const isSelected = selected?.id === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => setSelected(r)}
                  className="animate-fade-in"
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(59,130,246,0.08)' : 'transparent',
                    border: isSelected
                      ? '1px solid rgba(59,130,246,0.3)'
                      : '1px solid transparent',
                    transition: 'all 150ms ease-out',
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-surface)'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                    <span className={`badge ${meta.badge}`}>{meta.label}</span>
                    {r.created_at && (
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <ClockIcon style={{ width: 9, height: 9 }} />
                        {formatDate(r.created_at)}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.35, marginBottom: 3 }}>
                    {r.title}
                  </div>
                  {r.summary && (
                    <div style={{
                      fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4,
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {r.summary}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Report Detail */}
        <div className="tg-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
          {!selected ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <div style={{ textAlign: 'center' }}>
                <DocumentTextIcon style={{ width: 44, height: 44, margin: '0 auto 14px', opacity: 0.2 }} />
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>No report selected</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Select a report from the list or generate a new one</div>
              </div>
            </div>
          ) : (
            <>
              {/* Report header */}
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span className={`badge ${getMeta(selected.type).badge}`}>{getMeta(selected.type).label}</span>
                    {selected.incident_id && (
                      <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        ↳ {selected.incident_id}
                      </span>
                    )}
                    {selected.created_at && (
                      <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <ClockIcon style={{ width: 9, height: 9 }} />
                        {formatDate(selected.created_at)}
                      </span>
                    )}
                  </div>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                    {selected.title}
                  </h2>
                  {selected.summary && (
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: 6 }}>
                      {selected.summary}
                    </p>
                  )}
                </div>
                <button onClick={downloadReport} className="btn btn-ghost" style={{ fontSize: 11, padding: '5px 10px', flexShrink: 0 }}>
                  <ArrowDownTrayIcon style={{ width: 13, height: 13 }} />
                  Export
                </button>
              </div>

              {/* Report content — rendered markdown */}
              <div ref={printRef} style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>
                {selected.content ? (
                  <div
                    className="report-content"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(selected.content) }}
                    style={{
                      fontSize: 13,
                      color: 'var(--text-secondary)',
                      lineHeight: 1.75,
                      fontFamily: 'var(--font-sans)',
                    }}
                  />
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: 13, fontStyle: 'italic' }}>
                    No content available for this report.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Inline styles for markdown rendering + spin animation */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes dropIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }

        .report-content h1 {
          font-size: 18px; font-weight: 700; color: var(--text-primary);
          margin: 20px 0 10px; padding-bottom: 8px;
          border-bottom: 1px solid var(--border-subtle);
        }
        .report-content h2 {
          font-size: 15px; font-weight: 700; color: var(--text-primary);
          margin: 18px 0 8px; letter-spacing: -0.01em;
        }
        .report-content h3 {
          font-size: 13px; font-weight: 600; color: var(--accent-blue);
          margin: 14px 0 6px; text-transform: uppercase;
          font-family: var(--font-mono); letter-spacing: 0.06em; font-size: 11px;
        }
        .report-content strong { color: var(--text-primary); font-weight: 600; }
        .report-content em { color: var(--accent-amber); font-style: italic; }
        .report-content code {
          font-family: var(--font-mono); font-size: 11px;
          background: var(--bg-surface); border: 1px solid var(--border-subtle);
          padding: 1px 5px; border-radius: 4px; color: var(--accent-cyan);
        }
        .report-content ul {
          list-style: none; padding-left: 0; margin: 8px 0;
          display: flex; flex-direction: column; gap: 4px;
        }
        .report-content li {
          padding: 5px 10px; border-radius: var(--radius-sm);
          background: var(--bg-surface); border: 1px solid var(--border-subtle);
          font-size: 12px; display: flex; align-items: flex-start; gap: 8px;
        }
        .report-content li::before {
          content: '▸'; color: var(--accent-blue); font-size: 10px; flex-shrink: 0; margin-top: 2px;
        }
        .report-content p { margin: 8px 0; }
        .report-content ol {
          list-style: decimal; padding-left: 20px; margin: 8px 0;
          display: flex; flex-direction: column; gap: 4px;
        }
        .report-content ol li {
          padding: 5px 10px; border-radius: var(--radius-sm);
          background: var(--bg-surface); border: 1px solid var(--border-subtle);
          font-size: 12px;
        }
        .report-content ol li::before { content: none; }
        .report-content table {
          width: 100%; border-collapse: collapse; margin: 12px 0;
          font-size: 12px; font-family: var(--font-mono);
        }
        .report-content th {
          text-align: left; padding: 8px 12px; font-weight: 600;
          color: var(--text-primary); background: var(--bg-surface);
          border: 1px solid var(--border-subtle); font-size: 11px;
          text-transform: uppercase; letter-spacing: 0.04em;
        }
        .report-content td {
          padding: 7px 12px; border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
        }
        .report-content tr:hover td { background: rgba(59,130,246,0.04); }
      `}</style>
    </div>
  );
}
