import axios from 'axios';
import type {
  DashboardData, KPIData, Alarm, Incident, Agent, AgentActivity,
  SimulationResult, SimulationScenario, NetworkTopology, Report,
  Optimization, TrafficFlow, CongestionPoint,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ─── Dashboard ───
export const dashboardApi = {
  getData: () => api.get<DashboardData>('/dashboard').then(r => r.data),
  getKPIs: () => api.get<KPIData[]>('/dashboard/kpis').then(r => r.data),
  getAlarms: (limit = 50) => api.get<Alarm[]>(`/dashboard/alarms?limit=${limit}`).then(r => r.data),
  getStats: () => api.get<any>('/dashboard/stats').then(r => r.data),
  getPredictions: () => api.get<any[]>('/dashboard/predictions').then(r => r.data),
  getExtendedKPIs: () => api.get<KPIData[]>('/dashboard/kpis/extended').then(r => r.data),
};

// ─── Incidents ───
export const incidentApi = {
  list: () => api.get<Incident[]>('/incidents').then(r => r.data),
  get: (id: string) => api.get<Incident>(`/incidents/${id}`).then(r => r.data),
  create: (data: { title: string; description: string; severity: string; affected_region: string }) =>
    api.post<Incident>('/incidents', data).then(r => r.data),
  investigate: (id: string) => api.post<any>(`/incidents/${id}/investigate`).then(r => r.data),
  decide: (id: string, actionIndex: number, decision: string, reason?: string) =>
    api.post<any>(`/incidents/${id}/decide`, { action_index: actionIndex, decision, reason }).then(r => r.data),
};

// ─── Agents ───
export const agentApi = {
  list: () => api.get<Agent[]>('/agents').then(r => r.data),
  getActivity: (limit = 100) => api.get<AgentActivity[]>(`/agents/activity?limit=${limit}`).then(r => r.data),
};

// ─── Simulations ───
export const simulationApi = {
  list: () => api.get<SimulationResult[]>('/simulations').then(r => r.data),
  get: (id: string) => api.get<SimulationResult>(`/simulations/${id}`).then(r => r.data),
  run: (scenario: SimulationScenario) => api.post<SimulationResult>('/simulations', scenario).then(r => r.data),
  plan: (question: string) => api.post<any>('/simulations/plan', { question }).then(r => r.data),
};

// ─── Topology ───
export const topologyApi = {
  get: () => api.get<NetworkTopology>('/topology').then(r => r.data),
};

// ─── Reports ───
export const reportApi = {
  list: () => api.get<Report[]>('/reports').then(r => r.data),
  get: (id: string) => api.get<Report>(`/reports/${id}`).then(r => r.data),
};

// ─── Optimizations ───
export const optimizationApi = {
  list: () => api.get<Optimization[]>('/optimizations').then(r => r.data),
  generate: (category: string = 'all') => api.post<any>('/optimizations/generate', { category }).then(r => r.data),
  decide: (id: string, decision: string, reason?: string) =>
    api.post<any>(`/optimizations/${id}/decide`, { decision, reason }).then(r => r.data),
};

// ─── Traffic Engineering ───
export const trafficApi = {
  getFlows: () => api.get<TrafficFlow[]>('/traffic/flows').then(r => r.data),
  getCongestion: () => api.get<CongestionPoint[]>('/traffic/congestion').then(r => r.data),
};

// ─── Search ───
export const searchApi = {
  query: (q: string) => api.get<any>(`/search?q=${encodeURIComponent(q)}`).then(r => r.data),
};

// ─── Report Generation ───
export const reportGenerateApi = {
  generate: (type: string = 'executive_summary') => api.post<any>('/reports/generate', { type }).then(r => r.data),
};

export default api;
