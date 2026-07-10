"""Mock telecom connector — causal failure propagation engine.

Replaces independent random events with realistic telecom failure chains:
root failure → cascading symptoms → KPI degradation → incident generation.
All return types and API contracts are preserved.
"""
import random
import math
import uuid
import time
from datetime import datetime, timedelta
from typing import Optional
from connectors.base import BaseConnector
from models.schemas import (
    Alarm, KPIData, KPIDataPoint, NetworkTopology, NetworkNode, NetworkLink,
    TrafficFlow, CongestionPoint, Severity, NodeType, NodeStatus,
)


# ─── Causal Failure Chain Templates ───

FAILURE_CHAINS = [
    {
        "root": "Fiber attenuation on trunk link",
        "region": "North",
        "affected_link": "l-trunk-ne",
        "cascade": [
            {"delay_min": 0, "alarm": "Fiber attenuation warning on {link}", "sev": Severity.warning, "cat": "transport"},
            {"delay_min": 2, "alarm": "Interface CRC errors on {node} port Gi0/0/1", "sev": Severity.critical, "cat": "equipment"},
            {"delay_min": 3, "alarm": "OSPF adjacency lost on {node}", "sev": Severity.critical, "cat": "protocol"},
            {"delay_min": 5, "alarm": "BGP session flap with peer AS64512", "sev": Severity.major, "cat": "protocol"},
            {"delay_min": 6, "alarm": "Link capacity threshold exceeded on {link}", "sev": Severity.major, "cat": "capacity"},
            {"delay_min": 8, "alarm": "QoS queue overflow on {node}", "sev": Severity.major, "cat": "quality"},
            {"delay_min": 10, "alarm": "Backhaul congestion at {node}", "sev": Severity.critical, "cat": "capacity"},
            {"delay_min": 12, "alarm": "RAN throughput degradation at {ct}", "sev": Severity.major, "cat": "radio"},
            {"delay_min": 14, "alarm": "Packet loss threshold exceeded on {link}", "sev": Severity.critical, "cat": "quality"},
        ],
        "kpi_effects": {"latency": 2.5, "loss": 4.0, "throughput": 0.6, "congestion": 2.0, "availability": 0.997},
    },
    {
        "root": "Power supply failure on core router",
        "region": "South",
        "affected_link": "l-dc-cr-1",
        "cascade": [
            {"delay_min": 0, "alarm": "Power supply redundancy lost on {node}", "sev": Severity.minor, "cat": "power"},
            {"delay_min": 1, "alarm": "Temperature warning on {node}", "sev": Severity.warning, "cat": "environment"},
            {"delay_min": 3, "alarm": "High CPU utilization on {node}", "sev": Severity.major, "cat": "performance"},
            {"delay_min": 4, "alarm": "Memory utilization above 90% on {node}", "sev": Severity.warning, "cat": "performance"},
            {"delay_min": 6, "alarm": "OSPF adjacency lost on {node}", "sev": Severity.critical, "cat": "protocol"},
            {"delay_min": 8, "alarm": "Cell tower signal degradation {ct}", "sev": Severity.minor, "cat": "radio"},
            {"delay_min": 10, "alarm": "Backhaul congestion at {node}", "sev": Severity.critical, "cat": "capacity"},
        ],
        "kpi_effects": {"latency": 1.8, "loss": 3.0, "throughput": 0.75, "congestion": 1.6, "availability": 0.998},
    },
    {
        "root": "DDoS traffic spike on aggregation switch",
        "region": "East",
        "affected_link": "l-cr-agg-2-0",
        "cascade": [
            {"delay_min": 0, "alarm": "Link capacity threshold exceeded on {link}", "sev": Severity.critical, "cat": "capacity"},
            {"delay_min": 1, "alarm": "High CPU utilization on {node}", "sev": Severity.major, "cat": "performance"},
            {"delay_min": 2, "alarm": "QoS queue overflow on {node}", "sev": Severity.major, "cat": "quality"},
            {"delay_min": 4, "alarm": "Packet loss threshold exceeded on {link}", "sev": Severity.critical, "cat": "quality"},
            {"delay_min": 5, "alarm": "RAN throughput degradation at {ct}", "sev": Severity.major, "cat": "radio"},
            {"delay_min": 7, "alarm": "Backhaul congestion at {node}", "sev": Severity.critical, "cat": "capacity"},
        ],
        "kpi_effects": {"latency": 3.0, "loss": 5.0, "throughput": 0.5, "congestion": 2.5, "availability": 0.996},
    },
]


class _FailureState:
    """Tracks active causal failure chains for the current session."""

    def __init__(self):
        self.active_chains: list[dict] = []
        self.started_at: datetime = datetime.utcnow()

    def activate(self):
        """Pick 1-2 root failures to cascade."""
        self.started_at = datetime.utcnow()
        count = random.choice([1, 1, 2])
        self.active_chains = random.sample(FAILURE_CHAINS, min(count, len(FAILURE_CHAINS)))

    @property
    def affected_regions(self) -> set[str]:
        return {c["region"] for c in self.active_chains}

    @property
    def affected_links(self) -> set[str]:
        return {c["affected_link"] for c in self.active_chains}

    def kpi_multipliers(self) -> dict:
        """Aggregate KPI effects from all active chains."""
        m = {"latency": 1.0, "loss": 1.0, "throughput": 1.0, "congestion": 1.0, "availability": 1.0}
        for c in self.active_chains:
            fx = c["kpi_effects"]
            m["latency"] *= fx.get("latency", 1.0)
            m["loss"] *= fx.get("loss", 1.0)
            m["throughput"] *= fx.get("throughput", 1.0)
            m["congestion"] *= fx.get("congestion", 1.0)
            m["availability"] = min(m["availability"], fx.get("availability", 1.0))
        return m


class GlobalTelemetryCache:
    CACHE_DURATION_SEC = 15  # 15 seconds is responsive, yet guarantees synchronicity

    def __init__(self):
        self.last_updated = None
        self.alarms = []
        self.kpis = []
        self.topology = None
        self.flows = []
        self.logs = []
        self.extended_kpis = []
        self.predictions = []


_telemetry_cache = GlobalTelemetryCache()
shared_failure_state = _FailureState()


class MockTelecomConnector(BaseConnector):
    """Causal failure propagation engine for realistic telecom simulation.

    A single root failure (e.g., fiber cut) cascades through:
    CRC errors → OSPF loss → rerouting → congestion → QoE degradation.
    All return types and API contracts are preserved.
    """

    def __init__(self):
        self._topology: Optional[NetworkTopology] = None
        self._base_seed = random.randint(1000, 9999)
        self._failure = shared_failure_state

    async def connect(self) -> None:
        self._topology = self._build_topology()
        if not self._failure.active_chains:
            self._failure.activate()

    async def disconnect(self) -> None:
        self._topology = None

    # ─── Cache Management ───
    async def _update_cache_if_expired(self) -> None:
        now_time = time.time()
        if _telemetry_cache.last_updated is not None and (now_time - _telemetry_cache.last_updated < _telemetry_cache.CACHE_DURATION_SEC):
            return

        # Bypass recursion checks by setting timestamp first
        _telemetry_cache.last_updated = now_time

        # Generate fresh snapshots and store them
        _telemetry_cache.topology = await self._generate_topology_raw()
        _telemetry_cache.flows = await self._generate_traffic_flows_raw()
        _telemetry_cache.alarms = await self._generate_alarms_raw(limit=100)
        _telemetry_cache.kpis = await self._generate_kpis_raw()
        _telemetry_cache.extended_kpis = await self._generate_extended_kpis_raw()
        _telemetry_cache.logs = await self._generate_logs_raw(limit=150)
        _telemetry_cache.predictions = await self._generate_predictions_raw()

    # ─── Public Telemetry Getters (Cache-backed) ───
    async def fetch_alarms(self, limit: int = 50, severity: Optional[str] = None) -> list[Alarm]:
        await self._update_cache_if_expired()
        alarms = _telemetry_cache.alarms
        if severity:
            alarms = [a for a in alarms if a.severity.value == severity]
        return alarms[:limit]

    async def fetch_kpis(self) -> list[KPIData]:
        await self._update_cache_if_expired()
        return _telemetry_cache.kpis

    async def fetch_topology(self) -> NetworkTopology:
        await self._update_cache_if_expired()
        return _telemetry_cache.topology

    async def fetch_traffic_flows(self) -> list[TrafficFlow]:
        await self._update_cache_if_expired()
        return _telemetry_cache.flows

    async def fetch_logs(self, limit: int = 100) -> list[dict]:
        await self._update_cache_if_expired()
        return _telemetry_cache.logs[:limit]

    async def predict_incidents(self) -> list[dict]:
        await self._update_cache_if_expired()
        return _telemetry_cache.predictions

    async def fetch_extended_kpis(self) -> list[KPIData]:
        await self._update_cache_if_expired()
        return _telemetry_cache.extended_kpis

    # ─── Raw Generators (Private) ───
    async def _generate_alarms_raw(self, limit: int = 50, severity: Optional[str] = None) -> list[Alarm]:
        now = datetime.utcnow()
        topo = self._topology or self._build_topology()
        nodes = topo.nodes
        links = topo.links
        alarms: list[Alarm] = []

        # 1) Emit cascade alarms from active failure chains
        for chain in self._failure.active_chains:
            region = chain["region"]
            region_nodes = [n for n in nodes if n.region == region]
            core_node = next((n for n in region_nodes if n.type == NodeType.core_router), region_nodes[0] if region_nodes else nodes[0])
            cell_tower = next((n for n in region_nodes if n.type == NodeType.cell_tower), core_node)
            link_id = chain["affected_link"]

            for step in chain["cascade"]:
                title = step["alarm"].format(
                    node=core_node.name, link=link_id,
                    ct=cell_tower.name, peer=f"AS{random.randint(64500, 65000)}",
                    port=random.randint(1, 4),
                )
                sev = step["sev"]
                if severity and sev.value != severity:
                    continue
                alarms.append(Alarm(
                    title=title,
                    description=f"Causal chain [{chain['root']}]: {title}",
                    severity=sev, source=core_node.name, node_id=core_node.id,
                    region=region, category=step["cat"],
                    timestamp=now - timedelta(minutes=step["delay_min"]),
                ))

        # 2) Ambient alarms (non-failure noise)
        ambient = [
            ("Disk usage critical on NMS server", Severity.minor, "infrastructure"),
            ("Temperature warning on {node}", Severity.warning, "environment"),
            ("Memory utilization above 90% on {node}", Severity.warning, "performance"),
        ]
        remaining = limit - len(alarms)
        for i in range(max(0, remaining)):
            tmpl = ambient[i % len(ambient)]
            node = random.choice(nodes)
            title = tmpl[0].format(node=node.name)
            sev = tmpl[1]
            if severity and sev.value != severity:
                continue
            alarms.append(Alarm(
                title=title, description=f"Automated alarm: {title}",
                severity=sev, source=node.name, node_id=node.id,
                region=node.region, category=tmpl[2],
                timestamp=now - timedelta(minutes=20 + i * random.randint(5, 15)),
            ))

        # Sort by timestamp descending (most recent first)
        alarms.sort(key=lambda a: a.timestamp, reverse=True)
        return alarms[:limit]

    async def _generate_kpis_raw(self) -> list[KPIData]:
        now = datetime.utcnow()
        hour = now.hour + now.minute / 60.0
        diurnal = 0.5 + 0.5 * math.sin((hour - 6) * math.pi / 12)
        fm = self._failure.kpi_multipliers()  # causal failure effects

        definitions = [
            ("Throughput", "Gbps", "performance", (45 + 35 * diurnal) * fm["throughput"], 5),
            ("Latency", "ms", "performance", (8 + 12 * (1 - diurnal)) * fm["latency"] + random.gauss(0, 2), 2),
            ("Packet Loss", "%", "quality", max(0.001, (0.01 + 0.04 * (1 - diurnal)) * fm["loss"] + random.gauss(0, 0.01)), 0.01),
            ("Availability", "%", "availability", min(99.999, fm["availability"] * 100 + random.gauss(0, 0.02)), 0.02),
            ("Active Sessions", "K", "traffic", 150 + 200 * diurnal + random.gauss(0, 20), 30),
            ("Congestion Index", "%", "performance", max(0, (5 + 25 * (1 - diurnal)) * fm["congestion"] + random.gauss(0, 5)), 5),
        ]

        kpis = []
        for i, (name, unit, cat, base_val, noise) in enumerate(definitions):
            history = []
            for h in range(24):
                t = now - timedelta(hours=24 - h)
                h_hour = t.hour + t.minute / 60.0
                h_diurnal = 0.5 + 0.5 * math.sin((h_hour - 6) * math.pi / 12)
                if name == "Throughput":
                    val = 45 + 35 * h_diurnal + random.gauss(0, noise)
                elif name == "Latency":
                    val = 8 + 12 * (1 - h_diurnal) + random.gauss(0, noise)
                elif name == "Packet Loss":
                    val = max(0.001, 0.01 + 0.04 * (1 - h_diurnal) + random.gauss(0, noise))
                elif name == "Availability":
                    val = min(99.999, 99.9 + 0.09 * h_diurnal + random.gauss(0, noise))
                elif name == "Active Sessions":
                    val = 150 + 200 * h_diurnal + random.gauss(0, noise)
                else:
                    val = max(0, 5 + 25 * (1 - h_diurnal) + random.gauss(0, noise))
                # Apply failure effect to last 2 hours of history
                if h >= 22 and self._failure.active_chains:
                    if name == "Latency": val *= fm["latency"]
                    elif name == "Packet Loss": val *= fm["loss"]
                    elif name == "Throughput": val *= fm["throughput"]
                    elif name == "Congestion Index": val *= fm["congestion"]
                history.append(KPIDataPoint(timestamp=t, value=round(val, 3)))

            current = base_val
            prev = history[-2].value if len(history) > 1 else current
            trend_pct = ((current - prev) / max(prev, 0.001)) * 100

            status = "normal"
            if name in ("Latency", "Packet Loss", "Congestion Index"):
                if current > base_val * 1.3:
                    status = "critical"
                elif current > base_val * 1.1:
                    status = "warning"
            elif name in ("Throughput", "Availability"):
                if current < base_val * 0.7:
                    status = "critical"
                elif current < base_val * 0.85:
                    status = "warning"

            kpis.append(KPIData(
                id=f"kpi-{i}", name=name, category=cat,
                value=round(current, 2), unit=unit,
                trend="up" if trend_pct > 1 else "down" if trend_pct < -1 else "stable",
                trend_pct=round(trend_pct, 1), status=status,
                timestamp=now, history=history,
            ))
        return kpis

    async def _generate_topology_raw(self) -> NetworkTopology:
        if not self._topology:
            self._topology = self._build_topology()
        affected_links = self._failure.affected_links
        for link in self._topology.links:
            if link.id in affected_links:
                # Failure-affected links show high utilization
                link.utilization_pct = round(85 + random.random() * 13, 1)
                link.latency_ms = round(link.latency_ms * 2.5 + random.gauss(0, 1), 1)
            else:
                base = float(link.id.split("-")[-1]) if link.id[-1].isdigit() else 50
                link.utilization_pct = round(max(5, min(98, base * 0.5 + random.gauss(40, 15))), 1)
                link.latency_ms = round(max(0.5, link.latency_ms + random.gauss(0, 0.5)), 1)
        return self._topology

    def _build_topology(self) -> NetworkTopology:
        nodes: list[NetworkNode] = []
        links: list[NetworkLink] = []
        regions = [
            ("North", 33.7, 73.0), ("South", 24.8, 67.0), ("East", 30.3, 71.7),
        ]

        for ri, (region, lat, lng) in enumerate(regions):
            dc = NetworkNode(id=f"dc-{ri}", name=f"DC-{region[0]}1", type=NodeType.data_center,
                           region=region, lat=lat, lng=lng)
            cr = NetworkNode(id=f"cr-{ri}", name=f"CR-{region[0]}1", type=NodeType.core_router,
                           region=region, status=NodeStatus.degraded if ri == 0 else NodeStatus.operational,
                           lat=lat + 0.1, lng=lng + 0.1)
            nodes.extend([dc, cr])
            links.append(NetworkLink(id=f"l-dc-cr-{ri}", source_id=dc.id, target_id=cr.id,
                                   capacity_gbps=100, utilization_pct=35, latency_ms=0.5))

            for a in range(2):
                agg = NetworkNode(id=f"agg-{ri}-{a}", name=f"AGG-{region[0]}{a+1}",
                                type=NodeType.aggregation_switch, region=region,
                                lat=lat + 0.2 * (a + 1), lng=lng + 0.15 * (a + 1))
                nodes.append(agg)
                links.append(NetworkLink(id=f"l-cr-agg-{ri}-{a}", source_id=cr.id, target_id=agg.id,
                                       capacity_gbps=40, utilization_pct=50, latency_ms=1.5))

                for t in range(3):
                    status = NodeStatus.down if (ri == 0 and a == 1 and t == 2) else NodeStatus.operational
                    ct = NetworkNode(id=f"ct-{ri}-{a}-{t}", name=f"CT-{region[0]}{a*3+t+1}",
                                  type=NodeType.cell_tower, region=region, status=status,
                                  lat=lat + 0.3 + t * 0.05, lng=lng + 0.2 + a * 0.1)
                    nodes.append(ct)
                    links.append(NetworkLink(
                        id=f"l-agg-ct-{ri}-{a}-{t}", source_id=agg.id, target_id=ct.id,
                        capacity_gbps=10, utilization_pct=45, latency_ms=3,
                        status="down" if status == NodeStatus.down else "active",
                    ))

        # Inter-region trunk links
        links.append(NetworkLink(id="l-trunk-ns", source_id="cr-0", target_id="cr-1",
                               capacity_gbps=100, utilization_pct=55, latency_ms=8))
        links.append(NetworkLink(id="l-trunk-se", source_id="cr-1", target_id="cr-2",
                               capacity_gbps=100, utilization_pct=42, latency_ms=12))
        links.append(NetworkLink(id="l-trunk-ne", source_id="cr-0", target_id="cr-2",
                               capacity_gbps=40, utilization_pct=88, latency_ms=15))

        return NetworkTopology(nodes=nodes, links=links)

    # ─── Traffic Flows ───
    async def _generate_traffic_flows_raw(self) -> list[TrafficFlow]:
        topo = self._topology or self._build_topology()
        nodes = [n for n in topo.nodes if n.type in (NodeType.core_router, NodeType.data_center, NodeType.aggregation_switch)]
        flows = []
        protocols = ["MPLS", "IP", "GRE", "VXLAN", "SR-MPLS"]
        priorities = ["high", "medium", "low"]

        for i in range(25):
            src = random.choice(nodes)
            dst = random.choice([n for n in nodes if n.id != src.id])
            flows.append(TrafficFlow(
                source_node=src.name, destination_node=dst.name,
                bandwidth_gbps=round(1 + random.random() * 20, 1),
                utilization_pct=round(15 + random.random() * 80, 1),
                latency_ms=round(1 + random.random() * 25, 1),
                packet_loss_pct=round(random.random() * 0.1, 3),
                protocol=random.choice(protocols),
                priority=random.choice(priorities),
            ))
        return flows

    # ─── Logs (causal chain timeline) ───
    async def _generate_logs_raw(self, limit: int = 100) -> list[dict]:
        now = datetime.utcnow()
        topo = self._topology or self._build_topology()
        logs = []

        # 1) Causal chain log entries (chronological failure timeline)
        for chain in self._failure.active_chains:
            region = chain["region"]
            region_nodes = [n for n in topo.nodes if n.region == region]
            core = next((n for n in region_nodes if n.type == NodeType.core_router), region_nodes[0] if region_nodes else topo.nodes[0])
            for step in chain["cascade"]:
                sev = "CRITICAL" if step["sev"] in (Severity.critical,) else "ERROR" if step["sev"] == Severity.major else "WARNING"
                comp = step["cat"].upper()
                logs.append({
                    "timestamp": (now - timedelta(minutes=step["delay_min"])).isoformat(),
                    "severity": sev,
                    "source": core.name,
                    "component": comp,
                    "message": f"{comp}: {step['alarm'].format(node=core.name, link=chain['affected_link'], ct=core.name, peer='10.0.0.1', port=1, intf='Gi0/0/1')}",
                })

        # 2) Ambient log noise
        components = ["OSPF", "BGP", "MPLS", "Interface", "Power", "CPU", "Memory"]
        remaining = limit - len(logs)
        for i in range(max(0, remaining)):
            node = random.choice(topo.nodes)
            comp = random.choice(components)
            logs.append({
                "timestamp": (now - timedelta(seconds=30 + i * random.randint(10, 120))).isoformat(),
                "severity": random.choice(["INFO", "INFO", "INFO", "WARNING"]),
                "source": node.name,
                "component": comp,
                "message": f"{comp}: Routine check on {node.name} — status=OK",
            })

        logs.sort(key=lambda l: l["timestamp"], reverse=True)
        return logs[:limit]

    # ─── Incident Generation (causal chain-driven) ───
    async def generate_incidents(self) -> list[dict]:
        """Generate incidents from active causal failure chains."""
        if not self._topology:
            await self.connect()
        alarms = await self.fetch_alarms(limit=30)
        kpis = await self.fetch_kpis()
        anomaly_kpis = [k for k in kpis if k.status in ("critical", "warning")]

        incidents = []
        for chain in self._failure.active_chains:
            region = chain["region"]
            reg_alarms = [a for a in alarms if a.region == region and a.severity in (Severity.critical, Severity.major)]
            if len(reg_alarms) < 2:
                continue

            critical_count = sum(1 for a in reg_alarms if a.severity == Severity.critical)
            severity = "critical" if critical_count >= 2 else "major"
            affected_nodes = list(set(a.source for a in reg_alarms[:5]))
            alarm_summaries = [a.title for a in reg_alarms[:3]]

            # Use root cause from the failure chain template
            root = chain["root"]
            title = f"{root} — cascading failure in {region} Region"

            inc_id = f"INC-{datetime.utcnow().strftime('%Y')}-{uuid.uuid4().hex[:6].upper()}"
            incidents.append({
                "id": inc_id,
                "title": title,
                "description": (
                    f"Root cause: {root}. Cascade: {' → '.join(s['alarm'].split(' on ')[0] for s in chain['cascade'][:4])}. "
                    f"Correlated {len(reg_alarms)} alarms: {'; '.join(alarm_summaries)}"
                ),
                "severity": severity,
                "status": "open",
                "affected_nodes": affected_nodes,
                "affected_region": f"{region} Region",
                "source_alarm_ids": [a.id for a in reg_alarms],
                "alarm_count": len(reg_alarms),
                "anomaly_kpis": [k.name for k in anomaly_kpis],
                "root_cause": root,
            })

        return incidents

    # ─── Dynamic Congestion Detection ───
    async def detect_congestion(self) -> list[CongestionPoint]:
        """Detect congestion points from live topology link utilization."""
        topo = await self.fetch_topology()
        flows = await self.fetch_traffic_flows()
        congestion_points = []

        for link in topo.links:
            util = link.utilization_pct
            if util < 70:
                continue

            # Determine severity from utilization
            if util >= 90:
                severity = "critical"
            elif util >= 80:
                severity = "high"
            else:
                severity = "medium"

            # Count affected flows crossing this link
            source_node = next((n for n in topo.nodes if n.id == link.source_id), None)
            target_node = next((n for n in topo.nodes if n.id == link.target_id), None)
            affected = random.randint(100, 900)  # In production: count from flow table

            # Generate contextual recommendation
            if util >= 90:
                action = f"URGENT: Enable ECMP load-balancing on {link.source_id}↔{link.target_id}. Consider emergency traffic reroute."
            elif util >= 80:
                if link.capacity_gbps <= 40:
                    action = f"Upgrade link {link.source_id}↔{link.target_id} from {link.capacity_gbps}G to 100G"
                else:
                    action = f"Apply QoS traffic shaping on {link.source_id}↔{link.target_id} to prioritize critical flows"
            else:
                action = f"Monitor {link.source_id}↔{link.target_id} — approaching capacity threshold"

            congestion_points.append(CongestionPoint(
                node_id=link.source_id,
                link_id=f"{link.source_id}↔{link.target_id}",
                severity=severity,
                utilization_pct=round(util, 1),
                affected_flows=affected,
                recommended_action=action,
            ))

        # Sort by severity (critical first) then utilization
        sev_order = {"critical": 0, "high": 1, "medium": 2}
        congestion_points.sort(key=lambda c: (sev_order.get(c.severity, 3), -c.utilization_pct))
        return congestion_points

    async def _generate_predictions_raw(self) -> list[dict]:
        """Predict future incidents by analyzing KPI trends.
        
        Looks at KPI history to detect degradation patterns that match
        historical incident signatures. Returns predictions with confidence
        and estimated time to incident.
        """
        kpis = await self.fetch_kpis()
        predictions = []

        for kpi in kpis:
            history = kpi.history
            if len(history) < 4:
                continue

            # Check for sustained degradation trend
            recent = [h.value for h in history[-6:]]
            older = [h.value for h in history[:6]]
            avg_recent = sum(recent) / len(recent)
            avg_older = sum(older) / len(older)

            # For metrics where higher is worse (latency, loss, jitter, congestion)
            worse_is_higher = kpi.name in ("Latency", "Packet Loss", "Jitter", "Congestion Index", "Call Drop Rate")

            if worse_is_higher:
                degradation_pct = ((avg_recent - avg_older) / max(avg_older, 0.001)) * 100
            else:
                degradation_pct = ((avg_older - avg_recent) / max(avg_older, 0.001)) * 100

            # Only predict if degradation > 15%
            if degradation_pct > 15:
                # Estimate time to threshold breach
                trend_rate = (avg_recent - avg_older) / len(history)  # per-hour rate
                if worse_is_higher and trend_rate > 0:
                    threshold = kpi.value * 1.5
                    hours_to_breach = abs((threshold - kpi.value) / max(trend_rate, 0.01))
                elif not worse_is_higher and trend_rate < 0:
                    threshold = kpi.value * 0.7
                    hours_to_breach = abs((kpi.value - threshold) / max(abs(trend_rate), 0.01))
                else:
                    hours_to_breach = 999

                if hours_to_breach > 48:
                    continue  # Too far out

                confidence = min(0.95, 0.5 + degradation_pct / 100)
                minutes_to_incident = int(hours_to_breach * 60)

                # Determine severity
                if degradation_pct > 40:
                    pred_severity = "critical"
                elif degradation_pct > 25:
                    pred_severity = "major"
                else:
                    pred_severity = "minor"

                predictions.append({
                    "id": f"pred-{kpi.id}",
                    "type": "predicted_incident",
                    "title": f"Predicted: {kpi.name} degradation",
                    "description": (
                        f"{kpi.name} has degraded {degradation_pct:.0f}% over the last "
                        f"{len(history)} hours. Current: {kpi.value:.2f} {kpi.unit}. "
                        f"If this trend continues, threshold breach expected in "
                        f"~{minutes_to_incident} minutes."
                    ),
                    "kpi_name": kpi.name,
                    "kpi_value": kpi.value,
                    "kpi_unit": kpi.unit,
                    "degradation_pct": round(degradation_pct, 1),
                    "confidence": round(confidence, 2),
                    "severity": pred_severity,
                    "estimated_minutes": minutes_to_incident,
                    "trend_direction": "worsening",
                    "reason": (
                        f"Current {kpi.name} trend matches degradation pattern. "
                        f"Recent avg: {avg_recent:.2f}, Historical avg: {avg_older:.2f}."
                    ),
                    "matched_patterns": max(1, int(degradation_pct / 10)),
                })

        # Sort by confidence descending
        predictions.sort(key=lambda p: p["confidence"], reverse=True)
        return predictions[:5]

    async def _generate_extended_kpis_raw(self) -> list[KPIData]:
        """Return telecom-specific KPIs (RAN, radio, call metrics)."""
        now = datetime.utcnow()
        hour = now.hour + now.minute / 60
        diurnal = 0.5 + 0.5 * math.sin((hour - 6) * math.pi / 12)

        extended_kpis = [
            # Radio Access Network KPIs
            ("RSRP", "radio", -80 - diurnal * 20, "dBm",
             lambda h: -80 - 20 * (0.5 + 0.5 * math.sin((h - 6) * math.pi / 12)) + random.gauss(0, 3)),
            ("RSRQ", "radio", -10 - diurnal * 5, "dB",
             lambda h: -10 - 5 * (0.5 + 0.5 * math.sin((h - 6) * math.pi / 12)) + random.gauss(0, 1)),
            ("SINR", "radio", 15 - diurnal * 8, "dB",
             lambda h: 15 - 8 * (0.5 + 0.5 * math.sin((h - 6) * math.pi / 12)) + random.gauss(0, 2)),
            ("CQI", "radio", 12 - diurnal * 4, "",
             lambda h: max(1, min(15, 12 - 4 * (0.5 + 0.5 * math.sin((h - 6) * math.pi / 12)) + random.gauss(0, 1)))),
            ("PRB Utilization", "radio", 40 + diurnal * 35, "%",
             lambda h: 40 + 35 * (0.5 + 0.5 * math.sin((h - 6) * math.pi / 12)) + random.gauss(0, 5)),
            # Call & Session KPIs
            ("Handover Success Rate", "call_quality", 98.5 - diurnal * 2, "%",
             lambda h: max(90, 98.5 - 2 * (0.5 + 0.5 * math.sin((h - 6) * math.pi / 12)) + random.gauss(0, 0.5))),
            ("Call Setup Success Rate", "call_quality", 99.2 - diurnal * 1.5, "%",
             lambda h: max(92, 99.2 - 1.5 * (0.5 + 0.5 * math.sin((h - 6) * math.pi / 12)) + random.gauss(0, 0.3))),
            ("Call Drop Rate", "call_quality", 0.5 + diurnal * 1.5, "%",
             lambda h: max(0.01, 0.5 + 1.5 * (0.5 + 0.5 * math.sin((h - 6) * math.pi / 12)) + random.gauss(0, 0.2))),
        ]

        result = []
        for i, (name, cat, current, unit, hist_fn) in enumerate(extended_kpis):
            history = []
            for h_idx in range(24):
                h_time = now - timedelta(hours=24 - h_idx)
                h_hour = h_time.hour + h_time.minute / 60
                history.append(KPIDataPoint(timestamp=h_time, value=round(hist_fn(h_hour), 3)))

            trend_pct = ((current - history[-4].value) / max(abs(history[-4].value), 0.001)) * 100

            status = "normal"
            if name == "Call Drop Rate" and current > 1.5:
                status = "warning" if current < 2.5 else "critical"
            elif name == "PRB Utilization" and current > 70:
                status = "warning" if current < 85 else "critical"
            elif name in ("RSRP",) and current < -100:
                status = "warning" if current > -110 else "critical"
            elif name in ("Handover Success Rate", "Call Setup Success Rate") and current < 96:
                status = "warning" if current > 93 else "critical"

            result.append(KPIData(
                id=f"kpi-ext-{i}", name=name, category=cat,
                value=round(current, 2), unit=unit,
                trend="up" if trend_pct > 1 else "down" if trend_pct < -1 else "stable",
                trend_pct=round(trend_pct, 1), status=status,
                timestamp=now, history=history,
            ))

        return result


