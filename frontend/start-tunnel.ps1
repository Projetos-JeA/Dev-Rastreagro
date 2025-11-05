# Script para iniciar Expo com Tunnel (funciona de qualquer lugar)
Write-Host "🚀 Iniciando Expo com Tunnel..." -ForegroundColor Green
Write-Host "💡 Isso cria um túnel público - funciona mesmo fora da rede local" -ForegroundColor Cyan
Write-Host "⚠️  Pode ser mais lento que LAN" -ForegroundColor Yellow
Write-Host ""

npx expo start --tunnel

