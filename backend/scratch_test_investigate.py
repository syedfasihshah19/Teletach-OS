import asyncio
import sys
import os

# Add backend to path
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from dns_patch import apply_dns_patch
apply_dns_patch()

from database import SessionLocal, DBIncident, init_db
from api.routes.incidents import investigate_incident

async def test():
    init_db()
    db = SessionLocal()
    # Get the first incident
    inc = db.query(DBIncident).first()
    if not inc:
        print("No incident found in DB!")
        return
    
    print(f"Investigating incident {inc.id}: {inc.title}")
    try:
        res = await investigate_incident(inc.id)
        print("Success! Result keys:", res.keys())
        print("Consensus:", res.get("consensus"))
        # Print first agent finding
        if res.get("agent_findings"):
            print("First finding:", res["agent_findings"][0])
    except Exception as e:
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(test())
