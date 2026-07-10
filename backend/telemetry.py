"""Agent Telemetry — Records real AI agent execution data.

Every Fireworks AI call is logged with: agent, duration, tokens, model,
workflow context, and success/failure status. Powers the Agent Activity page
and dynamic dashboard metrics.
"""
import uuid
import logging
from typing import Optional
from datetime import datetime, timedelta
from database import get_session, DBAgentActivity

logger = logging.getLogger("telemetry")


class TelemetryService:
    """Singleton service for recording and querying agent telemetry."""

    def record(
        self,
        agent_type: str,
        agent_name: str,
        action: str,
        detail: str = "",
        status: str = "success",
        duration_ms: int = 0,
        tokens_used: int = 0,
        model_used: str = "",
        workflow_name: str = "",
        workflow_step: int = -1,
        incident_id: Optional[str] = None,
        started_at: Optional[datetime] = None,
    ) -> str:
        """Record a single agent execution event."""
        # ── Sanitize inputs — never store empty / "unknown" strings ──
        agent_name_clean = (agent_name or "").strip()
        if not agent_name_clean or agent_name_clean.lower() == "unknown":
            agent_name_clean = agent_type.replace("_", " ").title() or "AI Agent"
        action_clean = (action or "").strip()
        if not action_clean or action_clean.lower() in ("unknown", "analyze"):
            action_clean = f"Processing {agent_type.replace('_', ' ')}"

        entry_id = f"act-{uuid.uuid4().hex[:8]}"
        now = datetime.utcnow()
        db = get_session()
        try:
            entry = DBAgentActivity(
                id=entry_id,
                agent_type=agent_type,
                agent_name=agent_name_clean,
                action=action_clean,
                detail=detail,
                status=status,
                duration_ms=duration_ms,
                tokens_used=tokens_used,
                model_used=model_used,
                workflow_name=workflow_name,
                workflow_step=workflow_step,
                incident_id=incident_id,
                started_at=started_at or now,
                completed_at=now,
            )
            db.add(entry)
            db.commit()
            logger.debug(f"Telemetry: {agent_name_clean} [{status}] {duration_ms}ms {tokens_used}tok")
            return entry_id
        except Exception as e:
            logger.warning(f"Telemetry write failed: {e}")
            db.rollback()
            return ""
        finally:
            db.close()

    def get_activity(self, limit: int = 50, agent_type: Optional[str] = None) -> list[dict]:
        """Get recent agent activity entries."""
        db = get_session()
        try:
            q = db.query(DBAgentActivity).order_by(DBAgentActivity.completed_at.desc())
            if agent_type:
                q = q.filter(DBAgentActivity.agent_type == agent_type)
            entries = q.limit(limit).all()
            return [{
                "id": e.id,
                "agent_type": e.agent_type,
                "agent_name": e.agent_name,
                "action": e.action,
                "detail": e.detail,
                "status": e.status,
                "duration_ms": e.duration_ms,
                "tokens_used": e.tokens_used,
                "model_used": e.model_used,
                "workflow_name": e.workflow_name,
                "workflow_step": e.workflow_step,
                "incident_id": e.incident_id,
                "started_at": e.started_at.isoformat() if e.started_at else None,
                "completed_at": e.completed_at.isoformat() if e.completed_at else None,
                "timestamp": e.completed_at.isoformat() if e.completed_at else None,
            } for e in entries]
        finally:
            db.close()

    def get_agent_stats(self) -> dict[str, dict]:
        """Aggregate per-agent stats from telemetry: tasks, avg response, last active."""
        db = get_session()
        try:
            from sqlalchemy import func
            rows = db.query(
                DBAgentActivity.agent_type,
                DBAgentActivity.agent_name,
                func.count(DBAgentActivity.id).label("tasks"),
                func.avg(DBAgentActivity.duration_ms).label("avg_ms"),
                func.max(DBAgentActivity.completed_at).label("last_active"),
                func.sum(DBAgentActivity.tokens_used).label("total_tokens"),
            ).group_by(
                DBAgentActivity.agent_type, DBAgentActivity.agent_name
            ).all()

            cutoff = datetime.utcnow() - timedelta(minutes=5)
            stats = {}
            for r in rows:
                stats[r.agent_type] = {
                    "agent_name": r.agent_name,
                    "tasks_completed": r.tasks or 0,
                    "avg_response_time_ms": round(r.avg_ms or 0, 0),
                    "total_tokens": r.total_tokens or 0,
                    "last_active": r.last_active.isoformat() if r.last_active else None,
                    "is_active": r.last_active >= cutoff if r.last_active else False,
                }
            return stats
        finally:
            db.close()

    def get_dashboard_stats(self) -> dict:
        """Compute live dashboard metrics from telemetry."""
        db = get_session()
        try:
            from sqlalchemy import func
            today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
            cutoff = datetime.utcnow() - timedelta(minutes=5)

            total_tasks = db.query(func.count(DBAgentActivity.id)).scalar() or 0
            tasks_today = db.query(func.count(DBAgentActivity.id)).filter(
                DBAgentActivity.completed_at >= today_start
            ).scalar() or 0
            total_tokens = db.query(func.sum(DBAgentActivity.tokens_used)).scalar() or 0

            # Active agents = distinct agent types with activity in last 5 min
            active_agents = db.query(
                func.count(func.distinct(DBAgentActivity.agent_type))
            ).filter(DBAgentActivity.completed_at >= cutoff).scalar() or 0

            avg_response = db.query(func.avg(DBAgentActivity.duration_ms)).scalar() or 0

            # AI requests count
            ai_requests = db.query(func.count(DBAgentActivity.id)).filter(
                DBAgentActivity.tokens_used > 0
            ).scalar() or 0

            return {
                "total_tasks": total_tasks,
                "tasks_today": tasks_today,
                "total_tokens": total_tokens,
                "active_agents": active_agents,
                "avg_response_time_ms": round(avg_response, 0),
                "ai_requests": ai_requests,
            }
        finally:
            db.close()


# Singleton
telemetry = TelemetryService()
