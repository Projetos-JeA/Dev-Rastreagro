@echo off
echo 🚀 Iniciando RastreAgro...
echo.
echo 📦 Iniciando Backend...
start "RastreAgro Backend" cmd /k "cd backend && venv\Scripts\activate.bat && python main.py"
timeout /t 5 /nobreak >nul
echo.
echo 📱 Iniciando Frontend...
start "RastreAgro Frontend" cmd /k "cd frontend && npm start"
echo.
echo ✅ Backend e Frontend iniciados!
echo    Backend: http://localhost:8000
echo    Swagger: http://localhost:8000/docs
echo    Frontend: Aguarde o QR code no terminal
pause

