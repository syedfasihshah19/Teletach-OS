import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BellIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { dashboardApi, searchApi } from '../../services/api';

const titles: Record<string, string> = {
  '/': 'Executive Dashboard',
  '/operations': 'AI Operations Center',
  '/teletac': 'TeleTAC War Room',
  '/digital-twin': 'Digital Twin',
  '/optimization': 'Optimization Studio',
  '/traffic': 'Traffic Intelligence',
  '/topology': 'Network Topology',
  '/agents': 'Agent Activity',
  '/reports': 'Reports',
  '/settings': 'Settings',
};

const pages = Object.entries(titles).map(([path, name]) => ({ path, name }));

const typeIcons: Record<string, string> = {
  incident: '⚠',
  report: '📄',
  agent: '🤖',
  node: '🔗',
  optimization: '⚡',
  memory: '🧠',
  page: '📱',
};

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const title = titles[location.pathname] || 'TeleGenesis OS';

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<any>(null);

  const [notifOpen, setNotifOpen] = useState(false);
  const [alarms, setAlarms] = useState<any[]>([]);

  useEffect(() => {
    dashboardApi.getAlarms(10).then(setAlarms).catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setNotifOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  // Debounced backend search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await searchApi.query(searchQuery);
        setSearchResults(res);
      } catch { setSearchResults(null); }
      setSearching(false);
    }, 300);
  }, [searchQuery]);

  const goTo = (path: string) => {
    navigate(path);
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults(null);
  };

  // Build combined results
  const allResults: any[] = [];
  if (searchResults) {
    (searchResults.incidents || []).forEach((r: any) => allResults.push({ ...r, type: 'incident' }));
    (searchResults.reports || []).forEach((r: any) => allResults.push({ ...r, type: 'report' }));
    (searchResults.optimizations || []).forEach((r: any) => allResults.push({ ...r, type: 'optimization' }));
    (searchResults.agents || []).forEach((r: any) => allResults.push({ ...r, type: 'agent' }));
    (searchResults.nodes || []).forEach((r: any) => allResults.push({ ...r, type: 'node' }));
    (searchResults.memory || []).forEach((r: any) => allResults.push({ ...r, type: 'memory' }));
  }
  // Also filter pages
  const filteredPages = pages.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleResultClick = (item: any) => {
    if (item.type === 'incident') goTo('/teletac');
    else if (item.type === 'report') goTo('/reports');
    else if (item.type === 'optimization') goTo('/optimization');
    else if (item.type === 'agent') goTo('/agents');
    else if (item.type === 'node') goTo('/topology');
    else if (item.type === 'memory') goTo('/teletac');
    else goTo('/');
  };

  const sevColor = (s: string) => s === 'critical' ? '#EF4444' : s === 'major' ? '#F59E0B' : '#3B82F6';

  return (
    <>
      <header style={{
        height: 56, padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-primary)', position: 'sticky', top: 0, zIndex: 40,
      }}>
        <h1 className="page-title">{title}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setSearchOpen(true)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
            color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer',
            fontFamily: 'var(--font-mono)', transition: 'border-color 150ms ease-out',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-muted)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
          >
            <MagnifyingGlassIcon style={{ width: 14, height: 14 }} />
            Search
            <span style={{ fontSize: 11, padding: '1px 5px', borderRadius: 4, background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>⌘K</span>
          </button>

          <button onClick={() => setNotifOpen(!notifOpen)} style={{
            position: 'relative', padding: 8, borderRadius: 'var(--radius-sm)',
            background: notifOpen ? 'var(--bg-surface)' : 'transparent', border: 'none',
            color: 'var(--text-secondary)', cursor: 'pointer', transition: 'color 150ms ease-out',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { if (!notifOpen) e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <BellIcon style={{ width: 18, height: 18 }} />
            {alarms.filter(a => a.severity === 'critical').length > 0 && (
              <span style={{
                position: 'absolute', top: 4, right: 4,
                width: 7, height: 7, borderRadius: '50%',
                background: 'var(--accent-red)', border: '2px solid var(--bg-primary)',
              }} />
            )}
          </button>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '5px 10px', borderRadius: 'var(--radius-sm)',
            background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.2)',
          }}>
            <span className="status-dot status-dot-green" />
            <span style={{ fontSize: 12, color: 'var(--accent-green)', fontFamily: 'var(--font-mono)', fontWeight: 500 }}>Live</span>
          </div>
        </div>
      </header>

      {/* ─── Search Modal ─── */}
      {searchOpen && (
        <div onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults(null); }} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          zIndex: 100, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 120,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            width: 520, background: 'var(--bg-secondary)', border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
              <MagnifyingGlassIcon style={{ width: 18, height: 18, color: 'var(--text-muted)' }} />
              <input ref={searchRef} value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search incidents, reports, agents, nodes..."
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  color: 'var(--text-primary)', fontSize: 15, fontFamily: 'var(--font-sans)',
                }}
              />
              {searching && <span style={{ fontSize: 11, color: 'var(--accent-blue)' }}>Searching...</span>}
              <button onClick={() => { setSearchOpen(false); setSearchQuery(''); }} style={{
                background: 'var(--bg-elevated)', border: 'none', borderRadius: 4,
                padding: '2px 6px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 11,
              }}>ESC</button>
            </div>

            <div style={{ maxHeight: 380, overflow: 'auto' }}>
              {/* Page results */}
              {searchQuery && filteredPages.length > 0 && (
                <div style={{ padding: '6px 16px', fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Pages</div>
              )}
              {searchQuery && filteredPages.map(p => (
                <div key={p.path} onClick={() => goTo(p.path)}
                  style={{ padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'background 150ms ease-out' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-surface)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ fontSize: 12 }}>📱</span>
                  <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{p.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginLeft: 'auto' }}>{p.path}</span>
                </div>
              ))}

              {/* Backend results by category */}
              {searchResults && allResults.length > 0 && (
                <>
                  {['incident', 'report', 'optimization', 'agent', 'node', 'memory'].map(type => {
                    const items = allResults.filter(r => r.type === type);
                    if (items.length === 0) return null;
                    const labels: Record<string, string> = {
                      incident: 'Incidents', report: 'Reports', optimization: 'Optimizations',
                      agent: 'Agents', node: 'Topology Nodes', memory: 'Decision Memory',
                    };
                    return (
                      <div key={type}>
                        <div style={{ padding: '6px 16px', fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, borderTop: '1px solid var(--border-subtle)' }}>
                          {labels[type]} ({items.length})
                        </div>
                        {items.map((item: any, i: number) => (
                          <div key={i} onClick={() => handleResultClick(item)}
                            style={{ padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'background 150ms ease-out' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-surface)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                          >
                            <span style={{ fontSize: 12 }}>{typeIcons[type] || '📌'}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                              {item.severity && <span className={`badge badge-${item.severity}`} style={{ fontSize: 10, marginTop: 2 }}>{item.severity}</span>}
                              {item.status && !item.severity && <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{item.status}</span>}
                            </div>
                            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{item.id?.slice(0, 12)}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </>
              )}

              {searchQuery && !searching && allResults.length === 0 && filteredPages.length === 0 && (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No results found</div>
              )}
              {!searchQuery && (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  Type to search across incidents, reports, agents, and network nodes
                </div>
              )}
            </div>

            {searchResults && (
              <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border-subtle)', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {searchResults.total || 0} results found
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Notification Panel ─── */}
      {notifOpen && (
        <>
          <div onClick={() => setNotifOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 90 }} />
          <div style={{
            position: 'fixed', top: 56, right: 20, width: 360, maxHeight: 440,
            background: 'var(--bg-secondary)', border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)', zIndex: 95, overflow: 'hidden',
            boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
          }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Notifications</span>
              <span className="badge badge-critical">{alarms.filter(a => a.severity === 'critical').length} critical</span>
            </div>
            <div style={{ maxHeight: 360, overflow: 'auto' }}>
              {alarms.map((a, i) => (
                <div key={i} style={{
                  padding: '10px 16px', borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                  cursor: 'pointer', transition: 'background 150ms ease-out',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-surface)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ width: 4, minHeight: 30, borderRadius: 2, background: sevColor(a.severity), flexShrink: 0, marginTop: 2 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>{a.title}</div>
                    <div style={{ display: 'flex', gap: 8, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      <span className={`badge badge-${a.severity}`}>{a.severity}</span>
                      <span>{a.source}</span>
                    </div>
                  </div>
                </div>
              ))}
              {alarms.length === 0 && (
                <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No notifications</div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
