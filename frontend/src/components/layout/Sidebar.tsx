import { NavLink, useLocation } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';
import {
  ChartBarIcon, ShieldExclamationIcon, BoltIcon,
  CpuChipIcon, CubeTransparentIcon, ArrowsPointingOutIcon,
  SignalIcon, UserGroupIcon, DocumentTextIcon, Cog6ToothIcon,
  ChevronLeftIcon, ChevronRightIcon,
} from '@heroicons/react/24/outline';

const nav = [
  { to: '/', icon: ChartBarIcon, label: 'Dashboard' },
  { to: '/operations', icon: ShieldExclamationIcon, label: 'Operations' },
  { to: '/teletac', icon: BoltIcon, label: 'TeleTAC' },
  { to: '/digital-twin', icon: CubeTransparentIcon, label: 'Digital Twin' },
  { to: '/optimization', icon: ArrowsPointingOutIcon, label: 'Optimization' },
  { to: '/traffic', icon: SignalIcon, label: 'Traffic Intel' },
  { to: '/topology', icon: CpuChipIcon, label: 'Topology' },
  { to: '/agents', icon: UserGroupIcon, label: 'Agents' },
  { to: '/reports', icon: DocumentTextIcon, label: 'Reports' },
  { to: '/settings', icon: Cog6ToothIcon, label: 'Settings' },
];

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useAppStore();
  const location = useLocation();

  return (
    <aside
      style={{
        position: 'fixed', top: 0, left: 0, bottom: 0,
        width: sidebarCollapsed ? 60 : 220,
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex', flexDirection: 'column',
        transition: 'width 200ms ease-out',
        zIndex: 50,
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div style={{
        padding: sidebarCollapsed ? '16px 12px' : '16px 16px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', gap: 10,
        minHeight: 56,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{ color: 'white', fontWeight: 700, fontSize: 14, fontFamily: 'var(--font-mono)' }}>TG</span>
        </div>
        {!sidebarCollapsed && (
          <span style={{
            fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 14,
            color: 'var(--text-primary)', whiteSpace: 'nowrap',
          }}>
            TeleGenesis
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '8px 6px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        {nav.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
          return (
            <NavLink
              key={to} to={to}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: sidebarCollapsed ? '10px 14px' : '9px 12px',
                borderRadius: 'var(--radius-sm)',
                color: active ? 'var(--accent-blue)' : 'var(--text-secondary)',
                background: active ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                textDecoration: 'none',
                fontSize: 13, fontWeight: active ? 600 : 400,
                transition: 'all 150ms ease-out',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.background = 'rgba(148, 163, 184, 0.08)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <Icon style={{ width: 18, height: 18, flexShrink: 0 }} />
              {!sidebarCollapsed && label}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={toggleSidebar}
        style={{
          padding: '12px', margin: '8px 6px',
          background: 'transparent', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--text-muted)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 150ms ease-out',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-muted)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
      >
        {sidebarCollapsed
          ? <ChevronRightIcon style={{ width: 16, height: 16 }} />
          : <ChevronLeftIcon style={{ width: 16, height: 16 }} />
        }
      </button>
    </aside>
  );
}
