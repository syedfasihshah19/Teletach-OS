"""Incident API routes — Dynamic incidents from alarm correlation + AI investigation.

Features: Consensus Agreement Score, AI Timeline, Action Approval Workflow.
"""
from fastapi import APIRouter
from datetime import datetime
from models.schemas import Incident, Severity, IncidentStatus, AgentFinding, ConsensusResult, ActionItem
from connectors.mock_connector import MockTelecomConnector
from antigravity.engine import AntigravityEngine, SharedContext, INCIDENT_INVESTIGATION_WORKFLOW
from agents.all_agents import create_all_agents
from database import get_session, DBIncident, DBReport, DBAgentActivity, init_db
from telemetry import telemetry
from memory import decision_memory
import uuid
import logging

logger = logging.getLogger("incidents")
router = APIRouter(prefix="/api/incidents", tags=["incidents"])

_connector = MockTelecomConnector()
_engine = AntigravityEngine()
_agents_registered = False


def _ensure_agents():
    global _agents_registered
    if not _agents_registered:
        agents = create_all_agents()
        for agent_type, agent in agents.items():
            _engine.register_agent(agent_type, agent)
        _agents_registered = True


def _compute_agreement_score(findings: list[dict]) -> dict:
    """Compute how much agents agree on their diagnosis.
    
    Returns:
        agreement_score: 0-100% (high = strong agreement)
        agent_confidence_breakdown: [{agent_name, confidence, status}]
        dissenting_agents: agents with confidence < 60%
    """
    if not findings:
        return {"agreement_score": 0, "agent_confidence_breakdown": [], "dissenting_agents": []}

    confidences = [f.get("confidence", 0.5) for f in findings]
    avg_conf = sum(confidences) / len(confidences)

    # Agreement = inverse of variance (high variance = low agreement)
    variance = sum((c - avg_conf) ** 2 for c in confidences) / len(confidences)
    # Normalize: 0 variance = 100% agreement, 0.25 variance = 0% agreement
    agreement = max(0, min(100, round((1 - variance / 0.15) * 100)))

    breakdown = []
    dissenting = []
    for f in findings:
        conf = f.get("confidence", 0.5)
        status = "strong" if conf >= 0.85 else "moderate" if conf >= 0.6 else "low"
        entry = {
            "agent_name": f.get("agent_name", f.get("agent_type", "Unknown")),
            "agent_type": f.get("agent_type", ""),
            "confidence": round(conf * 100),
            "status": status,
        }
        breakdown.append(entry)
        if conf < 0.6:
            dissenting.append(entry)

    # Sort by confidence descending
    breakdown.sort(key=lambda x: x["confidence"], reverse=True)

    return {
        "agreement_score": agreement,
        "average_confidence": round(avg_conf * 100),
        "agent_confidence_breakdown": breakdown,
        "dissenting_agents": dissenting,
        "needs_human_review": agreement < 65 or len(dissenting) > 0,
    }


def _build_timeline(incident_id: str, investigation_start: datetime) -> list[dict]:
    """Build investigation timeline from real telemetry records."""
    db = get_session()
    try:
        entries = db.query(DBAgentActivity).filter(
            DBAgentActivity.incident_id == incident_id
        ).order_by(DBAgentActivity.started_at.asc()).all()

        timeline = [{
            "timestamp": investigation_start.isoformat(),
            "event": "Investigation Started",
            "agent_name": "Orchestration Engine",
            "duration_ms": 0,
            "status": "info",
            "step": 0,
        }]

        for e in entries:
            # Use the descriptive action label; never surface raw "analyze"
            event_label = (e.action or "").strip()
            if not event_label or event_label.lower() in ("analyze", "unknown", ""):
                event_label = f"{e.agent_name} analysis"
            timeline.append({
                "timestamp": e.started_at.isoformat() if e.started_at else e.completed_at.isoformat(),
                "event": event_label,
                "agent_name": e.agent_name or "AI Agent",
                "duration_ms": e.duration_ms,
                "tokens_used": e.tokens_used,
                "status": e.status or "success",
                "step": e.workflow_step,
                "model": e.model_used.split("/")[-1][:15] if e.model_used else "",
            })

        timeline.append({
            "timestamp": datetime.utcnow().isoformat(),
            "event": "Investigation Complete",
            "agent_name": "Orchestration Engine",
            "duration_ms": 0,
            "status": "complete",
            "step": 99,
        })

        return timeline
    finally:
        db.close()


async def _sync_incidents_from_connector():
    """Generate incidents from live alarm correlation and persist new ones to DB."""
    if not _connector._topology:
        await _connector.connect()
    generated = await _connector.generate_incidents()
    db = get_session()
    try:
        existing_ids = {r.id for r in db.query(DBIncident.id).all()}
        open_regions = {r.affected_region for r in db.query(DBIncident).filter(
            DBIncident.status.in_(["open", "investigating"])
        ).all()}

        for inc_data in generated:
            region = inc_data["affected_region"]
            if region in open_regions:
                continue

            db_inc = DBIncident(
                id=inc_data["id"], title=inc_data["title"],
                description=inc_data["description"],
                severity=inc_data["severity"], status="open",
                affected_nodes=inc_data["affected_nodes"],
                affected_region=inc_data["affected_region"],
                source_alarm_ids=inc_data.get("source_alarm_ids", []),
            )
            db.add(db_inc)
            open_regions.add(region)
            logger.info(f"Created incident {inc_data['id']}: {inc_data['title']}")

        db.commit()
    finally:
        db.close()


@router.get("")
async def list_incidents():
    await _sync_incidents_from_connector()
    db = get_session()
    try:
        incidents = db.query(DBIncident).order_by(DBIncident.created_at.desc()).limit(20).all()
        return [{
            "id": i.id, "title": i.title, "description": i.description,
            "severity": i.severity, "status": i.status,
            "affected_nodes": i.affected_nodes or [],
            "affected_region": i.affected_region,
            "source_alarm_ids": i.source_alarm_ids or [],
            "created_at": i.created_at.isoformat() if i.created_at else None,
            "agent_findings": i.agent_findings or [],
            "consensus": i.consensus,
        } for i in incidents]
    finally:
        db.close()


@router.get("/{incident_id}")
async def get_incident(incident_id: str):
    db = get_session()
    try:
        inc = db.query(DBIncident).filter_by(id=incident_id).first()
        if not inc:
            return {"error": "Incident not found"}
        return {
            "id": inc.id, "title": inc.title, "description": inc.description,
            "severity": inc.severity, "status": inc.status,
            "affected_nodes": inc.affected_nodes or [],
            "affected_region": inc.affected_region,
            "source_alarm_ids": inc.source_alarm_ids or [],
            "agent_findings": inc.agent_findings or [],
            "consensus": inc.consensus,
        }
    finally:
        db.close()


@router.post("")
async def create_incident(data: dict):
    inc_id = f"INC-{datetime.utcnow().strftime('%Y')}-{uuid.uuid4().hex[:6].upper()}"
    db = get_session()
    try:
        db_inc = DBIncident(
            id=inc_id, title=data.get("title", "Manual Incident"),
            description=data.get("description", ""),
            severity=data.get("severity", "major"),
            affected_region=data.get("affected_region", ""),
        )
        db.add(db_inc)
        db.commit()
        return {"id": inc_id, "title": db_inc.title, "status": "open"}
    finally:
        db.close()


@router.post("/{incident_id}/investigate")
async def investigate_incident(incident_id: str):
    _ensure_agents()
    investigation_start = datetime.utcnow()

    db = get_session()
    try:
        inc = db.query(DBIncident).filter_by(id=incident_id).first()
        if not inc:
            return {"error": "Incident not found"}

        inc.status = "investigating"
        inc.updated_at = datetime.utcnow()
        db.commit()

        # ── Rich context: fetch all evidence for agents ──
        if not _connector._topology:
            await _connector.connect()

        kpis = await _connector.fetch_kpis()
        ext_kpis = await _connector.fetch_extended_kpis()
        all_kpis = kpis + ext_kpis
        alarms = await _connector.fetch_alarms(limit=30)
        logs = await _connector.fetch_logs(limit=20)
        flows = await _connector.fetch_traffic_flows()
        congestion = await _connector.detect_congestion()
        topo = await _connector.fetch_topology()

        # Serialise topology summary (nodes + links counts, high-util links)
        high_util_links = [{
            "id": l.id, "source": l.source_id, "target": l.target_id,
            "util_pct": l.utilization_pct, "capacity_gbps": l.capacity_gbps,
            "latency_ms": l.latency_ms,
        } for l in (topo.links if topo else []) if l.utilization_pct > 70]
        node_status_map = {
            n.name: n.status.value if hasattr(n.status, 'value') else str(n.status)
            for n in (topo.nodes if topo else [])
        }

        # Inject decision memory context
        similar_cases = decision_memory.get_similar_cases(inc.title, inc.description or "")

        context = SharedContext(
            incident_data={
                "id": inc.id, "title": inc.title,
                "description": inc.description,
                "severity": inc.severity,
                "region": inc.affected_region,
                "affected_nodes": inc.affected_nodes or [],
                # Evidence bundles consumed by each agent
                "kpis": [k.model_dump() for k in kpis],
                "extended_kpis": [k.model_dump() for k in ext_kpis],
                "all_kpis": [k.model_dump() for k in all_kpis],
                "alarms": [a.model_dump() for a in alarms],
                "logs": logs,
                "traffic_flows": [
                    {"src": f.source_node, "dst": f.destination_node,
                     "bw_gbps": f.bandwidth_gbps, "util_pct": f.utilization_pct,
                     "latency_ms": f.latency_ms, "loss_pct": f.packet_loss_pct,
                     "protocol": f.protocol, "priority": f.priority}
                    for f in flows
                ],
                "congestion": [
                    {"link": c.link_id, "util_pct": c.utilization_pct,
                     "severity": c.severity, "action": c.recommended_action}
                    for c in congestion
                ],
                "topology": {
                    "node_count": len(topo.nodes) if topo else 0,
                    "link_count": len(topo.links) if topo else 0,
                    "high_util_links": high_util_links[:8],
                    "node_statuses": node_status_map,
                },
                "similar_cases": similar_cases,
            }
        )

        # Run Antigravity workflow
        result = await _engine.execute_workflow(INCIDENT_INVESTIGATION_WORKFLOW, context)

        # Collect findings with structured metadata
        findings = []
        for agent_type, agent_result in result.agent_results.items():
            if isinstance(agent_result, dict):
                structured = agent_result.get("structured", {})
                # Sanitize finding-level risk
                raw_risk = (structured.get("risk") or "").strip()
                valid_risks = {"low", "medium", "high", "critical"}
                risk_word = raw_risk.split()[0].lower() if raw_risk else ""
                structured["risk"] = risk_word if risk_word in valid_risks else "medium"
                # Sanitize rollback
                if not structured.get("rollback", "").strip():
                    structured["rollback"] = "Standard rollback procedures apply"
                findings.append({
                    "agent_type": agent_result.get("agent_type", agent_type),
                    "agent_name": agent_result.get("agent_name", agent_type),
                    "finding": agent_result.get("finding", ""),
                    "confidence": agent_result.get("confidence", 0.7),
                    "evidence": agent_result.get("evidence", []),
                    "recommendations": agent_result.get("recommendations", []),
                    "tokens_used": agent_result.get("tokens_used", 0),
                    "structured": structured,
                })

        # ── Feature 1: Consensus Agreement Score ──
        agreement = _compute_agreement_score(findings)

        # Build consensus from AI-generated structured data
        consensus_finding = result.agent_results.get("consensus", {})
        consensus = None
        if consensus_finding:
            structured = consensus_finding.get("structured", {})

            root_cause = (
                structured.get("root_cause") or
                structured.get("summary") or
                consensus_finding.get("finding", "")
            ) or "Under analysis"

            ai_recommendations = structured.get("recommendations", [])
            recommended_actions = []
            priorities = ["immediate", "high", "medium", "low"]
            for i, rec in enumerate(ai_recommendations[:5]):
                priority = priorities[min(i, len(priorities) - 1)]
                if isinstance(rec, dict):
                    rec_text = rec.get("action") or rec.get("recommendation") or rec.get("description") or rec.get("text") or str(rec)
                    if rec.get("priority"):
                        priority = str(rec["priority"]).lower()
                elif isinstance(rec, str):
                    rec_str = rec.strip()
                    if rec_str.startswith('{') and rec_str.endswith('}'):
                        try:
                            import json
                            parsed_rec = json.loads(rec_str)
                            if isinstance(parsed_rec, dict):
                                rec_text = parsed_rec.get("action") or parsed_rec.get("recommendation") or parsed_rec.get("description") or rec_str
                                if parsed_rec.get("priority"):
                                    priority = str(parsed_rec["priority"]).lower()
                            else:
                                rec_text = rec_str
                        except:
                            rec_text = rec_str
                    else:
                        rec_text = rec_str
                else:
                    rec_text = str(rec)
                raw_risk = (structured.get("risk") or "medium").strip()
                valid_risks = {"low", "medium", "high", "critical"}
                risk_word = raw_risk.split()[0].lower() if raw_risk else "medium"
                risk_clean = risk_word if risk_word in valid_risks else "medium"
                recommended_actions.append({
                    "action": rec_text,
                    "priority": priority,
                    "estimated_impact": structured.get("impact", "Improved network performance"),
                    "risk_level": risk_clean,
                    "rollback_available": True,
                    "decision": None,
                    "decision_reason": None,
                })

            if not recommended_actions:
                recommended_actions = [{
                    "action": "Review and address identified root cause",
                    "priority": "immediate",
                    "estimated_impact": "Resolve primary issue",
                    "risk_level": "medium",
                    "rollback_available": True,
                    "decision": None,
                    "decision_reason": None,
                }]

            contributing_factors = structured.get("evidence", [])
            if not contributing_factors:
                contributing_factors = [f.get("finding", "")[:100] for f in findings[:3] if f.get("finding")]

            # Sanitize consensus-level risk_assessment and rollback_plan
            raw_risk_assessment = (structured.get("risk") or "").strip()
            if not raw_risk_assessment or raw_risk_assessment.lower() in ("unknown", ""):
                raw_risk_assessment = "Medium"
            rollback_plan = (structured.get("rollback") or "").strip()
            if not rollback_plan:
                rollback_plan = "Standard rollback procedures apply"

            consensus = {
                "root_cause": root_cause[:500],
                "confidence": structured.get("confidence", consensus_finding.get("confidence", 0.85)),
                "contributing_factors": contributing_factors[:5],
                "recommended_actions": recommended_actions,
                "risk_assessment": raw_risk_assessment,
                "rollback_plan": rollback_plan,
                "impact": structured.get("impact", "Minimal impact expected"),
                # Feature 1: Agreement score
                **agreement,
            }

        # ── Feature 9: AI Timeline ──
        timeline = _build_timeline(incident_id, investigation_start)

        # ── Affected Network ──
        affected_network = {
            "impacted_nodes": inc.affected_nodes or [],
            "region": inc.affected_region,
            "node_statuses": context.incident_data.get("topology", {}).get("node_statuses", {}),
            "high_util_links": context.incident_data.get("topology", {}).get("high_util_links", []),
            "node_count": context.incident_data.get("topology", {}).get("node_count", 0),
            "link_count": context.incident_data.get("topology", {}).get("link_count", 0),
            "congestion_points": context.incident_data.get("congestion", [])[:5],
            "customer_impact": next(
                (f.get("structured", {}).get("impact", "")
                 for f in findings if f.get("agent_type") == "customer_experience"),
                "Impact assessment pending"
            ),
        }

        # ── Auto RCA Report ──
        rca_report = None
        reporting_finding = result.agent_results.get("reporting", {})
        if reporting_finding:
            rca_report = reporting_finding.get("full_report") or reporting_finding.get("finding", "")

        # Persist to DB
        inc.agent_findings = findings
        inc.consensus = consensus
        inc.status = "resolved"
        inc.resolved_at = datetime.utcnow()
        inc.updated_at = datetime.utcnow()
        db.commit()

        # Store in decision memory
        decision_memory.store_investigation(
            incident_id=inc.id, title=inc.title,
            findings=findings, consensus=consensus or {},
        )

        return {
            "id": inc.id, "title": inc.title, "description": inc.description,
            "severity": inc.severity, "status": inc.status,
            "affected_nodes": inc.affected_nodes or [],
            "affected_region": inc.affected_region,
            "source_alarm_ids": inc.source_alarm_ids or [],
            "agent_findings": findings, "consensus": consensus,
            "timeline": timeline,
            "similar_cases": similar_cases[:3],
            "affected_network": affected_network,
            "rca_report": rca_report,
        }
    finally:
        db.close()


# ── Feature 2: Action Approval Workflow ──

@router.post("/{incident_id}/decide")
async def decide_action(incident_id: str, data: dict):
    """Engineer approves, rejects, or requests simulation for a recommended action.
    
    Body: {action_index: int, decision: "approved"|"rejected"|"simulate_first", reason?: string}
    """
    action_index = data.get("action_index", 0)
    decision = data.get("decision", "approved")
    reason = data.get("reason", "")

    db = get_session()
    try:
        inc = db.query(DBIncident).filter_by(id=incident_id).first()
        if not inc:
            return {"error": "Incident not found"}

        consensus = inc.consensus or {}
        actions = consensus.get("recommended_actions", [])
        if action_index >= len(actions):
            return {"error": f"Action index {action_index} out of range"}

        # Update the action with the decision
        actions[action_index]["decision"] = decision
        actions[action_index]["decision_reason"] = reason
        actions[action_index]["decided_at"] = datetime.utcnow().isoformat()
        actions[action_index]["decided_by"] = "engineer"

        consensus["recommended_actions"] = actions
        inc.consensus = consensus
        # Force SQLAlchemy to detect the change on JSON column
        from sqlalchemy.orm.attributes import flag_modified
        flag_modified(inc, "consensus")
        db.commit()

        # Store in decision memory for learning
        decision_memory.store_action_decision(
            memory_id=f"inc-{incident_id}",
            decision=decision,
            outcome=f"Action: {actions[action_index]['action'][:100]}",
            lessons=reason if reason else None,
        )

        logger.info(f"Decision '{decision}' for incident {incident_id} action {action_index}")

        return {
            "status": "ok",
            "incident_id": incident_id,
            "action_index": action_index,
            "decision": decision,
            "action": actions[action_index],
        }
    finally:
        db.close()
