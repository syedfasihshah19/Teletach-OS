"""Global search API — cross-domain search with AI semantic reranking."""
from fastapi import APIRouter, Query
from database import get_session, DBIncident, DBReport, DBOptimization, DBDecisionMemory
from connectors.mock_connector import MockTelecomConnector
from agents.base import BaseAgent
from config import get_settings
from openai import AsyncOpenAI
import json
import logging

logger = logging.getLogger("search")
router = APIRouter(prefix="/api/search", tags=["search"])
_connector = MockTelecomConnector()


async def _ai_rerank(query: str, results: list[dict], max_results: int = 15) -> list[dict]:
    """Use Fireworks AI to rerank and score search results by semantic relevance."""
    if not results:
        return []

    settings = get_settings()
    if not settings.fireworks_api_key:
        return results[:max_results]

    # Build compact result descriptions for AI
    items_text = ""
    for i, r in enumerate(results[:20]):
        items_text += f"\n{i}: [{r['type']}] {r.get('title', '')} — {r.get('summary', r.get('region', ''))[:80]}"

    try:
        client = AsyncOpenAI(
            api_key=settings.fireworks_api_key,
            base_url=settings.fireworks_base_url,
            timeout=8.0,
        )
        response = await client.chat.completions.create(
            model=settings.fireworks_model_fast,
            messages=[{
                "role": "system",
                "content": "You are a telecom search relevance engine. Given a search query and numbered results, return a JSON array of objects with 'index' (int), 'score' (0-100), and 'reason' (brief match reason). Rank by relevance to the query. Return only the JSON array."
            }, {
                "role": "user",
                "content": f"Query: \"{query}\"\n\nResults:{items_text}\n\nReturn JSON array sorted by relevance score (highest first)."
            }],
            temperature=0.1,
            max_tokens=500,
        )
        text = response.choices[0].message.content or ""
        # Parse JSON array
        start = text.find('[')
        end = text.rfind(']')
        if start >= 0 and end > start:
            rankings = json.loads(text[start:end + 1])
            # Apply scores and reasons
            for ranking in rankings:
                idx = ranking.get("index", -1)
                if 0 <= idx < len(results):
                    results[idx]["relevance_score"] = ranking.get("score", 50)
                    results[idx]["match_reason"] = ranking.get("reason", "")

            # Sort by AI relevance score
            results.sort(key=lambda r: r.get("relevance_score", 0), reverse=True)
    except Exception as e:
        logger.warning(f"AI reranking failed, using keyword order: {e}")

    return results[:max_results]


@router.get("")
async def global_search(q: str = Query("", min_length=1)):
    """Search across all data domains with AI semantic reranking."""
    query = q.lower().strip()
    if not query:
        return {"incidents": [], "reports": [], "agents": [], "nodes": [], "optimizations": [], "memory": [], "total": 0}

    all_results = []

    db = get_session()
    try:
        # Search incidents
        all_incidents = db.query(DBIncident).limit(50).all()
        for i in all_incidents:
            if query in (i.title or "").lower() or query in (i.description or "").lower() \
               or query in (i.affected_region or "").lower() or query in (i.severity or "").lower():
                all_results.append({
                    "id": i.id, "title": i.title, "severity": i.severity,
                    "status": i.status, "region": i.affected_region,
                    "summary": (i.description or "")[:100],
                    "type": "incident",
                })

        # Search reports
        all_reports = db.query(DBReport).limit(50).all()
        for r in all_reports:
            if query in (r.title or "").lower() or query in (r.content or "").lower() \
               or query in (r.summary or "").lower():
                all_results.append({
                    "id": r.id, "title": r.title, "type_label": r.type,
                    "summary": (r.summary or "")[:100], "type": "report",
                })

        # Search optimizations
        all_opts = db.query(DBOptimization).limit(50).all()
        for o in all_opts:
            if query in (o.title or "").lower() or query in (o.description or "").lower() \
               or query in (o.category or "").lower():
                all_results.append({
                    "id": o.id, "title": o.title, "category": o.category,
                    "status": o.status, "summary": (o.description or "")[:100],
                    "type": "optimization",
                })

        # Search decision memory
        all_memory = db.query(DBDecisionMemory).limit(50).all()
        for m in all_memory:
            if query in (m.title or "").lower() or query in (m.summary or "").lower() \
               or any(query in tag for tag in (m.tags or [])):
                all_results.append({
                    "id": m.id, "title": m.title, "memory_type": m.type,
                    "outcome": m.outcome, "summary": (m.summary or "")[:100],
                    "type": "memory",
                })

    finally:
        db.close()

    # Search agents (static config — acceptable)
    agent_names = [
        ("Orchestrator", "orchestrator"), ("Performance Agent", "performance"),
        ("Incident Investigation", "incident_investigation"), ("Alarm Correlation", "alarm_correlation"),
        ("Log Analysis", "log_analysis"), ("Configuration Agent", "configuration"),
        ("Security Agent", "security"), ("Customer Experience", "customer_experience"),
        ("Cost Optimization", "cost_optimization"), ("Energy Optimization", "energy_optimization"),
        ("Capacity Planning", "capacity_planning"), ("Traffic Engineering", "traffic_engineering"),
        ("Simulation Agent", "simulation"), ("Knowledge Agent", "knowledge"),
        ("Consensus Agent", "consensus"), ("Reporting Agent", "reporting"),
    ]
    for n, t in agent_names:
        if query in n.lower() or query in t.lower():
            all_results.append({
                "id": f"agent-{t}", "title": n, "agent_type": t,
                "summary": f"AI agent: {n}", "type": "agent",
            })

    # Search topology nodes
    if not _connector._topology:
        await _connector.connect()
    topo = await _connector.fetch_topology()
    for node in topo.nodes:
        if query in node.name.lower() or query in node.region.lower() \
           or query in node.type.value.lower():
            all_results.append({
                "id": node.id, "title": node.name, "node_type": node.type.value,
                "region": node.region, "status": node.status.value,
                "summary": f"{node.type.value} in {node.region} region",
                "type": "node",
            })

    # AI semantic reranking
    ranked_results = await _ai_rerank(q, all_results)

    # Split by type for frontend
    by_type: dict[str, list] = {}
    for r in ranked_results:
        t = r["type"]
        if t not in by_type:
            by_type[t] = []
        if len(by_type[t]) < 10:
            by_type[t].append(r)

    return {
        "query": q,
        "incidents": by_type.get("incident", []),
        "reports": by_type.get("report", []),
        "agents": by_type.get("agent", []),
        "nodes": by_type.get("node", []),
        "optimizations": by_type.get("optimization", []),
        "memory": by_type.get("memory", []),
        "total": len(ranked_results),
    }
