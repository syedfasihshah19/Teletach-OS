import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAppStore } from '../../stores/appStore';

export default function AppLayout() {
  const { sidebarCollapsed, toggleSidebar } = useAppStore();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // On mobile, collapse the sidebar initially by default
  useEffect(() => {
    if (isMobile) {
      useAppStore.setState({ sidebarCollapsed: true });
    }
  }, [isMobile]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', overflowX: 'hidden' }}>
      <Sidebar />
      
      {/* Mobile Sidebar Backdrop */}
      {isMobile && !sidebarCollapsed && (
        <div 
          onClick={toggleSidebar} 
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 45,
            transition: 'opacity 200ms ease-out',
          }} 
        />
      )}

      <div style={{
        marginLeft: isMobile ? 0 : (sidebarCollapsed ? 60 : 220),
        transition: 'margin-left 200ms ease-out',
        display: 'flex', flexDirection: 'column', minHeight: '100vh',
      }}>
        <Header />
        <main style={{ flex: 1, padding: isMobile ? 12 : 20, overflow: 'auto', minHeight: 0 }}>
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
