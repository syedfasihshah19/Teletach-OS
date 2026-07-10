import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppLayout from './components/layout/AppLayout';
import ExecutiveDashboard from './pages/ExecutiveDashboard';
import AIOperationsCenter from './pages/AIOperationsCenter';
import TeleTACWarRoom from './pages/TeleTACWarRoom';
import DigitalTwin from './pages/DigitalTwin';
import OptimizationStudio from './pages/OptimizationStudio';
import TrafficIntelligence from './pages/TrafficIntelligence';
import NetworkTopology from './pages/NetworkTopology';
import AgentActivity from './pages/AgentActivity';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import SplashPage from './components/layout/SplashPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: 1, staleTime: 30000 },
  },
});

export default function App() {
  const [hasEntered, setHasEntered] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      {!hasEntered && <SplashPage onEnter={() => setHasEntered(true)} />}
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<ExecutiveDashboard />} />
            <Route path="/operations" element={<AIOperationsCenter />} />
            <Route path="/teletac" element={<TeleTACWarRoom />} />
            <Route path="/digital-twin" element={<DigitalTwin />} />
            <Route path="/optimization" element={<OptimizationStudio />} />
            <Route path="/traffic" element={<TrafficIntelligence />} />
            <Route path="/topology" element={<NetworkTopology />} />
            <Route path="/agents" element={<AgentActivity />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
