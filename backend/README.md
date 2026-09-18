## AXOM Backend README

### Quick Start

#### 1. Install dependencies (one time)
```powershell
cd backend
python -m venv .venv
.venv\Scripts\pip install -r requirements.txt
```

#### 2. Start the backend
```powershell
# From the backend/ directory:
.venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Or use the provided script:
```powershell
# From project root:
powershell -ExecutionPolicy Bypass -File backend\start.ps1
```

#### 3. Start the Next.js frontend (separate terminal)
```powershell
pnpm dev
```

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Service health check |
| GET | `/api/locations` | All monitored sites |
| GET | `/api/locations/{id}` | Single site detail |
| POST | `/api/risk/predict` | Transparent rule-based risk score |
| POST | `/api/ml/predict` | Random Forest ML inference |
| GET | `/api/alerts` | All alerts |
| POST | `/api/alerts/{id}/acknowledge` | Acknowledge alert |
| GET | `/api/analytics/summary` | Fleet-wide analytics |

Interactive API docs: http://localhost:8000/docs

### Supabase Integration

Set these in `backend/.env`:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-or-service-key
```

If left empty, backend runs in **Demo / In-Memory mode** with the 8 instrumented NE India sites.
