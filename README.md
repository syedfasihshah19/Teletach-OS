# TeleGenesis OS

**AI-Powered Telecom Operations Platform**

> An intelligent, multi-agent telecom operations platform where specialized AI agents collaborate to monitor, investigate, optimize, simulate, and continuously improve telecom networks.

Built for the **AMD Developer Hackathon Act-II** (Track 3: Unicorn / Open Innovation).

---

## 🏗️ Architecture

```
Users → React UI → FastAPI API → Antigravity Orchestrator → AI Agents (parallel)
                                       ↕                        ↕
                                  PostgreSQL              Fireworks AI
                                       ↕                        ↕
                              Connector Layer            Digital Twin Engine
                           (Mock → Real later)
```

## ✨ Key Features

| Module | Description |
|---|---|
| **Executive Dashboard** | Real-time network health, KPIs, traffic trends, alarm feed |
| **AI Operations Center** | Live monitoring with alarm timeline, utilization charts |
| **TeleTAC War Room** | Multi-agent incident investigation with consensus-based RCA |
| **Digital Twin** | Deterministic network simulation with before/after comparison |
| **Optimization Studio** | AI-powered routing, capacity, bandwidth, energy, cost optimization |
| **Traffic Intelligence** | Traffic flow analysis, congestion detection, bandwidth optimization |
| **Network Topology** | Interactive React Flow graph with live utilization |
| **Agent Activity** | Timeline of all 16 AI agent actions with token tracking |
| **Reports** | Auto-generated RCA, executive summaries, capacity plans |

## 🤖 AI Agents (16 Fully Implemented)

All agents use **Fireworks AI** for reasoning — zero stubs:

Orchestrator · Performance · Incident Investigation · Alarm Correlation · Log Analysis · Configuration · Security · Customer Experience · Cost Optimization · Energy Optimization · Capacity Planning · Traffic Engineering · Simulation · Knowledge · Consensus · Reporting

## 🔧 Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React, TypeScript, Tailwind CSS, React Flow, Recharts, Framer Motion |
| **Backend** | FastAPI, Python, Pydantic |
| **AI** | Fireworks AI (Llama 3.1 70B), Antigravity Orchestration Framework |
| **Deployment** | AMD Cloud |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- Fireworks AI API key

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
pip install -r requirements.txt
# Configure .env with your Fireworks AI key
python main.py
```

Open **http://localhost:5173** in your browser.

## 📁 Project Structure

```
├── frontend/          # React + TypeScript + Tailwind CSS
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── pages/        # 10 main pages
│       ├── services/     # API client
│       ├── stores/       # Zustand state management
│       └── types/        # TypeScript definitions
├── backend/
│   ├── agents/           # 16 AI agents with Fireworks AI
│   ├── antigravity/      # Multi-agent orchestration framework
│   ├── api/routes/       # FastAPI endpoints
│   ├── connectors/       # Data source connectors (mock → real)
│   ├── models/           # Pydantic data models
│   └── main.py           # FastAPI entry point
└── docs/                 # Product documentation
```

## 🔌 Connector Architecture

Mock connectors generate realistic telecom data. Future integrations:
- Nokia OSS, Ericsson ENM, Cisco Crosswork, Huawei U2020
- Prometheus, Grafana, Splunk, Open5GS

## 👥 Team

Built for AMD Developer Hackathon Act-II — Track 3: Unicorn (Open Innovation)

## 📄 License

MIT
