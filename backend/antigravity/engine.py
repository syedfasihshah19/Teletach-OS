"""Antigravity — Multi-Agent Orchestration Framework for TeleGenesis OS.

Handles agent lifecycle, workflow execution, parallel dispatch,
inter-agent communication, shared context, and consensus workflows.
"""
from __future__ import annotations
import asyncio
import time
import logging
from typing import Any, Optional
from dataclasses import dataclass, field
from enum import Enum

logger = logging.getLogger("antigravity")


class WorkflowStatus(str, Enum):
    pending = "pending"
    running = "running"
    completed = "completed"
    failed = "failed"


@dataclass
class SharedContext:
    """Thread-safe shared context for inter-agent communication."""
    incident_data: dict = field(default_factory=dict)
    findings: dict = field(default_factory=dict)  # agent_type -> finding
    messages: list = field(default_factory=list)
    metadata: dict = field(default_factory=dict)
    _lock: asyncio.Lock = field(default_factory=asyncio.Lock, repr=False)

    async def add_finding(self, agent_type: str, finding: dict):
        async with self._lock:
            self.findings[agent_type] = finding

    async def get_findings(self) -> dict:
        async with self._lock:
            return dict(self.findings)

    async def add_message(self, sender: str, content: str):
        async with self._lock:
            self.messages.append({
                "sender": sender, "content": content,
                "timestamp": time.time(),
            })

    async def get_messages(self) -> list:
        async with self._lock:
            return list(self.messages)


@dataclass
class WorkflowStep:
    """A step in an orchestration workflow."""
    agent_types: list[str]  # Agents to run in this step (parallel)
    depends_on: list[str] = field(default_factory=list)  # Must complete before this step
    timeout_seconds: float = 60.0


@dataclass
class Workflow:
    """DAG-based workflow definition."""
    name: str
    steps: list[WorkflowStep]
    description: str = ""


@dataclass
class WorkflowResult:
    """Result of a completed workflow execution."""
    workflow_name: str
    status: WorkflowStatus
    context: SharedContext
    duration_ms: float
    agent_results: dict = field(default_factory=dict)
    errors: list = field(default_factory=list)


class AntigravityEngine:
    """Core orchestration engine — manages agent lifecycle and workflow execution."""

    def __init__(self):
        self._agents: dict[str, Any] = {}
        self._active_workflows: dict[str, WorkflowResult] = {}
        self._activity_log: list[dict] = []

    def register_agent(self, agent_type: str, agent_instance: Any):
        """Register an agent with the engine."""
        self._agents[agent_type] = agent_instance
        logger.info(f"Registered agent: {agent_type}")

    def get_agent(self, agent_type: str) -> Any:
        return self._agents.get(agent_type)

    @property
    def registered_agents(self) -> list[str]:
        return list(self._agents.keys())

    async def execute_workflow(
        self, workflow: Workflow, context: SharedContext,
        progress_callback: Optional[callable] = None,
    ) -> WorkflowResult:
        """Execute a complete workflow — dispatching agents per step."""
        start_time = time.time()
        result = WorkflowResult(
            workflow_name=workflow.name,
            status=WorkflowStatus.running,
            context=context,
            duration_ms=0,
        )
        self._active_workflows[workflow.name] = result

        logger.info(f"Starting workflow: {workflow.name} with {len(workflow.steps)} steps")

        try:
            for step_idx, step in enumerate(workflow.steps):
                step_agents = []
                for agent_type in step.agent_types:
                    agent = self._agents.get(agent_type)
                    if agent:
                        step_agents.append((agent_type, agent))
                    else:
                        logger.warning(f"Agent not found: {agent_type}")

                if not step_agents:
                    continue

                # Run agents in parallel within each step
                tasks = []
                for agent_type, agent in step_agents:
                    tasks.append(self._run_agent_with_retry(
                        agent_type, agent, context, step.timeout_seconds,
                        workflow_name=workflow.name, workflow_step=step_idx,
                    ))

                agent_results = await asyncio.gather(*tasks, return_exceptions=True)

                for (agent_type, _), agent_result in zip(step_agents, agent_results):
                    if isinstance(agent_result, Exception):
                        error_msg = f"{agent_type}: {str(agent_result)}"
                        result.errors.append(error_msg)
                        logger.error(error_msg)
                        # Record failure in telemetry
                        self._record_telemetry(
                            agent_type, "unknown", "analyze",
                            status="timeout" if isinstance(agent_result, asyncio.TimeoutError) else "failed",
                            workflow_name=workflow.name, workflow_step=step_idx,
                            incident_id=context.incident_data.get("id"),
                        )
                    else:
                        result.agent_results[agent_type] = agent_result
                        if agent_result:
                            await context.add_finding(agent_type, agent_result)

                    # Log activity
                    self._activity_log.append({
                        "agent_type": agent_type,
                        "step": step_idx,
                        "workflow": workflow.name,
                        "success": not isinstance(agent_result, Exception),
                        "timestamp": time.time(),
                    })

                if progress_callback:
                    await progress_callback(step_idx, len(workflow.steps), result)

            result.status = WorkflowStatus.completed
        except Exception as e:
            result.status = WorkflowStatus.failed
            result.errors.append(str(e))
            logger.error(f"Workflow failed: {e}")

        result.duration_ms = (time.time() - start_time) * 1000
        logger.info(f"Workflow {workflow.name} {result.status.value} in {result.duration_ms:.0f}ms")
        return result

    async def _run_agent_with_retry(
        self, agent_type: str, agent: Any, context: SharedContext,
        timeout: float, workflow_name: str = "", workflow_step: int = -1,
        max_retries: int = 0,
    ) -> dict:
        """Run an agent with timeout and telemetry context injection."""
        # Inject workflow context so BaseAgent.call_fireworks can access it
        agent._current_workflow = workflow_name
        agent._current_step = workflow_step
        agent._current_incident_id = context.incident_data.get("id")
        try:
            result = await asyncio.wait_for(
                agent.analyze(context), timeout=timeout,
            )
            return result
        except asyncio.TimeoutError:
            logger.warning(f"{agent_type} timed out")
            raise
        except Exception as e:
            logger.warning(f"{agent_type} failed: {e}")
            raise

    def _record_telemetry(self, agent_type, agent_name, action, status="failed",
                          workflow_name="", workflow_step=-1, incident_id=None):
        """Record telemetry for failed/timed-out agents."""
        try:
            from telemetry import telemetry
            telemetry.record(
                agent_type=agent_type, agent_name=agent_name, action=action,
                status=status, workflow_name=workflow_name, workflow_step=workflow_step,
                incident_id=incident_id,
            )
        except Exception:
            pass

    def get_activity_log(self) -> list[dict]:
        return list(self._activity_log)


# ─── Pre-defined Workflows ───

INCIDENT_INVESTIGATION_WORKFLOW = Workflow(
    name="incident_investigation",
    description="Full multi-agent incident investigation workflow with RCA report generation",
    steps=[
        WorkflowStep(agent_types=["performance", "alarm_correlation", "log_analysis", "security"], timeout_seconds=35),
        WorkflowStep(agent_types=["customer_experience", "traffic_engineering", "knowledge"], timeout_seconds=35),
        WorkflowStep(agent_types=["consensus"], timeout_seconds=35),
        WorkflowStep(agent_types=["reporting"], timeout_seconds=35),
    ],
)

TRAFFIC_OPTIMIZATION_WORKFLOW = Workflow(
    name="traffic_optimization",
    description="Traffic engineering and bandwidth optimization workflow",
    steps=[
        WorkflowStep(agent_types=["traffic_engineering", "performance", "capacity_planning"], timeout_seconds=12),
        WorkflowStep(agent_types=["consensus"], timeout_seconds=12),
    ],
)
