# Script para iniciar backend e frontend
$ErrorActionPreference = "Stop"

Write-Host "🚀 Iniciando RastreAgro..." -ForegroundColor Green

# Obter caminho do script
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path

# Iniciar Backend
Write-Host "`n📦 Iniciando Backend..." -ForegroundColor Cyan
$backendPath = Join-Path $scriptPath "backend"
$backendCmd = "cd '$backendPath'; if (Test-Path 'venv\Scripts\Activate.ps1') { .\venv\Scripts\Activate.ps1; python main.py } else { Write-Host 'Erro: Ambiente virtual nao encontrado' -ForegroundColor Red; pause }"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd

# Aguardar backend iniciar
Write-Host "   Aguardando 5 segundos..." -ForegroundColor Gray
Start-Sleep -Seconds 5

# Iniciar Frontend
Write-Host "📱 Iniciando Frontend..." -ForegroundColor Cyan
$frontendPath = Join-Path $scriptPath "frontend"
$frontendCmd = "cd '$frontendPath'; npm start"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd

Write-Host "`n✅ Backend e Frontend iniciados!" -ForegroundColor Green
Write-Host "   Backend: http://localhost:8000" -ForegroundColor Yellow
Write-Host "   Swagger: http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host "   Frontend: Aguarde o QR code no terminal" -ForegroundColor Yellow
Write-Host "`n💡 Dica: No terminal do Expo, pressione 'w' para abrir no navegador" -ForegroundColor Cyan
Write-Host "   Isso e mais facil para testar sem precisar do celular!" -ForegroundColor Cyan
