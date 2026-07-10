import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAppStore } from '../../stores/appStore';

export default function AppLayout() {
  const { sidebarCollapsed } = useAppStore();
  const location = useLocation();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar />
      <div style={{
        marginLeft: sidebarCollapsed ? 60 : 220,
        transition: 'margin-left 200ms ease-out',
        display: 'flex', flexDirection: 'column', minHeight: '100vh',
      }}>
        <Header />
        <main style={{ flex: 1, padding: 20, overflow: 'auto', minHeight: 0 }}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{ height: '100%', minHeight: 0 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
