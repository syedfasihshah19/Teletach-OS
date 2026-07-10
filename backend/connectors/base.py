"""Base connector interface — all telecom data sources implement this."""
from abc import ABC, abstractmethod
from typing import Any, Callable, Optional
from models.schemas import Alarm, KPIData, NetworkTopology, TrafficFlow, CongestionPoint


class BaseConnector(ABC):
    """Abstract interface for telecom data connectors.
    
    Current: Mock implementations generate realistic dynamic data.
    Future: Nokia OSS, Ericsson ENM, Cisco Crosswork, Huawei U2020,
            Prometheus, Grafana, Splunk, Open5GS.
    """

    @abstractmethod
    async def connect(self) -> None:
        """Initialize connection to data source."""
        ...

    @abstractmethod
    async def disconnect(self) -> None:
        """Clean up connection."""
        ...

    @abstractmethod
    async def fetch_alarms(self, limit: int = 50, severity: Optional[str] = None) -> list[Alarm]:
        ...

    @abstractmethod
    async def fetch_kpis(self) -> list[KPIData]:
        ...

    @abstractmethod
    async def fetch_topology(self) -> NetworkTopology:
        ...

    @abstractmethod
    async def fetch_traffic_flows(self) -> list[TrafficFlow]:
        ...

    @abstractmethod
    async def fetch_logs(self, limit: int = 100) -> list[dict]:
        ...

    async def generate_incidents(self) -> list[dict]:
        """Correlate alarms + KPIs to auto-generate incidents."""
        return []

    async def detect_congestion(self) -> list[CongestionPoint]:
        """Detect congestion points from live topology utilization."""
        return []

    async def subscribe_events(self, callback: Callable) -> None:
        """Subscribe to real-time events (optional for connectors)."""
        pass
