import { create } from 'zustand';
import type { Incident, Alarm, Agent, AgentActivity, KPIData, SimulationResult, WSEvent } from '../types';

interface AppStore {
  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // Command palette
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  // Real-time data
  recentAlarms: Alarm[];
  addAlarm: (alarm: Alarm) => void;
  setAlarms: (alarms: Alarm[]) => void;

  activeIncidents: Incident[];
  setActiveIncidents: (incidents: Incident[]) => void;
  updateIncident: (incident: Incident) => void;

  agents: Agent[];
  setAgents: (agents: Agent[]) => void;

  agentActivities: AgentActivity[];
  addAgentActivity: (activity: AgentActivity) => void;
  setAgentActivities: (activities: AgentActivity[]) => void;

  kpis: KPIData[];
  setKPIs: (kpis: KPIData[]) => void;

  simulations: SimulationResult[];
  setSimulations: (sims: SimulationResult[]) => void;
  addSimulation: (sim: SimulationResult) => void;

  // Health
  healthScore: number;
  setHealthScore: (score: number) => void;

  // Notifications
  notifications: WSEvent[];
  addNotification: (event: WSEvent) => void;
  clearNotifications: () => void;

  // Selected items
  selectedIncidentId: string | null;
  setSelectedIncidentId: (id: string | null) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

  recentAlarms: [],
  addAlarm: (alarm) => set((s) => ({ recentAlarms: [alarm, ...s.recentAlarms].slice(0, 100) })),
  setAlarms: (alarms) => set({ recentAlarms: alarms }),

  activeIncidents: [],
  setActiveIncidents: (incidents) => set({ activeIncidents: incidents }),
  updateIncident: (incident) => set((s) => ({
    activeIncidents: s.activeIncidents.map((i) => (i.id === incident.id ? incident : i)),
  })),

  agents: [],
  setAgents: (agents) => set({ agents }),

  agentActivities: [],
  addAgentActivity: (activity) => set((s) => ({
    agentActivities: [activity, ...s.agentActivities].slice(0, 200),
  })),
  setAgentActivities: (activities) => set({ agentActivities: activities }),

  kpis: [],
  setKPIs: (kpis) => set({ kpis }),

  simulations: [],
  setSimulations: (sims) => set({ simulations: sims }),
  addSimulation: (sim) => set((s) => ({ simulations: [sim, ...s.simulations] })),

  healthScore: 0,
  setHealthScore: (score) => set({ healthScore: score }),

  notifications: [],
  addNotification: (event) => set((s) => ({ notifications: [event, ...s.notifications].slice(0, 50) })),
  clearNotifications: () => set({ notifications: [] }),

  selectedIncidentId: null,
  setSelectedIncidentId: (id) => set({ selectedIncidentId: id }),
}));
