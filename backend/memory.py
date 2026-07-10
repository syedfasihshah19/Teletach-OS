"""AI Decision Memory — Database-backed service for storing investigations, decisions, and outcomes.

Provides historical context to the Knowledge Agent for future investigations.
Tracks accepted/rejected recommendations for learning.

Semantic retrieval uses Fireworks AI embeddings (nomic-ai/nomic-embed-text-v1.5) with
NumPy cosine similarity, stored in the existing `embedding` JSON column on DBDecisionMemory.
Falls back to keyword scoring when the embedding API is unavailable.
"""
import uuid
import logging
import asyncio
from datetime import datetime
from typing import Optional
from database import get_session, DBDecisionMemory, DBReport, DBOptimization

logger = logging.getLogger("memory")


def _clean_summary(text: str) -> str:
    if not text:
        return ""
    import re
    # Remove thinking tags
    text = re.sub(r'(?is)<think>.*?</think>', '', text)
    # Remove markdown code fences
    text = re.sub(r'^```(?:json|markdown)?\s*\n?', '', text.strip(), flags=re.MULTILINE | re.IGNORECASE)
    text = re.sub(r'\n?```\s*$', '', text.strip(), flags=re.MULTILINE)
    text = text.strip()
    
    # If it is a raw JSON dict, try to extract a human-readable summary
    if text.startswith('{') and text.endswith('}'):
        try:
            import json
            parsed = json.loads(text)
            if isinstance(parsed, dict):
                return parsed.get("summary") or parsed.get("description") or parsed.get("finding") or text
        except:
            pass
            
    # Clean CoT / prompt prefixes
    cot_patterns = [
        r'^(as an?|we are asked to|first,?\s+(understand|analyze|let\'s|we)|let\'s\s+start|in this analysis|based on the input|according to the context|based on the provided|to analyze this|we need to|i will|let me|here is my|i should|my goal is to|to determine|to address this|to investigate).*?:\s*',
        r'^(firstly|secondly|thirdly|finally|in conclusion|to summarize),?\s*',
        r'^i have analyzed the network and found that\s*',
        r'^based on the telemetry and logs,\s*',
        r'^we are asked to synthesize findings.*?\.\s*',
        r'^we need to output json.*?\.\s*',
    ]
    for pattern in cot_patterns:
        text = re.sub(pattern, '', text, flags=re.IGNORECASE | re.MULTILINE)
        
    return text.strip()

# ─── Embedding helpers ───

_EMBED_MODEL = "nomic-ai/nomic-embed-text-v1.5"
_EMBED_DIM = 768  # nomic-embed-text-v1.5 output dimension


def _get_openai_client():
    """Lazily create the Fireworks-compatible OpenAI client."""
    try:
        from openai import OpenAI
        from config import get_settings
        s = get_settings()
        return OpenAI(api_key=s.fireworks_api_key, base_url=s.fireworks_base_url)
    except Exception as exc:
        logger.warning(f"Could not create embedding client: {exc}")
        return None


def _embed_text_sync(text: str) -> Optional[list[float]]:
    """Call the Fireworks embedding endpoint synchronously.

    Returns a list[float] of length _EMBED_DIM, or None on failure.
    """
    client = _get_openai_client()
    if client is None:
        return None
    try:
        # Fireworks supports the standard OpenAI embeddings endpoint
        response = client.embeddings.create(
            model=_EMBED_MODEL,
            input=text[:8192],  # model context limit guard
        )
        return response.data[0].embedding
    except Exception as exc:
        logger.warning(f"Embedding API call failed: {exc}")
        return None


def _cosine_similarity(a: list[float], b: list[float]) -> float:
    """NumPy cosine similarity between two equal-length vectors."""
    import numpy as np
    va = np.array(a, dtype=np.float32)
    vb = np.array(b, dtype=np.float32)
    norm_a = np.linalg.norm(va)
    norm_b = np.linalg.norm(vb)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(np.dot(va, vb) / (norm_a * norm_b))


def _keyword_score(search_tags: list[str], mem_tags: list[str],
                   outcome: Optional[str], created_at) -> float:
    """Lightweight keyword fallback score (same formula as original)."""
    overlap = len(set(search_tags) & set(mem_tags))
    if overlap == 0:
        return 0.0
    outcome_bonus = 1.5 if outcome == "resolved" else 1.0
    age_days = (datetime.utcnow() - created_at).days if created_at else 365
    recency_bonus = max(0.5, 1.0 - (age_days / 365))
    return overlap * outcome_bonus * recency_bonus


# ─── Service ───

class DecisionMemoryService:
    """Persistent AI decision memory backed by SQLAlchemy.

    Retrieval uses semantic embeddings (Fireworks nomic-embed-text-v1.5) with
    NumPy cosine similarity.  Embeddings are stored in the `embedding` JSON
    column and reused on subsequent lookups.  Keyword scoring is used as a
    graceful fallback when the API is unavailable.
    """

    # ── Write helpers ──────────────────────────────────────────────────────

    def store_investigation(self, incident_id: str, title: str, findings: list[dict],
                           consensus: dict, outcome: str = "resolved") -> str:
        """Store a completed investigation for future reference."""
        mem_id = f"mem-{uuid.uuid4().hex[:8]}"
        tags = self._extract_tags(title + " " + consensus.get("finding", "") + " " + consensus.get("root_cause", ""))
        embed_text = f"{title}. {consensus.get('finding', '')} {consensus.get('root_cause', '')}"
        embedding = _embed_text_sync(embed_text)

        db = get_session()
        try:
            entry = DBDecisionMemory(
                id=mem_id, type="investigation", incident_id=incident_id,
                title=title,
                summary=consensus.get("finding", consensus.get("root_cause", ""))[:500],
                data={"findings": findings, "consensus": consensus},
                outcome=outcome, tags=tags,
                embedding=embedding,
            )
            db.add(entry)
            db.commit()
            logger.info(f"Stored investigation memory: {mem_id} for {incident_id} "
                        f"({'with' if embedding else 'without'} embedding)")
            return mem_id
        finally:
            db.close()

    def store_report(self, report_id: str, title: str, content: str,
                     incident_id: Optional[str] = None) -> str:
        """Store a generated report."""
        mem_id = f"mem-{uuid.uuid4().hex[:8]}"
        tags = self._extract_tags(title + " " + content[:200])
        embedding = _embed_text_sync(f"{title}. {content[:512]}")

        db = get_session()
        try:
            entry = DBDecisionMemory(
                id=mem_id, type="report", incident_id=incident_id,
                title=title, summary=content[:500],
                data={"report_id": report_id, "content": content},
                tags=tags, embedding=embedding,
            )
            db.add(entry)
            db.commit()
            return mem_id
        finally:
            db.close()

    def store_optimization(self, opt_id: str, title: str, data: dict) -> str:
        """Store a generated optimization recommendation."""
        mem_id = f"mem-{uuid.uuid4().hex[:8]}"
        tags = self._extract_tags(title + " " + data.get("description", "") + " " + data.get("finding", ""))
        embed_text = f"{title}. {data.get('description', data.get('finding', ''))}"
        embedding = _embed_text_sync(embed_text)

        db = get_session()
        try:
            entry = DBDecisionMemory(
                id=mem_id, type="optimization", title=title,
                summary=data.get("description", data.get("finding", ""))[:500],
                data=data, tags=tags, embedding=embedding,
            )
            db.add(entry)
            db.commit()
            return mem_id
        finally:
            db.close()

    def store_simulation(self, sim_id: str, title: str, data: dict) -> str:
        """Store a simulation result for historical reference."""
        mem_id = f"mem-{uuid.uuid4().hex[:8]}"
        tags = self._extract_tags(title + " simulation " + data.get("scenario_type", ""))
        embed_text = f"Simulation: {title}. Best strategy: {data.get('best_strategy', '')}."
        embedding = _embed_text_sync(embed_text)

        db = get_session()
        try:
            entry = DBDecisionMemory(
                id=mem_id, type="simulation", title=f"Simulation: {title}",
                summary=f"Best strategy: {data.get('best_strategy', 'N/A')}. Improvement: {data.get('improvement', {})}",
                data=data, tags=tags, embedding=embedding,
            )
            db.add(entry)
            db.commit()
            return mem_id
        finally:
            db.close()

    def store_action_decision(self, memory_id: str, decision: str,
                              outcome: Optional[str] = None,
                              lessons: Optional[str] = None) -> None:
        """Record an engineer's decision (accepted/rejected/modified) on a recommendation."""
        db = get_session()
        try:
            entry = db.query(DBDecisionMemory).filter_by(id=memory_id).first()
            if entry:
                entry.engineer_decision = decision
                if outcome:
                    entry.outcome = outcome
                if lessons:
                    entry.lessons_learned = lessons
                db.commit()
                logger.info(f"Recorded decision '{decision}' for memory {memory_id}")
        finally:
            db.close()

    def record_decision(self, memory_id: str, decision: str, outcome: Optional[str] = None):
        """Legacy alias for store_action_decision."""
        self.store_action_decision(memory_id, decision, outcome)

    # ── Retrieval ──────────────────────────────────────────────────────────

    def get_similar_cases(self, title: str, description: str = "", limit: int = 5) -> list[dict]:
        """Find similar historical cases using semantic embedding similarity.

        Strategy:
        1. Generate an embedding for the query text via Fireworks AI.
        2. For each stored investigation that has an embedding, compute cosine
           similarity and apply recency + outcome bonuses.
        3. For entries without an embedding (legacy records), fall back to
           keyword overlap scoring.
        4. Return the top-`limit` entries sorted by final score descending.
        """
        query_text = f"{title}. {description}".strip()
        query_embedding = _embed_text_sync(query_text)
        search_tags = self._extract_tags(query_text)

        db = get_session()
        try:
            all_memories = db.query(DBDecisionMemory).filter(
                DBDecisionMemory.type == "investigation"
            ).order_by(DBDecisionMemory.created_at.desc()).limit(100).all()

            scored = []
            now = datetime.utcnow()

            for mem in all_memories:
                age_days = (now - mem.created_at).days if mem.created_at else 365
                recency_bonus = max(0.5, 1.0 - (age_days / 365))
                outcome_bonus = 1.5 if mem.outcome == "resolved" else 1.0

                if query_embedding and mem.embedding:
                    # Semantic path — cosine similarity [0, 1] scaled to [0, 10]
                    cos_sim = _cosine_similarity(query_embedding, mem.embedding)
                    base_score = cos_sim * 10.0
                else:
                    # Keyword fallback
                    mem_tags = mem.tags or []
                    overlap = len(set(search_tags) & set(mem_tags))
                    if overlap == 0:
                        continue
                    base_score = float(overlap)

                final_score = base_score * outcome_bonus * recency_bonus
                if final_score > 0:
                    scored.append((final_score, mem))

            scored.sort(key=lambda x: x[0], reverse=True)
            return [{
                "id": mem.id, "incident_id": mem.incident_id,
                "title": mem.title, "summary": _clean_summary(mem.summary),
                "outcome": mem.outcome, "decision": mem.engineer_decision,
                "lessons_learned": mem.lessons_learned,
                "tags": mem.tags, "match_score": round(score, 3),
                "semantic": bool(query_embedding and mem.embedding),
                "created_at": mem.created_at.isoformat() if mem.created_at else None,
            } for score, mem in scored[:limit]]
        finally:
            db.close()

    # ── Aggregate stats ────────────────────────────────────────────────────

    def get_knowledge_summary(self) -> dict:
        """Aggregate stats for the knowledge base — used by KnowledgeAgent."""
        db = get_session()
        try:
            from sqlalchemy import func
            total = db.query(func.count(DBDecisionMemory.id)).filter(
                DBDecisionMemory.type == "investigation"
            ).scalar() or 0

            success = db.query(func.count(DBDecisionMemory.id)).filter(
                DBDecisionMemory.type == "investigation",
                DBDecisionMemory.outcome == "resolved",
            ).scalar() or 0

            total_reports = db.query(func.count(DBDecisionMemory.id)).filter(
                DBDecisionMemory.type == "report"
            ).scalar() or 0

            total_opts = db.query(func.count(DBDecisionMemory.id)).filter(
                DBDecisionMemory.type == "optimization"
            ).scalar() or 0

            accepted = db.query(func.count(DBDecisionMemory.id)).filter(
                DBDecisionMemory.engineer_decision == "accepted"
            ).scalar() or 0

            rejected = db.query(func.count(DBDecisionMemory.id)).filter(
                DBDecisionMemory.engineer_decision == "rejected"
            ).scalar() or 0

            # Count how many memories have embeddings (semantic-ready)
            with_embeddings = db.query(func.count(DBDecisionMemory.id)).filter(
                DBDecisionMemory.embedding.isnot(None)
            ).scalar() or 0

            return {
                "total_investigations": total,
                "successful_investigations": success,
                "success_rate": round((success / max(total, 1)) * 100, 1),
                "total_reports": total_reports,
                "total_optimizations": total_opts,
                "accepted_recommendations": accepted,
                "rejected_recommendations": rejected,
                "semantic_memories": with_embeddings,
                "embedding_model": _EMBED_MODEL,
            }
        finally:
            db.close()

    def get_all(self, type_filter: Optional[str] = None, limit: int = 50) -> list[dict]:
        """Get all memory entries, optionally filtered by type."""
        db = get_session()
        try:
            q = db.query(DBDecisionMemory)
            if type_filter:
                q = q.filter(DBDecisionMemory.type == type_filter)
            entries = q.order_by(DBDecisionMemory.created_at.desc()).limit(limit).all()
            return [{
                "id": e.id, "type": e.type, "incident_id": e.incident_id,
                "title": e.title, "summary": _clean_summary(e.summary),
                "outcome": e.outcome, "decision": e.engineer_decision,
                "lessons_learned": e.lessons_learned,
                "tags": e.tags,
                "has_embedding": e.embedding is not None,
                "created_at": e.created_at.isoformat() if e.created_at else None,
            } for e in entries]
        finally:
            db.close()

    # ── Tag extraction (kept for keyword fallback) ─────────────────────────

    @staticmethod
    def _extract_tags(text: str) -> list[str]:
        """Extract searchable tags from text."""
        telecom_keywords = {
            "ospf", "bgp", "mpls", "ecmp", "bfd", "congestion", "latency", "throughput",
            "packet", "loss", "router", "switch", "tower", "link", "trunk", "fiber",
            "capacity", "bandwidth", "north", "south", "east", "critical", "major",
            "ddos", "security", "qos", "qoe", "reroute", "failover", "outage",
            "degradation", "cpu", "memory", "power", "temperature", "interface",
            "simulation", "optimization", "routing", "energy", "cost",
            "crc", "rerouting", "congestion", "cascade", "propagation",
        }
        text_lower = text.lower()
        tags = [kw for kw in telecom_keywords if kw in text_lower]
        return list(set(tags))


# Singleton
decision_memory = DecisionMemoryService()
