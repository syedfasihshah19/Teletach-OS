# TeleGenesis OS

**AI-Powered Telecom Operations Platform**

> An intelligent, multi-agent telecom operations platform where specialized AI agents collaborate to monitor, investigate, optimize, simulate, and continuously improve telecom networks.

Built for the **AMD Developer Hackathon Act-II** (Track 3: Unicorn / Open Innovation).

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
| **Agent Activity** | Timeline of all 16 AI agent actions with token tracking |
| **Reports** | Auto-generated RCA, executive summaries, capacity plans |

## 🤖 AI Agents (16 Fully Implemented)

All agents use **Fireworks AI** for reasoning — zero stubs:

`Agent Engine` · `Performance` · `Incident Investigation` · `Alarm Correlation` · `Log Analysis` · `Configuration` · `Security` · `Customer Experience` · `Cost Optimization` · `Energy Optimization` · `Capacity Planning` · `Traffic Engineering` · `Simulation` · `Knowledge` · `Consensus` · `Reporting`

---

## 🚀 AMD Hardware Acceleration via Fireworks AI

TeleGenesis OS does not run local LLM instances. Instead, it utilizes **Fireworks AI**'s state-of-the-art serverless inference API, powered directly by **AMD Instinct™ MI300X GPU accelerators**:

* **AMD Instinct™ MI300X Clusters**: Fireworks AI runs its high-performance LLM inference catalog in partnership with AMD, powered directly by MI300X accelerators.
* **ROCm & FireAttention Optimizations**: Because Fireworks AI is optimized for the **AMD ROCm™** software stack, our agent queries benefit from ultra-low latency and high token throughput.
* **Massive Concurrency**: When an incident is investigated, the AI Agent Engine dispatches **15 specialized domain agents concurrently**. The massive HBM3 memory bandwidth (5.3 TB/s) of the MI300X allows Fireworks to process all 15 agent prompts in parallel without queue delays or latency penalties.

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
