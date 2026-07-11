# TeleGenesis OS — AI-Powered Telecom Operations Platform

**TeleGenesis OS** is an intelligent, autonomous multi-agent telecom operations platform designed for next-generation network management. The system orchestrates specialized AI agents collaborating in parallel to monitor telemetry, investigate incidents, optimize resources, simulate digital twin scenarios, and continuously improve complex network environments.

Developed by **RedLine Devs** (founded by Syed Fasih Shah, Syed Jawad Ali, and Syeda Sehrish Fatima) for the **AMD Developer Hackathon Act-II** (Track 3: Unicorn / Open Innovation), TeleGenesis OS addresses the critical challenges of modern telecom networks: manual troubleshooting bottlenecks, high operational expenditures, and latency in resolving SLA-critical outages.

---

## 💡 Core Capabilities & Deep Dive

TeleGenesis OS operates as an autonomous, self-healing network assistant that shifts operations from reactive firefighting to proactive, simulation-backed remediation.

### 1. Extensible & Vendor-Neutral Data Connector Layer
Modern telecom environments suffer from vendor lock-in and fragmented telemetry. TeleGenesis OS resolves this with a modular **Data Connector Layer** that decouples the system from specific vendor hardware. 
* **Live Ingestion**: Ingests real-time network KPIs, syslog feeds, and correlated alarms directly from active network nodes.
* **Mixed-Vendor Compatibility**: Supports planned API integrations with major vendor network management systems (Nokia OSS, Ericsson ENM, Cisco NSO, Juniper Paragon, Huawei iManager, ZTE NetNumen) and open-standard monitoring frameworks (Prometheus, OpenTelemetry, SNMP, NETCONF/YANG, gNMI).

### 2. TeleTAC Incident War Room & Multi-Agent Investigation
When an outage or anomaly occurs, the platform dispatches a swarm of fifteen specialized domain agents concurrently.
* **Parallel Domain Analysis**: Specialist agents analyze performance KPIs, correlate alarms, summarize syslog streams, estimate customer impact, verify security threats, and query historical cases from the database.
* **AMD Instinct™ MI300X Acceleration**: Leveraging the high-bandwidth HBM3 memory (5.3 TB/s) of the AMD Instinct GPU, the backend executes these concurrent reasoning pipelines simultaneously, generating a final Consensus Root Cause Analysis (RCA) and mitigation plan in **under 20 seconds**.

### 3. Digital Twin Simulator
Before applying any recommended configurations, engineers can run "what-if" simulation scenarios in a safe digital twin environment.
* **Outage & Rerouting Scenarios**: Models failures (e.g. fiber cut, traffic surge) and compares network KPI outcomes side-by-side.
* **Risk Mitigation**: Eliminates the risk of configuration errors causing catastrophic cascading outages on production hardware.

### 4. Optimization Studio
Provides continuous, automated recommendations across five operational categories:
* **OSPF Routing**: Auto-calculates cost weights to bypass congested links.
* **Capacity Expansion**: Identifies backhaul and link capacity constraints.
* **Energy Efficiency**: Powers down redundant ports or underutilized interfaces during low-traffic diurnal windows.
* **Cost Optimization**: Recommends resource consolidations to lower opex.
* **Bandwidth Allocation**: Dynamic traffic policing and shaping recommendations.
* **Approve/Reject Workflow**: Operators can review, approve, or reject AI configurations with a single click, maintaining human-in-the-loop control.

### 5. Reports Hub & Audit Trail
* Automatically compiles post-incident analyses, optimization histories, and capacity forecasts into formatted briefs.
* Fully supports markdown rendering, raw text exports, and custom print layout stylesheets for instant PDF reporting.

---

---

## 🏗️ Architecture

```
Users → React UI → FastAPI API → AI Agent Engine → AI Agents (parallel)
                                       ↕                        ↕
                                   SQLite/DB              Fireworks AI
                                       ↕                        ↕
                               Connector Layer            Digital Twin Engine
                            (Mock → Real later)
```

---

## ⚡ Quick Start (Docker Containerized) - Recommended

TeleGenesis OS is fully containerized using **Docker** and **Docker Compose**. Follow these instructions to get the platform up and running in a single command:

### 1. Prerequisites
- [Docker](https://www.docker.com/products/docker-desktop/) installed on your machine.
- A **Fireworks AI** API Key.

### 2. Configure Environment Variables
1. Copy the `.env.example` file to `.env` in the project root:
   ```bash
   cp .env.example .env
   ```
2. Open the `.env` file and enter your Fireworks API Key:
   ```env
   FIREWORKS_API_KEY=your_fireworks_api_key_here
   ```

### 3. Spin Up the Services
Run the following command from the root directory of the repository:
```bash
docker-compose up --build
```

This will automatically:
- Download the base images for Python and Nginx.
- Install all backend dependencies and run the FastAPI service on port `8000`.
- Install frontend Node.js packages, build the React/TypeScript production assets, and serve them via Nginx on port `80`.
- Set up a reverse proxy routing `/api/*` requests from the frontend to the backend container.

### 4. Access the Application
Once the containers are running:
- Open your browser and navigate to **[http://localhost](http://localhost)** to view the TeleGenesis OS UI.
- The backend API documentation is available at **[http://localhost:8000/docs](http://localhost:8000/docs)**.

---

## 🔧 Local Development (Without Docker)

If you prefer to run the frontend and backend manually for development:

### 1. Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create a `.env` file (copying `.env.example`) and fill in `FIREWORKS_API_KEY`.
3. Create a virtual environment and install requirements:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   pip install -r requirements.txt
   ```
4. Run the FastAPI application:
   ```bash
   python main.py
   ```
   *The backend will start on [http://localhost:8000](http://localhost:8000)*.

### 2. Frontend Setup
1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```
   *The UI will start on [http://localhost:5173](http://localhost:5173)*.

---

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
| **Agent Activity** | Timeline of all 15 specialized AI agent actions with token tracking |
| **Reports** | Auto-generated RCA, executive summaries, capacity plans |

## 🤖 AI Agents (15 Specialized Agents)

All agents use **Fireworks AI** for reasoning — zero stubs, orchestrated by the central **Agent Engine**:

`Performance` · `Incident Investigation` · `Alarm Correlation` · `Log Analysis` · `Configuration` · `Security` · `Customer Experience` · `Cost Optimization` · `Energy Optimization` · `Capacity Planning` · `Traffic Engineering` · `Simulation` · `Knowledge` · `Consensus` · `Reporting`

---

## 🚀 AMD Hardware Acceleration via Fireworks AI

TeleGenesis OS leverages **Fireworks AI**'s state-of-the-art serverless inference API, powered directly by clusters of **AMD Instinct™ MI300X GPU accelerators**. This hardware-software synergy is critical to achieving the sub-20s end-to-end latency required for real-time network remediation.

### 1. AMD Instinct™ MI300X Architecture
* **5.3 TB/s Memory Bandwidth**: The AMD Instinct™ MI300X boasts an industry-leading **192GB of HBM3 memory** with **5.3 TB/s of peak memory bandwidth**. Our system leverages this bandwidth by dispatching **15 specialized AI domain agents concurrently** in parallel. On standard GPU accelerators, this concurrent batching causes severe KV-cache congestion and queue delays; on the MI300X, all 15 agent requests are processed simultaneously with near-zero latency degradation.
* **ROCm™ Open Software Platform**: Fireworks AI uses custom execution kernels compiled specifically for **AMD ROCm™**, optimizing matrix multiplication and attention mechanisms on the GPU hardware level.
* **FireAttention Optimization**: By employing FireAttention—a specialized KV-cache memory bandwidth optimizer designed for AMD GPUs—the inference API achieves up to a **4x speedup** in time-to-first-token (TTFT) and high throughput for token generation.

---

## 🤖 AI Integration & Multi-Agent Architecture

TeleGenesis OS employs a hybrid, multi-agent orchestrator managing fifteen specialized domain analysts. The system coordinates reasoning using a dual-model topology:

### 1. Dual-Model Topology
* **Primary Reasoning Model (`DeepSeek V4 Pro`)**: Deployed for deep logical analysis, consensus building, and synthesis. It processes the synthesized findings of all individual agents to generate a unified, evidence-backed root cause statement.
* **Fast Diagnostic Model (`GLM 5 Pro 2`)**: Used for high-concurrency, fast-path parallel agent queries. It runs the initial diagnostic checks (Performance, Log Analysis, Traffic Engineering) simultaneously to collect distributed findings.

### 2. Hybrid Pipeline & Deterministic Python Fast-Paths
To guarantee an execution time of **under 20 seconds** and optimize token costs, the AI Agent Engine (`backend/antigravity/engine.py`) implements a hybrid execution flow:
* **LLM-Based Reasoners**: Core agents (Performance, Traffic, Alarm Correlation, Log Analysis) execute structured queries to extract deep insights.
* **Deterministic Fast-Paths**:
  * **Knowledge Agent**: Connects directly to the local SQLite/PostgreSQL Decision Memory database to run structured searches, producing standard JSON findings in **0ms** without calling the external LLM.
  * **Security Agent**: Scans incoming syslog entries and active alarms using regex threat signatures. If no explicit threat indicators are found, it skips the LLM and instantly returns a clean assessment in **0ms**, falling back to full LLM analysis only when anomalies are detected.
  * **Customer Experience Agent**: Executes a telemetry-driven mathematical heuristic to calculate subscriber impact and call drop rates in **0ms** based on affected node topology.
  * **Reporting Agent**: Formats the final RCA report into structured markdown directly from the consensus state, avoiding a costly sequential LLM re-rendering call.

### 3. Antigravity Multi-Agent Orchestration Framework
At the backend core of TeleGenesis OS lies **Antigravity** (`backend/antigravity/`), our custom async multi-agent orchestration framework.
* **DAG-Based Workflow Steps**: Dispatches and tracks agents in parallel steps (e.g. concurrent sweeps, consensus consolidation, and markdown reporting).
* **Thread-Safe Shared Context**: Leverages an async context lock enabling real-time inter-agent messaging and state synchronization.
* **Multi-LLM & Anthropic Claude Support**: Features model-agnostic client interfaces that allow seamless routing of complex reasoning and reporting tasks to **Anthropic Claude** (e.g. Claude 3.5 Sonnet), alongside your high-concurrency Fireworks AI clusters.

---

## 🐳 Docker Deployment & Reverse-Proxy Routing

TeleGenesis OS is fully containerized for development and production environments using **Docker** and **Docker Compose**, providing a clean, single-command deployment.

### 1. Dual-Container Architecture
* **Frontend Container (`frontend/Dockerfile`)**: 
  * Compiles the React/TypeScript assets using a multi-stage Node.js build.
  * Serves the static distribution bundle using a lightweight **Nginx** server listening on Port 80.
* **Backend Container (`backend/Dockerfile`)**:
  * Configures the Python 3.11 runtime environment.
  * Launches the **FastAPI** application using the **Uvicorn** ASGI server running on Port 8000.

### 2. Nginx Reverse Proxy Routing
Nginx acts as the single entry point for all client requests, eliminating CORS issues and routing traffic internally:
* `/` routes directly to the static React frontend app.
* `/api` routes are reverse-proxied to the backend FastAPI container (`http://backend:8000/api`).
* `/ws` routes are proxied with `Upgrade` and `Connection` headers to maintain persistent, low-overhead WebSocket connections for live telemetry streams.

---

---

## 📁 Project Structure

```
├── frontend/          # React + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # 10 main pages (now mobile-responsive!)
│   │   ├── services/     # API client
│   │   ├── stores/       # Zustand state management
│   │   └── types/        # TypeScript definitions
│   ├── nginx.conf     # Nginx config for reverse-proxying API calls
│   └── Dockerfile     # Frontend Docker build script
├── backend/
│   ├── agents/           # 16 AI agents with Fireworks AI
│   ├── antigravity/      # Multi-agent orchestration framework
│   ├── api/routes/       # FastAPI endpoints
│   ├── connectors/       # Data source connectors (mock → real)
│   ├── models/           # Pydantic data models
│   ├── Dockerfile        # Backend Docker build script
│   └── main.py           # FastAPI entry point
├── docker-compose.yml    # Root orchestration compose configuration
├── .env.example          # Template environment variable configurations
└── docs/                 # Product documentation
```

## 👥 Team

Built for AMD Developer Hackathon Act-II — Track 3: Unicorn (Open Innovation)

## 📄 License

MIT
