"""TeleGenesis OS — FastAPI Backend Entry Point."""
import sys
import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Ensure backend directory is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dns_patch import apply_dns_patch
apply_dns_patch()

load_dotenv()

from config import get_settings
from api.routes.dashboard import router as dashboard_router
from api.routes.incidents import router as incidents_router
from api.routes.other_routes import (
    topology_router, agents_router, sim_router,
    traffic_router, reports_router, opt_router, planner_router,
)
from api.routes.search import router as search_router
from database import init_db
from connectors.mock_connector import MockTelecomConnector

# Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
)
logger = logging.getLogger("telegenesis")

# Connector instance
_connector = MockTelecomConnector()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    logger.info("🚀 TeleGenesis OS starting up...")
    init_db()
    logger.info("  Database initialized")
    await _connector.connect()
    settings = get_settings()
    logger.info(f"  Environment: {settings.app_env}")
    logger.info(f"  Fireworks Model: {settings.fireworks_model}")
    logger.info(f"  API Key: {'configured' if settings.fireworks_api_key else 'NOT SET'}")
    logger.info("✅ TeleGenesis OS ready")
    yield
    await _connector.disconnect()
    logger.info("👋 TeleGenesis OS shutting down")


app = FastAPI(
    title="TeleGenesis OS",
    description="AI-Powered Telecom Operations Platform",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(dashboard_router)
app.include_router(incidents_router)
app.include_router(topology_router)
app.include_router(agents_router)
app.include_router(sim_router)
app.include_router(traffic_router)
app.include_router(reports_router)
app.include_router(opt_router)
app.include_router(search_router)
app.include_router(planner_router)


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "TeleGenesis OS", "version": "1.0.0"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
