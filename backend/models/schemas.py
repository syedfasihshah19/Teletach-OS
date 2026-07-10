"""Pydantic models for TeleGenesis OS data types."""
from __future__ import annotations
from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field
import uuid


def gen_id(prefix: str = "") -> str:
    return f"{prefix}{uuid.uuid4().hex[:8]}"


# ─── Enums ───
class Severity(str, Enum):
    critical = "critical"
    major = "major"
    minor = "minor"
    warning = "warning"


class IncidentStatus(str, Enum):
    open = "open"
    investigating = "investigating"
    resolved = "resolved"
    closed = "closed"


class AgentStatus(str, Enum):
    idle = "idle"
    active = "active"
    completed = "completed"
    error = "error"


class NodeType(str, Enum):
    data_center = "data_center"
    core_router = "core_router"
    aggregation_switch = "aggregation_switch"
    cell_tower = "cell_tower"
    bsc = "bsc"
    rnc = "rnc"
    msc = "msc"


class NodeStatus(str, Enum):
    operational = "operational"
    degraded = "degraded"
    down = "down"
    maintenance = "maintenance"


class ScenarioType(str, Enum):
    congestion_spike = "congestion_spike"
    tower_outage = "tower_outage"
    weather_event = "weather_event"
    traffic_reroute = "traffic_reroute"
    capacity_upgrade = "capacity_upgrade"


# ─── Network ───
class NetworkNode(BaseModel):
    id: str = Field(default_factory=lambda: gen_id("node-"))
    name: str
    type: NodeType
    region: str
    status: NodeStatus = NodeStatus.operational
    lat: float = 0.0
    lng: float = 0.0
    metadata: dict = Field(default_factory=dict)


class NetworkLink(BaseModel):
    id: str = Field(default_factory=lambda: gen_id("link-"))
    source_id: str
    target_id: str
    capacity_gbps: float
    utilization_pct: float = 0.0
    latency_ms: float = 0.0
    status: str = "active"


class NetworkTopology(BaseModel):
    nodes: list[NetworkNode]
    links: list[NetworkLink]


# ─── KPI ───
class KPIDataPoint(BaseModel):
    timestamp: datetime
    value: float


class KPIData(BaseModel):
    id: str = Field(default_factory=lambda: gen_id("kpi-"))
    name: str
    category: str
    value: float
    unit: str
    trend: str = "stable"
    trend_pct: float = 0.0
    status: str = "normal"
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    history: list[KPIDataPoint] = Field(default_factory=list)


# ─── Alarm ───
class Alarm(BaseModel):
    id: str = Field(default_factory=lambda: gen_id("alm-"))
    title: str
    description: str
    severity: Severity
    source: str
    node_id: str
    region: str
    category: str = "equipment"
    acknowledged: bool = False
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    cleared_at: Optional[datetime] = None


# ─── Agent ───
class AgentFinding(BaseModel):
    agent_type: str
    agent_name: str
    finding: str
    confidence: float
    evidence: list[str] = Field(default_factory=list)
    recommendations: list[str] = Field(default_factory=list)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    tokens_used: int = 0


class AgentActivity(BaseModel):
    id: str = Field(default_factory=lambda: gen_id("act-"))
    agent_type: str
    agent_name: str
    action: str
    detail: str
    incident_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    duration_ms: int = 0
    tokens_used: int = 0
    status: str = "success"
    model_used: str = ""
    workflow_name: str = ""
    workflow_step: int = -1


class Agent(BaseModel):
    id: str
    name: str
    type: str
    status: AgentStatus = AgentStatus.idle
    description: str
    last_active: datetime = Field(default_factory=datetime.utcnow)
    tasks_completed: int = 0
    avg_response_time_ms: float = 0.0


# ─── Consensus ───
class ActionItem(BaseModel):
    action: str
    priority: str = "medium"
    estimated_impact: str = ""
    requires_simulation: bool = False


class ConsensusResult(BaseModel):
    root_cause: str
    confidence: float
    contributing_factors: list[str] = Field(default_factory=list)
    recommended_actions: list[ActionItem] = Field(default_factory=list)
    dissenting_opinions: list[str] = Field(default_factory=list)
    risk_assessment: str = ""
    estimated_impact: str = ""
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# ─── Incident ───
class Incident(BaseModel):
    id: str = Field(default_factory=lambda: gen_id("INC-"))
    title: str
    description: str
    severity: Severity = Severity.major
    status: IncidentStatus = IncidentStatus.open
    affected_nodes: list[str] = Field(default_factory=list)
    affected_region: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    resolved_at: Optional[datetime] = None
    alarms: list[Alarm] = Field(default_factory=list)
    agent_findings: list[AgentFinding] = Field(default_factory=list)
    consensus: Optional[ConsensusResult] = None
    rca_report: Optional[dict] = None


# ─── Simulation ───
class SimulationMetrics(BaseModel):
    avg_latency_ms: float = 0.0
    throughput_gbps: float = 0.0
    packet_loss_pct: float = 0.0
    congestion_pct: float = 0.0
    availability_pct: float = 0.0
    qoe_score: float = 0.0
    cost_per_gb: float = 0.0


class SimulationScenario(BaseModel):
    type: ScenarioType
    name: str = ""
    description: str = ""
    parameters: dict = Field(default_factory=dict)


class SimulationResult(BaseModel):
    id: str = Field(default_factory=lambda: gen_id("sim-"))
    scenario: SimulationScenario
    status: str = "pending"
    before_metrics: SimulationMetrics = Field(default_factory=SimulationMetrics)
    after_metrics: SimulationMetrics = Field(default_factory=SimulationMetrics)
    improvement_pct: dict = Field(default_factory=dict)
    recommendations: list = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    # AI analysis fields
    ai_analysis: str = ""
    risk_assessment: str = ""
    rollback_plan: str = ""
    confidence: float = 0.0
    customer_impact: str = ""
    strategies: list = Field(default_factory=list)
    best_strategy: str = ""


# ─── Traffic ───
class TrafficFlow(BaseModel):
    id: str = Field(default_factory=lambda: gen_id("flow-"))
    source_node: str
    destination_node: str
    bandwidth_gbps: float
    utilization_pct: float
    latency_ms: float
    packet_loss_pct: float = 0.0
    protocol: str = "IP"
    priority: str = "medium"


class CongestionPoint(BaseModel):
    node_id: str
    link_id: str
    severity: str
    utilization_pct: float
    affected_flows: int
    recommended_action: str


# ─── Reports ───
class Report(BaseModel):
    id: str = Field(default_factory=lambda: gen_id("rpt-"))
    type: str
    title: str
    summary: str
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    incident_id: Optional[str] = None


# ─── Optimization ───
class Optimization(BaseModel):
    id: str = Field(default_factory=lambda: gen_id("opt-"))
    category: str
    title: str
    description: str
    current_value: str
    projected_value: str
    improvement_pct: float
    status: str = "proposed"
    simulation_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ─── Dashboard ───
class AgentSummary(BaseModel):
    total_agents: int = 16
    active_agents: int = 0
    tasks_today: int = 0
    avg_response_time_ms: float = 0.0


class TrafficSummary(BaseModel):
    total_throughput_gbps: float = 0.0
    peak_utilization_pct: float = 0.0
    congestion_points: int = 0
    active_flows: int = 0


class DashboardData(BaseModel):
    health_score: int = 0
    kpis: list[KPIData] = Field(default_factory=list)
    recent_alarms: list[Alarm] = Field(default_factory=list)
    active_incidents: list[Incident] = Field(default_factory=list)
    agent_summary: AgentSummary = Field(default_factory=AgentSummary)
    traffic_summary: TrafficSummary = Field(default_factory=TrafficSummary)
