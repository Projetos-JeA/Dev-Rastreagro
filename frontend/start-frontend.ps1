# Script para iniciar o frontend
Write-Host "Iniciando Frontend RastreAgro..." -ForegroundColor Cyan

# Navega para o diretorio do frontend
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Verifica se node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "Instalando dependencias..." -ForegroundColor Yellow
    npm install
}

# Inicia o Expo
Write-Host ""
Write-Host "Frontend iniciando..." -ForegroundColor Green
Write-Host ""

npm start
