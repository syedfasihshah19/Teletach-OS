// TeleGenesis OS - TypeScript Type Definitions

// ─── Network & Topology ───
export interface NetworkNode {
  id: string;
  name: string;
  type: 'data_center' | 'core_router' | 'aggregation_switch' | 'cell_tower' | 'bsc' | 'rnc' | 'msc';
  region: string;
  status: 'operational' | 'degraded' | 'down' | 'maintenance';
  lat: number;
  lng: number;
  metadata: Record<string, unknown>;
}

export interface NetworkLink {
  id: string;
  source_id: string;
  target_id: string;
  capacity_gbps: number;
  utilization_pct: number;
  latency_ms: number;
  status: 'active' | 'degraded' | 'down';
}

export interface NetworkTopology {
  nodes: NetworkNode[];
  links: NetworkLink[];
}

// ─── KPIs ───
export interface KPIData {
  id: string;
  name: string;
  category: 'performance' | 'availability' | 'traffic' | 'quality';
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trend_pct: number;
  status: 'normal' | 'warning' | 'critical';
  timestamp: string;
  history: KPIDataPoint[];
}

export interface KPIDataPoint {
  timestamp: string;
  value: number;
}

// ─── Alarms ───
export interface Alarm {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'major' | 'minor' | 'warning';
  source: string;
  node_id: string;
  region: string;
  category: string;
  acknowledged: boolean;
  timestamp: string;
  cleared_at?: string;
}

// ─── Incidents ───
export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'major' | 'minor';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  affected_nodes: string[];
  affected_region: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  alarms: Alarm[];
  agent_findings: AgentFinding[];
  consensus?: ConsensusResult;
  rca_report?: RCAReport;
}

// ─── AI Agents ───
export type AgentType =
  | 'orchestrator' | 'performance' | 'incident_investigation'
  | 'alarm_correlation' | 'log_analysis' | 'configuration'
  | 'security' | 'customer_experience' | 'cost_optimization'
  | 'energy_optimization' | 'capacity_planning' | 'traffic_engineering'
  | 'simulation' | 'knowledge' | 'consensus' | 'reporting';

export type AgentStatus = 'idle' | 'active' | 'completed' | 'error';

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  description: string;
  last_active: string;
  tasks_completed: number;
  avg_response_time_ms: number;
}

export interface AgentFinding {
  agent_type: AgentType;
  agent_name: string;
  finding: string;
  confidence: number;
  evidence: string[];
  recommendations: string[];
  timestamp: string;
  tokens_used: number;
}

export interface AgentActivity {
  id: string;
  agent_type: AgentType;
  agent_name: string;
  action: string;
  detail: string;
  incident_id?: string;
  timestamp: string;
  duration_ms: number;
  tokens_used: number;
}

// ─── Consensus ───
export interface ConsensusResult {
  root_cause: string;
  confidence: number;
  contributing_factors: string[];
  recommended_actions: ActionItem[];
  dissenting_opinions: string[];
  risk_assessment: string;
  estimated_impact: string;
  timestamp: string;
}

export interface ActionItem {
  action: string;
  priority: 'immediate' | 'high' | 'medium' | 'low';
  estimated_impact: string;
  requires_simulation: boolean;
}

// ─── Simulation / Digital Twin ───
export type ScenarioType = 'congestion_spike' | 'tower_outage' | 'weather_event' | 'traffic_reroute' | 'capacity_upgrade';

export interface SimulationScenario {
  type: ScenarioType;
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface SimulationResult {
  id: string;
  scenario: SimulationScenario;
  status: 'pending' | 'running' | 'completed' | 'failed';
  before_metrics: SimulationMetrics;
  after_metrics: SimulationMetrics;
  improvement_pct: Record<string, number>;
  recommendations: string[];
  created_at: string;
  completed_at?: string;
}

export interface SimulationMetrics {
  avg_latency_ms: number;
  throughput_gbps: number;
  packet_loss_pct: number;
  congestion_pct: number;
  availability_pct: number;
  qoe_score: number;
  cost_per_gb: number;
}

// ─── Traffic Engineering ───
export interface TrafficFlow {
  id: string;
  source_node: string;
  destination_node: string;
  bandwidth_gbps: number;
  utilization_pct: number;
  latency_ms: number;
  packet_loss_pct: number;
  protocol: string;
  priority: 'high' | 'medium' | 'low';
}

export interface CongestionPoint {
  node_id: string;
  link_id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  utilization_pct: number;
  affected_flows: number;
  recommended_action: string;
}

// ─── Reports ───
export interface RCAReport {
  id: string;
  incident_id: string;
  title: string;
  executive_summary: string;
  root_cause_analysis: string;
  timeline: TimelineEntry[];
  affected_services: string[];
  action_items: ActionItem[];
  lessons_learned: string[];
  created_at: string;
}

export interface TimelineEntry {
  timestamp: string;
  event: string;
  source: string;
}

export interface Report {
  id: string;
  type: 'rca' | 'optimization' | 'executive_summary' | 'capacity_plan';
  title: string;
  summary: string;
  content: string;
  created_at: string;
  incident_id?: string;
}

// ─── Optimization ───
export interface Optimization {
  id: string;
  category: 'routing' | 'capacity' | 'bandwidth' | 'energy' | 'cost';
  title: string;
  description: string;
  current_value: string;
  projected_value: string;
  improvement_pct: number;
  status: 'proposed' | 'simulated' | 'approved' | 'applied';
  simulation_id?: string;
  created_at: string;
}

// ─── Dashboard ───
export interface DashboardData {
  health_score: number;
  kpis: KPIData[];
  recent_alarms: Alarm[];
  active_incidents: Incident[];
  agent_summary: AgentSummary;
  traffic_summary: TrafficSummary;
}

export interface AgentSummary {
  total_agents: number;
  active_agents: number;
  tasks_today: number;
  avg_response_time_ms: number;
}

export interface TrafficSummary {
  total_throughput_gbps: number;
  peak_utilization_pct: number;
  congestion_points: number;
  active_flows: number;
}

// ─── WebSocket Events ───
export interface WSEvent {
  type: 'alarm' | 'kpi_update' | 'agent_activity' | 'incident_update' | 'simulation_progress';
  data: unknown;
  timestamp: string;
}
