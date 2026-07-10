import asyncio
import sys
import os
import time

sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from dns_patch import apply_dns_patch
apply_dns_patch()

from agents.all_agents import PerformanceAgent
from antigravity.engine import SharedContext

async def test():
    agent = PerformanceAgent()
    context = SharedContext(incident_data={
        "id": "INC-123",
        "title": "Core Router Failure",
        "region": "South",
        "severity": "critical",
        "all_kpis": [],
        "congestion": [],
        "alarms": []
    })
    
    print("Running performance agent...")
    t0 = time.time()
    res = await agent.analyze(context)
    print("Done in", time.time() - t0, "sec")
    import pprint
    pprint.pprint(res)

if __name__ == "__main__":
    asyncio.run(test())
