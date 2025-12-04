# Script para iniciar o backend
Write-Host "Iniciando Backend RastreAgro..." -ForegroundColor Cyan

# Navega para o diretorio do backend
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Ativa o ambiente virtual
if (Test-Path "venv\Scripts\Activate.ps1") {
    Write-Host "Ativando ambiente virtual..." -ForegroundColor Green
    & ".\venv\Scripts\Activate.ps1"
} else {
    Write-Host "Ambiente virtual nao encontrado. Criando..." -ForegroundColor Yellow
    python -m venv venv
    & ".\venv\Scripts\Activate.ps1"
    Write-Host "Instalando dependencias..." -ForegroundColor Yellow
    pip install -r requirements.txt
}

# Verifica se uvicorn esta instalado
$uvicornInstalled = pip show uvicorn 2>$null
if (-not $uvicornInstalled) {
    Write-Host "Instalando uvicorn e dependencias..." -ForegroundColor Yellow
    pip install -r requirements.txt
}

# Inicia o servidor usando o Python da venv
Write-Host ""
Write-Host "Backend iniciando em http://localhost:8000" -ForegroundColor Green
Write-Host "Documentacao: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""

# Usa o Python da venv explicitamente
# Importante: garantir que estamos no diretorio correto
Set-Location $scriptPath
# O main.py esta na raiz, entao usamos 'main:app'
.\venv\Scripts\python.exe -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
