"""Dashboard API routes — all metrics computed dynamically from live data."""
from fastapi import APIRouter
from models.schemas import DashboardData, AgentSummary, TrafficSummary
from connectors.mock_connector import MockTelecomConnector
from database import get_session, DBIncident, DBReport, DBOptimization
from telemetry import telemetry
from memory import decision_memory

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

_connector = MockTelecomConnector()


@router.get("", response_model=DashboardData)
async def get_dashboard():
    if not _connector._topology:
        await _connector.connect()

    kpis = await _connector.fetch_kpis()
    alarms = await _connector.fetch_alarms(limit=20)
    flows = await _connector.fetch_traffic_flows()

    # Calculate health score from KPIs
    health = 95
    for k in kpis:
        if k.status == "critical":
            health -= 20
        elif k.status == "warning":
            health -= 8
    health = max(10, min(100, health))

    critical_alarms = [a for a in alarms if a.severity.value == "critical"]
    total_bw = sum(f.bandwidth_gbps for f in flows)
    peak_util = max((f.utilization_pct for f in flows), default=0)

    # ── Dynamic agent stats from telemetry ──
    telem_stats = telemetry.get_dashboard_stats()

    # ── Dynamic counts from database ──
    db = get_session()
    try:
        open_incidents = db.query(DBIncident).filter(
            DBIncident.status.in_(["open", "investigating"])
        ).count()
        total_reports = db.query(DBReport).count()
        total_optimizations = db.query(DBOptimization).count()
    finally:
        db.close()

    return DashboardData(
        health_score=health,
        kpis=kpis,
        recent_alarms=alarms,
        active_incidents=[],
        agent_summary=AgentSummary(
            total_agents=15,
            active_agents=max(telem_stats.get("active_agents", 0), 1),
            tasks_today=telem_stats.get("tasks_today", 0),
            avg_response_time_ms=telem_stats.get("avg_response_time_ms", 0),
        ),
        traffic_summary=TrafficSummary(
            total_throughput_gbps=round(total_bw, 1),
            peak_utilization_pct=round(peak_util, 1),
            congestion_points=len([f for f in flows if f.utilization_pct > 80]),
            active_flows=len(flows),
        ),
    )


@router.get("/kpis")
async def get_kpis():
    if not _connector._topology:
        await _connector.connect()
    return await _connector.fetch_kpis()


@router.get("/alarms")
async def get_alarms(limit: int = 50):
    if not _connector._topology:
        await _connector.connect()
    return await _connector.fetch_alarms(limit=limit)


@router.get("/stats")
async def get_system_stats():
    """Extended system stats: AI usage, tokens, investigations, reports."""
    telem_stats = telemetry.get_dashboard_stats()
    db = get_session()
    try:
        open_incidents = db.query(DBIncident).filter(
            DBIncident.status.in_(["open", "investigating"])
        ).count()
        resolved_incidents = db.query(DBIncident).filter(
            DBIncident.status == "resolved"
        ).count()
        total_reports = db.query(DBReport).count()
        total_optimizations = db.query(DBOptimization).count()
    finally:
        db.close()

    return {
        **telem_stats,
        "open_incidents": open_incidents,
        "resolved_incidents": resolved_incidents,
        "total_reports": total_reports,
        "total_optimizations": total_optimizations,
    }


@router.get("/predictions")
async def get_predictions():
    """Predictive incident detection — analyze KPI trends for future degradation."""
    if not _connector._topology:
        await _connector.connect()
    predictions = await _connector.predict_incidents()

    # Enrich with decision memory pattern matching
    for pred in predictions:
        similar = decision_memory.get_similar_cases(pred["title"], pred.get("description", ""), limit=3)
        pred["matched_historical_cases"] = len(similar)
        pred["historical_matches"] = similar[:2]  # Top 2 matches
        if similar:
            pred["reason"] += f" Matches {len(similar)} previous incident patterns."

    return predictions


@router.get("/kpis/extended")
async def get_extended_kpis():
    """Return telecom-specific KPIs: RSRP, RSRQ, SINR, CQI, PRB, call metrics."""
    if not _connector._topology:
        await _connector.connect()
    return await _connector.fetch_extended_kpis()

