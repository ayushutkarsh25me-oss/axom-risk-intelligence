# AXOM Backend — Start Script
# Run this from the project root: backend\start.ps1

$backendDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$venvPython = Join-Path $backendDir ".venv\Scripts\python.exe"

if (-Not (Test-Path $venvPython)) {
    Write-Host "ERROR: Virtual environment not found at $venvPython" -ForegroundColor Red
    Write-Host "Run: python -m venv backend/.venv && backend/.venv/Scripts/pip install -r backend/requirements.txt" -ForegroundColor Yellow
    exit 1
}

Write-Host "Starting AXOM FastAPI backend..." -ForegroundColor Cyan
Set-Location $backendDir
& $venvPython -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
